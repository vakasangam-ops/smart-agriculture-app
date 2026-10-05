import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { getSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import os from 'os';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.TMPDIR);
const dataDir = isServerless ? path.join(os.tmpdir(), 'krishi_data') : path.resolve(__dirname, '../../data');
const jsonDbPath = path.join(dataDir, 'krishi_db.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn('Data directory creation notice:', e.message);
}

let pgPool = null;
let usePostgres = false;
let memoryStore = null;


export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  const pgHost = process.env.PGHOST;

  if (databaseUrl || pgHost) {
    try {
      pgPool = new pg.Pool({
        connectionString: databaseUrl || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${pgHost || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'krishi_sahayak'}`
      });

      // Test connection
      const testClient = await pgPool.connect();
      console.log('✅ Connected to PostgreSQL database successfully.');
      testClient.release();
      usePostgres = true;

      // Apply schema — split on semicolons, strip per-chunk comment lines first
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      const statements = schemaSql
        .split(';')
        .map(s =>
          s
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim()
        )
        .filter(s => s.length > 0);
      for (const stmt of statements) {
        await pgPool.query(stmt);
      }
      console.log('✅ Schema applied to PostgreSQL.');

      // Seed only when the users table is empty
      const userRes = await pgPool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userRes.rows[0].count, 10) === 0) {
        console.log('🌱 Seeding PostgreSQL database with initial data...');
        const seeds = await getSeedData();

        // Use a transaction + SET CONSTRAINTS ALL DEFERRED to avoid FK ordering issues
        const seedClient = await pgPool.connect();
        try {
          await seedClient.query('BEGIN');
          await seedClient.query('SET CONSTRAINTS ALL DEFERRED');

          for (const u of seeds.users) {
            await seedClient.query(
              `INSERT INTO users (id, name, phone, email, password_hash, role, village, district, state, language, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
              [u.id, u.name, u.phone, u.email, u.password_hash, u.role, u.village, u.district, u.state, u.language, u.created_at]
            );
          }
          for (const f of seeds.farms) {
            await seedClient.query(
              `INSERT INTO farms (id, user_id, farm_name, survey_no, area_acres, soil_type, irrigation_type, village, district, state, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
              [f.id, f.user_id, f.farm_name, f.survey_no, f.area_acres, f.soil_type, f.irrigation_type, f.village, f.district, f.state, f.created_at]
            );
          }
          for (const c of seeds.crops) {
            await seedClient.query(
              `INSERT INTO crops (id, farm_id, crop_name, variety, season, sowing_date, expected_harvest_date, stage, health_status, area_acres, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
              [c.id, c.farm_id, c.crop_name, c.variety, c.season, c.sowing_date, c.expected_harvest_date, c.stage, c.health_status, c.area_acres, c.created_at]
            );
          }
          for (const iss of seeds.crop_issues) {
            await seedClient.query(
              `INSERT INTO crop_issues (id, crop_id, farmer_id, title, description, image_url, symptoms, preliminary_ai_advisory, ai_disclaimer, urgency, status, expert_id, expert_diagnosis, chemical_treatment, organic_treatment, dosage, spray_instructions, safety_precautions, expert_notes, resolved_at, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
              [iss.id, iss.crop_id, iss.farmer_id, iss.title, iss.description, iss.image_url, iss.symptoms, iss.preliminary_ai_advisory, iss.ai_disclaimer, iss.urgency, iss.status, iss.expert_id, iss.expert_diagnosis, iss.chemical_treatment, iss.organic_treatment, iss.dosage, iss.spray_instructions, iss.safety_precautions, iss.expert_notes, iss.resolved_at, iss.created_at]
            );
          }
          for (const s of seeds.services) {
            await seedClient.query(
              `INSERT INTO services (id, code, name, category, description, unit, rate_inr, subsidy_applicable, subsidy_pct, availability_status, center_name, village, contact_phone)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
              [s.id, s.code, s.name, s.category, s.description, s.unit, s.rate_inr, s.subsidy_applicable, s.subsidy_pct, s.availability_status, s.center_name, s.village, s.contact_phone]
            );
          }
          for (const sb of seeds.service_bookings) {
            await seedClient.query(
              `INSERT INTO service_bookings (id, service_id, farmer_id, booking_date, time_slot, quantity, total_amount_inr, status, farmer_notes, staff_notes, assigned_staff_id, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
              [sb.id, sb.service_id, sb.farmer_id, sb.booking_date, sb.time_slot, sb.quantity, sb.total_amount_inr, sb.status, sb.farmer_notes, sb.staff_notes, sb.assigned_staff_id, sb.created_at]
            );
          }
          for (const sc of seeds.schemes) {
            await seedClient.query(
              `INSERT INTO schemes (id, scheme_code, name_en, name_te, name_hi, department, level, state_scope, category, max_benefit_inr, benefit_summary_en, benefit_summary_te, benefit_summary_hi, eligibility_en, eligibility_te, eligibility_hi, required_documents, official_portal_url, is_active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
              [sc.id, sc.scheme_code, sc.name_en, sc.name_te, sc.name_hi, sc.department, sc.level, sc.state_scope, sc.category, sc.max_benefit_inr, sc.benefit_summary_en, sc.benefit_summary_te, sc.benefit_summary_hi, sc.eligibility_en, sc.eligibility_te, sc.eligibility_hi, sc.required_documents, sc.official_portal_url, sc.is_active]
            );
          }
          for (const m of seeds.market_prices) {
            await seedClient.query(
              `INSERT INTO market_prices (id, commodity_en, commodity_te, commodity_hi, variety, market_center, district, state, arrival_date, min_price, max_price, modal_price, unit, trend, is_verified_feed, data_source_label)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
              [m.id, m.commodity_en, m.commodity_te, m.commodity_hi, m.variety, m.market_center, m.district, m.state, m.arrival_date, m.min_price, m.max_price, m.modal_price, m.unit, m.trend, m.is_verified_feed, m.data_source_label]
            );
          }

          await seedClient.query('COMMIT');
          console.log('✅ PostgreSQL seeded successfully.');
        } catch (seedErr) {
          await seedClient.query('ROLLBACK');
          console.error('❌ Seed transaction failed:', seedErr.message);
          throw seedErr;
        } finally {
          seedClient.release();
        }
      } else {
        console.log('ℹ️  PostgreSQL already has data — skipping seed.');
      }
      return;
    } catch (err) {
      console.error('❌ PostgreSQL initialization error:', err.message);
      console.warn('⚠️  Switching to resilient embedded JSON storage.');
      usePostgres = false;
      pgPool = null;
    }
  }

  // ── Embedded JSON fallback ────────────────────────────────────────────
  console.log('📦 Using high-performance embedded JSON database engine.');
  if (fs.existsSync(jsonDbPath)) {
    try {
      const data = fs.readFileSync(jsonDbPath, 'utf-8');
      memoryStore = JSON.parse(data);
      console.log('📂 Loaded existing database state from ' + jsonDbPath);
    } catch (e) {
      console.error('Error reading JSON DB, reinitializing:', e);
      memoryStore = null;
    }
  }

  if (!memoryStore) {
    const seeds = await getSeedData();
    memoryStore = seeds;
    saveToDisk();
    console.log('🌱 Seeded embedded database with authentic agricultural data.');
  }
}

function saveToDisk() {
  if (memoryStore) {
    try {
      fs.writeFileSync(jsonDbPath, JSON.stringify(memoryStore, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Persistence notice: in-memory state active (disk write avoided):', e.message);
    }
  }
}


// ── Unified Database Access Layer (PostgreSQL + Embedded Store) ──────────
export const db = {
  isPostgres: () => usePostgres,

  async find(collection, filterFn = null) {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(`SELECT * FROM ${collection}`);
      const rows = res.rows;
      return filterFn ? rows.filter(filterFn) : rows;
    }
    const items = memoryStore[collection] || [];
    return filterFn ? items.filter(filterFn) : [...items];
  },

  async findOne(collection, filterFn) {
    const items = await this.find(collection, filterFn);
    return items[0] || null;
  },

  async findById(collection, id) {
    return this.findOne(collection, item => item.id === id);
  },

  async insert(collection, item) {
    if (!item.id) {
      item.id = `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }

    if (usePostgres && pgPool) {
      const keys = Object.keys(item);
      const values = Object.values(item);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const res = await pgPool.query(sql, values);
      return res.rows[0];
    }

    if (!memoryStore[collection]) {
      memoryStore[collection] = [];
    }
    memoryStore[collection].push(item);
    saveToDisk();
    return item;
  },

  async update(collection, id, updates) {
    if (usePostgres && pgPool) {
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const sql = `UPDATE ${collection} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
      const res = await pgPool.query(sql, [...values, id]);
      return res.rows[0] || null;
    }

    const items = memoryStore[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
    saveToDisk();
    return items[index];
  },

  async delete(collection, id) {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(`DELETE FROM ${collection} WHERE id = $1 RETURNING *`, [id]);
      return res.rows[0] || null;
    }

    const items = memoryStore[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    const removed = items.splice(index, 1)[0];
    saveToDisk();
    return removed;
  },

  // Raw query — PostgreSQL only
  async rawQuery(sql, params = []) {
    if (usePostgres && pgPool) {
      return await pgPool.query(sql, params);
    }
    throw new Error('rawQuery only supported in PostgreSQL mode.');
  }
};
