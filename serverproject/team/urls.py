from django.urls import path
from .views import TeamCreateView, TeamDetailView, TeamListView, MyTeamListView

app_name = 'team'

urlpatterns = [
    path('teams', TeamCreateView.as_view(), name='team-list-create'),
    path('teams/<str:team_id>', TeamDetailView.as_view(), name='team-detail'),
    path('team_list/', TeamListView.as_view(), name='team-list'), # 모든 팀 목록 (교수자용)
    path('my_teams/', MyTeamListView.as_view(), name='my-team-list'), # 로그인한 학생의 팀 목록
]

