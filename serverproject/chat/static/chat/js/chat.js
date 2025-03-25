// 팀 대화 기능

function sendMessage() {
    var input = document.getElementById("chat-input"); // 입력 필드 가져오기
    var message = input.value;
    if (message.trim() !== "") {
        var chatBox = document.getElementById("chat-box"); // 채팅창 요소 가져오기
        var newMessage = document.createElement("p"); // 새로운 메시지 생성
        newMessage.innerHTML = "<strong>나:</strong> " + message;
        chatBox.appendChild(newMessage); // 메시지를 채팅창에 추가
        input.value = ""; // 입력 필드 초기화
        chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 아래로 자동 이동
    }
}
