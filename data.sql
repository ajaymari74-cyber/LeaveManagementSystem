USE leave_management;

-- Clear existing data
DELETE FROM leave_requests;
DELETE FROM users;

-- Admin: admin@company.com / admin123
-- Employees: john@company.com, priya@company.com, arun@company.com / emp123
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@company.com', '$2a$10$pvtS8n7fXWtLR8KQORHhGumxOZfC8tuyBzNKd4Z7yQ8ox9ovEWf8S', 'ADMIN'),
(2, 'John Doe', 'john@company.com', '$2a$10$5onbOifv238.coTKlBDLMupbUgtlx7KlCxmKcHHo7x76qvB9LOCTO', 'EMPLOYEE'),
(3, 'Priya Sharma', 'priya@company.com', '$2a$10$5onbOifv238.coTKlBDLMupbUgtlx7KlCxmKcHHo7x76qvB9LOCTO', 'EMPLOYEE'),
(4, 'Arun Kumar', 'arun@company.com', '$2a$10$5onbOifv238.coTKlBDLMupbUgtlx7KlCxmKcHHo7x76qvB9LOCTO', 'EMPLOYEE'),
(5, 'Ajay Admin', 'adminajay@gmail.com', '$2a$10$bPCxMeKMIrKsOm11KrHulOr0sPhb52B.m/umNS/CQscCrxidDlnFq', 'ADMIN'),
(6, 'Ajay Developer', 'ajaydeveloper@gmail.com', '$2a$10$jqmWMP6c4UYK1qvxwKOGx.VOv64EEoWj.dcA.v1VlS.sDPF1.2cse', 'EMPLOYEE'),
(7, 'Ajay Developer', 'ajaydeveloper@gamil.com', '$2a$10$jqmWMP6c4UYK1qvxwKOGx.VOv64EEoWj.dcA.v1VlS.sDPF1.2cse', 'EMPLOYEE');

-- Seed a few realistic leave requests for initial dashboard view if needed
INSERT INTO leave_requests (id, user_id, leave_type, from_date, to_date, reason, status, applied_at, decided_at, decided_by) VALUES
(1, 2, 'CASUAL', '2026-10-15', '2026-10-16', 'Family function out of station', 'PENDING', NOW(), NULL, NULL),
(2, 3, 'SICK', '2026-10-01', '2026-10-02', 'High fever and viral cold', 'APPROVED', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), 1),
(3, 4, 'EMERGENCY', '2026-09-20', '2026-09-21', 'Urgent home repair work', 'REJECTED', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY), 1);
