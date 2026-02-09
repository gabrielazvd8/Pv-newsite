export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nomeProduto } = req.body;

    if (!nomeProduto) {
      return res.status(400).json({ error: "Nome do produto é obrigatório" });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Você cria descrições curtas e comerciais para camisas esportivas." },
          { role: "user", content: `Crie uma descrição profissional para a camisa: ${nomeProduto}` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    res.status(200).json({ descricao: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar descrição" });
  }
}