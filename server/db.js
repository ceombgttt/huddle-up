import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
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
        country TEXT,
        profile_picture TEXT,
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
        featured_tier TEXT DEFAULT 'standard',
        featured_until TIMESTAMPTZ,
        featured_subscription_id TEXT,
        claimed_by UUID REFERENCES users(id),
        phone TEXT,
        website TEXT,
        city TEXT,
        capacity INTEGER,
        description TEXT,
        venue_trial_ends_at TIMESTAMPTZ,
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

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        logo TEXT,
        website TEXT,
        notes TEXT,
        amount_paid NUMERIC(10,2) DEFAULT 0,
        payment_frequency TEXT DEFAULT 'one-time' CHECK (payment_frequency IN ('one-time', 'monthly', 'quarterly', 'yearly')),
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE sponsors DROP COLUMN IF EXISTS venue_id;
      ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS tagline TEXT;
      ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS target_sports TEXT[] DEFAULT '{}';
      ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS sponsor_tier TEXT DEFAULT 'standard';
      ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS slot_number INTEGER;

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        daily_push_count INTEGER DEFAULT 0,
        last_push_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(endpoint)
      );

      CREATE TABLE IF NOT EXISTS score_watches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        sport TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        last_notified_score TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, game_id)
      );

      ALTER TABLE parties ADD COLUMN IF NOT EXISTS supported_team TEXT;

      CREATE TABLE IF NOT EXISTS party_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        responded_at TIMESTAMPTZ,
        UNIQUE(user_id, friend_id)
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_city TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS logo TEXT;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS picture TEXT;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS venue_trial_ends_at TIMESTAMPTZ;
      ALTER TABLE raffles ADD COLUMN IF NOT EXISTS image_url TEXT;

      CREATE TABLE IF NOT EXISTS referral_conversions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referral_code TEXT NOT NULL,
        referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subscription_tier TEXT,
        commission_amount NUMERIC(10,2) DEFAULT 0,
        commission_pct NUMERIC(5,2) DEFAULT 10,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS party_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        object_path TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS photo_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        photo_id UUID REFERENCES party_photos(id) ON DELETE CASCADE,
        tagged_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        tagged_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(photo_id, tagged_user_id)
      );

      CREATE TABLE IF NOT EXISTS user_points (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_points INTEGER DEFAULT 0,
        lifetime_points INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS points_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        reference_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        points_cost INTEGER NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        status TEXT DEFAULT 'redeemed' CHECK (status IN ('redeemed', 'used', 'expired')),
        redeemed_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS venue_checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        venue_name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        qr_verified BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, party_id)
      );

      CREATE TABLE IF NOT EXISTS venue_qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_rotated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_venue_qr_token ON venue_qr_codes(token) WHERE active = TRUE;

      CREATE TABLE IF NOT EXISTS fantasy_leagues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        platform TEXT NOT NULL DEFAULT 'espn',
        sport TEXT NOT NULL DEFAULT 'NFL',
        season TEXT,
        commissioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fantasy_teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_name TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        points NUMERIC(10,2) DEFAULT 0,
        rank INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(league_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS fantasy_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES fantasy_teams(id) ON DELETE CASCADE,
        player_name TEXT NOT NULL,
        position TEXT,
        nfl_team TEXT,
        points NUMERIC(10,2) DEFAULT 0,
        is_starter BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS party_fantasy_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
        linked_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id, league_id)
      );

      ALTER TABLE party_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
      ALTER TABLE party_messages ADD COLUMN IF NOT EXISTS fantasy_context JSONB;

      CREATE TABLE IF NOT EXISTS party_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        atmosphere INTEGER CHECK (atmosphere >= 1 AND atmosphere <= 5),
        food INTEGER CHECK (food >= 1 AND food <= 5),
        crowd_energy INTEGER CHECK (crowd_energy >= 1 AND crowd_energy <= 5),
        overall INTEGER CHECK (overall >= 1 AND overall <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_dm_participants ON direct_messages(sender_id, receiver_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_dm_receiver_unread ON direct_messages(receiver_id, is_read) WHERE is_read = FALSE;

      CREATE TABLE IF NOT EXISTS team_chat_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sport TEXT NOT NULL,
        team_name TEXT NOT NULL,
        team_abbrev TEXT,
        logo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(sport, team_name)
      );

      CREATE TABLE IF NOT EXISTS team_chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_team_chat_messages_room ON team_chat_messages(room_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS team_chat_bans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS party_highlights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recap_text TEXT,
        photos TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id)
      );

      CREATE TABLE IF NOT EXISTS promoted_parties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
        tier TEXT DEFAULT 'standard',
        start_at TIMESTAMPTZ DEFAULT NOW(),
        end_at TIMESTAMPTZ,
        stripe_session_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS party_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        price_cents INTEGER NOT NULL DEFAULT 0,
        capacity INTEGER,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id)
      );

      CREATE TABLE IF NOT EXISTS ticket_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount_cents INTEGER NOT NULL,
        stripe_payment_intent TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(party_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        team_alerts BOOLEAN DEFAULT TRUE,
        rivalry_alerts BOOLEAN DEFAULT TRUE,
        suggested_parties BOOLEAN DEFAULT TRUE,
        game_reminders BOOLEAN DEFAULT TRUE,
        party_reminders BOOLEAN DEFAULT TRUE,
        prediction_reminders BOOLEAN DEFAULT TRUE,
        prediction_results BOOLEAN DEFAULT TRUE,
        raffle_winners BOOLEAN DEFAULT TRUE,
        nearby_parties BOOLEAN DEFAULT TRUE,
        friend_activity BOOLEAN DEFAULT TRUE,
        achievement_unlocks BOOLEAN DEFAULT TRUE,
        push_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rivalry_pairs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sport TEXT NOT NULL,
        team_a TEXT NOT NULL,
        team_b TEXT NOT NULL,
        intensity TEXT DEFAULT 'high',
        UNIQUE(sport, team_a, team_b)
      );

      CREATE TABLE IF NOT EXISTS affiliates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        code TEXT UNIQUE NOT NULL,
        commission_type TEXT DEFAULT 'per_signup',
        commission_amount_cents INTEGER DEFAULT 500,
        commission_rate NUMERIC(4,2) DEFAULT 0.30,
        max_redemptions INTEGER,
        expiration_date TIMESTAMPTZ,
        dashboard_token TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        payment_method TEXT DEFAULT 'paypal',
        payment_details TEXT,
        notes TEXT,
        total_earned_cents INTEGER DEFAULT 0,
        total_paid_cents INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS affiliate_referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        user_email TEXT,
        commission_cents INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        trial_start_date TIMESTAMPTZ,
        trial_end_date TIMESTAMPTZ,
        converted_to_paid BOOLEAN DEFAULT FALSE,
        subscription_active BOOLEAN DEFAULT FALSE,
        monthly_commission_cents INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS affiliate_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
        amount_cents INTEGER NOT NULL,
        payment_method TEXT,
        payment_reference TEXT,
        notes TEXT,
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_number INTEGER;

      ALTER TABLE parties ADD COLUMN IF NOT EXISTS ticket_price_cents INTEGER DEFAULT 0;
      ALTER TABLE parties ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;
      ALTER TABLE parties ADD COLUMN IF NOT EXISTS has_recap BOOLEAN DEFAULT FALSE;
      ALTER TABLE parties ADD COLUMN IF NOT EXISTS hot_score INTEGER DEFAULT 0;
      ALTER TABLE parties ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

      ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

      CREATE TABLE IF NOT EXISTS venue_promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        sport TEXT,
        game_date TIMESTAMPTZ,
        home_team TEXT,
        away_team TEXT,
        specials TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS venue_deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        deal_type TEXT DEFAULT 'special',
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_until TIMESTAMPTZ,
        terms TEXT,
        recurring BOOLEAN DEFAULT FALSE,
        recurring_days TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const adminCheck = await client.query("SELECT id FROM users WHERE email = 'admin@huddleupusa.com'");
    if (adminCheck.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        "INSERT INTO users (email, password_hash, name, gender, is_admin) VALUES ('admin@huddleupusa.com', $1, 'Admin', 'prefer-not-to-say', TRUE)",
        [hash]
      );
    }

    const rewardsCheck = await client.query("SELECT id FROM rewards LIMIT 1");
    if (rewardsCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO rewards (name, description, points_cost, category, icon) VALUES
        ('Free Drink', 'Redeem for a free drink at any partner venue', 500, 'drinks', '🍺'),
        ('Free Month Fan Subscription', 'Get one month of Fan tier subscription for free', 1000, 'subscription', '⭐'),
        ('Merch Discount 20%', 'Get 20% off official Huddle Up merchandise', 300, 'merch', '👕'),
        ('VIP Party Host Badge', 'Unlock the exclusive VIP Party Host badge on your profile', 750, 'badge', '🏆'),
        ('Premium Drink Upgrade', 'Upgrade to a premium drink at partner venues', 350, 'drinks', '🍸'),
        ('Free Appetizer', 'Redeem for a free appetizer at partner venues', 400, 'drinks', '🍗'),
        ('Exclusive Merch Item', 'Get an exclusive limited-edition Huddle Up item', 1500, 'merch', '🧢'),
        ('Priority Seating', 'Get priority seating at partner venues for watch parties', 600, 'perks', '💺')
      `);
    }

    const venueCheck = await client.query("SELECT id FROM venues LIMIT 1");
    if (venueCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO venues (name, address, type, verified, featured, city, latitude, longitude) VALUES
        ('Buffalo Wild Wings Downtown', '123 Main St, Fort Lauderdale, FL', 'Sports Bar', TRUE, TRUE, 'Fort Lauderdale', 26.12230000, -80.14360000),
        ('The Pub Sports Bar', '456 Ocean Ave, Fort Lauderdale, FL', 'Sports Bar', TRUE, FALSE, 'Fort Lauderdale', 26.11920000, -80.10540000),
        ('Yard House', '789 Las Olas Blvd, Fort Lauderdale, FL', 'Restaurant & Bar', TRUE, TRUE, 'Fort Lauderdale', 26.11890000, -80.13780000),
        ('Bokampers Sports Bar', '321 Commercial Blvd, Fort Lauderdale, FL', 'Sports Bar', TRUE, FALSE, 'Fort Lauderdale', 26.18470000, -80.12450000)
      `);
    }

    await client.query(`
      UPDATE venues SET latitude = 26.12230000, longitude = -80.14360000, city = COALESCE(NULLIF(city, ''), 'Fort Lauderdale') WHERE latitude IS NULL AND name ILIKE '%Buffalo Wild Wings%' AND address ILIKE '%Fort Lauderdale%';
      UPDATE venues SET latitude = 26.11920000, longitude = -80.10540000, city = COALESCE(NULLIF(city, ''), 'Fort Lauderdale') WHERE latitude IS NULL AND name ILIKE '%Pub Sports%' AND address ILIKE '%Fort Lauderdale%';
      UPDATE venues SET latitude = 26.11890000, longitude = -80.13780000, city = COALESCE(NULLIF(city, ''), 'Fort Lauderdale') WHERE latitude IS NULL AND name ILIKE '%Yard House%' AND address ILIKE '%Fort Lauderdale%';
      UPDATE venues SET latitude = 26.18470000, longitude = -80.12450000, city = COALESCE(NULLIF(city, ''), 'Fort Lauderdale') WHERE latitude IS NULL AND name ILIKE '%Bokampers%';

      CREATE INDEX IF NOT EXISTS idx_parties_trending ON parties(is_trending, hot_score DESC);
      CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_parties_host_id ON parties(host_id);
      CREATE INDEX IF NOT EXISTS idx_parties_game_id ON parties(game_id);
      CREATE INDEX IF NOT EXISTS idx_parties_game_time ON parties(game_time);
      CREATE INDEX IF NOT EXISTS idx_parties_last_chance ON parties(game_time) WHERE game_time IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_venues_claimed_by ON venues(claimed_by) WHERE claimed_by IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_party_attendees_party ON party_attendees(party_id);
      CREATE INDEX IF NOT EXISTS idx_party_attendees_user ON party_attendees(user_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        sport TEXT NOT NULL,
        home_team TEXT,
        away_team TEXT,
        picked_team TEXT NOT NULL,
        confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 10),
        status TEXT DEFAULT 'pending',
        winner TEXT,
        points_earned INTEGER DEFAULT 0,
        game_time TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, game_id)
      );

      CREATE TABLE IF NOT EXISTS prediction_streaks (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        total_correct INTEGER DEFAULT 0,
        total_predictions INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS venue_follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(venue_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS venue_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        atmosphere INTEGER CHECK (atmosphere >= 1 AND atmosphere <= 5),
        service INTEGER CHECK (service >= 1 AND service <= 5),
        value INTEGER CHECK (value >= 1 AND value <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(venue_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS venue_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        connected_at TIMESTAMPTZ DEFAULT NOW(),
        signup_source VARCHAR(50) DEFAULT 'qr_code',
        last_visit TIMESTAMPTZ,
        total_visits INTEGER DEFAULT 0,
        favorite BOOLEAN DEFAULT FALSE,
        notes TEXT,
        UNIQUE(venue_id, user_id)
      );
    `);

    await client.query(`
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS signup_qr_code TEXT UNIQUE;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS qr_code_enabled BOOLEAN DEFAULT TRUE;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS total_signups_via_qr INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_venue_id UUID REFERENCES venues(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_qr_code TEXT;
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

export default pool;
