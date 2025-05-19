// 팀 관리 기능

document.getElementById("load-teams").addEventListener("click", function () {
    fetch("http://127.0.0.1:8000/api/teams/")  // Django API 호출
        .then(response => response.json())
        .then(data => {
            const teamList = document.getElementById("team-list");
            teamList.innerHTML = "";  // 기존 목록 초기화
            data.teams.forEach(team => {
                const li = document.createElement("li");
                li.textContent = `팀명: ${team.name}, ID: ${team.team_id}`;
                teamList.appendChild(li);
            });
        })
        .catch(error => console.error("오류 발생:", error));
});
