from django.db import models

class Attendance(models.Model):
    team_id = models.CharField(max_length=15)
    round = models.CharField(max_length=2)
    attendance = models.CharField(max_length=10)

    class Meta:
        db_table = 'attendance'
        constraints = [
            models.UniqueConstraint(fields=['team_id', 'round'], name='unique_attendance')
        ]

    def __str__(self):
        return f"{self.team_id} - Round {self.round}: {self.attendance}"

# Create your models here.
