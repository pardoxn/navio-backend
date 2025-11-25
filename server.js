const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const HF_TOKEN = process.env.HF_TOKEN;

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

    // Wenn Modell noch startet → sofort klar sagen
    if (text.includes('loading') || text.includes('estimated_time')) {
      return res.status(503).json({ error: 'KI startet gerade – in 30s nochmal klicken!' });
    }

    // JSON aus dem Text fischen (robust!)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('Kein JSON gefunden – Rohantwort:', text);
      return res.status(500).json({ error: 'KI hat kein JSON geliefert', raw: text });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(500).json({ error: 'JSON kaputt', raw: text });
    }

    // Erfolgreich → sauberes JSON zurückgeben
    res.json({ tours: parsed.tours || [] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Navio Backend läuft – POST /plan für Touren'));

app.listen(PORT, () => console.log('Backend ready on port', PORT));