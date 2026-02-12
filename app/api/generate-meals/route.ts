import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { dietContext } from '@/lib/diet-rules';

export async function POST(req: NextRequest) {
  try {
    const { culture, dietaryRestrictions } = await req.json();

    if (!culture) {
      return NextResponse.json(
        { error: 'Please specify your cultural background' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a culturally-aware nutritionist helping patients prepare for colonoscopy or endoscopy procedures. Your job is to suggest LOW-RESIDUE (low-fiber) diet meals that are:

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
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;

    return NextResponse.json({ mealPlan: content });

  } catch (error) {
    console.error('Error generating meals:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
