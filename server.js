const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error('HF_TOKEN fehlt!');
}

app.post('/plan', async (req, res) => {
  try {
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/google/gemma-2b-it',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await hfRes.text();
    res.json({ raw: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Navio Backend läuft!'));

app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`));
