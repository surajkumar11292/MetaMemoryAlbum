import { NextResponse } from 'next/server';
import { generateMemoryCaption } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caption = await generateMemoryCaption(body);
    return NextResponse.json({ success: true, caption });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 });
  }
}
