// ================================
// 🔥 1. Supabase 연결 (수정본)
// ================================
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE = "time-reservation";


// ================================
// 📅 2. 기본 설정
// ================================
const days = ["월", "화", "수", "목"];
const scheduleDiv = document.getElementById("schedule");


// ================================
// ⏰ 3. 시간 생성
// ================================
function generateTimes() {
  let times = [];
  let hour = 8;
  let minute = 30;

  while (hour < 16 || (hour === 16 && minute <= 30)) {
    let t = `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : minute}`;
    times.push(t);

    minute += 30;
    if (minute === 60) {
      minute = 0;
      hour++;
    }
  }
  return times;
}

const times = generateTimes();


// ================================
// 🧱 4. 시간표 생성
// ================================
function createTable() {
  scheduleDiv.innerHTML = "";

  scheduleDiv.appendChild(makeCell("시간", "time"));
  days.forEach(day => scheduleDiv.appendChild(makeCell(day, "time")));

  times.forEach(time => {
    scheduleDiv.appendChild(makeCell(time, "time"));

    days.forEach(day => {
      const cell = makeCell("", "cell");

      // 점심시간 차단
      if (time >= "12:30" && time < "13:30") {
        cell.classList.add("booked");
      } else {
        cell.onclick = () => bookTime(day, time);
      }

      cell.dataset.day = day;
      cell.dataset.time = time;

      scheduleDiv.appendChild(cell);
    });
  });
}

function makeCell(text, cls) {
  const div = document.createElement("div");
  div.innerText = text;
  div.className = cls;
  return div;
}


// ================================
// ✍️ 5. 예약하기
// ================================
async function bookTime(day, time) {
  const name = prompt("이름을 입력하세요 (한글)");
  if (!name) return;

  // 중복 확인
  const { data } = await client.from(TABLE).select("*").eq("day", day).eq("time", time);

  if (data.length > 0) {
    alert("이미 예약된 시간입니다!");
    return;
  }

  await client.from(TABLE).insert([{ day, time, name }]);
}


// ================================
// 🔄 6. 예약 불러오기
// ================================
async function loadReservations() {
  const { data, error } = await client.from(TABLE).select("*");

  if (error) {
    console.error("DB 오류:", error);
    return;
  }

  document.querySelectorAll(".cell").forEach(cell => {
    if (!(cell.dataset.time >= "12:30" && cell.dataset.time < "13:30")) {
      cell.classList.remove("booked");
    }
  });

  data.forEach(r => {
    const target = document.querySelector(
      `.cell[data-day="${r.day}"][data-time="${r.time}"]`
    );
    if (target) target.classList.add("booked");
  });
}


// ================================
// ⚡ 7. 실시간 반영
// ================================
client
  .channel("realtime reservations")
  .on("postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      () => loadReservations())
  .subscribe();


// ================================
// 👑 8. 관리자 모드 (삭제 기능 수정본)
// ================================
document.getElementById("adminBtn").onclick = async () => {
  const code = prompt("관리자 코드 입력");
  if (code !== "5179") return;

  const { data, error: selectError } = await client.from(TABLE).select("*");
  if (selectError) return alert("데이터를 불러오지 못했습니다: " + selectError.message);

  if (!data || data.length === 0) {
    alert("예약이 없습니다.");
    return;
  }

  let msg = "삭제할 번호를 입력하세요:\n\n";
  data.forEach((r, i) => {
    msg += `${i}: ${r.day} ${r.time} - ${r.name}\n`;
  });

  const index = prompt(msg);
  if (index === null) return;

  const target = data[index];
  if (!target) return alert("번호가 잘못됨");

  // 삭제 실행 (id 또는 날짜/시간 기준)
  const { error: deleteError } = await client.from(TABLE)
    .delete()
    .match({ day: target.day, time: target.time, name: target.name });

  if (deleteError) {
    alert("삭제 실패: " + deleteError.message);
  } else {
    alert("삭제 완료!");
    loadReservations(); // 화면 즉시 갱신
  }
};


// ================================
// 🚀 시작
// ================================
createTable();
loadReservations();
