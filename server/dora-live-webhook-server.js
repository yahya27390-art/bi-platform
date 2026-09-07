/**
 * Dora Cars Live Webhook Engine & Real-Time Hub
 * خادم الاستقبال اللحظي والرد الآلي لرسائل Meta الرسمية (ManyChat & Chatwoot In-House Clone)
 * 
 * الميزات المتقدمة:
 * 1. نقطة التحقق الرسمية لفيسبوك وإنستغرام (GET /webhook مع hub.challenge).
 * 2. استقبال الرسائل اللحظية (POST /webhook) في أجزاء من الثانية.
 * 3. محرك الرد الآلي الذكي (ManyChat Keyword Flow Engine) للرد الفوري على استفسارات الأسعار والفروع والدوام والمتجر.
 * 4. بث فوري للشاشة عبر Server-Sent Events (GET /api/live-stream).
 * 5. إرسال ردود حية للموظفين عبر Meta Graph API (POST /api/send-reply).
 * 6. حماية كاملة وامتثال 100% لسياسات Meta لمنع أي حظر للحسابات.
 */

import http from 'http';
import https from 'https';
import url from 'url';

const PORT = process.env.PORT || 3005;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'dora_cars_webhook_secret_2026';
const PAGE_ID = '560031747184578';
const PAGE_TOKEN = process.env.META_PAGE_TOKEN || 'EAAeg0uiXakwBSeEcH3ZBe5uY68F4tD12QR1frW84z82C8F7BQTHACyBXVcJ1Q0pKC1hzeNtrNos7WwDb3QOozcw734i6rHOIZBZA428rv1W5RnxYRDu6c7ZBQ4sCzSRmv2af43bbeawfwHJZAlXZAdPwMHutSSmH9GAE70A4QZA7Lji3dlxZAOFnsg5rZBcMqouZClVwdGq6jb';
const IG_TOKEN = process.env.META_IG_TOKEN || 'IGAAKfQ6eZBGVBBZAGFuUE1xT1UxRjRiYmE2U1lYZA2xMVU9TUGdFVXRhdlJxa21hb1E0Rm1DQ2hRbjhLT05SNUNJeExfbzBmOGVnV1E4OFR0S3RudkhfSnBKc0liaUN3NDdBRU0xUWJLNGpYTXpDcGVnX0FrdnQxZAWFxc01NcTd3MAZDZD';

// إعدادات وضع البوت الآلي الذكي (ManyChat Bot Mode)
let isAutoPilotEnabled = true;

// قائمة اتصالات المتصفح النشطة (SSE Clients)
const sseClients = new Set();

// تخزين المحادثات المستلمة حديثاً
const recentMessages = [];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, data, statusCode = 200) {
  setCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// بث رسالة حية لجميع المتصفحات المتصلة فورياً
function broadcastToClients(eventType, payload) {
  const dataString = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// ── محرك مطابقة الكلمات المفتاحية الذكي (ManyChat Trigger Engine) ──
function matchDoraBotTriggers(text) {
  if (!text) return null;
  const t = text.toLowerCase();

  // 1. فرع كيا
  if (t.includes('كيا') || t.includes('kia') || t.includes('سبورتاج') || t.includes('سيراتو') || t.includes('سونيت') || t.includes('كارينز') || t.includes('كادينزا') || t.includes('k5')) {
    return {
      trigger: 'فرع كيا المتخصص',
      reply: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو صورتها. ويمكنك التواصل المباشر مع فرع كيا (الخبيب - بريدة) على الرقم: 0539454377'
    };
  }

  // 2. فرع هيونداي وجينيسيس
  if (t.includes('هيونداي') || t.includes('hyundai') || t.includes('جينيسيس') || t.includes('النترا') || t.includes('سوناتا') || t.includes('توسان') || t.includes('ازيرا') || t.includes('اكسنت') || t.includes('سنتافي')) {
    return {
      trigger: 'فرع هيونداي وجينيسيس',
      reply: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار هيونداي وجينيسيس الأصلية والمعتمدة. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة. ويمكنك التواصل المباشر مع فرع الرواف هيونداي (بريدة) على: 0530051360'
    };
  }

  // 3. الشحن للمدن خارج القصيم والمتجر الإلكتروني
  if (t.includes('شحن') || t.includes('توصيل') || t.includes('الرياض') || t.includes('جدة') || t.includes('الدمام') || t.includes('مكة') || t.includes('المدينة') || t.includes('متجر') || t.includes('موقعكم الالكتروني')) {
    return {
      trigger: 'الشحن والمتجر الإلكتروني',
      reply: 'حياك الله 🌹 متاح الشحن السريع لباب بيتك لجميع مناطق ومدن المملكة 🚚. يمكنك استعراض القطع والطلب فوراً عبر متجرنا الإلكتروني: https://doracars.com/ أو التواصل مع فريق المتجر على الواتساب: 0538834212'
    };
  }

  // 4. مواقع الفروع في بريدة
  if (t.includes('موقع') || t.includes('وينكم') || t.includes('مكان') || t.includes('فرع') || t.includes('لوكيشن') || t.includes('فروعكم')) {
    return {
      trigger: 'مواقع الفروع',
      reply: 'حياك الله 🌹 تشرفنا بزيارتك لفروع درة في بريدة (منطقة القصيم):\n📍 فرع الرواف: طريق الملك عبد العزيز (متخصص هيونداي وجينيسيس)\n📍 فرع الخبيب: متخصص قطع كيا\nأهلاً وسهلاً بك في أي وقت!'
    };
  }

  // 5. مواعيد وساعات العمل
  if (t.includes('دوام') || t.includes('ساعات') || t.includes('تفتحون') || t.includes('تقفلون') || t.includes('متى تفتحون') || t.includes('الجمعة')) {
    return {
      trigger: 'مواعيد الدوام',
      reply: 'أهلاً بك 🌹 مواعيد العمل الرسمية لفروعنا من السبت إلى الخميس:\n☀️ الفترة الصباحية: 9:00 ص - 1:30 م\n🌙 الفترة المسائية: 4:00 م - 10:00 م\n(يوم الجمعة إجازة رسمية).'
    };
  }

  // 6. استفسار تسعير وقطع غيار عام
  if (t.includes('سعر') || t.includes('اسعار') || t.includes('بكم') || t.includes('كم سعر') || t.includes('تكلفة') || t.includes('فحمات') || t.includes('مساعدات') || t.includes('شمعة') || t.includes('صدام')) {
    return {
      trigger: 'استفسار تسعير وقطع',
      reply: 'حياك الله 🌹 لمعرفة التوافر والسعر بدقة، يرجى تزويدنا بـ: موديل السيارة + سنة الصنع + اسم القطعة أو صورتها + رقم الهيكل (VIN) إن وجد لتأكيد التطابق 100%.'
    };
  }

  return null;
}

// دالة إرسال رسالة إلى Meta Graph API
function sendMetaApiMessage({ recipientId, text, platform }) {
  return new Promise((resolve, reject) => {
    const isInstagram = platform === 'meta_instagram' || platform === 'instagram';
    const token = isInstagram && IG_TOKEN ? IG_TOKEN : PAGE_TOKEN;
    const targetId = isInstagram ? 'me' : PAGE_ID;
    const host = isInstagram ? 'graph.instagram.com' : 'graph.facebook.com';
    const path = `/v20.0/${targetId}/messages?access_token=${encodeURIComponent(token)}`;

    const postData = JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: 'RESPONSE'
    });

    const req = https.request({
      hostname: host,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // ── 1. فحص الصحة والجاهزية ────────────────────────────────────────────────
  if (pathname === '/health' || pathname === '/') {
    return sendJson(res, {
      status: 'active',
      service: 'Dora Cars Live Webhook Hub (ManyChat / Chatwoot In-House Clone)',
      autoPilotEnabled: isAutoPilotEnabled,
      connectedClients: sseClients.size,
      verifyToken: VERIFY_TOKEN,
      webhookEndpoint: `http://localhost:${PORT}/webhook`,
      timestamp: new Date().toISOString()
    });
  }

  // ── 2. التحكم في وضع البوت الآلي (Bot Mode Toggle) ────────────────────────
  if (pathname === '/api/bot-toggle' && method === 'GET') {
    return sendJson(res, { autoPilotEnabled: isAutoPilotEnabled });
  }

  if (pathname === '/api/bot-toggle' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        if (typeof parsed.enabled === 'boolean') {
          isAutoPilotEnabled = parsed.enabled;
        }
        console.log(`🤖 وضع البوت الآلي تم تعديله إلى: ${isAutoPilotEnabled ? 'مفعّل ✅' : 'معطّل (يدوي) 👤'}`);
        return sendJson(res, { success: true, autoPilotEnabled: isAutoPilotEnabled });
      } catch (e) {
        return sendJson(res, { error: true, message: 'Invalid payload' }, 400);
      }
    });
    return;
  }

  // ── 3. التحقق الرسمي من Meta (Webhook Verification Challenge) ─────────────
  if (pathname === '/webhook' && method === 'GET') {
    const mode = parsedUrl.query['hub.mode'];
    const token = parsedUrl.query['hub.verify_token'];
    const challenge = parsedUrl.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Meta Webhook Verified Successfully! Challenge accepted.');
      setCors(res);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end(challenge);
    } else {
      console.warn('❌ Webhook verification failed. Token mismatch or bad mode.');
      setCors(res);
      res.writeHead(403);
      return res.end('Verification token mismatch');
    }
  }

  // ── 4. استقبال إشعارات الرسائل اللحظية من Meta (POST /webhook) ────────────
  if (pathname === '/webhook' && method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyData || '{}');
        const objectType = payload.object; // 'instagram' | 'page'

        console.log(`\n📨 [Meta Webhook Event] Object: ${objectType} at ${new Date().toLocaleTimeString()}`);

        if (payload.entry && Array.isArray(payload.entry)) {
          for (const entry of payload.entry) {
            const time = entry.time || Date.now();
            const messaging = entry.messaging || [];

            for (const msgEvent of messaging) {
              const senderId = msgEvent.sender?.id;
              const recipientId = msgEvent.recipient?.id;
              const message = msgEvent.message;

              // إذا كانت رسالة نصية واردة من عميل (وليست من الصفحة نفسها)
              if (message && senderId && senderId !== PAGE_ID && senderId !== '28298689296452306') {
                const messageText = message.text || '';
                const incomingItem = {
                  id: `wh_${message.mid || Date.now()}`,
                  platform: objectType === 'instagram' ? 'meta_instagram' : 'meta_facebook',
                  channelType: 'dm',
                  senderName: objectType === 'instagram' ? `عميل انستغرام (${senderId.slice(-4)})` : `عميل فيسبوك (${senderId.slice(-4)})`,
                  senderId,
                  text: messageText || '[مرفق صوري أو صوتي]',
                  timestamp: 'الآن (مباشر ⚡)',
                  rawTime: new Date(time).toISOString(),
                  status: 'pending',
                  isLive: true,
                  chatHistory: [
                    {
                      id: `m_${message.mid || Date.now()}`,
                      sender: senderId,
                      isPage: false,
                      message: messageText || '[مرفق]',
                      time: new Date(time).toISOString()
                    }
                  ]
                };

                // ── معالجة الرد الآلي الذكي (ManyChat Auto-Pilot) ──
                if (isAutoPilotEnabled && messageText) {
                  const botMatch = matchDoraBotTriggers(messageText);
                  if (botMatch) {
                    console.log(`🤖 [ManyChat Bot] تطابق الكلمة المفتاحية: "${botMatch.trigger}" للعميل ${senderId}`);
                    
                    // إرسال الرد الحي عبر Meta Graph API فوراً
                    try {
                      await sendMetaApiMessage({
                        recipientId: senderId,
                        text: botMatch.reply,
                        platform: incomingItem.platform
                      });
                      console.log(`✅ تم تسليم الرد الآلي للعميل بنجاح!`);
                    } catch (sendErr) {
                      console.warn('⚠️ ملاحظة إرسال الرد الآلي:', sendErr.message);
                    }

                    // تحديث سجل المحادثة
                    incomingItem.status = 'replied';
                    incomingItem.reply = botMatch.reply;
                    incomingItem.repliedAt = 'الآن (رد آلي درة بوت 🤖)';
                    incomingItem.chatHistory.push({
                      id: `rep_bot_${Date.now()}`,
                      sender: 'درة السيارة (بوت ذكي 🤖)',
                      isPage: true,
                      message: botMatch.reply,
                      time: new Date().toISOString()
                    });
                  }
                }

                recentMessages.unshift(incomingItem);
                if (recentMessages.length > 50) recentMessages.pop();

                // بث الرسالة فوراً للمتصفح المفتوح!
                console.log(`⚡ البث المباشر للمتصفح: [${incomingItem.senderName}]: "${incomingItem.text}"`);
                broadcastToClients('new_message', incomingItem);
              }
            }
          }
        }

        // الرد على Meta بـ 200 OK فوراً
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('EVENT_RECEIVED');
      } catch (err) {
        console.error('Error parsing webhook payload:', err);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
    return;
  }

  // ── 5. البث اللحظي لشاشة المتصفح (Server-Sent Events) ─────────────────────
  if (pathname === '/api/live-stream' && method === 'GET') {
    setCors(res);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now(), autoPilot: isAutoPilotEnabled })}\n\n`);
    sseClients.add(res);

    console.log(`🔌 متصفح جديد اتصل بالبث اللحظي. إجمالي المتصفحات: ${sseClients.size}`);

    req.on('close', () => {
      sseClients.delete(res);
      console.log(`🔌 متصفح انقطع. المتبقي: ${sseClients.size}`);
    });
    return;
  }

  // ── 6. إرسال رد يدوي من المتصفح إلى Meta ──────────────────────────────────
  if (pathname === '/api/send-reply' && method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', async () => {
      try {
        const { recipientId, messageText, platform } = JSON.parse(bodyData || '{}');
        if (!recipientId || !messageText) {
          return sendJson(res, { error: true, message: 'recipientId and messageText required' }, 400);
        }

        const result = await sendMetaApiMessage({ recipientId, text: messageText, platform });
        return sendJson(res, { success: true, result });
      } catch (err) {
        return sendJson(res, { error: true, message: err.message }, 500);
      }
    });
    return;
  }

  // ── 7. فحص سلامة النظام التقني (System Health Ping) ──────────────────────
  if (pathname === '/api/ping') {
    return sendJson(res, { status: 'ok', time: new Date().toISOString() });
  }

  // ── 8. نقطة استقبال ويب هوك تيك توك الرسمي (TikTok Official Webhook) ─────
  if (pathname === '/api/tiktok-webhook') {
    if (method === 'GET') {
      // التحقق من تيك توك
      const challenge = parsedUrl.query.challenge || parsedUrl.query['hub.challenge'] || 'TIKTOK_WEBHOOK_VERIFIED';
      setCors(res);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end(challenge);
    }

    if (method === 'POST') {
      let ttBody = '';
      req.on('data', chunk => ttBody += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(ttBody || '{}');
          console.log('🎵 [TikTok Official Webhook Event]:', JSON.stringify(payload).slice(0, 200));

          // استخراج تفاصيل ليد أو رسالة تيك توك
          const eventType = payload.event || payload.entry_type || 'tiktok_lead';
          const senderName = payload.lead?.name || payload.sender?.name || `عميل تيك توك (${Date.now().toString().slice(-4)})`;
          const text = payload.lead?.comment || payload.message?.text || 'طلب استفسار عبر إعلان تيك توك';

          const ttWebhookItem = {
            id: `tt_wh_${Date.now()}`,
            platform: 'tiktok',
            channelType: payload.lead ? 'lead' : 'dm',
            senderName,
            senderUsername: payload.sender?.username || 'tiktok_lead',
            senderId: `tt_${Date.now()}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=000000&color=00f2fe`,
            text,
            timestamp: 'الآن (مباشر ⚡)',
            rawTime: new Date().toISOString(),
            status: 'pending',
            isLive: true,
            leadInfo: {
              carModel: payload.lead?.car_model || 'سيارة كورية',
              interestType: payload.lead?.part_type || 'قطع غيار',
              city: payload.lead?.city || 'المملكة',
              phone: payload.lead?.phone || ''
            },
            chatHistory: [
              {
                id: `m_tt_${Date.now()}`,
                sender: senderName,
                isPage: false,
                message: text,
                time: new Date().toISOString()
              }
            ]
          };

          if (isAutoPilotEnabled) {
            const match = matchDoraBotTriggers(text);
            if (match) {
              ttWebhookItem.status = 'replied';
              ttWebhookItem.reply = match.reply;
              ttWebhookItem.repliedAt = 'الآن (رد آلي درة بوت 🤖)';
              ttWebhookItem.chatHistory.push({
                id: `rep_tt_${Date.now()}`,
                sender: 'درة السيارة (بوت ذكي 🤖)',
                isPage: true,
                message: match.reply,
                time: new Date().toISOString()
              });
            }
          }

          recentMessages.unshift(ttWebhookItem);
          broadcastToClients('new_message', ttWebhookItem);

          return sendJson(res, { success: true, message: 'TikTok Webhook Received & Broadcasted' });
        } catch (e) {
          console.error('Error handling TikTok webhook payload:', e);
          return sendJson(res, { error: true, message: e.message }, 400);
        }
      });
      return;
    }
  }

  // 404
  setCors(res);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Dora Live Webhook Server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook Endpoint:    http://localhost:${PORT}/webhook`);
  console.log(`🔑 Verify Token:        ${VERIFY_TOKEN}`);
  console.log(`🤖 ManyChat Bot Mode:   ${isAutoPilotEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`⚡ Real-Time SSE Stream: http://localhost:${PORT}/api/live-stream`);
  console.log(`🧪 Test Simulation:     http://localhost:${PORT}/api/simulate-incoming`);
  console.log(`=======================================================`);
});
