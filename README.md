# SMK Capital – web na Next.js

Nová verze webu [smkcapital.cz](https://smkcapital.cz) postavená na **Next.js
(App Router) + TypeScript + Tailwind CSS 4**, s obsahem editovatelným přes
administraci a se statickým exportem, který běží na dosavadním hostingu
Endora.

Vzhled je záměrně shodný s původní verzí – přenesené jsou všechny stránky,
sekce, animace i formuláře.

---

## Co se oproti původní verzi změnilo

| | Dřív (Vite + React Router) | Teď (Next.js) |
|---|---|---|
| Stránky | jeden `index.html`, obsah dokresluje JavaScript | každá stránka má vlastní hotové HTML |
| SEO | titulky a popisy se doplňovaly až v prohlížeči | jsou přímo ve zdroji stránky, vidí je i náhledy odkazů na sociálních sítích |
| Texty a obrázky | napevno v `src/constants/*.ts` | v `content/*.json`, editovatelné na `/admin` |
| Nasazení | ruční build a nahrání přes FTP | GitHub Actions sestaví a nahraje samo |
| Formuláře | PHP skripty na Endoře | **beze změny** – stejné PHP skripty |

Formuláře posílají data na stejné adresy jako dosud
(`contact.php`, `car-insurance.php`, `mortgage-calculation.php`,
`contract-review.php`), takže na hostingu není potřeba nic přenastavovat.

---

## Spuštění na svém počítači

```bash
npm install
npm run dev          # http://localhost:3000
```

Další příkazy:

```bash
npm run build        # statický export do složky out/
npm run typecheck    # kontrola TypeScriptu
npm run lint         # kontrola pravidel
npm start            # lokální náhled hotového exportu ze složky out/
```

Při vývoji na localhostu se formuláře odesílají na ostré PHP skripty
(`.env.example` ukazuje jak). Pokud je chcete testovat, zkopírujte
`.env.example` do `.env.local`; na ostrém webu se použijí hodnoty
z `.env.production`, které míří na relativní cesty na stejné doméně.

---

## Struktura projektu

```
content/                  texty a odkazy na obrázky – to, co edituje klient
public/
  admin/                  administrace obsahu (Sveltia CMS)
  partners/               loga partnerů
  images/                 logo a další obrázky webu
  uploads/                obrázky nahrané z administrace
  .htaccess               nastavení Apache pro Endoru
src/
  app/                    stránky (App Router) + globals.css
  components/
    layout/               levý pruh, hlavička, patička, navigace
    sections/             jednotlivé sekce stránek
    forms/                tři formuláře (převzaté 1:1)
    ui/                   tlačítka, logo, karty
  lib/
    content.ts            načtení a kontrola obsahu (Zod)
    icons.tsx             registr ikon – převádí název z obsahu na ikonu
    metadata.ts           titulky a Open Graph pro jednotlivé stránky
.github/workflows/        automatické sestavení a nasazení
```

### Jak funguje obsah

Vše, co je vidět na webu, je v `content/*.json`. Soubory se při buildu
kontrolují proti schématu v `src/lib/content.ts` – když v administraci někdo
smaže povinné pole, build se zastaví s popisem chyby a na web se nic
rozbitého nedostane.

Ikony nejdou uložit do JSONu, takže se ukládá jen jejich název
(např. `ShieldCheck`) a `src/lib/icons.tsx` ho převede na skutečnou ikonu.
**Když přidáte novou ikonu do `src/lib/icons.tsx`, přidejte ji i do seznamu
`icon_options` v `public/admin/config.yml`**, jinak ji nepůjde v administraci
vybrat.

---

## Zbývá dodělat (tři kroky, ani jeden není v kódu)

Projekt je hotový, ale tyhle tři věci se musí nastavit v účtech – kód je na
ně připravený.

### 1. Video na úvodní stránce

Video `reklama_final.mp4` má **110 MB** a v původním repozitáři je uložené
přes Git LFS. Do tohohle repozitáře se záměrně nedává:

- GitHub dává u LFS zdarma 1 GB přenosu měsíčně a každé sestavení webu by
  video stahovalo znovu – po devíti buildech by limit došel,
- na hostingu už video nahrané je a nasazení se ho nedotýká (je vyjmenované
  v sekci `exclude` ve workflow i v `.gitignore`).

Web ho načítá z adresy `/reklama_final.mp4`, takže na ostrém webu funguje
bez dalšího zásahu.

**Pro vývoj na svém počítači** si ho jednou zkopírujte do `public/`:

```bash
cd ~/smk-capital && git lfs pull      # stáhne skutečný soubor
cp ~/smk-capital/public/reklama_final.mp4 ~/projects/smk-capital-next/public/
```

(V `public/reklama_final.mp4` je teď jen 134bajtový LFS odkaz, protože ani
v původním projektu není soubor lokálně stažený.)

Kdyby bylo video potřeba měnit častěji, dává smysl nahrát ho na YouTube
nebo do CDN a měnit jen odkaz – pole na video je v administraci připravené.

### 2. Administrace na /admin

Administrace používá [Sveltia CMS](https://github.com/sveltia/sveltia-cms) –
editor běží jako obyčejná stránka na webu a ukládá změny přímo do
repozitáře na GitHubu. Nepotřebuje žádný server ani databázi.

#### Vyzkoušení na svém počítači (bez jakéhokoli nastavování)

Funguje hned, žádné přihlašování ani OAuth není potřeba:

1. spusťte `npm run dev`,
2. otevřete **http://localhost:3000/admin/index.html** v Chrome, Edge nebo
   jiném prohlížeči založeném na Chromiu (Firefox ani Safari to neumí –
   chybí jim File System Access API; `index.html` v adrese je potřeba
   napsat, samotné `/admin/` vývojový server nemusí obsloužit),
3. klikněte na **„Work with Local Repository“** a vyberte složku projektu.

Editor pak zapisuje rovnou do souborů `content/*.json` na disku. Commit a
push si děláte sami v Gitu – CMS v tomhle režimu s Gitem nepracuje.

#### Ostrý provoz

Aby fungovalo přihlášení přes GitHub, je potřeba jednou nastavit dvě věci:

1. **OAuth aplikace na GitHubu**
   (Settings → Developer settings → OAuth Apps → New OAuth App):
   - *Homepage URL*: `https://smkcapital.cz`
   - *Authorization callback URL*: adresa pomocné služby z dalšího bodu
   - vznikne *Client ID* a *Client Secret*

2. **Pomocná přihlašovací služba** – zdarma jako Cloudflare Worker
   ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)).
   Do jejích proměnných se vloží Client ID a Client Secret z předchozího
   bodu, worker dostane adresu typu `https://neco.workers.dev`.

3. Do `public/admin/config.yml` doplnit:
   - `repo:` – uživatel a název repozitáře na GitHubu
   - `base_url:` – adresa workeru z bodu 2

Klient pak jde na `https://smkcapital.cz/admin/`, přihlásí se GitHub účtem
(musí mít do repozitáře přístup) a edituje texty. Po uložení se změna
projeví na webu zhruba do dvou minut – tolik trvá, než se web sestaví a
nahraje.

### 3. Automatické nasazení na Endoru

Workflow `.github/workflows/deploy.yml` je připravené. V nastavení
repozitáře (Settings → Secrets and variables → Actions) je potřeba doplnit:

| Secret | Hodnota |
|---|---|
| `FTP_SERVER` | adresa FTP serveru Endory |
| `FTP_USERNAME` | FTP uživatel |
| `FTP_PASSWORD` | FTP heslo |
| `FTP_SERVER_DIR` | složka, ze které se web servíruje (na Endoře bývá `/www/` nebo `/web/` – ověřte ve svém FTP klientovi) |

Workflow zkontroluje typy, sestaví web a nahraje obsah složky `out/`.
PHP skripty formulářů, které na hostingu už jsou, nechává být – jsou
vyjmenované v sekci `exclude`.

---

## Před ostrým nasazením zkontrolovat

- **Telefon pro proklik.** V původním webu mířilo tlačítko s telefonem na
  `tel:+420800506070`, ačkoli se zobrazovala čísla 607 845 260 a
  773 598 104. Tady je nastavené `tel:+420607845260` – pokud má platit jiné
  číslo, změňte ho v administraci (Nastavení webu → Telefon pro proklik).
- **Odkazy v patičce.** „Ochrana osobních údajů“ a „Obchodní podmínky“
  vedou zatím na `#`, stejně jako dřív.
- **Facebook a TikTok** v patičce míří na stránku 404, protože profily
  zatím nejsou. Doplňují se v administraci.
- **Obrázek u karty „Přehled služeb“** se načítá z Unsplash. Až budete mít
  vlastní fotku, nahrajte ji v administraci – pole je připravené.
- **Sekce Recenze** je pořád připravená pro napojení na Google recenze.
