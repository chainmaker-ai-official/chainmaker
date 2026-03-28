import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Settings } from 'lucide-react';

export interface SettingField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface NodeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  fields: SettingField[];
  initialData: any;
}

const NodeSettingsModal: React.FC<NodeSettingsModalProps> = ({ 
  isOpen, onClose, onSave, title, fields, initialData 
}) => {
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-[#0a1525] border border-[#56B6C2] p-8 w-[500px] max-h-[85vh] overflow-y-auto shadow-2xl font-mono relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#ABB2BF] hover:text-[#E06C75] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-[#61AFEF] text-2xl font-bold mb-6 border-b border-[#56B6C266] pb-2 flex items-center gap-3">
          <Settings className="text-[#C678DD]" size={24} />
          {title} Settings
        </div>

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-[#D19A66] text-xs uppercase tracking-widest mb-2">{field.label}</label>
              
              {field.type === 'select' ? (
                <select
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full bg-[#1a2840] border border-[#56B6C233] text-[#ABB2BF] px-4 py-2 rounded-sm focus:outline-none focus:border-[#61AFEF] text-sm appearance-none cursor-pointer"
                >
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'boolean' ? (
                <div className="flex items-center gap-3">
                   <input 
                    type="checkbox"
                    checked={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.checked)}
                    className="w-5 h-5 accent-[#56B6C2]"
                  />
                  <span className="text-[#ABB2BF] text-sm">Enabled</span>
                </div>
              ) : (
                <input 
                  type={field.type}
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  className="w-full bg-[#1a2840] border border-[#56B6C233] text-[#ABB2BF] px-4 py-2 rounded-sm focus:outline-none focus:border-[#61AFEF] text-sm"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
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
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default NodeSettingsModal;
