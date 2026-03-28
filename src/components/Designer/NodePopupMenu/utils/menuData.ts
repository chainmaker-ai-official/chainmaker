import { useMemo } from 'react';
import { flowTemplates } from '../../utils/templates';

export const categories = [
  { id: 'flows', name: 'Flow Templates', icon: '', type: 'category' },
  { id: 'system', name: 'System', icon: '', type: 'category' },
  { id: 'data-provider', name: 'Data Provider', icon: '', type: 'category' },
  { id: 'indicators', name: 'Indicators', icon: '', type: 'category' },
  { id: 'processing', name: 'Processing', icon: '', type: 'category' },
  { id: 'logic', name: 'Logic', icon: '', type: 'category' },
  { id: 'execution', name: 'Execution', icon: '', type: 'category' },
  { id: 'risk', name: 'Risk', icon: '', type: 'category' },
  { id: 'notifications', name: 'Notifications', icon: '', type: 'category' }
];

export const nodesByCategory: Record<string, any[]> = {
  'flows': flowTemplates.map(tpl => ({
    id: `flow-${tpl.id}`,
    name: tpl.title,
    icon: '',
    type: 'flow',
    title: tpl.title,
    description: tpl.description,
    category: 'Flows',
    template: tpl,
    color: '#C678DD'
  })),
  'system': [
    { id: 'clock-schedule', name: 'Clock/Schedule', icon: '', type: 'node', title: 'Clock/Schedule', description: 'Triggers the bot to run at regular intervals', category: 'System', subcategory: 'Startup', color: '#70AD47' },
    { id: 'bang', name: 'Bang', icon: '', type: 'node', title: 'Bang', description: 'Triggers an event', category: 'System', subcategory: 'Event', color: '#ff00ff' },
    { id: 'log', name: 'Log', icon: '', type: 'node', title: 'Log', description: 'Logs data to the console', category: 'System', subcategory: 'Debug', color: '#ABB2BF' }
  ],
  'data-provider': [
    { id: 'uniswap-router', name: 'Uniswap Router', icon: '', type: 'node', title: 'Uniswap Router', description: 'Fetches live blockchain data from Uniswap', category: 'Data Provider', subcategory: 'Blockchain', color: '#ffc000' },
    { id: 'live-order-book', name: 'Live Order Book', icon: '', type: 'node', title: 'Live Order Book', description: 'Displays live order book data', category: 'Data Provider', subcategory: 'Exchange', color: '#61AFEF' },
    { id: 'gas-node', name: 'Gas Price', icon: '', type: 'node', title: 'Gas Price', description: 'Fetches live gas prices', category: 'Data Provider', subcategory: 'Blockchain', color: '#64ffda' }
  ],
  'indicators': [
    { id: 'rsi-indicator', name: 'RSI Indicator', icon: '', type: 'node', title: 'RSI Indicator', description: 'Relative Strength Index', category: 'Indicators', subcategory: 'Technical', color: '#C678DD' },
    { id: 'moving-average', name: 'Moving Average', icon: '', type: 'node', title: 'Moving Average', description: 'SMA or EMA calculation', category: 'Indicators', subcategory: 'Technical', color: '#C678DD' },
    { id: 'bollinger-bands', name: 'Bollinger Bands', icon: '', type: 'node', title: 'Bollinger Bands', description: 'Volatility bands', category: 'Indicators', subcategory: 'Technical', color: '#C678DD' }
  ],
  'processing': [
    { id: 'data-view', name: 'Data View', icon: '', type: 'node', title: 'Data View', description: 'Visualizes connected data', category: 'Processing', subcategory: 'Visualization', color: '#C678DD' },
    { id: 'math-node', name: 'Math Operation', icon: '', type: 'node', title: 'Math Operation', description: 'Perform arithmetic on data', category: 'Processing', subcategory: 'Math', color: '#56B6C2' }
  ],
  'logic': [
    { id: 'logic-gate-and', name: 'Logic Gate (AND)', icon: '', type: 'node', title: 'Logic Gate (AND)', description: 'Combines multiple conditions', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'condition-switch', name: 'Condition Switch', icon: '', type: 'node', title: 'Condition Switch', description: 'Checks if entry conditions are met', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'conditionals', name: 'Conditionals (IF)', icon: '', type: 'node', title: 'Conditionals (IF)', description: 'Simple IF condition', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'switch-router', name: 'Switch Router', icon: '', type: 'node', title: 'Switch Router', description: 'Routes data based on conditions', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'switch-case', name: 'Switch Case', icon: '', type: 'node', title: 'Switch Case', description: 'Multi-way branch logic', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' }
  ],
  'execution': [
    { id: 'trade-executor', name: 'Trade Executor', icon: '', type: 'node', title: 'Trade Executor', description: 'Executes buy/sell orders', category: 'Execution', subcategory: 'Trading', color: '#E06C75' },
    { id: 'limit-order', name: 'Limit Order', icon: '', type: 'node', title: 'Limit Order', description: 'Places a limit order', category: 'Execution', subcategory: 'Trading', color: '#E06C75' }
  ],
  'risk': [
    { id: 'safety-brake', name: 'Safety Brake', icon: '', type: 'node', title: 'Safety Brake', description: 'Emergency stop for strategies', category: 'Risk', subcategory: 'Safety', color: '#C00000' },
    { id: 'stop-loss', name: 'Stop Loss', icon: '', type: 'node', title: 'Stop Loss', description: 'Automatic exit at price level', category: 'Risk', subcategory: 'Safety', color: '#C00000' }
  ]
};

export const useMenuData = (addedNodes: any[]) => {
  return useMemo(() => {
    const baseMenu: any = {
      root: { id: 'root', title: 'Categories', items: categories }
    };

    categories.forEach(category => {
      if (category.type === 'category' && nodesByCategory[category.id]) {
        baseMenu[category.id] = { id: category.id, title: category.name, items: [...nodesByCategory[category.id]] };
      }
    });

    addedNodes.forEach(node => {
      const categoryId = node.category.toLowerCase().replace(/\s+/g, '-');
      if (baseMenu[categoryId]) {
        const alreadyExists = baseMenu[categoryId].items.some((item: any) => item.id === `server-${node.id}`);
        if (!alreadyExists) {
          baseMenu[categoryId].items.push({ id: `server-${node.id}`, name: node.title, icon: node.icon, type: 'node' });
        }
      }
    });

    return baseMenu;
  }, [addedNodes]);
};

export const useFilteredMenuData = (menuData: any, searchQuery: string) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    const query = searchQuery.toLowerCase().trim();
    const filtered: any = {};
    const rootItems = menuData.root.items.filter((item: any) => 
      item.name.toLowerCase().includes(query) ||
      (menuData[item.id] && menuData[item.id].items.some((subItem: any) => subItem.name.toLowerCase().includes(query)))
    );
    filtered.root = { ...menuData.root, items: rootItems };
    rootItems.forEach((item: any) => {
      if (menuData[item.id]) {
        const subItems = menuData[item.id].items.filter((subItem: any) => subItem.name.toLowerCase().includes(query));
        filtered[item.id] = { ...menuData[item.id], items: subItems };
      }
    });
    return filtered;
  }, [menuData, searchQuery]);
};
