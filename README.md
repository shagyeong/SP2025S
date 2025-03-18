# SP2025S: 2025-1 서버프로그래밍(가)반 팀 프로젝트
## 프로젝트 요약
### 프로젝트 주제
- 팀플 도움 웹 서비스
### 기여자
- jeeen0(WEB FE)
- heemings(WEB BE)
- shagyeong(DB)
### 기술 스택
- WEB FE: HTML, CSS, JavaScript
- WEB BE: Django
- DB: MySQL

## 테스트
### 데이터베이스
- 데이터베이스 임포트
    ```
    $ mysql -u [root] -p
    Enter password:
    mysql> source ./Member.sql;
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | Member             |
    +--------------------+
    1 rows in set (0.00 sec)
    mysql> show tables;
    +------------------+
    | Tables_in_Member |
    +------------------+
    | student          |
    +------------------+
    1 row in set (0.00 sec)
    ```
    ```
    mysql> select * from student;
    +------------+-------+------+-----+
    | student_id | major | name | sex |
    +------------+-------+------+-----+
    | 21-001     | AIC   | Kim  | M   |
    | 21-002     | AIC   | Shin | M   |
    | 21-103     | CSE   | Lee  | F   |
    | 22-101     | CSE   | Choi | M   |
    | 22-102     | CSE   | Kim  | M   |
    | 22-203     | SWE   | Son  | F   |
    | 23-001     | AIC   | Lee  | M   |
    | 23-101     | CSE   | Kim  | M   |
    +------------+-------+------+-----+
    8 rows in set (0.00 sec)
    ```
- MySQL 종료
    ```
    mysql> quit
    Bye
    $
    ```
- test
    <img src="./demo/test.png">
