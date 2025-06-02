from django.db import models

class Attendance(models.Model):
    id = models.AutoField(primary_key=True)
    team_id = models.CharField(max_length=15)
    round = models.CharField(max_length=2)
    at_leader = models.CharField(max_length=1, null=True, blank=True)
    at_mate1 = models.CharField(max_length=1, null=True, blank=True)
    at_mate2 = models.CharField(max_length=1, null=True, blank=True)
    at_mate3 = models.CharField(max_length=1, null=True, blank=True)
    at_mate4 = models.CharField(max_length=1, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True) # ★★★ 타임스탬프 필드 추가 ★★★

    class Meta:
        db_table = 'attendance'
        constraints = [
            models.UniqueConstraint(fields=['team_id', 'round'], name='unique_attendance')
        ]

    def __str__(self):
        return f"{self.team_id} - Round {self.round}"