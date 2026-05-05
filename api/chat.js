export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: true, message: "Método não permitido." });

  const GEMINI_API_KEY_ENV = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY_ENV) return res.status(500).json({ error: true, message: "GEMINI_API_KEY não configurada." });
  
  // Rotação de Chaves (Load Balancing) para driblar o RPM
  const keys = GEMINI_API_KEY_ENV.split(',').map(k => k.trim()).filter(k => k);
  const GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)];

  const { prompt, max_tokens } = req.body || {};
  if (!prompt) return res.status(400).json({ error: true, message: "Prompt ausente." });

  const safeTokens = Math.min(max_tokens || 2048, 4096);

  const systemInstruction = `Você é um especialista sênior em marketing de conteúdo digital para Instagram e TikTok, com profundo conhecimento em copywriting, psicologia do consumidor, storytelling e criação de conteúdo viral. Sua missão é gerar conteúdos excepcionalmente detalhados, persuasivos e prontos para publicar.

REGRAS ABSOLUTAS:
1. Responda SEMPRE E EXCLUSIVAMENTE com JSON válido e puro.
2. NUNCA adicione textos antes como "Aqui está o JSON", nem blocos de código markdown (\`\`\`json). O retorno deve começar com '{' ou '['.
3. O conteúdo deve ser em português do Brasil, natural e fluido.
4. Seja ESPECÍFICO e DETALHADO. Nunca use textos genéricos ou vagos.
5. Cada peça de conteúdo deve ter um ângulo único e original.
6. Use gatilhos emocionais e persuasivos adaptados ao nicho fornecido.`;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || "Erro na API do Gemini.";
      return res.status(geminiRes.status || 500).json({ error: true, message: errMsg });
    }

    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") {
      return res.status(400).json({ error: true, message: "O conteúdo gerado foi bloqueado pelos filtros de segurança do Google." });
    }

    const text = candidate?.content?.parts?.[0]?.text || "";
    if (!text) return res.status(500).json({ error: true, message: "Resposta vazia da IA. (Possível bloqueio de segurança)" });

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
}
