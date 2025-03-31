from django.urls import path
from . import views

app_name = 'mainpage'

urlpatterns = [
    # 메인 페이지
    path('', views.index, name='index'),
    path('student/', views.student_view, name='student'),

    # 공유 문서 기능
    path('documents/', views.documents_view, name='documents'),
    path('documents/create/', views.create_notion_document, name='create_notion'),
    path('documents/update/<str:page_id>/', views.update_notion_document, name='update_notion'),
    path('documents/delete/<str:page_id>/', views.delete_notion_document, name='delete_notion'),
    path('documents/iframe/', views.documents_iframe, name='documents_iframe'),

    # Notion 관련 부가기능 (연결 상태 확인, 동기화 등)
    path('documents/sync/', views.notion_sync_status, name='notion_sync'),
    path('documents/status/', views.notion_status_check, name='notion_status'),
]
