import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { dietContext } from '@/lib/diet-rules';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cache the PDF base64 so it's only read once
let pdfBase64: string | null = null;
function getPdfBase64(): string {
  if (!pdfBase64) {
    const pdfPath = path.join(process.cwd(), 'public', 'Low_Fiber.pdf');
    pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
  }
  return pdfBase64;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateReferenceKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export async function POST(req: NextRequest) {
  try {
    const { culture, dietaryRestrictions, userRole, languageName } = await req.json();

    if (!culture) {
      return NextResponse.json(
        { error: 'Please specify your cultural background' },
        { status: 400 }
      );
    }

    const systemPrompt = `Begin every response with this exact line on its own:
"📋 Diet Phase: Low-Fiber Low-Residue (3–5 days before colonoscopy/endoscopy)"

Then generate the meal suggestions below it.

You are a culturally-aware nutritionist helping patients prepare for colonoscopy or endoscopy procedures. Your job is to suggest LOW-RESIDUE (low-fiber) diet meals that are:

1. COMPLIANT with medical low-residue diet requirements
2. CULTURALLY RELEVANT to the patient's heritage
3. FAMILIAR and comforting to the patient

${dietContext}

CRITICAL: Every meal suggestion MUST comply with the low-residue diet rules above. Never suggest foods from the "avoid" list.`;

    const userPrompt = `Patient's cultural background: ${culture}
${dietaryRestrictions ? `Additional dietary restrictions: ${dietaryRestrictions}` : ''}

Generate a meal plan with culturally appropriate LOW-RESIDUE meals for this patient. Include:

1. **Breakfast Ideas** (3 options)
2. **Lunch Ideas** (3 options)
3. **Dinner Ideas** (3 options)
4. **Snack Ideas** (3 options)

For each meal:
- Use culturally familiar dishes adapted to be low-residue compliant
- Explain briefly why it's compliant (e.g., "uses white rice instead of brown")
- Keep portions reasonable

Format each meal as:
**Meal Name** - Brief description. *(Why it's compliant)*

Be specific to the ${culture} cuisine. Avoid generic Western suggestions unless the patient's culture aligns with that.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: {
                filename: 'Low_Fiber.pdf',
                file_data: `data:application/pdf;base64,${getPdfBase64()}`,
              },
            } as never,
            {
              type: 'text',
              text: 'This is the official SpeechMED+GI Low-Fiber Low-Residue diet guide. Use this document as your primary reference for all food safety decisions. Only suggest foods that are consistent with this document.',
            },
          ],
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    const referenceKey = generateReferenceKey();

    // Log to Supabase
    await supabase.from('diet_logs').insert({
      reference_key: referenceKey,
      culture,
      user_role: userRole ?? null,
      dietary_restrictions: dietaryRestrictions ?? null,
      language: languageName ?? null,
      ai_response: content,
    });

    return NextResponse.json({ mealPlan: content, referenceKey });

  } catch (error) {
    console.error('Error generating meals:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
