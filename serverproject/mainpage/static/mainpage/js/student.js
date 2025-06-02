// 학생용 student.js

let currentTeamId = null;

// 초기화
document.addEventListener("DOMContentLoaded", function () {
    console.log("🎓 Student JS Loaded");

    // 팀 목록 불러오기
    fetch("/team/my-teams")
        .then(res => res.json())
        .then(data => {
            renderTeamButtons(data.teams);
        });

    // 채팅 전송 이벤트 등록
    document.getElementById("send-chat")?.addEventListener("click", sendMessage);
});

function renderTeamButtons(teams) {
    const teamContainer = document.getElementById("team-buttons");
    teamContainer.innerHTML = "";

    teams.forEach(team => {
        const btn = document.createElement("button");
        btn.textContent = team.team_name;
        btn.classList.add("team-button");
        btn.onclick = () => {
            currentTeamId = team.team_id;
            document.querySelectorAll('.team-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadTeamInfo(team.team_id);
            fetchChatMessages();
            fetchReservations();
        };
        teamContainer.appendChild(btn);
    });

    if (teams.length > 0) {
        teamContainer.querySelector(".team-button").click();
    }
}

function loadTeamInfo(teamId) {
    fetch(`/team/my-team/${teamId}`)
        .then(res => res.json())
        .then(data => {
            renderTeamInfo(data.team);
            renderTeamDocuments(data.documents);
            renderAttendance(data.attendance);
        });
}

function renderTeamInfo(team) {
    document.getElementById("team-name").textContent = `👥 ${team.team_name}`;
    document.getElementById("team-members").innerHTML = `
        <p><strong>팀장:</strong> ${team.leader_name}</p>
        <p><strong>팀원:</strong> ${[
            team.mate1_name,
            team.mate2_name,
            team.mate3_name,
            team.mate4_name
        ].filter(Boolean).join(", ")}</p>
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

function fetchChatMessages() {
    fetch(`/api/chat/?team_id=${currentTeamId}`)
        .then(res => res.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");
            chatBox.innerHTML = "";
            data.messages.forEach(msg => {
                const div = document.createElement("div");
                div.textContent = `${msg.sender}: ${msg.message} (${msg.timestamp})`;
                chatBox.appendChild(div);
            });
        });
}

function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput?.value.trim();
    if (!message || !currentTeamId) return;

    fetch("/api/chat/send/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, team_id: currentTeamId })
    })
    .then(res => res.json())
    .then(() => {
        chatInput.value = "";
        fetchChatMessages();
    });
}

function fetchReservations() {
    fetch(`/api/reservations/?team_id=${currentTeamId}`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("reservation-list");
            list.innerHTML = "";
            data.reservations.forEach(res => {
                const li = document.createElement("li");
                li.textContent = `📍 ${res.place} @ ${res.time}`;
                list.appendChild(li);
            });
        });
}