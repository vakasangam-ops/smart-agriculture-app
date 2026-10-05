import app from '../server/src/index.js';
import { initDb } from '../server/src/db/index.js';

let isDbInitialized = false;

export default async function handler(req, res) {
  if (!isDbInitialized) {
    try {
      await initDb();
      isDbInitialized = true;
    } catch (err) {
      console.error('Serverless DB initialization note:', err.message);
    }
  }
  return app(req, res);
}
