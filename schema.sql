-- User Profile & Verified Skills
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    whatsapp_number VARCHAR(20) UNIQUE,
    current_goal ENUM('job', 'entrepreneur'),
    skill_vector VECTOR(768), 
    raw_cv_text TEXT,
    credit_score INT DEFAULT 500
);

-- Quiz Performance (QuizCraft)
CREATE TABLE IF NOT EXISTS proficiencies (
    user_id VARCHAR(36),
    topic VARCHAR(100),
    score INT DEFAULT 50, -- 0 to 100
    badges JSON,
    streak INT DEFAULT 0,
    PRIMARY KEY (user_id, topic)
);

-- Recommendations & Affiliates
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    platform VARCHAR(50),
    course_name VARCHAR(255),
    affiliate_url TEXT,
    clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales & Leads (AutoRep)
CREATE TABLE IF NOT EXISTS sales_leads (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36),
    customer_phone VARCHAR(20),
    urgency ENUM('hot', 'warm', 'cold'),
    product_interest TEXT,
    status ENUM('open', 'closed_won', 'closed_lost')
);

-- Commissions Ledger (AutoRep)
CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(36),
    amount_due DECIMAL(10,2),
    status ENUM('pending', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table for SkillThinker
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100),
    company_name VARCHAR(100),
    description TEXT,
    requirements TEXT,
    description_vector VECTOR(768)
);
