# Analytics Setup – Cloudflare Web Analytics + Custom Events

Privacy-friendly analytics without cookies or banners.

## Part 1: Cloudflare Web Analytics (traffic dashboard)

### Where to paste the token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Web Analytics** → **Add a site**
2. Add `deejaytim.nl` and get your **Beacon Token**
3. Replace `REPLACE_ME` in all HTML files and in `pages/partials/head-meta.html`:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token":"YOUR_TOKEN_HERE"}'></script>
```

**Files to update:** Search for `REPLACE_ME` and replace with your token. The beacon is in:
- `pages/partials/head-meta.html` (reference)
- `index.html`
- All other HTML pages (contact, dj-huren, diensten/*, locaties/*, blog/*, etc.)

The script uses `defer` so it does not block rendering.

---

## Part 2: Custom events (Worker + Analytics Engine)

### Event endpoint URL

Set in `js/track.js`:

```javascript
const TRACK_ENDPOINT = 'https://events.deejaytim.nl/event';
```

If using workers.dev instead of a custom domain:

```javascript
const TRACK_ENDPOINT = 'https://djtimer-events.<YOUR_SUBDOMAIN>.workers.dev/event';
```

### Deploy the Worker

1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. From the project root:

```bash
cd cloudflare-worker-events
wrangler deploy
```

4. **Custom domain (events.deejaytim.nl):**
   - Create a CNAME: `events.deejaytim.nl` → `djtimer-events.<subdomain>.workers.dev`
   - Or add a route in Cloudflare: `*events.deejaytim.nl/*` → Worker `djtimer-events`

5. Update `js/track.js` with the final endpoint URL.

### Dataset structure

The Worker writes to `DJTIM_EVENTS`:

| Column | Content |
|--------|---------|
| `index1` | Event name (e.g. `click_whatsapp`, `music_play`) |
| `blob1` | Event name |
| `blob2` | Page path |
| `blob3` | `eventType` (playlist generator) |
| `blob4` | `vibe` (playlist generator) |
| `blob5` | `ageMix` (playlist generator) |
| `blob6` | `muted` (music_mute_toggle) |
| `double1` | Always 1 (count) |

### Tracked events

| Event | When |
|-------|------|
| `click_call` | Click on `tel:` link |
| `click_email` | Click on `mailto:` link |
| `click_whatsapp` | Click on wa.me or whatsapp link |
| `click_book_now` | Click on "Boek nu" / CTA button |
| `location_open` | Page load on `/locaties/dj-*.html` |
| `service_open` | Page load on `/diensten/*.html` |
| `blog_open` | Page load on `/blog/post.html` |
| `music_play` | Music player play |
| `music_pause` | Music player pause |
| `music_mute_toggle` | Mute/unmute (data: `{ muted: true/false }`) |
| `music_minimize` | Player bar collapse |
| `music_expand` | Player bar expand |
| `playlist_generator_used` | "Genereer playlist" click (data: `eventType`, `vibe`, `ageMix`) |

---

## Part 3: Example SQL queries

Use the [Cloudflare Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/):

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/analytics_engine/sql" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d "YOUR_SQL_QUERY"
```

Create a token with **Account | Account Analytics | Read**.

### Events per day by name

```sql
SELECT
  toDate(timestamp) AS day,
  blob1 AS event_name,
  SUM(_sample_interval) AS count
FROM DJTIM_EVENTS
WHERE timestamp > NOW() - INTERVAL '30' DAY
GROUP BY day, blob1
ORDER BY day DESC, count DESC
```

### Top paths for click_whatsapp

```sql
SELECT
  blob2 AS path,
  SUM(_sample_interval) AS clicks
FROM DJTIM_EVENTS
WHERE blob1 = 'click_whatsapp'
  AND timestamp > NOW() - INTERVAL '90' DAY
GROUP BY blob2
ORDER BY clicks DESC
LIMIT 20
```

### music_play count last 7 days

```sql
SELECT SUM(_sample_interval) AS play_count
FROM DJTIM_EVENTS
WHERE blob1 = 'music_play'
  AND timestamp > NOW() - INTERVAL '7' DAY
```

### Playlist generator usage by event type

```sql
SELECT
  blob3 AS event_type,
  SUM(_sample_interval) AS uses
FROM DJTIM_EVENTS
WHERE blob1 = 'playlist_generator_used'
  AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY blob3
ORDER BY uses DESC
```

### Location vs service page opens (last 14 days)

```sql
SELECT
  blob1 AS event_type,
  SUM(_sample_interval) AS opens
FROM DJTIM_EVENTS
WHERE blob1 IN ('location_open', 'service_open')
  AND timestamp > NOW() - INTERVAL '14' DAY
GROUP BY blob1
```
