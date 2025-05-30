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
    path('attendance/', include('attendance.urls', namespace='attendance')),
    path('api/attendance/', include('attendance.urls')),
    path('chat/', include('chat.urls', namespace='chat')),
    path('reservation/', include('reservation.urls', namespace='reservation')),
    path('team/', include('team.urls', namespace='team')),
    path('api/', include('team.urls')),
    path('instructor/', include('instructor.urls', namespace='instructor')),
    path('common/',include('common.urls')),
    #path('team/api/', include('team.urls')),
]
