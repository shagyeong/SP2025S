from django.shortcuts import render

def attendance_view(request):
    return render(request, 'attendance/attendance.html')

def instructor_attendance(request):
    return render(request, 'attendance/instructor_attendance.html')