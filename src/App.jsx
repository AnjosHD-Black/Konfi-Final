import React, { useState, useMemo } from 'react';
import { Palette, Car, Trello, Aperture, User, Users, Command, Monitor, Smartphone, Briefcase, ChevronRight } from 'lucide-react'; 

// --- 0. Basisdaten (Preise entfernt für minimalistisches UI) ---

// --- 1. Definierte Optionen (ohne Preise) ---

const USAGE_OPTIONS = [
    { id: 'usage-private', name: 'Privatfahrzeug', icon: User },
    { id: 'usage-authority', name: 'Behördenfahrzeug', icon: Users },
];

const EXTERIOR_OPTIONS = [
  { id: 'ext-black', name: 'Tiefschwarz Uni', colorCode: '#1c1c1c' },
  { id: 'ext-white', name: 'Alpinweiß', colorCode: '#f0f0f0' },
  { id: 'ext-blue', name: 'Phytonic Blau Metallic', colorCode: '#002e6e' },
  { id: 'ext-green', name: 'Signal Gelb Uni', colorCode: '#FFD700' }, // Jetzt Gelb
];

const INTERIOR_OPTIONS = [
  { id: 'int-mokka', name: 'Mokka-Leder', colorCode: '#6f4e37' },
  { id: 'int-beige', name: 'Beige Sensatec', colorCode: '#e6ccb3' },
  { id: 'int-black', name: 'Schwarz Alcantara', colorCode: '#000000' },
];

const WHEEL_OPTIONS = [
    { id: 'wheel-a', name: '19-Zoll Doppelspeiche', imageUrl: 'https://i.imgur.com/wRqvtwP.png' },
    { id: 'wheel-b', name: '20-Zoll M Bicolor', imageUrl: 'https://i.imgur.com/ZPTkYpb.png' },
];

// NEUE OPTION: Zierleisten
const TRIM_OPTIONS = [
    { id: 'trim-shadow', name: 'Shadow Line Hochglanz', icon: Command },
    { id: 'trim-chrome', name: 'Chromlinie Hochglanz', icon: Monitor },
];

// --- BILDER FÜR GROSSE INNENRAUM-ANSICHT (z.B. Cockpit) ---
const INTERIOR_PREVIEW_IMAGES = {
    // Diese Bilder erscheinen in der GROSSEN INNANSICHT.
    'int-mokka': 'https://i.imgur.com/wEac2ki.png', 
    'int-beige': 'https://i.imgur.com/HgzTvCu.png', 
    'int-black': 'https://i.imgur.com/h7LkB0H.png', 
};

// --- BILDER FÜR TEXTUR-VORSCHAU IN BUTTONS (Kleine Textur-Kacheln) ---
const INTERIOR_TEXTURE_IMAGES = {
    // Diese Bilder erscheinen in den KLEINEN AUSWAHL-BUTTONS.
    'int-mokka': 'https://i.imgur.com/RVpAoPF.png', 
    'int-beige': 'https://i.imgur.com/edqvrJu.png', 
    'int-black': 'https://i.imgur.com/eDVkOTN.png', 
};

// --- 2. BILD-ZUORDNUNG FÜR GROSSES HAUPTBILD (Ext + Int + Wheel) ---
// Der Schlüssel ist: 'ext-ID_int-ID_wheel-ID'
const COMBINATION_IMAGES = {};

// Generator für Platzhalter und Integration der vorhandenen Bilder
const ALL_EXTERIOR_OPTIONS = EXTERIOR_OPTIONS.map(opt => opt.id);
const ALL_INTERIOR_OPTIONS = INTERIOR_OPTIONS.map(opt => opt.id);
const ALL_WHEEL_OPTIONS = WHEEL_OPTIONS.map(opt => opt.id);

ALL_EXTERIOR_OPTIONS.forEach(extId => {
    ALL_INTERIOR_OPTIONS.forEach(intId => {
        
        const oldKey = `${extId}_${intId}`;
        let baseImageUrl = '';
        
        // 1. Zuerst die hochgeladenen Bilder anhand des EXT/INT-Schlüssels zuweisen
        if (oldKey === 'ext-black_int-black') baseImageUrl = 'https://i.imgur.com/KmelzwG.png'; 
        else if (oldKey === 'ext-black_int-mokka') baseImageUrl = 'https://i.imgur.com/ZOC3Qaq.png';
        else if (oldKey === 'ext-black_int-beige') baseImageUrl = 'https://i.imgur.com/h8654lq.png';
        else if (extId === 'ext-white') baseImageUrl = 'https://i.imgur.com/AJUSK3k.png';
        else if (extId === 'ext-blue') baseImageUrl = 'https://i.imgur.com/yhyQl5e.png';
        else if (extId === 'ext-green') baseImageUrl = 'https://i.imgur.com/I2PUV3C.png';
        else {
            // Fallback für nicht abgedeckte Kombinationen
            const extName = EXTERIOR_OPTIONS.find(opt => opt.id === extId)?.name.toUpperCase() || 'EXT';
            const intName = INTERIOR_OPTIONS.find(opt => opt.id === intId)?.name.toUpperCase() || 'INT';
            baseImageUrl = `https://placehold.co/800x450/4f46e5/ffffff?text=${extName}+|+${intName}`;
        }

        // 2. Dieses Bild nun ALLEN Felgen-Optionen zuweisen (da wir beschlossen haben, dass beide Felgen das gleiche Bild verwenden)
        ALL_WHEEL_OPTIONS.forEach(wheelId => { 
            const key = `${extId}_${intId}_${wheelId}`;
            
            let finalImageUrl = baseImageUrl;
            if (baseImageUrl.includes('placehold.co')) {
                 const wheelName = WHEEL_OPTIONS.find(opt => opt.id === wheelId)?.name.toUpperCase() || 'FELGE';
                 finalImageUrl += ` | ${wheelName.replace(/ /g, '+')}`;
            }

            COMBINATION_IMAGES[key] = finalImageUrl;
        });
    });
});


// Komponente für die großen Bildkarten
const LargeImageCard = ({ title, imageUrl, compactTitle }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
        {/* Korrigierte, vereinfachte Titeldarstellung */}
        <h2 className="text-sm font-semibold p-3 text-gray-800 border-b border-gray-100 flex justify-between items-center">
            {title} <span className="text-xs font-normal text-gray-500">{compactTitle}</span>
        </h2>
        <img
            src={imageUrl}
            alt={title}
            // object-contain, um sicherzustellen, dass nichts abgeschnitten wird
            className="w-full h-auto object-contain transition duration-500 ease-in-out filter-none" 
            style={{ minHeight: '180px' }} 
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/800x450/cccccc/000000?text=Bild+nicht+gefunden';
            }}
        />
    </div>
);

// Detail-Ansicht im minimalistischen Stil
const ConfiguratorDetails = ({ config }) => {
    // Einfache Liste der gewählten Optionen
    const options = [
        { name: 'Nutzungsart', value: config.usage.name, icon: config.usage.icon },
        { name: 'Lackierung', value: config.exterior.name, colorCode: config.exterior.colorCode, icon: Car },
        { name: 'Interieur', value: config.interior.name, colorCode: config.interior.colorCode, icon: Trello },
        { name: 'Felgen', value: config.wheel.name, icon: Aperture },
        { name: 'Zierleisten', value: config.trim.name, icon: config.trim.icon },
    ];
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ChevronRight className="w-5 h-5 mr-1 text-blue-600" /> Ihre Zusammenfassung
            </h1>
            
            <ul className="space-y-3">
                {options.map((opt) => (
                    // Korrektur: Die Listenelemente sind jetzt "flex" und stabil
                    <li key={opt.name} className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center space-x-2 text-gray-700">
                            {opt.icon && <opt.icon className="text-gray-400" size={18} />}
                            <span className="font-semibold">{opt.name}:</span>
                        </div>
                        <span className="flex items-center space-x-2">
                            {opt.colorCode && (
                                <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: opt.colorCode }}></span>
                            )}
                            <span className="font-medium text-gray-800">{opt.value}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Funktion für einen Konfigurations-Button (minimalistischer Stil)
const OptionButton = ({ option, isSelected, onClick, Icon, previewUrl }) => {
  if (!option) return null;

  const isWheel = option.id.startsWith('wheel-');
  const isInterior = option.id.startsWith('int-');
  const isImageButton = isWheel || isInterior; // NEUE PRÜFUNG

  const getPreviewContent = () => {
    // Felgen- und Interieur-Vorschau
    if (isImageButton) {
        const url = isWheel ? option.imageUrl : previewUrl;
        const altText = isWheel ? option.name : `${option.name} Textur`;
        
        return (
            // Flexbox, um Bild und Text in der Zelle auszurichten
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-full h-full rounded-md overflow-hidden">
                    <img 
                        src={url} 
                        alt={altText} 
                        // Filter-Fix und object-cover, um den Container komplett zu füllen
                        className="w-full h-full object-cover filter-none" 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x75/dddddd/000000?text=Vorschau'; }}
                    />
                </div>
                {/* Kleine Farbanzeige im Eck des Interieur-Bildes */}
                {isInterior && (
                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 ${isSelected ? 'border-white' : 'border-gray-200'} shadow-md`} 
                        style={{ backgroundColor: option.colorCode }}>
                    </div>
                )}
            </div>
        );
    }
    
    // Für Außenfarben (einfache Farb-Swatches)
    if (option.colorCode) {
        return (
            <div className="flex items-center justify-center h-full">
                <div 
                    className="w-7 h-7 rounded-full border-4" 
                    style={{ backgroundColor: option.colorCode, borderColor: isSelected ? 'white' : '#6b7280' }}
                ></div>
            </div>
        );
    }

    // Für Nutzungsart und Zierleisten (Icons)
    return (
        <div className="flex items-center justify-center h-full">
            {Icon && <Icon size={20} />}
        </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col rounded-xl transition duration-200 w-full text-center border-2 
        ${isSelected
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 border-blue-600 transform scale-[1.03]'
          : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
        }
        ${isImageButton ? 'p-1 aspect-square' : 'p-3 aspect-auto'} 
      `}
    >
      {/* Container für das Vorschau-Element */}
      <div className={`w-full ${isImageButton ? 'h-20 mb-1' : 'h-10'} flex items-center justify-center`}> 
          {getPreviewContent()}
      </div>

      <span className={`text-xs font-medium truncate w-full mt-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
        {option.name}
      </span>
    </button>
  );
};


export default function App() {
  const [selectedUsageId, setSelectedUsageId] = useState(USAGE_OPTIONS[0].id);
  const [selectedExteriorId, setSelectedExteriorId] = useState(EXTERIOR_OPTIONS[0].id);
  const [selectedInteriorId, setSelectedInteriorId] = useState(INTERIOR_OPTIONS[0].id);
  const [selectedWheelId, setSelectedWheelId] = useState(WHEEL_OPTIONS[0].id);
  const [selectedTrimId, setSelectedTrimId] = useState(TRIM_OPTIONS[0].id); // NEU: Trim State

  
  const currentConfig = useMemo(() => {
    const selectedUsage = USAGE_OPTIONS.find(opt => opt.id === selectedUsageId) || USAGE_OPTIONS[0];
    const selectedExterior = EXTERIOR_OPTIONS.find(opt => opt.id === selectedExteriorId) || EXTERIOR_OPTIONS[0];
    const selectedInterior = INTERIOR_OPTIONS.find(opt => opt.id === selectedInteriorId) || INTERIOR_OPTIONS[0];
    const selectedWheel = WHEEL_OPTIONS.find(opt => opt.id === selectedWheelId) || WHEEL_OPTIONS[0];
    const selectedTrim = TRIM_OPTIONS.find(opt => opt.id === selectedTrimId) || TRIM_OPTIONS[0]; // NEU: Trim Config

    const combinationKey = `${selectedExterior.id}_${selectedInterior.id}_${selectedWheel.id}`;
    const imageUrl = COMBINATION_IMAGES[combinationKey] || COMBINATION_IMAGES[`${EXTERIOR_OPTIONS[0].id}_${INTERIOR_OPTIONS[0].id}_${WHEEL_OPTIONS[0].id}`];
    
    const interiorPreviewUrl = INTERIOR_PREVIEW_IMAGES[selectedInterior.id] || INTERIOR_PREVIEW_IMAGES[INTERIOR_OPTIONS[0].id];
    

    return {
        name: `${selectedExterior.name} / ${selectedInterior.name} / ${selectedWheel.name}`,
        usage: selectedUsage,
        exterior: selectedExterior,
        interior: selectedInterior,
        wheel: selectedWheel,
        trim: selectedTrim, // NEU: Trim
        imageUrl: imageUrl, // Außenansicht
        interiorPreviewUrl: interiorPreviewUrl, // Innenansicht
    };
  }, [selectedUsageId, selectedExteriorId, selectedInteriorId, selectedWheelId, selectedTrimId]);


  return (
    <div className={`min-h-screen font-sans antialiased bg-gray-100`}> 
        <div className="max-w-7xl mx-auto lg:p-6 p-4"> 
            
            {/* Header (Nur für Mobile sichtbar) */}
            <header className="py-4 mb-6 border-b border-gray-200 lg:hidden">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Fahrzeug-Konfigurator
                </h1>
                <p className="mt-1 text-base text-gray-500">
                    Stellen Sie Ihr individuelles Modell zusammen.
                </p>
            </header>

            {/* --- HAUPT-LAYOUT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* === SPALTE 1: BILDER UND ZUSAMMENFASSUNG (Sticky auf Desktop) === */}
                <div className="lg:col-span-5 relative">
                    <div className="lg:sticky lg:top-6">
                        {/* Desktop-Header (Nur für Desktop sichtbar) */}
                        <header className="pb-6 mb-4 hidden lg:block">
                            <h1 className="text-4xl font-extrabold text-gray-900">
                                BMW Konfigurator
                            </h1>
                            <p className="mt-1 text-lg text-gray-500">
                                Stellen Sie Ihr individuelles Modell zusammen.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8">
                            {/* Außenansicht (Links) */}
                            <LargeImageCard 
                                title={`Außenansicht`}
                                compactTitle={currentConfig.exterior.name}
                                imageUrl={currentConfig.imageUrl}
                            />
                            {/* Innenansicht (Rechts) */}
                            <LargeImageCard 
                                title={`Innenraum`}
                                compactTitle={currentConfig.interior.name}
                                imageUrl={currentConfig.interiorPreviewUrl}
                            />
                        </div>

                        {/* --- Konfigurator-Details (Zusammenfassung) --- */}
                        <ConfiguratorDetails config={currentConfig} />
                    </div>
                </div>

                {/* === SPALTE 2: AUSWAHL-OPTIONEN (Scrollbar) === */}
                <div className="lg:col-span-7 space-y-8 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                    
                    {/* Nutzungsart-Auswahl */}
                    <section className="border-b pb-6 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Users className="mr-2 text-blue-500" size={20} /> 1. Nutzungsart
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {USAGE_OPTIONS.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === selectedUsageId}
                                onClick={() => setSelectedUsageId(option.id)}
                                Icon={option.icon}
                            />
                            ))}
                        </div>
                    </section>
                
                    
                    {/* Außenfarben-Auswahl */}
                    <section className="border-b pb-6 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Car className="mr-2 text-blue-500" size={20} /> 2. Lackierung
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {EXTERIOR_OPTIONS.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === selectedExteriorId}
                                onClick={() => setSelectedExteriorId(option.id)}
                                Icon={Palette}
                            />
                            ))}
                        </div>
                    </section>
                    
                    {/* Innenraum-Auswahl */}
                    <section className="border-b pb-6 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Trello className="mr-2 text-blue-500" size={20} /> 3. Interieur
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {INTERIOR_OPTIONS.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === selectedInteriorId}
                                onClick={() => setSelectedInteriorId(option.id)}
                                Icon={Trello}
                                previewUrl={INTERIOR_TEXTURE_IMAGES[option.id]}
                            />
                            ))}
                        </div>
                    </section>

                    {/* Felgen-Auswahl */}
                    <section className="border-b pb-6 border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Aperture className="mr-2 text-blue-500" size={20} /> 4. Felgen
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {WHEEL_OPTIONS.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === selectedWheelId}
                                onClick={() => setSelectedWheelId(option.id)}
                                Icon={Aperture}
                            />
                            ))}
                        </div>
                    </section>
                    
                    {/* Zierleisten-Auswahl */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Briefcase className="mr-2 text-blue-500" size={20} /> 5. Zierleisten
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {TRIM_OPTIONS.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === selectedTrimId}
                                onClick={() => setSelectedTrimId(option.id)}
                                Icon={option.icon}
                            />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            
            <div className="mt-12 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 max-w-4xl mx-auto lg:mx-0">
                **Hinweis:** Ihre App ist jetzt live auf Netlify veröffentlicht. Jede Änderung, die Sie committen und pushen, wird automatisch aktualisiert!
            </div>
        </div>
    </div>
  );
}
