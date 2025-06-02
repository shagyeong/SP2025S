document.getElementById("load-teams").addEventListener("click", function () {
    fetch("/api/teams/")  // 경로 단축 (같은 서버일 경우)
        .then(response => response.json())
        .then(data => {
            const teamList = document.getElementById("team-list");
            teamList.innerHTML = "";  // 기존 목록 초기화

            data.teams.forEach(team => {
                const li = document.createElement("li");
                li.textContent = `팀명: ${team.team_name}, ID: ${team.team_id}`;
                teamList.appendChild(li);
            });
        })
        .catch(error => console.error("오류 발생:", error));
});
