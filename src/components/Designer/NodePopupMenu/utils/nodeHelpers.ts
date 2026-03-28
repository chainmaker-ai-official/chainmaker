import structureData from '../../../../assets/structure.json';
import { nodesByCategory } from './menuData';

export const getNodeByMenuItemId = (menuItemId: string, nodeIdMap: Record<string, number>, availableNodes: any[]) => {
  const nodeId = nodeIdMap[menuItemId];
  
  // 1. Check availableNodes (from API/Redux)
  let node = availableNodes.find(a => a.id === nodeId);
  
  // 2. Check structureData (fallback)
  if (!node && structureData?.trading_modules) {
    node = (structureData.trading_modules as any[]).find(a => a.id === nodeId || a.title.toLowerCase().replace(/[\s/]+/g, '-') === menuItemId);
  }
  
  // 3. Check our custom nodesByCategory (newly added nodes)
  if (!node) {
    for (const category in nodesByCategory) {
      const found = nodesByCategory[category].find(n => n.id === menuItemId);
      if (found) return found;
    }
  }
  
  return node || null;
};

export const isNodeAdded = (menuItemId: string, nodeIdMap: Record<string, number>, availableNodes: any[], addedNodes: any[]) => {
  const node = getNodeByMenuItemId(menuItemId, nodeIdMap, availableNodes);
  if (!node) return false;
  return addedNodes.some(a => a.id === node.id);
};
