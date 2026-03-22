/**
 * Utility functions for geometry calculations and SVG path creation
 */

/**
 * Generates SVG path data (d attribute) for various line styles between two points
 */
export const createBezierCurve = (startX, startY, endX, endY, style = 'smooth') => {
  const dx = endX - startX;
  const dy = endY - startY;
  
  let cp1x, cp1y, cp2x, cp2y;
  
  switch(style) {
    case 'smooth':
      // Standard Cubic Bezier with horizontal control points for a flowing look
      const controlDistance = dx * 0.5;
      cp1x = startX + controlDistance;
      cp1y = startY;
      cp2x = endX - controlDistance;
      cp2y = endY;
      break;
      
    case 'sharp':
      // Orthogonal-style step curve using control points aligned with start/end
      const bendX = startX + dx * 0.5;
      cp1x = bendX;
      cp1y = startY;
      cp2x = bendX;
      cp2y = endY;
      break;
      
    case 'straight':
      // Simple linear path
      return `M ${startX} ${startY} L ${endX} ${endY}`;
      
    default:
      cp1x = startX + dx * 0.3;
      cp1y = startY;
      cp2x = endX - dx * 0.3;
      cp2y = endY;
  }
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Calculate midpoint between two points
 */
export const calculateMidpoint = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2
  };
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInRect = (pointX, pointY, rectX, rectY, rectWidth, rectHeight) => {
  return pointX >= rectX && 
         pointX <= rectX + rectWidth && 
         pointY >= rectY && 
         pointY <= rectY + rectHeight;
};

/**
 * Calculate intersection point between a line and a rectangle
 */
export const lineRectIntersection = (x1, y1, x2, y2, rectX, rectY, rectWidth, rectHeight) => {
  // Check each side of the rectangle
  const sides = [
    { x1: rectX, y1: rectY, x2: rectX + rectWidth, y2: rectY }, // top
    { x1: rectX + rectWidth, y1: rectY, x2: rectX + rectWidth, y2: rectY + rectHeight }, // right
    { x1: rectX, y1: rectY + rectHeight, x2: rectX + rectWidth, y2: rectY + rectHeight }, // bottom
    { x1: rectX, y1: rectY, x2: rectX, y2: rectY + rectHeight } // left
  ];

  for (const side of sides) {
    const intersection = lineLineIntersection(x1, y1, x2, y2, side.x1, side.y1, side.x2, side.y2);
    if (intersection) {
      return intersection;
    }
  }

  return null;
};

/**
 * Calculate intersection point between two lines
 */
export const lineLineIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (denominator === 0) {
    return null; // Lines are parallel
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
};