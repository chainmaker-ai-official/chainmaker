import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DraggableBlock from '../Objects/DraggableBlock';
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
import { triggerBang, selectBangTriggers, selectBangTriggerCount } from '../../../redux/slices/bangSlice';
import { setBlockOutput, selectBlockOutputs } from '../../../redux/slices/blockOutputsSlice';

// Store clock tick data globally so it can be shared between blocks
const clockTickData = {};

// Store the label of DraggableBlock so Bang can pass it to Log
const draggableBlockLabels = {};

/**
 * Component that renders blocks based on their type
 */
const BlockRenderer = ({ 
  block, 
  connections, 
  draggedBlockId, 
  newBlockIds, 
  deletingBlockIds,
  onDragStart,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  onLabelChange,
  onBlockClick,
  isSelected = false
}) => {
  // Redux dispatch and selectors for Bang triggers
  const dispatch = useDispatch();
  const bangTriggers = useSelector(selectBangTriggers);
  const bangTriggerCount = useSelector(selectBangTriggerCount);
  const blockOutputs = useSelector(selectBlockOutputs);
  
  // Block type detection
  const isClockTimer = block.id?.toString().includes('clock') || 
                       block.title?.toLowerCase().includes('clock') ||
                       block.title?.toLowerCase().includes('schedule') ||
                       block.component_uuid === "1179fc29-6be5-4bb8-af86-b36d741acc98";
  
  const isLiveOrderBook = block.id?.toString().includes('live-order-book') || 
                         block.title?.toLowerCase().includes('live order book') ||
                         block.component_uuid === "e4a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c";
  
  const isDataView = block.id?.toString().includes('data-view') || 
                    block.title?.toLowerCase().includes('data view') ||
                    block.title?.toLowerCase().includes('dataview') ||
                    (block.id && block.id.toString().startsWith('44-')) ||
                    block.component_uuid === "d5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a";
  
  const isBang = block.id?.toString().includes('bang') || 
                block.title?.toLowerCase().includes('bang') ||
                block.component === 'Bang';

  const isLog = block.id?.toString().includes('log') || 
                block.title?.toLowerCase() === 'log' ||
                block.component === 'Log';

  const isUniswapRouter = block.id?.toString().includes('uniswap-router') || 
                          block.title?.toLowerCase().includes('uniswap router') ||
                          block.component === 'UniswapRouter' ||
                          block.component_uuid === 'uniswap-router-uuid-2024';

  const isConditionals = block.id?.toString().includes('conditionals') || 
                         block.title?.toLowerCase().includes('conditionals') ||
                         block.component === 'Conditionals' ||
                         block.component_uuid === 'conditionals-uuid-2024';

  const isLogicGateAnd = block.id?.toString().includes('logic-gate-and') || 
                         block.title?.toLowerCase().includes('logic gate') ||
                         block.title?.toLowerCase().includes('and') ||
                         block.component === 'LogicGateAnd' ||
                         block.component_uuid === 'logic-gate-and-uuid-2024';

  const isConditionSwitch = block.id?.toString().includes('condition-switch') || 
                           block.title?.toLowerCase().includes('condition switch') ||
                           block.component === 'ConditionSwitch' ||
                           block.component_uuid === 'condition-switch-uuid-2024';

  const isSwitchRouter = block.id?.toString().includes('switch-router') || 
                        (block.title?.toLowerCase().includes('switch') && 
                         block.title?.toLowerCase().includes('router')) ||
                        block.component === 'SwitchRouter' ||
                        block.component_uuid === 'switch-router-uuid-2024';

  const isSafetyBrake = block.id?.toString().includes('safety-brake') || 
                        block.title?.toLowerCase().includes('safety brake') ||
                        block.title?.toLowerCase().includes('brake') ||
                        block.component === 'SafetyBrake' ||
                        block.component_uuid === 'safety-brake-uuid-2024';

  const isSwitchCase = block.id?.toString().includes('switch-case') || 
                       block.title?.toLowerCase().includes('switch case') ||
                       block.label?.toLowerCase().includes('switch case') ||
                       block.component === 'SwitchCase' ||
                       block.component_uuid === 'switch-case-uuid-2024' ||
                       (block.id && block.id.toString().startsWith('52-')) ||
                       block.id === 52 ||
                       (block.category?.toLowerCase().includes('logic') && (block.title?.toLowerCase().includes('switch') || block.label?.toLowerCase().includes('switch'))) ||
                       (block.blockData?.category?.toLowerCase().includes('logic') && (block.blockData?.title?.toLowerCase().includes('switch') || block.blockData?.label?.toLowerCase().includes('switch')));

  const isGasNode = block.id?.toString().includes('etherscan-gas-node') || 
                    block.title?.toLowerCase().includes('etherscan gas node') ||
                    block.component_uuid === '1a272582-e4d9-4552-bdd5-4bdae52e9376';

  const isConnected = connections.some(conn =>
    conn.sourceId === block.id || conn.targetId === block.id
  );

  // Memoized callback for UniswapRouter price updates
  const handlePriceUpdate = useCallback((blockId, priceOutput) => {
    dispatch(setBlockOutput({
      blockId: blockId,
      value: priceOutput.value,
      type: priceOutput.type,
      raw: priceOutput.raw
    }));
  }, [dispatch]);

  // Handle block click
  const handleBlockClick = (e, blockId) => {
    e.stopPropagation();
    if (onBlockClick) {
      onBlockClick(blockId, e);
    }
  };

  // Render ClockTimer for clock/schedule blocks
  if (isClockTimer) {
    const handleClockTick = (timeValue) => {
      clockTickData[block.id] = timeValue;
    };
    
    return (
      <SystemClock
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'system'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        onTick={handleClockTick}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  if (isLiveOrderBook) {
    return (
      <LiveOrderBookDraggableBox
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  if (isDataView) {
    let dataForView = null;
    if (isConnected) {
      const incomingConnection = connections.find(conn => conn.targetId === block.id);
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
            sourceBlock: incomingConnection.sourceId
          }
        };
      }
    }
    
    return (
      <DataView
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'data'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        data={dataForView}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }
  
  // Render Bang block
  if (isBang) {
    const handleBang = (bangId, isOn) => {
      if (isOn) {
        const outgoingConnections = connections.filter(
          conn => conn.sourceId === bangId && conn.targetPort === 'input'
        );
        
        outgoingConnections.forEach(conn => {
          const connectedBlockId = conn.targetId;
          const connectedBlockLabel = draggableBlockLabels[connectedBlockId];
          
          dispatch(triggerBang({
            targetLogId: connectedBlockId,
            sourceBlockId: bangId,
            label: connectedBlockLabel || connectedBlockId
          }));
          
          const secondLevelConnections = connections.filter(
            c => c.sourceId === connectedBlockId && c.targetPort === 'input'
          );
          
          secondLevelConnections.forEach(logConn => {
            dispatch(triggerBang({
              targetLogId: logConn.targetId,
              sourceBlockId: connectedBlockId,
              label: connectedBlockLabel || connectedBlockId
            }));
          });
        });
      }
    };
    
    return (
      <Bang
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'default'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        onBang={handleBang}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }
  
  // Render Log block
  if (isLog) {
    const incomingConnection = connections.find(conn => conn.targetId === block.id && conn.targetPort === 'input');
    let logInputData = null;
    
    if (incomingConnection) {
      const sourceOutput = blockOutputs[incomingConnection.sourceId];
      if (sourceOutput) {
        logInputData = sourceOutput.value;
      }
    }
    
    if (!logInputData) {
      const triggerData = bangTriggers[block.id];
      logInputData = triggerData ? triggerData.label : null;
    }
    
    return (
      <Log
        key={block.id}
        id={block.id}
        label={block.label || 'Log'}
        type={block.type || 'default'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        inputData={logInputData}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render UniswapRouter block
  if (isUniswapRouter) {
    const triggerData = bangTriggers[block.id];
    
    return (
      <UniswapRouter
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        inputData={triggerData}
        bangTriggerCount={bangTriggerCount}
        onPriceUpdate={handlePriceUpdate}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render GasNode block
  if (isGasNode) {
    const triggerData = bangTriggers[block.id];
    
    return (
      <GasNode
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'blockchain'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        inputData={triggerData}
        bangTriggerCount={bangTriggerCount}
        onPriceUpdate={handlePriceUpdate}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render Conditionals block
  if (isConditionals) {
    return (
      <Conditionals
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render LogicGateAnd block
  if (isLogicGateAnd) {
    return (
      <LogicGateAnd
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render ConditionSwitch block
  if (isConditionSwitch) {
    return (
      <ConditionSwitch
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render SwitchRouter block
  if (isSwitchRouter) {
    return (
      <SwitchRouter
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render SafetyBrake block
  if (isSafetyBrake) {
    return (
      <SafetyBrake
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Render SwitchCase block
  if (isSwitchCase) {
    return (
      <SwitchCase
        key={block.id}
        id={block.id}
        label={block.label}
        type={block.type || 'logic'}
        isPaletteItem={false}
        isDragging={block.id === draggedBlockId}
        isNew={newBlockIds.has(block.id)}
        isDeleting={deletingBlockIds.has(block.id)}
        onDragStart={onDragStart}
        onDelete={onDelete}
        blockData={block}
        x={block.position?.x}
        y={block.position?.y}
        isFreeForm={true}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isConnected={isConnected}
        isEditable={block.isEditable}
        onLabelChange={onLabelChange}
        onClick={(e) => handleBlockClick(e, block.id)}
        isSelected={isSelected}
      />
    );
  }

  // Default: render as DraggableBlock
  return (
    <DraggableBlock
      key={block.id}
      id={block.id}
      label={block.label}
      type={block.type || 'default'}
      isPaletteItem={false}
      isDragging={block.id === draggedBlockId}
      isNew={newBlockIds.has(block.id)}
      isDeleting={deletingBlockIds.has(block.id)}
      onDragStart={onDragStart}
      onDelete={onDelete}
      blockData={block}
      x={block.position?.x}
      y={block.position?.y}
      isFreeForm={true}
      onConnectionStart={onConnectionStart}
      onConnectionEnd={onConnectionEnd}
      isConnected={isConnected}
      isEditable={block.isEditable}
      onLabelChange={onLabelChange}
      onClick={(e) => handleBlockClick(e, block.id)}
      isSelected={isSelected}
    />
  );
};

export default BlockRenderer;