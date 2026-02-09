export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt vazio' });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("API KEY NÃO ENCONTRADA");
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY não definida' });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é especialista em e-commerce esportivo.',
          },
          {
            role: 'user',
            content: `Crie uma descrição curta e vendedora para: ${prompt}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DEEPSEEK RESPONSE ERROR:", data);
      return res.status(500).json({ error: data });
    }

    const text =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      null;

    if (!text) {
      console.error("SEM TEXTO:", data);
      return res.status(500).json({ error: 'IA não retornou texto', raw: data });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}