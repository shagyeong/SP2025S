from django.urls import path
from .views import InstructorCreateView, InstructorDetailView, InstructorUpdateView,InstructorTeamView
app_name = 'instructor'

urlpatterns = [
    path('instructors/', InstructorCreateView.as_view()),
    path('instructors/<str:instructor_id>/', InstructorDetailView.as_view()),
    path('instructors/<str:instructor_id>/edit/', InstructorUpdateView.as_view()),
    path('instructors/teams/', InstructorTeamView.as_view(), name='instructor-teams'),
]
