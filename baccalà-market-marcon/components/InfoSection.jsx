
import React from 'react';
import { MapPin, Clock, History } from 'lucide-react';
import { SHOP_ADDRESS, MAPS_LINK, OPENING_HOURS } from '../constants.js';

export const InfoSection = () => {
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
