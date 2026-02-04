import express from 'express';
import cors from 'cors';

const app = express();

const port = process.env.PORT ? Number(process.env.PORT) : 10000;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(express.json({ limit: '64kb' }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

const escapeHtml = (input) =>
  String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body || {};

    const safeName = escapeHtml(name || '').trim();
    const safePhone = escapeHtml(phone || '').trim();
    const safeEmail = escapeHtml(email || '').trim();
    const safeMessage = escapeHtml(message || '').trim();

    if (!safeName && !safePhone && !safeEmail && !safeMessage) {
      return res.status(400).json({ ok: false, error: 'EMPTY_PAYLOAD' });
    }

    if (!telegramBotToken || !telegramChatId) {
      return res.status(500).json({ ok: false, error: 'TELEGRAM_NOT_CONFIGURED' });
    }

    const textLines = [
      '<b>Новая заявка с сайта</b>',
      safeName ? `<b>Имя:</b> ${safeName}` : null,
      safePhone ? `<b>Телефон:</b> ${safePhone}` : null,
      safeEmail ? `<b>Email:</b> ${safeEmail}` : null,
      safeMessage ? `<b>Сообщение:</b>\n${safeMessage}` : null,
    ].filter(Boolean);

    const text = textLines.join('\n');

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errText = await telegramResponse.text().catch(() => '');
      return res.status(502).json({ ok: false, error: 'TELEGRAM_SEND_FAILED', details: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
