-- Add showing feedback table
CREATE TABLE showing_feedback (
  id SERIAL PRIMARY KEY,
  appointment_id VARCHAR(20) REFERENCES appointments(id) ON DELETE CASCADE,
  interest_level INTEGER CHECK (interest_level >= 1 AND interest_level <= 10),
  comments TEXT,
  next_steps VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  request_sent_at TIMESTAMP,
  response_received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_showing_feedback_appointment ON showing_feedback(appointment_id);
CREATE INDEX idx_showing_feedback_status ON showing_feedback(status);
CREATE INDEX idx_showing_feedback_interest ON showing_feedback(interest_level);