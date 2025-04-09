from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'team_id',
            'round',
            'at_mate1',
            'at_mate2',
            'at_mate3',
            'at_mate4'
        ]
