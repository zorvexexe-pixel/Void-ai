export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  try {
    const body = req.body || {};
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const language = typeof body.language === "string" ? body.language.trim() : "Lua";
    const style = typeof body.style === "string" ? body.style.trim() : "code";

    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    if (prompt.length > 5000) return res.status(400).json({ error: "Prompt is too long." });

    const allowedLanguages = new Set(["Lua", "JavaScript", "Python", "HTML/CSS"]);
    const safeLanguage = allowedLanguages.has(language) ? language : "Lua";
    const styleText = style === "code" ? "Return clean, working code with minimal comments." : "Provide the code and a concise summary.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant for game development script creation. Generate safe, legitimate ${safeLanguage} code for this request: "${prompt}". Style: ${styleText}`
          }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API error" });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";
    return res.status(200).json({ result: generatedText });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
