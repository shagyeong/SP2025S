// serverproject/instructor/static/instructor/js/instructor.js
console.log("✅ instructor.js loaded (v.final_with_team_name_param)", new Date().toLocaleTimeString());

document.addEventListener('DOMContentLoaded', function () {
    // DOM 요소 가져오기
    const studentListDiv = document.getElementById('student-list');
    const leaderSelect = document.getElementById('leader_id');
    const teamForm = document.getElementById('create-team-form');
    const resultDiv = document.getElementById('create-result');
    const teamTableBody = document.getElementById('team-table-body');
    const searchInput = document.getElementById('search-team');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const createEditFormDiv = document.getElementById('create-edit-form');
    const attendanceRoundSelect = document.getElementById('attendance-round');
    const loadAttendanceButton = document.getElementById('load-attendance');
    const attendanceResultDiv = document.getElementById('attendance-result');

    let allStudentsData = [];
    let allTeamsData = [];
    let editingTeamId = null;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    async function initializeInstructorPage() {
        await loadAllStudents();
        await loadAllTeams();
    }

    async function loadAllStudents() {
        try {
            const response = await fetch('/api/students/');
            if (!response.ok) throw new Error(`학생 목록 로드 실패: ${response.status}`);
            allStudentsData = await response.json();
            console.log("Fetched allStudentsData:", allStudentsData);
        } catch (error) {
            console.error("학생 목록 로드 중 오류:", error);
            if (studentListDiv) studentListDiv.innerHTML = '<p>학생 목록을 불러오는 데 실패했습니다.</p>';
        }
    }

    function populateStudentCheckboxes(selectedMemberIds = []) {
        if (!studentListDiv || !allStudentsData) return;
        studentListDiv.innerHTML = '';
        allStudentsData.forEach(student => {
            const checkboxId = `student-check-${student.student_id}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.value = student.student_id;
            checkbox.name = 'team_members_checkbox';
            checkbox.classList.add('student-checkbox');
            if (selectedMemberIds.includes(student.student_id)) checkbox.checked = true;
            checkbox.addEventListener('change', updateLeaderOptionsBasedOnSelectedMembers);
            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.textContent = ` ${student.name || student.student_name} (${student.student_id})`;
            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            studentListDiv.appendChild(div);
        });
        updateLeaderOptionsBasedOnSelectedMembers();
    }

    function updateLeaderOptionsBasedOnSelectedMembers() {
        if (!leaderSelect) return;
        const selectedCheckboxes = document.querySelectorAll('input[name="team_members_checkbox"]:checked');
        const currentSelectedMembers = Array.from(selectedCheckboxes).map(cb => cb.value);
        const previouslySelectedLeader = leaderSelect.value;

        leaderSelect.innerHTML = '<option value="">팀장 선택...</option>';
        allStudentsData.forEach(student => {
            if (currentSelectedMembers.includes(student.student_id)) {
                const option = document.createElement('option');
                option.value = student.student_id;
                option.textContent = `${student.name || student.student_name} (${student.student_id})`;
                if (student.student_id === previouslySelectedLeader) option.selected = true;
                leaderSelect.appendChild(option);
            }
        });
        if (leaderSelect.selectedIndex <= 0 && currentSelectedMembers.length > 0 && !currentSelectedMembers.includes(previouslySelectedLeader)) {
            if(allStudentsData.find(s => s.student_id === currentSelectedMembers[0])) {
                 leaderSelect.value = currentSelectedMembers[0];
            }
        } else if (!currentSelectedMembers.includes(previouslySelectedLeader)) {
            leaderSelect.value = "";
        }
    }

    async function loadAllTeams() {
        try {
            const response = await fetch('/api/team_list/');
            if (!response.ok) throw new Error(`팀 목록 로드 실패: ${response.status}`);
            allTeamsData = await response.json();
            console.log("Fetched allTeamsData from /api/team_list/ (instructor.js):", JSON.stringify(allTeamsData, null, 2));
            renderTeamTable(allTeamsData);
        } catch (error) {
            console.error("팀 목록 로드 중 오류 (instructor):", error);
            if (teamTableBody) teamTableBody.innerHTML = `<tr><td colspan="4">팀 목록을 불러오는 데 실패했습니다.</td></tr>`;
        }
    }

    function renderTeamTable(teamsToRender) {
        if (!teamTableBody) {
            console.error("renderTeamTable: teamTableBody 요소를 찾을 수 없습니다.");
            return;
        }
        teamTableBody.innerHTML = '';

        if (!teamsToRender || teamsToRender.length === 0) {
            teamTableBody.innerHTML = `<tr><td colspan="4">표시할 팀이 없습니다.</td></tr>`;
            return;
        }

        teamsToRender.forEach(team => {
            const row = teamTableBody.insertRow();
            row.dataset.teamId = team.team_id;

            // ★★★ team.team_name이 유효한지 확인하고 사용 ★★★
            const teamDisplayName = (team.team_name && team.team_name.trim() !== "") ? team.team_name : team.team_id;
            row.insertCell().textContent = teamDisplayName;

            const membersCell = row.insertCell();
            let membersDisplayList = [];
            // 리더 정보 (TeamSerializer가 leader_name을 제공한다고 가정)
            if (team.leader_name && team.leader_id) {
                membersDisplayList.push(`${team.leader_name} (${team.leader_id})`);
            } else if (team.leader_id) { // 이름은 없지만 ID는 있을 경우
                membersDisplayList.push(`${team.leader_id}`);
            }

            // 팀원 정보 (TeamSerializer가 mateX_name을 제공한다고 가정)
            for (let i = 1; i <= 4; i++) {
                const mateId = team[`mate${i}_id`];
                const mateName = team[`mate${i}_name`];
                if (mateId && mateId !== team.leader_id) { // 리더가 아니고, ID가 있는 경우
                    if (mateName) {
                        membersDisplayList.push(`${mateName} (${mateId})`);
                    } else {
                        membersDisplayList.push(`${mateId}`);
                    }
                }
            }
            membersCell.textContent = membersDisplayList.join(', ') || '팀원 없음';

            row.insertCell().textContent = team.leader_name || team.leader_id || '미지정';

            const manageCell = row.insertCell();
            manageCell.classList.add('manage-cell');
            manageCell.style.textAlign = 'center';

            const moreButton = document.createElement('button');
            moreButton.innerHTML = '&#8942;';
            moreButton.classList.add('btn-manage', 'btn-more');
            moreButton.title = '관리 메뉴 열기';
            moreButton.onclick = function(event) {
                event.stopPropagation();
                toggleManageMenu(this.nextElementSibling);
            };
            manageCell.appendChild(moreButton);

            const dropdownMenu = document.createElement('div');
            dropdownMenu.classList.add('manage-dropdown-menu');

            const editButton = document.createElement('button');
            editButton.innerHTML = '✏️ 수정';
            editButton.classList.add('dropdown-item');
            editButton.onclick = () => { openEditForm(team.team_id); closeAllManageMenus(); };
            dropdownMenu.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '🗑️ 삭제';
            deleteButton.classList.add('dropdown-item');
            deleteButton.onclick = () => { deleteTeam(team.team_id, teamDisplayName); closeAllManageMenus(); }; // teamDisplayName 사용
            dropdownMenu.appendChild(deleteButton);

            const attendanceButton = document.createElement('button');
            attendanceButton.innerHTML = '📋 출결 보기';
            attendanceButton.classList.add('dropdown-item');
            attendanceButton.onclick = () => {
                const teamIdParam = encodeURIComponent(team.team_id);
                // ★★★ URL 파라미터로 전달할 때도 teamDisplayName 사용 ★★★
                const teamNameParamForUrl = encodeURIComponent(teamDisplayName);

                console.log(`[instructor.js] 출결 보기 클릭: team_id='${team.team_id}', 전달할 teamName='${teamDisplayName}'`);
                window.location.href = `/attendance/instructor/detail/?team_id=${teamIdParam}&team_name=${teamNameParamForUrl}`;
                closeAllManageMenus();
            };
            dropdownMenu.appendChild(attendanceButton);

            manageCell.appendChild(dropdownMenu);
        });
    }

    function toggleManageMenu(menuElement) {
        if (!menuElement) return;
        const isVisible = menuElement.style.display === 'block';
        closeAllManageMenus();
        if (!isVisible) menuElement.style.display = 'block';
    }

    function closeAllManageMenus() {
        document.querySelectorAll('.manage-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.manage-cell')) {
            closeAllManageMenus();
        }
    });

    window.openCreateForm = function () {
        editingTeamId = null;
        if(formTitle) formTitle.textContent = '➕ 팀 생성';
        if(submitBtn) submitBtn.textContent = '팀 생성';
        if(teamForm) teamForm.reset();
        if(resultDiv) { resultDiv.textContent = ''; resultDiv.style.color = 'black'; }
        populateStudentCheckboxes([]);
        if(createEditFormDiv) createEditFormDiv.style.display = 'block';
    };

    window.closeForm = function () {
        if(createEditFormDiv) createEditFormDiv.style.display = 'none';
        editingTeamId = null;
        if(resultDiv) resultDiv.textContent = '';
    };

    async function openEditForm(teamId) {
        editingTeamId = teamId;
        if(formTitle) formTitle.textContent = '✏️ 팀 수정';
        if(submitBtn) submitBtn.textContent = '수정 저장';
        if(teamForm) teamForm.reset();
        if(resultDiv) { resultDiv.textContent = ''; resultDiv.style.color = 'black'; }

        try {
            const response = await fetch(`/api/teams/${teamId}`);
            if (!response.ok) throw new Error(`팀 정보 로드 실패: ${response.status}`);
            const teamData = await response.json();

            if(document.getElementById('team_name')) document.getElementById('team_name').value = teamData.team_name || '';
            const currentMemberIds = [teamData.leader_id, teamData.mate1_id, teamData.mate2_id, teamData.mate3_id, teamData.mate4_id].filter(Boolean);
            populateStudentCheckboxes(currentMemberIds);
            if (leaderSelect) leaderSelect.value = teamData.leader_id || "";

            if(createEditFormDiv) createEditFormDiv.style.display = 'block';
        } catch (error) {
            console.error("팀 수정 폼 로드 중 오류:", error);
            alert(`팀 정보를 불러오는 데 실패했습니다: ${error.message}`);
            closeForm();
        }
    }

    if (teamForm) {
        teamForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const teamNameInput = document.getElementById('team_name');
            const teamName = teamNameInput ? teamNameInput.value : '';
            const leaderId = leaderSelect ? leaderSelect.value : '';
            const selectedCheckboxes = document.querySelectorAll('input[name="team_members_checkbox"]:checked');

            if (resultDiv) {
                resultDiv.textContent = '처리 중...';
                resultDiv.style.color = 'black';
            } else { return; }

            if (!teamName.trim()) { resultDiv.textContent = '팀 이름을 입력해주세요.'; resultDiv.style.color = 'red'; return; }
            if (!leaderId) { resultDiv.textContent = '팀장을 선택해주세요.'; resultDiv.style.color = 'red'; return; }

            const selectedMemberIds = Array.from(selectedCheckboxes).map(cb => cb.value);
            if (!selectedMemberIds.includes(leaderId)) { resultDiv.textContent = '팀장은 선택된 팀원 중에서 골라야 합니다.'; resultDiv.style.color = 'red'; return; }

            const mateIds = selectedMemberIds.filter(id => id !== leaderId);
            if (mateIds.length > 4) { resultDiv.textContent = `팀원은 최대 4명까지 선택 가능합니다 (현재 ${mateIds.length}명).`; resultDiv.style.color = 'red'; return; }
            if (selectedMemberIds.length < 1) { resultDiv.textContent = '팀에는 최소 1명(팀장)이 포함되어야 합니다.'; resultDiv.style.color = 'red'; return; }

            const payload = {
                team_name: teamName, leader_id: leaderId,
                mate1_id: mateIds[0] || null, mate2_id: mateIds[1] || null,
                mate3_id: mateIds[2] || null, mate4_id: mateIds[3] || null,
            };
            let url = '/api/teams'; let method = 'POST';
            if (editingTeamId) { url = `/api/teams/${editingTeamId}`; method = 'PUT'; }

            try {
                const response = await fetch(url, {
                    method: method, headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrftoken},
                    body: JSON.stringify(payload)
                });
                const responseData = await response.json();
                if (response.ok) {
                    resultDiv.textContent = editingTeamId ? '✅ 팀 정보가 성공적으로 수정되었습니다.' : '✅ 팀이 성공적으로 생성되었습니다.';
                    resultDiv.style.color = 'green';
                    await loadAllTeams();
                    setTimeout(closeForm, 2000);
                } else {
                    let errorMessage = `오류 (${response.status}): `;
                    if (responseData.error) errorMessage += responseData.error;
                    else if (responseData.detail) errorMessage += responseData.detail;
                    else if (typeof responseData === 'object') {
                        for (const key in responseData) {
                            errorMessage += `\n- ${key}: ${Array.isArray(responseData[key]) ? responseData[key].join(', ') : responseData[key]}`;
                        }
                    } else { errorMessage += '알 수 없는 오류'; }
                    resultDiv.textContent = errorMessage; resultDiv.style.color = 'red';
                }
            } catch (error) {
                console.error("팀 생성/수정 중 오류:", error);
                resultDiv.textContent = `네트워크 오류 또는 알 수 없는 오류: ${error.message}`; resultDiv.style.color = 'red';
            }
        });
    }

    async function deleteTeam(teamId, teamName) {
        if (!confirm(`'${teamName}' 팀을 정말 삭제하시겠습니까?`)) return;
        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE', headers: { 'X-CSRFToken': csrftoken }
            });
            if (response.ok || response.status === 204) {
                alert(`'${teamName}' 팀이 삭제되었습니다.`);
                await loadAllTeams();
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`팀 삭제 실패 (${response.status}): ${errorData.detail || errorData.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("팀 삭제 중 오류:", error);
            alert(`팀 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const filteredTeams = allTeamsData.filter(team =>
                (team.team_name && team.team_name.toLowerCase().includes(searchTerm)) ||
                (team.leader_name && team.leader_name.toLowerCase().includes(searchTerm)) ||
                (team.leader_id && team.leader_id.toLowerCase().includes(searchTerm))
            );
            renderTeamTable(filteredTeams);
        });
    }

    // --- 출결 조회 함수 ---
    async function loadAllTeamsAttendanceForRound() {
        if (!attendanceRoundSelect || !attendanceResultDiv) return;
        const selectedRound = attendanceRoundSelect.value;
        if (!selectedRound) {
            attendanceResultDiv.innerHTML = '<p style="color: orange;">조회할 회차를 선택해주세요.</p>';
            return;
        }
        attendanceResultDiv.innerHTML = `<p>선택된 ${selectedRound}회차 전체 팀 출결 정보를 로딩 중...</p>`;
        try {
            const response = await fetch(`/api/attendance/att/all_by_round/?round=${selectedRound}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`출결 정보 로드 실패 (${response.status}): ${errorData.error || errorData.message || '서버 오류'}`);
            }
            const allTeamsAttendance = await response.json();
            if (allTeamsAttendance && allTeamsAttendance.length > 0) {
                renderAllTeamsAttendanceTable(allTeamsAttendance, selectedRound);
            } else if (allTeamsAttendance && allTeamsAttendance.message) { // 서버에서 "팀 없음" 등의 메시지를 보낸 경우
                attendanceResultDiv.innerHTML = `<p>${allTeamsAttendance.message}</p>`;
            }
             else {
                attendanceResultDiv.innerHTML = `<p>${selectedRound}회차에 대한 출결 기록이 없습니다.</p>`;
            }
        } catch (error) {
            console.error("전체 팀 출결 조회 중 오류:", error);
            attendanceResultDiv.innerHTML = `<p style="color: red;">출결 정보를 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
        }
    }

    function renderAllTeamsAttendanceTable(allTeamsAttendance, round) {
        if (!attendanceResultDiv) return;
        const firstTeam = allTeamsAttendance[0]; // 헤더 생성을 위해 첫 번째 팀 데이터 참고
        let memberHeaders = [];

        if (firstTeam && firstTeam.team_id) { // 유효한 팀 데이터가 있는지 확인
            if(firstTeam.leader_name || firstTeam.leader_id) memberHeaders.push(`팀장 (${firstTeam.leader_name || firstTeam.leader_id || 'ID 없음'})`);
            for(let i = 1; i <= 4; i++) {
                if(firstTeam[`mate${i}_id`]) { // ID가 존재하면 해당 팀원 역할이 있다고 간주
                     memberHeaders.push(`팀원${i} (${firstTeam[`mate${i}_name`] || firstTeam[`mate${i}_id`] || 'ID 없음'})`);
                } else {
                    memberHeaders.push(`팀원${i} (-)`); // 해당 역할의 팀원이 없는 경우
                }
            }
        } else { 
            memberHeaders = ['팀장', '팀원1', '팀원2', '팀원3', '팀원4'];
        }

        let tableHtml = `<h3>${round}회차 전체 팀 출결 현황</h3><table class="team-table"><thead><tr><th>팀 이름</th>${memberHeaders.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>`;
        
        allTeamsAttendance.forEach(teamData => {
            tableHtml += `<tr><td>${teamData.team_name || teamData.team_id}</td>`;
            tableHtml += `<td>${formatAttendanceStatus(teamData.attendance_status.at_leader)}</td>`;
            tableHtml += `<td>${formatAttendanceStatus(teamData.attendance_status.at_mate1)}</td>`;
            tableHtml += `<td>${formatAttendanceStatus(teamData.attendance_status.at_mate2)}</td>`;
            tableHtml += `<td>${formatAttendanceStatus(teamData.attendance_status.at_mate3)}</td>`;
            tableHtml += `<td>${formatAttendanceStatus(teamData.attendance_status.at_mate4)}</td>`;
            tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table>`;
        attendanceResultDiv.innerHTML = tableHtml;
    }

    function formatAttendanceStatus(status) {
        if (status === 'O' || status === 'o') return '<span style="color: green; font-weight: bold;">●</span>';
        else if (status === 'X' || status === 'x') return '<span style="color: red; font-weight: bold;">X</span>';
        return status || '-'; // null, undefined, 빈 문자열일 경우 '-'
    }

    if (loadAttendanceButton) {
        loadAttendanceButton.addEventListener('click', loadAllTeamsAttendanceForRound);
    }

    initializeInstructorPage();
});