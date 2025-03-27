document.addEventListener("DOMContentLoaded", function () {
    fetch("https://notion-api.splitbee.io/v1/page/PASTE_YOUR_NOTION_PAGE_ID_HERE")
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById("notion-content");
            contentDiv.innerHTML = ""; // 초기화

            for (const blockId in data) {
                const block = data[blockId];
                if (block.type === "text" && block.properties?.title) {
                    const p = document.createElement("p");
                    p.textContent = block.properties.title.flat().join("");
                    contentDiv.appendChild(p);
                }
            }
        })
        .catch(error => {
            document.getElementById("notion-content").textContent = "❌ 불러오기 실패";
            console.error("Notion API 오류:", error);
        });
});
