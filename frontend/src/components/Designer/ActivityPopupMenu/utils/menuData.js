/**
 * Menu data structure and categories for ActivityPopupMenu
 * Values aligned with src/assets/structure.json
 */

import { useMemo } from 'react';

/**
 * Categories for the activity menu - derived from structure.json unique categories
 */
export const categories = [
  { id: 'system', name: 'System', icon: '⚙️', type: 'category' },
  { id: 'data-provider', name: 'Data Provider', icon: '📊', type: 'category' },
  { id: 'processing', name: 'Processing', icon: '🔄', type: 'category' },
  { id: 'logic', name: 'Logic', icon: '🧠', type: 'category' },
  { id: 'execution', name: 'Execution', icon: '⚔️', type: 'category' },
  { id: 'risk', name: 'Risk', icon: '🛡️', type: 'category' },
  { id: 'notifications', name: 'Notifications', icon: '🔔', type: 'category' },
  { id: 'marketplace-more', name: 'Add more from marketplace', icon: '🛒', type: 'action' }
];

/**
 * Activities by category - loaded from structure.json trading_modules
 */
export const activitiesByCategory = {
  'system': [
    { id: 'clock-schedule', name: 'Clock/Schedule', icon: '⏰', type: 'activity', title: 'Clock/Schedule', description: 'Triggers the bot to run at regular intervals', category: 'System', subcategory: 'Startup', color: '#70AD47' },
    { id: 'wallet-sync', name: 'Wallet Sync', icon: '👛', type: 'activity', title: 'Wallet Sync', description: 'Checks if wallet has sufficient balance', category: 'System', subcategory: 'Startup', color: '#70AD47' },
    { id: 'gas-watcher', name: 'Gas Watcher', icon: '⛽', type: 'activity', title: 'Gas Watcher', description: 'Monitors network congestion', category: 'System', subcategory: 'Startup', color: '#70AD47' }
  ],
  'data-provider': [
   
    { id: 'alchemy-infura-node', name: 'Alchemy/Infura Node', icon: '🔗', type: 'activity', title: 'Alchemy/Infura Node', description: 'Fetches live blockchain data', category: 'Data Provider', subcategory: 'Blockchain', color: '#FFC000' },
    { id: 'etherscan-gas-node', name: 'Etherscan Gas Node', icon: '🔍', type: 'activity', title: 'Etherscan Gas Node', description: 'Gets current gas prices', category: 'Data Provider', subcategory: 'Blockchain', color: '#FFC000' },
     { id: 'uniswap-router', name: 'Uniswap Router', icon: '🔗', type: 'activity', title: 'Uniswap Router', description: 'Fetches live blockchain data from uniswap', category: 'Data Provider', subcategory: 'Blockchain', color: '#ffc000' }
  ],
  'processing': [
    { id: 'gas-price-filter', name: 'Gas Price Filter', icon: '🔽', type: 'activity', title: 'Gas Price Filter', description: 'Filters out high gas transactions', category: 'Processing', subcategory: 'Analytics', color: '#5B9BD5' },
    { id: 'volatility-filter', name: 'Volatility Filter', icon: '📈', type: 'activity', title: 'Volatility Filter', description: 'Checks if price is stable enough', category: 'Processing', subcategory: 'Analytics', color: '#5B9BD5' },
    { id: 'rsi-calculator', name: 'RSI Calculator', icon: '🧮', type: 'activity', title: 'RSI Calculator', description: 'Calculates RSI indicator', category: 'Processing', subcategory: 'Analytics', color: '#5B9BD5' },
    { id: 'rsi-node', name: 'RSI Node', icon: '📊', type: 'activity', title: 'RSI Node', description: 'Generates buy/sell signals based on RSI', category: 'Processing', subcategory: 'Analytics', color: '#5B9BD5' },
    { id: 'math-formula-node', name: 'Math/Formula Node', icon: '➗', type: 'activity', title: 'Math/Formula Node', description: 'Calculates position size and targets', category: 'Processing', subcategory: 'Analytics', color: '#5B9BD5' }
  ],
  'logic': [
    { id: 'logic-gate-and', name: 'Logic Gate (AND)', icon: '🔀', type: 'activity', title: 'Logic Gate (AND)', description: 'Combines multiple conditions', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'condition-switch', name: 'Condition Switch', icon: '🔀', type: 'activity', title: 'Condition Switch', description: 'Checks if entry conditions are met', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'switch-router', name: 'Switch/Router', icon: '➡️', type: 'activity', title: 'Switch/Router', description: 'Directs traffic based on signal', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
    { id: 'safety-brake', name: 'Safety Brake', icon: '🛑', type: 'activity', title: 'Safety Brake', description: 'Emergency stop mechanism', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
{ id: 'conditionals', name: 'Conditionals', icon: '🔀', type: 'activity', title: 'Conditionals', description: 'Conditional logic for branching flows', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' },
{ id: 'switch-case', name: 'Switch Case', icon: '🔀', type: 'activity', title: 'Switch Case', description: 'Switch-case control flow for multiple conditions', category: 'Logic', subcategory: 'Control Flow', color: '#ED7D31' }
  ],
  'execution': [
    { id: 'uniswap-v3-swap', name: 'Uniswap V3 Swap', icon: '🔄', type: 'activity', title: 'Uniswap V3 Swap', description: 'Executes the trade on DEX', category: 'Execution', subcategory: 'Trading', color: '#7030A0' },
    { id: 'signer-node', name: 'Signer Node', icon: '✍️', type: 'activity', title: 'Signer Node', description: 'Signs the transaction securely', category: 'Execution', subcategory: 'Trading', color: '#7030A0' },
    { id: 'flashbots-relay', name: 'Flashbots Relay', icon: '🚀', type: 'activity', title: 'Flashbots Relay', description: 'Sends private transaction', category: 'Execution', subcategory: 'Trading', color: '#7030A0' }
  ],
  'risk': [
    { id: 'fixed-stop-loss', name: 'Fixed Stop-Loss', icon: '🛡️', type: 'activity', title: 'Fixed Stop-Loss', description: 'Automatic loss cutoff', category: 'Risk', subcategory: 'Protection', color: '#C00000' },
    { id: 'trailing-stop', name: 'Trailing Stop', icon: '📉', type: 'activity', title: 'Trailing Stop', description: 'Moves exit point with profit', category: 'Risk', subcategory: 'Protection', color: '#C00000' }
  ],
  'notifications': [
    { id: 'telegram-node', name: 'Telegram Node', icon: '📱', type: 'activity', title: 'Telegram Node', description: 'Sends alerts to phone', category: 'Notifications', subcategory: 'Alerts', color: '#4472C4' },
    { id: 'discord-notify', name: 'Discord Notify', icon: '💬', type: 'activity', title: 'Discord Notify', description: 'Sends alerts to Discord', category: 'Notifications', subcategory: 'Alerts', color: '#4472C4' }
  ]
};

/**
 * Hook to generate menu data with injected activities from Redux store
 * @param {array} addedActivities - Activities added to palette from Redux
 * @returns {object} - Menu data structure
 */
export const useMenuData = (addedActivities) => {
  return useMemo(() => {
    const baseMenu = {
      root: {
        id: 'root',
        title: 'Categories',
        items: categories
      }
    };

    // Add submenus for each category
    categories.forEach(category => {
      if (category.type === 'category' && activitiesByCategory[category.id]) {
        baseMenu[category.id] = {
          id: category.id,
          title: category.name,
          items: activitiesByCategory[category.id]
        };
      }
    });

    // Inject items from the Redux store
    addedActivities.forEach(activity => {
      const categoryId = activity.category.toLowerCase().replace(/\s+/g, '-');
      if (baseMenu[categoryId]) {
        const alreadyExists = baseMenu[categoryId].items.some(item => item.id === `market-${activity.id}`);
        if (!alreadyExists) {
          baseMenu[categoryId].items.push({
            id: `market-${activity.id}`,
            name: activity.title,
            icon: activity.icon,
            type: 'activity'
          });
        }
      }
    });

    return baseMenu;
  }, [addedActivities]);
};

/**
 * Hook to filter menu data based on search query
 * @param {object} menuData - The full menu data object
 * @param {string} searchQuery - The search query string
 * @returns {object} - Filtered menu data
 */
export const useFilteredMenuData = (menuData, searchQuery) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return menuData;

    const query = searchQuery.toLowerCase().trim();
    const filtered = {};

    // Filter root items
    const rootItems = menuData.root.items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (menuData[item.id] && menuData[item.id].items.some(subItem => 
        subItem.name.toLowerCase().includes(query)
      ))
    );

    filtered.root = { ...menuData.root, items: rootItems };

    // Filter submenus
    rootItems.forEach(item => {
      if (menuData[item.id]) {
        const subItems = menuData[item.id].items.filter(subItem =>
          subItem.name.toLowerCase().includes(query)
        );
        filtered[item.id] = { ...menuData[item.id], items: subItems };
      }
    });

    return filtered;
  }, [menuData, searchQuery]);
};
