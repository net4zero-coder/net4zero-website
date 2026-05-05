// Vercel Serverless Function — Lead Gate dla Pakietu Miasto
// POST /api/lead
//
// Env (Vercel Dashboard → Settings → Environment Variables):
//   BREVO_API_KEY  — klucz xkeysib-... z Brevo → Profile → API Keys
//
// Brevo docs: https://developers.brevo.com/reference/createcontact

const BREVO_CONTACTS_URL     = 'https://api.brevo.com/v3/contacts';
const BREVO_TRANSAC_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';

// ID listy "Pakiet Miasto — Leady" w Brevo
// → po stworzeniu listy w Brevo (Contacts → Lists → New List)
//   zmień tę wartość na prawdziwe ID z URL lub z API
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10);

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

  const apiKey = process.env.BREVO_API_KEY;

  // 1. Dodaj / zaktualizuj kontakt w Brevo
  try {
    const contactRes = await fetch(BREVO_CONTACTS_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME:   name,
          LASTNAME:    last_name,
          COMPANY:     company    || '',
          SMS:         phone,
          STANOWISKO:  stanowisko || ''
        },
        listIds:       [BREVO_LIST_ID],
        updateEnabled: true          // aktualizuj jeśli email już istnieje
      })
    });

    if (!contactRes.ok) {
      const err = await contactRes.text();
      console.error('[lead.js] Brevo contacts error:', contactRes.status, err);
      // Nie blokujemy — lead może nie trafić do listy, ale PDF dostaje
    }
  } catch (e) {
    console.error('[lead.js] Brevo contacts exception:', e);
  }

  // 2. Wyślij e-mail powitalny z linkiem do dokumentu
  try {
    const firstName = name.split(' ')[0];
    await fetch(BREVO_TRANSAC_EMAIL_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender:  { name: 'Maciej z NET4ZERO', email: 'biuro@net4zero.pl' },
        to:      [{ email, name: `${name} ${last_name}` }],
        replyTo: { email: 'biuro@net4zero.pl' },
        subject: 'Pakiet Miasto — Twój dokument NET4ZERO',
        htmlContent: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4CAF50,#03A9F4);padding:28px 40px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">NET<span style="opacity:0.85">4</span>ZERO</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">Program Infrastruktura Miejska 2026</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#0f172a;">Dzień dobry, <strong>${firstName}</strong>,</p>

          <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.65;">
            Dziękujemy za zainteresowanie <strong>Pakietem Miasto</strong> — programem budowy infrastruktury recyklomatowej poza sieciami handlowymi.
          </p>

          <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.65;">
            Dokument jest poufny i przeznaczony wyłącznie dla Ciebie.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:linear-gradient(135deg,#4CAF50,#03A9F4);border-radius:10px;">
              <a href="https://www.net4zero.pl/pakiet-miasto.jpg" target="_blank"
                 style="display:inline-block;padding:14px 28px;color:#fff;font-weight:700;font-size:15px;text-decoration:none;">
                Otwórz Pakiet Miasto →
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.6;">
            Jeśli chcesz omówić szczegóły lub sprawdzić, czy Twoje miasto jest dostępne — odpisz na tę wiadomość lub zadzwoń:
          </p>
          <p style="margin:0 0 28px;font-size:15px;font-weight:700;color:#0f172a;">+48 575 161 266</p>

          <p style="margin:0;font-size:14px;color:#334155;">
            Z poważaniem,<br>
            <strong>Maciej Machłajewski</strong><br>
            NET4ZERO Sp. z o.o.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f1f5f9;padding:20px 40px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
            NET4ZERO Sp. z o.o. · NIP 7011226958 · biuro@net4zero.pl · net4zero.pl<br>
            Dokument objęty klauzulą poufności. Kopiowanie i dystrybucja bez zgody zabronione.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });
  } catch (e) {
    console.error('[lead.js] Brevo email exception:', e);
    // Email nie wysłany — ale lead zapisany i PDF odblokowany
  }

  // 3. Sukces — frontend odblokuje PDF
  return res.status(200).json({
    success:      true,
    download_url: '/pakiet-miasto.jpg'
  });
}
