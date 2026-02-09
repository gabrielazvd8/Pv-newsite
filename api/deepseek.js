export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt vazio' });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://usepvsports.vercel.app",
        "X-Title": "PV Sports AI"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em descrições profissionais de camisas esportivas."
          },
          {
            role: "user",
            content: `Crie uma descrição curta, profissional e vendedora para a camisa: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 180
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: data });
    }

    res.status(200).json({
      text: data.choices[0].message.content
    });

  } catch (err) {
    console.error("DeepSeek error:", err);
    res.status(500).json({ error: "Erro interno IA" });
  }
}
