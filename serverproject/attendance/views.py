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
from rest_framework.permissions import IsAuthenticated
from .serializers import AttendanceSerializer

# serverproject/attendance/views.py - AllTeamsAttendanceByRoundView 부분
class AllTeamsAttendanceByRoundView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # print("--- AllTeamsAttendanceByRoundView GET method CALLED ---") # 이 로그가 찍히는지 Django 서버 콘솔에서 확인
        round_number = request.query_params.get('round')
        if not round_number:
            return Response({"error": "Missing 'round' query parameter"}, status=status.HTTP_400_BAD_REQUEST)

        round_number_str = str(round_number).zfill(2)
        all_teams = Team.objects.all().order_by('team_name')

        if not all_teams.exists():
             # 팀이 아예 없으면 200 OK와 함께 메시지 반환 (404 아님)
             return Response({"message": "등록된 팀이 없습니다."}, status=status.HTTP_200_OK)

        attendance_data_for_round = []
        # has_any_attendance_for_round = False # 이 플래그는 현재 사용되지 않음

        for team in all_teams:
            team_info = {
                # ... (팀 정보 및 기본 출결 상태 '-' 구성) ...
                "team_id": team.team_id,
                "team_name": team.team_name,
                "leader_id": team.leader.student_id if team.leader else None,
                "leader_name": team.leader.name if team.leader else None,
                "mate1_id": team.mate1_id, "mate1_name": get_student_name_by_id(team.mate1_id),
                "mate2_id": team.mate2_id, "mate2_name": get_student_name_by_id(team.mate2_id),
                "mate3_id": team.mate3_id, "mate3_name": get_student_name_by_id(team.mate3_id),
                "mate4_id": team.mate4_id, "mate4_name": get_student_name_by_id(team.mate4_id),
                "attendance_status": { "at_leader": "-", "at_mate1": "-", "at_mate2": "-", "at_mate3": "-", "at_mate4": "-" }
            }
            try:
                attendance_record = Attendance.objects.get(team_id=team.team_id, round=round_number_str)
                # ... (출결 상태 업데이트) ...
                team_info["attendance_status"]["at_leader"] = attendance_record.at_leader
                team_info["attendance_status"]["at_mate1"] = attendance_record.at_mate1
                team_info["attendance_status"]["at_mate2"] = attendance_record.at_mate2
                team_info["attendance_status"]["at_mate3"] = attendance_record.at_mate3
                team_info["attendance_status"]["at_mate4"] = attendance_record.at_mate4
                # has_any_attendance_for_round = True
            except Attendance.DoesNotExist:
                pass
            attendance_data_for_round.append(team_info)
        
        # 이전에 있던 if not attendance_data_for_round: 조건은 위에서 if not all_teams.exists(): 로 처리됨.
        # attendance_data_for_round는 all_teams가 존재하면 항상 채워짐 (출결 기록이 없더라도 팀 정보는 포함)

        return Response(attendance_data_for_round, status=status.HTTP_200_OK) # 항상 200 OK와 함께 데이터를 반환해야 함
    
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
            # 해당 team_id와 round로 기존 출석 기록을 가져옴
            instance = Attendance.objects.get(team_id=team_id, round=round_number)
            serializer = AttendanceSerializer(instance, data=request.data, partial=True)
            action_message = "출석 수정 완료"
            response_status = status.HTTP_200_OK
        except Attendance.DoesNotExist:
            # 존재하지 않으면, 새로 생성
            serializer = AttendanceSerializer(data=request.data)
            action_message = "출석 등록 완료"
            response_status = status.HTTP_201_CREATED
        except Exception as e: # 기타 예외 처리
            return Response({"error": f"An unexpected error occurred: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if serializer.is_valid():
            attendance = serializer.save()

            # 팀원 이름 정보 가져오기
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
    """GET /api/attendance/att/<team_id>/round/?round=<round> 조회 & PUT 수정"""
    permission_classes = [IsAuthenticated] # 교수자 등 권한 확인

    def get(self, request, team_id):
        round_number = request.query_params.get('round')
        if not round_number:
            return Response({"error": "Missing 'round' parameter"}, status=status.HTTP_400_BAD_REQUEST)

        round_number_str = str(round_number).zfill(2) # "1" -> "01"

        # 출석 기록 가져오기
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round_number_str)
        attendance_serializer_data = AttendanceSerializer(attendance).data # 출결 상태 (at_leader 등)

        # 팀 정보 및 팀원 이름 정보 가져오기
        team = get_object_or_404(Team.objects.select_related('leader'), team_id=team_id) # leader 정보 미리 가져오기

        team_members_info = {
            "leader_id": team.leader.student_id if team.leader else None,
            "leader_name": team.leader.name if team.leader else None, # Student 모델에 'name' 필드 가정
            "mate1_id": team.mate1_id,
            "mate1_name": get_student_name_by_id(team.mate1_id),
            "mate2_id": team.mate2_id,
            "mate2_name": get_student_name_by_id(team.mate2_id),
            "mate3_id": team.mate3_id,
            "mate3_name": get_student_name_by_id(team.mate3_id),
            "mate4_id": team.mate4_id,
            "mate4_name": get_student_name_by_id(team.mate4_id),
        }

        # 최종 응답 데이터 구성
        response_data = {
            **attendance_serializer_data, # team_id, round, at_leader, at_mate1, ...
            "team_members": team_members_info # team_id 대신 team_members 객체로 팀원 정보 전달
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def put(self, request, team_id):
        # ... (PUT 로직은 이전과 동일하게 유지) ...
        round_number = request.query_params.get('round')
        if not round_number:
            return Response({"error": "Missing 'round' parameter"}, status=status.HTTP_400_BAD_REQUEST)
        
        round_number_str = str(round_number).zfill(2)
        attendance = get_object_or_404(Attendance, team_id=team_id, round=round_number_str)
        serializer = AttendanceSerializer(attendance, data=request.data, partial=True) # partial=True 추가
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@login_required
def attendance_view(request):
    student_id = request.user.username

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

from django.db.models import Count, Case, When, IntegerField
from rest_framework.permissions import IsAuthenticated

class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated] # 로그인한 사용자만 접근 가능

    def get(self, request, team_id):
        user_student_id = request.user.username
        user_student_name = get_student_name_by_id(user_student_id)

        if not user_student_name: # 학생 이름을 찾을 수 없는 경우 
            return Response({"error": f"Student record not found for ID: {user_student_id}"},
                            status=status.HTTP_404_NOT_FOUND)

        try:
            team = Team.objects.get(team_id=team_id)
        except Team.DoesNotExist:
            return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)

        user_attendance_field_key = None
        if team.leader and team.leader.student_id == user_student_id:
            user_attendance_field_key = 'at_leader'
        elif team.mate1_id == user_student_id:
            user_attendance_field_key = 'at_mate1'
        # ... (mate2, mate3, mate4에 대한 elif 계속) ...
        elif team.mate2_id == user_student_id: # 추가
            user_attendance_field_key = 'at_mate2'
        elif team.mate3_id == user_student_id: # 추가
            user_attendance_field_key = 'at_mate3'
        elif team.mate4_id == user_student_id: # 추가
            user_attendance_field_key = 'at_mate4'


        if not user_attendance_field_key:
            return Response({"message": f"'{user_student_name}'님은 현재 '{team.team_name}' 팀의 멤버가 아닙니다."},
                            status=status.HTTP_200_OK)

        present_count_kwargs = {f"{user_attendance_field_key}__iexact": 'O'}
        present_count = Attendance.objects.filter(team_id=team_id, **present_count_kwargs).count()

        absent_count_kwargs = {f"{user_attendance_field_key}__iexact": 'X'}
        absent_count = Attendance.objects.filter(team_id=team_id, **absent_count_kwargs).count()

        total_records_for_member = Attendance.objects.filter(team_id=team_id).count()

        summary_data = {
            "team_id": team_id,
            "team_name": team.team_name,
            "user_student_id": user_student_id,
            "user_student_name": user_student_name, 
            "present_count": present_count,
            "absent_count": absent_count,
            "total_sessions_for_member": total_records_for_member,
            "message": f"'{team.team_name}' 팀에서 '{user_student_name}'님의 출석: {present_count}회, 결석: {absent_count}회 (총 {total_records_for_member}회차 중)"
        }
        
        if total_records_for_member == 0 :
             return Response({"message": f"'{team.team_name}' 팀의 출결 기록이 아직 없습니다."}, status=status.HTTP_200_OK)


        return Response(summary_data, status=status.HTTP_200_OK)