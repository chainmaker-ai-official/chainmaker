import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActivity } from '../../contexts/ActivityContext';
import { updateTableData } from '../../../redux/slices/tableSlice';
import './GeneralTable.css';

function GeneralTable({ tableData = {}, blockId = 'general-table-001', textSize = 16 }) {
  const dispatch = useDispatch();
  const { getActivityState, updateActivityState } = useActivity();
  const activityId = blockId;
  
  // State for revealed cells (used in reveal mode)
  const [revealedCells, setRevealedCells] = useState({});
  const [data, setData] = useState({
    title: 'General Table',
    mode: 'edit',
    columns: [],
    rows: []
  });

  // Load saved state and initialize data
  useEffect(() => {
    const savedState = getActivityState(activityId);
    
    // Initialize data from props
    let dataToUse;
    if (tableData && typeof tableData === 'object') {
      dataToUse = {
        title: tableData.title || 'General Table',
        mode: tableData.mode || 'edit',
        columns: Array.isArray(tableData.columns) ? tableData.columns : [],
        rows: Array.isArray(tableData.rows) ? tableData.rows : []
      };
    } else {
      // Default data if props are not properly structured
      dataToUse = {
        title: 'General Table',
        mode: 'edit',
        columns: [
          { id: 'col1', label: 'Column A' },
          { id: 'col2', label: 'Column B' },
          { id: 'col3', label: 'Column C' }
        ],
        rows: [
          { id: 'row1', col1: 'Row 1, Col A', col2: 'Row 1, Col B', col3: 'Row 1, Col C' },
          { id: 'row2', col1: 'Row 2, Col A', col2: 'Row 2, Col B', col3: 'Row 2, Col C' },
          { id: 'row3', col1: 'Row 3, Col A', col2: 'Row 3, Col B', col3: 'Row 3, Col C' }
        ]
      };
    }
    
    setData(dataToUse);
    
    // Load revealed cells from saved state (for reveal mode)
    if (savedState && savedState.revealedCells) {
      setRevealedCells(savedState.revealedCells);
    }
    
    // Only update lastAccessed if it's not recent
    const currentTime = new Date().toISOString();
    const lastAccessed = savedState?.lastAccessed;
    const timeDiff = lastAccessed ? new Date(currentTime) - new Date(lastAccessed) : Infinity;
    
    if (timeDiff > 60000) { // Update if more than 1 minute has passed
      updateActivityState(activityId, {
        ...savedState,
        lastAccessed: currentTime,
        revealedCells: savedState?.revealedCells || {}
      });
    }
  }, [getActivityState, updateActivityState, activityId, tableData]);

  // Handle cell click to reveal content (for reveal mode)
  const handleCellClick = useCallback((rowId, columnId) => {
    if (data.mode !== 'reveal') return;
    
    const cellKey = `${rowId}-${columnId}`;
    
    setRevealedCells(prev => {
      const newRevealedCells = {
        ...prev,
        [cellKey]: true
      };
      
      // Save to activity context
      updateActivityState(activityId, {
        revealedCells: newRevealedCells
      });
      
      return newRevealedCells;
    });
  }, [updateActivityState, activityId, data.mode]);

  // Check if a cell is revealed (for reveal mode)
  const isCellRevealed = useCallback((rowId, columnId) => {
    const cellKey = `${rowId}-${columnId}`;
    return revealedCells[cellKey] || false;
  }, [revealedCells]);

  // Reset all revealed cells (for reveal mode)
  const handleReset = useCallback(() => {
    setRevealedCells({});
    updateActivityState(activityId, {
      revealedCells: {}
    });
  }, [updateActivityState, activityId]);

  // Handle cell value change (for edit mode)
  const handleCellChange = useCallback((rowId, columnId, value) => {
    if (data.mode !== 'edit') return;
    
    setData(prev => {
      const updatedData = {
        ...prev,
        rows: prev.rows.map(row => 
          row.id === rowId ? { ...row, [columnId]: value } : row
        )
      };
      
      // Save to Redux if blockId is provided
      if (blockId && blockId !== 'general-table-001') {
        dispatch(updateTableData({ blockId, data: updatedData }));
      }
      
      return updatedData;
    });
  }, [data.mode, blockId, dispatch]);

  // Render table header
  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          <th className="order-header" style={{ fontSize: `${textSize}px` }}>#</th>
          {data.columns.map(column => (
            <th key={column.id} className="column-header" style={{ fontSize: `${textSize}px` }}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Render table body based on mode
  const renderTableBody = () => {
    if (data.mode === 'edit') {
      // Edit mode: render editable cells
      return (
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={row.id} className="table-row">
              <td className="order-cell" style={{ fontSize: `${textSize}px` }}>{rowIndex + 1}</td>
              {data.columns.map(column => (
                <td key={`${row.id}-${column.id}`} className="table-cell edit-cell" style={{ fontSize: `${textSize}px` }}>
                  <input
                    type="text"
                    value={row[column.id] || ''}
                    onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
                    className="cell-input"
                    placeholder="Enter value"
                    style={{ fontSize: `${textSize}px` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    } else if (data.mode === 'reveal') {
      // Reveal mode: render click-to-reveal cells
      return (
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={row.id} className="table-row">
              <td className="order-cell" style={{ fontSize: `${textSize}px` }}>{rowIndex + 1}</td>
              {data.columns.map(column => (
                <td 
                  key={`${row.id}-${column.id}`}
                  className={`table-cell ${isCellRevealed(row.id, column.id) ? 'revealed' : 'hidden'}`}
                  onClick={() => handleCellClick(row.id, column.id)}
                  style={{ fontSize: `${textSize}px` }}
                >
                  {isCellRevealed(row.id, column.id) 
                    ? (row[column.id] || '') 
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    } else {
      // View mode: all cells revealed upon load (no click needed)
      return (
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={row.id} className="table-row">
              <td className="order-cell" style={{ fontSize: `${textSize}px` }}>{rowIndex + 1}</td>
              {data.columns.map(column => (
                <td 
                  key={`${row.id}-${column.id}`}
                  className="table-cell revealed"
                  style={{ fontSize: `${textSize}px` }}
                >
                  {row[column.id] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }
  };

  // Show friendly message if no data is available
  if (!data.columns || data.columns.length === 0 || !data.rows || data.rows.length === 0) {
    return (
      <div className="general-table-container">
        <section className="activity-section">
          <div className="no-data-message">
            <h3>No Table Data Available</h3>
            <p>Please configure the table with columns and rows.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="general-table-container">
      <section className="activity-section">
        <div className="table-container">
          <h2 className="activity-title">{data.title}</h2>
          <div className="table-mode-indicator">
            Mode: <span className={`mode-badge ${data.mode}`}>
              {data.mode === 'edit' ? 'Edit Mode' : data.mode === 'reveal' ? 'Reveal Mode' : 'View Mode'}
            </span>
          </div>
          
          <div className="table-wrapper">
            <table className="general-table">
              {renderTableHeader()}
              {renderTableBody()}
            </table>
          </div>
          
          {data.mode === 'reveal' && (
            <div className="controls-container">
              <button 
                className="reset-button"
                onClick={handleReset}
              >
                Reset All
              </button>
              <div className="instructions">
                Click on cells to reveal their content
              </div>
            </div>
          )}
          
          {data.mode === 'edit' && (
            <div className="edit-instructions">
              <div className="instructions">
                Click on cells to edit their content
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default GeneralTable;