import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ParsedEvent {
  title: string;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  description: string;
  imageUrl: string;
}

const SYSTEM_PROMPT = `
あなたはTikTokライブ事務所のイベント情報解析AIです。
受け取ったLINEメッセージがイベント・コンテスト・キャンペーン情報かどうかを判断し、
イベント情報の場合のみ以下のJSONフォーマットで返してください。

イベント情報でない場合（雑談・挨拶など）は null を返してください。

JSONフォーマット:
{
  "title": "イベント名",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "詳細説明",
  "imageUrl": ""
}

注意:
- 日付が明記されていない場合は今日の日付を startDate、1ヶ月後を endDate にしてください
- 今日の日付: ${new Date().toISOString().split('T')[0]}
- JSONのみ返してください（マークダウンコードブロック不要）
`;

export async function parseEventFromText(text: string): Promise<ParsedEvent | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nLINEメッセージ:\n${text}`);
    const responseText = result.response.text().trim();

    if (responseText === 'null' || responseText === '') return null;

    const parsed = JSON.parse(responseText) as ParsedEvent;
    if (!parsed.title) return null;

    return parsed;
  } catch (e) {
    console.error('[Gemini] Parse error:', e);
    return null;
  }
}
