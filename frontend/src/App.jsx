import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveMenu, selectActiveMenu } from './redux/slices/uiSlice';
import Logo from './components/Logo';
// import DraggableBox1 from './components/Designer/Blocks/DraggableBox1';
// import DraggableBox2 from './components/Designer/Blocks/DraggableBox2';
import Chat from './components/Chat/Chat';
import Dashboard from './components/Dashboard/Dashboard'; // Import the new Dashboard component
import Designer from './components/Designer/Designer'; // Import the new Designer component
import TabPanel from './components/TabPanel/TabPanel'; // Import the new unified TabPanel component

function App() {
  const dispatch = useDispatch();
  const activeMenu = useSelector(selectActiveMenu); // Get active menu from Redux
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State to manage sidebar collapse
  const [boxes, setBoxes] = useState({
    box1: { x: 0, y: 0 },
    box2: { x: 0, y: 0 }
  });
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [line, setLine] = useState(null);
  const [tempLine, setTempLine] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [designerData, setDesignerData] = useState(null);
  const collapseTimerRef = useRef(null);

  const handleMenuClick = (menuItem) => {
    dispatch(setActiveMenu(menuItem));
  };

  const handleSidebarMouseEnter = () => {
    setSidebarHovered(true);
    // Clear any existing collapse timer
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    // Auto-expand sidebar when mouse enters
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    setSidebarHovered(false);
    // Set timer to collapse sidebar after 1 second
    collapseTimerRef.current = setTimeout(() => {
      if (!isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    }, 1000);
  };

  const svgRef = useRef(null);
  const rafPendingRef = useRef(false);

  // Position boxes on mount and resize
  const positionBoxes = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const boxW = 187.5;
    const boxH = 112.5;

    // Position boxes 25% further left by using 25% of viewport width as offset
    const leftOffset = vw * 0.25;

    const tx1 = leftOffset - boxW - 50;
    const ty1 = vh / 2 - boxH / 2;

    const tx2 = leftOffset + 50;
    const ty2 = vh / 2 - boxH / 2;

    setBoxes({
      box1: { x: tx1, y: ty1 },
      box2: { x: tx2, y: ty2 }
    });
  };

  // Update permanent line
  const updatePermanentLine = () => {
    if (!line || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();

    const p1 = document.querySelector('#box1 .connection-point.right');
    const p2 = document.querySelector('#box2 .connection-point.left');
    if (!p1 || !p2) return;

    const r1 = p1.getBoundingClientRect();
    const r2 = p2.getBoundingClientRect();

    line.setAttribute('x1', r1.left + r1.width / 2 - svgRect.left);
    line.setAttribute('y1', r1.top + r1.height / 2 - svgRect.top);
    line.setAttribute('x2', r2.left + r2.width / 2 - svgRect.left);
    line.setAttribute('y2', r2.top + r2.height / 2 - svgRect.top);
  };

  // Throttled line update
  const scheduleLineUpdate = () => {
    if (!rafPendingRef.current) {
      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;
        updatePermanentLine();
      });
    }
  };

  // Connection point mouse down handler
  const handleConnectionPointMouseDown = (e) => {
    e.stopPropagation();
    if (line) return; // Prevent drawing a new line if one already exists

    setIsDrawingLine(true);
    setStartPoint(e.currentTarget);
    const pt = e.currentTarget.getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect();

    if (!svgRect) return;

    const startX = pt.left + pt.width / 2 - svgRect.left;
    const startY = pt.top + pt.height / 2 - svgRect.top;

    const newTempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newTempLine.setAttribute('x1', startX);
    newTempLine.setAttribute('y1', startY);
    newTempLine.setAttribute('x2', startX);
    newTempLine.setAttribute('y2', startY);
    newTempLine.setAttribute('stroke', '#6366f1');
    newTempLine.setAttribute('stroke-width', '2');
    newTempLine.setAttribute('stroke-dasharray', '5,5');

    svgRef.current?.appendChild(newTempLine);
    setTempLine(newTempLine);
  };

  // Connection point mouse up handler
  const handleConnectionPointMouseUp = (e) => {
    if (isDrawingLine && startPoint && startPoint !== e.currentTarget) {
      createPermanentLine();
      updatePermanentLine();

      if (tempLine) {
        svgRef.current?.removeChild(tempLine);
        setTempLine(null);
      }
      setIsDrawingLine(false);
      setStartPoint(null);
    }
  };

  // Create permanent line
  const createPermanentLine = () => {
    if (line) return;
    const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute('stroke', '#6366f1');
    newLine.setAttribute('stroke-width', '2');
    svgRef.current?.appendChild(newLine);
    setLine(newLine);
  };

  // Initialize on mount
  useEffect(() => {
    positionBoxes();
    window.addEventListener('resize', positionBoxes);

    // Auto-hide chat on mobile
    if (window.innerWidth < 768) {
      setIsChatOpen(false);
    }

    return () => {
      window.removeEventListener('resize', positionBoxes);
      // Clean up timer on unmount
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  // Update line when boxes change
  useEffect(() => {
    if (line) {
      scheduleLineUpdate();
    }
  }, [boxes]);

  return (
    <div className="min-h-screen flex">
      {/* TODO: Replace with proper navigation sidebar component */}
      {/* Current Sidebar.jsx is actually a tab panel, not a navigation sidebar */}
      {/* <Sidebar 
        activeMenu={activeMenu} 
        handleMenuClick={handleMenuClick}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      /> */}

      {/* Container for main content, adjusted to remove padding and margin for Designer view */}
      <div className={`transition-all duration-300 flex-1 ${activeMenu === 'classes' ? 'p-0' : 'p-6'}`}>
        {activeMenu === 'classes' && <Dashboard />}
        {activeMenu === 'designer' && <Designer designerData={designerData} />}
        {activeMenu === 'home' && (
          <>
            {/* Header with Logo */}
            <header className="fixed top-6 left-6 z-50">
              <Logo />
            </header>

            {/* Draggable Boxes */}
            {/* TODO: Uncomment when DraggableBox components are available */}
            {/* <DraggableBox1
              key="box1"
              position={boxes.box1}
              onConnectionPointMouseDown={handleConnectionPointMouseDown}
              onConnectionPointMouseUp={handleConnectionPointMouseUp}
            />
            <DraggableBox2
              key="box2"
              position={boxes.box2}
              onConnectionPointMouseDown={handleConnectionPointMouseDown}
              onConnectionPointMouseUp={handleConnectionPointMouseUp}
            /> */}

            {/* SVG Connection Lines */}
            <svg
              ref={svgRef}
              id="connection-lines"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />
          </>
        )}
      </div>

      {/* Chat Component is now integrated into Designer component */}
    </div>
  );
}

export default App;
