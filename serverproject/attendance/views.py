from django.shortcuts import render

def attendance_view(request):
    return render(request, 'attendance/attendance.html')
