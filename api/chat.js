export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: true, message: "Método não permitido." });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: true, message: "GEMINI_API_KEY não configurada." });

  const { prompt, max_tokens } = req.body || {};
  if (!prompt) return res.status(400).json({ error: true, message: "Prompt ausente." });

  const safeTokens = Math.min(max_tokens || 1200, 2048);

  const systemInstruction = `Você é um especialista sênior em marketing de conteúdo digital para Instagram e TikTok, com profundo conhecimento em copywriting, psicologia do consumidor, storytelling e criação de conteúdo viral. Sua missão é gerar conteúdos excepcionalmente detalhados, persuasivos e prontos para publicar.

REGRAS ABSOLUTAS:
1. Responda SEMPRE com JSON válido e puro — sem texto antes, sem texto depois, sem blocos de código markdown, sem comentários.
2. O conteúdo deve ser em português do Brasil, natural e fluido.
3. Seja ESPECÍFICO e DETALHADO. Nunca use textos genéricos ou vagos.
4. Cada peça de conteúdo deve ter um ângulo único e original.
5. Use gatilhos emocionais e persuasivos adaptados ao nicho fornecido.`;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

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
          maxOutputTokens: safeTokens,
          responseMimeType: "application/json"
        }
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || "Erro na API do Gemini.";
      return res.status(502).json({ error: true, message: errMsg });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return res.status(502).json({ error: true, message: "Resposta vazia da IA." });

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
}
