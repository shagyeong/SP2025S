import requests
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from team.models import Team
from django.db.models import Q
from instructor.models import Instructor



# Notion API 설정
NOTION_API_KEY = "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"
DATABASE_ID = "1c69083e0adb80a393ccf2e394050dc8"
NOTION_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1/pages"

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
    # 교수자인지 확인
    is_instructor = Instructor.objects.filter(instructor_id=request.user.username).exists()
    if not is_instructor:
        return redirect("mainpage:index")  # 학생이면 대시보드로 리디렉션
    
    rounds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    return render(request, 'instructor/instructor.html', {"rounds": rounds})

@login_required
def documents_view(request):
    student_id = request.user.username

    teams = Team.objects.filter(
        Q(leader_id=student_id) |
        Q(mate1_id=student_id) |
        Q(mate2_id=student_id) |
        Q(mate3_id=student_id) |
        Q(mate4_id=student_id)
    )

    selected_team_id = request.GET.get("team")
    selected_team = None
    iframe_url = None

    if selected_team_id:
        selected_team = teams.filter(team_id=selected_team_id).first()
    if not selected_team and teams.exists():
        selected_team = teams.first()

    if selected_team:
        iframe_url = selected_team.notion_url  # DB에 저장된 Notion 링크를 직접 참조

    return render(request, "mainpage/documents.html", {
        "teams": teams,
        "selected_team": selected_team,
        "iframe_url": iframe_url,
    })

def create_notion_page(team_name):
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }

    body = {
        "parent": {
            "type": "page_id",  # or "database_id" if you're using a database
            "page_id": DATABASE_ID
        },
        "properties": {
            "title": [
                {
                    "text": {
                        "content": f"{team_name} 공유 문서"
                    }
                }
            ]
        }
    }

    response = requests.post(NOTION_BASE_URL, headers=headers, json=body)
    if response.status_code == 200:
        return response.json()["url"]
    else:
        print(f"[실패] {team_name}: {response.status_code} - {response.text}")
        return None