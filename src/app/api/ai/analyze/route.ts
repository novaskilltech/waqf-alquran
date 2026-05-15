import { NextResponse } from 'next/server';

/**
 * Moteur d'analyse IA Universel (Optimisé pour Kilo AI Gateway)
 */
export async function POST(req: Request) {
  try {
    const { word, context, ayahNumber, surahNumber } = await req.json();

    const apiKey = process.env.AI_PROVIDER_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || "https://api.kilo.ai/v1";
    const modelName = process.env.AI_MODEL_NAME || "kilo-auto/free";

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Clé API manquante. Veuillez configurer AI_PROVIDER_API_KEY dans votre .env" 
      }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Tu es un expert en sciences du Coran et en grammaire arabe (Sarf/Nahw). Réponds uniquement au format JSON avec les clés: ruling, explanation, taalil."
          },
          {
            role: "user",
            content: `Analyse le mot "${word}" dans ce verset : "${context}" (Verset ${ayahNumber}, Sourate ${surahNumber}).`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erreur de la passerelle IA");
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        aiModel: `Kilo Gateway (${modelName})`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("AI Gateway Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "خطأ في اتصال الذكاء الاصطناعي" 
    }, { status: 500 });
  }
}
