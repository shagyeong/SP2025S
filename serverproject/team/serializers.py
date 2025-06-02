# serverproject/team/serializers.py
from rest_framework import serializers
from .models import Team, Student # Student 모델을 직접 import

class TeamSerializer(serializers.ModelSerializer):
    leader_id = serializers.CharField(source='leader.student_id', read_only=True, allow_null=True)
    leader_name = serializers.CharField(source='leader.name', read_only=True, allow_null=True)

    mate1_name = serializers.SerializerMethodField(read_only=True)
    mate2_name = serializers.SerializerMethodField(read_only=True)
    mate3_name = serializers.SerializerMethodField(read_only=True)
    mate4_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'team_id', 'team_name',
            'leader_id', 'leader_name', # leader 관련 필드
            'mate1_id', 'mate1_name',   # mate1_id는 모델 필드, mate1_name은 SerializerMethodField로 생성
            'mate2_id', 'mate2_name',
            'mate3_id', 'mate3_name',
            'mate4_id', 'mate4_name',
            'notion_url'                # notion_url도 포함
        ]
        
        read_only_fields = ['team_id', 'leader_name', 'mate1_name', 'mate2_name', 'mate3_name', 'mate4_name']


    # 학생 이름을 가져오는 헬퍼 메소드 (attendance/views.py의 get_student_name_by_id와 유사)
    def _get_student_name_by_id(self, student_id):
        if not student_id: # student_id가 None이거나 빈 문자열이면 None 반환
            return None
        try:
            student = Student.objects.get(student_id=student_id)
            return student.name
        except Student.DoesNotExist:
            return None # 해당 ID의 학생이 없으면 None 반환
        except Exception as e:
            # print(f"Error fetching student name for ID {student_id}: {e}") # 디버깅용
            return None

    # 각 mateX_name 필드에 대한 값을 반환하는 메소드들
    def get_mate1_name(self, obj): # obj는 현재 직렬화 중인 Team 인스턴스
        return self._get_student_name_by_id(obj.mate1_id)

    def get_mate2_name(self, obj):
        return self._get_student_name_by_id(obj.mate2_id)

    def get_mate3_name(self, obj):
        return self._get_student_name_by_id(obj.mate3_id)

    def get_mate4_name(self, obj):
        return self._get_student_name_by_id(obj.mate4_id)