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

class Dept(models.Model):
    dept_id = models.CharField(primary_key=True, max_length=3)
    dept_name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dept'

class Section(models.Model):
    # id 필드 제거
    section_id = models.CharField(max_length=8) # 이 필드가 암묵적인 PK처럼 동작할 수 있음
    section_year = models.CharField(max_length=4)
    semester = models.CharField(max_length=1)
    class_field = models.CharField(db_column='class', max_length=6)
    dept = models.ForeignKey('Dept', on_delete=models.CASCADE, db_column='dept_id')
    section_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'section'
        managed = False 
        unique_together = (('section_id', 'section_year', 'semester', 'class_field'),)

class Teaches(models.Model):

    instructor = models.ForeignKey(
        Instructor,
        on_delete=models.CASCADE,
        db_column='instructor_id' 
    )

    section_obj_id = models.CharField(max_length=8, db_column='section_id') # Section의 section_id 값
    section_obj_year = models.CharField(max_length=4, db_column='section_year') # Section의 section_year 값
    section_obj_semester = models.CharField(max_length=1, db_column='semester') # Section의 semester 값
    section_obj_class = models.CharField(max_length=6, db_column='class') # Section의 class 값

    class Meta:
        db_table = 'teaches'
        managed = False 
        unique_together = (('instructor', 'section_obj_id', 'section_obj_year', 'section_obj_semester', 'section_obj_class'),)

    def get_section_object(self):
        try:
            return Section.objects.get(
                section_id=self.section_obj_id,
                section_year=self.section_obj_year,
                semester=self.section_obj_semester,
                class_field=self.section_obj_class
            )
        except Section.DoesNotExist:
            return None

    def __str__(self):
        return f"{self.instructor_id} teaches {self.section_obj_id}-{self.section_obj_year}-{self.section_obj_semester}-{self.section_obj_class}"
