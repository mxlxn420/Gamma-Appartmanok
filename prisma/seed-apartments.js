require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    const apartments = [
      { name: "Gamma 1", slug: "gamma-1", maxGuests: 4 },
      { name: "Gamma 2", slug: "gamma-2", maxGuests: 4 },
      { name: "Gamma 3", slug: "gamma-3", maxGuests: 4 },
      { name: "Gamma 4", slug: "gamma-4", maxGuests: 4 },
    ];
    for (const a of apartments) {
      await client.query(
        `INSERT INTO "Apartment" (id, name, slug, "maxGuests", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [a.name, a.slug, a.maxGuests]
      );
    }
    console.log("✅ 4 apartman létrehozva.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
