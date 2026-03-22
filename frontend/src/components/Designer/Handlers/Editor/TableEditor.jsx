import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateTableData } from '../../../../redux/slices/tableSlice';
import GeneralTable from '../../../../activity-components/activities/Table/GeneralTable';
import { ActivityProvider } from '../../../../activity-components/contexts/ActivityContext';
import './TableEditor.css';

const TableEditor = ({ blockId, initialData, onSave, onCancel }) => {
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState({
    title: 'General Table',
    mode: 'edit',
    columns: [],
    rows: []
  });
  const [isViewMode, setIsViewMode] = useState(false);
  const [textSize, setTextSize] = useState(16); // Default text size in pixels

  // Initialize with data
  useEffect(() => {
    if (initialData) {
      setTableData(initialData);
      // Load textSize from initialData if available, otherwise use default 16
      setTextSize(initialData.textSize || 16);
    }
  }, [initialData]);

  // Handle updating table title
  const handleTitleChange = (e) => {
    setTableData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  // Handle changing table mode
  const handleModeChange = (e) => {
    setTableData(prev => ({
      ...prev,
      mode: e.target.value
    }));
  };

  // Handle adding a new column
  const handleAddColumn = () => {
    const newColumnId = `col${Date.now()}`;
    const columnLetter = String.fromCharCode(65 + tableData.columns.length % 26);
    const columnNumber = Math.floor(tableData.columns.length / 26) + 1;
    const columnLabel = columnNumber > 1 ? `${columnLetter}${columnNumber}` : columnLetter;
    
    setTableData(prev => {
      const newColumns = [
        ...prev.columns,
        { id: newColumnId, label: columnLabel }
      ];
      
      // Add the new column to all existing rows
      const newRows = prev.rows.map(row => ({
        ...row,
        [newColumnId]: ''
      }));
      
      return {
        ...prev,
        columns: newColumns,
        rows: newRows
      };
    });
  };

  // Handle updating column label
  const handleUpdateColumnLabel = (columnId, newLabel) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, label: newLabel } : col
      )
    }));
  };

  // Handle removing a column
  const handleRemoveColumn = (columnId) => {
    setTableData(prev => {
      const newColumns = prev.columns.filter(col => col.id !== columnId);
      
      // Remove the column from all rows
      const newRows = prev.rows.map(row => {
        const { [columnId]: removed, ...rest } = row;
        return rest;
      });
      
      return {
        ...prev,
        columns: newColumns,
        rows: newRows
      };
    });
  };

  // Handle adding a new row
  const handleAddRow = () => {
    const newRowId = `row${Date.now()}`;
    const newRow = { id: newRowId };
    
    // Initialize all columns with empty values
    tableData.columns.forEach(col => {
      newRow[col.id] = '';
    });
    
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  // Handle updating a cell value
  const handleUpdateCell = (rowId, columnId, value) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId ? { ...row, [columnId]: value } : row
      )
    }));
  };

  // Handle removing a row
  const handleRemoveRow = (rowId) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId)
    }));
  };

  // Handle removing the last column
  const handleRemoveLastColumn = () => {
    if (tableData.columns.length <= 1) return;
    
    const lastColumnId = tableData.columns[tableData.columns.length - 1].id;
    handleRemoveColumn(lastColumnId);
  };

  // Handle removing the last row
  const handleRemoveLastRow = () => {
    if (tableData.rows.length <= 1) return;
    
    const lastRowId = tableData.rows[tableData.rows.length - 1].id;
    handleRemoveRow(lastRowId);
  };

  // Handle saving changes
  const handleSave = () => {
    // Create table data with textSize included
    const tableDataWithTextSize = {
      ...tableData,
      textSize: textSize
    };
    
    // Save to Redux
    if (blockId) {
      dispatch(updateTableData({ blockId, data: tableDataWithTextSize }));
    }
    
    // Call parent onSave callback
    if (onSave) {
      onSave(tableDataWithTextSize);
    }
  };

  // Handle test save to console
  const handleTestSave = () => {
    const tableDataWithTextSize = {
      ...tableData,
      textSize: textSize
    };
    // Test save functionality (console logs removed)
  };

  // Handle switching to view mode
  const handleViewMode = () => {
    // Auto-save before switching to view mode
    if (blockId) {
      const tableDataWithTextSize = {
        ...tableData,
        textSize: textSize
      };
      dispatch(updateTableData({ blockId, data: tableDataWithTextSize }));
    }
    setIsViewMode(true);
  };

  // Handle switching back to edit mode
  const handleBackToEdit = () => {
    setIsViewMode(false);
  };

  // Handle increasing text size
  const handleIncreaseTextSize = () => {
    setTextSize(prev => Math.min(prev + 2, 48)); // Max 48px
  };

  // Handle decreasing text size
  const handleDecreaseTextSize = () => {
    setTextSize(prev => Math.max(prev - 2, 8)); // Min 8px
  };

  return (
    <div className="table-editor-modal">
      <div className="modal-overlay" onClick={onCancel}></div>
      
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isViewMode ? 'Table Preview' : 'Table Editor'}</h2>
          <div className="header-buttons">
            {isViewMode ? (
              <button 
                className="view-btn back-to-edit-btn"
                onClick={handleBackToEdit}
                title="Back to edit mode"
              >
                ← Back to Edit
              </button>
            ) : (
              <button 
                className="view-btn"
                onClick={handleViewMode}
                title="Preview table"
                disabled={tableData.rows.length === 0}
              >
                👁️ View
              </button>
            )}
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="test-btn" onClick={handleTestSave}>
              Test Save to Console
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button className="close-btn" onClick={onCancel}>&times;</button>
          </div>
        </div>

        {isViewMode ? (
          // View Mode: Show Table component wrapped in ActivityProvider
          <div className="view-mode-container">
            <ActivityProvider>
              <GeneralTable 
                tableData={tableData} 
                blockId={blockId}
                textSize={textSize} // Pass text size to GeneralTable
              />
            </ActivityProvider>
          </div>
        ) : (
          // Edit Mode: Show editor panels
          <>
            <div className="editor-container">
              {/* Left Panel: Table Configuration */}
              <div className="config-panel">
                <h3>Table Configuration</h3>
                
                <div className="title-section">
                  <label htmlFor="table-title">Table Title</label>
                  <input
                    id="table-title"
                    type="text"
                    value={tableData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter table title"
                    className="title-input"
                  />
                </div>

                <div className="mode-section">
                  <label htmlFor="table-mode">Table Mode</label>
                  <select
                    id="table-mode"
                    value={tableData.mode}
                    onChange={handleModeChange}
                    className="mode-select"
                  >
                    <option value="edit">Edit Mode (Direct Editing)</option>
                    <option value="reveal">Reveal Mode (Click to Reveal)</option>
                    <option value="view">View Mode (All Revealed)</option>
                  </select>
                  <div className="mode-description">
                    {tableData.mode === 'edit' 
                      ? 'Users can edit cells directly' 
                      : tableData.mode === 'reveal'
                      ? 'Users click cells to reveal content'
                      : 'All cells are revealed upon load'}
                  </div>
                </div>

                <div className="management-section">
                  <h4>Table Size</h4>
                  <div className="size-controls">
                    <div className="size-control-group">
                      <div className="size-control-item">
                        <div className="size-label">Columns</div>
                        <div className="numeric-control-group">
                          <button 
                            className="numeric-btn decrement"
                            onClick={() => handleRemoveLastColumn()}
                            disabled={tableData.columns.length <= 1}
                            title="Remove last column"
                          >
                            -
                          </button>
                          <div className="numeric-display">
                            {tableData.columns.length}
                          </div>
                          <button 
                            className="numeric-btn increment"
                            onClick={handleAddColumn}
                            title="Add column"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="size-control-item">
                        <div className="size-label">Rows</div>
                        <div className="numeric-control-group">
                          <button 
                            className="numeric-btn decrement"
                            onClick={() => handleRemoveLastRow()}
                            disabled={tableData.rows.length <= 1}
                            title="Remove last row"
                          >
                            -
                          </button>
                          <div className="numeric-display">
                            {tableData.rows.length}
                          </div>
                          <button 
                            className="numeric-btn increment"
                            onClick={handleAddRow}
                            title="Add row"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Size Controls */}
                <div className="text-size-controls">
                  <label className="text-size-label">Text Size (View Mode)</label>
                  <div className="text-size-control-group">
                    <button 
                      className="text-size-btn decrease"
                      onClick={handleDecreaseTextSize}
                      disabled={textSize <= 8}
                      title="Decrease text size"
                    >
                      -
                    </button>
                    <div className="text-size-display">
                      {textSize}px
                    </div>
                    <button 
                      className="text-size-btn increase"
                      onClick={handleIncreaseTextSize}
                      disabled={textSize >= 48}
                      title="Increase text size"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="instructions">
                  <h4>Instructions:</h4>
                  <ul>
                    <li>Click on column headers to rename them</li>
                    <li>Click on cells to edit content</li>
                    <li>Use × buttons to delete columns or rows</li>
                    <li>Choose "Reveal Mode" for vocabulary/learning activities</li>
                  </ul>
                </div>
              </div>

              {/* Middle Panel: Table Editor */}
              <div className="table-editor-panel">
                <h3>
                  Table Editor
                  {tableData.columns.length > 0 && (
                    <span className="table-size-badge">
                      {tableData.columns.length} × {tableData.rows.length}
                    </span>
                  )}
                </h3>

                {tableData.columns.length === 0 ? (
                  <div className="no-columns">
                    <div className="no-columns-icon">📊</div>
                    <div className="no-columns-text">
                      No columns yet. Click "Add Column" to start.
                    </div>
                  </div>
                ) : (
                  <div className="table-editor">
                    {/* Column Headers */}
                    <div className="table-header">
                      <div className="header-cell corner-cell">#</div>
                      {tableData.columns.map((column, colIndex) => (
                        <div key={column.id} className="header-cell">
                          <div className="column-header-content">
                            <input
                              type="text"
                              value={column.label}
                              onChange={(e) => handleUpdateColumnLabel(column.id, e.target.value)}
                              className="column-label-input"
                            />
                            <button
                              className="remove-column-btn"
                              onClick={() => handleRemoveColumn(column.id)}
                              title="Delete column"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Table Rows */}
                    <div className="table-body">
                      {tableData.rows.length === 0 ? (
                        <div className="no-rows">
                          <div className="no-rows-icon">📝</div>
                          <div className="no-rows-text">No rows yet. Click "Add Row" to start.</div>
                        </div>
                      ) : (
                        tableData.rows.map((row, rowIndex) => (
                          <div key={row.id} className="table-row">
                            <div className="row-header-cell">
                              <span className="row-number">{rowIndex + 1}</span>
                              <button
                                className="remove-row-btn"
                                onClick={() => handleRemoveRow(row.id)}
                                title="Delete row"
                              >
                                &times;
                              </button>
                            </div>
                            {tableData.columns.map(column => (
                              <div key={`${row.id}-${column.id}`} className="table-cell">
                                <input
                                  type="text"
                                  value={row[column.id] || ''}
                                  onChange={(e) => handleUpdateCell(row.id, column.id, e.target.value)}
                                  placeholder="Enter value"
                                  className="cell-input"
                                />
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Removed preview panel as requested */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableEditor;