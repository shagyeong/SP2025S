// 장소 예약 기능
// 아직 연결 X

document.addEventListener("DOMContentLoaded", function () {
    console.log("장소 예약 페이지 로드됨");

    // 캘린더 설정 (Flatpickr 적용)
    flatpickr("#date-picker", {
        dateFormat: "Y-m-d"
    });

    // 예약 버튼 클릭 이벤트
    document.getElementById("reserve-btn").addEventListener("click", reserveLocation);

    // 기존 예약 목록 불러오기
    fetchReservations();
});

// 1. 장소 예약하기
function reserveLocation() {
    const location = document.getElementById("location").value;
    const date = document.getElementById("date-picker").value;
    const time = document.getElementById("time-slot").value;

    if (!date) {
        alert("예약 날짜를 선택하세요!");
        return;
    }

    fetch("http://127.0.0.1:8000/api/reservation/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, date, time })
    })
    .then(response => response.json())
    .then(data => {
        alert("예약이 완료되었습니다!");
        fetchReservations();  // 예약 목록 새로고침
    })
    .catch(error => console.error("예약 실패:", error));
}

// 2. 기존 예약 목록 불러오기
function fetchReservations() {
    fetch("http://127.0.0.1:8000/api/reservation/")
        .then(response => response.json())
        .then(data => {
            const reservationList = document.getElementById("reservation-list");
            reservationList.innerHTML = "";  // 기존 목록 초기화

            data.reservations.forEach(record => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${record.location}</td>
                    <td>${record.date}</td>
                    <td>${record.time}</td>
                `;
                reservationList.appendChild(row);
            });

            console.log("예약 목록 불러오기 완료");
        })
        .catch(error => console.error("예약 목록 조회 실패:", error));
}