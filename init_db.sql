-- Создание таблиц
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aircrafts (
    id SERIAL PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(50),
    registration_number VARCHAR(30) UNIQUE NOT NULL,
    capacity INTEGER,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    aircraft_id INTEGER REFERENCES aircrafts(id),
    departure_airport_id INTEGER REFERENCES airports(id),
    arrival_airport_id INTEGER REFERENCES airports(id),
    scheduled_departure TIMESTAMP(6),
    scheduled_arrival TIMESTAMP(6),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    location VARCHAR(255),
    airport_id INTEGER REFERENCES airports(id),
    flight_id INTEGER REFERENCES flights(id),
    reported_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных

-- Пользователи (пароль: password123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('ivanov', 'ivanov@example.com', '$2b$10$YourHashedPasswordHere', 'user'),
('petrov', 'petrov@example.com', '$2b$10$YourHashedPasswordHere', 'user');

-- Самолеты
INSERT INTO aircrafts (model, manufacturer, registration_number, capacity) VALUES
('Boeing 737-800', 'Boeing', 'RA-73801', 189),
('Airbus A320', 'Airbus', 'RA-32001', 180),
('Sukhoi Superjet 100', 'Sukhoi', 'RA-89001', 98);

-- Аэропорты
INSERT INTO airports (name, code, location) VALUES
('Шереметьево', 'SVO', 'Москва'),
('Пулково', 'LED', 'Санкт-Петербург'),
('Кольцово', 'SVX', 'Екатеринбург');

-- Рейсы
INSERT INTO flights (flight_number, aircraft_id, departure_airport_id, arrival_airport_id, scheduled_departure, scheduled_arrival) VALUES
('SU-1001', 1, 1, 2, '2024-03-20 10:00:00', '2024-03-20 11:30:00'),
('SU-1002', 2, 2, 1, '2024-03-20 13:00:00', '2024-03-20 14:30:00'),
('SU-1003', 3, 1, 3, '2024-03-20 15:00:00', '2024-03-20 17:00:00');

-- Инциденты
INSERT INTO incidents (title, description, severity, location, airport_id, flight_id, reported_by) VALUES
('Задержка рейса', 'Рейс задержан на 30 минут из-за технических работ', 'Низкая', 'Терминал D', 1, 1, 2),
('Проблема с багажом', 'Пассажир не получил свой багаж', 'Средняя', 'Зал выдачи багажа', 2, 2, 3),
('Неисправность самолета', 'Обнаружена техническая неисправность перед вылетом', 'Высокая', 'Стоянка 15', 1, 3, 2);

-- Отчеты
INSERT INTO reports (incident_id, content, author_id) VALUES
(1, 'Проведены все необходимые проверки, рейс готов к вылету', 2),
(2, 'Багаж найден и передан пассажиру', 3),
(3, 'Проведен ремонт, самолет готов к эксплуатации', 2); 