-- Krishi Sahayak PostgreSQL Database Schema
-- Multi-role Smart Agriculture & Village Service Center Platform

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('FARMER', 'SERVICE_CENTER_STAFF', 'AGRI_EXPERT', 'ADMIN')),
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Andhra Pradesh',
  language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'te', 'hi')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  farm_name VARCHAR(100) NOT NULL,
  survey_no VARCHAR(50),
  area_acres NUMERIC(6, 2) NOT NULL,
  soil_type VARCHAR(50),
  irrigation_type VARCHAR(50),
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  season VARCHAR(20) CHECK (season IN ('Kharif', 'Rabi', 'Zaid', 'Perennial')),
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE,
  stage VARCHAR(50) DEFAULT 'Vegetative',
  health_status VARCHAR(50) DEFAULT 'Healthy',
  area_acres NUMERIC(6, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_issues (
  id VARCHAR(64) PRIMARY KEY,
  crop_id VARCHAR(64) REFERENCES crops(id) ON DELETE CASCADE,
  farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  symptoms TEXT, -- comma-separated or JSON list
  preliminary_ai_advisory TEXT,
  ai_disclaimer TEXT DEFAULT 'Automated advisory is for preliminary screening only and does NOT guarantee diagnosis. Final treatment must follow qualified agricultural expert review.',
  urgency VARCHAR(20) DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
  expert_id VARCHAR(64) REFERENCES users(id),
  expert_diagnosis TEXT,
  chemical_treatment TEXT,
  organic_treatment TEXT,
  dosage TEXT,
  spray_instructions TEXT,
  safety_precautions TEXT,
  expert_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('EQUIPMENT_RENTAL', 'SOIL_TESTING', 'DRONE_SPRAY', 'CSC_SERVICES', 'INPUTS')),
  description TEXT,
  unit VARCHAR(30) NOT NULL CHECK (unit IN ('PER_HOUR', 'PER_ACRE', 'PER_SAMPLE', 'FIXED')),
  rate_inr NUMERIC(10, 2) NOT NULL,
  subsidy_applicable BOOLEAN DEFAULT FALSE,
  subsidy_pct NUMERIC(5, 2) DEFAULT 0,
  availability_status VARCHAR(30) DEFAULT 'AVAILABLE',
  center_name VARCHAR(150) NOT NULL,
  village VARCHAR(100),
  contact_phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id VARCHAR(64) PRIMARY KEY,
  service_id VARCHAR(64) REFERENCES services(id) ON DELETE CASCADE,
  farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  quantity NUMERIC(6, 2) DEFAULT 1,
  total_amount_inr NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  farmer_notes TEXT,
  staff_notes TEXT,
  assigned_staff_id VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_health_records (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE CASCADE,
  sample_date DATE NOT NULL,
  ph_level NUMERIC(4, 2),
  organic_carbon_pct NUMERIC(4, 2),
  nitrogen_kg_ha NUMERIC(6, 2),
  phosphorus_kg_ha NUMERIC(6, 2),
  potassium_kg_ha NUMERIC(6, 2),
  zinc_ppm NUMERIC(6, 2),
  iron_ppm NUMERIC(6, 2),
  electrical_conductivity NUMERIC(5, 2),
  recommendations TEXT,
  fertilizer_plan TEXT,
  tested_by VARCHAR(64) REFERENCES users(id),
  lab_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schemes (
  id VARCHAR(64) PRIMARY KEY,
  scheme_code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_te VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200) NOT NULL,
  department VARCHAR(150) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('CENTRAL', 'STATE')),
  state_scope VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  max_benefit_inr NUMERIC(10, 2),
  benefit_summary_en TEXT,
  benefit_summary_te TEXT,
  benefit_summary_hi TEXT,
  eligibility_en TEXT,
  eligibility_te TEXT,
  eligibility_hi TEXT,
  required_documents TEXT,
  official_portal_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS scheme_applications (
  id VARCHAR(64) PRIMARY KEY,
  scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
  farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  application_no VARCHAR(50) UNIQUE NOT NULL,
  applicant_name VARCHAR(100) NOT NULL,
  aadhaar_last4 VARCHAR(4) NOT NULL,
  bank_account_last4 VARCHAR(4) NOT NULL,
  ifsc VARCHAR(20) NOT NULL,
  land_passbook_no VARCHAR(50),
  acres_applied NUMERIC(6, 2),
  documents_uploaded TEXT,
  status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED_BY_CENTER', 'REJECTED', 'SANCTIONED', 'DISBURSED')),
  verified_by VARCHAR(64) REFERENCES users(id),
  verification_notes TEXT,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_prices (
  id VARCHAR(64) PRIMARY KEY,
  commodity_en VARCHAR(100) NOT NULL,
  commodity_te VARCHAR(100) NOT NULL,
  commodity_hi VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  market_center VARCHAR(150) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  arrival_date DATE NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'Quintal',
  trend VARCHAR(20) DEFAULT 'STABLE' CHECK (trend IN ('RISING', 'STABLE', 'FALLING')),
  is_verified_feed BOOLEAN DEFAULT TRUE,
  data_source_label VARCHAR(150) DEFAULT 'e-NAM / State APMC Mandi Feed'
);

CREATE TABLE IF NOT EXISTS farm_finances (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE CASCADE,
  crop_id VARCHAR(64) REFERENCES crops(id) ON DELETE SET NULL,
  farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
  category VARCHAR(50) NOT NULL,
  amount_inr NUMERIC(10, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS advisory_alerts (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(30) DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL_PEST', 'WEATHER_ALERT')),
  district VARCHAR(100),
  state VARCHAR(100),
  broadcast_by_name VARCHAR(100),
  active_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
