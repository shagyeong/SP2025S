from django.urls import path
from .views import StudentListView

app_name = 'student'

urlpatterns = [
    path('students/', StudentListView.as_view(), name='student-list'), # ★★★ 새로운 URL 패턴 추가 ★★★
]