// Vercel Serverless Function — Lead Gate dla Pakietu Miasto
// POST /api/lead
// Env: MAILERLITE_API_KEY (ustaw w Vercel Dashboard → Settings → Environment Variables)

const ML_GROUP_ID = '186667878335906833';
const ML_API_URL  = 'https://connect.mailerlite.com/api/subscribers';

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, last_name, company, stanowisko, phone } = req.body || {};

  // Walidacja wymaganych pól
  if (!email || !name || !last_name || !phone) {
    return res.status(400).json({
      error: 'Wypełnij wymagane pola: imię, nazwisko, email i telefon.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Podaj poprawny adres email.' });
  }

  try {
    const mlRes = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        fields: {
          name,
          last_name,
          company:    company    || '',
          stanowisko: stanowisko || '',
          phone
        },
        groups: [ML_GROUP_ID]
      })
    });

    // Logujemy błąd MailerLite, ale nie blokujemy pobrania —
    // lead jest ważniejszy niż perfekcja integracji
    if (!mlRes.ok) {
      const errText = await mlRes.text();
      console.error('[lead.js] MailerLite error:', mlRes.status, errText);
    }

    // Sukces — zwracamy URL do pobrania
    return res.status(200).json({
      success: true,
      download_url: '/pakiet-miasto.jpg'
    });

  } catch (err) {
    console.error('[lead.js] Exception:', err);
    return res.status(500).json({
      error: 'Błąd serwera. Spróbuj ponownie za chwilę.'
    });
  }
}
