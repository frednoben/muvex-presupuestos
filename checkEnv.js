// checkEnv.js
require('dotenv').config({ path: '.env.local' });

const v = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URI;
if (!v) {
  console.error('❌ No se encontró POSTGRES_URL (ni DATABASE_URL).');
  process.exit(1);
}
console.log('✅ Variable leída. Comienza con:', v.slice(0, 60) + '...');
