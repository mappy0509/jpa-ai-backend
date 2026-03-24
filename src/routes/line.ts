import express from 'express';
import { middleware, WebhookEvent, TextMessage } from '@line/bot-sdk';
import { parseEventFromText } from '../services/gemini';
import { saveEventToFirestore } from '../services/firestore';

const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
};

export const lineRouter = express.Router();

// LINE署名検証middleware
lineRouter.use(middleware(lineConfig));

lineRouter.post('/', async (req, res) => {
  const events: WebhookEvent[] = req.body.events;

  await Promise.all(events.map(handleEvent));
  res.status(200).json({ status: 'ok' });
});

async function handleEvent(event: WebhookEvent) {
  // テキストメッセージのみ処理
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const text = (event.message as TextMessage).text;
  console.log('[LINE] received:', text);

  // Gemini AIでイベント情報かどうか判定・パース
  const parsed = await parseEventFromText(text);
  if (!parsed) {
    console.log('[LINE] Not an event message, skipping.');
    return;
  }

  // Firestoreに保存
  await saveEventToFirestore(parsed);
  console.log('[Firestore] Event saved:', parsed.title);
}
