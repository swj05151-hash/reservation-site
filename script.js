// ================================
// 🔥 1. Supabase 연결 (오류 방지를 위해 정돈된 코드)
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
  
  // 첫 줄 (헤더): "시간" 칸 + 요일들
  scheduleDiv.appendChild(makeCell("시간", "time"));
  days.forEach(day => scheduleDiv.appendChild(makeCell(day, "time")));

  // 시간대별 행 생성
  times.forEach(time => {
    // 왼쪽 시간 표시 칸
    scheduleDiv.appendChild(makeCell(time, "time"));
    
    // 각 요일별 예약 칸
    days.forEach(day => {
      const cell = makeCell("", "cell");
      
      // 📍 점심시간 체크: 12:30과 13:00를 선택 불가하게 만듭니다.
      if (time === "12:30" || time === "13:00") {
        cell.classList.add("booked"); // 불투명하거나 선택 안 되는 스타일 적용
        cell.innerText = "점심";      // (선택사항) 칸에 '점심'이라고 표시
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
// ✍️ 5. 예약하기 (알림 기능 추가됨)
// ================================
async function bookTime(day, time) {
  const name = prompt("이름을 입력하세요 (한글)");
  if (!name) return;

  // 중복 확인: DB에서 해당 요일과 시간에 이미 예약이 있는지 확인합니다.
  const { data, error: checkError } = await client.from(TABLE).select("*").eq("day", day).eq("time", time);

  if (checkError) {
    alert("데이터 확인 중 오류가 발생했습니다.");
    return;
  }

  if (data.length > 0) {
    alert("이미 예약된 시간입니다!");
    return;
  }

  // 데이터 추가: DB에 이름, 요일, 시간을 저장합니다.
  const { error: insertError } = await client.from(TABLE).insert([{ day, time, name }]);

  if (insertError) {
    alert("예약에 실패했습니다: " + insertError.message);
  } else {
    // 🎉 예약 성공 시 사용자에게 요일과 시간을 포함한 메시지를 보여줍니다.
    alert(`✅ 예약완료!\n\n[예약 정보]\n- 일시: ${day}요일 ${time}\n- 성함: ${name}님`);
  }
}

// ================================
// 🔄 6. 예약 불러오기
// ================================
async function loadReservations() {
  const { data, error } = await client.from(TABLE).select("*");
  if (error) return;

  document.querySelectorAll(".cell").forEach(cell => {
    if (!(cell.dataset.time >= "12:30" && cell.dataset.time < "13:30")) {
      cell.classList.remove("booked");
    }
  });

  data.forEach(r => {
    const target = document.querySelector(`.cell[data-day="${r.day}"][data-time="${r.time}"]`);
    if (target) target.classList.add("booked");
  });
}

// ================================
// ⚡ 7. 실시간 반영
// ================================
client
  .channel("realtime reservations")
  .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => loadReservations())
  .subscribe();
// 시작
createTable();

loadReservations();
