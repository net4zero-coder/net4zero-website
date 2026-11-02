// Vercel Serverless Function — Lead Gate dla Pakietu Operator (one-pager)
// POST /api/lead
//
// Dwa niezależne tory zapisu leada (żaden lead nie może zginąć po cichu):
//   1. Formspree → natychmiastowy e-mail z danymi na skrzynkę NET4ZERO
//      (ten sam kanał, co formularze „Lokalizacja" i „Inwestor" na stronie)
//   2. Brevo → kontakt na liście marketingowej (opcjonalny, jeśli skonfigurowany)
//
// PDF odblokowujemy tylko wtedy, gdy przynajmniej jeden tor potwierdził zapis.
//
// Env (Vercel Dashboard → Settings → Environment Variables):
//   FORMSPREE_LEAD_FORM_ID — ID formularza Formspree (domyślnie: formularz inwestorski ze strony)
//   BREVO_API_KEY          — klucz xkeysib-... (opcjonalny)
//   BREVO_LIST_ID          — ID listy w Brevo (domyślnie 5)

const FORMSPREE_FORM_ID   = process.env.FORMSPREE_LEAD_FORM_ID || 'mdabekdk';
const FORMSPREE_URL       = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;
const BREVO_CONTACTS_URL  = 'https://api.brevo.com/v3/contacts';
const DOWNLOAD_URL        = '/lead-magnets/pakiet-operator-net4zero.pdf';

async function sendToFormspree(lead, req) {
  const res = await fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject:   `NET4ZERO: Pobranie one-pagera Pakiet Operator — ${lead.name} ${lead.last_name}`,
      Formularz:  'Pakiet Operator — pobranie one-pagera (modal na stronie)',
      Imie:       lead.name,
      Nazwisko:   lead.last_name,
      Email:      lead.email,
      Telefon:    lead.phone,
      Firma:      lead.company    || '—',
      Stanowisko: lead.stanowisko || '—',
      Zrodlo:     req.headers['referer'] || 'www.net4zero.pl',
      Data:       new Date().toISOString()
    })
  });
  if (!res.ok) throw new Error(`Formspree ${res.status}: ${await res.text()}`);
  return true;
}

async function sendToBrevo(lead) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set');
  const listId = parseInt(process.env.BREVO_LIST_ID || '5', 10);
  const res = await fetch(BREVO_CONTACTS_URL, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: lead.email,
      attributes: {
        FIRSTNAME:  lead.name,
        LASTNAME:   lead.last_name,
        COMPANY:    lead.company    || '',
        SMS:        lead.phone,
        STANOWISKO: lead.stanowisko || ''
      },
      listIds: [listId],
      updateEnabled: true
    })
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const lead = {
    name:       String(body.name       || '').trim().slice(0, 100),
    last_name:  String(body.last_name  || '').trim().slice(0, 100),
    email:      String(body.email      || '').trim().slice(0, 200),
    phone:      String(body.phone      || '').trim().slice(0, 40),
    company:    String(body.company    || '').trim().slice(0, 200),
    stanowisko: String(body.stanowisko || '').trim().slice(0, 100)
  };

  if (!lead.email || !lead.name || !lead.last_name || !lead.phone) {
    return res.status(400).json({ error: 'Wypełnij wymagane pola: imię, nazwisko, email i telefon.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return res.status(400).json({ error: 'Podaj poprawny adres email.' });
  }

  const [formspree, brevo] = await Promise.allSettled([
    sendToFormspree(lead, req),
    sendToBrevo(lead)
  ]);

  const okFormspree = formspree.status === 'fulfilled';
  const okBrevo     = brevo.status === 'fulfilled';

  if (!okFormspree) console.error('[lead.js] Formspree failed:', formspree.reason?.message);
  if (!okBrevo)     console.warn('[lead.js] Brevo failed:', brevo.reason?.message);
  console.log(`[lead.js] lead ${lead.email} — formspree:${okFormspree} brevo:${okBrevo}`);

  if (!okFormspree && !okBrevo) {
    // Nie udajemy sukcesu, gdy lead nigdzie nie został zapisany.
    return res.status(502).json({
      error: 'Nie udało się zapisać zgłoszenia. Napisz do nas na biuro@net4zero.pl — odeślemy dokument mailem.'
    });
  }

  return res.status(200).json({ success: true, download_url: DOWNLOAD_URL });
}
