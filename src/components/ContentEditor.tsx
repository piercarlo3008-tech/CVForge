import React, { useState } from 'react';
import { ResumeData } from '../lib/types';
import { Plus, Trash2, ChevronUp, ChevronDown, User, FileText, Briefcase, GraduationCap, Code, Globe, Sparkles, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateSTARBullets } from '../lib/gemini';

interface ContentEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ContentEditor({ data, onChange }: ContentEditorProps) {
  const [isGeneratingStar, setIsGeneratingStar] = useState<string | null>(null);

  const handleGenerateSTAR = async (index: number, exp: any) => {
     if (!exp.role || !exp.description) return;
     setIsGeneratingStar(exp.id);
     const bullets = await generateSTARBullets(exp.role, exp.description);
     if (bullets && bullets.length > 0) {
        const newExp = [...data.experience];
        newExp[index].description = bullets.map(b => `• ${b}`).join('\n');
        onChange({...data, experience: newExp});
     }
     setIsGeneratingStar(null);
  };

  const moveArrayItem = (arrayName: 'experience' | 'education' | 'projects', index: number, direction: number) => {
    const newArray = [...data[arrayName]];
    if (direction === -1 && index > 0) {
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
    } else if (direction === 1 && index < newArray.length - 1) {
      [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
    } else {
      return;
    }
    onChange({ ...data, [arrayName]: newArray });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      {/* Contatti */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
           <User className="w-4 h-4 text-blue-600" />
           <h3 className="font-semibold text-sm text-slate-900">Dati Personali</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Nome Completo</label>
             <input 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" 
               placeholder="Es. Mario Rossi"
               value={data.contact.fullName}
               onChange={e => onChange({...data, contact: {...data.contact, fullName: e.target.value}})}
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Email</label>
             <input 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" 
               placeholder="Es. mario@email.com"
               value={data.contact.email}
               onChange={e => onChange({...data, contact: {...data.contact, email: e.target.value}})}
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Telefono</label>
             <input 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" 
               placeholder="Es. +39 333 1234567"
               value={data.contact.phone}
               onChange={e => onChange({...data, contact: {...data.contact, phone: e.target.value}})}
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Città</label>
             <input 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" 
               placeholder="Es. Milano, Italy"
               value={data.contact.location}
               onChange={e => onChange({...data, contact: {...data.contact, location: e.target.value}})}
             />
          </div>
          <div className="space-y-1 col-span-2">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">LinkedIn o Sito Web</label>
             <input 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" 
               placeholder="Es. linkedin.com/in/mariorossi"
               value={data.contact.linkedin}
               onChange={e => onChange({...data, contact: {...data.contact, linkedin: e.target.value}})}
             />
          </div>
        </div>
      </section>

      {/* Sommmario */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
           <FileText className="w-4 h-4 text-blue-600" />
           <h3 className="font-semibold text-sm text-slate-900">Summary Professionale</h3>
        </div>
        <textarea
           className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none custom-scrollbar placeholder-slate-400" 
           placeholder="Breve presentazione che riassume la tua figura professionale..."
           value={data.summary}
           onChange={e => onChange({...data, summary: e.target.value})}
        />
      </section>

      {/* Esperienza */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Briefcase className="w-4 h-4 text-blue-600" />
             <h3 className="font-semibold text-sm text-slate-900">Esperienza</h3>
          </div>
          <button 
             onClick={() => onChange({...data, experience: [...data.experience, { id: uuidv4(), role: '', company: '', location: '', startDate: '', endDate: '', description: '' }]})}
             className="text-xs flex items-center gap-1.5 text-blue-700 hover:bg-blue-100 font-medium bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition-colors shadow-sm"
          >
             <Plus className="w-3.5 h-3.5" /> Aggiungi
          </button>
        </div>
        
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   onClick={() => moveArrayItem('experience', index, -1)}
                   disabled={index === 0}
                   className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors hover:bg-slate-200"
                >
                   <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => moveArrayItem('experience', index, 1)}
                   disabled={index === data.experience.length - 1}
                   className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors hover:bg-slate-200"
                >
                   <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const newExp = [...data.experience];
                    newExp.splice(index, 1);
                    onChange({...data, experience: newExp});
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 pr-24">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Ruolo</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. Frontend Developer"
                     value={exp.role}
                     onChange={e => {
                       const newExp = [...data.experience];
                       newExp[index].role = e.target.value;
                       onChange({...data, experience: newExp});
                     }}
                   />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Azienda</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Azienda"
                     value={exp.company}
                     onChange={e => {
                       const newExp = [...data.experience];
                       newExp[index].company = e.target.value;
                       onChange({...data, experience: newExp});
                     }}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Inizio</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. 2020"
                     value={exp.startDate}
                     onChange={e => {
                       const newExp = [...data.experience];
                       newExp[index].startDate = e.target.value;
                       onChange({...data, experience: newExp});
                     }}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Fine</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. Presente"
                     value={exp.endDate}
                     onChange={e => {
                       const newExp = [...data.experience];
                       newExp[index].endDate = e.target.value;
                       onChange({...data, experience: newExp});
                     }}
                   />
                </div>
              </div>
              <div className="space-y-1 relative">
                 <div className="flex justify-between items-center pr-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Descrizione</label>
                   <button 
                      onClick={() => handleGenerateSTAR(index, exp)}
                      disabled={isGeneratingStar === exp.id || !exp.role || !exp.description}
                      className="text-[10px] flex items-center gap-1 text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                      title="Genera Bullet Point col metodo STAR"
                   >
                     {isGeneratingStar === exp.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                     Metodo S.T.A.R.
                   </button>
                 </div>
                 <textarea
                   className="w-full h-24 bg-white border border-slate-200 rounded-md p-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none resize-none custom-scrollbar transition-colors" 
                   placeholder="Descrivi i risultati raggiunti e le responsabilità..."
                   value={exp.description}
                   onChange={e => {
                     const newExp = [...data.experience];
                     newExp[index].description = e.target.value;
                     onChange({...data, experience: newExp});
                   }}
                 />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formazione */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <GraduationCap className="w-4 h-4 text-blue-600" />
             <h3 className="font-semibold text-sm text-slate-900">Formazione</h3>
          </div>
          <button 
             onClick={() => onChange({...data, education: [...data.education, { id: uuidv4(), degree: '', institution: '', location: '', graduationDate: '', description: '' }]})}
             className="text-xs flex items-center gap-1.5 text-blue-700 hover:bg-blue-100 font-medium bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition-colors shadow-sm"
          >
             <Plus className="w-3.5 h-3.5" /> Aggiungi
          </button>
        </div>
        
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   onClick={() => moveArrayItem('education', index, -1)}
                   disabled={index === 0}
                   className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors hover:bg-slate-200"
                >
                   <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => moveArrayItem('education', index, 1)}
                   disabled={index === data.education.length - 1}
                   className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors hover:bg-slate-200"
                >
                   <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const newEdu = [...data.education];
                    newEdu.splice(index, 1);
                    onChange({...data, education: newEdu});
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 pr-24">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Titolo</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. Laurea in Informatica"
                     value={edu.degree}
                     onChange={e => {
                       const newEdu = [...data.education];
                       newEdu[index].degree = e.target.value;
                       onChange({...data, education: newEdu});
                     }}
                   />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Istituto</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. Università degli Studi..."
                     value={edu.institution}
                     onChange={e => {
                       const newEdu = [...data.education];
                       newEdu[index].institution = e.target.value;
                       onChange({...data, education: newEdu});
                     }}
                   />
                </div>
                <div className="col-span-2 space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Anno</label>
                   <input 
                     className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Es. 2018 - 2022"
                     value={edu.graduationDate}
                     onChange={e => {
                       const newEdu = [...data.education];
                       newEdu[index].graduationDate = e.target.value;
                       onChange({...data, education: newEdu});
                     }}
                   />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
           <Code className="w-4 h-4 text-blue-600" />
           <h3 className="font-semibold text-sm text-slate-900">Competenze</h3>
        </div>
        <div className="space-y-1">
           <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Valori separati da virgola</label>
           <textarea
             className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none custom-scrollbar placeholder-slate-400" 
             placeholder="Es. React, TypeScript, Node.js..."
             value={data.skills.join(', ')}
             onChange={e => {
               const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
               onChange({...data, skills: skillsArray});
             }}
           />
        </div>
      </section>

      {/* Languages */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Globe className="w-4 h-4 text-blue-600" />
             <h3 className="font-semibold text-sm text-slate-900">Lingue</h3>
          </div>
          <button 
             onClick={() => onChange({...data, languages: [...(data.languages || []), { id: uuidv4(), name: '', level: '' }]})}
             className="text-xs flex items-center gap-1.5 text-blue-700 hover:bg-blue-100 font-medium bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition-colors shadow-sm"
          >
             <Plus className="w-3.5 h-3.5" /> Aggiungi
          </button>
        </div>
        
        <div className="space-y-3">
          {(data.languages || []).map((lang, index) => (
            <div key={lang.id} className="flex gap-2 items-center">
               <input 
                 className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                 placeholder="Lingua (es. Inglese)"
                 value={lang.name}
                 onChange={e => {
                   const newLangs = [...data.languages];
                   newLangs[index].name = e.target.value;
                   onChange({...data, languages: newLangs});
                 }}
               />
               <input 
                 className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" 
                 placeholder="Livello (es. C1)"
                 value={lang.level}
                 onChange={e => {
                   const newLangs = [...data.languages];
                   newLangs[index].level = e.target.value;
                   onChange({...data, languages: newLangs});
                 }}
               />
               <button 
                  onClick={() => {
                    const newLangs = [...data.languages];
                    newLangs.splice(index, 1);
                    onChange({...data, languages: newLangs});
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
