// 공유 문서 기능


document.getElementById("load-documents").addEventListener("click", function () {
    console.log("문서 불러오는 중...");

    fetch("http://127.0.0.1:8000/notion/documents/")  // Django API 호출
        .then(response => response.json())
        .then(data => {
            const documentList = document.getElementById("notion-doc-list");
            documentList.innerHTML = "";  // 기존 목록 초기화

            data.documents.forEach(doc => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="https://www.notion.so/${doc.id}" target="_blank">${doc.title}</a>`;
                documentList.appendChild(li);
            });

            console.log("문서 불러오기 완료");
        })
        .catch(error => console.error("문서 불러오기 실패:", error));
});