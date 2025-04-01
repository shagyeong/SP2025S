// 공통 이벤트 핸들러 및 대시보드 초기화, 채팅, 예약, 출결 데이터 관리

document.addEventListener("DOMContentLoaded", function () {
    console.log("📦 JS Loaded");

    const actions = {
        "load-documents": fetchDocuments,
        "load-attendance": fetchAttendance,
        "send-chat": sendMessage,
        "load-reservation": fetchReservations,
        "sync-documents": syncDocuments,
    };

    Object.entries(actions).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener("click", handler);
    });
});

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
        .catch(err => console.error("문서 로드 실패:", err));
}

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
        .catch(err => console.error("출결 로드 실패:", err));
}

function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput?.value.trim();
    if (!message) return;

    fetch("/api/chat/send/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(() => {
        chatInput.value = "";
        fetchChatMessages();
    })
    .catch(err => console.error("메시지 전송 실패:", err));
}

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

function syncDocuments() {
    fetch("/notion/sync/")
        .then(res => res.json())
        .then(data => {
            alert("✅ 문서 상태가 최신으로 동기화되었습니다!");
            console.log(data.synced_documents);
            location.reload();
        })
        .catch(err => {
            alert("❌ 동기화 실패");
            console.error(err);
        });
}