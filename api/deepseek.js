export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt vazio' });
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
            content: 'Você é um especialista em e-commerce esportivo.',
          },
          {
            role: 'user',
            content: `Crie uma descrição profissional, curta e vendedora para: ${prompt}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek error:', data);
      return res.status(500).json({ error: data });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
}