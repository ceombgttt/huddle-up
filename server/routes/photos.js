import { Router } from 'express';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';

const storage = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: 'external_account',
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: 'json',
        subject_token_field_name: 'access_token',
      },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

function getPrivateObjectDir() {
  const dir = process.env.PRIVATE_OBJECT_DIR || '';
  if (!dir) throw new Error('PRIVATE_OBJECT_DIR not set');
  return dir;
}

function parseObjectPath(fullPath) {
  if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;
  const parts = fullPath.split('/');
  if (parts.length < 3) throw new Error('Invalid path');
  return {
    bucketName: parts[1],
    objectName: parts.slice(2).join('/'),
  };
}

async function isPartyMember(userId, partyId) {
  const result = await pool.query(
    `SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2
     UNION
     SELECT 1 FROM parties WHERE id = $1 AND host_id = $2`,
    [partyId, userId]
  );
  return result.rows.length > 0;
}

router.post('/parties/:partyId/upload', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const userId = req.session.userId;
    const contentType = req.headers['x-file-content-type'] || req.headers['content-type'] || 'application/octet-stream';
    const caption = req.headers['x-photo-caption'] || '';

    if (!await isPartyMember(userId, partyId)) {
      return res.status(403).json({ error: 'You must be a party member to upload photos' });
    }

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'No file data received' });
    }

    if (req.body.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 10MB.' });
    }

    const privateDir = getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateDir}/party-photos/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    await file.save(req.body, {
      metadata: { contentType: contentType.split(';')[0] },
      resumable: false,
    });

    const objectPath = `/objects/party-photos/${objectId}`;

    const result = await pool.query(
      `INSERT INTO party_photos (party_id, user_id, object_path, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [partyId, userId, objectPath, caption || null]
    );

    const photo = result.rows[0];

    const userResult = await pool.query('SELECT name, profile_picture FROM users WHERE id = $1', [userId]);
    photo.user_name = userResult.rows[0]?.name || 'Unknown';
    photo.user_profile_picture = userResult.rows[0]?.profile_picture || null;
    photo.tags = [];

    res.json(photo);
  } catch (error) {
    console.error('Party photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

router.get('/parties/:partyId/photos', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const userId = req.session.userId;

    if (!await isPartyMember(userId, partyId)) {
      return res.status(403).json({ error: 'You must be a party member to view photos' });
    }

    const photos = await pool.query(
      `SELECT pp.*, u.name as user_name, u.profile_picture as user_profile_picture
       FROM party_photos pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.party_id = $1
       ORDER BY pp.created_at DESC`,
      [partyId]
    );

    const photoIds = photos.rows.map(p => p.id);
    let tagsMap = {};
    if (photoIds.length > 0) {
      const tags = await pool.query(
        `SELECT pt.photo_id, pt.tagged_user_id, u.name as tagged_user_name, u.profile_picture as tagged_profile_picture
         FROM photo_tags pt
         JOIN users u ON u.id = pt.tagged_user_id
         WHERE pt.photo_id = ANY($1)`,
        [photoIds]
      );
      for (const tag of tags.rows) {
        if (!tagsMap[tag.photo_id]) tagsMap[tag.photo_id] = [];
        tagsMap[tag.photo_id].push({
          userId: tag.tagged_user_id,
          name: tag.tagged_user_name,
          profilePicture: tag.tagged_profile_picture,
        });
      }
    }

    const result = photos.rows.map(p => ({
      ...p,
      tags: tagsMap[p.id] || [],
    }));

    res.json(result);
  } catch (error) {
    console.error('Get party photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

router.delete('/photos/:photoId', requireAuth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.session.userId;

    const photo = await pool.query(
      'SELECT * FROM party_photos WHERE id = $1',
      [photoId]
    );

    if (photo.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const p = photo.rows[0];
    const isHost = await pool.query('SELECT 1 FROM parties WHERE id = $1 AND host_id = $2', [p.party_id, userId]);

    if (p.user_id !== userId && isHost.rows.length === 0) {
      return res.status(403).json({ error: 'Only the uploader or party host can delete photos' });
    }

    try {
      const privateDir = getPrivateObjectDir();
      const objectId = p.object_path.split('/').pop();
      const fullPath = `${privateDir}/party-photos/${objectId}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = storage.bucket(bucketName);
      await bucket.file(objectName).delete();
    } catch (err) {
      console.error('Failed to delete photo from storage:', err.message);
    }

    await pool.query('DELETE FROM party_photos WHERE id = $1', [photoId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

router.post('/photos/:photoId/tag', requireAuth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { taggedUserId } = req.body;
    const userId = req.session.userId;

    if (!taggedUserId) {
      return res.status(400).json({ error: 'taggedUserId is required' });
    }

    const photo = await pool.query('SELECT * FROM party_photos WHERE id = $1', [photoId]);
    if (photo.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const partyId = photo.rows[0].party_id;
    if (!await isPartyMember(userId, partyId)) {
      return res.status(403).json({ error: 'You must be a party member to tag photos' });
    }

    const taggedIsMember = await isPartyMember(taggedUserId, partyId);
    if (!taggedIsMember) {
      return res.status(400).json({ error: 'Can only tag party members' });
    }

    await pool.query(
      `INSERT INTO photo_tags (photo_id, tagged_user_id, tagged_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (photo_id, tagged_user_id) DO NOTHING`,
      [photoId, taggedUserId, userId]
    );

    if (taggedUserId !== userId) {
      const taggerName = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, party_id)
         VALUES ($1, 'photo_tag', 'Tagged in a Photo', $2, $3)`,
        [taggedUserId, `${taggerName.rows[0]?.name || 'Someone'} tagged you in a party photo!`, partyId]
      );
    }

    const tags = await pool.query(
      `SELECT pt.tagged_user_id as "userId", u.name, u.profile_picture as "profilePicture"
       FROM photo_tags pt
       JOIN users u ON u.id = pt.tagged_user_id
       WHERE pt.photo_id = $1`,
      [photoId]
    );

    res.json(tags.rows);
  } catch (error) {
    console.error('Tag photo error:', error);
    res.status(500).json({ error: 'Failed to tag photo' });
  }
});

router.delete('/photos/:photoId/tag/:taggedUserId', requireAuth, async (req, res) => {
  try {
    const { photoId, taggedUserId } = req.params;
    const userId = req.session.userId;

    if (taggedUserId !== userId) {
      const photo = await pool.query('SELECT user_id FROM party_photos WHERE id = $1', [photoId]);
      if (photo.rows.length === 0 || photo.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Only the tagged user or photo uploader can remove tags' });
      }
    }

    await pool.query(
      'DELETE FROM photo_tags WHERE photo_id = $1 AND tagged_user_id = $2',
      [photoId, taggedUserId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

export default router;
