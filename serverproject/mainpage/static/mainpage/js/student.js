// student.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("🎓 Student JS Loaded");

    // 1️⃣ 팀 목록 버튼 렌더링
    fetch("/api/my-teams")
        .then(res => res.json())
        .then(data => {
            renderTeamButtons(data.teams);
        });
});

function renderTeamButtons(teams) {
    const teamContainer = document.getElementById("team-buttons");
    teamContainer.innerHTML = "";

    teams.forEach(team => {
        const btn = document.createElement("button");
        btn.textContent = team.team_name;
        btn.classList.add("team-button");
        btn.onclick = () => {
            loadTeamInfo(team.team_id);
            document.querySelectorAll('.team-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
        teamContainer.appendChild(btn);
    });

    // ✅ 첫 번째 팀 자동 선택
    if (teams.length > 0) {
        const firstButton = teamContainer.querySelector(".team-button");
        firstButton.click();
    }
}


// 2️⃣ 선택된 팀 정보 불러오기 및 렌더링
function loadTeamInfo(teamId) {
    fetch(`/api/my-team/${teamId}`)
        .then(res => res.json())
        .then(data => {
            renderTeamInfo(data.team);
            renderTeamDocuments(data.documents);
            renderAttendance(data.attendance);
        });
}

function renderTeamInfo(team) {
    const info = document.getElementById("team-info");
    info.innerHTML = `
        <div class="box">
            <h3>🧾 팀 정보</h3>
            <p><strong>팀 이름:</strong> ${team.team_name}</p>
            <p><strong>팀장:</strong> ${team.leader_name}</p>
            <p><strong>팀원:</strong> ${team.members.join(", ")}</p>
        </div>
    `;
}

function renderTeamDocuments(documents) {
    const list = document.getElementById("team-documents");
    list.innerHTML = "";

    if (documents.length === 0) {
        list.innerHTML = "<p>📂 공유 문서가 없습니다.</p>";
        return;
    }

    documents.forEach(doc => {
        const card = document.createElement("div");
        card.classList.add("notion-card");
        card.innerHTML = `
            <div class="notion-title">${doc.title}</div>
            <div class="notion-meta">상태: ${doc.status}</div>
        `;
        list.appendChild(card);
    });
}

function renderAttendance(attendance) {
    const container = document.getElementById("team-attendance");
    if (attendance.length === 0) {
        container.innerHTML = "<p>📅 출결 기록이 없습니다.</p>";
        return;
    }

    let html = "<table class='attendance-table'><thead><tr><th>회차</th><th>이름</th><th>출결</th></tr></thead><tbody>";
    attendance.forEach(row => {
        const statusIcon = row.status === '출석'
            ? '<span class="dot green"></span> 출석'
            : '<span class="dot red"></span> 결석';
        html += `<tr><td>${row.round}</td><td>${row.name}</td><td>${statusIcon}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}