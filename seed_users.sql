-- Seed Initial Users for Testing
-- All passwords are 'password123' (SHA-256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f)

INSERT INTO users (id, username, password_hash, role) VALUES
('usr_admin_001', 'admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin'),
('usr_editor_001', 'editor', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'editor'),
('usr_contributor_001', 'contributor', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'contributor');
