// ✅ instructor.js (백엔드 API 연동 기반 수정 완료)

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

    // 1. 학생 목록 가져오기
    fetch('/api/students')
        .then(res => res.json())
        .then(data => {
            allStudents = data;
            studentListDiv.innerHTML = data.map(student =>
                `<label><input type="checkbox" class="student-checkbox" value="${student.student_id}"> ${student.student_name} (${student.student_id})</label><br>`
            ).join('');

            loadTeams();
        });

    // 2. 팀원 선택 → 팀장 선택 목록 자동 구성
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

    // 3. 팀 생성 / 수정
    teamForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (selectedMembers.length < 2) {
            alert("팀원은 최소 2명 이상이어야 합니다.");
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

        const url = editMode ? `/team/teams/${editingTeamId}` : '/team/teams';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => {
                resultDiv.innerHTML = `<p>✅ ${editMode ? '팀 수정 완료' : '팀 생성 완료'} - 팀명: <strong>${json.team_name}</strong></p>`;
                loadTeams();
                closeForm();
            });
    });

    // 4. 팀 목록 불러오기
    function loadTeams() {
        fetch('/team/team_list/')
            .then(res => res.json())
            .then(teams => {
                teamTableBody.innerHTML = teams.map(team => {
                    const leaderName = allStudents.find(s => s.student_id === team.leader_id)?.student_name || team.leader_id;

                    const memberIds = [team.leader_id, team.mate1_id, team.mate2_id, team.mate3_id, team.mate4_id].filter(Boolean);
                    const memberNames = memberIds.map(id => {
                        const student = allStudents.find(s => s.student_id === id);
                        return student ? `${student.student_name} (${id})` : id;
                    }).join(', ');

                    return `
                    <tr data-team-id="${team.team_id}">
                        <td>${team.team_name}</td>
                        <td>${memberNames}</td>
                        <td>${leaderName}</td>
                        <td>
                            <div class="menu-wrapper">
                                <button class="menu-btn">⋯</button>
                                <div class="menu-dropdown" style="display:none">
                                    <button class="edit-btn">✏️ 수정</button>
                                    <button class="delete-btn">🗑 삭제</button>
                                    <button class="attendance-btn">📋 출결 보기</button>
                                </div>
                            </div>
                        </td>
                    </tr>`;

                }).join('');
            });
    }

    // ✅ 5. 출결 상세 보기
    document.addEventListener('click', function (e) {
        const teamId = e.target.closest('tr')?.dataset.teamId;
        if (e.target.classList.contains('attendance-btn')) {
            window.location.href = `/attendance/${teamId}/`;
        }
        if (e.target.classList.contains('edit-btn')) {
            fetch(`/team/teams/${teamId}`)
                .then(res => res.json())
                .then(team => {
                    editMode = true;
                    editingTeamId = teamId;
                    document.getElementById('form-title').innerText = '✏️ 팀 수정';
                    document.getElementById('submit-btn').innerText = '수정 저장';
                    document.getElementById('create-edit-form').style.display = 'block';

                    document.getElementById('team_name').value = team.team_name;
                    selectedMembers = [team.leader_id, team.mate1_id, team.mate2_id, team.mate3_id, team.mate4_id].filter(Boolean);

                    document.querySelectorAll('.student-checkbox').forEach(cb => {
                        cb.checked = selectedMembers.includes(cb.value);
                    });

                    leaderSelect.innerHTML = selectedMembers.map(id => {
                        const name = allStudents.find(s => s.student_id === id)?.student_name || id;
                        return `<option value="${id}">${name} (${id})</option>`;
                    }).join('');
                    leaderSelect.value = team.leader_id;
                });
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm("정말 삭제하시겠습니까?")) {
                fetch(`/team/teams/${teamId}`, { method: 'DELETE' })
                    .then(() => {
                        alert("삭제 완료");
                        loadTeams();
                    });
            }
        }
    });

    // ✅ 6. 초기화 및 필터
    document.getElementById('search-team').addEventListener('input', function () {
        const keyword = this.value.toLowerCase();
        document.querySelectorAll('#team-table-body tr').forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword) ? '' : 'none';
        });
    });

    // ✅ 팀 생성 폼 열기 / 닫기
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
    window.closeForm = function () {
        document.getElementById('create-edit-form').style.display = 'none';
    };
});
