import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Available nodes for the designer
  const availableNodes = [
    {
      id: "bang",
      title: "Bang",
      description: "Trigger a flow manually",
      icon: "Zap",
      category: "Utility",
      subcategory: "Trigger",
      status: "active",
      color: "#f1c40f"
    },
    {
      id: "log",
      title: "Log",
      description: "Log output to console",
      icon: "Terminal",
      category: "Utility",
      subcategory: "Debug",
      status: "active",
      color: "#95a5a6"
    },
    {
      id: "live-order-book",
      title: "Live Order Book",
      description: "Real-time market data feed",
      icon: "Activity",
      category: "Data Provider",
      subcategory: "Market",
      status: "active",
      color: "#61AFEF"
    },
    {
      id: "arbitrage-comparison",
      title: "Arbitrage Logic",
      description: "Compare prices across DEXs",
      icon: "GitCompare",
      category: "Logic",
      subcategory: "Strategy",
      status: "active",
      color: "#C678DD"
    },
    {
      id: "smart-order-router",
      title: "Smart Order Router",
      description: "Route orders for best execution",
      icon: "Route",
      category: "Execution",
      subcategory: "Trading",
      status: "active",
      color: "#E06C75"
    },
    {
      id: "social-sentiment",
      title: "Social Sentiment",
      description: "Analyze social media trends",
      icon: "MessageSquare",
      category: "Data Provider",
      subcategory: "Social",
      status: "active",
      color: "#56B6C2"
    },
    {
      id: "ai-signal-engine",
      title: "AI Signal Engine",
      description: "Generate trading signals using AI",
      icon: "Cpu",
      category: "AI",
      subcategory: "Analysis",
      status: "active",
      color: "#98C379"
    },
    {
      id: "uniswap-router",
      title: "Uniswap Router",
      description: "Execute swaps on Uniswap",
      icon: "Repeat",
      category: "DeFi",
      subcategory: "Uniswap",
      status: "active",
      color: "#ff007a"
    },
    {
      id: "binary-risk-gate",
      title: "Binary Risk Gate",
      description: "Pass/Fail risk assessment",
      icon: "ShieldCheck",
      category: "Risk",
      subcategory: "Safety",
      status: "active",
      color: "#C00000"
    },
    {
      id: "1",
      title: "Ethereum Transfer",
      description: "Transfer ETH between wallets",
      icon: "Wallet",
      category: "Blockchain",
      subcategory: "Ethereum",
      status: "active",
      color: "#3c3c3d"
    }
  ];

  // API routes
  app.get("/api/nodes", (req, res) => {
    res.json(availableNodes);
  });

  app.post("/api/designer/save", (req, res) => {
    console.log("Saving designer data:", req.body);
    res.json({ status: "success", message: "Data saved successfully" });
  });

  app.get("/api/designer/load", (req, res) => {
    res.json({
      nodes: [],
      connections: []
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
