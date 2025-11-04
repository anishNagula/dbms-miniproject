DROP DATABASE IF EXISTS pesu_skill_connect_hub;

CREATE DATABASE pesu_skill_connect_hub;

USE pesu_skill_connect_hub;

CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    f_name VARCHAR(50) NOT NULL,
    l_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    project_completed_count INT DEFAULT 0
);

CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50)
);

CREATE TABLE Student_Skills (
    student_id INT,
    skill_id INT,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE Project_Status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_student_id INT,
    status_id INT,
    reference_link VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_student_id) REFERENCES Student(student_id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES Project_Status(status_id)
);

CREATE TABLE Project_Required_Skills (
    project_id INT,
    skill_id INT,
    required_proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    PRIMARY KEY (project_id, skill_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE Project_Application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    student_id INT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, student_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

CREATE TABLE Project_Team (
    project_id INT,
    student_id INT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'Member',
    PRIMARY KEY (project_id, student_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

CREATE TABLE Team_Communication (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    sender_id INT,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Student(student_id) ON DELETE SET NULL
);



INSERT INTO Project_Status (status_id, status_name) VALUES
(1, 'Open for Applications'),
(2, 'In Progress'),
(3, 'Completed'),
(4, 'On Hold');

INSERT INTO Skills (skill_name, category) VALUES
('Python', 'Backend'),
('JavaScript', 'Frontend'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('MySQL', 'Database'),
('Docker', 'DevOps'),
('Figma', 'Design'),
('Federated Learning', 'Machine Learning');

INSERT INTO Student (f_name, l_name, email, password_hash) VALUES
('Ananya', 'Sharma', 'ananya.s@email.com', '$2b$10$E9p9h5L4g3m2R1S0c.B/FuLp5X.Qc.Z/Yx.K8a.N2jO6i'),
('Rohan', 'Verma', 'rohan.v@email.com', '$2b$10$E9p9h5L4g3m2R1S0c.B/FuLp5X.Qc.Z/Yx.K8a.N2jO6i'),
('Priya', 'Singh', 'priya.s@email.com', '$2b$10$E9p9h5L4g3m2R1S0c.B/FuLp5X.Qc.Z/Yx.K8a.N2jO6i'),
('Vikram', 'Rao', 'vikram.r@email.com', '$2b$10$E9p9h5L4g3m2R1S0c.B/FuLp5X.Qc.Z/Yx.K8a.N2jO6i');

INSERT INTO Student_Skills (student_id, skill_id, proficiency) VALUES
(1, 1, 'Advanced'), (1, 5, 'Intermediate'), (1, 8, 'Intermediate'),
(2, 2, 'Expert'), (2, 3, 'Advanced'), (2, 4, 'Advanced'),
(3, 7, 'Expert'), (3, 3, 'Beginner'),
(4, 1, 'Intermediate'), (4, 6, 'Intermediate');

INSERT INTO Project (title, description, created_student_id, status_id, start_date, end_date) VALUES
('AI-Powered Threat Detection System', 'A project using Federated Learning and GNNs to detect advanced persistent threats in networks.', 1, 1, '2025-11-01', '2026-05-01');

INSERT INTO Project (title, description, created_student_id, status_id, start_date, end_date) VALUES
('College Event Management Portal', 'A full-stack web application to manage registrations, ticketing, and scheduling for college events.', 2, 1, '2025-10-20', '2025-12-20');

INSERT INTO Project_Required_Skills (project_id, skill_id, required_proficiency) VALUES
(1, 1, 'Advanced'),
(1, 8, 'Intermediate');

INSERT INTO Project_Required_Skills (project_id, skill_id, required_proficiency) VALUES
(2, 3, 'Intermediate'),
(2, 4, 'Intermediate'),
(2, 5, 'Beginner'),
(2, 7, 'Beginner');

INSERT INTO Project_Application (project_id, student_id) VALUES
(1, 2),
(1, 4);

INSERT INTO Project_Application (project_id, student_id) VALUES
(2, 1),
(2, 3);



-- TRIGGER 1: Automatically increments a student's project completion count. This code runs automatically AFTER an UPDATE on the Project table.
DELIMITER $$
CREATE TRIGGER after_project_completed
AFTER UPDATE ON Project
FOR EACH ROW
BEGIN
    IF NEW.status_id = 3 AND OLD.status_id != 3 THEN
        UPDATE Student
        SET project_completed_count = project_completed_count + 1
        WHERE student_id IN (SELECT student_id FROM Project_Team WHERE project_id = NEW.project_id);
    END IF;
END$$
DELIMITER ;

-- TRIGGER 2: Automatically adds the project's creator to the Project_Team table with the role "Creator" the moment they create a new project.
DELIMITER $$
CREATE TRIGGER trg_AddCreatorToTeam
AFTER INSERT ON Project
FOR EACH ROW
BEGIN
    INSERT INTO Project_Team (project_id, student_id, role)
    VALUES (NEW.project_id, NEW.created_student_id, 'Creator');
END$$
DELIMITER ;



-- STORED PROCEDURE: A single safe transaction to accept an application. It moves a student from the application table to the team table.
DELIMITER $$
CREATE PROCEDURE AcceptApplication(IN p_application_id INT, IN p_role VARCHAR(50))
BEGIN
    DECLARE v_project_id INT;
    DECLARE v_student_id INT;

    SELECT project_id, student_id
    INTO v_project_id, v_student_id
    FROM Project_Application
    WHERE application_id = p_application_id;

    IF v_project_id IS NOT NULL THEN
        INSERT INTO Project_Team (project_id, student_id, role)
        VALUES (v_project_id, v_student_id, p_role);

        DELETE FROM Project_Application WHERE application_id = p_application_id;
    END IF;
END$$
DELIMITER ;



-- FUNCTION: Increments a student's skill count.
DELIMITER $$
CREATE FUNCTION CountUserSkills(p_student_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE skill_count INT;
    SELECT COUNT(*) INTO skill_count
    FROM Student_Skills
    WHERE student_id = p_student_id;
    RETURN skill_count;
END$$
DELIMITER ;