# VOID AI Script Creator

Mobile-friendly dark/neon-green gaming script library with an AI code-generation panel.

## What is included
- `index.html` — complete website UI and sample script library.
- `api/generate-script.js` — Vercel serverless backend; keeps the Gemini API key on the server.
- `package.json` and `vercel.json` — project configuration.

## Deploy from an Android phone
1. Create a GitHub account if needed.
2. Create a new repository, for example `void-ai`.
3. Upload all files and keep `api/generate-script.js` inside the `api` folder.
4. Open Vercel and import the GitHub repository.
5. In Vercel project settings, open Environment Variables and add:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key from Google AI Studio
6. Redeploy the project after adding the variable.
7. Open the deployed Vercel URL and test VOID AI.

## Important
- A local `file://` HTML page alone cannot run this backend. Deploy to Vercel and use the hosted URL.
- Never put the Gemini API key in `index.html`, GitHub source code, or any browser-side JavaScript.
- API usage may be subject to quotas, availability, pricing, and Google terms. Check your current AI Studio settings.
- Add rate limiting / abuse protection before sharing publicly.
- Generated code may be incorrect. Review and test it in a safe development environment.
