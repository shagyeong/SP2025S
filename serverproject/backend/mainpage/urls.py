from django.contrib import admin
from django.urls import path
from mainpage import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),  # 대시보드 페이지
    path('attendance/', views.attendance, name='attendance'),  # 출결 페이지
    path('reservation/', views.reservation, name='reservation'),  # 장소 예약 페이지
]