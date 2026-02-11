// 1. Supabase 설정
const SUPABASE_URL = "https://znsulkjzlxfybbofrefr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3Vsa2p6bHhmeWJib2ZyZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjI0NjMsImV4cCI6MjA4NjI5ODQ2M30.Dn-FZaWHMbudELxuFZuRbV24-cpgftsBh2YiyTS-CYY";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = "time-reservation";

// 2. 예약 데이터 불러오기 및 정렬 함수
async function fetchAdminData() {
    const tbody = document.getElementById("admin-body");
    if (!tbody) return;

    try {
        const { data, error } = await client.from(TABLE).select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>예약 내역이 없습니다.</td></tr>";
            return;
        }

        // 요일 정렬 순서 ("월" 형식)
        const dayOrder = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6, "일": 7 };

        // 자바스크립트 정렬 (요일 -> 시간 순)
        data.sort((a, b) => {
            const orderA = dayOrder[a.day] || 99;
            const orderB = dayOrder[b.day] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.time.localeCompare(b.time);
        });

        tbody.innerHTML = "";
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
            delBtn.style.cssText = "background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;";
            
            delBtn.onclick = () => deleteEntry(row.id, row.name);

            tr.querySelector("td:last-child").appendChild(delBtn);
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("로딩 에러:", err);
        tbody.innerHTML = `<tr><td colspan="4" style="color:red;">오류 발생: ${err.message}</td></tr>`;
    }
}

// 3. 삭제 로직
async function deleteEntry(id, name) {
    if (!confirm(`${name}님의 예약을 삭제하시겠습니까?`)) return;
    const { error } = await client.from(TABLE).delete().eq('id', id);
    if (error) {
        alert("삭제 실패: " + error.message);
    } else {
        alert("삭제되었습니다.");
        fetchAdminData();
    }
}

// 4. 실행 로직 (인증 코드 확인)
const adminCode = prompt("관리자 인증 코드를 입력하세요.");
if (adminCode === "5179") {
    fetchAdminData();
} else {
    alert("인증 코드가 틀렸습니다.");
    location.href = "index.html";
}
