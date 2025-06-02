# serverproject/team/serializers.py
from rest_framework import serializers
from .models import Team, Student # Student 모델을 직접 import

class TeamSerializer(serializers.ModelSerializer):
    # leader는 ForeignKey이므로 source를 사용할 수 있습니다.
    leader_id = serializers.CharField(source='leader.student_id', read_only=True, allow_null=True)
    leader_name = serializers.CharField(source='leader.name', read_only=True, allow_null=True)

    # mateX_id 필드들은 모델에 CharField로 정의되어 있으므로,
    # mateX_name을 가져오기 위해 SerializerMethodField를 사용합니다.
    # 모델에 있는 mateX_id 필드 자체는 fields 리스트에 명시적으로 포함시켜야 클라이언트가 ID도 받을 수 있습니다.
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
        # read_only_fields를 사용하면 PUT/POST 시 해당 필드를 입력받지 않도록 할 수 있습니다.
        # team_id는 보통 자동 생성되거나 고유해야 하므로 read_only로 두는 것이 좋습니다.
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
        except Exception as e: # 기타 예외 발생 시 (로깅 등을 추가할 수 있음)
            # print(f"Error fetching student name for ID {student_id}: {e}") # 디버깅용
            return None

    # 각 mateX_name 필드에 대한 값을 반환하는 메소드들
    # 메소드 이름은 'get_<필드명>' 규칙을 따릅니다.
    def get_mate1_name(self, obj): # obj는 현재 직렬화 중인 Team 인스턴스
        return self._get_student_name_by_id(obj.mate1_id)

    def get_mate2_name(self, obj):
        return self._get_student_name_by_id(obj.mate2_id)

    def get_mate3_name(self, obj):
        return self._get_student_name_by_id(obj.mate3_id)

    def get_mate4_name(self, obj):
        return self._get_student_name_by_id(obj.mate4_id)