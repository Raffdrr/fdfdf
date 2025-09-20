
import React, { useState, useEffect } from 'react';
import { Locale } from '../../types'; 
import { ChevronLeft, ClipboardList, Send, AlertTriangle, Building, CalendarDays, Clock, Users, FileText, Info as InfoIconLucide, LucideProps } from 'lucide-react';

interface ProposeTableModalProps {
  onClose: () => void;
  onPropose: (tableData: { localeName: string; date: string; time: string; numPeople: number; notes: string }) => void; 
  locali: Locale[]; 
  showToast: (text: string, type?: "success" | "error" | "info", icon?: React.ReactNode) => void;
}

const ProposeTableModal: React.FC<ProposeTableModalProps> = ({ onClose, onPropose, locali, showToast }) => { 
  const [localeName, setLocaleName] = useState(locali.length > 0 ? locali[0].name : ""); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("20:00");
  const [numPeople, setNumPeople] = useState("2");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localeName || !date || !time || !numPeople) { 
      showToast("Compila tutti i campi obbligatori (*).", "error", <AlertTriangle size={18}/>);
      return;
    }
    const numPeopleInt = parseInt(numPeople);
    if (isNaN(numPeopleInt) || numPeopleInt <=0) {
        showToast("Inserisci un numero di persone valido.", "error", <AlertTriangle size={18}/>);
        return;
    }
    onPropose({ localeName, date, time, numPeople: numPeopleInt, notes }); 
  };
  
  const FormField: React.FC<{label: string, icon?: React.ReactElement<LucideProps>, children: React.ReactNode, htmlFor?: string, required?: boolean}> = ({label, icon, children, htmlFor, required}) => (
    <div>
        <label htmlFor={htmlFor} className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
            {icon && React.cloneElement(icon, { size: 16, className: "mr-2 text-slate-500"})}
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white shadow-md p-3 sm:p-4 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600" aria-label="Indietro">
          <ChevronLeft size={26} />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList size={22} className="text-sky-500" />Proponi un Tavolo
        </h2>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 no-scrollbar">
          <FormField label="Nome Locale" icon={<Building />} htmlFor="localeName" required>
            <select id="localeName" value={localeName} onChange={e => setLocaleName(e.target.value)} required className="form-input bg-white"> 
              {locali.map(l => <option key={l.id} value={l.name}>{l.name}</option>)} 
              <option value="Altro">Altro (specifica nelle note)</option>
            </select>
          </FormField>
          
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            <FormField label="Data" icon={<CalendarDays />} htmlFor="tableDate" required>
                <input type="date" id="tableDate" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} required className="form-input" />
            </FormField>
            <FormField label="Ora" icon={<Clock />} htmlFor="tableTime" required>
                <input type="time" id="tableTime" value={time} onChange={e => setTime(e.target.value)} required className="form-input" />
            </FormField>
          </div>
          
          <FormField label="Numero Persone" icon={<Users />} htmlFor="numPeople" required>
            <input type="number" id="numPeople" value={numPeople} min="1" onChange={e => setNumPeople(e.target.value)} required className="form-input" />
          </FormField>
          
          <FormField label="Note (opzionale)" icon={<FileText />} htmlFor="tableNotes">
            <textarea id="tableNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Es. Preferenze tavolo, allergie, nome per 'Altro' locale..." className="form-input leading-relaxed"></textarea>
          </FormField>
          
          <div className="mt-3 sm:mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-700 flex items-start gap-2 shadow-sm">
            <InfoIconLucide size={20} className="flex-shrink-0 mt-0.5 text-sky-500" />
            <span>Questa funzionalità simula una proposta di tavolo. Nella versione reale, contatteremmo il locale o useremmo un sistema di prenotazione integrato.</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white/90 backdrop-blur-sm sticky bottom-0 z-10 flex-shrink-0">
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
            <Send size={20}/> Invia Proposta
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposeTableModal;
