-- CRUD: CREATE/READ/UPDATE/DELETE 주요 쿼리 정리

-- READ: 과목별, 분반별 수강생 조회
-- 2025-봄학기 서버프로그래밍(가)반 수강생 조회
select * from student where student_id in (
    select student_id from takes where
    section_id='01-001SP' and
    section_year='2025' and
    semester='S' and
    class='(가)'
);
-- 2025-가을학기 모바일프로그래밍(나)반 수강생 조회
select * from student where student_id in (
    select student_id from takes where
    section_id='01-002MP' and
    section_year='2025' and
    semester='F' and
    class='(나)'
);

-- READ: 팀장 수강생 조회
-- 2025-봄학기 서버프로그래밍(가)반 모든 팀장 조회(부분문자열 검색)
select * from student where student_id in (
    select leader_id from team where
    team_id like '01-001SP2025S-_'
);
-- 2025-봄학기 서버프로그래밍(가)반 1조 팀장만 조회
select * from student where student_id in (
    select leader_id from team where
    team_id = '01-001SP2025S-1'
);

-- CREATE, UPATE, DELTE: 조 생성, 조 정보 갱신, 조 삭제
-- '2024-봄학기' 서버프로그래밍(가)반 1조 생성(빈 팀)
INSERT INTO `team` VALUES('01-001SP2024S-1', NULL, NULL, NULL, NULL, NULL, NULL);
-- 조 정보 갱신(팀명 입력, 팀장 지정, 조원 배치)
UPDATE team
SET team_name='1조 Ant',
    leader_id='21-001',
    mate1_id='21-002',
    mate2_id='21-003',
    mate3_id='21-004',
    mate4_id='21-005'
WHERE team_id='01-001SP2024S-1';
-- 2025-봄학기 서버프로그래밍(가)반 1조 삭제
delete from team where team_id='01-001SP2024S-1';
