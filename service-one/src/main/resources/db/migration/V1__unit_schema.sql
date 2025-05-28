-- ========================================
-- СОЗДАНИЕ ТАБЛИЦ
-- ========================================

-- Отделы компании
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    budget DECIMAL(12,2),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Должности
CREATE TABLE positions (
    position_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2)
);

-- Сотрудники
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    department_id INTEGER REFERENCES departments(department_id),
    position_id INTEGER REFERENCES positions(position_id),
    manager_id INTEGER REFERENCES employees(employee_id),
    is_active BOOLEAN DEFAULT TRUE,
    birth_date DATE
);

-- Клиенты
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    client_type VARCHAR(20) CHECK (client_type IN ('individual', 'corporate', 'government'))
);

-- Категории товаров
CREATE TABLE product_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Товары
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES product_categories(category_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Проекты
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status VARCHAR(20) CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    client_id INTEGER REFERENCES clients(client_id),
    manager_id INTEGER REFERENCES employees(employee_id)
);

-- Участие сотрудников в проектах
CREATE TABLE project_assignments (
    assignment_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id),
    employee_id INTEGER REFERENCES employees(employee_id),
    role VARCHAR(100),
    hours_allocated INTEGER,
    hourly_rate DECIMAL(8,2),
    start_date DATE,
    end_date DATE,
    UNIQUE(project_id, employee_id)
);

-- Задачи по проектам
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(project_id),
    assigned_to INTEGER REFERENCES employees(employee_id),
    status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Заказы
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(client_id),
    order_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    total_amount DECIMAL(12,2),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    sales_person_id INTEGER REFERENCES employees(employee_id),
    discount_percent DECIMAL(5,2) DEFAULT 0
);

-- Позиции заказов
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Логи изменения зарплат
CREATE TABLE salary_history (
    history_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    change_date DATE DEFAULT CURRENT_DATE,
    reason VARCHAR(200)
);

-- ========================================
-- ВСТАВКА ДАННЫХ
-- ========================================

-- Отделы
INSERT INTO departments (name, budget, location) VALUES
('IT разработка', 500000.00, 'Москва'),
('Маркетинг', 300000.00, 'Санкт-Петербург'),
('Продажи', 400000.00, 'Москва'),
('HR', 150000.00, 'Москва'),
('Финансы', 200000.00, 'Санкт-Петербург'),
('Поддержка клиентов', 120000.00, 'Екатеринбург');

-- Должности
INSERT INTO positions (title, min_salary, max_salary) VALUES
('Junior разработчик', 60000, 100000),
('Middle разработчик', 100000, 180000),
('Senior разработчик', 180000, 300000),
('Тимлид', 250000, 400000),
('Менеджер по продажам', 80000, 150000),
('Маркетолог', 70000, 130000),
('HR специалист', 60000, 120000),
('Финансовый аналитик', 90000, 160000),
('Оператор поддержки', 40000, 70000),
('Директор', 300000, 500000);

-- Сотрудники
INSERT INTO employees (first_name, last_name, email, phone, hire_date, salary, department_id, position_id, manager_id, birth_date) VALUES
('Анна', 'Иванова', 'anna.ivanova@company.com', '+7-901-234-5678', '2020-01-15', 450000, 1, 10, NULL, '1985-03-12'),
('Дмитрий', 'Петров', 'dmitry.petrov@company.com', '+7-902-345-6789', '2021-03-20', 280000, 1, 4, 1, '1988-07-25'),
('Елена', 'Сидорова', 'elena.sidorova@company.com', '+7-903-456-7890', '2022-05-10', 165000, 1, 3, 2, '1990-11-03'),
('Михаил', 'Козлов', 'mikhail.kozlov@company.com', '+7-904-567-8901', '2023-01-12', 120000, 1, 2, 2, '1993-02-18'),
('Ольга', 'Морозова', 'olga.morozova@company.com', '+7-905-678-9012', '2021-08-05', 85000, 1, 1, 2, '1995-09-30'),
('Андрей', 'Новиков', 'andrey.novikov@company.com', '+7-906-789-0123', '2020-06-18', 125000, 3, 5, 1, '1987-12-14'),
('Татьяна', 'Волкова', 'tatyana.volkova@company.com', '+7-907-890-1234', '2019-11-25', 110000, 2, 6, 1, '1986-04-22'),
('Сергей', 'Лебедев', 'sergey.lebedev@company.com', '+7-908-901-2345', '2022-02-14', 95000, 4, 7, 1, '1989-08-07'),
('Мария', 'Соколова', 'maria.sokolova@company.com', '+7-909-012-3456', '2023-04-03', 140000, 5, 8, 1, '1991-01-19'),
('Владимир', 'Орлов', 'vladimir.orlov@company.com', '+7-910-123-4567', '2021-12-08', 55000, 6, 9, 1, '1994-06-11');

-- Клиенты
INSERT INTO clients (company_name, contact_person, email, phone, address, city, country, client_type) VALUES
('ООО "ТехноСофт"', 'Иван Петрович', 'ivan@technosoft.ru', '+7-800-100-2030', 'ул. Ленина, 15', 'Москва', 'Россия', 'corporate'),
('ИП Сидоров А.В.', 'Алексей Сидоров', 'sidorov@mail.ru', '+7-812-300-4050', 'пр. Невский, 88', 'Санкт-Петербург', 'Россия', 'individual'),
('ЗАО "МегаТрейд"', 'Екатерина Смирнова', 'info@megatrade.ru', '+7-495-600-7080', 'Тверская ул., 12', 'Москва', 'Россия', 'corporate'),
('Министерство Образования', 'Ольга Николаевна', 'olga.n@edu.gov.ru', '+7-383-900-1020', 'ул. Советская, 45', 'Новосибирск', 'Россия', 'government'),
('ООО "ИнноваТех"', 'Павел Кузнецов', 'pavel@innovatech.ru', '+7-343-120-3040', 'ул. Малышева, 36', 'Екатеринбург', 'Россия', 'corporate');

-- Категории товаров
INSERT INTO product_categories (name, description) VALUES
('Программное обеспечение', 'Лицензии и подписки на ПО'),
('Консультации', 'Консультационные услуги по IT'),
('Разработка', 'Услуги по разработке ПО'),
('Поддержка', 'Техническая поддержка и сопровождение'),
('Обучение', 'Курсы и тренинги');

-- Товары
INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES
('CRM система "БизнесПро"', 'Система управления клиентами', 150000.00, 50, 1),
('Консультация архитектора', 'Час работы senior архитектора', 8000.00, 100, 2),
('Разработка веб-приложения', 'Создание веб-приложения под ключ', 500000.00, 20, 3),
('Техническая поддержка месяц', 'Месяц технической поддержки', 25000.00, 200, 4),
('Курс "Python для начинающих"', 'Онлайн курс программирования', 15000.00, 1000, 5),
('ERP система', 'Система планирования ресурсов', 800000.00, 10, 1),
('Аудит безопасности', 'Комплексный аудит ИБ', 120000.00, 30, 2),
('Мобильное приложение', 'Разработка мобильного приложения', 350000.00, 15, 3);

-- Проекты
INSERT INTO projects (name, description, start_date, end_date, budget, status, client_id, manager_id) VALUES
('Внедрение CRM в ТехноСофт', 'Настройка и внедрение CRM системы', '2024-01-15', '2024-06-30', 800000.00, 'completed', 1, 2),
('Разработка интернет-магазина', 'Создание интернет-магазина для ИП Сидорова', '2024-03-01', '2024-08-15', 450000.00, 'active', 2, 2),
('Автоматизация склада МегаТрейд', 'Система управления складскими процессами', '2024-05-01', '2024-12-31', 1200000.00, 'active', 3, 1),
('Портал для Минобразования', 'Образовательный портал', '2024-02-01', '2024-11-30', 950000.00, 'active', 4, 1),
('Модернизация ИТ ИнноваТех', 'Обновление ИТ инфраструктуры', '2024-06-01', '2025-03-31', 650000.00, 'planning', 5, 2);

-- Участие в проектах
INSERT INTO project_assignments (project_id, employee_id, role, hours_allocated, hourly_rate, start_date, end_date) VALUES
(1, 2, 'Руководитель проекта', 200, 3500.00, '2024-01-15', '2024-06-30'),
(1, 3, 'Senior разработчик', 400, 2500.00, '2024-01-20', '2024-06-25'),
(1, 4, 'Middle разработчик', 350, 1800.00, '2024-02-01', '2024-06-20'),
(2, 2, 'Руководитель проекта', 150, 3500.00, '2024-03-01', '2024-08-15'),
(2, 5, 'Junior разработчик', 300, 1200.00, '2024-03-05', '2024-08-10'),
(3, 1, 'Директор проекта', 100, 5000.00, '2024-05-01', '2024-12-31'),
(3, 3, 'Senior разработчик', 500, 2500.00, '2024-05-01', '2024-12-31'),
(4, 1, 'Директор проекта', 80, 5000.00, '2024-02-01', '2024-11-30'),
(4, 4, 'Middle разработчик', 600, 1800.00, '2024-02-01', '2024-11-30');

-- Задачи
INSERT INTO tasks (title, description, project_id, assigned_to, status, priority, estimated_hours, actual_hours, due_date) VALUES
('Анализ требований', 'Сбор и анализ бизнес-требований', 1, 2, 'done', 'high', 40, 45, '2024-02-15'),
('Проектирование БД', 'Создание схемы базы данных', 1, 3, 'done', 'high', 30, 28, '2024-03-01'),
('Разработка API', 'Создание REST API', 1, 4, 'done', 'medium', 80, 85, '2024-04-15'),
('Тестирование', 'Функциональное тестирование', 1, 5, 'done', 'medium', 50, 52, '2024-05-30'),
('Дизайн интерфейса', 'Создание UI/UX дизайна', 2, 5, 'done', 'high', 60, 58, '2024-04-01'),
('Фронтенд разработка', 'Создание пользовательского интерфейса', 2, 5, 'in_progress', 'high', 120, 75, '2024-07-15'),
('Интеграция с платежами', 'Подключение платежных систем', 2, 4, 'todo', 'critical', 40, NULL, '2024-07-01'),
('Архитектура системы', 'Проектирование архитектуры', 3, 1, 'done', 'critical', 50, 48, '2024-06-01'),
('Разработка модулей', 'Создание основных модулей', 3, 3, 'in_progress', 'high', 200, 120, '2024-10-15');

-- Заказы
INSERT INTO orders (client_id, order_date, delivery_date, total_amount, status, sales_person_id, discount_percent) VALUES
(1, '2024-01-10', '2024-01-25', 175000.00, 'delivered', 6, 5.0),
(2, '2024-02-15', '2024-03-01', 350000.00, 'delivered', 6, 0.0),
(3, '2024-03-20', '2024-04-10', 920000.00, 'delivered', 6, 10.0),
(1, '2024-04-05', '2024-04-20', 50000.00, 'delivered', 6, 0.0),
(4, '2024-05-12', '2024-06-01', 240000.00, 'shipped', 6, 15.0),
(5, '2024-06-18', '2024-07-15', 470000.00, 'confirmed', 6, 5.0),
(2, '2024-07-22', '2024-08-10', 75000.00, 'pending', 6, 0.0);

-- Позиции заказов
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 150000.00),
(1, 4, 1, 25000.00),
(2, 3, 1, 350000.00),
(3, 6, 1, 800000.00),
(3, 7, 1, 120000.00),
(4, 4, 2, 25000.00),
(5, 5, 16, 15000.00),
(6, 8, 1, 350000.00),
(6, 7, 1, 120000.00),
(7, 5, 5, 15000.00);

-- История изменения зарплат
INSERT INTO salary_history (employee_id, old_salary, new_salary, reason) VALUES
(3, 150000, 165000, 'Повышение за отличную работу'),
(4, 100000, 120000, 'Ежегодная индексация'),
(5, 75000, 85000, 'Повышение квалификации'),
(9, 120000, 140000, 'Расширение обязанностей');

-- ========================================
-- СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- ========================================

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ========================================
-- ПРИМЕРЫ ПОЛЕЗНЫХ ЗАПРОСОВ ДЛЯ ПРАКТИКИ
-- ========================================

/*
-- Получить всех сотрудников с их отделами и должностями
SELECT e.first_name, e.last_name, d.name as department, p.title as position, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN positions p ON e.position_id = p.position_id;

-- Найти проекты с наибольшим бюджетом
SELECT name, budget, status
FROM projects
ORDER BY budget DESC
LIMIT 5;

-- Посчитать количество сотрудников по отделам
SELECT d.name, COUNT(e.employee_id) as employee_count
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.name
ORDER BY employee_count DESC;

-- Найти задачи, которые превысили запланированное время
SELECT t.title, t.estimated_hours, t.actual_hours, 
       (t.actual_hours - t.estimated_hours) as overtime
FROM tasks t
WHERE t.actual_hours > t.estimated_hours;

-- Получить топ клиентов по сумме заказов
SELECT c.company_name, SUM(o.total_amount) as total_orders
FROM clients c
JOIN orders o ON c.client_id = o.client_id
GROUP BY c.client_id, c.company_name
ORDER BY total_orders DESC;

-- Найти самые продаваемые товары
SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as revenue
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name
ORDER BY total_sold DESC;
*/