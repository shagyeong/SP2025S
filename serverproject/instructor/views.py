
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Instructor
from team.models import Team
from .serializers import InstructorSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from team.serializers import TeamSerializer
from .models import Section
from instructor.models import Teaches
from django.db.models import Q

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
        
class ProfessorTeamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        teams_to_serialize = Team.objects.none()

        try:
            instructor = Instructor.objects.get(instructor_id=user.username)
            print(f"\n[ProfessorTeamsView] --- Request from user: {user.username} ---")
            print(f"[ProfessorTeamsView] Found instructor object: {instructor}")

            taught_section_keys = Teaches.objects.filter(instructor=instructor).values(
                'section_obj_id', 
                'section_obj_year',
                'section_obj_semester' 
            ).distinct()

            print(f"[ProfessorTeamsView] Taught section keys from Teaches table: {list(taught_section_keys)}")

            if not taught_section_keys:
                print(f"[ProfessorTeamsView] No taught sections found for instructor {instructor.instructor_id}.")
                return Response([], status=status.HTTP_200_OK)

            team_filter_query = Q()
            for sec_keys in taught_section_keys:
                s_id = sec_keys.get('section_obj_id')
                s_year = sec_keys.get('section_obj_year')
                s_semester = sec_keys.get('section_obj_semester')

                if not (s_id and s_year and s_semester):
                    print(f"[ProfessorTeamsView] Warning: Missing key in sec_keys: {sec_keys}")
                    continue

                team_id_prefix_pattern = f"{s_id}{s_year}{s_semester}-"
                print(f"[ProfessorTeamsView] Constructed team_id_prefix_pattern: '{team_id_prefix_pattern}'")
                team_filter_query |= Q(team_id__startswith=team_id_prefix_pattern)
            
            if team_filter_query:
                teams_to_serialize = Team.objects.filter(team_filter_query).order_by('team_name')
                print(f"[ProfessorTeamsView] Teams found after filtering: {teams_to_serialize.count()}")
            else:
                print(f"[ProfessorTeamsView] No team filter query was built.")

        except Instructor.DoesNotExist:
            print(f"[ProfessorTeamsView] User {user.username} is not an instructor.")
            return Response({"error": "교수자 정보를 찾을 수 없습니다."}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            print(f"[ProfessorTeamsView] An unexpected error occurred: {e}")
            # return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = TeamSerializer(teams_to_serialize, many=True)
        return Response(serializer.data)