"use client";

import { useState } from "react";
import { 
  X, 
  Users, 
  Plus, 
  Trash2, 
  Check,
  Split
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface Collaborator {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  }
}

interface SplitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  collaborators: Collaborator[];
  onSave: (splits: { userId: string, amount: number }[]) => void;
  initialSplits?: { userId: string, amount: number }[];
}

export function SplitExpenseModal({ 
  isOpen, 
  onClose, 
  totalAmount, 
  collaborators, 
  onSave,
  initialSplits = []
}: SplitExpenseModalProps) {
  const [splits, setSplits] = useState<{ userId: string, amount: number }[]>(
    initialSplits.length > 0 ? initialSplits : []
  );

  const handleEqualSplit = () => {
    const amountPerPerson = totalAmount / collaborators.length;
    setSplits(collaborators.map(c => ({
      userId: c.user.id,
      amount: parseFloat(amountPerPerson.toFixed(2))
    })));
  };

  const toggleUser = (userId: string) => {
    setSplits(prev => {
      const exists = prev.find(s => s.userId === userId);
      if (exists) {
        return prev.filter(s => s.userId !== userId);
      } else {
        return [...prev, { userId, amount: 0 }];
      }
    });
  };

  const updateAmount = (userId: string, amount: string) => {
    const val = parseFloat(amount) || 0;
    setSplits(prev => prev.map(s => s.userId === userId ? { ...s, amount: val } : s));
  };

  const currentTotal = splits.reduce((acc, s) => acc + s.amount, 0);
  const diff = totalAmount - currentTotal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-via-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-via-white border-2 border-via-black animate-in fade-in zoom-in duration-200 shadow-brutalist">
        <div className="flex items-center justify-between p-4 border-b-2 border-via-black">
          <div className="flex items-center gap-2">
            <Split size={20} />
            <h3 className="font-space-grotesk font-bold uppercase tracking-tight">Split Expense</h3>
          </div>
          <button onClick={onClose} className="text-via-grey-mid hover:text-via-black">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-via-grey-mid uppercase tracking-widest">Total Amount</p>
            <p className="font-mono font-bold text-lg">₹{totalAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-widest">Split with</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEqualSplit}
                className="h-7 text-[10px] font-mono uppercase"
              >
                Split Equally
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {collaborators.map((collab) => {
                const split = splits.find(s => s.userId === collab.user.id);
                const isSelected = !!split;
                
                return (
                  <div key={collab.user.id} className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleUser(collab.user.id)}
                      className={`flex items-center gap-3 flex-1 p-2 border-2 transition-all text-left ${isSelected ? 'border-via-black bg-via-off-white' : 'border-via-grey-light opacity-60'}`}
                    >
                      <Avatar src={collab.user.avatarUrl} name={collab.user.name} size="sm" />
                      <span className="font-mono text-xs truncate flex-1">{collab.user.name}</span>
                      {isSelected && <Check size={14} className="text-via-black" />}
                    </button>
                    
                    {isSelected && (
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-via-grey-mid">₹</span>
                        <input 
                          type="number"
                          value={split.amount}
                          onChange={(e) => updateAmount(collab.user.id, e.target.value)}
                          className="w-full bg-via-white border-2 border-via-black pl-5 pr-2 py-1.5 font-mono text-xs outline-none focus:bg-via-off-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-4 border-2 ${Math.abs(diff) < 0.01 ? 'border-emerald-500 bg-emerald-50' : 'border-via-red bg-red-50'} flex items-center justify-between`}>
             <span className="font-mono text-[10px] uppercase tracking-widest">
               {diff === 0 ? "Perfectly Split" : diff > 0 ? `₹${diff.toFixed(2)} Remaining` : `₹${Math.abs(diff).toFixed(2)} Over`}
             </span>
             {Math.abs(diff) < 0.01 && <Check size={16} className="text-emerald-600" />}
          </div>
        </div>

        <div className="p-4 border-t-2 border-via-black bg-via-off-white flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button 
            className="flex-1" 
            disabled={Math.abs(diff) > 0.01 || splits.length === 0}
            onClick={() => onSave(splits)}
          >
            Confirm Split
          </Button>
        </div>
      </div>
    </div>
  );
}
