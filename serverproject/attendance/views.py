from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Attendance
from .serializers import AttendanceSerializer
from django.contrib.auth.decorators import login_required
from team.models import Team, Student
from django.db.models import Q
import json

def get_student_name_by_id(student_id):
    try:
        student = Student.objects.get(student_id=student_id)
        return student.name
    except Student.DoesNotExist:
        return None
    except Exception:
        return None

class AttendanceListCreateView(APIView):
    def post(self, request, *args, **kwargs):
        # 요청 데이터에서 team_id와 round를 가져옵니다.
        team_id = request.data.get('team_id')
        round_number = request.data.get('round')

        # team_id나 round가 요청 데이터에 없으면 오류 응답
        if not team_id or not round_number:
            return Response({"error": "team_id and round are required in the request data."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # 해당 team_id와 round로 기존 출석 기록을 가져옵니다.
            instance = Attendance.objects.get(team_id=team_id, round=round_number)
            # 이미 존재하면, 이 인스턴스를 업데이트합니다.
            # partial=True를 사용하면 모든 필드를 제공하지 않아도 부분 업데이트가 가능합니다.
            serializer = AttendanceSerializer(instance, data=request.data, partial=True)
            action_message = "출석 수정 완료"
            response_status = status.HTTP_200_OK
        except Attendance.DoesNotExist:
            # 존재하지 않으면, 새로 생성합니다.
            serializer = AttendanceSerializer(data=request.data)
            action_message = "출석 등록 완료"
            response_status = status.HTTP_201_CREATED
        except Exception as e: # 기타 예외 처리
            return Response({"error": f"An unexpected error occurred: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if serializer.is_valid():
            attendance = serializer.save()

            # 팀원 이름 정보 가져오기 (이 부분은 응답에 포함시키기 위함)
            try:
                team = Team.objects.select_related('leader').get(team_id=attendance.team_id)
                leader_name = get_student_name_by_id(team.leader.student_id) if team.leader else None
                mate1_name = get_student_name_by_id(team.mate1_id)
                mate2_name = get_student_name_by_id(team.mate2_id)
                mate3_name = get_student_name_by_id(team.mate3_id)
                mate4_name = get_student_name_by_id(team.mate4_id)
            except Team.DoesNotExist: # 혹시 모를 Team 조회 실패에 대한 처리
                return Response({"error": "Team not found when fetching member names."},
                                status=status.HTTP_404_NOT_FOUND)


            return Response({
                "message": action_message,
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
            }, status=response_status)
        else:
            # 시리얼라이저 유효성 검사 실패 시 오류 반환
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
    student_id = request.user.username # User 모델의 username을 student_id로 사용한다고 가정

    # 학생이 속한 팀 목록 가져오기
    team_list = Team.objects.filter(
        Q(leader__student_id=student_id) | # leader는 ForeignKey이므로 __student_id 사용
        Q(mate1_id=student_id) |
        Q(mate2_id=student_id) |
        Q(mate3_id=student_id) |
        Q(mate4_id=student_id)
    ).distinct()

    selected_team_id = request.GET.get("team")
    selected_team = None
    if selected_team_id:
        selected_team = team_list.filter(team_id=selected_team_id).first()
    elif team_list.exists(): # 선택된 팀이 없고, 참여 중인 팀이 있다면 첫 번째 팀을 기본 선택
        selected_team = team_list.first()

    team_members_for_js = []
    if selected_team:
        member_fields_mapping = [
            {'id_field': 'leader_id', 'db_field_name': 'leader', 'attendance_key': 'at_leader'}, # ForeignKey 필드명 사용
            {'id_field': 'mate1_id', 'db_field_name': 'mate1_id', 'attendance_key': 'at_mate1'},
            {'id_field': 'mate2_id', 'db_field_name': 'mate2_id', 'attendance_key': 'at_mate2'},
            {'id_field': 'mate3_id', 'db_field_name': 'mate3_id', 'attendance_key': 'at_mate3'},
            {'id_field': 'mate4_id', 'db_field_name': 'mate4_id', 'attendance_key': 'at_mate4'},
        ]
        for mapping in member_fields_mapping:
            student_id_val = None
            if mapping['id_field'] == 'leader_id' and selected_team.leader:
                student_id_val = selected_team.leader.student_id
            elif mapping['id_field'] != 'leader_id':
                student_id_val = getattr(selected_team, mapping['db_field_name'], None)

            if student_id_val:
                student_name = get_student_name_by_id(student_id_val)
                if student_name:
                    team_members_for_js.append({
                        "id": student_id_val,
                        "name": student_name,
                        "attendance_key": mapping['attendance_key']
                    })

    # 선택 가능한 전체 회차 목록
    available_rounds = [{"number": str(i).zfill(2), "displayName": f"{i}회차"} for i in range(1, 11)]

    # URL 쿼리에서 선택된 회차 가져오기, 없으면 첫 번째 회차를 기본값으로
    selected_round_number = request.GET.get("round")
    if not selected_round_number and available_rounds:
        selected_round_number = available_rounds[0]['number']
    elif not available_rounds: # 선택 가능 회차가 아예 없는 극단적 경우
         selected_round_number = "01"


    current_round_info = next((r for r in available_rounds if r['number'] == selected_round_number),
                              available_rounds[0] if available_rounds else {"number": "01", "displayName": "1회차"})

    context = {
        "teams": team_list,
        "selected_team": selected_team, # 객체 자체를 전달
        "team_members_json": json.dumps(team_members_for_js),
        "current_round_info_json": json.dumps(current_round_info),
        "available_rounds_json": json.dumps(available_rounds),
        # selected_team_id_json은 selected_team 객체가 있으므로 템플릿에서 직접 접근 가능
    }
    return render(request, 'attendance/attendance.html', context)

def instructor_attendance(request):
    return render(request, 'attendance/instructor_attendance.html')

def team_attendance(request):
    rounds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    return render(request, 'attendance/team_attendance.html', {"rounds": rounds})
