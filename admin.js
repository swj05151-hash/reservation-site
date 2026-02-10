const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = "time-reservation";

// 보안: 페이지 접속 시 비밀번호 확인
const authCode = prompt("관리자 인증 코드를 입력하세요.");
if (authCode !== "5179") {
  alert("인증에 실패했습니다.");
  location.href = "index.html";
}

// 1. 예약 내역 한눈에 보기 (표 정리)
async function fetchAdminData() {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) return alert("데이터 로드 실패: " + error.message);

  const tbody = document.getElementById("admin-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>예약 내역이 없습니다.</td></tr>";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.day}요일</td>
      <td>${row.time}</td>
      <td><strong>${row.name}</strong></td>
      <td>
        <button class="del-btn" onclick="deleteEntry('${row.day}', '${row.time}', '${row.name}')">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 2. 잘못된 예약 삭제하기
async function deleteEntry(day, time, name) {
  if (!confirm(`${day}요일 ${time} - ${name}님의 예약을 삭제하시겠습니까?`)) return;

  const { error } = await client
    .from(TABLE)
    .delete()
    .match({ day, time, name }); // 데이터 식별을 위해 세 가지 조건 사용

  if (error) {
    alert("삭제 중 오류 발생: " + error.message);
  } else {
    alert("성공적으로 삭제되었습니다.");
    fetchAdminData(); // 표 새로고침
  }
}

// 초기 실행
fetchAdminData();