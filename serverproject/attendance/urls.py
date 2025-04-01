from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_view, name='attendance'),
    path("instructor/attendance/", views.instructor_attendance, name="instructor_attendance"),
]