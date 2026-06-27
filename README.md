# 🎮 Pokopia Builder

**AI-powered Pokémon Pokopia 3D world generator.**  
Describe a scene or upload a photo → get a fully interactive Three.js 3D build, instantly.

👉 **[Try it live →](https://YOUR-USERNAME.github.io/pokopia-builder)**

---

## What is this?

Pokopia Builder uses Claude AI to generate complete, interactive 3D scenes made entirely from authentic Pokémon Pokopia building pieces — roofs, walls, floors, pillars, lanterns, trees, and more — rendered in Three.js with orbit controls, a floor slicer, and piece palette.

- **Text prompt** — describe any structure
- **Image upload** — recreate any photo in Pokopia style
- **Both** — combine image + description

---

## Hosting it yourself

The app has two parts:

### 1. Frontend (`index.html`)
A single static HTML file. Host it anywhere:
- **GitHub Pages** — push this repo, enable Pages on `main` branch
- **Netlify** — drag and drop the folder
- **Any static host** — just serve `index.html`

### 2. Proxy (`server.js`)
Because browsers can't call the Anthropic API directly (CORS), a small Node.js proxy is needed. Deploy it free:

#### Railway (recommended)
1. Fork this repo
2. New project on [railway.app](https://railway.app) → deploy from GitHub
3. Add env var: `ANTHROPIC_API_KEY=sk-ant-...`
4. Copy the generated URL

#### Render
1. New Web Service on [render.com](https://render.com)
2. Connect this repo, start command: `node server.js`
3. Add env var: `ANTHROPIC_API_KEY=sk-ant-...`

#### Local
```bash
ANTHROPIC_API_KEY=sk-ant-... node server.js
# Runs at http://localhost:3000
```

### 3. Connect them
1. Open your hosted `index.html`
2. Click **⚙ Setup** (top-right)
3. Paste your proxy URL → auto-tests the connection
4. Build!

---

## Environment variables (proxy)

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Your [Anthropic API key](https://console.anthropic.com) |
| `PORT` | No | Port (default: 3000) |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed origins (default: `*`) |

Set `ALLOWED_ORIGINS` to your GitHub Pages URL in production to lock down your proxy.

---

## Cost

Each build costs roughly **$0.05–0.15** in Anthropic API credits (claude-sonnet-4-6).

---

## Stack

- Frontend: Vanilla HTML/CSS/JS + Three.js r128
- AI: Claude claude-sonnet-4-6 via Anthropic API
- Proxy: Node.js (zero dependencies, built-in `http`/`https` only)
