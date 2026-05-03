# DNS Backup — net4zero.pl @ GoDaddy
**Data backupu:** 2026-05-04 (przed migracją do Vercel)

## A records
- `A @ 199.60.103.158 600s` ← DO ZMIANY na `76.76.21.21`
- `A @ 199.60.103.58 600s` ← DO USUNIĘCIA

## NS records (nieedytowalne)
- `NS @ ns59.domaincontrol.com 1h`
- `NS @ ns60.domaincontrol.com 1h`

## CNAME records
- `CNAME autodiscover autodiscover.outlook.com.` — MS365 (NIE RUSZAĆ)
- `CNAME email email.secureserver.net.` — GoDaddy email forwarding
- `CNAME litesrv._domainkey litesrv._domainkey.mlsend.com.` — MailerLite DKIM
- `CNAME lyncdiscover webdir.online.lync.com.` — MS Teams (legacy)
- `CNAME msoid clientconfig.microsoftonline-p.net.` — MS365
- `CNAME sip sipdir.online.lync.com.` — MS Teams (legacy)
- `CNAME www 48115457.group7.sites.hubspot.net.` ← DO ZMIANY na `cname.vercel-dns.com`
- `CNAME _domainconnect _domainconnect.gd.domaincontrol.com.` — GoDaddy

## SOA
- `SOA @ ns59.domaincontrol.com.` (automatyczne)

## MX records (POCZTA — NIE RUSZAĆ)
- `MX @ net4zero-pl.mail.protection.outlook.com. priority=0`

## TXT records (NIE RUSZAĆ)
- `TXT @ 100 000`
- `TXT @ 80.49`
- `TXT @ google-site-verification=g7UUWTDOkj-Y4EarCCb2xrERe5lupFcGTA76_kaDuCM`
- `TXT @ mailerlite-domain-verification=524e843a8ce7af4b608d605492fdb35a27479624`
- `TXT @ NETORGFT17522525.onmicrosoft.com`
- `TXT @ v=spf1 include:dc-db9e4b7a04._spfm.net4zero.pl ~all`
- `TXT dc-db9e4b7a04._spfm v=spf1 a include:_spf.mlsend.com include:secureserver.net mx ~all`

## SRV records (MS Teams — NIE RUSZAĆ)
- `SRV _sip._tls.@ 100 1 443 sipdir.online.lync.com.`
- `SRV _sipfederationtls._tcp.@ 100 1 5061 sipfed.online.lync.com.`

## Plan zmian (3 operacje)
1. **EDIT:** `A @ 199.60.103.158` → `76.76.21.21`
2. **DELETE:** `A @ 199.60.103.58`
3. **EDIT:** `CNAME www 48115457.group7.sites.hubspot.net` → `cname.vercel-dns.com`

Wszystkie pozostałe rekordy zostają bez zmian.
