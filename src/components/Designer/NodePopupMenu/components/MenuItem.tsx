import React from 'react';
import { ChevronRight } from 'lucide-react';

const MenuItem: React.FC<any> = ({ item, isHovered, isSelected, isNodeAdded, nodeStatus, onMouseEnter, onMouseLeave, onClick }) => {
  return (
    <div
      className={`flex items-center px-3 py-1.5 cursor-pointer transition-all gap-2 border-l-2 border-transparent font-mono text-[0.75rem] relative bg-[#000C1D] text-[#ABB2BF] border-b border-[#1a2840] ${isHovered ? 'bg-[#0a1525] border-l-[#C678DD] text-[#C678DD]' : ''} ${isSelected ? 'bg-[#000C1D] border-l-[#C678DD] text-[#C678DD] shadow-[inset_0_0_0_1px_#C678DD] font-bold' : ''} ${nodeStatus === 'coming-soon' ? 'opacity-70 cursor-not-allowed text-[#56B6C2]' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="text-[#ABB2BF] text-[0.75rem] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
      {isNodeAdded ? (
        <div className="bg-[#000C1D] text-[#98C379] text-[0.65rem] font-bold px-1 py-0.5 border border-[#98C379] flex items-center justify-center ml-auto shrink-0 uppercase tracking-[0.5px]">Added</div>
      ) : item.type === 'category' ? (
        <div className="text-[#56B6C2] ml-auto shrink-0">
          <ChevronRight size={14} />
        </div>
      ) : item.type === 'flow' ? (
        <div className="bg-[#000C1D] text-[#C678DD] text-[0.6rem] font-bold px-1 py-0.5 border border-[#C678DD] flex items-center justify-center ml-auto shrink-0 uppercase tracking-[0.5px]">Flow</div>
      ) : nodeStatus === 'coming-soon' ? (
        <div className="absolute top-0.5 right-0.5 bg-[#000C1D] text-[#56B6C2] text-[0.55rem] px-1 py-0.5 border border-[#56B6C2] font-bold uppercase tracking-[0.5px] z-[1]">Soon</div>
      ) : null}
    </div>
  );
};

export default MenuItem;
