from django.urls import path
from . import views
from .views import InstructorCreateView, InstructorDetailView, InstructorUpdateView, InstructorTeamView, ProfessorTeamsView

app_name = 'instructor'

urlpatterns = [
    path('', views.instructor_view, name='instructor_view'),
    path('instructors/', InstructorCreateView.as_view()),
    path('instructors/<str:instructor_id>/', InstructorDetailView.as_view()),
    path('instructors/<str:instructor_id>/edit/', InstructorUpdateView.as_view()),
    path('instructors/teams/', InstructorTeamView.as_view(), name='instructor-teams'),
    path('my_sections_teams/', ProfessorTeamsView.as_view(), name='my-sections-teams'),
]
