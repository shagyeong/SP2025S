from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, Django!")

# 대시보드 페이지
def index(request):
    return render(request, 'index.html')

# 출결 확인 페이지
def attendance(request):
    return render(request, 'attendance.html')

# 장소 예약 페이지
def reservation(request):
    return render(request, 'reservation.html')