# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
import uuid
from django.db import models


class Attendance(models.Model):
    team = models.OneToOneField('Team', models.DO_NOTHING, primary_key=True)  # The composite primary key (team_id, round) found, that is not supported. The first column is selected.
    round = models.CharField(max_length=2)
    attendance = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'attendance'
        unique_together = (('team', 'round'),)


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Dept(models.Model):
    dept_id = models.CharField(primary_key=True, max_length=3)
    dept_name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dept'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Instructor(models.Model):
    instructor_id = models.CharField(primary_key=True, max_length=6)
    dept = models.ForeignKey(Dept, models.DO_NOTHING, blank=True, null=True)
    instructor_name = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'instructor'


class Section(models.Model):
    section_id = models.CharField(primary_key=True, max_length=8)  # The composite primary key (section_id, section_year, semester, class) found, that is not supported. The first column is selected.
    section_year = models.CharField(max_length=4)
    semester = models.CharField(max_length=1)
    class_field = models.CharField(db_column='class', max_length=6)  # Field renamed because it was a Python reserved word.
    dept = models.ForeignKey(Dept, models.DO_NOTHING)
    section_name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'section'
        unique_together = (('section_id', 'section_year', 'semester', 'class_field'),)


class Student(models.Model):
    student_id = models.CharField(primary_key=True, max_length=6)
    dept = models.ForeignKey(Dept, models.DO_NOTHING, blank=True, null=True)
    student_name = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'student'


class Takes(models.Model):
    student = models.OneToOneField(Student, models.DO_NOTHING, primary_key=True)  # The composite primary key (student_id, section_id, section_year, semester, class) found, that is not supported. The first column is selected.
    section = models.ForeignKey(Section, models.DO_NOTHING)
    section_year = models.ForeignKey(Section, models.DO_NOTHING, db_column='section_year', to_field='section_year', related_name='takes_section_year_set')
    semester = models.ForeignKey(Section, models.DO_NOTHING, db_column='semester', to_field='semester', related_name='takes_semester_set')
    class_field = models.ForeignKey(Section, models.DO_NOTHING, db_column='class', to_field='class', related_name='takes_class_field_set')  # Field renamed because it was a Python reserved word.

    class Meta:
        managed = False
        db_table = 'takes'
        unique_together = (('student', 'section', 'section_year', 'semester', 'class_field'),)


class Teaches(models.Model):
    instructor = models.OneToOneField(Instructor, models.DO_NOTHING)  # The composite primary key (instructor_id, section_id, section_year, semester, class) found, that is not supported. The first column is selected.
    section = models.ForeignKey(Section, models.DO_NOTHING)
    section_year = models.ForeignKey(Section, models.DO_NOTHING, db_column='section_year', to_field='section_year', related_name='teaches_section_year_set')
    semester = models.ForeignKey(Section, models.DO_NOTHING, db_column='semester', to_field='semester', related_name='teaches_semester_set')
    class_field = models.ForeignKey(Section, models.DO_NOTHING, db_column='class', to_field='class', related_name='teaches_class_field_set')  # Field renamed because it was a Python reserved word.

    class Meta:
        managed = False
        db_table = 'teaches'
        unique_together = (('instructor', 'section', 'section_year', 'semester', 'class_field'),)


class Team(models.Model):
    team_id = models.CharField(primary_key=True, max_length=15)
    team_name = models.CharField(max_length=20, blank=True, null=True)
    leader_id = models.ForeignKey(Student, models.DO_NOTHING, blank=True, null=True)
    mate1_id = models.CharField(max_length=6, blank=True, null=True)
    mate2_id = models.CharField(max_length=6, blank=True, null=True)
    mate3_id = models.CharField(max_length=6, blank=True, null=True)
    mate4_id = models.CharField(max_length=6, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'team'

