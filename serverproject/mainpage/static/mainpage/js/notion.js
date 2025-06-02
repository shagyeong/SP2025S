// mainpage/static/mainpage/js/notion.js

document.addEventListener("DOMContentLoaded", function () {
    fetch("https://notion-api.splitbee.io/v1/page/1c69083e0adb80ce927de14a2e04960d")
      .then(response => response.json())
      .then(data => {
        const contentDiv = document.getElementById("notion-content");
        contentDiv.innerHTML = "";
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
  

// 문서 제목 클릭 → 상세 보기 모달 열기
document.querySelectorAll('.notion-title').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const li = el.closest('li');
      const id = li.querySelector('.edit-btn').dataset.id;
      const title = el.textContent;
      const status = li.querySelector('.notion-meta').textContent;
      const team = li.dataset.team;
  
      document.getElementById("detail-title").textContent = title;
      document.getElementById("detail-status").textContent = status;
      document.getElementById("detail-team").textContent = team;
      document.getElementById("detail-modal").style.display = "block";
  
      fetch(`/api/notion/body/${id}/`) // 백엔드 구현 필요
        .then(res => res.json())
        .then(data => {
          document.getElementById("detail-body").value = data.body || "";
        })
        .catch(() => {
          document.getElementById("detail-body").value = "";
        });
  
      document.getElementById("save-body").onclick = () => {
        fetch(`/api/notion/body/${id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: document.getElementById("detail-body").value })
        })
        .then(res => res.ok ? alert("✅ 저장됨") : alert("❌ 실패"))
        .catch(() => alert("❌ 에러"));
      };
    });
  });
  
  document.getElementById("close-detail").addEventListener("click", () => {
    document.getElementById("detail-modal").style.display = "none";
  });
  