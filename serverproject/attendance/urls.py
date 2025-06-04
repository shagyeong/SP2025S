from django.urls import path
from . import views
from .views import AttendanceListCreateView, AttendanceByTeamView, AttendanceByRoundView, AttendanceSummaryView, AllTeamsAttendanceByRoundView, attendance_view, instructor_attendance, team_attendance

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_view, name='attendance'),
    path("instructor/attendance/", views.instructor_attendance, name="instructor_attendance"),
    path("instructor/detail/", views.team_attendance, name="attendance-detail"),
    
    path('att/', AttendanceListCreateView.as_view(), name='attendance-create'),
    path('att/<str:team_id>/', AttendanceByTeamView.as_view(), name='attendance-by-team'),
    path('att/<str:team_id>/round/', AttendanceByRoundView.as_view(), name='attendance-by-round'),
    path('att/summary/<str:team_id>/', AttendanceSummaryView.as_view(), name='attendance-summary-by-team'),
    path('att/all_by_round/', views.AllTeamsAttendanceByRoundView.as_view(), name='all-teams-attendance-by-round'),
]
