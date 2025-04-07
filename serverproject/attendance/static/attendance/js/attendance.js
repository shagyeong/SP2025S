document.addEventListener("DOMContentLoaded", function () {
    const teamId = document.body.dataset.teamId; // HTML <body data-team-id="...">
    console.log("✅ 출결 페이지 로드됨: ", teamId);

    // 출석 정보 불러오기
    document.getElementById("submit-attendance").addEventListener("click", () => {
        const round = prompt("출결 회차를 입력하세요 (예: 01)");
        if (!round) return;

        const checkboxes = document.querySelectorAll("#attendance-checklist input");
        const attendance = {
            team_id: teamId,
            round: round,
            at_leader: checkboxes[0].checked ? 'o' : 'x',
            at_mate1: checkboxes[1].checked ? 'o' : 'x',
            at_mate2: checkboxes[2].checked ? 'o' : 'x',
            at_mate3: checkboxes[3].checked ? 'o' : 'x',
            at_mate4: checkboxes[4]?.checked ? 'o' : 'x'
        };

        fetch("/attendance/attendance/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendance)
        })
        .then(res => res.json())
        .then(data => {
            alert("✅ 출석이 등록되었습니다.");
            document.getElementById("attendance-timestamp").textContent = "타임스탬프: " + new Date().toLocaleString();
        })
        .catch(err => console.error("출석 등록 실패:", err));
    });

    // 회차별 출결 조회
    flatpickr("#calendar", {
        dateFormat: "Y-m-d",
        onChange: function (_, dateStr) {
            const round = prompt(`${dateStr}에 해당하는 회차 번호를 입력하세요`);
            if (!round) return;

            fetch(`/attendance/attendance/${teamId}/${round}/`)
                .then(res => res.json())
                .then(data => {
                    const list = document.getElementById("history-list");
                    list.innerHTML = `
                        <tr><td>팀장</td><td>${data.at_leader}</td><td>${round}회차</td></tr>
                        <tr><td>팀원1</td><td>${data.at_mate1}</td><td>${round}회차</td></tr>
                        <tr><td>팀원2</td><td>${data.at_mate2}</td><td>${round}회차</td></tr>
                        <tr><td>팀원3</td><td>${data.at_mate3}</td><td>${round}회차</td></tr>
                        <tr><td>팀원4</td><td>${data.at_mate4}</td><td>${round}회차</td></tr>
                    `;
                });
        }
    });
});


// 출석 리스트
function fetchAttendanceList(teamId) {
    fetch(`/attendance/${teamId}/`)
        .then(res => res.json())
        .then(data => {
            const checklist = document.getElementById("attendance-checklist");
            checklist.innerHTML = "";

            data.forEach(record => {
                const label = document.createElement("label");
                label.innerHTML = `
                    회차 ${record.round}
                    <input type="checkbox" data-round="${record.round}" ${record.attendance === "출석" ? "checked" : ""}>
                `;
                checklist.appendChild(label);
            });
        })
        .catch(error => console.error("출석 목록 불러오기 실패:", error));
}

// 출석 제출
function submitAttendance(teamId, round) {
    const checkboxes = document.querySelectorAll("#attendance-checklist input[type='checkbox']");
    const attendanceData = {};

    checkboxes.forEach(cb => {
        const role = cb.dataset.role;
        attendanceData[`at_${role}`] = cb.checked ? 'o' : 'x';
    });

    attendanceData.team_id = teamId;
    attendanceData.round = round;

    fetch("/attendance/attendance/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("attendance-timestamp").textContent = "타임스탬프: " + new Date().toLocaleString();
        alert("✅ 출석이 기록되었습니다!");
    })
    .catch(err => console.error("출석 등록 실패:", err));
}


// 회차별 히스토리
function fetchAttendanceHistory(teamId, round) {
    fetch(`/attendance/attendance/${teamId}/${round}/`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("history-list");
            tbody.innerHTML = "";

            const statusIcons = {
                o: '<span class="dot green"></span> 출석',
                x: '<span class="dot red"></span> 결석',
                null: ' - '
            };

            const rows = [
                { name: "팀장", status: data.at_leader },
                { name: "팀원1", status: data.at_mate1 },
                { name: "팀원2", status: data.at_mate2 },
                { name: "팀원3", status: data.at_mate3 },
                { name: "팀원4", status: data.at_mate4 }
            ];

            rows.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${row.name}</td><td>${statusIcons[row.status] || '-'}</td><td>${round}회차</td>`;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("회차별 출결 조회 실패:", err));
}
