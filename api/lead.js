// Vercel Serverless Function — Lead Gate dla Pakietu Operator (10 maszyn)
// POST /api/lead
//
// Env (Vercel Dashboard → Settings → Environment Variables):
//   BREVO_API_KEY   — klucz xkeysib-... z Brevo → Profile → API Keys
//   BREVO_LIST_ID   — ID listy "Pakiet Operator — Leady" z Brevo → Contacts → Lists (domyślnie 5)

const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, last_name, company, stanowisko, phone } = req.body || {};

  if (!email || !name || !last_name || !phone) {
    return res.status(400).json({
      error: 'Wypełnij wymagane pola: imię, nazwisko, email i telefon.'
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Podaj poprawny adres email.' });
  }

  const apiKey    = process.env.BREVO_API_KEY;
  const listId    = parseInt(process.env.BREVO_LIST_ID || '5', 10);

  // Dodaj / zaktualizuj kontakt w Brevo → wyzwoli automatyzację na liście
  const contactRes = await fetch(BREVO_CONTACTS_URL, {
    method: 'POST',
    headers: {
      'api-key':      apiKey,
      'Content-Type': 'application/json',
      'Accept':       'application/json'
    },
    body: JSON.stringify({
      email,
      attributes: {
        FIRSTNAME:  name,
        LASTNAME:   last_name,
        COMPANY:    company    || '',
        SMS:        phone,
        STANOWISKO: stanowisko || ''
      },
      listIds:       [listId],
      updateEnabled: true
    })
  });

  if (!contactRes.ok) {
    const err = await contactRes.text();
    console.error('[lead.js] Brevo error:', contactRes.status, err);
    // Zwróć błąd widoczny w Vercel logs, ale odblokuj PDF i tak
  } else {
    console.log('[lead.js] Contact saved, list:', listId);
  }

  return res.status(200).json({
    success:      true,
    download_url: '/lead-magnets/pakiet-operator-net4zero.pdf'
  });
}
