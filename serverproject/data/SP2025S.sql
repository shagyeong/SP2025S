Create database if not exists SP2025S;
Use SP2025S;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



/* dept */
DROP TABLE IF EXISTS `dept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dept`(
    `dept_id` varchar(3) NOT NULL,
    `dept_name` varchar(50) NOT NULL,
    PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `dept` WRITE;
/*!40000 ALTER TABLE `dept` DISABLE KEYS */;
INSERT INTO `dept` VALUES
    ('AIC', 'AI 융합학부'),
    ('CSE', '컴퓨터학부'),
    ('EEE', '전기전자공학부'),
    ('GME', '글로벌미디어학부'),
    ('SWE', '소프트웨어학부');
/*!40000 ALTER TABLE `dept` ENABLE KEYS */;
UNLOCK TABLES;



/* section */
DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `section`(
    `section_id` varchar(8) NOT NULL,
    `section_year` varchar(4) NOT NULL,
    `semester` varchar(1) NOT NULL,
    `class` varchar(6) NOT NULL,
    `dept_id` varchar(3) NOT NULL,
    `section_name` varchar(50) NOT NULL,
    PRIMARY KEY (`section_id`, `section_year`, `semester`, `class`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `section_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `section` WRITE;
/*!40000 ALTER TABLE `section` DISABLE KEYS */;
INSERT INTO `section` VALUES
    ('01-001SP', '2024', 'S', '(가)', 'AIC', '서버프로그래밍'),
    ('01-001SP', '2024', 'S', '(나)', 'AIC', '서버프로그래밍'),
    ('01-001SP', '2025', 'S', '(가)', 'AIC', '서버프로그래밍'),
    ('01-001SP', '2025', 'S', '(나)', 'AIC', '서버프로그래밍'),
    ('01-002MP', '2024', 'F', '(가)', 'AIC', '모바일프로그래밍'),
    ('01-002MP', '2024', 'F', '(나)', 'AIC', '모바일프로그래밍'),
    ('01-002MP', '2025', 'F', '(가)', 'AIC', '모바일프로그래밍'),
    ('01-002MP', '2025', 'F', '(나)', 'AIC', '모바일프로그래밍');
/*!40000 ALTER TABLE `section` ENABLE KEYS */;
UNLOCK TABLES;



/* team */
-- 조 편성: 분반 통합
-- (가)반: 1, 2, 3조
-- (나)반: 4, 5, 6조
DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team`(
    `team_id` varchar(15) NOT NULL,
    `team_name` varchar(20) DEFAULT NULL,
    `leader_id` varchar(6) DEFAULT NULL,
    `mate1_id` varchar(6) DEFAULT NULL,
    `mate2_id` varchar(6) DEFAULT NULL,
    `mate3_id` varchar(6) DEFAULT NULL,
    `mate4_id` varchar(6) DEFAULT NULL,
    `notion_url` varchar(255) DEFAULT NULL, /* 추가 */
    PRIMARY KEY (`team_id`),
    KEY `leader_id` (`leader_id`),
    CONSTRAINT `team_fk_1` FOREIGN KEY (`leader_id`)
    REFERENCES `student` (`student_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES
    -- 2025 봄학기 서버프로그래밍 1 ~ 6조
    -- (가)반
    ('01-001SP2025S-1', '1조 Alpha',   '21-001', '21-002', '21-003', '21-004', NULL),
    ('01-001SP2025S-2', '2조 Bravo',   '21-005', '21-006', '21-007', '21-008', NULL),
    ('01-001SP2025S-3', '3조 Charlie', '22-001', '22-002', '22-003', '22-004', NULL),
    -- (나)반
    ('01-001SP2025S-4', '4조 Delta',   '23-001', '23-002', '23-003', '23-004', NULL),
    ('01-001SP2025S-5', '5조 Echo',    '23-005', '23-006', '23-007', '23-008', NULL),
    ('01-001SP2025S-6', '6조 Foxtrot', '23-009', '24-001', '24-002', '24-003', NULL),
    -- 2025 가을학기 모바일프로그래밍 1 ~ 6조
    -- (가)반
    ('01-002MP2025F-1', '1조 Apple',   '21-001', '21-002', '21-005', '21-006', NULL),
    ('01-002MP2025F-2', '2조 Banana',  '22-001', '22-002', '23-001', '23-002', NULL),
    ('01-002MP2025F-3', '3조 Cat',     '23-005', '23-006', '23-009', '24-001', NULL),
    -- (나)반
    ('01-002MP2025F-4', '4조 Dog',     '21-003', '21-004', '21-007', '21-008', NULL),
    ('01-002MP2025F-5', '5조 Elephant','22-003', '22-004', '23-003', '23-004', NULL),
    ('01-002MP2025F-6', '6조 Fox',     '23-007', '23-008', '24-002', '24-003', NULL);
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;



/* attendance */
DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance`(
    `team_id` varchar(15) NOT NULL,
    `round` varchar(2) NOT NULL,
    `at_leader` varchar(1) DEFAULT NULL,
    `at_mate1` varchar(1) DEFAULT NULL,
    `at_mate2` varchar(1) DEFAULT NULL,
    `at_mate3` varchar(1) DEFAULT NULL,
    `at_mate4` varchar(1) DEFAULT NULL,    
    PRIMARY KEY (`team_id`, `round`),
    KEY `team_id` (`team_id`),
    CONSTRAINT `attendance_fk_1` FOREIGN KEY (`team_id`)
    REFERENCES `team` (`team_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES
    -- 2025 봄학기 서버프로그래밍 1 ~ 5조 1 ~ 10회차 출석부
    ('01-001SP2025S-1', '01', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '02', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '03', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '04', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '05', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '06', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '07', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '08', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '09', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-1', '10', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '01', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '02', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '03', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '04', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '05', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '06', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '07', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '08', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '09', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-2', '10', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '01', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '02', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '03', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '04', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '05', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '06', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '07', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '08', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '09', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-3', '10', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '01', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '02', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '03', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '04', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '05', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '06', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '07', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '08', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '09', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-4', '10', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '01', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '02', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '03', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '04', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '05', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '06', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '07', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '08', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '09', 'x', 'x', 'x', 'x', 'x'),
    ('01-001SP2025S-5', '10', 'x', 'x', 'x', 'x', 'x');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;



/* student */
DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student`(
    `student_id` varchar(6) NOT NULL,
    `dept_id` varchar(3) DEFAULT NULL,
    `student_name` varchar(20) DEFAULT NULL,
    PRIMARY KEY (`student_id`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `student_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES
    -- 2025 봄, 가을학기 재학생
    ('21-001', 'AIC', '강승진'),
    ('21-002', 'AIC', '강윤수'),
    ('21-003', 'AIC', '구민지'),
    ('21-004', 'AIC', '김미영'),
    ('21-005', 'AIC', '나현우'),
    ('21-006', 'AIC', '박재은'),
    ('21-007', 'AIC', '송하경'),
    ('21-008', 'AIC', '황수하'),
    ('22-001', 'AIC', '김민지'),
    ('22-002', 'AIC', '김수미'),
    ('22-003', 'AIC', '도기범'),
    ('22-004', 'AIC', '안정수'),
    ('23-001', 'AIC', '김우진'),
    ('23-002', 'AIC', '김재민'),
    ('23-003', 'AIC', '방수현'),
    ('23-004', 'AIC', '유하경'),
    ('23-005', 'AIC', '윤지성'),
    ('23-006', 'AIC', '차현석'),
    ('23-007', 'AIC', '허지우'),
    ('23-008', 'AIC', '황승빈'),
    ('23-009', 'AIC', '황지수'),
    ('24-001', 'AIC', '김재만'),
    ('24-002', 'AIC', '박철수'),
    ('24-003', 'AIC', '우태현');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;



/* instructor */
DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instructor`(
    `instructor_id` varchar(6) NOT NULL,
    `dept_id` varchar(3) DEFAULT NULL,
    `instructor_name` varchar(20) DEFAULT NULL,
    PRIMARY KEY (`instructor_id`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `instructor_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
INSERT INTO `instructor` VALUES
    ('98-901', 'AIC', '안승효'),
    ('05-901', 'AIC', '이민준');
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;



/* student 'takes' section */
DROP TABLE IF EXISTS `takes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `takes`(
    `student_id` varchar(6) NOT NULL,
    `section_id` varchar(8) NOT NULL,
    `section_year` varchar(4) NOT NULL,
    `semester` varchar(1) NOT NULL,
    `class` varchar(6) NOT NULL,
    PRIMARY KEY (`student_id`, `section_id`, `section_year`, `semester`, `class`),
    KEY `student_id` (`student_id`),
    CONSTRAINT `takes_fk_1` FOREIGN KEY (`student_id`)
    REFERENCES `student` (`student_id`) ON DELETE CASCADE,
    KEY `section_id` (`section_id`, `section_year`, `semester`, `class`),
    CONSTRAINT `takes_fk2` FOREIGN KEY (`section_id`, `section_year`, `semester`, `class`)
    REFERENCES `section` (`section_id`, `section_year`, `semester`, `class`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `takes` WRITE;
/*!40000 ALTER TABLE `takes` DISABLE KEYS */;
INSERT INTO `takes` VALUES
    -- 서버프로그래밍 수강 정보                    -- 모바일프로그래밍 수강 정보
    ('21-001', '01-001SP', '2025', 'S', '(가)'), ('21-001', '01-002MP', '2025', 'F', '(가)'),
    ('21-002', '01-001SP', '2025', 'S', '(가)'), ('21-002', '01-002MP', '2025', 'F', '(가)'),
    ('21-003', '01-001SP', '2025', 'S', '(가)'), ('21-003', '01-002MP', '2025', 'F', '(나)'),
    ('21-004', '01-001SP', '2025', 'S', '(가)'), ('21-004', '01-002MP', '2025', 'F', '(나)'),
    ('21-005', '01-001SP', '2025', 'S', '(가)'), ('21-005', '01-002MP', '2025', 'F', '(가)'),
    ('21-006', '01-001SP', '2025', 'S', '(가)'), ('21-006', '01-002MP', '2025', 'F', '(가)'),
    ('21-007', '01-001SP', '2025', 'S', '(가)'), ('21-007', '01-002MP', '2025', 'F', '(나)'),
    ('21-008', '01-001SP', '2025', 'S', '(가)'), ('21-008', '01-002MP', '2025', 'F', '(나)'),
    ('22-001', '01-001SP', '2025', 'S', '(가)'), ('22-001', '01-002MP', '2025', 'F', '(가)'),
    ('22-002', '01-001SP', '2025', 'S', '(가)'), ('22-002', '01-002MP', '2025', 'F', '(가)'),
    ('22-003', '01-001SP', '2025', 'S', '(가)'), ('22-003', '01-002MP', '2025', 'F', '(나)'),
    ('22-004', '01-001SP', '2025', 'S', '(가)'), ('22-004', '01-002MP', '2025', 'F', '(나)'),
    ('23-001', '01-001SP', '2025', 'S', '(나)'), ('23-001', '01-002MP', '2025', 'F', '(가)'),
    ('23-002', '01-001SP', '2025', 'S', '(나)'), ('23-002', '01-002MP', '2025', 'F', '(가)'),
    ('23-003', '01-001SP', '2025', 'S', '(나)'), ('23-003', '01-002MP', '2025', 'F', '(나)'),
    ('23-004', '01-001SP', '2025', 'S', '(나)'), ('23-004', '01-002MP', '2025', 'F', '(나)'),
    ('23-005', '01-001SP', '2025', 'S', '(나)'), ('23-005', '01-002MP', '2025', 'F', '(가)'),
    ('23-006', '01-001SP', '2025', 'S', '(나)'), ('23-006', '01-002MP', '2025', 'F', '(가)'),
    ('23-007', '01-001SP', '2025', 'S', '(나)'), ('23-007', '01-002MP', '2025', 'F', '(나)'),
    ('23-008', '01-001SP', '2025', 'S', '(나)'), ('23-008', '01-002MP', '2025', 'F', '(나)'),
    ('23-009', '01-001SP', '2025', 'S', '(나)'), ('23-009', '01-002MP', '2025', 'F', '(가)'),
    ('24-001', '01-001SP', '2025', 'S', '(나)'), ('24-001', '01-002MP', '2025', 'F', '(가)'),
    ('24-002', '01-001SP', '2025', 'S', '(나)'), ('24-002', '01-002MP', '2025', 'F', '(나)'),
    ('24-003', '01-001SP', '2025', 'S', '(나)'), ('24-003', '01-002MP', '2025', 'F', '(나)');

/*!40000 ALTER TABLE `takes` ENABLE KEYS */;
UNLOCK TABLES;



/* instructor teaches section */
DROP TABLE IF EXISTS `teaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teaches`(
    `instructor_id` varchar(6) NOT NULL,
    `section_id` varchar(8) NOT NULL,
    `section_year` varchar(4) NOT NULL,
    `semester` varchar(1) NOT NULL,
    `class` varchar(6) NOT NULL,
    PRIMARY KEY (`instructor_id`, `section_id`, `section_year`, `semester`, `class`),
    KEY `instructor_id` (`instructor_id`),
    CONSTRAINT `teaches_fk_1` FOREIGN KEY (`instructor_id`)
    REFERENCES `instructor` (`instructor_id`) ON DELETE CASCADE,
    KEY `section_id` (`section_id`, `section_year`, `semester`, `class`),
    CONSTRAINT `teaches_fk2` FOREIGN KEY (`section_id`, `section_year`, `semester`, `class`)
    REFERENCES `section` (`section_id`, `section_year`, `semester`, `class`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `teaches` WRITE;
/*!40000 ALTER TABLE `teaches` DISABLE KEYS */;
INSERT INTO `teaches` VALUES
    ('98-901', '01-001SP', '2024', 'S', '(가)'),
    ('98-901', '01-001SP', '2024', 'S', '(나)'),
    ('98-901', '01-001SP', '2025', 'S', '(가)'),
    ('98-901', '01-001SP', '2025', 'S', '(나)'),
    ('05-901', '01-002MP', '2024', 'F', '(가)'),
    ('05-901', '01-002MP', '2024', 'F', '(나)'),
    ('05-901', '01-002MP', '2025', 'F', '(가)'),
    ('05-901', '01-002MP', '2025', 'F', '(나)');
/*!40000 ALTER TABLE `teaches` ENABLE KEYS */;
UNLOCK TABLES;



/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
