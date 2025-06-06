"""
URL configuration for serverproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', include('mainpage.urls')),
# ]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mainpage.urls', namespace='mainpage')),
    path('attendance/', include('attendance.urls', namespace='attendance_pages')), # 일반 페이지용
    path('api/attendance/', include('attendance.urls', namespace='attendance_api')), # API용
    path('team/', include('team.urls', namespace='team_pages')),                   # 일반 페이지용
    path('api/', include('team.urls', namespace='team_api')),                      # API용
    path('instructor/', include('instructor.urls', namespace='instructor')),
    path('common/',include('common.urls')),
    path('api/', include('student.urls', namespace='student_api')),
]