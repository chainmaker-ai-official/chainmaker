import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count: number;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel, count }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1525] border border-[#56B6C2] p-6 w-[400px] shadow-2xl font-mono">
        <div className="text-[#61AFEF] text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-[#E06C75]" size={20} /> Confirm Deletion
        </div>
        
        <div className="text-[#ABB2BF] mb-8 leading-relaxed">
          Are you sure you want to delete <span className="text-[#D19A66] font-bold">{count}</span> {count === 1 ? 'item' : 'items'}? 
          This action cannot be undone.
        </div>
        
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-[#1a2840] border border-[#56B6C266] text-[#ABB2BF] hover:text-[#61AFEF] hover:border-[#61AFEF] transition-all"
          >
            Cancel [Esc]
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-[#E06C75] border border-[#E06C75] text-[#0a1525] font-bold hover:bg-[#be5046] transition-all"
          >
            Delete [Enter]
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
