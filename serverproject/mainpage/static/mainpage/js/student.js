// 학생용 student.js

let currentTeamId = null;

// 초기화
document.addEventListener("DOMContentLoaded", function () {
    console.log("🎓 Student JS Loaded");

    // 로그인한 학생의 팀 목록 불러오기
    fetch('/api/my_teams/') // API URL 변경
        .then(res => {
            if (!res.ok) {
                // 401 Unauthorized 또는 403 Forbidden 등의 오류 처리 가능
                if (res.status === 401 || res.status === 403) {
                    console.warn("팀 목록 접근 권한이 없습니다. 로그인이 필요할 수 있습니다.");
                    // 로그인 페이지로 리디렉션하거나 사용자에게 알림
                    const teamContainer = document.getElementById("team-buttons");
                    if (teamContainer) teamContainer.innerHTML = "<p>팀 목록을 보려면 로그인이 필요합니다.</p>";
                    return Promise.reject(new Error('Authentication required')); // 이후 .then 실행 방지
                }
                throw new Error(`Network response was not ok: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            if (data && Array.isArray(data)) {
                renderTeamButtons(data);
            } else {
                console.error("내 팀 목록 데이터 형식이 올바르지 않습니다 (배열이 아님):", data);
                const teamContainer = document.getElementById("team-buttons");
                if (teamContainer) teamContainer.innerHTML = "<p>내 팀 목록 데이터 형식이 올바르지 않습니다.</p>";
            }
        })
        .catch(error => {
            // Authentication required 에러는 이미 위에서 처리했을 수 있으므로 중복 알림 방지
            if (error.message !== 'Authentication required') {
                console.error('Error fetching my team list in student.js:', error);
                const teamContainer = document.getElementById("team-buttons");
                if (teamContainer) teamContainer.innerHTML = "<p>내 팀 목록을 불러오는 데 실패했습니다.</p>";
            }
        });
});


function renderTeamButtons(teams) {
    const teamContainer = document.getElementById("team-buttons");
    if (!teamContainer) {
        console.error("Element with ID 'team-buttons' not found.");
        return;
    }
    teamContainer.innerHTML = "";

    if (!teams || !Array.isArray(teams)) {
        console.error("Invalid 'teams' data passed to renderTeamButtons:", teams);
        teamContainer.innerHTML = "<p>팀 정보를 표시할 수 없습니다.</p>";
        return;
    }

    teams.forEach(team => {
        // TeamListView 응답에는 team_id와 team_name이 있으므로 유효성 검사 기준에 맞음
        if (!team || typeof team.team_id === 'undefined' || typeof team.team_name === 'undefined') {
            console.warn("Skipping invalid team data:", team);
            return;
        }
        const btn = document.createElement("button");
        btn.textContent = team.team_name;
        btn.classList.add("team-button");
        btn.onclick = () => {
            currentTeamId = team.team_id;
            document.querySelectorAll('.team-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 이 함수들이 student.js 또는 다른 로드된 js에 정의되어 있는지 확인
            if (typeof loadTeamInfo === 'function') loadTeamInfo(team.team_id);
            // if (typeof fetchChatMessages === 'function') fetchChatMessages();
        };
        teamContainer.appendChild(btn);
    });

    if (teams.length > 0 && teamContainer.querySelector(".team-button")) {
        teamContainer.querySelector(".team-button").click();
    } else if (teams.length === 0) {
        teamContainer.innerHTML = "<p>참여 중인 팀이 없습니다.</p>";
    }
}

function loadTeamInfo(teamId) {
    // TeamDetailView API 경로를 사용합니다.
    fetch(`/api/teams/${teamId}`) // TeamSerializer를 사용하는 API
        .then(res => {
            if (!res.ok) {
                // 404 (Not Found) 등의 오류를 좀 더 구체적으로 처리할 수 있습니다.
                if (res.status === 404) {
                    throw new Error(`Team with ID ${teamId} not found.`);
                }
                throw new Error(`Failed to fetch team info: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(teamData => { // API는 단일 팀 객체를 반환합니다.
            if (typeof renderTeamInfo === 'function') {
                renderTeamInfo(teamData); // 팀 정보를 렌더링하는 함수에 전체 팀 데이터 전달
            }

            // TeamSerializer는 문서(documents)나 출결(attendance) 정보를 포함하지 않습니다.
            // 따라서 이 정보들은 별도의 API 호출을 통해 가져와야 합니다.
            // 만약 해당 기능이 필요하다면, 관련 API와 fetch 함수를 만들어야 합니다.
            // 예시:
            // if (typeof fetchTeamDocumentsForStudentPage === 'function') fetchTeamDocumentsForStudentPage(teamId);
            // if (typeof fetchTeamAttendanceForStudentPage === 'function') fetchTeamAttendanceForStudentPage(teamId);

            // 아래는 주석 처리 (TeamSerializer에 해당 정보가 없으므로)
            // renderTeamDocuments(teamData.documents || []); // TeamSerializer에 documents 필드 없음
            // renderAttendance(teamData.attendance || []);   // TeamSerializer에 attendance 필드 없음
        })
        .catch(error => {
            console.error(`Error loading team info for ${teamId}:`, error);
            // 사용자에게 오류 메시지를 표시할 수 있습니다.
            const teamNameElement = document.getElementById("team-name");
            if (teamNameElement) teamNameElement.textContent = "팀 정보를 불러올 수 없습니다.";
            const teamMembersElement = document.getElementById("team-members");
            if (teamMembersElement) teamMembersElement.innerHTML = "";
        });
}

function renderTeamInfo(team) { // team은 수정된 TeamSerializer로부터 온 객체
    const teamNameElement = document.getElementById("team-name");
    const teamMembersElement = document.getElementById("team-members");

    if (!teamNameElement || !teamMembersElement) {
        console.error("Team info display elements not found.");
        return;
    }

    if (!team || typeof team.team_name === 'undefined') {
        teamNameElement.textContent = "팀 정보 없음";
        teamMembersElement.innerHTML = "";
        return;
    }

    teamNameElement.textContent = `👥 ${team.team_name}`;

    let membersHtml = '';
    if (team.leader_name) {
        membersHtml += `<p><strong>팀장:</strong> ${team.leader_name} (${team.leader_id || 'ID 없음'})</p>`;
    } else if (team.leader_id) {
        membersHtml += `<p><strong>팀장 ID:</strong> ${team.leader_id}</p>`;
    }

    const mates = [];
    // TeamSerializer가 mateX_name을 포함한다고 가정
    if (team.mate1_name) mates.push(`${team.mate1_name} (${team.mate1_id || 'ID 없음'})`);
    else if (team.mate1_id) mates.push(`팀원1 ID: ${team.mate1_id}`);

    if (team.mate2_name) mates.push(`${team.mate2_name} (${team.mate2_id || 'ID 없음'})`);
    else if (team.mate2_id) mates.push(`팀원2 ID: ${team.mate2_id}`);

    if (team.mate3_name) mates.push(`${team.mate3_name} (${team.mate3_id || 'ID 없음'})`);
    else if (team.mate3_id) mates.push(`팀원3 ID: ${team.mate3_id}`);

    if (team.mate4_name) mates.push(`${team.mate4_name} (${team.mate4_id || 'ID 없음'})`);
    else if (team.mate4_id) mates.push(`팀원4 ID: ${team.mate4_id}`);

    if (mates.length > 0) {
        membersHtml += `<p><strong>팀원:</strong> ${mates.join(", ")}</p>`;
    } else {
        membersHtml += `<p>팀원이 아직 없습니다.</p>`;
    }

    teamMembersElement.innerHTML = membersHtml;
}

// renderTeamDocuments 함수는 TeamSerializer에 문서 정보가 없으므로,
// 이 함수를 호출하는 부분(loadTeamInfo)에서 주석 처리하거나,
// 문서 정보를 가져오는 별도의 API를 호출하도록 수정해야 합니다.
// 아래 함수는 그대로 두지만, 실제 데이터 소스를 고려해야 합니다.
function renderTeamDocuments(documents) {
    const list = document.getElementById("team-documents");
    if (!list) return;
    list.innerHTML = "";

    if (!documents || documents.length === 0) {
        list.innerHTML = "<p>📂 공유 문서가 없습니다.</p>";
        return;
    }

    documents.forEach(doc => {
        const card = document.createElement("div");
        card.classList.add("notion-card"); // CSS 클래스 확인 필요
        card.innerHTML = `
            <div class="notion-title">${doc.title || '제목 없음'}</div>
            <div class="notion-meta">상태: ${doc.status || '상태 모름'}</div>
        `;
        list.appendChild(card);
    });
}

// renderAttendance 함수도 TeamSerializer에 출결 정보가 없으므로,
// 이 함수를 호출하는 부분(loadTeamInfo)에서 주석 처리하거나,
// 출결 정보를 가져오는 별도의 API를 호출하도록 수정해야 합니다.
// 아래 함수는 그대로 두지만, 실제 데이터 소스를 고려해야 합니다.
function renderAttendance(attendance) {
    const container = document.getElementById("team-attendance");
    if (!container) return;

    if (!attendance || attendance.length === 0) {
        container.innerHTML = "<p>📅 출결 기록이 없습니다.</p>";
        return;
    }

    let html = "<table class='attendance-table'><thead><tr><th>회차</th><th>이름</th><th>출결</th></tr></thead><tbody>";
    attendance.forEach(row => {
        const statusIcon = row.status === '출석' // '출석'이라는 값이 정확한지 확인 필요
            ? '<span class="dot green"></span> 출석'
            : '<span class="dot red"></span> 결석'; // '결석' 외 다른 상태(지각 등)도 고려
        html += `<tr><td>${row.round || '-'}</td><td>${row.name || '-'}</td><td>${statusIcon}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}
