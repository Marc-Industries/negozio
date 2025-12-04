
import React from 'react';
import { ShoppingBasket, Phone, MapPin, ArrowRight } from 'lucide-react';
import { ReservationForm } from './components/ReservationForm.jsx';
import { InfoSection } from './components/InfoSection.jsx';
import { SHOP_NAME, MAPS_LINK, PHONE_NUMBER, WHATSAPP_NUMBER } from './constants.js';

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
              <h1 className="font-serif font-bold text-xl text-brand-900 leading-none">Market Marcon</h1>
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
              alt="Baccalà Market Marcon" 
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

export default App;
