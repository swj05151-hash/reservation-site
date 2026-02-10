// ================================
// 🔥 1. Supabase 연결 설정
// ================================
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = "time-reservation";

// ================================
// 🔒 2. 관리자 인증 (비밀번호 확인)
// ================================
const authCode = prompt("관리자 인증 코드를 입력하세요.");
if (authCode !== "5179") {
  alert("인증에 실패했습니다.");
  location.href = "index.html"; // 틀리면 메인으로 이동
}

// ================================
// 📊 3. 예약 데이터 불러오기 및 표 생성
// ================================
async function fetchAdminData() {
  // 요일과 시간 순서대로 정렬해서 가져오기
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error("데이터 로딩 실패:", error);
    return;
  }

  const tbody = document.getElementById("admin-body");
  if (!tbody) return; // HTML에 admin-body가 있는지 확인
  
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>예약 내역이 없습니다.</td></tr>";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");
    
    // 데이터 셀 추가
    tr.innerHTML = `
      <td>${row.day}요일</td>
      <td>${row.time}</td>
      <td><strong>${row.name}</strong></td>
      <td></td> 
    `;

    // 괄호 오류(SyntaxError)를 원천 차단하는 버튼 생성 방식
    const delBtn = document.createElement("button");
    delBtn.innerText = "삭제";
    delBtn.className = "del-btn";
    delBtn.style.cssText = "background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;";
    
    // 버튼 클릭 시 실행될 함수 연결
    delBtn.onclick = () => deleteEntry(row.id, row.name);
    
    // 마지막 td에 버튼 넣기
    tr.querySelector("td:last-child").appendChild(delBtn);
    tbody.appendChild(tr);
  });
}

// ================================
// 🗑️ 4. 예약 삭제 기능 (ID 기준)
// ================================
async function deleteEntry(id, name) {
  if (!confirm(`${name}님의 예약을 삭제하시겠습니까?`)) return;

  // 특정 ID값으로 정확하게 삭제 요청
  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    alert("삭제 실패: " + error.message);
  } else {
    alert("성공적으로 삭제되었습니다.");
    fetchAdminData(); // 표 새로고침
  }
}

// 시작
fetchAdminData();
