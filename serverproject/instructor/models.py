from django.db import models

class Instructor(models.Model):
    instructor_id = models.CharField(max_length=6, primary_key=True)
    dept_id = models.CharField(max_length=3, null=True, blank=True)
    instructor_name = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        db_table = 'instructor'
        managed = False

    def __str__(self):
        return f"{self.instructor_id} - {self.instructor_name}"
