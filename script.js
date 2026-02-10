// ================================
// 🔥 1. Supabase 연결
// ================================

// ⚠️ 여기에 네 Supabase 정보 입력
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";

// CDN으로 불러온 supabase 객체를 사용해서 클라이언트 생성
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ================================
// 📅 2. 기본 설정
// ================================

// 요일 목록
const days = ["월", "화", "수", "목"];

// 시간표가 들어갈 공간
const scheduleDiv = document.getElementById("schedule");


// ================================
// ⏰ 3. 시간 생성 함수
// ================================
function generateTimes() {
  let times = [];
  let hour = 8;
  let minute = 30;

  // 16:30까지 반복
  while (hour < 16 || (hour === 16 && minute <= 30)) {

    // 시간을 "08:30" 같은 형태로 만듦
    let t = `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : minute}`;
    times.push(t);

    // 30분 증가
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
// 🧱 4. 시간표 화면 만들기
// ================================
function createTable() {
  scheduleDiv.innerHTML = "";

  // 맨 위 "시간" 칸
  scheduleDiv.appendChild(makeCell("시간", "time"));

  // 요일 제목 추가
  days.forEach(day => {
    scheduleDiv.appendChild(makeCell(day, "time"));
  });

  // 시간별 행 생성
  times.forEach(time => {

    // 왼쪽 시간 표시칸
    scheduleDiv.appendChild(makeCell(time, "time"));

    days.forEach(day => {
      const cell = makeCell("", "cell");

      // 🍱 점심시간 차단 (12:30 ~ 13:30)
      if (time >= "12:30" && time < "13:30") {
        cell.classList.add("booked");
      } else {
        // 클릭하면 예약 시도
        cell.onclick = () => bookTime(day, time);
      }

      // 나중에 찾기 쉽게 데이터 저장
      cell.dataset.day = day;
      cell.dataset.time = time;

      scheduleDiv.appendChild(cell);
    });
  });
}


// 셀 만드는 함수
function makeCell(text, cls) {
  const div = document.createElement("div");
  div.innerText = text;
  div.className = cls;
  return div;
}


// ================================
// ✍️ 5. 예약 기능
// ================================
async function bookTime(day, time) {

  const name = prompt("이름을 입력하세요 (한글)");

  if (!name) return;

  // 이미 예약됐는지 확인
  const { data } = await client
    .from("reservations")
    .select("*")
    .eq("day", day)
    .eq("time", time);

  if (data.length > 0) {
    alert("이미 예약된 시간입니다!");
    return;
  }

  // 예약 저장
  await client.from("reservations").insert([{ day, time, name }]);
}


// ================================
// 🔄 6. 예약 상태 불러오기
// ================================
async function loadReservations() {
  const { data } = await client.from("reservations").select("*");

  // 모든 셀 가져오기
  const cells = document.querySelectorAll(".cell");

  cells.forEach(cell => {
    // 기본 상태로 되돌림
    if (!(cell.dataset.time >= "12:30" && cell.dataset.time < "13:30")) {
      cell.classList.remove("booked");
    }
  });

  // 예약된 것 표시
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
      { event: "*", schema: "public", table: "reservations" },
      () => loadReservations())
  .subscribe();


// ================================
// 👑 8. 관리자 모드
// ================================
document.getElementById("adminBtn").onclick = async () => {

  const code = prompt("관리자 코드 입력");

  if (code !== "5179") return;

  const { data } = await client.from("reservations").select("*");

  alert(JSON.stringify(data, null, 2));
};


// ================================
// 🚀 9. 시작
// ================================
createTable();      // 화면에 시간표 생성
loadReservations(); // DB 상태 불러오기
