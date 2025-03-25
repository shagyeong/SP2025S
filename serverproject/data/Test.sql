-- 과목별, 분반별 수강생 조회
-- 2025-봄학기 서버프로그래밍(가)반
select * from student where student_id in (
    select student_id from takes where
    section_id='01-001SP' and
    section_year='2025' and
    semester='S' and
    class='(가)'
);
-- 2025-가을학기 모바일프로그래밍(나)반
select * from student where student_id in (
    select student_id from takes where
    section_id='01-002MP' and
    section_year='2025' and
    semester='F' and
    class='(나)'
);
