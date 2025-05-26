// 학생 출결 페이지 - team_id 기반 체크박스 이름 표시 + 출석 등록 + 전체 회차 출결 조회

document.addEventListener("DOMContentLoaded", function () {
    const teamId = document.querySelector('[data-team-id]')?.dataset.teamId;
    console.log("출결 페이지 로드됨 - teamId:", teamId);

    if (!teamId) {
        console.error("teamId 누락");
        return;
    }

    // 팀원 이름 + 학번 체크박스 표시
    fetch(`/team/teams/${teamId}`)
        .then(res => res.json())
        .then(data => {
            const members = [];
            members.push({ id: data.leader_id, name: data.leader_name });
            ['mate1_id', 'mate2_id', 'mate3_id', 'mate4_id'].forEach(key => {
                if (data[key]) {
                    members.push({ id: data[key], name: data[key] });  // 이름 없음 → 학번으로 대체
                }
            });

            const checklist = document.getElementById("attendance-checklist");
            checklist.innerHTML = members.map((m, i) => `
                <label>
                    <input type="checkbox" name="attendance" data-role="${i === 0 ? 'leader' : 'mate' + i}">
                    ${m.name} (${i === 0 ? '팀장' : '팀원'})
                </label><br>
            `).join('');
        })
        .catch(err => console.error("팀 정보 불러오기 실패:", err));

    // 출석 등록
    document.getElementById("submit-attendance").addEventListener("click", () => {
        const round = prompt("출결 회차를 입력하세요 (예: 01)");
        if (!round) return;

        const checkboxes = document.querySelectorAll("#attendance-checklist input");
        const attendance = {
            team_id: teamId,
            round: round,
            at_leader: checkboxes[0]?.checked ? 'o' : 'x',
            at_mate1: checkboxes[1]?.checked ? 'o' : 'x',
            at_mate2: checkboxes[2]?.checked ? 'o' : 'x',
            at_mate3: checkboxes[3]?.checked ? 'o' : 'x',
            at_mate4: checkboxes[4]?.checked ? 'o' : 'x'
        };

        fetch("/api/attendance/attendance/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendance)
        })
        .then(res => res.json())
        .then(data => {
            alert("출석이 등록되었습니다.");
            document.getElementById("attendance-timestamp").textContent = "타임스탬프: " + new Date().toLocaleString();
            fetchAttendanceHistory(teamId);  // 등록 후 이력 갱신
        })
        .catch(err => console.error("출석 등록 실패:", err));
    });

    // 전체 회차 출결 내역 로드
    fetchAttendanceHistory(teamId);
});

function fetchAttendanceHistory(teamId) {
    const tbody = document.getElementById("history-list");
    tbody.innerHTML = "";

    const statusIcons = {
        o: '<span class="dot green"></span> 출석',
        x: '<span class="dot red"></span> 결석',
        null: ' - '
    };

    const rounds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];

    rounds.forEach(round => {
        fetch(`/api/attendance/attendance/${teamId}/round/?round=${round}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return;
                const rows = [
                    { name: "팀장", status: data.at_leader },
                    { name: "팀원1", status: data.at_mate1 },
                    { name: "팀원2", status: data.at_mate2 },
                    { name: "팀원3", status: data.at_mate3 },
                    { name: "팀원4", status: data.at_mate4 }
                ];
                rows.forEach(row => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td>${round}회차</td><td>${row.name}</td><td>${statusIcons[row.status] || '-'}</td>`;
                    tbody.appendChild(tr);
                });
            })
            .catch(err => console.warn(`⚠️ 회차 ${round} 데이터 없음`, err));
    });
}
