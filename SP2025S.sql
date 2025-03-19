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
    `name` varchar(50) NOT NULL,
    PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `dept` WRITE;
/*!40000 ALTER TABLE `dept` DISABLE KEYS */;
INSERT INTO `dept` VALUES
    ('AIC', 'Artificial Intelligence Convergence'),
    ('CSE', 'Computer Science and Engineering'),
    ('EEE', 'Electrical and Electronics Engineering'),
    ('GME', 'Global Media'),
    ('SWE', 'Software Engineering');
/*!40000 ALTER TABLE `dept` ENABLE KEYS */;
UNLOCK TABLES;



/* section */
DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `section`(
    `section_id` varchar(8) NOT NULL,
    `year` varchar(4) NOT NULL,
    `semester` varchar(1) NOT NULL,
    `dept_id` varchar(3) NOT NULL,
    `name` varchar(50) NOT NULL,
    PRIMARY KEY (`section_id`, `year`, `semester`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `section_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `section` WRITE;
/*!40000 ALTER TABLE `section` DISABLE KEYS */;
INSERT INTO `section` VALUES
    ('01-001SP', '2023', 'S', 'AIC', 'Server Programming'),
    ('01-001SP', '2024', 'S', 'AIC', 'Server Programming'),
    ('01-001SP', '2025', 'S', 'AIC', 'Server Programming'),
    ('01-002MP', '2023', 'F', 'AIC', 'Mobile Programming'),
    ('01-002MP', '2024', 'F', 'AIC', 'Mobile Programming'),
    ('01-002MP', '2025', 'F', 'AIC', 'Mobile Programming');
/*!40000 ALTER TABLE `section` ENABLE KEYS */;
UNLOCK TABLES;



/* team */
DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team`(
    `team_id` varchar(15) NOT NULL,
    `name` varchar(20) DEFAULT NULL,
    `leader_id` varchar(6) DEFAULT NULL,
    PRIMARY KEY (`team_id`),
    KEY `leader_id` (`leader_id`),
    CONSTRAINT `team_fk_1` FOREIGN KEY (`leader_id`)
    REFERENCES `student` (`student_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES
    -- 2025 봄학기 서버프로그래밍 1 ~ 5조
    ('01-001SP2025S-1', 'Alpha',   '21-001'),
    ('01-001SP2025S-2', 'Bravo',   '21-005'),
    ('01-001SP2025S-3', 'Charlie', '22-001'),
    ('01-001SP2025S-4', 'Delta',   '23-002'),
    ('01-001SP2025S-5', 'Echo',    '23-006');
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;



/* attendance */
DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance`(
    `team_id` varchar(15) NOT NULL,
    `round` varchar(2) NOT NULL,
    `attendance` varchar(10) NOT NULL,
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
    ('01-001SP2025S-1', '01', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '02', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '03', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '04', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '05', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '06', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '07', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '08', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '09', 'xxxxxxxxxx'),
    ('01-001SP2025S-1', '10', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '01', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '02', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '03', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '04', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '05', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '06', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '07', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '08', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '09', 'xxxxxxxxxx'),
    ('01-001SP2025S-2', '10', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '01', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '02', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '03', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '04', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '05', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '06', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '07', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '08', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '09', 'xxxxxxxxxx'),
    ('01-001SP2025S-3', '10', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '01', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '02', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '03', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '04', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '05', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '06', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '07', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '08', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '09', 'xxxxxxxxxx'),
    ('01-001SP2025S-4', '10', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '01', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '02', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '03', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '04', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '05', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '06', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '07', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '08', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '09', 'xxxxxxxxxx'),
    ('01-001SP2025S-5', '10', 'xxxxxxxxxx');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;



/* student */
DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student`(
    `student_id` varchar(6) NOT NULL,
    `dept_id` varchar(3) NOT NULL,
    `name` varchar(20) NOT NULL,
    PRIMARY KEY (`student_id`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `student_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES
    -- 2025 봄학기 재학생
    ('21-001', 'AIC', 'Kim'),
    ('21-002', 'AIC', 'Kim'),
    ('21-003', 'AIC', 'Lee'),
    ('21-004', 'AIC', 'Shin'),
    ('21-005', 'AIC', 'Park'),
    ('21-006', 'AIC', 'Kim'),
    ('21-201', 'EEE', 'Lee'),
    ('21-301', 'GME', 'Lee'),
    ('22-001', 'AIC', 'Park'),
    ('22-002', 'AIC', 'Kim'),
    ('22-003', 'AIC', 'Choi'),
    ('23-001', 'AIC', 'Kim'),
    ('23-002', 'AIC', 'Lee'),
    ('23-003', 'AIC', 'Son'),
    ('23-004', 'AIC', 'Kim'),
    ('23-005', 'AIC', 'Han'),
    ('23-006', 'AIC', 'Seo'),
    ('23-007', 'AIC', 'Kim'),
    ('23-301', 'GME', 'Jeon'),
    ('24-001', 'AIC', 'Lee');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;



/* instructor */
DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instructor`(
    `instructor_id` varchar(6) NOT NULL,
    `dept_id` varchar(3) NOT NULL,
    `name` varchar(20) NOT NULL,
    PRIMARY KEY (`instructor_id`),
    KEY `dept_id` (`dept_id`),
    CONSTRAINT `instructor_fk_1` FOREIGN KEY (`dept_id`)
    REFERENCES `dept` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
INSERT INTO `instructor` VALUES
    ('98-901', 'AIC', 'Kim'),
    ('05-901', 'AIC', 'Lee'),
    ('05-902', 'AIC', 'Park');
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;



/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
