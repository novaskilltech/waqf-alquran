import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { word, context, ayahNumber, surahNumber } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: "Clé API Gemini manquante. Veuillez configurer GOOGLE_GEMINI_API_KEY." 
      }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Tu es un expert mondial en sciences du Coran (Ulum al-Quran) et en grammaire arabe (Sarf et Nahw).
      Analyse le mot "${word}" dans le contexte du verset suivant : "${context}" (Verset ${ayahNumber}, Sourate ${surahNumber}).
      
      Ta mission est de fournir une analyse de Waqf (arrêt) sur ce mot précis.
      
      Réponds UNIQUEMENT au format JSON suivant :
      {
        "ruling": "Le jugement de Waqf (ex: وقف تام, وقف كاف, وقف جائز, etc.)",
        "explanation": "Une explication simplifiée pour un étudiant (en arabe)",
        "taalil": "Une justification technique/grammaire/théologique pour un spécialiste (en arabe)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Nettoyage du texte au cas où le modèle ajouterait des balises markdown ```json
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        aiModel: "Gemini 2.0 Flash (NOVA-WAQF Engine)",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ success: false, error: "خطأ في اتصال الذكاء الاصطناعي" }, { status: 500 });
  }
}
