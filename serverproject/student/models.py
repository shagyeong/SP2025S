from django.db import models

# Create your models here.

class Student(models.Model):
    student_id = models.CharField(max_length=10, primary_key=True)
    dept_id = models.CharField(max_length=50)
    student_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'student'
        managed = False

    def __str__(self):
        return f"{self.student_id} - {self.student_name}"
