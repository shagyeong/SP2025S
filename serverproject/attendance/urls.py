from django.urls import path
from . import views
from .views import AttendanceListCreateView, AttendanceByTeamView, AttendanceByRoundView, attendance_view, instructor_attendance, team_attendance

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_view, name='attendance'),
    path("instructor/attendance/", views.instructor_attendance, name="instructor_attendance"),
    path("instructor/detail/", views.team_attendance, name="attendance-detail"),
    
    path('', AttendanceListCreateView.as_view(), name='attendance-create'),
    path('<str:team_id>/', AttendanceByTeamView.as_view(), name='attendance-by-team'),
    path('<str:team_id>/round/', AttendanceByRoundView.as_view(), name='attendance-by-round'),
]
