// 출결 관리 기능

document.getElementById("load-attendance").addEventListener("click", function () {
    fetch("http://127.0.0.1:8000/api/attendance/")  // Django API 호출
        .then(response => response.json())
        .then(data => {
            const attendanceList = document.getElementById("attendance-list");
            attendanceList.innerHTML = "";  // 기존 목록 초기화
            data.attendance.forEach(record => {
                const li = document.createElement("li");
                li.textContent = `팀: ${record.team__name}, 회차: ${record.round}, 출석 상태: ${record.attendance}`;
                attendanceList.appendChild(li);
            });
        })
        .catch(error => console.error("오류 발생:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("출결 확인 페이지 로드됨");

    // 출석 체크 리스트 불러오기
    fetchAttendanceList();

    // 출석 완료 버튼 클릭 이벤트
    document.getElementById("submit-attendance").addEventListener("click", submitAttendance);

    // 캘린더 설정 (Flatpickr 적용)
    flatpickr("#calendar", {
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            fetchAttendanceHistory(dateStr);
        }
    });
});

// 1. 오늘의 출결 리스트 가져오기
function fetchAttendanceList() {
    fetch("http://127.0.0.1:8000/api/attendance/today/")
        .then(response => response.json())
        .then(data => {
            const checklist = document.getElementById("attendance-checklist");
            checklist.innerHTML = "";  // 기존 목록 초기화

            data.attendance.forEach(record => {
                const label = document.createElement("label");
                label.innerHTML = `
                    <input type="checkbox" data-id="${record.id}" ${record.status === "출석" ? "checked" : ""}>
                    ${record.student_name}
                `;
                checklist.appendChild(label);
            });
        })
        .catch(error => console.error("출석 체크 리스트 불러오기 실패:", error));
}

// 2. 출석 완료 (타임스탬프 기록)
function submitAttendance() {
    const checkboxes = document.querySelectorAll("#attendance-checklist input");
    const attendanceData = [];

    checkboxes.forEach(checkbox => {
        attendanceData.push({
            student_id: checkbox.getAttribute("data-id"),
            status: checkbox.checked ? "출석" : "결석"
        });
    });

    fetch("http://127.0.0.1:8000/api/attendance/update/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: attendanceData })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("attendance-timestamp").textContent = "타임스탬프: " + new Date().toLocaleString();
        alert("출석이 기록되었습니다!");
    })
    .catch(error => console.error("출석 기록 실패:", error));
}

// 3. 특정 날짜 출결 기록 가져오기
function fetchAttendanceHistory(date) {
    fetch(`http://127.0.0.1:8000/api/attendance/history/?date=${date}`)
        .then(response => response.json())
        .then(data => {
            const historyList = document.getElementById("history-list");
            historyList.innerHTML = "";  // 기존 목록 초기화

            data.attendance.forEach(record => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${record.student_name}</td>
                    <td>${record.status}</td>
                    <td>${record.timestamp}</td>
                `;
                historyList.appendChild(row);
            });
        })
        .catch(error => console.error("출석 기록 조회 실패:", error));
}
