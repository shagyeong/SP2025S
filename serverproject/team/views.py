import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Team
from .serializers import TeamSerializer
from .models import Student

class TeamCreateView(APIView):
    def post(self, request):
        try:
            data = request.data

            # leader_id가 제공되지 않으면 에러 반환
            leader_id = data.get("leader_id")
            if not leader_id:
                return Response({"error": "leader_id is required"}, status=400)

            # Student 테이블에서 leader_id 조회
            try:
                leader = Student.objects.get(student_id=leader_id)
            except Student.DoesNotExist:
                return Response({"error": "Leader not found"}, status=400)

            # 팀 생성
            notion_url = create_notion_page(data.get("team_name"))
            team = Team.objects.create(
                team_id=str(uuid.uuid4())[:15],  # team_id를 UUID로 생성 (또는 다른 방식 사용 가능)
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
    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)
    
    def team_view(request):
        return render(request, 'team/team.html')
