// 기본 기능


// 📌 페이지 로드 시 실행되는 이벤트
document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 메인 JS 로드 완료");

    // 공유 문서 데이터 불러오기 버튼 클릭 시 실행
    const loadDocumentsBtn = document.getElementById("load-documents");
    if (loadDocumentsBtn) {
        loadDocumentsBtn.addEventListener("click", fetchDocuments);
    }

    // 출결 데이터 불러오기 버튼 클릭 시 실행
    const loadAttendanceBtn = document.getElementById("load-attendance");
    if (loadAttendanceBtn) {
        loadAttendanceBtn.addEventListener("click", fetchAttendance);
    }

    // 팀 대화 메시지 전송 버튼 클릭 시 실행
    const sendChatBtn = document.getElementById("send-chat");
    if (sendChatBtn) {
        sendChatBtn.addEventListener("click", sendMessage);
    }

    // 장소 예약 데이터 불러오기 버튼 클릭 시 실행
    const loadReservationBtn = document.getElementById("load-reservation");
    if (loadReservationBtn) {
        loadReservationBtn.addEventListener("click", fetchReservations);
    }
});


// 📌 1️⃣ 공유 문서 데이터 불러오기 함수
function fetchDocuments() {
    console.log("📌 공유 문서 데이터를 가져오는 중...");

    fetch("http://127.0.0.1:8000/api/documents/")  // Django 백엔드 API 호출
        .then(response => response.json())
        .then(data => {
            const documentList = document.getElementById("document-list");
            documentList.innerHTML = "";  // 기존 목록 초기화

            data.documents.forEach(doc => {
                const li = document.createElement("li");
                li.textContent = `제목: ${doc.title}, 수정 날짜: ${doc.updated_at}`;
                documentList.appendChild(li);
            });

            console.log("✅ 공유 문서 데이터 로드 완료");
        })
        .catch(error => console.error("❌ 공유 문서 데이터 불러오기 실패:", error));
}


// 📌 2️⃣ 출결 데이터 불러오기 함수
function fetchAttendance() {
    console.log("📌 출결 데이터를 가져오는 중...");

    fetch("http://127.0.0.1:8000/api/attendance/")  // Django 백엔드 API 호출
        .then(response => response.json())
        .then(data => {
            const attendanceList = document.getElementById("attendance-list");
            attendanceList.innerHTML = "";  // 기존 목록 초기화

            data.attendance.forEach(record => {
                const li = document.createElement("li");
                li.textContent = `이름: ${record.student_name}, 출결 상태: ${record.status}`;
                attendanceList.appendChild(li);
            });

            console.log("✅ 출결 데이터 로드 완료");
        })
        .catch(error => console.error("❌ 출결 데이터 불러오기 실패:", error));
}


// 📌 3️⃣ 팀 대화 메시지 전송 함수
function sendMessage() {
    console.log("📌 팀 대화 메시지 전송 중...");

    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();

    if (message === "") {
        console.warn("⚠️ 빈 메시지는 전송할 수 없습니다.");
        return;
    }

    fetch("http://127.0.0.1:8000/api/chat/send/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ 메시지 전송 성공:", data);
        chatInput.value = "";  // 입력창 초기화
        fetchChatMessages();  // 최신 메시지 불러오기
    })
    .catch(error => console.error("❌ 메시지 전송 실패:", error));
}


// 📌 4️⃣ 최신 팀 대화 메시지 가져오기 함수
function fetchChatMessages() {
    console.log("📌 최신 팀 대화 메시지를 가져오는 중...");

    fetch("http://127.0.0.1:8000/api/chat/")
        .then(response => response.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");
            chatBox.innerHTML = "";  // 기존 메시지 초기화

            data.messages.forEach(msg => {
                const div = document.createElement("div");
                div.textContent = `${msg.sender}: ${msg.message} (${msg.timestamp})`;
                chatBox.appendChild(div);
            });

            console.log("✅ 최신 팀 대화 메시지 로드 완료");
        })
        .catch(error => console.error("❌ 팀 대화 메시지 불러오기 실패:", error));
}


// 📌 5️⃣ 장소 예약 데이터 불러오기 함수
function fetchReservations() {
    console.log("📌 장소 예약 데이터를 가져오는 중...");

    fetch("http://127.0.0.1:8000/api/reservations/")  // Django 백엔드 API 호출
        .then(response => response.json())
        .then(data => {
            const reservationList = document.getElementById("reservation-list");
            reservationList.innerHTML = "";  // 기존 목록 초기화

            data.reservations.forEach(res => {
                const li = document.createElement("li");
                li.textContent = `장소: ${res.place}, 예약 시간: ${res.time}`;
                reservationList.appendChild(li);
            });

            console.log("✅ 장소 예약 데이터 로드 완료");
        })
        .catch(error => console.error("❌ 장소 예약 데이터 불러오기 실패:", error));
}

function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();

    if (message === "") return;

    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("p");
    newMessage.innerHTML = `<strong>나:</strong> ${message}`;
    chatBox.appendChild(newMessage);

    chatInput.value = "";
}