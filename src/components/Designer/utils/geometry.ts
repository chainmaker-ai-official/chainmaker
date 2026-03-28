export const createBezierCurve = (startX: number, startY: number, endX: number, endY: number, style = 'smooth') => {
  const dx = endX - startX;
  const dy = endY - startY;
  
  let cp1x, cp1y, cp2x, cp2y;
  
  switch(style) {
    case 'smooth':
      const controlDistance = dx * 0.5;
      cp1x = startX + controlDistance;
      cp1y = startY;
      cp2x = endX - controlDistance;
      cp2y = endY;
      break;
      
    case 'sharp':
      const bendX = startX + dx * 0.5;
      cp1x = bendX;
      cp1y = startY;
      cp2x = bendX;
      cp2y = endY;
      break;
      
    case 'straight':
      return `M ${startX} ${startY} L ${endX} ${endY}`;
      
    default:
      cp1x = startX + dx * 0.3;
      cp1y = startY;
      cp2x = endX - dx * 0.3;
      cp2y = endY;
  }
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};
