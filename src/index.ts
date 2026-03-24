import 'dotenv/config';
import express from 'express';
import { lineRouter } from './routes/line';

const app = express();
const PORT = process.env.PORT || 8080;

// LINE SDKのmiddlewareより先にraw bodyが必要なので /webhook/line は別途処理
app.use('/webhook/line', lineRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`jpa-ai-backend listening on port ${PORT}`);
});
