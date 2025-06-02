// 학생용 student.js

let currentTeamId = null;

// 초기화
document.addEventListener("DOMContentLoaded", function () {
    console.log("🎓 Student JS Loaded");

    fetch('/api/my_teams/')
        .then(res => {
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    console.warn("팀 목록 접근 권한이 없습니다. 로그인이 필요할 수 있습니다.");
                    const teamContainer = document.getElementById("team-buttons");
                    if (teamContainer) teamContainer.innerHTML = "<p>팀 목록을 보려면 로그인이 필요합니다.</p>";
                    return Promise.reject(new Error('Authentication required'));
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
    teamContainer.innerHTML = ""; // 초기 "로딩 중..." 메시지 제거

    if (!teams || !Array.isArray(teams) || teams.length === 0) { // 팀이 없는 경우도 처리
        console.info("참여 중인 팀이 없습니다.");
        teamContainer.innerHTML = "<p>참여 중인 팀이 없습니다.</p>";
        // 팀이 없으면 기본 정보 초기화
        if (typeof renderTeamInfo === 'function') renderTeamInfo(null);
        if (typeof renderTeamDocuments === 'function') renderTeamDocuments(null);
        return;
    }

    teams.forEach(team => {
        if (!team || typeof team.team_id === 'undefined' || typeof team.team_name === 'undefined') {
            console.warn("Skipping invalid team data:", team);
            return;
        }
        const btn = document.createElement("button");
        btn.textContent = team.team_name;
        btn.classList.add("team-button"); // student.css에 정의된 스타일 적용
        btn.onclick = () => {
            currentTeamId = team.team_id;
            document.querySelectorAll('.team-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (typeof loadTeamInfo === 'function') loadTeamInfo(team.team_id);
            if (typeof fetchAndRenderAttendanceSummary === 'function') {
                fetchAndRenderAttendanceSummary(team.team_id);
            }
        };
        teamContainer.appendChild(btn);
    });

    if (teams.length > 0 && teamContainer.querySelector(".team-button")) {
        // 첫 번째 팀을 자동으로 클릭 (이때 fetchAndRenderAttendanceSummary도 호출됨)
        teamContainer.querySelector(".team-button").click();
    } else if (teams.length === 0) {
        teamContainer.innerHTML = "<p>참여 중인 팀이 없습니다.</p>";
        if (typeof renderTeamInfo === 'function') renderTeamInfo(null);
        if (typeof renderTeamDocuments === 'function') renderTeamDocuments(null);
        if (typeof fetchAndRenderAttendanceSummary === 'function') fetchAndRenderAttendanceSummary(null); // 팀 없을 때 초기화
    }
}

function loadTeamInfo(teamId) {
    // 로딩 중 표시 (선택 사항)
    const teamDocumentsDiv = document.getElementById("team-documents");
    if (teamDocumentsDiv) teamDocumentsDiv.innerHTML = "<p>문서 정보 로딩 중...</p>";

    fetch(`/api/teams/${teamId}`) // TeamSerializer를 사용하는 API
        .then(res => {
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error(`Team with ID ${teamId} not found.`);
                }
                throw new Error(`Failed to fetch team info: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(teamData => {
            if (typeof renderTeamInfo === 'function') {
                renderTeamInfo(teamData);
            }
            if (typeof renderTeamDocuments === 'function') {
                renderTeamDocuments(teamData.notion_url, teamData.team_name); // 팀 이름도 전달 (버튼 텍스트용)
            }
        })
        .catch(error => {
            console.error(`Error loading team info for ${teamId}:`, error);
            const teamNameElement = document.getElementById("team-name");
            if (teamNameElement) teamNameElement.textContent = "팀 정보를 불러올 수 없습니다.";
            const teamMembersElement = document.getElementById("team-members");
            if (teamMembersElement) teamMembersElement.innerHTML = "<p>팀 정보를 불러오는 중 오류가 발생했습니다.</p>";
            if (teamDocumentsDiv) teamDocumentsDiv.innerHTML = "<p>문서 정보를 불러오는 중 오류가 발생했습니다.</p>";
        });
}
async function fetchAndRenderAttendanceSummary(teamId) {
    const summaryContainer = document.getElementById("team-attendance-summary");
    if (!summaryContainer) {
        console.warn("Element with ID 'team-attendance-summary' not found.");
        return;
    }

    if (!teamId) {
        summaryContainer.innerHTML = "<p>팀을 선택해주세요.</p>";
        return;
    }

    summaryContainer.innerHTML = "<p>출결 요약 정보 로딩 중...</p>";

    try {
        const response = await fetch(`/api/attendance/att/summary/${teamId}/`); // 실제 API 경로 확인
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                summaryContainer.innerHTML = `<p>${errorData.error || '출결 요약 정보를 찾을 수 없습니다.'}</p>`;
            } else if (response.status === 403) {
                 summaryContainer.innerHTML = `<p>${errorData.detail || '이 팀의 출결 요약 정보에 접근할 권한이 없습니다.'}</p>`;
            }
            else {
                throw new Error(`서버 응답 오류: ${response.status} ${errorData.error || ''}`);
            }
            return;
        }
        const summaryData = await response.json();

        if (summaryData && summaryData.message && summaryData.message.includes("멤버가 아닙니다")) {
             // 팀 멤버가 아닌 경우 서버에서 보낸 메시지 표시
             summaryContainer.innerHTML = `<p>${summaryData.message}</p>`;
        } else if (summaryData && summaryData.message && summaryData.message.includes("기록이 아직 없습니다")) {
             // 팀 출결 기록이 없는 경우
             summaryContainer.innerHTML = `<p>${summaryData.message}</p>`;
        }
        else if (summaryData && typeof summaryData.present_count !== 'undefined' && summaryData.user_student_name) {
            summaryContainer.innerHTML = `
                <p style="font-weight: 500; margin-bottom: 0.5rem;">${summaryData.user_student_name}님의 출결 현황 (${summaryData.team_name || teamId} 팀)</p>
                <ul style="list-style-type: none; padding-left: 0; margin-top: 0.5rem;">
                    <li style="margin-bottom: 0.25rem;">총 출석: <strong style="color: #10B981;">${summaryData.present_count}회</strong></li>
                    <li style="margin-bottom: 0.25rem;">총 결석: <strong style="color: #EF4444;">${summaryData.absent_count}회</strong></li>
                </ul>
                <p style="font-size: 0.8rem; color: #6B7280; margin-top: 0.5rem;">(총 ${summaryData.total_sessions_for_member || 'N/A'}회차 기록 기준)</p>
            `;
        } else {
            summaryContainer.innerHTML = "<p>출결 요약 정보가 없거나 형식이 올바르지 않습니다.</p>";
        }

    } catch (error) {
        console.error(`Error fetching attendance summary for team ${teamId}:`, error);
        summaryContainer.innerHTML = "<p>출결 요약 정보를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

function renderTeamInfo(team) {
    const teamNameElement = document.getElementById("team-name");
    const teamMembersElement = document.getElementById("team-members");

    if (!teamNameElement || !teamMembersElement) {
        console.error("Team info display elements not found.");
        return;
    }

    if (!team || typeof team.team_name === 'undefined') { // 팀 정보가 null이거나 없을 경우
        teamNameElement.textContent = "👥 팀 정보"; // 기본 제목
        teamMembersElement.innerHTML = "<p>팀을 선택해주세요.</p>";
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

function renderTeamDocuments(notionUrl, teamName = "팀") {
    const documentsDiv = document.getElementById("team-documents");
    if (!documentsDiv) {
        console.error("Element with ID 'team-documents' not found.");
        return;
    }
    documentsDiv.innerHTML = ""; // 기존 내용 비우기

    if (notionUrl) {
        const p = document.createElement("p"); 
        p.textContent = "팀의 공유 문서를 확인하고 협업하세요."; // 버튼 위에 설명 추가
        p.style.marginBottom = "0.75rem"; // 버튼과의 간격
        documentsDiv.appendChild(p);

        const notionLink = document.createElement("a");
        notionLink.href = notionUrl;
        notionLink.target = "_blank";
        notionLink.classList.add("btn-notion-link");
        notionLink.textContent = `${teamName} Notion 문서 열기`;
        documentsDiv.appendChild(notionLink);

    } else if (notionUrl === null || notionUrl === '') {
        documentsDiv.innerHTML = "<p>📂 이 팀의 공유 문서(Notion 링크)가 아직 설정되지 않았습니다.</p>";
    } else {
        documentsDiv.innerHTML = "<p>팀을 선택하면 공유 문서 정보를 표시합니다.</p>";
    }
}

function renderAttendance(attendanceSummary) {
    const container = document.getElementById("team-attendance-summary"); // HTML의 ID와 일치시킴
    if (!container) {
        // console.error("Element with ID 'team-attendance-summary' not found."); // 이 페이지에 해당 요소가 없다면 오류 발생 가능
        return;
    }
    container.innerHTML = ""; // 초기화

    if (!attendanceSummary) { // 팀 선택 전 또는 데이터 로딩 실패 시
        container.innerHTML = "<p>팀을 선택하면 출결 요약 정보를 표시합니다.</p>";
        return;
    }

    container.innerHTML = "<p>📅 (출결 요약 정보 표시 영역 - API 구현 필요)</p>"; // 임시 메시지
}
