from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True, allow_null=True)

    class Meta:
        model = Attendance
        fields = [
            'team_id',
            'round',
            'at_leader',
            'at_mate1',
            'at_mate2',
            'at_mate3',
            'at_mate4',
            'updated_at' # 타임스탬프 필드 추가
        ]