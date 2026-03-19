export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, message: "Método não permitido." });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: true, message: "GROQ_API_KEY não configurada." });
  }

  const { prompt, max_tokens } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: true, message: "Prompt ausente." });
  }

  const promptFinal = prompt.includes("JSON") || prompt.includes("json")
    ? prompt
    : prompt + "\n\nResponda APENAS com JSON válido.";

  try {
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
            content: "Você é especialista em marketing de conteúdo. Responda SEMPRE apenas com JSON válido, sem texto antes ou depois, sem markdown."
          },
          { role: "user", content: promptFinal }
        ],
        max_tokens: max_tokens || 3500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(502).json({ error: true, message: data?.error?.message || "Erro na Groq." });
    }

    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
}
