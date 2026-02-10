// admin.js
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = "time-reservation";

async function fetchAdminData() {
  // 1. 여기서 { data, error }를 정의해야 합니다.
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error("데이터 불러오기 실패:", error.message);
    alert("데이터를 가져오지 못했습니다.");
    return;
  }

  const tbody = document.getElementById("admin-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  // 2. data가 정상적으로 정의되었는지 확인 후 반복문 실행
  if (!data || data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>예약 내역이 없습니다.</td></tr>";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.day}요일</td>
      <td>${row.time}</td>
      <td><strong>${row.name}</strong></td>
      <td></td>
    `;

    const delBtn = document.createElement("button");
    delBtn.innerText = "삭제";
    delBtn.className = "del-btn";
    // 안전하게 고유 ID로 삭제 함수 연결
    delBtn.onclick = () => deleteEntry(row.id, row.name);

    tr.querySelector("td:last-child").appendChild(delBtn);
    tbody.appendChild(tr);
  });
}

async function deleteEntry(id, name) {
  if (!confirm(`${name}님의 예약을 삭제하시겠습니까?`)) return;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    alert("삭제 실패: " + error.message);
  } else {
    alert("삭제 성공!");
    fetchAdminData();
  }
}

// 3. 페이지가 로드될 때 인증을 먼저 하고 데이터를 가져옵니다.
const pass = prompt("관리자 암호를 입력하세요.");
if (pass === "5179") {
  fetchAdminData();
} else {
  alert("암호가 틀렸습니다.");
  location.href = "index.html";
}