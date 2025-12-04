
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, Send, CheckCircle, AlertCircle, ChefHat, Info, Minus, Plus, Utensils, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { LoadingState } from '../types.js';
import { GRAMS_PER_PERSON } from '../constants.js';
import { sendReservationToTelegram } from '../services/telegramService.js';

// Definizione dei Prodotti
const PRODUCTS = [
  {
    id: 'vicentina',
    name: 'Baccalà alla Vicentina',
    description: 'Stoccafisso di prima scelta, cotto lentamente con latte, cipolla e acciughe secondo la tradizione. Cremoso e saporito.',
    image: 'https://i.ibb.co/zWQbXvnd/Gemini-Generated-Image-zeftmpzeftmpzeft.png',
    tag: 'Il Classico'
  },
  {
    id: 'mantecato',
    name: 'Baccalà Mantecato',
    description: 'Una nuvola di sapore. Stoccafisso battuto a mano e montato con olio fino a diventare una crema soffice e delicata.',
    image: 'https://i.ibb.co/SDfLYWZJ/Gemini-Generated-Image-sleb0vsleb0vsleb.png',
    tag: 'Spalmabile'
  },
  {
    id: 'insalata',
    name: 'Baccalà in Insalata',
    description: 'Fresco e leggero. Filetti di baccalà conditi con prezzemolo, aglio e limone. Ideale come antipasto fresco.',
    image: 'https://i.ibb.co/TqPd9f9L/Gemini-Generated-Image-fbxq1ufbxq1ufbxq.png',
    tag: 'Fresco'
  }
];

export const ReservationForm = () => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  
  const [formData, setFormData] = useState({
    product: PRODUCTS[0].name,
    firstName: '',
    lastName: '',
    phone: '',
    grams: '',
    pickupDate: '',
    pickupTimeSlot: '',
    notes: ''
  });

  // Modalità di inserimento: 'people' o 'manual'
  const [mode, setMode] = useState('people');
  const [personCount, setPersonCount] = useState(2); // Default 2 persone
  const [status, setStatus] = useState(LoadingState.IDLE);

  // Stato Calendario Custom
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const calendarRef = useRef(null);

  // Inizializza la settimana corrente al lunedì
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }, []);

  // Chiudi calendario se clicco fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  // Aggiorna i grammi quando cambia il numero di persone in modalità 'people'
  useEffect(() => {
    if (mode === 'people') {
      setFormData(prev => ({
        ...prev,
        grams: personCount * GRAMS_PER_PERSON
      }));
    }
  }, [personCount, mode]);

  // Gestione cambio prodotto
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, product: product.name }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualGramChange = (e) => {
    setMode('manual');
    setFormData(prev => ({ ...prev, grams: Number(e.target.value) }));
  };

  const incrementPeople = () => setPersonCount(prev => Math.min(prev + 1, 50));
  const decrementPeople = () => setPersonCount(prev => Math.max(prev - 1, 1));

  const switchToPeopleMode = () => {
    setMode('people');
    setFormData(prev => ({ ...prev, grams: personCount * GRAMS_PER_PERSON }));
  };

  // LOGICA CALENDARIO
  const getDaysInWeek = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const handleDateSelect = (date) => {
    // Format YYYY-MM-DD for input value
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    setFormData(prev => ({ ...prev, pickupDate: formattedDate }));
    setIsCalendarOpen(false);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // LOGICA AVVISO FRESCHEZZA
  const shouldShowFreshnessWarning = () => {
    if (!formData.pickupDate) return false;
    const date = new Date(formData.pickupDate);
    const day = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mer...
    
    // Lun (1) o Mar (2)
    if (day === 1 || day === 2) return true;
    
    // Mercoledì (3) Mattina
    if (day === 3 && formData.pickupTimeSlot === 'Mattina') return true;

    return false;
  };

  const scrollToOrari = (e) => {
    e.preventDefault();
    const element = document.getElementById('orari');
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.grams || !formData.pickupDate) {
      alert("Per favore compila tutti i campi obbligatori.");
      return;
    }

    setStatus(LoadingState.LOADING);
    const success = await sendReservationToTelegram(formData);
    
    if (success) {
      setStatus(LoadingState.SUCCESS);
      setFormData({
        product: PRODUCTS[0].name,
        firstName: '',
        lastName: '',
        phone: '',
        grams: '',
        pickupDate: '',
        pickupTimeSlot: '',
        notes: ''
      });
      setPersonCount(2);
      setMode('people');
      setSelectedProduct(PRODUCTS[0]);
    } else {
      setStatus(LoadingState.ERROR);
    }
  };

  if (status === LoadingState.SUCCESS) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="bg-white border border-green-100 rounded-3xl p-12 text-center shadow-lg animate-fade-in">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-12 h-12" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-brand-900 mb-4">Prenotazione Confermata!</h2>
          <p className="text-stone-600 text-lg mb-8 max-w-lg mx-auto">
            Grazie per aver scelto il nostro baccalà. Abbiamo inviato la comanda al negozio.
            Il pagamento avverrà direttamente al ritiro.
          </p>
          <button 
            onClick={() => setStatus(LoadingState.IDLE)}
            className="bg-brand-600 text-white px-10 py-4 rounded-full font-medium hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Effettua un'altra prenotazione
          </button>
        </div>
      </div>
    );
  }

  // Filter out Sunday (0) for the calendar view
  const daysToShow = getDaysInWeek(currentWeekStart).filter(d => d.getDay() !== 0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const showWarning = shouldShowFreshnessWarning();

  return (
    <section id="prenota" className="py-8 md:py-16 px-4 bg-stone-50 scroll-mt-32">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-100 md:grid md:grid-cols-2">
          
          {/* COLONNA SINISTRA: IMMAGINE PRODOTTO E DETTAGLI */}
          <div className="relative h-[480px] md:h-auto bg-stone-200 group overflow-hidden">
            {/* Animazione dissolvenza immagine su cambio prodotto */}
            <img 
              key={selectedProduct.image}
              src={selectedProduct.image} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-brand-900/50"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedProduct.tag}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ChefHat size={12} /> Fatto in casa
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-brand-100 text-sm md:text-base opacity-90 max-w-md">
                {selectedProduct.description}
              </p>
              
              {/* Box Informativo Preparazione */}
              <div className="mt-6 p-4 bg-brand-800/60 backdrop-blur-sm rounded-xl border border-brand-700/50">
                <div className="flex items-start gap-3">
                  <Info className="text-brand-300 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-bold text-white text-sm">Quando lo cuciniamo?</h4>
                    <p className="text-brand-100 text-xs mt-1 leading-relaxed">
                      Il baccalà viene preparato fresco ogni <strong>Mercoledì sera</strong>. 
                      Lo trovi appena sfornato dal Mercoledì dopo le 19:00 in poi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNA DESTRA: FORM PRENOTAZIONE */}
          <div className="p-4 md:p-10 lg:p-12 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* HEADER DEL FORM */}
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-800">Crea il tuo ordine</h3>
                <p className="text-stone-500 text-sm mt-1">Scegli il tipo di baccalà e prenota il ritiro.</p>
              </div>

              {/* 1. SELEZIONE PRODOTTO */}
              <div>
                <label className="block text-xs font-semibold text-brand-800 mb-2 uppercase tracking-wide">
                  1. Cosa desideri?
                </label>
                {/* FORZATO A 3 COLONNE (grid-cols-3) ANCHE SU MOBILE */}
                <div className="grid grid-cols-3 gap-2">
                  {PRODUCTS.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleProductSelect(prod)}
                      className={`relative px-1 py-2 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1
                        ${selectedProduct.id === prod.id 
                          ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500 shadow-sm' 
                          : 'border-stone-100 bg-white text-stone-600 hover:border-brand-200 hover:bg-stone-50'
                        }`}
                    >
                      {/* Icona indicativa */}
                      <Utensils size={16} className={selectedProduct.id === prod.id ? 'text-brand-600' : 'text-stone-400'} />
                      {/* Rimosso 'Baccalà' dal nome visualizzato per risparmiare spazio e ridotto text size su mobile */}
                      <span className="text-[10px] sm:text-sm font-bold leading-tight px-1">
                        {prod.name.replace('Baccalà ', '')}
                      </span>
                      {selectedProduct.id === prod.id && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. SELEZIONE QUANTITÀ */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                <label className="block text-xs font-semibold text-brand-800 mb-2 uppercase tracking-wide">2. Quantità</label>
                
                {/* Toggle Mode */}
                <div className="flex bg-white rounded-lg p-1 border border-stone-200 mb-4 w-fit">
                  <button
                    type="button"
                    onClick={switchToPeopleMode}
                    className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${mode === 'people' ? 'bg-brand-100 text-brand-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Per Persone
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${mode === 'manual' ? 'bg-brand-100 text-brand-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                    Manuale (gr)
                  </button>
                </div>

                {mode === 'people' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button type="button" onClick={decrementPeople} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                        <Minus size={18} />
                      </button>
                      <div className="text-center">
                        <span className="block text-lg sm:text-xl font-bold text-stone-800 leading-none">{personCount}</span>
                        <span className="text-[10px] sm:text-xs text-stone-500 uppercase font-medium">Persone</span>
                      </div>
                      <button type="button" onClick={incrementPeople} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-600 text-white hover:bg-brand-700 flex items-center justify-center shadow-md transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg sm:text-xl font-serif font-bold text-brand-700 leading-none">
                        {personCount * GRAMS_PER_PERSON} <span className="text-sm font-sans font-normal text-stone-500">gr</span>
                      </span>
                      <span className="text-[10px] sm:text-xs text-brand-400">Stimati ({GRAMS_PER_PERSON}g/pers)</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      name="grams"
                      value={formData.grams}
                      onChange={handleManualGramChange}
                      min="50"
                      step="50"
                      className="w-full pl-4 pr-12 py-2 sm:py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg sm:text-xl font-bold text-stone-800 bg-white shadow-sm"
                      placeholder="Inserisci peso..."
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">grammi</span>
                  </div>
                )}
              </div>

              {/* 3. DATI RITIRO E CLIENTE */}
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                
                {/* SEZIONE RITIRO */}
                <div className="md:col-span-2">
                   <label className="block text-xs font-semibold text-brand-800 mb-2 uppercase tracking-wide">3. Ritiro</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* CALENDARIO CUSTOM */}
                      <div className="relative" ref={calendarRef}>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-left flex items-center text-sm sm:text-base"
                        >
                          <CalendarIcon className="absolute left-3 text-brand-400" size={18} />
                          <span className={formData.pickupDate ? 'text-stone-800' : 'text-stone-400'}>
                            {formData.pickupDate ? formatDateDisplay(formData.pickupDate) : 'Seleziona data...'}
                          </span>
                        </button>

                        {/* DROPDOWN CALENDARIO */}
                        {isCalendarOpen && (
                          <div className="absolute top-full left-0 z-20 mt-2 w-full bg-white border border-stone-200 rounded-xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                            {/* Navigazione Mese/Settimana */}
                            <div className="flex justify-between items-center mb-4">
                              <button type="button" onClick={() => changeWeek('prev')} className="p-1 hover:bg-stone-100 rounded-full">
                                <ChevronLeft size={20} className="text-stone-500"/>
                              </button>
                              <span className="text-sm font-semibold text-stone-700 capitalize">
                                {currentWeekStart.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                              </span>
                              <button type="button" onClick={() => changeWeek('next')} className="p-1 hover:bg-stone-100 rounded-full">
                                <ChevronRight size={20} className="text-stone-500"/>
                              </button>
                            </div>
                            
                            {/* Grid Giorni - 6 Colonne per Lun-Sab */}
                            <div className="grid grid-cols-6 gap-1 text-center">
                              {daysToShow.map((date, idx) => {
                                const isSelected = formData.pickupDate === date.toISOString().split('T')[0];
                                const isPast = date < today;
                                const isDisabled = isPast;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => handleDateSelect(date)}
                                    className={`
                                      flex flex-col items-center justify-center p-2 rounded-lg text-sm transition-colors
                                      ${isSelected ? 'bg-brand-600 text-white shadow-md' : ''}
                                      ${!isSelected && !isDisabled ? 'hover:bg-brand-50 text-stone-700' : ''}
                                      ${isDisabled ? 'opacity-30 cursor-not-allowed bg-stone-50' : ''}
                                    `}
                                  >
                                    <span className="text-[10px] uppercase font-bold opacity-80 mb-1">
                                      {date.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}
                                    </span>
                                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                                      {date.getDate()}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-2 text-center text-xs text-stone-400">
                              Domenica chiuso
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Time Slot */}
                      <div className="relative">
                        <select
                          name="pickupTimeSlot"
                          value={formData.pickupTimeSlot}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none text-sm sm:text-base"
                        >
                          <option value="">Fascia Oraria...</option>
                          <option value="Mattina">Mattina</option>
                          <option value="Pomeriggio">Pomeriggio</option>
                        </select>
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
                      </div>
                   </div>
                   
                   <div className="text-right mt-1.5">
                    <a href="#orari" onClick={scrollToOrari} className="text-xs text-brand-600 underline hover:text-brand-800 transition-colors">
                      Consulta gli orari di apertura
                    </a>
                   </div>

                   {/* CONSIGLIO CHEF FRESCHEZZA (BLUE) */}
                   {showWarning && (
                     <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-900 animate-in slide-in-from-top-2 shadow-sm">
                       <div className="bg-blue-100 p-1.5 rounded-full h-fit text-blue-600">
                          <ChefHat size={16} />
                       </div>
                       <div>
                         <h4 className="font-bold mb-0.5 text-xs uppercase">Il Consiglio dello Chef</h4>
                         <p className="leading-relaxed opacity-90 text-xs">
                           Il baccalà viene cucinato il <strong>Mercoledì sera</strong>. 
                           Per gustarlo appena fatto, prenota per Giovedì o Venerdì!
                         </p>
                       </div>
                     </div>
                   )}
                </div>

                {/* SEZIONE DATI CLIENTE */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wide">4. I tuoi dati</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome *"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm sm:text-base"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Cognome *"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Campo Telefono */}
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Telefono (Facoltativo)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm sm:text-base"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  </div>

                </div>
              </div>

              {/* NOTE */}
              <div>
                 <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-sm"
                    placeholder="Note aggiuntive (es. aggiungere altro alla spesa)..."
                 ></textarea>
              </div>

              {/* ERROR MESSAGE */}
              {status === LoadingState.ERROR && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} />
                  <span>Errore invio. Riprova.</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={status === LoadingState.LOADING}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                  ${status === LoadingState.LOADING 
                    ? 'bg-stone-300 cursor-not-allowed' 
                    : 'bg-brand-600 hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
              >
                {status === LoadingState.LOADING ? 'Invio in corso...' : 'Invia Prenotazione'}
                {!status && <Send size={20} />}
              </button>
              
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
