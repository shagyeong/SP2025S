from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceListCreateView(APIView):
    """POST /attendance  (출결 기록 추가)"""
    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AttendanceByTeamView(APIView):
    """GET /attendance/{team_id}  (특정 팀의 출결 조회)"""
    def get(self, request, team_id):
        attendance_records = Attendance.objects.filter(team_id=team_id)
        if not attendance_records.exists():
            return Response({"error": "No attendance records found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)

class AttendanceByRoundView(APIView):
    """GET /attendance/{team_id}/{round} 조회 & PUT 수정"""
    
    def get(self, request, team_id, round):
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round)
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)

    def put(self, request, team_id, round):
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round)
        serializer = AttendanceSerializer(attendance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



def attendance_view(request):
    return render(request, 'attendance/attendance.html')

def instructor_attendance(request):
    return render(request, 'attendance/instructor_attendance.html')
