export const EXAMPLE_BOT = {
  nodes: [
    {
      id: "node-1",
      activityId: "live-order-book",
      title: "Live Order Book",
      label: "Live Order Book",
      type: "blockchain",
      category: "Blockchain",
      position: { x: 100, y: 100 },
      icon: "Activity"
    },
    {
      id: "node-2",
      activityId: "ai-signal-engine",
      title: "AI Signal Engine",
      label: "AI Signal Engine",
      type: "blockchain",
      category: "AI",
      position: { x: 400, y: 100 },
      icon: "Cpu"
    },
    {
      id: "node-3",
      activityId: "smart-order-router",
      title: "Smart Order Router",
      label: "Smart Order Router",
      type: "blockchain",
      category: "Execution",
      position: { x: 700, y: 100 },
      icon: "Shuffle"
    },
    {
      id: "node-4",
      activityId: "uniswap-router",
      title: "Uniswap Router",
      label: "Uniswap Router",
      type: "blockchain",
      category: "Execution",
      position: { x: 1000, y: 100 },
      icon: "Zap"
    }
  ],
  connections: [
    {
      id: "conn-1",
      sourceId: "node-1",
      targetId: "node-2",
      sourcePort: "output",
      targetPort: "input"
    },
    {
      id: "conn-2",
      sourceId: "node-2",
      targetId: "node-3",
      sourcePort: "output",
      targetPort: "input"
    },
    {
      id: "conn-3",
      sourceId: "node-3",
      targetId: "node-4",
      sourcePort: "output",
      targetPort: "input"
    }
  ]
};
