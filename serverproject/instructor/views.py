from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Instructor
from team.models import Team
from .serializers import InstructorSerializer
from django.contrib.auth.decorators import login_required

@login_required
def instructor_view(request):
    return render(request, 'instructor/instructor.html')

# 교수자 생성
class InstructorCreateView(APIView):
    def post(self, request):
        serializer = InstructorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 특정 교수자 조회
class InstructorDetailView(APIView):
    def get(self, request, instructor_id):
        instructor = get_object_or_404(Instructor, instructor_id=instructor_id)
        serializer = InstructorSerializer(instructor)
        return Response(serializer.data)

# 교수자 정보 수정
class InstructorUpdateView(APIView):
    def put(self, request, instructor_id):
        instructor = get_object_or_404(Instructor, instructor_id=instructor_id)
        serializer = InstructorSerializer(instructor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorTeamView(APIView):
    def get(self, request, instructor_id):
        try:
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            teams = Team.objects.filter(instructor=instructor)
            data = [
                {
                    "team_id": team.team_id,
                    "team_name": team.team_name,
                    "members": [member.student_id for member in team.members.all()],
                }
                for team in teams
            ]
            return Response({"teams": data}, status=200)
        except Instructor.DoesNotExist:
            return Response({"error": "Instructor not found"}, status=404)