import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ShoppingBasket, Phone, MapPin, ArrowRight, 
  Calendar as CalendarIcon, Clock, Send, CheckCircle, 
  AlertCircle, ChefHat, Info, Minus, Plus, Utensils, 
  ChevronLeft, ChevronRight, History 
} from 'lucide-react';

// Import moduli JS puri (funzionano perché non contengono JSX)
import { LoadingState } from './types.js';
import { 
  GRAMS_PER_PERSON, 
  SHOP_NAME, 
  SHOP_ADDRESS, 
  MAPS_LINK, 
  PHONE_NUMBER, 
  WHATSAPP_NUMBER, 
  OPENING_HOURS 
} from './constants.js';
import { sendReservationToTelegram } from './services/telegramService.js';

// --- DEFINIZIONE PRODOTTI ---
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

// --- COMPONENTE INFO SECTION ---
const InfoSection = () => {
  return (
    <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
      
      {/* Storia */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden md:flex">
        <div className="md:w-1/2 h-64 md:h-auto relative">
           <img 
            src="https://i.ibb.co/RG662nxV/Gemini-Generated-Image-jeusrvjeusrvjeus.png" 
            alt="Storia del Baccalà - Tradizione e Cottura" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-900/10 mix-blend-multiply"></div>
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-brand-600 mb-4">
            <History size={24} />
            <h3 className="text-xl font-serif font-bold">La Nostra Tradizione</h3>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Il baccalà alla vicentina non è solo un piatto, è un rito. 
            Preparato secondo l'antica ricetta che richiede tempo, pazienza e ingredienti di prima qualità.
            Da anni selezioniamo il miglior stoccafisso, lo lavoriamo a mano e lo cuciniamo lentamente 
            per offrirvi quel sapore autentico e cremoso che sa di casa e di festa.
          </p>
        </div>
      </div>

      {/* Info Pratiche */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Orari Tabella - Aggiunto ID specifico per lo scroll */}
        <div id="orari" className="bg-white p-8 rounded-2xl shadow-sm border border-brand-200 scroll-mt-32">
          <div className="flex items-center gap-2 text-brand-600 mb-6">
            <Clock size={24} />
            <h3 className="text-xl font-serif font-bold">Orari di Apertura</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-500 uppercase bg-brand-50/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Giorno</th>
                  <th className="px-4 py-3">Mattina</th>
                  <th className="px-4 py-3 rounded-r-lg">Pomeriggio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {OPENING_HOURS.map((slot, index) => (
                  <tr key={index} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-900">{slot.day}</td>
                    <td className="px-4 py-3 text-stone-600">{slot.morning}</td>
                    <td className="px-4 py-3 text-stone-600">{slot.afternoon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dove Siamo */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-200">
          <div className="flex items-center gap-2 text-brand-600 mb-6">
            <MapPin size={24} />
            <h3 className="text-xl font-serif font-bold">Dove Ritirare</h3>
          </div>
          <p className="text-stone-600 mb-6">{SHOP_ADDRESS}</p>
          <a 
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-brand-100 text-brand-800 font-medium rounded-lg hover:bg-brand-200 transition-colors"
          >
            <MapPin size={18} className="mr-2" />
            Apri in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE RESERVATION FORM ---
const ReservationForm = () => {
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

// --- COMPONENTE PRINCIPALE APP ---
const App = () => {

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Calcola l'offset per l'header sticky (circa 100px)
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      
      {/* Header Compatto */}
      <header className="bg-white sticky top-0 z-50 border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-brand">
              <ShoppingBasket size={20} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-brand-900 leading-none">Belmarket Francesco Marcon</h1>
              <p className="text-xs text-brand-500 font-medium tracking-wider uppercase mt-0.5">Mini Market</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-stone-600 hidden md:flex">
             {/* Dove siamo -> Link esterno Maps */}
             <a 
                href={MAPS_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors"
             >
               Dove siamo
             </a>
             
             {/* Orari -> Scroll a #orari (specifico tabella) */}
             <a 
                href="#orari" 
                onClick={(e) => scrollToSection(e, 'orari')} 
                className="hover:text-brand-600 transition-colors"
             >
               Orari
             </a>

             {/* Prenota Online -> Scroll a #prenota */}
             <a 
                href="#prenota" 
                onClick={(e) => scrollToSection(e, 'prenota')}
                className="bg-brand-100 text-brand-700 px-4 py-2 rounded-full font-medium hover:bg-brand-200 transition-colors"
             >
               Prenota Online
             </a>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative bg-brand-900 text-white py-20 md:py-32 px-4 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/rCL58Mk/image.png" 
              alt="Baccalà Belmarket Francesco Marcon" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-100 text-sm font-medium tracking-wider uppercase backdrop-blur-sm animate-fade-in">
              Dal 1940
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight animate-fade-in">
              Il vero Baccalà<br/>alla Vicentina
            </h1>
            <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed opacity-90 animate-fade-in delay-100">
              Cucinato con passione secondo la ricetta tradizionale. <br className="hidden md:block"/>
              Prenota online e ritira comodamente in negozio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in delay-200">
              {/* Prenota Ora -> Scroll a #prenota */}
              <a 
                href="#prenota" 
                onClick={(e) => scrollToSection(e, 'prenota')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-full font-semibold transition-all shadow-lg shadow-brand-900/50 hover:-translate-y-1 cursor-pointer"
              >
                Prenota Ora <ArrowRight size={20} />
              </a>
              {/* Dove Siamo -> Link esterno Maps */}
              <a 
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-semibold transition-all hover:-translate-y-1"
              >
                Dove Siamo <MapPin size={20} />
              </a>
            </div>
          </div>
        </section>

        {/* Reservation Form (Acting as Product Page) */}
        <ReservationForm />
        
        {/* Info Section (Anchor ID added for navigation) */}
        <div id="info">
          <InfoSection />
        </div>

      </main>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
        aria-label="Contattaci su WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Footer Minimal */}
      <footer className="bg-white border-t border-stone-100 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-brand-800">{SHOP_NAME}</h2>
            <p className="text-stone-400 text-sm">La qualità della tradizione vicentina.</p>
          </div>
          
          <div className="flex gap-6 text-sm text-stone-500">
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-600 transition-colors">
              <MapPin size={16} /> Indicazioni
            </a>
            <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 hover:text-brand-600 transition-colors">
              <Phone size={16} /> {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- ENTRY POINT ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
