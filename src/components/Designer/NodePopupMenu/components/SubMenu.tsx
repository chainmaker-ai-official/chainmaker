import React from 'react';
import MenuItem from './MenuItem';

const SubMenu: React.FC<any> = ({ subMenuData, activeMenuId, getNodeByMenuItemId, isNodeAdded, onSubItemClick, onMouseEnter, onMouseLeave, onItemHover, side = 'right' }) => {
  if (!subMenuData || !activeMenuId) return null;

  const sideStyle = side === 'right' 
    ? "left-full border-l" 
    : "right-full border-r";

  return (
    <div 
      className={`absolute ${sideStyle} top-0 bottom-0 w-[200px] bg-[#000C1D] border-[#56B6C2] flex flex-col shadow-[4px_0_8px_rgba(0,0,0,0.5)] z-10 border`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="px-3 py-2 border-b border-[#56B6C2] bg-[#0a1525]">
        <div className="text-[#61AFEF] text-[0.75rem] font-bold uppercase tracking-[0.5px] font-mono">{subMenuData.title}</div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[300px] bg-[#000C1D]">
        {subMenuData.items.map((subItem: any) => {
          const node = getNodeByMenuItemId(subItem.id);
          return (
            <MenuItem
              key={subItem.id}
              item={subItem}
              isHovered={false}
              isSelected={false}
              isNodeAdded={isNodeAdded(subItem.id)}
              nodeStatus={node?.status}
              onMouseEnter={() => onItemHover?.(subItem)}
              onMouseLeave={() => onItemHover?.(null)}
              onClick={(e: any) => onSubItemClick(subItem.id, e)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SubMenu;
