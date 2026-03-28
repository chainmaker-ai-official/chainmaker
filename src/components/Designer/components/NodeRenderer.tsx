import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DraggableNode from '../Objects/DraggableNode';
import Bang from '../Objects/Bang';
import Log from '../Objects/Log';
import LiveOrderBookDraggableBox from '../Objects/LiveOrderBookDraggableBox';
import DataView from '../Objects/DataView';
import SystemClock from '../Objects/SystemClock';
import UniswapRouter from '../Objects/UniswapRouter';
import Conditionals from '../Objects/Conditionals';
import LogicGateAnd from '../Objects/LogicGateAnd';
import ConditionSwitch from '../Objects/ConditionSwitch';
import SwitchRouter from '../Objects/SwitchRouter';
import SafetyBrake from '../Objects/SafetyBrake';
import SwitchCase from '../Objects/SwitchCase';
import GasNode from '../Objects/GasNode';
import MovingAverage from '../Objects/MovingAverage';
import TradeExecutor from '../Objects/TradeExecutor';
import MathNode from '../Objects/MathNode';
import RSIIndicator from '../Objects/RSIIndicator';
import BollingerBands from '../Objects/BollingerBands';
import StopLoss from '../Objects/StopLoss';
import LimitOrder from '../Objects/LimitOrder';
import ArbitrageLogic from '../Objects/ArbitrageLogic';
import SmartOrderRouter from '../Objects/SmartOrderRouter';
import SocialSentiment from '../Objects/SocialSentiment';
import AISignalEngine from '../Objects/AISignalEngine';
import BinaryRiskGate from '../Objects/BinaryRiskGate';
import { triggerBang, selectBangTriggers, selectBangTriggerCount } from '../../../redux/slices/bangSlice';
import { setNodeOutput, selectNodeOutputs } from '../../../redux/slices/nodeOutputsSlice';

// Store clock tick data globally so it can be shared between nodes
const clockTickData: Record<string | number, any> = {};

// Store the label of DraggableNode so Bang can pass it to Log
const draggableNodeLabels: Record<string | number, string> = {};

interface Node {
  id: string | number;
  label?: string;
  title?: string;
  type?: string;
  position?: { x: number; y: number };
  isEditable?: boolean;
  component_uuid?: string;
  component?: string;
  category?: string;
  nodeData?: any;
}

interface Connection {
  sourceId: string | number;
  targetId: string | number;
  targetPort?: string;
}

interface NodeRendererProps {
  node: Node;
  connections: Connection[];
  draggedNodeId: string | number | null;
  newNodeIds: Set<string | number>;
  deletingNodeIds: Set<string | number>;
  onDragStart: (id: string, e: any) => void;
  onDelete: (id: string) => void;
  onConnectionStart: (id: string, portType: string, e: any) => void;
  onConnectionEnd: (id: string, portType: string, e: any) => void;
  onLabelChange: (id: string, label: string) => void;
  onNodeClick: (id: string, e: any) => void;
  onContextMenu?: (e: any) => void;
  isSelected?: boolean;
}

/**
 * Component that renders nodes based on their type
 */
const NodeRenderer: React.FC<NodeRendererProps> = ({ 
  node, 
  connections, 
  draggedNodeId, 
  newNodeIds, 
  deletingNodeIds,
  onDragStart,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  onLabelChange,
  onNodeClick,
  onContextMenu,
  isSelected = false
}) => {
  // Redux dispatch and selectors for Bang triggers
  const dispatch = useDispatch();
  const bangTriggers = useSelector(selectBangTriggers);
  const bangTriggerCount = useSelector(selectBangTriggerCount);
  const nodeOutputs = useSelector(selectNodeOutputs);
  
  // Store label for lookup
  if (node.label) {
    draggableNodeLabels[node.id] = node.label;
  }

  // Node type detection
  const isClockTimer = node.id?.toString().includes('clock') || 
                       node.title?.toLowerCase().includes('clock') ||
                       node.title?.toLowerCase().includes('schedule') ||
                       node.component_uuid === "1179fc29-6be5-4bb8-af86-b36d741acc98";
  
  const isLiveOrderBook = node.id?.toString().includes('live-order-book') || 
                         node.title?.toLowerCase().includes('live order book') ||
                         node.component_uuid === "e4a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c";
  
  const isDataView = node.id?.toString().includes('data-view') || 
                     node.title?.toLowerCase().includes('data view') ||
                     node.title?.toLowerCase().includes('dataview') ||
                     (node.id && node.id.toString().startsWith('44-')) ||
                     node.component_uuid === "d5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a";
  
  const isBang = node.id?.toString().includes('bang') || 
                node.title?.toLowerCase().includes('bang') ||
                node.component === 'Bang';

  const isLog = node.id?.toString().includes('log') || 
                node.title?.toLowerCase() === 'log' ||
                node.component === 'Log';

  const isUniswapRouter = node.id?.toString().includes('uniswap-router') || 
                          node.title?.toLowerCase().includes('uniswap router') ||
                          node.component === 'UniswapRouter' ||
                          node.component_uuid === 'uniswap-router-uuid-2024';

  const isConditionals = node.id?.toString().includes('conditionals') || 
                         node.title?.toLowerCase().includes('conditionals') ||
                         node.component === 'Conditionals' ||
                         node.component_uuid === 'conditionals-uuid-2024';

  const isLogicGateAnd = node.id?.toString().includes('logic-gate-and') || 
                         node.title?.toLowerCase().includes('logic gate') ||
                         node.title?.toLowerCase().includes('and') ||
                         node.component === 'LogicGateAnd' ||
                         node.component_uuid === 'logic-gate-and-uuid-2024';

  const isConditionSwitch = node.id?.toString().includes('condition-switch') || 
                           node.title?.toLowerCase().includes('condition switch') ||
                           node.component === 'ConditionSwitch' ||
                           node.component_uuid === 'condition-switch-uuid-2024';

  const isSwitchRouter = node.id?.toString().includes('switch-router') || 
                        (node.title?.toLowerCase().includes('switch') && 
                         node.title?.toLowerCase().includes('router')) ||
                        node.component === 'SwitchRouter' ||
                        node.component_uuid === 'switch-router-uuid-2024';

  const isSafetyBrake = node.id?.toString().includes('safety-brake') || 
                        node.title?.toLowerCase().includes('safety brake') ||
                        node.title?.toLowerCase().includes('brake') ||
                        node.component === 'SafetyBrake' ||
                        node.component_uuid === 'safety-brake-uuid-2024';

  const isSwitchCase = node.id?.toString().includes('switch-case') || 
                       node.title?.toLowerCase().includes('switch case') ||
                       node.label?.toLowerCase().includes('switch case') ||
                       node.component === 'SwitchCase' ||
                       node.component_uuid === 'switch-case-uuid-2024' ||
                       (node.id && node.id.toString().startsWith('52-')) ||
                       node.id === 52 ||
                       (node.category?.toLowerCase().includes('logic') && (node.title?.toLowerCase().includes('switch') || node.label?.toLowerCase().includes('switch'))) ||
                       (node.nodeData?.category?.toLowerCase().includes('logic') && (node.nodeData?.title?.toLowerCase().includes('switch') || node.nodeData?.label?.toLowerCase().includes('switch')));

  const isGasNode = node.id?.toString().includes('etherscan-gas-node') || 
                    node.title?.toLowerCase().includes('etherscan gas node') ||
                    node.component_uuid === '1a272582-e4d9-4552-bdd5-4bdae52e9376';

  const isMovingAverage = node.id?.toString().includes('moving-average') || 
                          node.title?.toLowerCase().includes('moving average') ||
                          node.component === 'MovingAverage';

  const isTradeExecutor = node.id?.toString().includes('trade-executor') || 
                          node.title?.toLowerCase().includes('trade executor') ||
                          node.component === 'TradeExecutor';

  const isMathNode = node.id?.toString().includes('math-node') || 
                     node.title?.toLowerCase().includes('math operation') ||
                     node.component === 'MathNode';

  const isRSIIndicator = node.id?.toString().includes('rsi-indicator') || 
                         node.title?.toLowerCase().includes('rsi indicator') ||
                         node.component === 'RSIIndicator';

  const isBollingerBands = node.id?.toString().includes('bollinger-bands') || 
                           node.title?.toLowerCase().includes('bollinger bands') ||
                           node.component === 'BollingerBands';

  const isStopLoss = node.id?.toString().includes('stop-loss') || 
                     node.title?.toLowerCase().includes('stop loss') ||
                     node.component === 'StopLoss';

  const isLimitOrder = node.id?.toString().includes('limit-order') || 
                        node.title?.toLowerCase().includes('limit order') ||
                        node.component === 'LimitOrder';

  const isArbitrageLogic = node.id?.toString().includes('arbitrage-comparison') || 
                           node.title?.toLowerCase().includes('arb logic') ||
                           node.component === 'ArbitrageLogic';

  const isSmartOrderRouter = node.id?.toString().includes('smart-order-router') || 
                             node.title?.toLowerCase().includes('smart order router') ||
                             node.component === 'SmartOrderRouter';

  const isSocialSentiment = node.id?.toString().includes('social-sentiment') || 
                            node.title?.toLowerCase().includes('social sentiment') ||
                            node.component === 'SocialSentiment';

  const isAISignalEngine = node.id?.toString().includes('ai-signal-engine') || 
                           node.title?.toLowerCase().includes('ai signal') ||
                           node.component === 'AISignalEngine';

  const isBinaryRiskGate = node.id?.toString().includes('binary-risk-gate') || 
                           node.title?.toLowerCase().includes('binary risk') ||
                           node.component === 'BinaryRiskGate';

  const nodeConnections = (connections || []).filter(conn =>
    conn.sourceId === node.id || conn.targetId === node.id
  );
  
  const isConnected = nodeConnections.length > 0;
  
  const inputConnections = (connections || []).filter(conn => conn.targetId === node.id);
  const outputConnections = (connections || []).filter(conn => conn.sourceId === node.id);
  
  const inputCount = inputConnections.length;
  const outputCount = outputConnections.length;

  // Memoized callback for UniswapRouter price updates
  const handlePriceUpdate = useCallback((nodeId: string, priceOutput: any) => {
    dispatch(setNodeOutput({
      nodeId: nodeId,
      value: priceOutput.value,
      type: priceOutput.type,
      raw: priceOutput.raw
    }));
  }, [dispatch]);

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, nodeId: string | number) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(nodeId.toString(), e);
    }
  };

  // Render ClockTimer for clock/schedule nodes
  if (isClockTimer) {
    const handleClockTick = (timeValue: any) => {
      clockTickData[node.id] = timeValue;
    };
    
    return (
      <SystemClock
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'system'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id: string, e: any) => onDragStart(id.toString(), e)}
        onDelete={(id: string) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id: string, type: string, e: any) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id: string, type: string, e: any) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        onTick={handleClockTick}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  if (isLiveOrderBook) {
    return (
      <LiveOrderBookDraggableBox
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  if (isDataView) {
    let dataForView = null;
    if (isConnected) {
      const incomingConnection = connections.find(conn => conn.targetId === node.id);
      if (incomingConnection) {
        dataForView = {
          source: 'Connected Source',
          timestamp: new Date().toISOString(),
          status: 'Connected',
          message: 'Receiving data from connected source',
          data: {
            marketPair: 'SOL/USDC',
            bids: [
              { price: 100.50, size: 500 },
              { price: 100.45, size: 300 },
              { price: 100.40, size: 200 }
            ],
            asks: [
              { price: 100.55, size: 400 },
              { price: 100.60, size: 600 },
              { price: 100.65, size: 300 }
            ],
            lastUpdate: new Date().toISOString(),
            sourceNode: incomingConnection.sourceId
          }
        };
      }
    }
    
    return (
      <DataView
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'data'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        data={dataForView}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }
  
  // Render Bang node
  if (isBang) {
    const handleBang = (bangId: string, isOn: boolean) => {
      if (isOn) {
        const outgoingConnections = connections.filter(
          conn => conn.sourceId === bangId && conn.targetPort === 'input'
        );
        
        outgoingConnections.forEach(conn => {
          const connectedNodeId = conn.targetId;
          const connectedNodeLabel = draggableNodeLabels[connectedNodeId];
          
          dispatch(triggerBang({
            targetLogId: connectedNodeId.toString(),
            sourceNodeId: bangId,
            label: connectedNodeLabel || connectedNodeId.toString()
          }));
          
          const secondLevelConnections = connections.filter(
            c => c.sourceId === connectedNodeId && c.targetPort === 'input'
          );
          
          secondLevelConnections.forEach(logConn => {
            dispatch(triggerBang({
              targetLogId: logConn.targetId.toString(),
              sourceNodeId: connectedNodeId.toString(),
              label: connectedNodeLabel || connectedNodeId.toString()
            }));
          });
        });
      }
    };
    
    return (
      <Bang
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'default'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        onBang={handleBang}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }
  
  // Render Log node
  if (isLog) {
    const incomingConnection = connections.find(conn => conn.targetId === node.id && conn.targetPort === 'input');
    let logInputData = null;
    
    if (incomingConnection) {
      const sourceOutput = nodeOutputs[incomingConnection.sourceId.toString()];
      if (sourceOutput) {
        logInputData = sourceOutput.value;
      }
    }
    
    if (!logInputData) {
      const triggerData = bangTriggers[node.id.toString()];
      logInputData = triggerData ? triggerData.label : null;
    }
    
    return (
      <Log
        key={node.id}
        id={node.id.toString()}
        label={node.label || 'Log'}
        type={node.type || 'default'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        inputData={logInputData}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render UniswapRouter node
  if (isUniswapRouter) {
    const triggerData = bangTriggers[node.id.toString()];
    
    return (
      <UniswapRouter
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        inputData={triggerData}
        bangTriggerCount={bangTriggerCount}
        onPriceUpdate={handlePriceUpdate}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render GasNode node
  if (isGasNode) {
    const triggerData = bangTriggers[node.id.toString()];
    
    return (
      <GasNode
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        inputData={triggerData}
        bangTriggerCount={bangTriggerCount}
        onPriceUpdate={handlePriceUpdate}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render Conditionals node
  if (isConditionals) {
    return (
      <Conditionals
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render LogicGateAnd node
  if (isLogicGateAnd) {
    return (
      <LogicGateAnd
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render ConditionSwitch node
  if (isConditionSwitch) {
    return (
      <ConditionSwitch
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render SwitchRouter node
  if (isSwitchRouter) {
    return (
      <SwitchRouter
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render SafetyBrake node
  if (isSafetyBrake) {
    return (
      <SafetyBrake
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render SwitchCase node
  if (isSwitchCase) {
    return (
      <SwitchCase
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render MovingAverage node
  if (isMovingAverage) {
    return (
      <MovingAverage
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'indicator'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render TradeExecutor node
  if (isTradeExecutor) {
    return (
      <TradeExecutor
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'execution'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render MathNode node
  if (isMathNode) {
    return (
      <MathNode
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'processing'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render RSIIndicator node
  if (isRSIIndicator) {
    return (
      <RSIIndicator
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'indicator'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render BollingerBands node
  if (isBollingerBands) {
    return (
      <BollingerBands
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'indicator'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render StopLoss node
  if (isStopLoss) {
    return (
      <StopLoss
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'risk'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render LimitOrder node
  if (isLimitOrder) {
    return (
      <LimitOrder
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'execution'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render ArbitrageLogic node
  if (isArbitrageLogic) {
    return (
      <ArbitrageLogic
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'logic'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render SmartOrderRouter node
  if (isSmartOrderRouter) {
    return (
      <SmartOrderRouter
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'execution'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render SocialSentiment node
  if (isSocialSentiment) {
    return (
      <SocialSentiment
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'indicator'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render AISignalEngine node
  if (isAISignalEngine) {
    return (
      <AISignalEngine
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'indicator'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Render BinaryRiskGate node
  if (isBinaryRiskGate) {
    return (
      <BinaryRiskGate
        key={node.id}
        id={node.id.toString()}
        label={node.label || ''}
        type={node.type || 'risk'}
        isPaletteItem={false}
        isDragging={node.id === draggedNodeId}
        isNew={newNodeIds.has(node.id)}
        isDeleting={deletingNodeIds.has(node.id)}
        onDragStart={(id, e) => onDragStart(id.toString(), e)}
        onDelete={(id) => onDelete(id.toString())}
        nodeData={node}
        x={node.position?.x || 0}
        y={node.position?.y || 0}
        isFreeForm={true}
        onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
        onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
        isConnected={isConnected}
        isEditable={node.isEditable}
        onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
        onClick={(e: any) => handleNodeClick(e, node.id)}
        onContextMenu={onContextMenu}
        isSelected={isSelected}
        inputCount={inputCount}
        outputCount={outputCount}
      />
    );
  }

  // Default: render as DraggableNode
  return (
    <DraggableNode
      key={node.id}
      id={node.id.toString()}
      label={node.label || ''}
      type={node.type || 'default'}
      isPaletteItem={false}
      isDragging={node.id === draggedNodeId}
      isNew={newNodeIds.has(node.id)}
      isDeleting={deletingNodeIds.has(node.id)}
      onDragStart={(id, e) => onDragStart(id.toString(), e)}
      onDelete={(id) => onDelete(id.toString())}
      nodeData={node}
      x={node.position?.x || 0}
      y={node.position?.y || 0}
      isFreeForm={true}
      onConnectionStart={(id, type, e) => onConnectionStart(id.toString(), type, e)}
      onConnectionEnd={(id, type, e) => onConnectionEnd(id.toString(), type, e)}
      isConnected={isConnected}
      isEditable={node.isEditable}
      onLabelChange={(id, label) => onLabelChange(id.toString(), label)}
      onClick={(e: any) => handleNodeClick(e, node.id)}
      onContextMenu={onContextMenu}
      isSelected={isSelected}
      inputCount={inputCount}
      outputCount={outputCount}
    />
  );
};

export default NodeRenderer;
