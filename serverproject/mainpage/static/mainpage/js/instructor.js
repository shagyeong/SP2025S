document.addEventListener('DOMContentLoaded', function () {
    const studentListDiv = document.getElementById('student-list');
    const leaderSelect = document.getElementById('leader_id');
    const teamForm = document.getElementById('create-team-form');
    const resultDiv = document.getElementById('create-result');
    const attendanceTeamSelect = document.getElementById('attendance-team-select');
    const attendanceResult = document.getElementById('attendance-result');
    const teamTableBody = document.getElementById('team-table-body');

    let allStudents = [];
    let selectedMembers = [];
    let editMode = false;
    let editingTeamId = null;

    // 팀 생성 폼 열기
    window.openCreateForm = function () {
        editMode = false;
        editingTeamId = null;
        document.getElementById('form-title').innerText = '➕ 팀 생성';
        document.getElementById('submit-btn').innerText = '팀 생성';
        document.getElementById('create-edit-form').style.display = 'block';
        teamForm.reset();
        leaderSelect.innerHTML = '';
        document.querySelectorAll('.student-checkbox').forEach(cb => cb.checked = false);
    };

    // 팀 생성 폼 닫기
    window.closeForm = function () {
        document.getElementById('create-edit-form').style.display = 'none';
    };

    // 1. 학생 목록 가져오기
    fetch('/api/students')
        .then(res => res.json())
        .then(data => {
            allStudents = data;
            studentListDiv.innerHTML = data.map(student =>
                `<label><input type="checkbox" class="student-checkbox" value="${student.student_id}"> ${student.student_name} (${student.student_id})</label><br>`
            ).join('');
        });

    // 2. 팀원 선택 시 팀장 드롭다운 업데이트
    studentListDiv.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.student-checkbox:checked');
        selectedMembers = Array.from(checkboxes).map(cb => cb.value);
        if (selectedMembers.length > 5) {
            alert("팀원은 최대 5명까지 선택 가능합니다.");
            this.querySelector(`input[value="${selectedMembers.pop()}"]`).checked = false;
            return;
        }

        leaderSelect.innerHTML = selectedMembers.map(id => {
            const name = allStudents.find(s => s.student_id === id).student_name;
            return `<option value="${id}">${name} (${id})</option>`;
        }).join('');
    });

    // 3. 팀 생성 또는 수정
    teamForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (selectedMembers.length < 2) {
            alert("팀원은 최소 2명 이상 선택해야 합니다.");
            return;
        }

        const payload = {
            team_name: document.getElementById('team_name').value,
            leader_id: leaderSelect.value,
            mate1_id: selectedMembers.filter(id => id !== leaderSelect.value)[0] || null,
            mate2_id: selectedMembers.filter(id => id !== leaderSelect.value)[1] || null,
            mate3_id: selectedMembers.filter(id => id !== leaderSelect.value)[2] || null,
            mate4_id: selectedMembers.filter(id => id !== leaderSelect.value)[3] || null,
        };

        const url = editMode ? `/instructors/teams/${editingTeamId}` : '/instructors/teams';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => {
                resultDiv.innerHTML = `<p>✅ ${editMode ? '팀 수정 완료' : '팀 생성 완료'} - 팀 ID: <strong>${json.team_id}</strong></p>`;
                teamForm.reset();
                leaderSelect.innerHTML = '';
                document.querySelectorAll('.student-checkbox').forEach(cb => cb.checked = false);
                loadTeams();
                closeForm();
            });
    });

    // 4. 팀 목록 불러오기
    function loadTeams() {
        fetch('/instructors/teams')
            .then(res => res.json())
            .then(teams => {
                attendanceTeamSelect.innerHTML = teams.map(team =>
                    `<option value="${team.team_id}">${team.team_name} (${team.team_id})</option>`
                ).join('');

                teamTableBody.innerHTML = teams.map(team => `
                    <tr data-team-id="${team.team_id}">
                        <td>${team.team_name}</td>
                        <td>${[team.leader, team.mate1_id, team.mate2_id, team.mate3_id, team.mate4_id].filter(Boolean).join(', ')}</td>
                        <td>${team.leader}</td>
                        <td>
                            <div class="menu-wrapper">
                                <button class="menu-btn">⋯</button>
                                <div class="menu-dropdown" style="display:none">
                                    <button class="edit-btn">✏️ 수정</button>
                                    <button class="delete-btn">🗑 삭제</button>
                                    <button class="attendance-btn">📋 출결 보기</button> <!-- 출결 보기 버튼 추가 -->
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('');
            });
    }

    // 5. 출결 조회 버튼 클릭
    document.getElementById('load-attendance').addEventListener('click', function () {
        const round = document.getElementById('attendance-round').value;
        fetch(`/instructors/attendance/detail?round=${round}`)
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    attendanceResult.innerHTML = `<p>출결 데이터가 없습니다.</p>`;
                    return;
                }

                let tableHTML = `
                    <h4>📋 ${round}회차 출결 현황</h4>
                    <table class="attendance-table">
                        <thead><tr><th>팀 이름</th><th>학생</th><th>출결 상태</th></tr></thead>
                        <tbody>
                `;
                data.forEach(team => {
                    const memberCount = team.members.length;
                    team.members.forEach((member, index) => {
                        const statusIcon = member.status === '출석' ? '<span class="dot green"></span> 출석' : '<span class="dot red"></span> 결석';
                        const rowClass = index === 0 ? 'team-border-top' : '';
                        tableHTML += `<tr class="${rowClass}">`;
                        if (index === 0) {
                            tableHTML += `<td rowspan="${memberCount}" class="team-name">${team.team_name}</td>`;
                        }
                        tableHTML += `<td>${member.name} (${member.student_id})</td><td>${statusIcon}</td></tr>`;
                    });
                });
                tableHTML += `</tbody></table>`;
                attendanceResult.innerHTML = tableHTML;
            });
    });

    // 6. ⋯ 메뉴 동작 + 수정/삭제
    document.addEventListener('click', function (e) {
        const isMenuBtn = e.target.classList.contains('menu-btn');
        const isEdit = e.target.classList.contains('edit-btn');
        const isDelete = e.target.classList.contains('delete-btn');
        const isAttendance = e.target.classList.contains('attendance-btn'); // 출결 보기 버튼 클릭 이벤트

        if (isMenuBtn) {
            const dropdown = e.target.nextElementSibling;
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                if (menu !== dropdown) menu.style.display = 'none';
            });
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        } else {
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                if (!menu.contains(e.target)) menu.style.display = 'none';
            });
        }

        if (isAttendance) {
            const teamId = e.target.closest('tr').dataset.teamId;
            window.location.href = `/instructors/attendance/team/${teamId}`; // 출결 상세 페이지로 이동
        }

        if (isEdit) {
            const teamId = e.target.closest('tr').dataset.teamId;
            fetch(`/instructors/teams/${teamId}`)
                .then(res => res.json())
                .then(team => {
                    editMode = true;
                    editingTeamId = team.team_id;
                    document.getElementById('form-title').innerText = '✏️ 팀 수정';
                    document.getElementById('submit-btn').innerText = '수정 저장';
                    document.getElementById('create-edit-form').style.display = 'block';

                    document.getElementById('team_name').value = team.team_name;
                    selectedMembers = [team.leader, team.mate1_id, team.mate2_id, team.mate3_id, team.mate4_id].filter(Boolean);

                    document.querySelectorAll('.student-checkbox').forEach(cb => {
                        cb.checked = selectedMembers.includes(cb.value);
                    });

                    leaderSelect.innerHTML = selectedMembers.map(id => {
                        const name = allStudents.find(s => s.student_id === id)?.student_name || id;
                        return `<option value="${id}">${name} (${id})</option>`;
                    }).join('');
                    leaderSelect.value = team.leader;
                });
        }

        if (isDelete) {
            const teamId = e.target.closest('tr').dataset.teamId;
            if (confirm("정말 삭제하시겠습니까?")) {
                fetch(`/instructors/teams/${teamId}`, { method: 'DELETE' })
                    .then(() => {
                        alert("삭제 완료");
                        loadTeams();
                    });
            }
        }
    });

    // 7. 테스트용 더미 로딩 (개발용)
    window.allStudents = [
        { student_id: '21-001', student_name: '신하경' },
        { student_id: '21-002', student_name: '변진영' },
        { student_id: '21-003', student_name: '박희민' },
        { student_id: '21-004', student_name: '이동글' },
        { student_id: '21-005', student_name: '김세모' },
    ];

    // 팀원 체크박스 렌더링
    studentListDiv.innerHTML = allStudents.map(student =>
        `<label>
        <input type="checkbox" class="student-checkbox" name="members" value="${student.student_id}">
        ${student.student_name} (${student.student_id})
        </label><br>`
    ).join('');


    // 8. 팀 검색 기능
    document.getElementById('search-team').addEventListener('input', function () {
        const keyword = this.value.toLowerCase();
        document.querySelectorAll('#team-table-body tr').forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword) ? '' : 'none';
        });
    });
});
