import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'prefer-not-to-say',
        is_admin BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_favorite_teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        sport TEXT NOT NULL,
        team TEXT NOT NULL,
        UNIQUE(user_id, sport)
      );

      CREATE TABLE IF NOT EXISTS venues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        type TEXT DEFAULT 'Sports Bar',
        verified BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        claimed_by UUID REFERENCES users(id),
        phone TEXT,
        website TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS venue_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_name TEXT NOT NULL,
        address TEXT NOT NULL,
        venue_type TEXT DEFAULT 'Sports Bar',
        phone TEXT,
        website TEXT,
        proof_document TEXT,
        submitted_by UUID REFERENCES users(id),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        decided_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS parties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id TEXT NOT NULL,
        sport TEXT NOT NULL,
        home_team TEXT,
        away_team TEXT,
        game_time TEXT,
        venue_name TEXT,
        venue_address TEXT,
        city TEXT,
        title TEXT,
        notes TEXT,
        max_size INTEGER DEFAULT 20,
        host_id UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS party_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS party_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        responded_at TIMESTAMPTZ,
        UNIQUE(party_id, to_user_id)
      );
    `);

    const adminCheck = await client.query("SELECT id FROM users WHERE email = 'admin@huddleup.com'");
    if (adminCheck.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        "INSERT INTO users (email, password_hash, name, gender, is_admin) VALUES ('admin@huddleup.com', $1, 'Admin', 'prefer-not-to-say', TRUE)",
        [hash]
      );
    }

    const venueCheck = await client.query("SELECT id FROM venues LIMIT 1");
    if (venueCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO venues (name, address, type, verified, featured) VALUES
        ('Buffalo Wild Wings Downtown', '123 Main St, Fort Lauderdale, FL', 'Sports Bar', TRUE, TRUE),
        ('The Pub Sports Bar', '456 Ocean Ave, Fort Lauderdale, FL', 'Sports Bar', TRUE, FALSE),
        ('Yard House', '789 Las Olas Blvd, Fort Lauderdale, FL', 'Restaurant & Bar', TRUE, TRUE),
        ('Bokampers Sports Bar', '321 Commercial Blvd, Fort Lauderdale, FL', 'Sports Bar', TRUE, FALSE)
      `);
    }

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

export default pool;
