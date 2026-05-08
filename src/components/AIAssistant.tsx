import React, { useState } from 'react';
import { Bot, CheckCircle, ChevronDown, ChevronRight, FileText, Sparkles, TrendingUp, AlertCircle, X, Target, WandSparkles, RotateCcw } from 'lucide-react';
import { ATSSuggestion, ResumeData } from '../lib/types';
import { getAtsSuggestions } from '../lib/gemini';
import { cn } from '../lib/utils';

interface AIAssistantProps {
  resumeData: ResumeData;
  onApplySuggestions?: (newData: ResumeData) => void;
  targetJob: string;
  setTargetJob: (job: string) => void;
}

export function AIAssistant({ resumeData, onApplySuggestions, targetJob, setTargetJob }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [suggestions, setSuggestions] = useState<ATSSuggestion | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('keywords');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await getAtsSuggestions(resumeData, targetJob);
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!suggestions) return;
    setIsApplying(true);
    try {
      const { applyAtsSuggestionsAndRewrite } = await import('../lib/gemini');
      const newData = await applyAtsSuggestionsAndRewrite(resumeData, suggestions, targetJob);
      if (newData) {
        onApplySuggestions?.(newData);
        setSuggestions(null);
      } else {
        alert("Impossibile applicare le modifiche in automatico. Riprova o modificale a mano.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
    if (score >= 60) return 'from-amber-500 to-amber-400 border-amber-500/50 shadow-amber-500/20';
    return 'from-rose-500 to-rose-400 border-rose-500/50 shadow-rose-500/20';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Target Job Block */}
      <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-sm p-1">
        <div className="rounded-xl border bg-white text-slate-900 shadow-sm p-5 space-y-3 border-slate-200">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Target Job & ATS</h3>
          </div>
          <label className="font-medium text-xs text-slate-700">Job Description</label>
          <textarea
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none custom-scrollbar"
            rows={5}
            placeholder="Cerchiamo un Product Designer con esperienza in…"
            disabled={loading || isApplying}
          />
          {!suggestions && (
            <button
              disabled={loading || isApplying}
              onClick={handleAnalyze}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-sm hover:opacity-90 h-9 px-4 py-2 w-full gradient-hero text-white border-0 shadow-glow"
            >
              {loading ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <WandSparkles className="w-3.5 h-3.5" />}
              {loading ? 'Analisi in corso...' : 'Analizza compatibilità'}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border bg-white p-8 flex flex-col items-center justify-center shadow-sm">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse blur-xl"></div>
            <Bot className="w-8 h-8 text-blue-600 animate-pulse relative z-10" />
          </div>
          <p className="text-sm text-slate-700 font-medium animate-pulse text-center">Analisi ATS in corso...</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="rounded-xl border bg-white p-5 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
             <Bot className="w-4 h-4 text-blue-600" />
             <h3 className="font-semibold text-sm">Risultati ATS</h3>
          </div>

          {/* Score Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Score
              </h3>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-bold text-slate-900">{suggestions.score}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
            
            <div className="w-full h-2 bg-slate-200 rounded-full mb-3 overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 bg-gradient-to-r shadow-sm", getScoreColor(suggestions.score))}
                style={{ width: `${suggestions.score}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {suggestions.scoreMessage}
            </p>
          </div>

          {/* Tips Accordion */}
          <div className="flex flex-col gap-2">
            {/* Keywords */}
            <div className="border border-slate-200 rounded-lg overflow-hidden transition-all">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'keywords' ? null : 'keywords')}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                title="Click to expand"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-slate-900">Keyword Mancanti</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{suggestions.keywordsToInclude.length}</span>
                  {expandedSection === 'keywords' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
              
              {expandedSection === 'keywords' && (
                <div className="p-3 pt-0 border-t border-slate-100 grid gap-2 animate-in slide-in-from-top-2 bg-slate-50">
                  {suggestions.keywordsToInclude.map((kw, i) => (
                    <div key={i} className="p-2.5 bg-white border border-emerald-100 rounded-md relative shadow-sm">
                      <p className="text-[11px] font-bold text-emerald-800 mb-0.5">{kw.keyword}</p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{kw.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Verbs */}
            <div className="border border-slate-200 rounded-lg overflow-hidden transition-all">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'verbs' ? null : 'verbs')}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                title="Click to expand"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-slate-900">Verbi d'Azione</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{suggestions.actionVerbs.length}</span>
                  {expandedSection === 'verbs' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
              
              {expandedSection === 'verbs' && (
                <div className="p-3 pt-0 border-t border-slate-100 grid gap-2 animate-in slide-in-from-top-2 bg-slate-50">
                  {suggestions.actionVerbs.map((verb, i) => (
                    <div key={i} className="p-2.5 bg-white border border-amber-100 rounded-md shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 line-through">{verb.original}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-amber-500/50" />
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded">{verb.suggested}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{verb.context}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={handleApply}
              disabled={isApplying}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 h-9 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              {isApplying ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {isApplying ? 'Applicazione...' : 'Applica Fix in Automatico'}
            </button>
            <button 
              onClick={() => {
                 setSuggestions(null);
                 handleAnalyze();
              }}
              disabled={isApplying}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-50 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <RotateCcw className="w-3 h-3" /> Rianalizza
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
