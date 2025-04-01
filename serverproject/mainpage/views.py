import requests
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

# Notion API 설정
NOTION_API_KEY = "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"
DATABASE_ID = "1c69083e0adb80ce927de14a2e04960d"
NOTION_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json"
}

# 📌 대시보드 / 학생 페이지

def index(request):
    return render(request, 'mainpage/index.html')

#  교수자 페이지
def instructor_view(request):
    return render(request, 'mainpage/instructor.html')


# Team 모델 없이 문서 페이지 보여주기 (프론트 확인용 더미)
def documents_view(request):
    teams = [
        {"name": "A팀", "url": "https://maze-canary-919.notion.site/A-1c69083e0adb80789147d2a0561de9d6"},
        {"name": "B팀", "url": "https://maze-canary-919.notion.site/B-1c69083e0adb80789b73eea3bff16b5c"},
        {"name": "C팀", "url": "https://www.notion.so/example-c"},
    ]

    selected_name = request.GET.get("team")
    selected_team = next((t for t in teams if t["name"] == selected_name), teams[0])

    return render(request, "mainpage/documents.html", {
        "teams": teams,
        "selected_team": selected_team,
        "iframe_url": selected_team["url"]
    })

# from django.shortcuts import render
# from .models import Team  # 실제 DB 모델 기반 연결

# def documents_view(request):
#     teams = Team.objects.all()
#     selected_name = request.GET.get("team")
#     selected_team = teams.filter(name=selected_name).first() if selected_name else teams.first()

#     return render(request, "mainpage/documents.html", {
#         "teams": teams,
#         "selected_team": selected_team,
#         "iframe_url": selected_team.notion_url if selected_team else None,
#     })


# 여긴 현재 안 쓰는 중이므로 삭제 가능

# # ➕ 문서 생성
# @csrf_exempt
# def create_notion_document(request):
#     if request.method == "POST":
#         title = request.POST.get("title")
#         status = request.POST.get("status")

#         payload = {
#             "parent": {"database_id": DATABASE_ID},
#             "properties": {
#                 "Name": {
#                     "title": [{"text": {"content": title}}]
#                 },
#                 "Status": {
#                     "status": {"name": status}
#                 }
#             }
#         }
#         requests.post(f"{NOTION_BASE_URL}/pages", headers=HEADERS, json=payload)
#         return redirect("mainpage:documents")

# # ✏️ 문서 수정
# @csrf_exempt
# def update_notion_document(request, page_id):
#     if request.method == "POST":
#         page_id = '-'.join([page_id[:8], page_id[8:12], page_id[12:16], page_id[16:20], page_id[20:]])
#         new_title = request.POST.get("title")
#         new_status = request.POST.get("status")

#         payload = {
#             "properties": {
#                 "Name": {
#                     "title": [{"text": {"content": new_title}}]
#                 },
#                 "Status": {
#                     "status": {"name": new_status}
#                 }
#             }
#         }

#         url = f"{NOTION_BASE_URL}/pages/{page_id}"
#         res = requests.patch(url, headers=HEADERS, json=payload)

#         if res.status_code == 200:
#             return JsonResponse({"message": "수정 완료"}, status=200)
#         else:
#             return JsonResponse({"error": res.json()}, status=400)

# # 🗑 문서 삭제 (archive)
# def delete_notion_document(request, page_id):
#     if request.method == "POST":
#         url = f"{NOTION_BASE_URL}/pages/{page_id}"
#         payload = {"archived": True}
#         res = requests.patch(url, headers=HEADERS, json=payload)

#         if res.status_code == 200:
#             return redirect("mainpage:documents")
#         else:
#             return JsonResponse({"error": res.json()}, status=400)

# # 🔄 상태 동기화
# def notion_sync_status(request):
#     url = f"{NOTION_BASE_URL}/databases/{DATABASE_ID}/query"
#     response = requests.post(url, headers=HEADERS)

#     if response.status_code != 200:
#         return JsonResponse({"error": response.json()}, status=400)

#     data = response.json()
#     synced = []

#     for result in data.get("results", []):
#         page_id = result["id"]
#         title_info = result["properties"]["Name"]["title"]
#         title = title_info[0]["plain_text"] if title_info else "제목 없음"
#         status = result["properties"]["Status"]["status"]["name"]
#         synced.append({"id": page_id, "title": title, "status": status})

#     return JsonResponse({"synced_documents": synced})

# # ✅ API 연결 상태 확인
# def notion_status_check(request):
#     url = f"{NOTION_BASE_URL}/databases/{DATABASE_ID}"
#     res = requests.get(url, headers=HEADERS)
#     if res.status_code == 200:
#         return JsonResponse({"status": "연결 성공"})
#     else:
#         return JsonResponse({"status": "연결 실패", "code": res.status_code})
    