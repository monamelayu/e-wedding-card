# E-Wedding Card 💍

A bilingual (Bahasa Melayu / English) digital wedding invitation with RSVP and
wishes ("ucapan") saved to a Google Sheet. Free to host, no server needed.

## Project structure

```
index.html            The card (single page)
css/style.css         Elegant floral theme
js/config.js          ⭐ ALL wedding details — edit this file only
js/main.js            Logic (countdown, RSVP, wishes, language toggle)
apps-script/Code.gs   Backend code to paste into Google Sheets
```

## 1. Fill in your details

Open `js/config.js` and replace everything marked `[PLACEHOLDER]`:
names, parents, date/time, venue, Google Maps/Waze links, WhatsApp contacts.

## 2. Preview locally

Just open `index.html` in a browser, or run a tiny server:

```
npx serve .
```

Without the Google Sheet connected, the card runs in **demo mode**
(RSVPs/wishes are saved in your browser only, so you can test everything).

## 3. Google Sheet setup (your free database)

1. Go to [sheets.new](https://sheets.new) and create a blank spreadsheet.
   Name it e.g. "Wedding RSVP".
2. Menu: **Extensions → Apps Script**.
3. Delete the sample code and paste in the contents of `apps-script/Code.gs`.
   Save (Ctrl+S).
4. Click **Deploy → New deployment**.
   - Click the gear ⚙ next to "Select type" → choose **Web app**.
   - Description: anything.
   - **Execute as: Me**
   - **Who has access: Anyone**  ← important, otherwise guests can't submit
   - Click **Deploy**.
5. Google will ask you to authorise — click through
   ("Advanced → Go to ... (unsafe)" is normal for your own scripts).
6. Copy the **Web app URL** (ends with `/exec`).
7. Paste it into `js/config.js`:

```js
appsScriptUrl: "https://script.google.com/macros/s/XXXXX/exec",
```

Done. RSVPs appear in the **RSVP** tab, wishes in the **Wishes** tab
(tabs are created automatically on first submission).

> **If you later edit Code.gs**: use **Deploy → Manage deployments → ✏ Edit →
> Version: New version → Deploy** so the same URL picks up your changes.

## 4. Deploy free on Vercel

1. Create a free account at [vercel.com](https://vercel.com) (sign in with GitHub, GitLab, or email).
2. Easiest path — **Vercel CLI**:

```
npm i -g vercel
vercel
```

Follow the prompts (accept defaults). You'll get a URL like
`https://your-card.vercel.app`. Run `vercel --prod` to publish updates.

Alternative without CLI: push this folder to a GitHub repo, then in Vercel
click **Add New → Project → Import** your repo. Every `git push` auto-deploys.

3. Share the link on WhatsApp 🎉

## Group invitation links

Share these instead of the plain URL to tag each RSVP with who invited them
(tracked in the `Group` column of the RSVP tab):

| Link | Group |
|---|---|
| `/gi` | Nuqman (Groom) |
| `/br` | Alya (Bride) |
| `/zj` | Zainal 'Abidin (Father) |
| `/mm` | Morly (Mother) |
| `/sb` | Siblings |

Edit the `groups` map in `js/config.js` (and matching rewrites in
`vercel.json`) to add or rename groups.

## Dashboard

`/dashboard-kambing` shows live RSVP stats: attending pax, per-group chart,
and the full response table. It is unlisted — only people who know the URL
can find it. To change the secret path, rename `dashboard-kambing.html`.

> After changing `apps-script/Code.gs`, re-deploy it: in the Apps Script
> editor, **Deploy → Manage deployments → ✏ Edit → Version: New version →
> Deploy** (the URL stays the same).

## Tips

- **Test the flow** end-to-end once: submit an RSVP and a wish from your phone
  and check the Sheet.
- To change the design colours, edit the `:root` variables at the top of
  `css/style.css`.
- To hide the programme section, set `tentative: []` in config.
