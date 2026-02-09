-- Guidelines table
CREATE TABLE IF NOT EXISTS guidelines (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for better query performance
CREATE INDEX idx_guidelines_category ON guidelines(category);
CREATE INDEX idx_guidelines_is_active ON guidelines(is_active);
