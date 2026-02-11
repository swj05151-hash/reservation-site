// 1. Supabase 설정
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = "time-reservation";

// 2. 데이터 불러오기 및 정렬 함수
async function fetchAdminData() {
  const tbody = document.getElementById("admin-body");
  
  try {
    // 1. 데이터 가져오기
    const { data, error } = await client.from(TABLE).select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>예약 내역이 없습니다.</td></tr>";
      return;
    }

    // 2. 정렬 로직 (요일이 "월요일" 형식인 경우 예시)
    // 만약 DB에 "월"이라고 저장되어 있다면 아래 글자들에서 "요일"을 지우세요!
    const dayOrder = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6, "일": 7 };

    data.sort((a, b) => {
      const orderA = dayOrder[a.day] || 99; // 목록에 없는 요일은 뒤로 보냄
      const orderB = dayOrder[b.day] || 99;
      
      if (orderA !== orderB) return orderA - orderB; // 요일 정렬
      return a.time.localeCompare(b.time); // 시간 정렬
    });

    // 3. 화면에 출력
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.day}</td>
        <td>${row.time}</td>
        <td><strong>${row.name}</strong></td>
        <td></td>
      `;

      const delBtn = document.createElement("button");
      delBtn.innerText = "삭제";
      delBtn.className = "del-btn";
      delBtn.onclick = () => deleteEntry(row.id, row.name);

      tr.querySelector("td:last-child").appendChild(delBtn);
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("로딩 에러:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="color:red;">오류: ${err.message}</td></tr>`;
  }
}
  // 3. 데이터를 표에 뿌려주기
  data.forEach(row => {
    const tr = document.createElement("tr");
    
    // 내용 구성
    tr.innerHTML = `
      <td>${row.day}요일</td>
      <td>${row.time}</td>
      <td><strong>${row.name}</strong></td>
      <td></td>
    `;

    // 삭제 버튼 생성 (SyntaxError 방지를 위한 안전한 방식)
    const delBtn = document.createElement("button");
    delBtn.innerText = "삭제";
    delBtn.className = "del-btn";
    delBtn.onclick = () => deleteEntry(row.id, row.name);

    tr.querySelector("td:last-child").appendChild(delBtn);
    tbody.appendChild(tr);
  });
}

// 4. 삭제 함수 (ID 기반)
async function deleteEntry(id, name) {
  if (!confirm(`${name}님의 예약을 삭제하시겠습니까?`)) return;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id); // 고유 ID로 정확히 타겟팅

  if (error) {
    alert("삭제 실패: " + error.message);
  } else {
    alert("삭제되었습니다.");
    fetchAdminData(); // 즉시 새로고침
  }
}

// 5. 실행 제어 (비밀번호 확인 후 실행)
const adminCode = prompt("관리자 코드를 입력하세요.");
if (adminCode === "5179") {
  fetchAdminData();
} else {
  alert("코드가 틀렸습니다.");
  location.href = "index.html";
}


