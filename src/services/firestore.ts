import { Firestore, FieldValue } from '@google-cloud/firestore';
import { ParsedEvent } from './gemini';

const db = new Firestore({
  projectId: process.env.FIREBASE_PROJECT_ID || 'jpa-live-portal',
});

export async function saveEventToFirestore(event: ParsedEvent): Promise<void> {
  await db.collection('events').add({
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.description,
    imageUrl: event.imageUrl || '',
    participants: [],
    source: 'line_auto',
    createdAt: FieldValue.serverTimestamp(),
  });
}
