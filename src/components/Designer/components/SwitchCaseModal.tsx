import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface SwitchCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { cases: string[], defaultCase: string, label: string }) => void;
  initialData: { cases: string[], defaultCase: string, label: string };
}

const SwitchCaseModal: React.FC<SwitchCaseModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [cases, setCases] = useState<string[]>(initialData.cases);
  const [defaultCase, setDefaultCase] = useState<string>(initialData.defaultCase);
  const [label, setLabel] = useState<string>(initialData.label);

  useEffect(() => {
    if (isOpen) {
      setCases(initialData.cases);
      setDefaultCase(initialData.defaultCase);
      setLabel(initialData.label);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddCase = () => {
    setCases([...cases, '']);
  };

  const handleRemoveCase = (index: number) => {
    setCases(cases.filter((_, i) => i !== index));
  };

  const handleCaseChange = (index: number, value: string) => {
    const newCases = [...cases];
    newCases[index] = value;
    setCases(newCases);
  };

  const handleSave = () => {
    onSave({ cases, defaultCase, label });
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-[#0a1525] border border-[#56B6C2] p-8 w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl font-mono relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#ABB2BF] hover:text-[#E06C75] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-[#61AFEF] text-2xl font-bold mb-6 border-b border-[#56B6C266] pb-2 flex items-center gap-3">
          Switch Case Configuration
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[#D19A66] text-xs uppercase tracking-widest mb-2">Switch Variable / Label</label>
            <input 
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#1a2840] border border-[#56B6C233] text-[#ABB2BF] px-4 py-2 rounded-sm focus:outline-none focus:border-[#61AFEF] text-sm"
              placeholder="e.g., currentPrice"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[#D19A66] text-xs uppercase tracking-widest">Cases (Conditions)</label>
              <button 
                onClick={handleAddCase}
                className="flex items-center gap-1 text-[10px] bg-[#98C379] text-[#0a1525] px-2 py-1 rounded-sm hover:bg-[#61AFEF] transition-all font-bold"
              >
                <Plus size={12} /> Add Case
              </button>
            </div>
            
            <div className="space-y-2">
              {cases.map((caseValue, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#56B6C2] text-xs min-w-[60px]">Case {index + 1}:</span>
                  <input 
                    type="text"
                    value={caseValue}
                    onChange={(e) => handleCaseChange(index, e.target.value)}
                    className="flex-1 bg-[#1a2840] border border-[#56B6C233] text-[#ABB2BF] px-3 py-1.5 rounded-sm focus:outline-none focus:border-[#61AFEF] text-sm"
                    placeholder="e.g., price > 100"
                  />
                  <button 
                    onClick={() => handleRemoveCase(index)}
                    className="text-[#E06C75] hover:text-[#be5046] transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cases.length === 0 && (
                <div className="text-[#56B6C266] text-xs italic py-2">No cases defined. Click "Add Case" to start.</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[#D19A66] text-xs uppercase tracking-widest mb-2">Default Action / Value</label>
            <input 
              type="text"
              value={defaultCase}
              onChange={(e) => setDefaultCase(e.target.value)}
              className="w-full bg-[#1a2840] border border-[#56B6C233] text-[#ABB2BF] px-4 py-2 rounded-sm focus:outline-none focus:border-[#61AFEF] text-sm"
              placeholder="e.g., Hold Position"
            />
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#56B6C233] flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#1a2840] border border-[#56B6C266] text-[#ABB2BF] hover:text-[#61AFEF] hover:border-[#61AFEF] transition-all uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-[#56B6C2] text-[#0a1525] font-bold hover:bg-[#61AFEF] transition-all uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SwitchCaseModal;
