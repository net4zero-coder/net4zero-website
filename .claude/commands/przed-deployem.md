---
description: Checklista przed mergem do main (deploy produkcyjny)
allowed-tools: Read, Glob, Grep, Bash(python3 tools/check-site.py:*), Bash(tools/build-css.sh), Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

Przejdź checklistę i zaraportuj wynik punkt po punkcie: ✅ / ⚠️ / ❌.
Merge do `main` = natychmiastowy deploy produkcyjny, więc nic nie zakładaj —
sprawdzaj.

1. `git status` + `git diff main...HEAD --stat` — co dokładnie wchodzi na produkcję.
2. `python3 tools/check-site.py` — musi być 0 błędów.
3. Czy w diffie są zmiany klas w HTML? Jeśli tak — czy `output.css` też jest
   w diffie? Jeśli nie, uruchom `tools/build-css.sh`.
4. Czy któraś strona zmieniła nazwę lub zniknęła? Jeśli tak — czy jest dla niej
   301 w `vercel.json`?
5. Czy nowe strony są w `sitemap.xml` i mają link wewnętrzny (nie są sierotami)?
6. Czy diff nie zawiera sekretów: `BREVO_API_KEY`, `xkeysib-`, tokenów,
   maili prywatnych, plików z `.gitignore` (`seo-*.md`, `dns_backup_*`)?
   Repo jest **publiczne**.
7. Czy Consent Mode v2 (`default: denied`) i Cookiebot są nienaruszone
   na wszystkich dotkniętych podstronach?
8. Czy treść nie ujawnia nazw producentów RVM, operatorów ani firm leasingowych?
9. Czy zmiany merytoryczne o systemie kaucyjnym trafiły też do `llms.txt` /
   `llms-full.txt`?

Na końcu jedno zdanie: **można mergować** albo **czego brakuje**.
