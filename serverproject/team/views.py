import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Team
from .serializers import TeamSerializer
from .models import Student
from mainpage.views import create_notion_page
from instructor.models import Instructor
from django.contrib.auth.decorators import login_required # 함수 기반 뷰용
from rest_framework.permissions import IsAuthenticated # 클래스 기반 뷰용
from django.db.models import Q # Q 객체 사용
from instructor.models import Teaches # 교수자와 섹션 연결 모델
from instructor.models import Section # 섹션 모델 가져오기

class TeamCreateView(APIView):
    def post(self, request):
        try:
            data = request.data
            leader_id = data.get("leader_id")
            if not leader_id:
                return Response({"error": "leader_id is required"}, status=400)
            try:
                leader = Student.objects.get(student_id=leader_id)
            except Student.DoesNotExist:
                return Response({"error": "Leader not found"}, status=400)

            notion_url = create_notion_page(data.get("team_name"))
            team = Team.objects.create(
                team_id=str(uuid.uuid4())[:15],
                team_name=data.get("team_name"),
                leader=leader,
                mate1_id=data.get("mate1_id"),
                mate2_id=data.get("mate2_id"),
                mate3_id=data.get("mate3_id"),
                mate4_id=data.get("mate4_id"),
                notion_url=notion_url
            )
            return Response(TeamSerializer(team).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

            
class TeamDetailView(APIView):
    def get(self, request, team_id):
        team = get_object_or_404(Team, team_id=team_id)
        serializer = TeamSerializer(team)
        return Response(serializer.data)

    def put(self, request, team_id):
        team = get_object_or_404(Team, team_id=team_id)
        serializer = TeamSerializer(team, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "팀 정보가 수정되었습니다."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, team_id):
        team = get_object_or_404(Team, team_id=team_id)
        team.delete()
        return Response({"status": "success", "message": "팀이 삭제되었습니다."}, status=status.HTTP_204_NO_CONTENT)


class TeamListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        teams_to_serialize = Team.objects.none()
        try:
            instructor = Instructor.objects.get(instructor_id=user.username)
            print(f"[TeamListView] Found instructor: {instructor.instructor_name}")

            # 1. 교수가 가르치는 Section의 키 정보들을 가져옵니다.
            taught_sections_keys = Teaches.objects.filter(instructor=instructor).values(
                'section_id_val', # Teaches 모델의 필드명 사용
                'section_year_val',
                'semester_val'
                # 'class_val' # team_id 패턴에는 class 정보가 없으므로 생략
            ).distinct() # 중복된 섹션 키 조합 제거

            if not taught_sections_keys:
                print(f"[TeamListView] Instructor {instructor.instructor_name} teaches no sections.")
                return Response([], status=status.HTTP_200_OK)

            print(f"[TeamListView] Taught sections keys found: {len(taught_sections_keys)}")

            team_filter_query = Q()
            for sec_keys in taught_sections_keys:
                # Teaches 모델에서 가져온 키 값을 사용하여 team_id 패턴 생성
                team_id_prefix_pattern = f"{sec_keys['section_id_val']}{sec_keys['section_year_val']}{sec_keys['semester_val']}-"
                print(f"[TeamListView] Adding filter for team_id starts with: {team_id_prefix_pattern}")
                team_filter_query |= Q(team_id__startswith=team_id_prefix_pattern)
            
            if team_filter_query:
                teams_to_serialize = Team.objects.filter(team_filter_query).order_by('team_name')
                print(f"[TeamListView] Teams found after filtering: {teams_to_serialize.count()}")
            else:
                print(f"[TeamListView] No team filter query was built.")

        except Instructor.DoesNotExist:
            print(f"[TeamListView] User {user.username} is not an instructor. Returning empty list.")
        except Exception as e:
            print(f"[TeamListView] An unexpected error occurred: {e}")

        serializer = TeamSerializer(teams_to_serialize, many=True)
        return Response(serializer.data)

class TeamListView(APIView): # 이 View가 /api/team_list/ 에 연결됨
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        teams_to_serialize = Team.objects.none()

        try:
            instructor = Instructor.objects.get(instructor_id=user.username)
            print(f"[TeamListView] Authenticated as instructor: {instructor.instructor_name}")

            # 1. 교수가 가르치는 Section의 키 정보들을 Teaches 모델에서 직접 가져옵니다.
            # Teaches 모델 필드명: section_obj_id, section_obj_year, section_obj_semester
            taught_section_keys = Teaches.objects.filter(instructor=instructor).values(
                'section_obj_id',
                'section_obj_year',
                'section_obj_semester'
                # 'section_obj_class' # team_id 패턴에는 class 정보가 없으므로 일단 제외
            ).distinct() # 중복된 섹션 키 조합 제거

            if not taught_section_keys:
                print(f"[TeamListView] Instructor {instructor.instructor_name} teaches no sections. Returning empty list.")
                return Response([], status=status.HTTP_200_OK)

            print(f"[TeamListView] Taught section keys found for {instructor.instructor_name}: {len(taught_section_keys)}")

            team_filter_query = Q()
            for sec_keys in taught_section_keys:
                # Teaches 모델에서 가져온 키 값을 사용하여 team_id 패턴 생성
                # team_id 형식: 'SECTION_ID + SECTION_YEAR + SEMESTER + -팀번호'
                team_id_prefix_pattern = f"{sec_keys['section_obj_id']}{sec_keys['section_obj_year']}{sec_keys['section_obj_semester']}-"
                print(f"[TeamListView] Adding filter for team_id starts with: {team_id_prefix_pattern}")
                team_filter_query |= Q(team_id__startswith=team_id_prefix_pattern)
            
            if team_filter_query:
                teams_to_serialize = Team.objects.filter(team_filter_query).order_by('team_name')
                print(f"[TeamListView] Teams found after filtering for instructor: {teams_to_serialize.count()}")
            else:
                print(f"[TeamListView] No team filter query was built despite having taught sections.")

        except Instructor.DoesNotExist:
            print(f"[TeamListView] User {user.username} is not an instructor. Returning empty list for non-instructors.")
            # teams_to_serialize는 이미 Team.objects.none()
        
        except Exception as e:
            print(f"[TeamListView] An unexpected error occurred: {e}")
            # teams_to_serialize는 이미 Team.objects.none()

        serializer = TeamSerializer(teams_to_serialize, many=True)
        return Response(serializer.data)


class MyTeamListView(APIView):
    permission_classes = [IsAuthenticated] # 로그인한 사용자만 접근 가능하도록 설정

    def get(self, request):
        user = request.user # 현재 로그인한 사용자 객체
        student_id = user.username # User 모델의 username을 student_id로 사용한다고 가정

        my_teams = Team.objects.filter(
            Q(leader__student_id=student_id) | # leader는 ForeignKey이므로 leader.student_id로 접근
            Q(mate1_id=student_id) |
            Q(mate2_id=student_id) |
            Q(mate3_id=student_id) |
            Q(mate4_id=student_id)
        ).distinct() # 중복 제거

        if not my_teams.exists():
            return Response([], status=status.HTTP_200_OK) # 빈 리스트 반환

        serializer = TeamSerializer(my_teams, many=True)
        return Response(serializer.data)