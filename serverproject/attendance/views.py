from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Attendance
from .serializers import AttendanceSerializer
from django.contrib.auth.decorators import login_required
from team.models import Team
from team.models import Student

def get_student_name_by_id(student_id):
    try:
        student = Student.objects.get(student_id=student_id)
        return student.name
    except Student.DoesNotExist:
        return None

class AttendanceListCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            attendance = serializer.save()

            team_id = attendance.team_id
            team = Team.objects.select_related('leader').get(team_id=team_id)

            leader_name = get_student_name_by_id(team.leader.student_id) if team.leader else None
            mate1_name = get_student_name_by_id(team.mate1_id)
            mate2_name = get_student_name_by_id(team.mate2_id)
            mate3_name = get_student_name_by_id(team.mate3_id)
            mate4_name = get_student_name_by_id(team.mate4_id)


            return Response({
                "message": "출석 등록 완료",
                "team_id": attendance.team_id,
                "round": attendance.round,
                "at_leader": attendance.at_leader,
                "at_mate1": attendance.at_mate1,
                "at_mate2": attendance.at_mate2,
                "at_mate3": attendance.at_mate3,
                "at_mate4": attendance.at_mate4,
                "leader_name": leader_name,
                "mate1_name": mate1_name,
                "mate2_name": mate2_name,
                "mate3_name": mate3_name,
                "mate4_name": mate4_name,
            }, status=201)
        else:
            return Response(serializer.errors, status=400)

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
    
    def get(self, request, team_id):
        round_number = request.query_params.get('round')
        if not round_number:
            return Response({"error": "Missing 'round' parameter"}, status=status.HTTP_400_BAD_REQUEST)

        round_number = round_number.zfill(2)
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round_number)
        serializer = AttendanceSerializer(attendance)

        # 팀 정보 가져오기
        team = get_object_or_404(Team, team_id=team_id)
        team_info = {
            "leader_id": team.leader_id,
            "mate1_id": team.mate1_id,
            "mate2_id": team.mate2_id,
            "mate3_id": team.mate3_id,
            "mate4_id": team.mate4_id,
        }

        return Response({
            **serializer.data,
            "team": team_info  # 프론트에서 team.mate1_id 등으로 접근할 수 있도록
        })


    def put(self, request, team_id):
        round_number = request.query_params.get('round')
        if not round_number:
            return Response({"error": "Missing 'round' parameter"}, status=status.HTTP_400_BAD_REQUEST)
        
        round_number = round_number.zfill(2)  # 1 → '01', 2 → '02' 형식으로 보정
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round_number)
        serializer = AttendanceSerializer(attendance, data=request.data)
        

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# def attendance_view(request):
#     return render(request, 'attendance/attendance.html')

@login_required
def attendance_view(request):
    student_id = request.user.username

    # 학생이 속한 모든 팀 필터링 (Q 객체 이용해도 좋지만 여기선 단순히 union)
    team_list = Team.objects.filter(leader_id=student_id) | \
                Team.objects.filter(mate1_id=student_id) | \
                Team.objects.filter(mate2_id=student_id) | \
                Team.objects.filter(mate3_id=student_id) | \
                Team.objects.filter(mate4_id=student_id)

    # 쿼리 스트링으로 선택된 팀 받기
    selected_team_id = request.GET.get("team")
    selected_team = team_list.filter(team_id=selected_team_id).first() if selected_team_id else team_list.first()

    return render(request, 'attendance/attendance.html', {
        "teams": team_list,
        "selected_team": selected_team,
    })
def instructor_attendance(request):
    return render(request, 'attendance/instructor_attendance.html')

def team_attendance(request):
    rounds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    return render(request, 'attendance/team_attendance.html', {"rounds": rounds})
