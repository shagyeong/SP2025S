from django.shortcuts import render
from django.http import HttpResponse

def chat_view(request):
    return HttpResponse("채팅 기능은 현재 비활성화되어 있습니다.")