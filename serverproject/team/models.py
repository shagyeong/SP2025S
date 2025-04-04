import uuid
from django.db import models

class Team(models.Model):
    team_id = models.CharField(max_length=15, primary_key=True)
    team_name = models.CharField(max_length=20, null=True, blank=True)
    leader = models.ForeignKey('team.Student', on_delete=models.SET_NULL, null=True, db_column="leader_id")
    mate1_id = models.CharField(max_length=6, null=True, blank=True)
    mate2_id = models.CharField(max_length=6, null=True, blank=True)
    mate3_id = models.CharField(max_length=6, null=True, blank=True)
    mate4_id = models.CharField(max_length=6, null=True, blank=True)

    class Meta:
        managed = False
        db_table = "team"

    def __str__(self):
        return self.team_name

class Student(models.Model):
    student_id = models.CharField(max_length=6, primary_key=True)
    name = models.CharField(max_length=50, db_column="student_name")
    class Meta:
        managed = False  # Django가 직접 마이그레이션을 수행하지 않도록 설정
        db_table = "student"  # 실제 MySQL 테이블명과 일치시킴

    def __str__(self):
        return self.name
