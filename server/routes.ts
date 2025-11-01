import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { chatRequestSchema, validateWalletSchema } from "@shared/schema";
import { generateChatResponse } from "./services/mistral";
import { validateWalletAddress, transferUSDC } from "./services/solana";
import type { ChatResponse, Message, Transaction } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/validate-wallet", async (req, res) => {
    try {
      const { address } = validateWalletSchema.parse(req.body);
      const result = await validateWalletAddress(address);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ valid: false, error: error.errors[0].message });
      } else {
        res.status(500).json({ valid: false, error: "Failed to validate wallet" });
      }
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, walletAddress, conversationHistory } = chatRequestSchema.parse(req.body);

      const aiResponse = await generateChatResponse(message, conversationHistory || []);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };

      let transaction: Transaction | undefined;

      try {
        const transferResult = await transferUSDC(walletAddress);
        
        transaction = {
          signature: transferResult.signature,
          amount: 0.001,
          recipient: walletAddress,
          timestamp: Date.now(),
          status: transferResult.status,
          error: transferResult.error,
        };
      } catch (error: any) {
        console.error("Transaction error:", error);
        transaction = {
          signature: "",
          amount: 0.001,
          recipient: walletAddress,
          timestamp: Date.now(),
          status: "failed",
          error: error.message || "Failed to process transaction",
        };
      }

      const response: ChatResponse = {
        message: assistantMessage,
        transaction,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
      } else if (error.message?.includes("MISTRAL_API_KEY")) {
        res.status(503).json({ error: "AI service is not configured. Please add MISTRAL_API_KEY." });
      } else if (error.message?.includes("SOLANA_PRIVATE_KEY")) {
        res.status(503).json({ error: "Payment service is not configured. Please add SOLANA_PRIVATE_KEY." });
      } else {
        res.status(500).json({ error: error.message || "Failed to process request" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
