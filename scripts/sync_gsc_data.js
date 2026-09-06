import fs from 'fs';
import crypto from 'crypto';

const keyPath = 'C:\\Users\\Public\\مجلد جديد\\ملفات تقارير الحملات\\dora-analytics-507808-40a44f426e54.json';
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const siteUrl = 'sc-domain:doracars.com';

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

async function querySearchConsole(token, requestBody) {
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return await res.json();
}

async function syncGSC() {
  const token = await getAccessToken();
  console.log('Got GSC Token. Querying doracars.com...');

  // 1. Overall August 2026 totals
  const totals = await querySearchConsole(token, {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
  });

  // 2. Top Queries in August 2026
  const queries = await querySearchConsole(token, {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dimensions: ['query'],
    rowLimit: 25,
  });

  // 3. Top Pages in August 2026
  const pages = await querySearchConsole(token, {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dimensions: ['page'],
    rowLimit: 15,
  });

  // 4. Devices
  const devices = await querySearchConsole(token, {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dimensions: ['device'],
  });

  // 5. Daily Trend
  const dates = await querySearchConsole(token, {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dimensions: ['date'],
  });

  const snapshot = {
    siteUrl,
    syncedAt: new Date().toISOString(),
    period: '2026-08',
    totals: totals.rows ? totals.rows[0] : null,
    queries: queries.rows || [],
    pages: pages.rows || [],
    devices: devices.rows || [],
    dailyTrend: dates.rows || [],
  };

  fs.writeFileSync(
    'C:\\Users\\Public\\مجلد جديد\\bi-platform\\src\\data\\gscLiveSnapshot.json',
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );

  console.log('Successfully saved gscLiveSnapshot.json');
  console.log('Overall Totals in August:');
  console.log(totals.rows ? totals.rows[0] : 'No totals found');
  console.log('\nTop 5 Queries:');
  queries.rows?.slice(0, 5).forEach((q, i) => {
    console.log(`${i + 1}. "${q.keys[0]}" - Clicks: ${q.clicks}, Impressions: ${q.impressions}, CTR: ${(q.ctr * 100).toFixed(2)}%, Pos: ${q.position.toFixed(1)}`);
  });
}

syncGSC().catch(console.error);
