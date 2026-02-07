-- NFC access cards table (residents only)
CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_uid VARCHAR(50) NOT NULL UNIQUE, -- Unique NFC card identifier
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'lost', 'expired'
  issued_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, estate_id)
);

-- NFC access logs table
CREATE TABLE nfc_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES nfc_cards(id) ON DELETE SET NULL,
  card_uid VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  access_point VARCHAR(100) NOT NULL, -- 'Main Gate', 'Parking Entrance', 'Building A'
  access_type VARCHAR(20) NOT NULL, -- 'entry', 'exit'
  status VARCHAR(20) NOT NULL, -- 'granted', 'denied'
  denial_reason VARCHAR(100), -- 'expired', 'suspended', 'unauthorized'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_nfc_cards_uid ON nfc_cards(card_uid);
CREATE INDEX idx_nfc_cards_user ON nfc_cards(user_id);
CREATE INDEX idx_nfc_cards_estate ON nfc_cards(estate_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_nfc_access_logs_card ON nfc_access_logs(card_id);
CREATE INDEX idx_nfc_access_logs_user ON nfc_access_logs(user_id);
CREATE INDEX idx_nfc_access_logs_timestamp ON nfc_access_logs(timestamp);
