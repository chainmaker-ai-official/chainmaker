import React from 'react';
import './Dashboard.css';
import TabPanel from '../TabPanel/TabPanel';
import Designer from '../Designer/Designer';
import Marketplace from '../Marketplace/Marketplace';

const Dashboard = () => {
  // Data for the dashboard based on god tier crypto trading bot
  const featuredProject = {
    title: 'Dex Arbitrage Bot',
    subtitle: 'Resume your trading session',
    metadata1: 'AI-Powered Market Analysis',
    metadata2: '24/7 Operation, 99.9% Uptime'
  };

  const recentActivities = [
    { 
      id: 1, 
      title: 'Dex Arbitrage Bot', 
      path: 'Trading > Arbitrage > Cross-Exchange',
      time: 'Last Trade: 2 minutes ago'
    },
    { 
      id: 2, 
      title: 'AI Market Predictor', 
      path: 'Analysis > Machine Learning > Price Forecasting',
      time: 'Last Analysis: 15 minutes ago'
    },
    { 
      id: 3, 
      title: 'Risk Management Module', 
      path: 'Security > Portfolio > Hedging Strategies',
      time: 'Last Update: 1 hour ago'
    },
    { 
      id: 4, 
      title: 'Liquidity Scanner', 
      path: 'Monitoring > Exchanges > Order Book Analysis',
      time: 'Last Scan: 2 hours ago'
    }
  ];

  const latestNews = [
    { 
      id: 1, 
      title: 'Bitcoin Hits New All-Time High', 
      excerpt: 'BTC surpasses $150,000 as institutional adoption accelerates globally.',
      date: 'Feb 10, 2026'
    },
    { 
      id: 2, 
      title: 'AI Trading Bot Breaks Profit Records', 
      excerpt: 'Dex Arbitrage Bot achieves 47.3% monthly ROI with zero human intervention.',
      date: 'Feb 9, 2026'
    },
    { 
      id: 3, 
      title: 'New DeFi Integration Launched', 
      excerpt: 'Cross-chain liquidity aggregation now supports 15+ major decentralized exchanges.',
      date: 'Feb 8, 2026'
    }
  ];

  const tradingModules = [
    { 
      id: 1, 
      name: 'Arbitrage Scanner', 
      description: 'Real-time cross-exchange price discrepancy detection',
      color: '#00ff88'
    },
    { 
      id: 2, 
      name: 'Market Sentiment AI', 
      description: 'Natural language processing of crypto news and social media',
      color: '#4361ee'
    },
    { 
      id: 3, 
      name: 'Portfolio Optimizer', 
      description: 'AI-driven asset allocation and risk management',
      color: '#ff6b6b'
    }
  ];

  // Additional trading bot data for enhanced focus
  const marketEvents = [
    {
      id: 1,
      title: 'Bitcoin Halving Event',
      time: 'Today, 2:00 PM UTC',
      exchange: 'Global Markets',
      status: 'Upcoming'
    },
    {
      id: 2,
      title: 'Ethereum Protocol Upgrade',
      time: 'Today, 6:30 PM UTC',
      exchange: 'All DEXs',
      status: 'Upcoming'
    },
    {
      id: 3,
      title: 'Fed Interest Rate Decision',
      time: 'Tomorrow, 2:00 PM UTC',
      exchange: 'Traditional Markets',
      status: 'Scheduled'
    }
  ];

  const tradingTools = [
    {
      id: 1,
      name: 'Order Book Analyzer',
      category: 'Technical Analysis',
      type: 'Real-time'
    },
    {
      id: 2,
      name: 'Volatility Predictor',
      category: 'Risk Management',
      type: 'AI Model'
    },
    {
      id: 3,
      name: 'Gas Fee Optimizer',
      category: 'Blockchain',
      type: 'Automation'
    }
  ];

  // Configure panels for TabPanel with actual components
  const panels = [
    { id: 'panel-1', title: 'PROJECTS', content: 'This panel shows an overview of active projects.' },
    { id: 'panel-2', title: 'MARKETPLACE', content: <Marketplace /> },
    { id: 'panel-3', title: 'DESIGNER', content: <Designer /> }
  ];

  // Configure tabs for TabPanel
  const tabs = [
    { id: 'tab-dashboard', target: 'panel-dashboard', label: 'DASHBOARD', side: 'left', originalLeft: 0 },
    { id: 'tab-1', target: 'panel-1', label: 'PROJECTS AND TOOLS', side: 'right', originalRight: 60 },
    { id: 'tab-2', target: 'panel-2', label: 'MARKETPLACE', side: 'right', originalRight: 30 },
    { id: 'tab-3', target: 'panel-3', label: 'DESIGNER', side: 'right', originalRight: 0 }
  ];

  return (
    <div className="dashboard-container">
      <TabPanel 
        useRedux={true}
        tabs={tabs}
        panels={panels}
        showCloseButton={false}
        hideTabsWhenDesignerActive={true}
        simplePositioning={false}
        designerPanelId="panel-3"
      />
      <div className="dashboard-grid">
        {/* Section 1: Featured Project Card (Top Left) */}
        <div className="dashboard-section section-1">
          <div className="section-header">
            <h3>Featured Project</h3>
          </div>
          <div className="section-content">
            <div className="image-placeholder"></div>
            <div className="featured-project-content">
              <div>
                <div className="project-subtitle">{featuredProject.subtitle}</div>
                <h2 className="project-title">{featuredProject.title}</h2>
                <div className="project-metadata">
                  <span className="metadata-1">{featuredProject.metadata1}</span>
                  <span className="metadata-2">{featuredProject.metadata2}</span>
                </div>
              </div>
              <button className="resume-button">Start Trading Session</button>
            </div>
          </div>
        </div>

        {/* Section 2: Recent Activity & Trading Tools (Top Right) */}
        <div className="dashboard-section section-2">
          <div className="section-header with-link">
            <h3>Recent Activity</h3>
            <a href="#" className="see-all-link">See All →</a>
          </div>
          <div className="section-content">
            <div className="recent-activities">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-path">{activity.path}</div>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              ))}
            </div>
            
            {/* Trading Tools Section */}
            <div className="trading-tools-section">
              <h4 className="tools-title">Trading Tools</h4>
              <div className="tools-list">
                {tradingTools.map((tool) => (
                  <div key={tool.id} className="tool-item">
                    <div className="tool-info">
                      <div className="tool-name">{tool.name}</div>
                      <div className="tool-details">
                        <span className="tool-category">{tool.category}</span>
                        <span className="tool-type">{tool.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Latest News (Bottom Left) */}
        <div className="dashboard-section section-3">
          <div className="section-header with-link">
            <h3>Latest News</h3>
            <a href="#" className="see-all-link">See All →</a>
          </div>
          <div className="section-content">
            <div className="news-list">
              {latestNews.map((news) => (
                <div key={news.id} className="news-item">
                  <div className="news-image">News Image</div>
                  <div className="news-content">
                    <h4>{news.title}</h4>
                    <p>{news.excerpt}</p>
                    <span className="news-date">{news.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Trading Modules Grid (Bottom Right) */}
        <div className="dashboard-section section-4">
          <div className="section-header with-link">
            <h3>Trading Modules</h3>
            <button className="all-button">View All</button>
          </div>
          <div className="section-content">
            <div className="games-grid">
              {tradingModules.map((module) => (
                <div key={module.id} className="game-card">
                  <div 
                    className="game-image"
                    style={{ backgroundColor: module.color }}
                  >
                    Module Image
                  </div>
                  <div className="game-content">
                    <h4>{module.name}</h4>
                    <p>{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Market Events Section */}
            <div className="market-events-section">
              <h4 className="events-title">Market Events</h4>
              <div className="events-list">
                {marketEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-info">
                      <div className="event-title">{event.title}</div>
                      <div className="event-details">
                        <span className="event-time">{event.time}</span>
                        <span className="event-exchange">on {event.exchange}</span>
                      </div>
                    </div>
                    <div className={`event-status ${event.status.toLowerCase()}`}>
                      {event.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
