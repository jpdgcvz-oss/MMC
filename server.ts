/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-loaded Gemini AI client to avoid crashes if API key is not present initially
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não está configurada. Por favor, configure-a no painel do AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Tutor AI chat endpoint
  app.post("/api/tutor", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Mensagem vazia." });
      }

      const client = getAiClient();
      
      // Build full chat conversation formatted for Gemini
      // Format history into contents structure
      const contents = [];
      
      // Add system instruction as part of the config
      const systemInstruction = 
        "Você é o 'Tutor de Matemática Especialista em Metodologias Ativas'. " +
        "Seu tom é motivador, amigável e focado em fazer o aluno pensar. " +
        "Use linguagem simples e acessível para o nível de ensino básico/médio. " +
        "Quando o aluno pedir ajuda para entender MMC, MDC, números primos ou divisibilidade, " +
        "explique de forma clara, usando analogias práticas (como fatias de pizza, passos ou relógios) " +
        "e estimule-o a encontrar a resposta sozinho. Nunca dê a resposta de mão beijada. " +
        "Se o usuário perguntar algo fora de matemática, lembre-o amigavelmente que o seu foco é ser " +
        "o tutor de matemática de MMC dele hoje.";

      // Map past messages to candidates for contents array
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add the current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "Desculpe, não consegui processar a resposta. Vamos tentar novamente?";
      res.json({ reply });
    } catch (error: any) {
      console.error("Erro no Tutor AI:", error);
      res.status(500).json({ 
        error: error.message || "Erro interno do servidor.",
        needsConfig: !process.env.GEMINI_API_KEY 
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
});
