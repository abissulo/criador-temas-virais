export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: true, message: "Método não permitido." });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: true, message: "GROQ_API_KEY não configurada." });

  const { prompt, max_tokens } = req.body || {};
  if (!prompt) return res.status(400).json({ error: true, message: "Prompt ausente." });

  const promptFinal = prompt.includes("JSON") || prompt.includes("json")
    ? prompt
    : prompt + "\n\nResponda APENAS com JSON válido.";

  // Cap tokens to avoid rate limit — formato individual nunca precisa de mais que 800
  const safeTokens = Math.min(max_tokens || 1000, 1200);

  // Try primary model, fallback to smaller model if rate limited
  const models = [
    "llama-3.1-8b-instant",     // 131K tokens/min — very high limit
    "llama-3.3-70b-versatile",  // 6K tokens/min — fallback
  ];

  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[attempt];
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Você é especialista em marketing de conteúdo digital para Instagram e TikTok. Responda SEMPRE apenas com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código."
            },
            { role: "user", content: promptFinal }
          ],
          max_tokens: safeTokens,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      const data = await groqRes.json();

      if (!groqRes.ok) {
        const errMsg = data?.error?.message || "Erro na Groq.";
        const isRateLimit = groqRes.status === 429 ||
          errMsg.toLowerCase().includes("rate") ||
          errMsg.toLowerCase().includes("limit");

        // If rate limited and we have a fallback model, try it
        if (isRateLimit && attempt < models.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }

        return res.status(502).json({ error: true, message: errMsg });
      }

      const text = data.choices?.[0]?.message?.content || "";
      if (!text) return res.status(502).json({ error: true, message: "Resposta vazia da IA." });

      return res.status(200).json({ text });

    } catch (err) {
      if (attempt < models.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return res.status(500).json({ error: true, message: err.message });
    }
  }
}
