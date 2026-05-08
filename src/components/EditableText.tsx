import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Sparkles, Loader2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { improveTextGen } from '../lib/gemini';

export const EditableText = ({ 
  value, 
  onSave, 
  className, 
  tagName = 'span'
}: { 
  value: string; 
  onSave: (val: string) => void; 
  className?: string; 
  tagName?: any;
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | 'auto'>('auto');
  const [isResizing, setIsResizing] = useState(false);
  const editorRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const Tag = tagName;

  const isInline = tagName === 'span' || tagName === 'b';

  const handleImprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value || value.trim().length < 5) return;
    setIsImproving(true);
    try {
      const improved = await improveTextGen(value);
      if (improved) {
        if (editorRef.current) {
          editorRef.current.innerHTML = improved;
        }
        onSave(improved);
      }
    } finally {
      setIsImproving(false);
    }
  };

  const handleFormat = (command: string, e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = containerRef.current?.offsetWidth || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setCustomWidth(Math.max(50, startWidth + deltaX));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
       ref={containerRef}
       className={cn(
         "relative group", 
         isInline ? "inline-block align-top" : "block w-full",
         isResizing && "z-50 ring-2 ring-blue-500/50 rounded"
       )}
       style={{ width: customWidth === 'auto' ? undefined : customWidth }}
    >
      <Tag 
        ref={editorRef}
        contentEditable 
        suppressContentEditableWarning 
        className={cn(
          "outline-none hover:bg-black/5 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-500/50 rounded transition-colors break-words whitespace-pre-wrap px-0.5 -mx-0.5 cursor-text relative block w-full",
          className, 
          isImproving && "opacity-50 pointer-events-none"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
           // delay hiding to allow clicks on toolbar
           setTimeout(() => setIsFocused(false), 200);
           let newVal = e.currentTarget.innerHTML;
           if (newVal === '<br>') newVal = '';
           if (newVal !== value) onSave(newVal);
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
      
      {(isFocused || isResizing) && (
         <div 
           className={cn(
             "absolute -right-3 top-0 bottom-0 w-6 cursor-col-resize items-center justify-center z-50",
             isResizing ? "flex" : "hidden group-hover:flex"
           )}
           onMouseDown={startResize}
           contentEditable={false}
         >
            <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-sm" />
         </div>
      )}

      {isFocused && (
         <div 
           className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded z-50 text-white shadow-xl animate-in fade-in zoom-in-95 duration-100"
           contentEditable={false}
         >
           <button onMouseDown={(e) => handleFormat('bold', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Grassetto"><Bold className="w-3.5 h-3.5" /></button>
           <button onMouseDown={(e) => handleFormat('italic', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Corsivo"><Italic className="w-3.5 h-3.5" /></button>
           <button onMouseDown={(e) => handleFormat('underline', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Sottolineato"><Underline className="w-3.5 h-3.5" /></button>
           <div className="w-px h-4 bg-slate-700 mx-1"></div>
           <button onMouseDown={(e) => handleFormat('justifyLeft', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Allinea a Sinistra"><AlignLeft className="w-3.5 h-3.5" /></button>
           <button onMouseDown={(e) => handleFormat('justifyCenter', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Allinea al Centro"><AlignCenter className="w-3.5 h-3.5" /></button>
           <button onMouseDown={(e) => handleFormat('justifyRight', e)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Allinea a Destra"><AlignRight className="w-3.5 h-3.5" /></button>
         </div>
      )}
      {value?.trim().length >= 5 && (
        <button
          className="absolute -right-2 -top-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-blue-50 text-blue-600 z-10 disabled:opacity-0"
          title="Migliora con AI"
          onMouseDown={handleImprove}
          disabled={isImproving}
          contentEditable={false}
        >
          {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};
