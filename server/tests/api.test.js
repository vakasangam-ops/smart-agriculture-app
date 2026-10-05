import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/index.js';
import { initDb } from '../src/db/index.js';

test.before(async () => {
  await initDb();
});

test('GET /api/health returns ONLINE status', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ONLINE');
});

test('POST /api/auth/demo-login logs in as FARMER and returns valid token', async () => {
  const res = await request(app)
    .post('/api/auth/demo-login')
    .send({ role: 'FARMER' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token, 'Token should be returned');
  assert.strictEqual(res.body.user.role, 'FARMER');
});

test('POST /api/auth/demo-login logs in as AGRI_EXPERT and returns valid token', async () => {
  const res = await request(app)
    .post('/api/auth/demo-login')
    .send({ role: 'AGRI_EXPERT' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token, 'Token should be returned');
  assert.strictEqual(res.body.user.role, 'AGRI_EXPERT');
});

test('GET /api/schemes returns list of government schemes with multi-lingual data', async () => {
  const res = await request(app).get('/api/schemes');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.schemes));
  assert.ok(res.body.schemes.length >= 4);

  const pmkisan = res.body.schemes.find(s => s.scheme_code === 'PM-KISAN');
  assert.ok(pmkisan);
  assert.ok(pmkisan.name_te);
  assert.ok(pmkisan.name_hi);
});

test('GET /api/market returns mandi APMC prices with honest verification label', async () => {
  const res = await request(app).get('/api/market');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.prices));
  assert.ok(res.body.prices.length > 0);
  assert.strictEqual(res.body.prices[0].is_verified_feed, true);
});

test('GET /api/weather/forecast returns agricultural weather & spray advisory', async () => {
  const res = await request(app).get('/api/weather/forecast?zone=guntur');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.current);
  assert.ok(res.body.spray_advisor);
  assert.ok(res.body.spray_advisor.label_te);
  assert.ok(res.body.spray_advisor.label_hi);
});

test('POST /api/issues attaches preliminary disclaimer and preserves honest diagnosis principles', async () => {
  // Login first as farmer
  const loginRes = await request(app)
    .post('/api/auth/demo-login')
    .send({ role: 'FARMER' });
  const token = loginRes.body.token;

  const issueRes = await request(app)
    .post('/api/issues')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Leaves curling upward and yellowish',
      description: 'Chilli leaves curling upwards with boat shape and thrips present',
      symptoms: 'Curling, boat shape, thrips',
      urgency: 'HIGH'
    });

  assert.strictEqual(issueRes.status, 201);
  assert.ok(issueRes.body.issue);
  assert.strictEqual(issueRes.body.issue.status, 'OPEN');
  assert.ok(issueRes.body.issue.ai_disclaimer.includes('screening only and does NOT guarantee diagnosis'));
});
