import React, { useState } from 'react';
import { ResumeData, ResumeStyle } from '../lib/types';
import { cn } from '../lib/utils';
import { COLORS } from '../lib/constants';
import { EditableText } from './EditableText';
import { GripVertical } from 'lucide-react';

interface ResumePreviewProps {
  resumeData: ResumeData;
  resumeStyle: ResumeStyle;
  onUpdate?: (newData: ResumeData) => void;
  onMoveSection?: (index: number, direction: number) => void;
  onReorderSection?: (sourceIndex: number, destinationIndex: number) => void;
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resumeData, resumeStyle, onUpdate, onMoveSection, onReorderSection }, ref) => {
    const [draggingHandle, setDraggingHandle] = useState<string | null>(null);
    const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
    const [dragOverSection, setDragOverSection] = useState<string | null>(null);
    
    // Fallback if the color is a predefined constant value or a raw hex
    const isHex = resumeStyle.primaryColor.startsWith('#');
    const primaryColorHex = isHex ? resumeStyle.primaryColor : COLORS.find(c => c.value === resumeStyle.primaryColor)?.value || '#2563eb';
    
    // Different templates logic
    const isMinimal = resumeStyle.template === 'minimal';
    const isCreative = resumeStyle.template === 'creative';
    const isModern = resumeStyle.template === 'modern';
    const isTwoColumn = resumeStyle.template === 'two-column';
    const isSidebar = resumeStyle.template === 'sidebar';
    const isElegant = resumeStyle.template === 'elegant';
    const isFluid = resumeStyle.template === 'fluid';
    const isTimeline = resumeStyle.template === 'timeline';
    const isBoldOrganic = resumeStyle.template === 'bold-organic';
    const isEditorial = resumeStyle.template === 'editorial';

    const renderSummary = () => {
      if (!resumeData.summary) return null;
      return (
        <section key="summary" className={cn(isElegant && "text-center px-8", isEditorial && "border-b pb-6 mt-4", isFluid && "bg-slate-50/70 p-5 rounded-2xl border border-slate-100")} style={{ borderColor: isEditorial ? `${primaryColorHex}40` : undefined }}>
           {(isEditorial || isBoldOrganic) && (
              <h2 className={cn(
                  "text-xs font-bold tracking-widest mb-4", 
                  !isEditorial && "uppercase",
                  isEditorial && "text-sm text-slate-800 tracking-[0.2em] border-b border-rose-300 pb-2 mb-4",
                  isBoldOrganic && "text-2xl font-black capitalize text-slate-900 border-none pb-0 mb-4 tracking-tight"
              )} style={{ color: (!isEditorial && !isBoldOrganic) ? primaryColorHex : undefined, borderColor: isEditorial ? primaryColorHex : undefined, ...(isBoldOrganic ? { color: '#0f172a' } : {}), ...(isEditorial ? { color: primaryColorHex, borderColor: primaryColorHex} : {}) }}>
                {isBoldOrganic ? 'Chi sono' : 'Profilo Esecutivo'}
              </h2>
           )}
          <EditableText 
             tagName="p"
             value={resumeData.summary}
             onSave={(val) => onUpdate?.({ ...resumeData, summary: val })}
             className={cn("text-sm leading-relaxed text-slate-700", isElegant && "italic font-serif", isFluid && "text-slate-800 leading-loose", isEditorial && "italic font-serif leading-loose text-[15px]", isBoldOrganic && "text-[15px]")}
          />
        </section>
      );
    }

    const renderExperience = () => {
      if (resumeData.experience.length === 0) return null;
      return (
        <section key="experience">
          <h2 className={cn(
             "text-xs font-bold tracking-widest mb-4", 
             !isEditorial && "uppercase",
             isEditorial && "text-sm text-slate-800 tracking-[0.2em] border-b border-rose-300 pb-2 mb-4",
             isBoldOrganic && "text-2xl font-black capitalize text-slate-900 border-none pb-0 mb-4 tracking-tight",
             isElegant && "text-center border-b pb-2 mb-6",
             isFluid && "text-sm bg-gradient-to-r from-transparent to-transparent border-l-4 pl-3"
          )} style={{ color: (!isEditorial && !isBoldOrganic) ? primaryColorHex : undefined, borderColor: isElegant || isFluid || isEditorial ? primaryColorHex : undefined, ...(isBoldOrganic ? { color: '#0f172a' } : {}), ...(isEditorial ? { color: primaryColorHex, borderColor: primaryColorHex} : {}) }}>
            {(isEditorial || isBoldOrganic) ? (isBoldOrganic ? 'Esperienza' : 'Esperienza & Risultati') : 'Esperienza Professionale'}
          </h2>
          <div className={cn("space-y-6", isTimeline && "border-l-2 ml-3 pl-6 space-y-8")} style={isTimeline ? { borderColor: primaryColorHex } : undefined}>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className={cn("relative", isFluid && "bg-slate-50/50 p-4 rounded-xl", isEditorial && "pl-3 border-l-2")} style={{ borderColor: isEditorial ? `${primaryColorHex}40` : undefined }}>
                {isCreative && (
                  <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColorHex }}></div>
                )}
                {isTimeline && (
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: primaryColorHex }}></div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                  <span className={cn("font-bold text-slate-800", isEditorial && "text-base")}>
                    <EditableText 
                      value={exp.role} 
                      onSave={(v) => { const n = [...resumeData.experience]; n[idx].role = v; onUpdate?.({...resumeData, experience: n}); }} 
                    /> 
                    {!isEditorial && <span className="text-slate-400 font-normal"> presso </span>}
                    <EditableText 
                      className={cn("font-normal", !isEditorial ? "text-slate-400" : "text-slate-500 block text-sm mt-0.5")}
                      value={exp.company} 
                      onSave={(v) => { const n = [...resumeData.experience]; n[idx].company = v; onUpdate?.({...resumeData, experience: n}); }} 
                    />
                  </span>
                  <span className={cn("text-xs font-medium mt-1 sm:mt-0", isEditorial ? "text-slate-400" : "text-slate-500")}>
                     <EditableText 
                       value={exp.startDate} 
                       onSave={(v) => { const n = [...resumeData.experience]; n[idx].startDate = v; onUpdate?.({...resumeData, experience: n}); }} 
                     />
                     {" — "}
                     <EditableText 
                       value={exp.endDate} 
                       onSave={(v) => { const n = [...resumeData.experience]; n[idx].endDate = v; onUpdate?.({...resumeData, experience: n}); }} 
                     />
                  </span>
                </div>
                <EditableText 
                   tagName="div"
                   className={cn("text-sm leading-relaxed text-slate-600 mt-2 whitespace-pre-wrap", isEditorial && "text-slate-700")}
                   value={exp.description} 
                   onSave={(v) => { const n = [...resumeData.experience]; n[idx].description = v; onUpdate?.({...resumeData, experience: n}); }} 
                />
              </div>
            ))}
          </div>
        </section>
      );
    }

    const renderEducation = () => {
      if (resumeData.education.length === 0) return null;
      return (
        <section key="education">
          <h2 className={cn(
             "text-xs font-bold uppercase tracking-widest mb-4", 
             isElegant && "text-center border-b pb-2 mb-6",
             isFluid && "text-sm bg-gradient-to-r from-transparent to-transparent border-l-4 pl-3"
          )} style={{ color: primaryColorHex, borderColor: isElegant || isFluid ? primaryColorHex : undefined }}>
            Formazione
          </h2>
          <div className={cn("space-y-4", isTimeline && "border-l-2 ml-3 pl-6 space-y-6")} style={isTimeline ? { borderColor: primaryColorHex } : undefined}>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className={cn(isElegant && "text-center", "relative", isFluid && "bg-slate-50/50 p-4 rounded-xl")}>
                {isTimeline && (
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: primaryColorHex }}></div>
                )}
                <div className="font-bold text-slate-800 text-sm">
                  <EditableText 
                    value={edu.degree} 
                    onSave={(v) => { const n = [...resumeData.education]; n[idx].degree = v; onUpdate?.({...resumeData, education: n}); }} 
                  />
                </div>
                <div className="text-slate-600 text-sm">
                  <EditableText 
                    value={edu.institution} 
                    onSave={(v) => { const n = [...resumeData.education]; n[idx].institution = v; onUpdate?.({...resumeData, education: n}); }} 
                  />
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  <EditableText 
                    value={edu.graduationDate} 
                    onSave={(v) => { const n = [...resumeData.education]; n[idx].graduationDate = v; onUpdate?.({...resumeData, education: n}); }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const renderSkills = () => {
      if (resumeData.skills.length === 0) return null;
      return (
        <section key="skills">
          <h2 className={cn(
             "text-xs font-bold tracking-widest mb-4", 
             !isEditorial && "uppercase",
             isEditorial && "text-sm text-slate-800 tracking-[0.2em] border-b border-rose-300 pb-2 mb-4",
             isBoldOrganic && "text-xl font-black capitalize text-slate-900 border-none pb-0 mb-4 tracking-tight",
             isElegant && "text-center border-b pb-2 mb-6",
             isFluid && "text-sm bg-gradient-to-r from-transparent to-transparent border-l-4 pl-3"
          )} style={{ color: (!isEditorial && !isBoldOrganic) ? primaryColorHex : undefined, borderColor: isElegant || isFluid || isEditorial || isBoldOrganic ? primaryColorHex : undefined, ...(isBoldOrganic ? { color: '#0f172a' } : {}), ...(isEditorial ? { color: primaryColorHex, borderColor: primaryColorHex} : {}) }}>
            {isEditorial || isBoldOrganic ? (isBoldOrganic ? 'Skills' : 'Competenze') : 'Competenze'}
          </h2>
          <div className={cn(
             "flex flex-wrap gap-2", 
             isElegant && "justify-center",
             isEditorial && "flex-col gap-3 flex-nowrap"
          )}>
            {resumeData.skills.map((skill, idx) => (
              <span 
                key={idx} 
                className={cn(
                   "text-xs font-medium",
                   isEditorial ? "text-slate-700 font-normal p-0 bg-transparent flex items-start gap-2" : "px-2.5 py-1",
                   !isEditorial && isElegant && "rounded-none border border-slate-300 bg-slate-100 text-slate-700", 
                   !isEditorial && isFluid && "rounded-full bg-slate-100/80 shadow-sm text-slate-700",
                   !isEditorial && isBoldOrganic && "rounded-full text-white font-bold px-4 py-1.5 shadow-sm",
                   !isEditorial && !isElegant && !isFluid && !isBoldOrganic && "rounded-md bg-slate-100 text-slate-700"
                )}
                style={{ 
                  backgroundColor: isBoldOrganic ? primaryColorHex : ((isCreative || isTwoColumn) ? `${primaryColorHex}15` : undefined),
                  color: (!isEditorial && !isBoldOrganic && (isCreative || isTwoColumn)) ? primaryColorHex : undefined,
                  border: (!isEditorial && !isBoldOrganic && isMinimal) ? '1px solid #e2e8f0' : undefined 
                }}
              >
                {isEditorial && <span className="text-slate-400 select-none opacity-60">—</span>} 
                <span className={cn(isEditorial && "pt-[1px]")}>{skill}</span>
              </span>
            ))}
          </div>
        </section>
      );
    }

    const renderLanguages = () => {
      if (!resumeData.languages || resumeData.languages.length === 0) return null;
      return (
        <section key="languages">
          <h2 className={cn(
             "text-xs font-bold uppercase tracking-widest mb-4", 
             isElegant && "text-center border-b pb-2 mb-6",
             isFluid && "text-sm bg-gradient-to-r from-transparent to-transparent border-l-4 pl-3"
          )} style={{ color: primaryColorHex, borderColor: isElegant || isFluid ? primaryColorHex : undefined }}>
            Lingue
          </h2>
          <div className={cn("flex flex-col gap-2", isElegant && "items-center")}>
            {resumeData.languages.map((lang, idx) => (
              <div key={idx} className={cn("flex justify-between items-center w-full max-w-[300px]", isElegant && "text-center")}>
                <span className="font-semibold text-slate-800 text-sm">{lang.name}</span>
                <span className="text-sm text-slate-500">{lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const renderProjects = () => {
      if (!resumeData.projects || resumeData.projects.length === 0) return null;
      return (
        <section key="projects">
           <h2 className={cn(
               "text-xs font-bold uppercase tracking-widest mb-4", 
               isElegant && "text-center border-b pb-2 mb-6",
               isFluid && "text-sm bg-gradient-to-r from-transparent to-transparent border-l-4 pl-3"
            )} style={{ color: primaryColorHex, borderColor: isElegant || isFluid ? primaryColorHex : undefined }}>
            Progetti
          </h2>
          <div className="space-y-4">
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className={cn(isFluid && "bg-slate-50/50 p-4 rounded-xl")}>
                <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span>
                    <EditableText 
                      value={proj.name} 
                      onSave={(v) => { const n = [...resumeData.projects!]; n[idx].name = v; onUpdate?.({...resumeData, projects: n}); }} 
                    />
                  </span>
                  {proj.link && (
                     <a href={proj.link} className="text-xs text-blue-500 hover:underline">
                        <EditableText 
                          value={proj.link} 
                          onSave={(v) => { const n = [...resumeData.projects!]; n[idx].link = v; onUpdate?.({...resumeData, projects: n}); }} 
                        />
                     </a>
                  )}
                </div>
                <EditableText 
                   tagName="p"
                   className="text-sm leading-relaxed text-slate-600 mt-1"
                   value={proj.description} 
                   onSave={(v) => { const n = [...resumeData.projects!]; n[idx].description = v; onUpdate?.({...resumeData, projects: n}); }} 
                />
                {proj.technologies && (
                   <EditableText 
                      tagName="p"
                      className="text-xs text-slate-500 italic mt-1"
                      value={proj.technologies} 
                      onSave={(v) => { const n = [...resumeData.projects!]; n[idx].technologies = v; onUpdate?.({...resumeData, projects: n}); }} 
                   />
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    const renderSection = (sectionId: string, orderIdx?: number) => {
       let content = null;
       switch(sectionId) {
         case 'summary': content = renderSummary(); break;
         case 'experience': content = renderExperience(); break;
         case 'education': content = renderEducation(); break;
         case 'skills': content = renderSkills(); break;
         case 'languages': content = renderLanguages(); break;
         case 'projects': content = renderProjects(); break;
         default: return null;
       }
       
       if (!content) return null;

       if (orderIdx !== undefined && onMoveSection) {
         return (
           <div 
             key={sectionId} 
             className={cn("group/section relative -mx-4 px-4 py-2 rounded-xl transition-all hover:bg-slate-50/50", dragOverSection === sectionId && "bg-blue-50/50 outline-dashed outline-2 outline-blue-400")}
             draggable={draggingHandle === sectionId}
             onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                // Provide a slightly cleaner drag image or generic behavior
                e.dataTransfer.setData('text/plain', orderIdx.toString());
                setDraggedSectionIdx(orderIdx);
             }}
             onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedSectionIdx !== null && draggedSectionIdx !== orderIdx) {
                   setDragOverSection(sectionId);
                }
             }}
             onDragLeave={() => {
                setDragOverSection(null);
             }}
             onDrop={(e) => {
                e.preventDefault();
                setDragOverSection(null);
                setDraggingHandle(null);
                if (draggedSectionIdx !== null && draggedSectionIdx !== orderIdx && onReorderSection) {
                   onReorderSection(draggedSectionIdx, orderIdx);
                }
                setDraggedSectionIdx(null);
             }}
             onDragEnd={() => {
                setDraggingHandle(null);
                setDraggedSectionIdx(null);
                setDragOverSection(null);
             }}
           >
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 flex flex-col gap-1 z-20 cursor-grab active:cursor-grabbing"
                onMouseDown={() => setDraggingHandle(sectionId)}
                onMouseUp={() => setDraggingHandle(null)}
                title="Trascina per riordinare"
              >
                <div className="p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-colors flex items-center justify-center">
                    <GripVertical className="w-4 h-4" />
                </div>
              </div>
              {content}
           </div>
         );
       }

       return <div key={sectionId}>{content}</div>;
    }

    const rootStyle = { zoom: resumeStyle.textScale || 1 };

    if (isTwoColumn || isSidebar || isBoldOrganic || isEditorial) {
      return (
        <div 
          ref={ref}
          className={cn(
            "w-full max-w-[800px] h-[1131px] bg-white text-slate-900 shadow-2xl rounded-sm flex flex-col transform origin-top mx-auto relative overflow-hidden",
            resumeStyle.fontFamily
          )}
          style={rootStyle}
        >
          {isBoldOrganic && (
             <div className="w-full relative py-12 px-12 overflow-hidden shrink-0" style={{ backgroundColor: primaryColorHex }}>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-10 bottom-10 w-40 h-40 bg-black/10 rounded-full pointer-events-none"></div>
                <div className="relative z-10 text-white">
                  <h1 className="text-6xl font-black tracking-tighter mb-2">
                    {resumeData.contact?.fullName || 'Nome Cognome'}
                  </h1>
                  {resumeData.experience?.[0]?.role && (
                    <p className="font-bold text-xl opacity-90 mb-6">
                      {resumeData.experience[0].role}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium opacity-80">
                    {resumeData.contact?.email && <span>{resumeData.contact.email}</span>}
                    {resumeData.contact?.phone && <span>{resumeData.contact.phone}</span>}
                    {resumeData.contact?.location && <span>{resumeData.contact.location}</span>}
                    {resumeData.contact?.linkedin && <span>{resumeData.contact.linkedin}</span>}
                  </div>
                </div>
             </div>
          )}

          {isEditorial && (
             <div className="w-full shrink-0 px-12 pt-12 pb-6 border-b" style={{ borderColor: primaryColorHex }}>
                <div className="border-t pt-8" style={{ borderColor: primaryColorHex }}>
                  <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4 uppercase">
                    {resumeData.contact?.fullName || 'Nome Cognome'}
                  </h1>
                  {resumeData.experience?.[0]?.role && (
                    <p className="font-medium text-lg uppercase tracking-[0.2em] mb-6" style={{ color: primaryColorHex }}>
                      {resumeData.experience[0].role}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 uppercase tracking-wider">
                    {resumeData.contact?.email && <span>{resumeData.contact.email}</span>}
                    {resumeData.contact?.phone && <span>· {resumeData.contact.phone}</span>}
                    {resumeData.contact?.location && <span>· {resumeData.contact.location}</span>}
                    {resumeData.contact?.linkedin && <span>· {resumeData.contact.linkedin}</span>}
                  </div>
                </div>
             </div>
          )}

          <div className="flex flex-1 w-full">
            {/* Left Column (Main content for Bold/Editorial, Sidebar content for TwoColumn/Sidebar) */}
            <div 
               className={cn(
                 "p-8 lg:p-12 flex flex-col gap-8 shrink-0 relative", 
                 (isTwoColumn || isSidebar) ? "w-[35%]" : "w-[65%]",
                 isSidebar && "text-white",
                 isTwoColumn && "bg-slate-50 border-r border-slate-200",
                 (isBoldOrganic || isEditorial) && "border-r border-slate-100"
               )}
               style={isSidebar ? { backgroundColor: primaryColorHex } : undefined}
            >
              {(isTwoColumn || isSidebar) && (
                 <>
                    <div className="mb-4 text-center">
                      {isSidebar && (
                         <div className="w-24 h-24 mx-auto bg-black/10 rounded-full mb-4 border-2 border-white/20 flex flex-col items-center justify-center text-white/50 text-xs shadow-inner">
                            <span className="font-bold text-2xl opacity-50">{resumeData.contact?.fullName?.charAt(0) || 'U'}</span>
                         </div>
                      )}
                      <h1 className={cn("text-3xl font-bold tracking-tight leading-none mb-2", isSidebar ? "text-white" : "text-slate-900 text-left")} style={!isSidebar ? { color: primaryColorHex } : undefined}>
                        {resumeData.contact?.fullName || 'Nome Cognome'}
                      </h1>
                      {resumeData.experience?.[0]?.role && (
                        <p className={cn("font-medium text-sm", isSidebar ? "text-white/80" : "text-slate-600 text-left")}>
                          {resumeData.experience[0].role}
                        </p>
                      )}
                    </div>
                    
                    <div className={cn("text-xs flex flex-col gap-3", isSidebar ? "text-white/80" : "text-slate-600")}>
                      {resumeData.contact?.location && <span>{resumeData.contact.location}</span>}
                      {resumeData.contact?.phone && <span>{resumeData.contact.phone}</span>}
                      {resumeData.contact?.email && <span style={!isSidebar ? { color: primaryColorHex } : undefined}>{resumeData.contact.email}</span>}
                      {resumeData.contact?.linkedin && <span>{resumeData.contact.linkedin}</span>}
                    </div>

                    {resumeData.skills.length > 0 && (
                       <div className={isSidebar ? "text-white" : ""}>
                          {renderSkills()}
                       </div>
                    )}
                    {resumeData.languages && resumeData.languages.length > 0 && (
                       <div className={isSidebar ? "text-white" : ""}>
                          {renderLanguages()}
                       </div>
                    )}
                    {resumeData.education.length > 0 && (
                       <div className={isSidebar ? "text-white" : ""}>
                          {renderEducation()}
                       </div>
                    )}
                 </>
              )}

              {/* Main content left column for organic/editorial */}
              {(isBoldOrganic || isEditorial) && (
                 <>
                    {resumeStyle.sectionOrder.map((s, idx) => {
                      if (s === 'skills' || s === 'languages') return null; // rendered on right
                      return renderSection(s, idx);
                    })}
                 </>
              )}
            </div>

            {/* Right Column */}
            <div className={cn(
              "flex flex-col gap-8 p-8 lg:p-12 relative",
              (isTwoColumn || isSidebar) ? "w-[65%] pl-12 pr-12" : "w-[35%]",
              (isBoldOrganic || isEditorial) && "bg-slate-50/50"
            )}>
               {(isTwoColumn || isSidebar) ? resumeStyle.sectionOrder.map((s, idx) => {
                 if (s === 'skills' || s === 'education' || s === 'languages') return null; // rendered on left
                 return renderSection(s, idx);
               }) : resumeStyle.sectionOrder.map((s, idx) => {
                 if (s === 'skills' || s === 'languages') return renderSection(s, idx);
                 return null;
               })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn(
          "w-full max-w-[800px] h-[1131px] bg-white text-slate-900 shadow-2xl rounded-sm p-12 flex flex-col gap-6 transform origin-top mx-auto relative overflow-hidden",
          resumeStyle.fontFamily
        )}
        style={rootStyle}
      >
        {isCreative && (
           <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: primaryColorHex }}></div>
        )}

        {/* Header */}
        <div className={cn(
           "flex justify-between items-start mb-2", 
           (isModern || isElegant || isTimeline || isFluid) && "flex-col gap-4 text-center items-center justify-center"
        )}>
          <div className={cn("flex flex-col", (isModern || isElegant || isTimeline || isFluid) && "items-center")}>
            <h1 className={cn(
               "text-4xl font-bold tracking-tighter text-slate-900", 
               isElegant && "font-serif text-5xl font-medium tracking-normal",
               isFluid && "text-5xl font-extrabold tracking-tight"
            )} style={{ color: (isCreative || isElegant || isFluid) ? primaryColorHex : undefined }}>
              {resumeData.contact?.fullName || 'Nome Cognome'}
            </h1>
             {resumeData.experience?.[0]?.role && (
                <p className={cn("font-medium text-lg mt-1", isFluid && "text-xl")} style={{ color: primaryColorHex }}>
                  {resumeData.experience[0].role}
                </p>
             )}
          </div>
          <div className={cn(
             "text-xs text-slate-500 flex flex-col gap-1", 
             (isModern || isElegant || isTimeline || isFluid) ? "flex-row flex-wrap justify-center items-center gap-3 mt-2" : "text-right"
          )}>
            {resumeData.contact?.location && <span>{resumeData.contact.location}</span>}
            {resumeData.contact?.phone && <span>{resumeData.contact.phone}</span>}
            {resumeData.contact?.email && <span style={{ color: primaryColorHex }}>{resumeData.contact.email}</span>}
            {resumeData.contact?.linkedin && <span>{resumeData.contact.linkedin}</span>}
          </div>
        </div>

        <div className={cn("h-px bg-slate-200 w-full mb-2", isElegant && "h-0.5 mt-2", isFluid && "h-1 mt-2 rounded-full opacity-50")} style={(isElegant || isFluid) ? {backgroundColor: primaryColorHex} : undefined}></div>

        {/* Dynamic Sections */}
        {resumeStyle.sectionOrder.map((s, idx) => renderSection(s, idx))}

      </div>
    );
  }
);
ResumePreview.displayName = 'ResumePreview';
