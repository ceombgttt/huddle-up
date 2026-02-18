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

async function signObjectURL({ bucketName, objectName, method, ttlSec }) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to sign object URL: ${response.status}`);
  }
  const { signed_url } = await response.json();
  return signed_url;
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

router.post('/profile-picture/request-url', requireAuth, async (req, res) => {
  try {
    const { contentType } = req.body;
    
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const privateDir = getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateDir}/profile-pictures/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: 'PUT',
      ttlSec: 900,
    });

    const objectPath = `/objects/profile-pictures/${objectId}`;

    res.json({ uploadURL, objectPath });
  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

router.post('/profile-picture/save', requireAuth, async (req, res) => {
  try {
    const { objectPath } = req.body;
    if (!objectPath || !objectPath.startsWith('/objects/profile-pictures/')) {
      return res.status(400).json({ error: 'Invalid object path' });
    }

    await pool.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [objectPath, req.session.userId]
    );

    res.json({ profilePicture: objectPath });
  } catch (error) {
    console.error('Save profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/profile-picture', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET profile_picture = NULL WHERE id = $1',
      [req.session.userId]
    );
    res.json({ profilePicture: null });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/venue-image/request-url', requireAuth, async (req, res) => {
  try {
    const { contentType, imageType } = req.body;

    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    if (!['logo', 'picture', 'sponsor-logo'].includes(imageType)) {
      return res.status(400).json({ error: 'Invalid image type' });
    }

    const privateDir = getPrivateObjectDir();
    const objectId = randomUUID();
    const folder = imageType === 'logo' ? 'venue-logos' : imageType === 'sponsor-logo' ? 'sponsor-logos' : 'venue-pictures';
    const fullPath = `${privateDir}/${folder}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: 'PUT',
      ttlSec: 900,
    });

    const objectPath = `/objects/${folder}/${objectId}`;

    res.json({ uploadURL, objectPath });
  } catch (error) {
    console.error('Venue image upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

router.post('/venue-image/upload', requireAuth, async (req, res) => {
  try {
    const imageType = req.headers['x-image-type'] || '';
    const contentType = req.headers['x-file-content-type'] || req.headers['content-type'] || 'application/octet-stream';

    console.log('Venue image upload - imageType:', imageType, 'contentType:', contentType, 'bodyType:', typeof req.body, 'bodyLength:', req.body?.length || 0, 'isBuffer:', Buffer.isBuffer(req.body));

    if (!['logo', 'picture', 'sponsor-logo'].includes(imageType)) {
      return res.status(400).json({ error: 'Invalid image type. Set x-image-type header.' });
    }

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'No file data received' });
    }

    const privateDir = getPrivateObjectDir();
    const objectId = randomUUID();
    const folder = imageType === 'logo' ? 'venue-logos' : imageType === 'sponsor-logo' ? 'sponsor-logos' : 'venue-pictures';
    const fullPath = `${privateDir}/${folder}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    await file.save(req.body, {
      metadata: { contentType: contentType.split(';')[0] },
      resumable: false,
    });

    const objectPath = `/objects/${folder}/${objectId}`;
    res.json({ objectPath });
  } catch (error) {
    console.error('Venue image direct upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/profile-picture/upload', requireAuth, async (req, res) => {
  try {
    const contentType = req.headers['x-file-content-type'] || req.headers['content-type'] || 'application/octet-stream';

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'No file data received' });
    }

    const privateDir = getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateDir}/profile-pictures/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    await file.save(req.body, {
      metadata: { contentType: contentType.split(';')[0] },
      resumable: false,
    });

    const objectPath = `/objects/profile-pictures/${objectId}`;

    await pool.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [objectPath, req.session.userId]
    );

    res.json({ objectPath, profilePicture: objectPath });
  } catch (error) {
    console.error('Profile picture direct upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

router.get('/serve/*', async (req, res) => {
  try {
    const objectSubPath = req.params[0];
    const allowedPrefixes = ['profile-pictures/', 'venue-logos/', 'venue-pictures/', 'sponsor-logos/', 'party-photos/'];
    if (!allowedPrefixes.some(p => objectSubPath.startsWith(p))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const privateDir = getPrivateObjectDir();
    const fullPath = `${privateDir}/${objectSubPath}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [metadata] = await file.getMetadata();
    res.set({
      'Content-Type': metadata.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    });

    file.createReadStream().pipe(res);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;
