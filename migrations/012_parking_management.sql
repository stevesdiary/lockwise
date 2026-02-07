-- Parking slots table
CREATE TABLE parking_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  slot_number VARCHAR(20) NOT NULL,
  slot_type VARCHAR(20) DEFAULT 'regular', -- 'regular', 'ev_charging', 'disabled', 'visitor'
  location VARCHAR(100), -- 'Building A - Level 1', 'Basement 2'
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'maintenance'
  has_ev_charger BOOLEAN DEFAULT false,
  charger_type VARCHAR(20), -- 'type2', 'ccs', 'chademo'
  charger_power INTEGER, -- in kW
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(estate_id, slot_number)
);

-- Parking assignments table (permanent resident assignments)
CREATE TABLE parking_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_plate VARCHAR(20),
  vehicle_model VARCHAR(50),
  assigned_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'revoked'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slot_id)
);

-- Guest parking releases table
CREATE TABLE guest_parking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  guest_vehicle_plate VARCHAR(20),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  access_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_time < end_time)
);

-- EV charging sessions table
CREATE TABLE ev_charging_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  energy_consumed DECIMAL(10, 2), -- in kWh
  rate_per_kwh DECIMAL(10, 2) DEFAULT 50.00, -- in NGN
  total_cost DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_id UUID REFERENCES payments(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'stopped'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_parking_slots_estate ON parking_slots(estate_id);
CREATE INDEX idx_parking_slots_status ON parking_slots(status);
CREATE INDEX idx_parking_assignments_user ON parking_assignments(user_id);
CREATE INDEX idx_parking_assignments_slot ON parking_assignments(slot_id);
CREATE INDEX idx_guest_parking_owner ON guest_parking(owner_id);
CREATE INDEX idx_guest_parking_time ON guest_parking(start_time, end_time);
CREATE INDEX idx_ev_sessions_user ON ev_charging_sessions(user_id);
CREATE INDEX idx_ev_sessions_slot ON ev_charging_sessions(slot_id);
CREATE INDEX idx_ev_sessions_status ON ev_charging_sessions(status);
