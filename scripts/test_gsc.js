import fs from 'fs';
import crypto from 'crypto';

const keyPath = 'C:\\Users\\Public\\مجلد جديد\\ملفات تقارير الحملات\\dora-analytics-507808-40a44f426e54.json';
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaimSet = base64url(JSON.stringify(claimSet));
  const signInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = base64url(signer.sign(key.private_key));

  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  return data.access_token;
}

async function testGSC() {
  const token = await getAccessToken();
  console.log('Obtained GSC Token for scope webmasters.readonly');

  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  console.log('GSC Sites list response:', JSON.stringify(data, null, 2));
}

testGSC().catch(console.error);
