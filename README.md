# Al Faraj Web App

Static frontend app that consumes the Al Faraj API service.

## GitHub Pages

This repo includes `.github/workflows/pages.yml` to auto-deploy on pushes to `main`.
After enabling Pages in repo settings, your site will be published at:

- `https://akbernamazi.github.io/alFarajWeb/`

Set your production API URL in `app.js` (replace `https://api.example.com/api/v1`) or override at runtime:

```js
window.AZA_API_BASE_URL = "https://your-api-domain/api/v1";
```

## Run

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173`.

By default this app calls `http://localhost:4000/api/v1`.
