module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: true, message: "Método não permitido." });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: true, message: "GROQ_API_KEY não configurada no Vercel." });
  }

  try {
    const { prompt, max_tokens } = req.body;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especialista em marketing de conteúdo. SEMPRE responda APENAS com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código, sem explicações."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: max_tokens || 3500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(502).json({ error: true, message: JSON.stringify(data) });
    }

    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
}
