// 🔑 Supabase 연결 정보 입력
const supabaseUrl = "https://znsulkjzlxfybbofrefr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 요일 목록
const days = ["월", "화", "수", "목"];

// 시간 생성 함수
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
const scheduleDiv = document.getElementById("schedule");

// 시간표 만들기
function createTable() {
  scheduleDiv.innerHTML = "";

  scheduleDiv.appendChild(makeCell("시간", "time"));

  days.forEach(day => scheduleDiv.appendChild(makeCell(day, "time")));

  times.forEach(time => {
    scheduleDiv.appendChild(makeCell(time, "time"));

    days.forEach(day => {
      const cell = makeCell("", "cell");

      // 점심시간 막기
      if (time >= "12:30" && time < "13:30") {
        cell.classList.add("booked");
        return;
      }

      cell.onclick = () => bookTime(day, time, cell);
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

// 예약 함수
async function bookTime(day, time, cell) {
  const name = prompt("이름을 입력하세요 (한글)");

  if (!name) return;

  // 이미 예약됐는지 확인
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("day", day)
    .eq("time", time);

  if (data.length > 0) {
    alert("이미 예약된 시간입니다!");
    return;
  }

  await supabase.from("reservations").insert([{ day, time, name }]);
}

// 실시간 반영
supabase
  .channel("realtime reservations")
  .on("postgres_changes", { event: "*", schema: "public", table: "reservations" },
    () => loadReservations())
  .subscribe();

// 예약 불러오기
async function loadReservations() {
  const { data } = await supabase.from("reservations").select("*");

  const cells = document.querySelectorAll(".cell");
  cells.forEach(c => c.classList.remove("booked"));

  data.forEach(r => {
    const index = times.indexOf(r.time) * 4 + days.indexOf(r.day);
    const cell = cells[index];
    cell.classList.add("booked");
  });
}

// 관리자 모드
document.getElementById("adminBtn").onclick = async () => {
  const code = prompt("관리자 코드 입력");

  if (code !== "5179") return;

  const { data } = await supabase.from("reservations").select("*");
  alert(JSON.stringify(data, null, 2));
};

createTable();
loadReservations();
