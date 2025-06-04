from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Student
from student.serializers import StudentSerializer
from rest_framework.permissions import IsAuthenticated # 필요에 따라 권한 설정

class StudentListView(APIView):
    permission_classes = [IsAuthenticated] # 로그인한 사용자만 접근 가능

    def get(self, request):
        students = Student.objects.all().order_by('student_id') # 모든 학생 목록, 학번 순 정렬
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)