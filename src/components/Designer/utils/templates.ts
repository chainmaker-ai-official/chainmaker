export interface FlowTemplate {
  id: string;
  title: string;
  description: string;
  nodes: {
    typeId: string;
    position: { x: number; y: number };
    label?: string;
  }[];
  connections: {
    sourceIndex: number;
    targetIndex: number;
    sourcePort: string;
    targetPort: string;
  }[];
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: 'arbitrage-flow',
    title: 'Arbitrage Strategy',
    description: 'Complete arbitrage flow from order book to execution.',
    nodes: [
      { typeId: 'bang', position: { x: -200, y: 0 }, label: 'Trigger' },
      { typeId: 'live-order-book', position: { x: 0, y: 0 }, label: 'Market Data' },
      { typeId: 'arbitrage-comparison', position: { x: 250, y: 0 }, label: 'Arb Logic' },
      { typeId: 'smart-order-router', position: { x: 500, y: 0 }, label: 'Execution' }
    ],
    connections: [
      { sourceIndex: 0, targetIndex: 1, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 1, targetIndex: 2, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 2, targetIndex: 3, sourcePort: 'output', targetPort: 'input' }
    ]
  },
  {
    id: 'sentiment-trade-flow',
    title: 'Sentiment Trading',
    description: 'Trade based on social media sentiment analysis.',
    nodes: [
      { typeId: 'bang', position: { x: -200, y: 0 }, label: 'Trigger' },
      { typeId: 'social-sentiment', position: { x: 0, y: 0 }, label: 'Social Feed' },
      { typeId: 'ai-signal-engine', position: { x: 250, y: 0 }, label: 'AI Analysis' },
      { typeId: 'uniswap-router', position: { x: 500, y: 0 }, label: 'Trade' }
    ],
    connections: [
      { sourceIndex: 0, targetIndex: 1, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 1, targetIndex: 2, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 2, targetIndex: 3, sourcePort: 'output', targetPort: 'input' }
    ]
  },
  {
    id: 'risk-managed-trade',
    title: 'Risk-Managed Trade',
    description: 'Trade with a binary risk gate for safety.',
    nodes: [
      { typeId: 'bang', position: { x: -200, y: 0 }, label: 'Trigger' },
      { typeId: 'ai-signal-engine', position: { x: 0, y: 0 }, label: 'Signal' },
      { typeId: 'binary-risk-gate', position: { x: 250, y: 0 }, label: 'Risk Check' },
      { typeId: 'uniswap-router', position: { x: 500, y: 0 }, label: 'Execute' }
    ],
    connections: [
      { sourceIndex: 0, targetIndex: 1, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 1, targetIndex: 2, sourcePort: 'output', targetPort: 'input' },
      { sourceIndex: 2, targetIndex: 3, sourcePort: 'output', targetPort: 'input' }
    ]
  }
];
