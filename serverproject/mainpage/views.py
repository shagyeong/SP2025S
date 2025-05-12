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
    rounds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    return render(request, 'instructor/instructor.html', {"rounds": rounds})


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


