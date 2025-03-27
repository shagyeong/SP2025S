document.addEventListener("DOMContentLoaded", function () {
    console.log("메인 JS 로드 완료");

    // 공유 문서
    const loadDocumentsBtn = document.getElementById("load-documents");
    if (loadDocumentsBtn) {
        loadDocumentsBtn.addEventListener("click", fetchDocuments);
    }

    // 출결 확인
    const loadAttendanceBtn = document.getElementById("load-attendance");
    if (loadAttendanceBtn) {
        loadAttendanceBtn.addEventListener("click", fetchAttendance);
    }

    // 팀 대화
    const sendChatBtn = document.getElementById("send-chat");
    if (sendChatBtn) {
        sendChatBtn.addEventListener("click", sendMessage);
    }

    // 장소 예약
    const loadReservationBtn = document.getElementById("load-reservation");
    if (loadReservationBtn) {
        loadReservationBtn.addEventListener("click", fetchReservations);
    }
});

// 공유 문서 API 호출
function fetchDocuments() {
    fetch("/api/documents/")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("document-list");
            if (!list) return;
            list.innerHTML = "";
            data.documents.forEach(doc => {
                const li = document.createElement("li");
                li.textContent = `제목: ${doc.title}, 수정 날짜: ${doc.updated_at}`;
                list.appendChild(li);
            });
        })
        .catch(err => console.error("공유 문서 오류:", err));
}

// 출결 확인 API 호출
function fetchAttendance() {
    fetch("/api/attendance/")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("attendance-list");
            if (!list) return;
            list.innerHTML = "";
            data.attendance.forEach(record => {
                const li = document.createElement("li");
                li.textContent = `이름: ${record.student_name}, 출결 상태: ${record.status}`;
                list.appendChild(li);
            });
        })
        .catch(err => console.error("출결 오류:", err));
}

// 채팅 메시지 전송
function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput?.value.trim();

    if (!message) return;

    // 서버로 메시지 전송
    fetch("/api/chat/send/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
        chatInput.value = "";
        fetchChatMessages();
    })
    .catch(err => console.error("채팅 전송 실패:", err));
}

// 채팅 메시지 최신화
function fetchChatMessages() {
    fetch("/api/chat/")
        .then(res => res.json())
        .then(data => {
            const chatBox = document.getElementById("chat-box");
            if (!chatBox) return;
            chatBox.innerHTML = "";
            data.messages.forEach(msg => {
                const div = document.createElement("div");
                div.textContent = `${msg.sender}: ${msg.message} (${msg.timestamp})`;
                chatBox.appendChild(div);
            });
        })
        .catch(err => console.error("채팅 불러오기 실패:", err));
}

// 장소 예약 조회
function fetchReservations() {
    fetch("/api/reservations/")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("reservation-list");
            if (!list) return;
            list.innerHTML = "";
            data.reservations.forEach(res => {
                const li = document.createElement("li");
                li.textContent = `장소: ${res.place}, 예약 시간: ${res.time}`;
                list.appendChild(li);
            });
        })
        .catch(err => console.error("예약 불러오기 실패:", err));
}