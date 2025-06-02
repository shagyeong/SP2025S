// attendance.js
console.log("attendance.js loaded (주석 버전)", new Date().toLocaleTimeString());

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
// 전역 변수 선언 (값 할당은 DOMContentLoaded 이후에)
let teamMembers = [];
let currentRoundInfo = { number: "01", displayName: "1회차" };
let currentSelectedTeamId = null;

// DOM 요소 변수 (DOMContentLoaded 이후에 할당)
let teamNameDisplay, checklistDiv, timestampP, submitBtn, historyTableBody, historyTableHead, currentSessionNameDisplay;

document.addEventListener("DOMContentLoaded", function () {
    // HTML에서 데이터 읽어오기
    try {
        teamMembers = JSON.parse(document.getElementById('team-members-data').textContent);
    } catch (e) {
        console.error("팀원 정보 로딩 실패:", e);
        teamMembers = [];
    }
    try {
        currentRoundInfo = JSON.parse(document.getElementById('current-round-data').textContent);
    } catch (e) {
        console.error("현재 회차 정보 로딩 실패:", e);
    }
    try {
        const selectedTeamIdData = document.getElementById('selected-team-id-data');
        if (selectedTeamIdData) {
            const parsedTeamId = JSON.parse(selectedTeamIdData.textContent);
            currentSelectedTeamId = (parsedTeamId === null || parsedTeamId === "") ? null : parsedTeamId;
        }
    } catch (e) {
        console.error("선택된 팀 ID 로딩 실패:", e);
    }

    console.log("DOMContentLoaded - Parsed currentSelectedTeamId:", currentSelectedTeamId);
    console.log("DOMContentLoaded - Parsed teamMembers:", teamMembers);
    console.log("DOMContentLoaded - Parsed currentRoundInfo:", currentRoundInfo);

    // DOM 요소 할당
    teamNameDisplay = document.getElementById('team-name-display');
    checklistDiv = document.getElementById("attendance-checklist");
    timestampP = document.getElementById("attendance-timestamp");
    submitBtn = document.getElementById("submit-attendance");
    historyTableBody = document.getElementById("history-table-body");
    historyTableHead = document.getElementById("history-table-head");
    currentSessionNameDisplay = document.getElementById('current-session-name-display');

    if (!currentSelectedTeamId) {
        console.warn("선택된 팀 ID가 없습니다. 출결 기능을 초기화하지 않습니다.");
        if (submitBtn) submitBtn.style.display = 'none'; // 제출 버튼 숨기기
        return;
    }

    // 팀이 선택된 경우에만 나머지 UI 업데이트 및 이벤트 리스너 설정
    if (currentSessionNameDisplay && currentRoundInfo) {
        currentSessionNameDisplay.textContent = currentRoundInfo.displayName;
    } else if (currentSessionNameDisplay) {
        currentSessionNameDisplay.textContent = "회차 정보 없음";
    }


    if (checklistDiv) { // checklistDiv가 있을 때만 실행
        renderTeamMembersForAttendance();
    } else {
        console.error("ID 'attendance-checklist'를 가진 요소를 찾을 수 없습니다.");
    }

    if (historyTableBody && historyTableHead) { // history 테이블 요소들이 있을 때만 실행
         loadAttendanceHistory();
    } else {
        console.error("ID 'history-table-body' 또는 'history-table-head'를 가진 요소를 찾을 수 없습니다.");
    }


    if (submitBtn) {
        submitBtn.addEventListener("click", handleSubmitAttendance);
    } else {
        console.error("제출 버튼(submit-attendance)을 찾을 수 없습니다.");
    }
});

// 출석 체크를 위한 팀원 목록을 화면에 구성하는 함수
function renderTeamMembersForAttendance() {
    if (!checklistDiv) {
        console.error("출석 체크리스트 div(attendance-checklist)를 찾을 수 없습니다.");
        return;
    }
    checklistDiv.innerHTML = ''; // 기존 내용을 비움

    if (!teamMembers || teamMembers.length === 0) {
        checklistDiv.innerHTML = '<p style="padding: 1rem 0;">팀원 정보가 없습니다. 관리자에게 문의하세요.</p>';
        return;
    }

    teamMembers.forEach(member => {
        if (!member.id || !member.name) return;

        const memberDiv = document.createElement('div');
        memberDiv.classList.add('team-member-attendance-item');
        memberDiv.dataset.memberId = member.id;
        memberDiv.dataset.attendanceKey = member.attendance_key;

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('member-name');
        nameSpan.textContent = member.name;
        memberDiv.appendChild(nameSpan);

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('status-options');

        const statuses = [
            { value: 'O', label: '출석', classSuffix: 'present' },
            { value: 'X', label: '결석', classSuffix: 'absent'  }
        ];

        statuses.forEach(statusInfo => {
            const label = document.createElement('label');
            label.classList.add(`status-${statusInfo.classSuffix}-label`);

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `attendance-${member.id}`;
            radio.value = statusInfo.value;

            if (statusInfo.value === 'O') {
                radio.checked = true;
                label.classList.add('selected');
            }

            label.appendChild(radio);
            label.appendChild(document.createTextNode(statusInfo.label));

            radio.addEventListener('change', function() {
                document.querySelectorAll(`input[name="attendance-${member.id}"]`).forEach(rb => {
                    rb.parentElement.classList.remove('selected');
                });
                if (this.checked) {
                    this.parentElement.classList.add('selected');
                }
            });
            optionsDiv.appendChild(label);
        });
        memberDiv.appendChild(optionsDiv);
        checklistDiv.appendChild(memberDiv);
    });
}

// '출석 완료' 버튼 클릭 시 호출될 함수
async function handleSubmitAttendance() {
    if (!submitBtn) { // submitBtn이 없으면 함수 실행 중단
        console.error("handleSubmitAttendance: 제출 버튼을 찾을 수 없습니다.");
        return;
    }
    
    if (!currentSelectedTeamId) {
        alert("팀이 선택되지 않았습니다.");
        return;
    }
    if (!currentRoundInfo || !currentRoundInfo.number) {
        alert("현재 회차 정보가 없습니다.");
        return;
    }

    const attendancePayload = {
        team_id: currentSelectedTeamId,
        round: currentRoundInfo.number.toString().padStart(2, '0'),
    };
    let allSelected = true;
    teamMembers.forEach(member => {
        if (!member.id || !member.attendance_key) return;
        const selectedRadio = document.querySelector(`input[name="attendance-${member.id}"]:checked`);
        if (selectedRadio) {
            attendancePayload[member.attendance_key] = selectedRadio.value;
        } else {
            allSelected = false;
        }
    });

    if (!allSelected) {
        alert("모든 팀원의 출결 상태를 선택해주세요.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';

    try {
        const response = await fetch(`/attendance/att/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(attendancePayload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('출석 제출 성공:', result);
            if (timestampP) timestampP.textContent = `타임스탬프: ${new Date().toLocaleString()}`;
            alert(result.message || '출석이 기록되었습니다.'); // 서버 메시지 사용
            if (historyTableBody && historyTableHead) loadAttendanceHistory(); // 조건부 호출
        } else {
            const errorResult = await response.json().catch(() => ({ detail: '알 수 없는 오류 (응답 파싱 실패)' }));
            console.error('출석 제출 실패:', response.status, errorResult);
            alert(`출석 기록에 실패했습니다: ${errorResult.detail || errorResult.non_field_errors || response.statusText}`);
        }
    } catch (error) {
        console.error('출석 제출 중 네트워크 또는 스크립트 오류:', error);
        alert('출석 기록 중 오류가 발생했습니다.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '출석 완료';
    }
}

async function loadAttendanceHistory() {
    if (!historyTableBody || !historyTableHead) { // 함수 시작 시 DOM 요소 확인
        console.error("loadAttendanceHistory: 출결 기록 테이블 요소를 찾을 수 없습니다.");
        return;
    }
    if (!currentSelectedTeamId) {
        historyTableBody.innerHTML = "<tr><td colspan='100%'>팀 정보 없음</td></tr>";
        historyTableHead.innerHTML = "<tr><th>회차</th></tr>"; // 기본 헤더
        return;
    }

    try {
        const response = await fetch(`/attendance/att/${currentSelectedTeamId}/`);
        if (!response.ok) {
            if (response.status === 404) {
                if (teamMembers && teamMembers.length > 0) {
                    historyTableHead.innerHTML = `<tr><th>회차</th>${teamMembers.map(m => `<th>${m.name || '이름없음'}</th>`).join('')}<th>최종 수정</th></tr>`;
                    historyTableBody.innerHTML = `<tr><td colspan="${teamMembers.length + 2}">출결 기록이 없습니다.</td></tr>`;
                } else {
                    historyTableHead.innerHTML = `<tr><th>회차</th><th>정보</th><th>최종 수정</th></tr>`;
                    historyTableBody.innerHTML = `<tr><td colspan="3">출결 기록이 없거나 팀원 정보를 불러올 수 없습니다.</td></tr>`;
                }
            } else {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
            return;
        }
        const records = await response.json();

        if (!teamMembers || teamMembers.length === 0) {
            historyTableHead.innerHTML = `<tr><th>회차</th><th>정보</th><th>최종 수정</th></tr>`;
            historyTableBody.innerHTML = `<tr><td colspan="3">팀원 정보를 불러올 수 없어 출결 기록을 표시할 수 없습니다.</td></tr>`;
            return;
        }

        historyTableHead.innerHTML = `<tr><th>회차</th>${teamMembers.map(m => `<th>${m.name || '이름없음'}</th>`).join('')}<th>최종 수정</th></tr>`;
        historyTableBody.innerHTML = records.map(record => {
            const formatTimestamp = (timestamp) => {
                if (!timestamp) return '-';
                const date = new Date(timestamp);
                return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            };

            return `<tr>
                        <td>${record.round || '-'}</td>
                        ${teamMembers.map(m => {
                            let statusClass = '';
                            let statusText = '';
                            const attendanceValue = record[m.attendance_key];
                            if (attendanceValue === 'O' || attendanceValue === 'o') {
                                statusClass = 'present';
                                statusText = 'o';
                            } else if (attendanceValue === 'X' || attendanceValue === 'x') {
                                statusClass = 'absent';
                                statusText = 'x';
                            } else if (attendanceValue) {
                                statusClass = 'other-status';
                                statusText = attendanceValue;
                            } else {
                                statusClass = '';
                                statusText = '-';
                            }
                            return `<td class="${statusClass}">${statusText}</td>`;
                        }).join('')}
                        <td>${formatTimestamp(record.updated_at)}</td>
                    </tr>`;
        }).join('');

    } catch (error) {
        console.error('출석 기록 로딩 중 오류:', error);
        historyTableHead.innerHTML = `<tr><th>오류</th></tr>`;
        historyTableBody.innerHTML = `<tr><td>출결 기록을 불러오는 중 오류가 발생했습니다.</td></tr>`;
    }
}