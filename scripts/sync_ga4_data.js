import fs from 'fs';
import crypto from 'crypto';

const keyPath = 'C:\\Users\\Public\\مجلد جديد\\ملفات تقارير الحملات\\dora-analytics-507808-40a44f426e54.json';
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const propertyId = '421858793';

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
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
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

async function fetchComprehensiveGA4() {
  const token = await getAccessToken();

  // 1. August 2026 Traffic & Revenue by Channel
  const resAug = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-31' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
    }),
  });
  const dataAug = await resAug.json();

  // 2. August 2026 by Device & City
  const resGeo = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-31' }],
      dimensions: [{ name: 'city' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'totalRevenue' },
      ],
      limit: 10,
    }),
  });
  const dataGeo = await resGeo.json();

  // 3. August 2026 E-commerce funnel (events)
  const resEvents = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-31' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase'],
          },
        },
      },
    }),
  });
  const dataEvents = await resEvents.json();

  const snapshot = {
    propertyId,
    syncedAt: new Date().toISOString(),
    period: '2026-08',
    channelReport: dataAug,
    cityReport: dataGeo,
    funnelReport: dataEvents,
  };

  fs.writeFileSync('C:\\Users\\Public\\مجلد جديد\\bi-platform\\src\\data\\ga4LiveSnapshot.json', JSON.stringify(snapshot, null, 2), 'utf8');
  console.log('Successfully written ga4LiveSnapshot.json');
  console.log('August 2026 Channels Summary:');
  dataAug.rows?.forEach(r => {
    console.log(`Channel: ${r.dimensionValues[0].value}, Users: ${r.metricValues[0].value}, Views: ${r.metricValues[1].value}, Revenue: ${r.metricValues[4].value} SAR`);
  });
}

fetchComprehensiveGA4().catch(console.error);
