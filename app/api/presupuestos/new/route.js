import { sql } from "@vercel/postgres";

function pad(num, size) {
  const s = String(num);
  return s.length >= size ? s : "0".repeat(size - s.length) + s;
}

export async function POST() {
  try {
    const name = process.env.COUNTER_NAME || "presupuesto";
    const start = parseInt(process.env.COUNTER_START || "1154", 10);
    const padding = parseInt(process.env.COUNTER_PADDING || "5", 10);

    // Ensure table exists
    await sql`CREATE TABLE IF NOT EXISTS counters (
      name text PRIMARY KEY,
      value integer NOT NULL
    )`;

    // Insert initial value if not exists, else increment
    const { rows } = await sql`
      INSERT INTO counters (name, value)
      VALUES (${name}, ${start})
      ON CONFLICT (name) DO UPDATE
        SET value = counters.value + 1
      RETURNING value
    `;

    const current = rows[0]?.value ?? start;
    const display = pad(current, padding);

    return new Response(JSON.stringify({ ok: true, number: current, display, id: display }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
