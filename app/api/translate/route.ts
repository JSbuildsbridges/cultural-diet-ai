import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { text, languageName } = await req.json();

    if (!text || !languageName) {
      return NextResponse.json(
        { error: 'Missing text or language' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following meal plan into ${languageName}. Keep the formatting (headers, bullet points, etc.) intact. Ensure the translation is natural and uses appropriate food terminology for native speakers.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const translatedText = completion.choices[0].message.content;

    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Error translating:', error);
    return NextResponse.json(
      { error: 'Failed to translate' },
      { status: 500 }
    );
  }
}
