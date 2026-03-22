/**
 * Constants used throughout the Designer component
 */

/**
 * Activity ID mapping for different block types
 */
export const activityIdMap = {
  'live-order-book': 1,
  'arbitrage-comparison': 2,
  'transaction-unjumble': 5,
  'binary-risk-gate': 8,
  'social-sentiment': 15,
  'ai-signal-engine': 19,
  'priority-fee-gas-war': 21,
  'visual-graph-analytics': 24,
  'ai-telegram-trading': 29,
  'geyser-plugin': 30,
  'block-proposer': 31,
  'dex-pool-factory': 32,
  'cross-chain-bridge': 33,
  'sandwich-attack': 34,
  'liquidity-migration': 35,
  'tokenomics-parser': 36,
  'balance-protection': 38,
  'simulation-engine': 39,
  'flash-loan-protector': 40,
  'jito-bundle-signer': 41,
  'smart-order-router': 42,
  'nonce-manager': 43,
  'data-view': 44,
  'uniswap-router': 50,
  'etherscan-gas-node': 5,
  'conditionals': 51,
  'logic-gate-and': 11,
  'condition-switch': 12,
  'switch-router': 13,
'safety-brake': 14,
'switch-case': 52
};

/**
 * Block type categories for styling
 */
export const BLOCK_TYPES = {
  BLOCKCHAIN: 'blockchain',
  DEFAULT: 'default',
  DATA: 'data'
};

/**
 * Connection port types
 */
export const PORT_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output'
};

/**
 * Curve styles for connections
 */
export const CURVE_STYLES = {
  SMOOTH: 'smooth',
  SHARP: 'sharp',
  STRAIGHT: 'straight'
};

/**
 * Default block dimensions
 */
export const BLOCK_DIMENSIONS = {
  WIDTH: 100,
  HEIGHT: 50,
  PORT_SIZE: 10
};

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  BLOCK_ADD: 500,
  BLOCK_DELETE: 300,
  CONNECTION_HOVER: 150
};

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  WORKSPACE: 'workspace',
  WIRE_OVERLAY: 'wire-overlay',
  CONNECTION_LINE: 'connection-line-drawing',
  CONNECTION_HOVER: 'connection-hover',
  BLOCK_NEW: 'block-new',
  BLOCK_DELETING: 'block-deleting',
  BLOCK_DRAGGING: 'block-dragging'
};

/**
 * UUIDs for special block types
 */
export const BLOCK_UUIDS = {
  LIVE_ORDER_BOOK: "e4a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
  DATA_VIEW: "d5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a"
};

/**
 * Default workspace settings
 */
export const WORKSPACE_DEFAULTS = {
  SCROLL_SPEED: 20,
  GRID_SIZE: 20,
  SNAP_TO_GRID: false
};