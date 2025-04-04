from django.urls import path
from . import views
from .views import AttendanceListCreateView, AttendanceByTeamView, AttendanceByRoundView

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_view, name='attendance'),
    path("instructor/attendance/", views.instructor_attendance, name="instructor_attendance"),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-create'),
    path('attendance/<str:team_id>/', AttendanceByTeamView.as_view(), name='attendance-by-team'),
    path('attendance/<str:team_id>/<str:round>/', AttendanceByRoundView.as_view(), name='attendance-by-round'),
]
