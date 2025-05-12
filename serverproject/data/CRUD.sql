-- 팀
-- POST /teams: 새로운 팀을 생성
INSERT INTO `team` VALUES(
    '01-001SP2024S-1',
    '1조 Ant',
    '21-001',
    '21-002',
    '21-003',
    '21-004',
    '21-005'
);
-- GET /teams/{team_id}: 특정 팀의 정보 조회
select * from team where team_id='01-001SP2024S-1';
-- PUT /teams/{team_id}: 팀 정보 수정
UPDATE team
SET team_name='1조 Ant',
    leader_id='21-001',
    mate1_id='21-002',
    mate2_id='21-003',
    mate3_id=NULL,
    mate4_id=NULL
WHERE team_id='01-001SP2024S-1';
-- DELETE /teams/{team_id}: 팀 삭제
delete from team where team_id='01-001SP2024S-1';



-- 출결 확인
-- POST /attendance/{team_id}/{round}: 특정 팀과 회차의 출결부 생성
INSERT INTO `attendance` VALUES(
    '01-001SP2024S-1',      -- tean_id
    '01',                   -- round
    'x',                    -- at_leader
    'x',                    -- at_1
    'x',                    -- at_2
    'x',                    -- at_3
    'x'                     -- at_4
);
-- POST /attendance: 출결 기록
UPDATE attendance
SET at_leader='o',
    at_mate1='o',
    at_mate2='x',
    at_mate3='o',
    at_mate4='x'
WHERE team_id='01-001SP2025S-1' and round='01';
-- GET /attendance/{team_id}: 특정 팀의 출결 조회
select * from attendance WHERE team_id='01-001SP2025S-1';
-- GET /attendance/{team_id}/{round}: 특정 팀과 회차의 출결 조회
select * from attendance WHERE team_id='01-001SP2025S-1' and round='01';
-- GET /attendance/{team_id}: 특정 팀의 명단 조회
select student_name from student where student_id in
(select leader_id from team where team_id="01-001SP2025S-1") OR student_id in
(select mate1_id from team where team_id="01-001SP2025S-1") OR student_id in
(select mate2_id from team where team_id="01-001SP2025S-1") OR student_id in
(select mate3_id from team where team_id="01-001SP2025S-1") OR student_id in
(select mate4_id from team where team_id="01-001SP2025S-1");
