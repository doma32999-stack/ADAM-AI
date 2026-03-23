import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/chat", async (req, res) => {
    const { model, messages, stream } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey && (model.startsWith("gpt") || model.includes("copilot"))) {
      return res.status(400).json({ error: "OpenAI API Key is missing. Please add OPENAI_API_KEY to your environment variables." });
    }

    const openai = new OpenAI({ apiKey });

    try {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const completion = await openai.chat.completions.create({
          model: model === "copilot" ? "gpt-4-turbo" : model,
          messages,
          stream: true,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const completion = await openai.chat.completions.create({
          model: model === "copilot" ? "gpt-4-turbo" : model,
          messages,
        });
        res.json({ text: completion.choices[0].message.content });
      }
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
