/**
 * Cloudflare Worker - Meta Graph API CORS Proxy
 * Dora Cars Social Bot - v2 with Instagram Support
 * 
 * Routes:
 *   GET  /conversations?pageId=...&token=...&platform=messenger|instagram   → جلب المحادثات
 *   GET  /instagram-conversations?pageId=...&token=...                       → انستغرام فقط
 *   POST /send-message   { recipientId, messageText, pageId?, token? }       → إرسال رسالة ماسنجر
 *   POST /send-instagram-message { igUserId, recipientId, messageText, token } → إرسال رسالة انستغرام
 *   GET  /health
 */

const ALLOWED_ORIGINS = [
  'https://yahya27390-art.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const META_API_BASE = 'https://graph.facebook.com/v20.0';
const DEFAULT_PAGE_ID = '560031747184578';
const DEFAULT_PAGE_TOKEN = 'EAAeg0uiXakwBSTdf3pZC1CmD4H4E91q0Y4g13NWjlZChAZAdkQJyc9nK8UikcTp02TE3NMYvZA8qPNDxuV40HfiZCOdGmLTclafYKtrx7ZAwkwxjGFED4PXBPV7iZCXmXhal16DBX1O2Ek6HyZAk8zDejy1jjjavVnHMixRGWojdPJquUjGE3tssA0IpBTHlChl12ZAqVD5VF';

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── GET /health ──────────────────────────────────────────────────────────
      if (path === '/health' || path === '/') {
        return jsonResponse({
          status: 'ok',
          service: 'Dora Cars Meta Live Webhook Hub (ManyChat / Chatwoot Clone)',
          timestamp: new Date().toISOString(),
        }, 200, cors);
      }

      // ── GET /webhook (Meta Verification Challenge) ───────────────────────────
      if (path === '/webhook' && request.method === 'GET') {
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');
        const VERIFY_TOKEN = 'dora_cars_webhook_secret_2026';

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
        return new Response('Verification failed', { status: 403 });
      }

      // ── POST /webhook (Meta Real-Time Incoming Messages) ─────────────────────
      if (path === '/webhook' && request.method === 'POST') {
        try {
          const payload = await request.json();
          console.log('Incoming Meta Webhook:', JSON.stringify(payload));
          return new Response('EVENT_RECEIVED', { status: 200 });
        } catch (e) {
          return new Response('BAD_REQUEST', { status: 400 });
        }
      }

      // ── GET /conversations ────────────────────────────────────────────────────
      // يدعم platform=messenger أو platform=instagram أو بدون (الكل)
      if (path === '/conversations' && request.method === 'GET') {
        const pageId   = url.searchParams.get('pageId')   || DEFAULT_PAGE_ID;
        const token    = url.searchParams.get('token')    || DEFAULT_PAGE_TOKEN;
        const platform = url.searchParams.get('platform'); // 'messenger' | 'instagram' | null
        const limit    = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
        const fields   = 'id,updated_time,unread_count,senders,messages.limit(15){id,message,created_time,from}';

        // بناء URL مع platform إن وجد
        let metaUrl = `${META_API_BASE}/${pageId}/conversations?fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
        if (platform) {
          metaUrl += `&platform=${encodeURIComponent(platform)}`;
        }

        const res  = await fetch(metaUrl, { headers: { 'User-Agent': 'Dora-Cars-Bot/2.0' } });
        const data = await res.json();

        if (data.error) {
          return jsonResponse({ error: true, message: data.error.message, code: data.error.code, platform }, 400, cors);
        }

        return jsonResponse({
          success: true,
          platform: platform || 'all',
          data: data.data || [],
          paging: data.paging || null,
          fetchedAt: new Date().toISOString(),
        }, 200, cors);
      }

      // ── GET /instagram-conversations ──────────────────────────────────────────
      // اختصار لجلب محادثات انستغرام فقط
      if (path === '/instagram-conversations' && request.method === 'GET') {
        const pageId = url.searchParams.get('pageId') || DEFAULT_PAGE_ID;
        const token  = url.searchParams.get('token')  || DEFAULT_PAGE_TOKEN;
        const limit  = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
        const fields = 'id,updated_time,unread_count,senders,messages.limit(15){id,message,created_time,from}';

        const metaUrl = `${META_API_BASE}/${pageId}/conversations?platform=instagram&fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

        const res  = await fetch(metaUrl, { headers: { 'User-Agent': 'Dora-Cars-Bot/2.0' } });
        const data = await res.json();

        if (data.error) {
          return jsonResponse({
            error: true,
            message: data.error.message,
            code: data.error.code,
            hint: 'تأكد أن حساب Instagram مربوط بصفحة Facebook عبر Meta Business Suite',
          }, 400, cors);
        }

        return jsonResponse({
          success: true,
          platform: 'instagram',
          data: data.data || [],
          paging: data.paging || null,
          fetchedAt: new Date().toISOString(),
        }, 200, cors);
      }

      // ── POST /send-message (Facebook Messenger) ───────────────────────────────
      if (path === '/send-message' && request.method === 'POST') {
        const body = await request.json();
        const { recipientId, messageText, pageId, token } = body;

        if (!recipientId || !messageText) {
          return jsonResponse({ error: true, message: 'recipientId و messageText مطلوبان' }, 400, cors);
        }

        const useToken  = token  || DEFAULT_PAGE_TOKEN;
        const usePageId = pageId || DEFAULT_PAGE_ID;

        const metaUrl = `${META_API_BASE}/${usePageId}/messages?access_token=${encodeURIComponent(useToken)}`;
        const res = await fetch(metaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Dora-Cars-Bot/2.0' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: messageText },
            messaging_type: 'RESPONSE',
          }),
        });

        const data = await res.json();
        if (data.error) {
          return jsonResponse({ error: true, message: data.error.message }, 400, cors);
        }

        return jsonResponse({
          success: true,
          platform: 'messenger',
          messageId: data.message_id,
          recipientId: data.recipient_id,
          sentAt: new Date().toISOString(),
        }, 200, cors);
      }

      // ── POST /send-instagram-message ──────────────────────────────────────────
      // إرسال رسالة مباشرة لمستخدم انستغرام (Instagram DM Reply)
      if (path === '/send-instagram-message' && request.method === 'POST') {
        const body = await request.json();
        const { igUserId, recipientId, messageText, token, pageId } = body;

        if (!recipientId || !messageText) {
          return jsonResponse({ error: true, message: 'recipientId و messageText مطلوبان' }, 400, cors);
        }

        // نستخدم نفس endpoint صفحة الفيسبوك - Meta تتحكم بالتوجيه لانستغرام تلقائياً
        const useToken  = token  || DEFAULT_PAGE_TOKEN;
        const usePageId = igUserId || pageId || DEFAULT_PAGE_ID;

        const metaUrl = `${META_API_BASE}/${usePageId}/messages?access_token=${encodeURIComponent(useToken)}`;
        const res = await fetch(metaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Dora-Cars-Bot/2.0' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: messageText },
            messaging_type: 'RESPONSE',
          }),
        });

        const data = await res.json();
        if (data.error) {
          return jsonResponse({
            error: true,
            message: data.error.message,
            hint: 'تأكد أن recipientId صحيح (IGSID) وأن التوكن يملك instagram_manage_messages',
          }, 400, cors);
        }

        return jsonResponse({
          success: true,
          platform: 'instagram',
          messageId: data.message_id,
          recipientId: data.recipient_id,
          sentAt: new Date().toISOString(),
        }, 200, cors);
      }

      // ── GET /ig-account ───────────────────────────────────────────────────────
      // جلب معلومات حساب Instagram المربوط بالصفحة
      if (path === '/ig-account' && request.method === 'GET') {
        const pageId = url.searchParams.get('pageId') || DEFAULT_PAGE_ID;
        const token  = url.searchParams.get('token')  || DEFAULT_PAGE_TOKEN;

        const metaUrl = `${META_API_BASE}/${pageId}?fields=instagram_business_account{id,name,username,profile_picture_url,followers_count}&access_token=${encodeURIComponent(token)}`;
        const res  = await fetch(metaUrl, { headers: { 'User-Agent': 'Dora-Cars-Bot/2.0' } });
        const data = await res.json();

        if (data.error) {
          return jsonResponse({ error: true, message: data.error.message }, 400, cors);
        }

        return jsonResponse({
          success: true,
          pageId: data.id,
          instagramAccount: data.instagram_business_account || null,
          isConnected: !!data.instagram_business_account,
        }, 200, cors);
      }

      // 404
      return jsonResponse({ error: true, message: 'Route not found' }, 404, cors);

    } catch (err) {
      return jsonResponse({ error: true, message: err.message || 'Internal error' }, 500, cors);
    }
  }
};
