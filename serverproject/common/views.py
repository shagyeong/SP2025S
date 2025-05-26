from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from common.forms import UserForm
from django.contrib.auth.decorators import login_required
from instructor.models import Instructor
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.forms import AuthenticationForm


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        user_type = request.POST.get("user_type", "student")  # 기본은 student

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            username = user.username

            # 사용자가 교수자인데 교수자로 선택했을 경우만 instructor 페이지로
            if user_type == "instructor" and Instructor.objects.filter(instructor_id=username).exists():
                return redirect(reverse('instructor:instructor_view'))
            # 잘못된 경우에도 fallback
            return redirect(reverse('mainpage:index'))

    else:
        form = AuthenticationForm()
    return render(request, 'common/login.html', {'form': form})

def logout_view(request):
    logout(request)
    request.session.flush()
    return redirect('/')

def signup(request):
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)  # 사용자 인증
            login(request, user)  # 로그인
            return redirect('/')
    else:
        form = UserForm()
    return render(request, 'common/signup.html', {'form': form})

@login_required
def mypage(request):
    if request.session.get('is_instructor', False):
        return redirect('instructor:instructor_view')  # 또는 교수자용 마이페이지
    return render(request, 'common/mypage.html')  # 학생 마이페이지

def instructor_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.session.get('is_instructor', False):
            return redirect('common:login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view