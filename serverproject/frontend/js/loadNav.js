// 상단바

document.addEventListener("DOMContentLoaded", function () {
    fetch("nav.html")  // nav.html 파일을 불러옴
        .then(response => response.text())
        .then(data => {
            document.getElementById("nav-container").innerHTML = data;  // HTML에 삽입
        })
        .catch(error => console.error("네비게이션 바 로드 실패:", error));
});