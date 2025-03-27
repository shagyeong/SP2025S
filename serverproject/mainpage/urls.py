from django.urls import path
from . import views

app_name = 'mainpage'

urlpatterns = [
    path('', views.index, name='index'),  # 메인 대시보드
    path('student/', views.student_view, name='student'),
    path('documents/', views.documents_view, name='documents'),
    path('notion/', views.notion_view, name='notion'),  # 필요 시
]
