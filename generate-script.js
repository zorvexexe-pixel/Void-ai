export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST for script generation." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server setup incomplete: GEMINI_API_KEY is missing in Vercel Environment Variables." });
  }

  try {
    const body = req.body || {};
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const language = typeof body.language === "string" ? body.language : "JavaScript";
    const style = typeof body.style === "string" ? body.style : "explained";

    if (!prompt) return res.status(400).json({ error: "Please enter a script description." });
    if (prompt.length > 5000) return res.status(400).json({ error: "Prompt is too long. Keep it under 5000 characters." });

    const allowedLanguages = new Set(["Lua", "JavaScript", "Python", "HTML/CSS"]);
    const safeLanguage = allowedLanguages.has(language) ? language : "JavaScript";
    const styleText = style === "code" ? "Return code only, with no markdown fences." :
      style === "beginner" ? "Explain briefly in beginner-friendly steps, then provide the code." :
      "Provide the code and a concise explanation.";

    const systemInstruction = `You are VOID AI, a helpful programming assistant for legitimate game and app development.
Write useful code in ${safeLanguage}. ${styleText}
If appropriate, mention dependencies and where the code should run. Be honest about assumptions and limitations.
Do not help create malware, credential theft, destructive code, or scripts intended to exploit, cheat in, or bypass security of third-party online games. Offer a safe alternative such as a mechanic for the user's own game.
Keep the response practical and readable.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "The AI provider returned an error.";
      return res.status(502).json({ error: message });
    }

    const code = (data?.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    if (!code) return res.status(502).json({ error: "The AI returned no text. Please try again." });
    return res.status(200).json({ code });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error. Please try again." });
  }
}