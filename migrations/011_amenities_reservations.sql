-- Amenities table
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'tennis_court', 'event_hall', 'swimming_pool', 'gym', 'clubhouse'
  capacity INTEGER,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
  operating_hours JSONB, -- {"monday": {"open": "06:00", "close": "22:00"}, ...}
  rules TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  guests_count INTEGER DEFAULT 1,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  notes TEXT,
  cancelled_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_overlap CHECK (start_time < end_time)
);

-- Indexes
CREATE INDEX idx_amenities_estate ON amenities(estate_id);
CREATE INDEX idx_amenities_status ON amenities(status);
CREATE INDEX idx_reservations_amenity ON reservations(amenity_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_time ON reservations(start_time, end_time);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Prevent overlapping reservations
CREATE UNIQUE INDEX idx_no_overlap ON reservations(amenity_id, start_time, end_time) 
WHERE status IN ('pending', 'confirmed');
