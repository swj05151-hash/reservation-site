// admin.js 의 fetchAdminData 내부 반복문 수정
data.forEach(row => {
  const tr = document.createElement("tr");
  
  // 날짜, 시간, 이름 셀 생성
  tr.innerHTML = `
    <td>${row.day}요일</td>
    <td>${row.time}</td>
    <td><strong>${row.name}</strong></td>
    <td></td>
  `;

  // 삭제 버튼을 별도로 생성하여 추가 (따옴표 오류 방지)
  const delBtn = document.createElement("button");
  delBtn.innerText = "삭제";
  delBtn.className = "del-btn";
  delBtn.onclick = () => deleteEntry(row.id, row.name); // 괄호 오류가 날 일이 없습니다.
  
  tr.querySelector("td:last-child").appendChild(delBtn);
  tbody.appendChild(tr);
});

// deleteEntry 함수 (ID로 정확히 삭제)
async function deleteEntry(id, name) {
  if (!confirm(`${name}님의 예약을 삭제하시겠습니까?`)) return;

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id); // 고유 번호(id)로 삭제하면 오작동이 없습니다.

  if (error) {
    alert("삭제 실패: " + error.message);
  } else {
    alert("삭제 성공!");
    fetchAdminData(); // 다시 목록 불러오기
  }
}