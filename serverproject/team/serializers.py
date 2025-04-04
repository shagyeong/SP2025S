from rest_framework import serializers
from .models import Team

class TeamSerializer(serializers.ModelSerializer):
    leader_id = serializers.CharField(source='leader.student_id', required=True)

    class Meta:
        model = Team
        fields = ['team_name', 'leader_id', 'mate1_id', 'mate2_id', 'mate3_id', 'mate4_id']

