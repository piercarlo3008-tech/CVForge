import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    contact: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
      },
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique random string" },
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING, description: "Use 'Present' se l'esperienza è in corso" },
          description: { type: Type.STRING, description: "Bullet points o testo descrittivo delle responsabilità" },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique random string" },
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          graduationDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique random string" },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.STRING },
          link: { type: Type.STRING },
        },
      },
    },
  },
  required: ["contact", "summary", "experience", "education", "skills", "projects"],
};

export async function parseResumeText(text: string): Promise<ResumeData | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Estrai le informazioni dal seguente curriculum vitae e restituiscile come JSON strutturato. Trilla in modo intelligente le sezioni del testo. Se manca qualche informazione, lascia il campo vuoto ("" o []). Testo del CV:\n\n${text}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.1,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    }
    return null;
  } catch (error) {
    console.error("Errore durante il parsing del CV:", error);
    return null;
  }
}

export async function parseResumeFile(file: File): Promise<ResumeData | null> {
  try {
    const base64Str = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Estrai le informazioni da questo curriculum vitae e restituiscile come JSON strutturato. Trilla in modo intelligente le sezioni del documento. Se manca qualche informazione, lascia il campo vuoto ("" o []).`,
            },
            {
               inlineData: {
                 data: base64Str,
                 mimeType: file.type
               }
            }
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.1,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    }
    return null;
  } catch (error) {
    console.error("Errore durante il parsing del CV da file:", error);
    return null;
  }
}

export async function getAtsSuggestions(resumeData: ResumeData, targetJob?: string): Promise<any> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "Un punteggio da 0 a 100 per l'attuale CV lato ATS" },
      scoreMessage: { type: Type.STRING, description: "Breve frase che riassume la qualità attuale, es. 'Sulla buona strada, ma serve ottimizzare.'" },
      keywordsToInclude: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      },
      actionVerbs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING, description: "Verbo debole trovato nel CV" },
            suggested: { type: Type.STRING, description: "Verbo forte suggerito per ATS" },
            context: { type: Type.STRING, description: "Dove applicarlo" }
          }
        }
      },
      formattingTips: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      generalFeedback: { type: Type.STRING }
    },
    required: ["score", "scoreMessage", "keywordsToInclude", "actionVerbs", "formattingTips", "generalFeedback"]
  };

  const targetJobContext = targetJob ? `Inoltre, l'utente sta candidandosi specificamente per questa posizione o link: "${targetJob}". Ottimizza l'analisi, le keyword e i verbi d'azione specificamente per questo ruolo.` : '';

  const prompt = `Sei un esperto selezionatore IT e specialista in ATS (Applicant Tracking Systems). 
Analizza questo CV e fornisci suggerimenti strategici strutturati su come migliorarlo per superare i filtri ATS automatici e colpire i recruiter. Individua in particolare quali keyword mancano rispetto alle competenze correnti, suggerisci verbi d'azione migliori sostitutivi a quelli eventualmente presenti (o generici), e fornisci consigli pratici di formattazione.

${targetJobContext}

Dati del CV:
${JSON.stringify(resumeData, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Errore in ATS Analyzer:", error);
    return null;
  }
}

export async function applyAtsSuggestionsAndRewrite(resumeData: ResumeData, suggestions: any, targetJob?: string): Promise<ResumeData | null> {
  const prompt = `Sei un esperto selezionatore IT e specialista in ATS. 
Devi riscrivere i contenuti di questo CV integrando le modifiche suggerite per superare i filtri ATS. 
Non modificare mail, telefono o contatti, ma migliora profondamente la sezione 'summary', le descrizioni in 'experience' e 'projects', e aggiungi o rivedi i termini in 'skills'.

- Integra in modo naturale le Keyword suggerite.
- Usa i verbi di azione suggeriti sostituendo i verbi deboli.
- Se presente una posizione target, allinea le descrizioni al linguaggio di quell'annuncio.
- Non inventare esperienze mai avvenute, ma riformula le esistenti in modo eccellente.

${targetJob ? `Job Description o Posizione target: "${targetJob}"` : ''}

Suggerimenti ATS:
${JSON.stringify(suggestions, null, 2)}

CV Attuale:
${JSON.stringify(resumeData, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.3,
      },
    });
    
    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    }
    return null;
  } catch (error) {
    console.error("Errore durante l'auto-miglioramento del CV:", error);
    return null;
  }
}

export async function improveTextGen(text: string): Promise<string> {
  const prompt = `Sei un copywriter esperto in curriculum vitae. Migliora e professionalizza il testo seguente, rendendolo più incisivo, diretto e orientato ai risultati.
  Restituisci SOLO il testo migliorato, senza introdurlo e senza backticks o formattazione non richiesta.
  
  Testo:
  "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
      }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Errore nell'improve text:", error);
    return text;
  }
}

export async function rewriteForAts(text: string): Promise<string> {
  const prompt = `Riscrivi il seguente testo descrittivo (estratto da un'esperienza lavorativa o progetto in un CV) per renderlo ottimizzato per i sistemi ATS.
- Usa uno stile ad elenchi puntati se appropriato.
- Inizia con forti verbi d'azione.
- Includi metriche ipotetiche se necessario (lasciando uno spazio tipo "[X]%").
- Rimuovi il superfluo.
Restituisci SOLO il testo migliorato.

Testo originale:
"${text}"
`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text || text;
  } catch (error) {
    console.error("Errore nel rewrite:", error);
    return text;
  }
}

export async function translateResume(resumeData: ResumeData, targetLanguage: string): Promise<ResumeData | null> {
  const prompt = `Sei un traduttore professionista esperto in Risorse Umane e CV.
Traduci il seguente JSON del curriculum in ${targetLanguage}.
Mantieni esattamente la stessa struttura, le chiavi del JSON, le proprietà e gli id. 
Traduci solo i valori di testo visibili all'utente (descrizioni, ruoli, riassunto, titoli di studio, nomi delle skill, livelli lingua, ecc.).
    
Curriculum (JSON):
${JSON.stringify(resumeData)}
`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.1,
      },
    });
    
    if (response.text) return JSON.parse(response.text) as ResumeData;
    return null;
  } catch (error) {
    console.error("Translation logic error:", error);
    return null;
  }
}

export async function generateCoverLetter(resumeData: ResumeData, targetJob: string, tone: string): Promise<string> {
  const prompt = `Sei un esperto copywriter e consulente di carriera.
Scrivi una Lettera di Presentazione (Cover Letter) persuasiva ed eccellente basata sul Curriculum fornito e sulla Posizione Target delineata.

Tono di voce richiesto: ${tone}
Posizione Target (o Job Description): ${targetJob || 'Posizione non specificata - scrivi in modo generale per il settore ma personalizzato sul candidato'}

Curriculum del candidato (usa le informazioni qui contenute per esaltarne le qualità in relazione all'offerta):
${JSON.stringify(resumeData)}

Regole:
- Restituisci SOLO il testo della Lettera di Presentazione.
- Non includere placeholder eccessivi. Usa i dati del CV per firmare, datare, ecc.
- Struttura: Introduzione forte sul perché ci si candida, corpo (1/2 paragrafi) evidenziando i traguardi nel CV più inerenti al taget, e chiusura persuasiva (call to action).
`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.7 }
    });
    return response.text || "";
  } catch (error) {
    console.error("Cover Letter logic error:", error);
    return "Errore nella generazione della lettera di presentazione.";
  }
}

export async function generateSTARBullets(role: string, description: string): Promise<string[]> {
  const prompt = `Trasforma la descrizione generica in 3 eccezionali bullet point utilizzando il metodo S.T.A.R. (Situation, Task, Action, Result).
Focalizzati nell'estrarre risultati misurabili o orientati all'azione.
  
Ruolo: ${role}
Descrizione generica: ${description}

Restituisci SOLO JSON in formato array di stringhe. Esempio: ["bullet 1", "bullet 2", "bullet 3"]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        temperature: 0.5
      }
    });
    if (response.text) return JSON.parse(response.text);
    return [];
  } catch (error) {
    console.error("STAR error:", error);
    return [];
  }
}

