import React, { useState, useRef, useEffect } from 'react';
import { defaultResumeData, ResumeData, ResumeStyle } from './lib/types';
import { AIAssistant } from './components/AIAssistant';
import { ResumePreview } from './components/ResumePreview';
import { ContentEditor } from './components/ContentEditor';
import { FileUp, Download, Palette, Type, LayoutTemplate, Edit3, ChevronUp, ChevronDown, RotateCcw, FileText, WandSparkles, Sparkles, FileOutput, Languages } from 'lucide-react';
import { parseResumeText, parseResumeFile, translateResume, generateCoverLetter } from './lib/gemini';
import { TEMPLATES, COLORS, FONTS } from './lib/constants';
import { generateDocx } from './lib/docxExport';
import { useReactToPrint } from 'react-to-print';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'coverLetter'>('content');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clTone, setClTone] = useState('Professionale');
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>({
    template: 'modern',
    primaryColor: '#2563eb',
    fontFamily: 'font-sans',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages', 'projects'],
    textScale: 1
  });
  const [isImporting, setIsImporting] = useState(false);
  const [targetJob, setTargetJob] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showCanvaModal, setShowCanvaModal] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        // Foglio A4 ha larghezza fissa di 800px.
        // Lasciamo un piccolo margine (es. 40px totale = 20px per lato).
        const containerWidth = previewContainerRef.current.clientWidth - 40;
        const scale = Math.min(containerWidth / 800, 1);
        setPreviewScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const printRef = useRef<HTMLDivElement>(null);

  const moveSection = (index: number, direction: number) => {
    const newOrder = [...resumeStyle.sectionOrder];
    if (direction === -1 && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 1 && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    } else {
       return;
    }
    setResumeStyle({ ...resumeStyle, sectionOrder: newOrder });
  };

  const reorderSection = (sourceIndex: number, destinationIndex: number) => {
    const newOrder = [...resumeStyle.sectionOrder];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, removed);
    setResumeStyle({ ...resumeStyle, sectionOrder: newOrder });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `CV_${resumeData.contact?.fullName?.replace(/\s+/g, '_') || 'Resume'}`
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `CV_${resumeData.contact?.fullName?.replace(/\s+/g, '_') || 'Resume'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportText = async (text: string) => {
    if (!text || text.trim().length === 0) return;
    setIsImporting(true);
    try {
      const parsed = await parseResumeText(text);
      if (parsed) {
        setResumeData(parsed);
      } else {
        alert("Errore nell'estrazione dei dati. L'AI non ha restituito un formato valido.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const parsed = await parseResumeFile(file);
      if (parsed) {
        setResumeData(parsed);
      } else {
        alert("Errore nell'estrazione dei dati dal file.");
      }
    } catch (error) {
      console.error(error);
      alert("Errore nella lettura del file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if(confirm("Sei sicuro di voler ripristinare il CV iniziale? Perderai le modifiche non salvate.")) {
       setResumeData(defaultResumeData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-[1700px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">CVForge</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em]">AI Resume Copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group inline-block">
               <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-8 rounded-md px-3 text-xs text-slate-600">
                 <Languages className="w-3.5 h-3.5" /> Traduci
               </button>
               <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col p-1">
                  <button onClick={async () => { const res = await translateResume(resumeData, 'Inglese'); if (res) setResumeData(res); }} className="text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded-md text-slate-700">🇺🇸 Inglese</button>
                  <button onClick={async () => { const res = await translateResume(resumeData, 'Spagnolo'); if (res) setResumeData(res); }} className="text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded-md text-slate-700">🇪🇸 Spagnolo</button>
                  <button onClick={async () => { const res = await translateResume(resumeData, 'Francese'); if (res) setResumeData(res); }} className="text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded-md text-slate-700">🇫🇷 Francese</button>
               </div>
            </div>
            <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-8 rounded-md px-3 text-xs text-slate-600 border border-slate-200">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => generateDocx(resumeData)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-8 rounded-md px-3 text-xs text-slate-700 border border-slate-200 shadow-sm">
              <FileOutput className="w-3.5 h-3.5" /> Word (.docx)
            </button>
            <button onClick={() => setShowCanvaModal(true)} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors hover:bg-[#EAE6FF] hover:text-[#5E3BEE] h-8 rounded-md px-3 text-xs text-[#5E3BEE] border border-[#5E3BEE]/20 bg-[#F4F2FF] shadow-sm">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm5.85 17.5a1.5 1.5 0 0 1-2.1.25l-2.6-1.95-2.6 1.95a1.5 1.5 0 0 1-2.1-.25 1.5 1.5 0 0 1 .25-2.1l3.15-2.35v-2.35l-3.3-3.3a1.5 1.5 0 0 1 2.1-2.1l3.3 3.3 3.3-3.3a1.5 1.5 0 0 1 2.1 2.1l-3.3 3.3v2.35l3.15 2.35a1.5 1.5 0 0 1 .25 2.1z" />
              </svg>
              Canva
            </button>
            <button onClick={handlePrint} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors shadow h-8 rounded-md px-3 text-xs gradient-hero text-white border-0 shadow-glow hover:opacity-90">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-[1700px] mx-auto px-6 pt-6 pb-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 mb-2">
          <Sparkles className="w-3 h-3" /> AI Copilot · ATS-ready
        </div>
        <h2 className="font-bold text-2xl sm:text-3xl leading-tight text-slate-900">
          Il tuo CV, <span className="text-gradient">ottimizzato dall'AI</span>
        </h2>
      </section>

      <main className="max-w-[1700px] mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Import & Settings */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="rounded-xl border bg-white shadow-sm p-4 space-y-4 border-slate-200">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('content')}
                className={cn("flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all", activeTab === 'content' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <FileText className="w-3.5 h-3.5" /> Contenuti
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={cn("flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all", activeTab === 'design' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <WandSparkles className="w-3.5 h-3.5" /> Design
              </button>
              <button
                onClick={() => setActiveTab('coverLetter')}
                className={cn("flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all", activeTab === 'coverLetter' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Edit3 className="w-3.5 h-3.5" /> Lettera
              </button>
            </div>

            {activeTab === 'coverLetter' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                   <h3 className="font-semibold text-sm text-slate-900">Generatore Cover Letter</h3>
                   <p className="text-xs text-slate-500">Crea una lettera di presentazione su misura analizzando il tuo CV e la Job Description.</p>
                </div>
                <div className="space-y-3">
                   <div className="space-y-1">
					  <label className="text-xs font-medium text-slate-700">Tono di Voce</label>
					  <select 
						value={clTone} 
						onChange={e => setClTone(e.target.value)}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
					  >
						 <option>Professionale</option>
						 <option>Creativo ed Energetico</option>
						 <option>Accattivante e Moderno</option>
						 <option>Formale e Istituzionale</option>
					  </select>
                   </div>
                   <button 
                      onClick={async () => {
                         setIsGeneratingCL(true);
                         const result = await generateCoverLetter(resumeData, targetJob, clTone);
                         setCoverLetter(result);
                         setIsGeneratingCL(false);
                      }}
                      disabled={isGeneratingCL}
                      className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 h-9 rounded-md px-3 text-xs shadow-sm disabled:opacity-50"
                   >
                      {isGeneratingCL ? 'Generazione in corso...' : 'Genera con AI'}
                      <WandSparkles className="w-3 h-3" />
                   </button>
                </div>
                {coverLetter && (
                   <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                     <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Risultato</p>
					 <textarea
					   className="w-full h-96 bg-white border border-slate-200 rounded-lg p-4 text-sm leading-relaxed text-slate-900 focus:bg-white focus:border-blue-500 outline-none resize-none custom-scrollbar shadow-inner"
					   value={coverLetter}
					   onChange={e => setCoverLetter(e.target.value)}
					 />
                   </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="rounded-xl border border-blue-500/20 shadow-sm p-5 space-y-3 bg-gradient-to-br from-blue-500/5 to-purple-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                        <FileUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">Smart Import</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Incolla il testo del tuo vecchio CV. L'AI compila tutto.</p>
                      </div>
                    </div>
                    
                    <textarea 
                      id="cv-paste-area-main"
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none custom-scrollbar" 
                      rows={4} 
                      placeholder="Incolla qui il testo o il link LinkedIn del tuo CV..."
                      disabled={isImporting}
                    />
                    
                    <div className="flex gap-2">
                      <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-9 rounded-md px-3 text-xs flex-1 shadow-sm cursor-pointer disabled:opacity-50">
                        <input 
                           type="file" 
                           accept="application/pdf,.txt,.doc,.docx"
                           className="hidden"
                           onChange={handleImportFile}
                           ref={fileInputRef}
                           disabled={isImporting}
                        />
                        <FileUp className="w-3.5 h-3.5" /> Carica PDF/DOCX
                      </label>
                      <button 
                        disabled={isImporting}
                        onClick={() => {
                          const el = document.getElementById('cv-paste-area-main') as HTMLTextAreaElement;
                          if (el && el.value) handleImportText(el.value);
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors h-9 rounded-md px-3 text-xs flex-1 gradient-hero text-white border-0 shadow-glow hover:opacity-90 disabled:opacity-50"
                      >
                        {isImporting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Analizza con AI
                      </button>
                    </div>
                 </div>

                 <div className="pt-2">
                    <ContentEditor data={resumeData} onChange={setResumeData} />
                 </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Template
                  </h3>
                  <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
                    {TEMPLATES.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setResumeStyle({ ...resumeStyle, template: t.id as any })}
                        className={cn(
                          "flex-shrink-0 w-20 p-2 rounded-xl text-center transition-all snap-start border",
                          resumeStyle.template === t.id 
                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-600 text-blue-700" 
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <div className={cn(
                           "w-12 h-16 mx-auto rounded mb-2 border flex flex-col justify-start p-1 gap-1", 
                           resumeStyle.template === t.id ? "bg-white border-blue-200 shadow-sm" : "bg-slate-50 border-slate-200"
                        )}>
                           {/* Mini SVG Previews */}
                           {t.id === 'minimal' && (
                              <>
                                <div className="h-1.5 w-1/2 bg-slate-300 rounded-sm mx-auto"></div>
                                <div className="h-0.5 w-full bg-slate-200 mt-1 mb-1"></div>
                                <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                                <div className="h-1 w-3/4 bg-slate-200 rounded-sm"></div>
                              </>
                           )}
                           {t.id === 'modern' && (
                              <>
                                <div className="h-2 w-full bg-slate-400 rounded-sm"></div>
                                <div className="h-1 w-2/3 bg-slate-300 rounded-sm mt-0.5 mb-1"></div>
                                <div className="h-4 w-full bg-slate-200 rounded-sm"></div>
                              </>
                           )}
                           {t.id === 'two-column' && (
                              <div className="flex w-full h-full gap-1">
                                <div className="w-[30%] h-full bg-slate-200 rounded-sm"></div>
                                <div className="w-[70%] h-full bg-slate-100 rounded-sm pt-0.5 px-0.5">
                                  <div className="h-1 w-full bg-slate-300 rounded-sm mb-1"></div>
                                  <div className="h-0.5 w-full bg-slate-200 rounded-sm"></div>
                                </div>
                              </div>
                           )}
                           {t.id === 'sidebar' && (
                              <div className="flex w-full h-full">
                                <div className="w-[40%] h-full bg-blue-500 rounded-l-sm flex flex-col gap-0.5 p-0.5">
                                   <div className="w-2 h-2 rounded-full bg-white/20 mx-auto mt-0.5"></div>
                                   <div className="h-1 w-full bg-blue-200 rounded-sm mt-1"></div>
                                </div>
                                <div className="w-[60%] h-full bg-slate-100 rounded-r-sm pt-0.5 px-0.5 flex flex-col gap-0.5">
                                  <div className="h-1 w-3/4 bg-slate-300 rounded-sm mb-0.5"></div>
                                  <div className="h-0.5 w-full bg-slate-200 rounded-sm"></div>
                                </div>
                              </div>
                           )}
                           {t.id === 'bold-organic' && (
                              <div className="flex flex-col w-full h-full relative overflow-hidden">
                                <div className="h-4 w-full bg-rose-500 rounded-t-sm flex flex-col justify-center px-0.5 relative z-10">
                                   <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-rose-400/50 rounded-full"></div>
                                   <div className="h-1 w-3/4 bg-white rounded-sm mt-0.5"></div>
                                </div>
                                <div className="flex flex-1 w-full mt-0.5 gap-0.5">
                                  <div className="w-1/2 h-full bg-slate-100 rounded-bl-sm"></div>
                                  <div className="w-1/2 h-full bg-slate-100 rounded-br-sm flex flex-col gap-0.5 items-end justify-start pt-1">
                                     <div className="w-4 h-1 bg-rose-200 rounded-full"></div>
                                     <div className="w-4 h-1 bg-rose-200 rounded-full"></div>
                                  </div>
                                </div>
                              </div>
                           )}
                           {t.id === 'editorial' && (
                              <div className="flex flex-col w-full h-full bg-stone-50 rounded-sm border-t border-b border-rose-300 p-0.5">
                                <div className="h-1.5 w-1/2 bg-slate-800 mb-0.5"></div>
                                <div className="h-0.5 w-2/3 bg-rose-400/50 mb-1"></div>
                                <div className="flex flex-1 gap-1">
                                  <div className="w-1/3 h-full border-r border-rose-200"></div>
                                  <div className="w-2/3 h-full flex flex-col gap-0.5">
                                     <div className="h-1 w-full bg-slate-600"></div>
                                     <div className="h-[2px] w-full bg-slate-200"></div>
                                  </div>
                                </div>
                              </div>
                           )}
                           {t.id === 'elegant' && (
                              <>
                                <div className="h-1.5 w-3/4 bg-slate-400 mx-auto"></div>
                                <div className="h-0.5 w-1/4 bg-slate-300 mx-auto mt-0.5 mb-1"></div>
                                <div className="h-0.5 w-full bg-slate-200 mx-auto"></div>
                                <div className="h-0.5 w-5/6 bg-slate-200 mx-auto"></div>
                              </>
                           )}
                           {t.id === 'fluid' && (
                              <div className="flex flex-col gap-1 w-full h-full relative overflow-hidden rounded-[4px]">
                                <div className="h-2 w-3/4 bg-gradient-to-r from-slate-400 to-slate-200 rounded-full"></div>
                                <div className="h-3 w-full bg-slate-200/50 rounded-xl mt-1"></div>
                                <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-slate-200/50 rounded-full blur-sm"></div>
                              </div>
                           )}
                           {t.id === 'timeline' && (
                              <div className="flex flex-col gap-1 w-full h-full relative">
                                <div className="h-1.5 w-2/3 bg-slate-400 rounded-sm mx-auto mb-0.5"></div>
                                <div className="flex h-full ml-1">
                                  <div className="w-[1px] h-full bg-slate-300 relative">
                                    <div className="absolute -left-[2px] top-1 w-1.5 h-1.5 rounded-full border border-slate-300 bg-white"></div>
                                    <div className="absolute -left-[2px] top-4 w-1.5 h-1.5 rounded-full border border-slate-300 bg-white"></div>
                                  </div>
                                  <div className="w-full flex flex-col gap-1 pl-1 pt-1">
                                     <div className="h-1 w-3/4 bg-slate-200 rounded-sm"></div>
                                     <div className="h-0.5 w-full bg-slate-200 mt-1 rounded-sm"></div>
                                  </div>
                                </div>
                              </div>
                           )}
                           {t.id === 'creative' && (
                              <div className="flex flex-col h-full pl-1 border-l border-slate-300 relative justify-center gap-0.5">
                                <div className="h-1.5 w-2/3 bg-slate-400 rounded-sm mb-0.5"></div>
                                <div className="h-0.5 w-full bg-slate-200 rounded-sm"></div>
                                <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm"></div>
                              </div>
                           )}
                        </div>
                        <span className={cn("text-[9px] font-bold leading-tight line-clamp-2", resumeStyle.template === t.id ? "text-blue-700" : "text-slate-500")}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5" />
                    Colori
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setResumeStyle({ ...resumeStyle, primaryColor: c.value })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm",
                          resumeStyle.primaryColor === c.value ? "border-slate-800 ring-2 ring-offset-2 ring-slate-200" : "border-slate-100"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                    <label 
                      className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative"
                      title="Colore Personalizzato"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 rounded-full" />
                      <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center">
                        <Palette className="w-3.5 h-3.5 text-slate-700" />
                      </div>
                      <input 
                        type="color" 
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                        value={resumeStyle.primaryColor.startsWith('#') ? resumeStyle.primaryColor : '#2563eb'}
                        onChange={(e) => setResumeStyle({ ...resumeStyle, primaryColor: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" />
                    Tipografia & Dimensione
                  </h3>
                  <div className="flex flex-col gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setResumeStyle({ ...resumeStyle, fontFamily: f.id })}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm text-left border transition-all",
                          f.id,
                          resumeStyle.fontFamily === f.id
                            ? "bg-slate-100 border-slate-300 text-slate-900 font-medium shadow-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                      <span>Scala Testo</span>
                      <span>{Math.round((resumeStyle.textScale || 1) * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0.75"
                      max="1.25"
                      step="0.05"
                      value={resumeStyle.textScale || 1}
                      onChange={(e) => setResumeStyle({...resumeStyle, textScale: parseFloat(e.target.value)})}
                      className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">Ottimizza la dimensione per far entrare tutto nel foglio.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Document Preview */}
        <div className="lg:col-span-5 h-[calc(100vh-140px)] sticky top-[95px]">
          <div className="text-xs text-slate-500 mb-2 flex items-center justify-between font-medium">
             <span>Anteprima live · A4</span>
             <span className="capitalize">{resumeStyle.template} · <span style={{color: resumeStyle.primaryColor}}>●</span></span>
          </div>
          <div 
             ref={previewContainerRef}
             className="overflow-hidden rounded-2xl bg-slate-200/50 h-full border border-slate-200 shadow-inner flex justify-center items-start pt-4 relative"
          >
             <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex justify-center pb-24 items-start">
               <div 
                 className="transform origin-top transition-transform duration-200 ease-out flex-shrink-0"
                 style={{ transform: `scale(${previewScale})`, width: '800px' }}
               >
                  <ResumePreview ref={printRef} resumeData={resumeData} resumeStyle={resumeStyle} onUpdate={setResumeData} onMoveSection={moveSection} onReorderSection={reorderSection} />
               </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar - AI Assistant */}
        <div className="lg:col-span-3">
          <div className="sticky top-[95px] space-y-4">
             <AIAssistant 
               resumeData={resumeData} 
               onApplySuggestions={setResumeData}
               targetJob={targetJob}
               setTargetJob={setTargetJob}
             />
          </div>
        </div>

      </main>

      {showCanvaModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-[#F4F2FF] rounded-2xl flex items-center justify-center mb-6 border border-[#5E3BEE]/20 shadow-inner">
                 <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#5E3BEE]">
                   <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm5.85 17.5a1.5 1.5 0 0 1-2.1.25l-2.6-1.95-2.6 1.95a1.5 1.5 0 0 1-2.1-.25 1.5 1.5 0 0 1 .25-2.1l3.15-2.35v-2.35l-3.3-3.3a1.5 1.5 0 0 1 2.1-2.1l3.3 3.3 3.3-3.3a1.5 1.5 0 0 1 2.1 2.1l-3.3 3.3v2.35l3.15 2.35a1.5 1.5 0 0 1 .25 2.1z" />
                 </svg>
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-3">Esporta in Canva</h3>
               <p className="text-slate-600 mb-6 leading-relaxed">
                 Per modificare il tuo CV su Canva, devi semplicemente scaricare il file in formato PDF e caricarlo (drag & drop) direttamente nella home page o in un progetto di Canva.
               </p>
               <div className="flex flex-col w-full gap-3">
                 <button onClick={() => { handlePrint(); setShowCanvaModal(false); }} className="w-full flex items-center justify-center gap-2 font-medium transition-colors h-11 rounded-xl text-white bg-[#5E3BEE] hover:bg-[#4A2DBC] shadow-sm">
                   <Download className="w-4 h-4" /> 1. Scarica il PDF
                 </button>
                 <a href="https://www.canva.com/design" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 font-medium transition-colors h-11 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200">
                   2. Apri Canva
                 </a>
                 <button onClick={() => setShowCanvaModal(false)} className="w-full h-11 rounded-xl font-medium text-slate-500 hover:text-slate-700 mt-2">
                   Chiudi
                 </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
