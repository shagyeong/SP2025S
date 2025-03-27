from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'mainpage/index.html')

def student_view(request):
    return render(request, 'mainpage/student.html')

def documents_view(request):
    return render(request, 'mainpage/documents.html')

def notion_view(request):
    return render(request, 'mainpage/notion.html')