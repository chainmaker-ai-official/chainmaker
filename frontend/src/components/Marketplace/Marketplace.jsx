import React, { useState } from 'react';
import './Marketplace.css';
import { useDispatch, useSelector } from 'react-redux';
import { addActivity, selectIsActivityAdded } from '../../redux/slices/marketplaceSlice';
import activitiesData from '../../assets/activities.json';

const Marketplace = () => {
  const dispatch = useDispatch();
  const isActivityAdded = (activityId) => useSelector(selectIsActivityAdded(activityId));
  
  const handleAddActivity = (activity) => {
    dispatch(addActivity(activity));
  };

  // Educational Activities Marketplace Data
  const activityTypes = activitiesData.activities;

  // State for filtering
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter activities based on selected filters and search term
  const filteredActivities = activityTypes.filter(activity => {
    // Filter by category
    if (filter !== 'all' && activity.category !== filter && activity.subcategory !== filter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all' && activity.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(activityTypes.map(activity => activity.category))];

  return (
    <div className="marketplace">
      <header className="marketplace-header">
        <div className="header-info">
          <span className="live-indicator">● LIVE COLLECTION</span>
          <p className="subtitle">Exploration Hub: {activityTypes.length} Interactive Assets</p>
        </div>
        
        <div className="filters">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Any Status</option>
                <option value="available">Ready to Deploy</option>
                <option value="coming-soon">Under Construction</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="activities-grid">
        {filteredActivities.length === 0 ? (
          <div className="no-results">
            <p>No assets match your current search parameters.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className={`activity-card ${activity.status}`}>
              <div className="card-visual">
                <div className="asset-icon-container">
                  {activity.icon || '🧩'}
                </div>
                <div className="phase-ribbon">
                  {activity.phase ? `PHASE ${activity.phase}` : 'VERIFIED'}
                </div>
                {activity.status === 'coming-soon' && (
                  <div className="lock-overlay">
                    <span className="lock-icon">🔒</span>
                  </div>
                )}
              </div>

              <div className="card-content">
                <div className="card-metadata">
                  <span className="category-tag">{activity.category}</span>
                  <div className={`status-pulse ${activity.status}`}></div>
                </div>
                
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
                
                <div className="tag-cloud">
                  {(activity.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className="micro-tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="activity-actions">
                  <div className="price-display">
                    <span className="energy-icon">⚡</span>
                    <span className="price-text">FREE</span>
                  </div>
                  <div className="button-group">
                    <button className="btn-demo-minimal">Preview</button>
                    {activity.status === 'available' ? (
                      <button 
                        className={`btn-acquire ${isActivityAdded(activity.id) ? 'is-added' : ''}`}
                        onClick={() => handleAddActivity(activity)}
                        disabled={isActivityAdded(activity.id)}
                      >
                        {isActivityAdded(activity.id) ? 'In Library' : 'Acquire'}
                      </button>
                    ) : (
                      <button className="btn-notify-minimal">Waitlist</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="marketplace-footer">
        <p className="footer-stats">
          Displaying {filteredActivities.length} of {activityTypes.length} nodes
        </p>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot coming-soon"></span>
            <span>Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;