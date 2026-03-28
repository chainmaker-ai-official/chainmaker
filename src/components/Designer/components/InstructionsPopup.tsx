import React, { useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InstructionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsPopup: React.FC<InstructionsPopupProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a1525] border border-[#56B6C2] p-8 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl font-mono relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#ABB2BF] hover:text-[#E06C75] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-[#61AFEF] text-2xl font-bold mb-6 border-b border-[#56B6C266] pb-2 flex items-center gap-3">
          <HelpCircle className="text-[#C678DD]" size={28} /> Node Designer Instructions
        </div>
        
        <div className="space-y-6 text-[#ABB2BF]">
          <section>
            <h3 className="text-[#D19A66] font-bold mb-2 uppercase text-sm tracking-widest">Adding Nodes</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-[#98C379]">Right-Click</span> anywhere on the workspace to open the Node Menu.</li>
              <li><span className="text-[#98C379]">Ctrl + Click</span> (or Cmd + Click) to open the menu at your cursor position.</li>
              <li>Use the <span className="text-[#61AFEF]">Search</span> bar in the menu to quickly find specific nodes.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#D19A66] font-bold mb-2 uppercase text-sm tracking-widest">Workspace Interaction</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-[#98C379]">Click</span> a node to select it.</li>
              <li><span className="text-[#98C379]">Drag</span> nodes to rearrange them.</li>
              <li><span className="text-[#98C379]">Shift + Click</span> to select multiple nodes.</li>
              <li><span className="text-[#98C379]">Delete Key</span> to remove selected nodes (requires confirmation).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#D19A66] font-bold mb-2 uppercase text-sm tracking-widest">Connections</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click a <span className="text-[#E06C75]">Port</span> (circle) on a node and drag to another port to create a connection.</li>
              <li>Connections represent data flow between nodes.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#D19A66] font-bold mb-2 uppercase text-sm tracking-widest">Toolbar</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-[#61AFEF]">File:</span> Create new workspaces or save current progress.</li>
              <li><span className="text-[#61AFEF]">Edit:</span> Delete selected items or deselect all.</li>
              <li><span className="text-[#61AFEF]">Put:</span> Quickly add core objects like Bangs or Logs.</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-[#56B6C233] flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-[#56B6C2] text-[#0a1525] font-bold hover:bg-[#61AFEF] transition-all uppercase tracking-widest text-sm"
          >
            Got it! [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPopup;
