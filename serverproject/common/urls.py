from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'common'

urlpatterns = [
    # path('login/', auth_views.LoginView.as_view(template_name='common/login.html'), name='login'),
    path("login/", views.login_view, name="login"),
    path('logout/',views.logout_view,name='logout'),
    path('signup/',views.signup,name='signup'),
    path('mypage/',views.mypage,name='mypage'),

    path('password_change/', auth_views.PasswordChangeView.as_view(
        template_name='common/password_change.html',
        success_url='/common/password_change_done/'
    ), name='password_change'),

    path('password_change_done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='common/password_change_done.html'
    ), name='password_change_done'),
]