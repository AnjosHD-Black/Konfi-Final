import React, { useState, useMemo, useCallback } from 'react';
// Icon-Importe für die Darstellung in den Optionen
import { Palette, Key, Trello, Zap, Gauge, Box, Truck, Check, X } from 'lucide-react'; 

// --- 0. Konfiguration der Icons und Farben ---
// Eine Map von Option-IDs zu den zugehörigen Lucide Icons
const ICON_MAP = {
  'ext': Palette,
  'int': Trello,
  'wheel': Gauge,
  'trim': Box,
  'usage': Truck
};

// --- Modale Komponente für Vollbildansicht ---
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        // Overlay (Klicken auf den Hintergrund schließt das Modal)
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="relative bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-full overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Verhindert, dass Klick im Bild das Modal schließt
            >
                {/* Schließen Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-900/50 hover:bg-gray-900 text-white rounded-full transition z-50"
                    aria-label="Schließen"
                >
                    <X size={24} />
                </button>

                {/* Bild */}
                <img
                    src={imageUrl}
                    alt="Vergrößerte Ansicht"
                    className="w-full h-auto object-contain max-h-[90vh] filter-none"
                    onError={(e) => { e.target.src = 'https://placehold.co/800x450/cccccc/000000?text=Fehler'; }}
                />
            </div>
        </div>
    );
};


// Generische Komponente für die große Bildanzeige (Außen- und Innenansicht)
const LargeImageCard = ({ category, optionName, imageUrl, onClick }) => {
  const Icon = ICON_MAP[category];
  const title = category === 'exterior' ? 'Außenansicht' : 'Innenraum';

  return (
    <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-fit cursor-pointer transition hover:shadow-2xl"
        onClick={onClick} // Klick öffnet das Modal
    >
      <div className="relative">
        {/* Das Bild selbst - object-contain stellt sicher, dass nichts abgeschnitten wird */}
        <img
          src={imageUrl}
          alt={`Ansicht: ${optionName}`}
          className="w-full h-auto object-contain bg-gray-50 dark:bg-gray-900"
          style={{ minHeight: category === 'exterior' ? '250px' : '200px' }} // Mindesthöhe für bessere Stabilität
          onError={(e) => {
            e.target.onerror = null;
            // Fallback, wenn das Bild nicht geladen werden kann
            e.target.src = 'https://placehold.co/800x450/cccccc/000000?text=Fehler%3A+Bild+fehlt';
          }}
        />
      </div>
      
      {/* Detail-Anzeige nur für die Überschrift (minimalistisch) */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
          {Icon && <Icon size={20} className="mr-2 text-blue-600 dark:text-blue-400" />}
          {title} | {optionName}
        </div>
        <p className="mt-1 text-xs text-gray-500">Zum Vergrößern klicken</p>
      </div>
    </div>
  );
};

// Komponente für die Detail-Zusammenfassung und Statusanzeige
const ConfiguratorDetails = ({ config }) => {
  const { usage, exterior, interior, wheel, trim } = config;

  // Hilfsfunktion zur Darstellung eines Details
  const DetailItem = ({ icon, label, value }) => {
    const IconComponent = icon;
    return (
      <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <IconComponent size={18} className="mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="font-medium">{label}:</span>
        </div>
        <span className="text-gray-900 dark:text-gray-100 font-semibold text-right flex-shrink-0 ml-4">
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-blue-500/50">
        Ihre Zusammenfassung
      </h2>
      
      <div className="space-y-1">
        <DetailItem icon={Truck} label="Nutzungsart" value={usage.name} />
        <DetailItem icon={Palette} label="Lackierung" value={exterior.name} />
        <DetailItem icon={Trello} label="Interieur" value={interior.name} />
        <DetailItem icon={Gauge} label="Felgen" value={wheel.name} />
        <DetailItem icon={Box} label="Zierleisten" value={trim.name} />
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
        <Zap size={16} className="inline mr-2" /> Für eine optimale Darstellung auf iPhone/iPad optimiert.
      </div>
    </div>
  );
};

// Generischer Button für alle Auswahl-Optionen
const OptionButton = ({ option, isSelected, onClick, category }) => {
  const isImageOption = category === 'int' || category === 'wheel';
  const isColorSwatch = category === 'ext';

  // --- Spezielles Styling für Farbfelder (wie im Original-BMW-Konfigurator) ---
  if (isColorSwatch) {
    return (
      <button
        onClick={onClick}
        className={`
          flex flex-col items-center justify-center rounded-full w-12 h-12 relative transition duration-200 
          ${isSelected
            ? 'border-4 border-blue-600 ring-2 ring-white shadow-lg'
            : 'border-2 border-gray-300 hover:border-blue-300'
          }
        `}
      >
        <div 
          className="w-full h-full rounded-full" 
          style={{ backgroundColor: option.colorCode }}
        ></div>
        {isSelected && (
          // Das Check-Icon wird nur angezeigt, wenn die Option ausgewählt ist
          <Check className="absolute text-white" size={16} style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
        )}
      </button>
    );
  }

  // --- Styling für Standard-Kacheln (Interieur, Felgen, Zierleisten, Nutzung) ---
  const Icon = ICON_MAP[category];
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center rounded-xl transition duration-200 w-full text-center p-3 border 
        ${isSelected
          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
        }
      `}
    >
      {/* 1. Bild/Icon-Vorschau */}
      <div className={`relative w-full overflow-hidden ${isImageOption ? 'h-20' : 'h-8'} rounded-lg mb-1 flex items-center justify-center`}>
        {isImageOption ? (
          // Bild-Option (Interieur-Textur / Felgenbild)
          <img
            src={option.previewUrl}
            alt={option.name}
            className="w-full h-full object-cover filter-none"
            onError={(e) => { e.target.src = 'https://placehold.co/100x100/aaaaaa/000000?text=TEXTUR'; }}
          />
        ) : (
          // Icon-Option (Nutzung / Zierleisten)
          <Icon size={24} className={isSelected ? 'text-white' : 'text-gray-500'} />
        )}
      </div>

      {/* 2. Name */}
      <span className={`text-xs font-semibold truncate w-full mt-2 ${isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{option.name}</span>
    </button>
  );
};


// --- DATENSTRUKTUREN ---
// **********************************************

// --- 1. NUTZUNGSART ---
const USAGE_OPTIONS = [
  { id: 'usage-private', name: 'Privatfahrzeug', icon: Key },
  { id: 'usage-authority', name: 'Behördenfahrzeug', icon: Zap },
];

// --- 2. LACKIERUNG ---
const EXTERIOR_OPTIONS = [
  { id: 'ext-black', name: 'Tiefschwarz Uni', colorCode: '#1c1c1c' },
  { id: 'ext-white', name: 'Alpinweiß', colorCode: '#f0f0f0' },
  { id: 'ext-blue', name: 'Phytonic Blau Metallic', colorCode: '#002e6e' },
  { id: 'ext-yellow', name: 'Signal Gelb Uni', colorCode: '#FFD700' },
];

// --- 3. INTERIEUR ---
const INTERIOR_OPTIONS = [
  { id: 'int-mokka', name: 'Mokka-Leder', colorCode: '#6f4e37' },
  { id: 'int-beige', name: 'Beige Sensatec', colorCode: '#e6ccb3' },
  { id: 'int-black', name: 'Schwarz Alcantara', colorCode: '#000000' },
];

const INTERIOR_TEXTURE_IMAGES = {
  'int-mokka': 'https://i.imgur.com/RVpAoPF.png', // Mokka Textur
  'int-beige': 'https://i.imgur.com/edqvrJu.png', // Beige Textur
  'int-black': 'https://i.imgur.com/eDVkOTN.png', // Schwarz Textur
};

const INTERIOR_PREVIEW_IMAGES = {
  'int-mokka': 'https://i.imgur.com/wEac2ki.png', // Mokka Innenansicht
  'int-beige': 'https://i.imgur.com/HgzTvCu.png', // Beige Innenansicht
  'int-black': 'https://i.imgur.com/h7LkB0H.png', // Schwarz Innenansicht
};

// --- 4. FELGEN ---
const WHEEL_OPTIONS = [
  { id: 'wheel-a', name: '19-Zoll Doppelspeiche', previewUrl: 'https://i.imgur.com/wRqvtwP.png' },
  { id: 'wheel-b', name: '20-Zoll M Bicolor', previewUrl: 'https://i.imgur.com/ZPTkYpb.png' },
];

// --- 5. ZIERLEISTEN ---
const TRIM_OPTIONS = [
  { id: 'trim-shadow', name: 'Shadow Line Hochglanz', icon: Box },
  { id: 'trim-chrome', name: 'Chromlinie Exterieur', icon: Box },
];


// --- BILD-ZUORDNUNG (AUSSENANSICHT) ---
const COMBINATION_IMAGES = {
    // SCHWARZ AUSSEN
    'ext-black_int-mokka': 'https://i.imgur.com/KmelzwG.png',
    'ext-black_int-beige': 'https://i.imgur.com/KmelzwG.png',
    'ext-black_int-black': 'https://i.imgur.com/KmelzwG.png', 

    // WEISS AUSSEN
    'ext-white_int-mokka': 'https://i.imgur.com/AJUSK3k.png',
    'ext-white_int-beige': 'https://i.imgur.com/AJUSK3k.png',
    'ext-white_int-black': 'https://i.imgur.com/AJUSK3k.png',

    // BLAU AUSSEN
    'ext-blue_int-mokka': 'https://i.imgur.com/yhyQl5e.png',
    'ext-blue_int-beige': 'https://i.imgur.com/yhyQl5e.png',
    'ext-blue_int-black': 'https://i.imgur.com/yhyQl5e.png',

    // GELB AUSSEN
    'ext-yellow_int-mokka': 'https://i.imgur.com/I2PUV3C.png',
    'ext-yellow_int-beige': 'https://i.imgur.com/I2PUV3C.png',
    'ext-yellow_int-black': 'https://i.imgur.com/I2PUV3C.png',
};
// **********************************************


export default function App() {
  // --- STATES ---
  const [selectedUsageId, setSelectedUsageId] = useState(USAGE_OPTIONS[0].id);
  const [selectedExteriorId, setSelectedExteriorId] = useState(EXTERIOR_OPTIONS[0].id);
  const [selectedInteriorId, setSelectedInteriorId] = useState(INTERIOR_OPTIONS[0].id);
  const [selectedWheelId, setSelectedWheelId] = useState(WHEEL_OPTIONS[0].id);
  const [selectedTrimId, setSelectedTrimId] = useState(TRIM_OPTIONS[0].id);
  const [modalImageUrl, setModalImageUrl] = useState(null); // State für Modal


  // --- BERECHNETE KONFIGURATION ---
  const currentConfig = useMemo(() => {
    // Ausgewählte Optionen finden
    const selectedUsage = USAGE_OPTIONS.find(opt => opt.id === selectedUsageId);
    const selectedExterior = EXTERIOR_OPTIONS.find(opt => opt.id === selectedExteriorId);
    const selectedInterior = INTERIOR_OPTIONS.find(opt => opt.id === selectedInteriorId);
    const selectedWheel = WHEEL_OPTIONS.find(opt => opt.id === selectedWheelId);
    const selectedTrim = TRIM_OPTIONS.find(opt => opt.id === selectedTrimId);

    // Bild-Key erstellen (Ignoriert Rad und Zierleiste, da die Hauptbilder nur von Exterieur/Interieur abhängen)
    const exteriorKey = `${selectedExterior.id}_${selectedInterior.id}`;
    
    // Fallback, wenn der Schlüssel nicht gefunden wird
    const exteriorImageUrl = COMBINATION_IMAGES[exteriorKey] || 'https://placehold.co/800x450/cccccc/000000?text=Bild+fehlt'; 
    const interiorImageUrl = INTERIOR_PREVIEW_IMAGES[selectedInterior.id] || 'https://placehold.co/800x450/cccccc/000000?text=Innenansicht+fehlt';

    return {
      usage: selectedUsage,
      exterior: selectedExterior,
      interior: selectedInterior,
      wheel: selectedWheel,
      trim: selectedTrim,
      exteriorImageUrl: exteriorImageUrl,
      interiorImageUrl: interiorImageUrl,
    };
  }, [selectedUsageId, selectedExteriorId, selectedInteriorId, selectedWheelId, selectedTrimId]);

  // Handler zum Öffnen des Modals
  const openModal = useCallback((url) => {
    setModalImageUrl(url);
  }, []);

  // Handler zum Schließen des Modals
  const closeModal = useCallback(() => {
    setModalImageUrl(null);
  }, []);


  // --- UI RENDERING ---
  return (
    // Hauptcontainer für die App (Light Mode)
    <div className="min-h-screen bg-gray-100 font-sans antialiased flex justify-center">
      <div className="w-full max-w-7xl pt-8 pb-12 px-4 md:px-6">

        {/* Header und Titel */}
        <header className="py-4 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            BMW Konfigurator
          </h1>
          <p className="mt-2 text-md text-gray-500">
            Stellen Sie Ihr individuelles Modell zusammen.
          </p>
        </header>

        {/* HAUPT-LAYOUT: Bilder (Links) vs. Optionen (Rechts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LINKES FELD: Bilder und Zusammenfassung (Sticky auf großen Screens) */}
          <div className="lg:col-span-7 space-y-10 lg:sticky lg:top-8 lg:h-fit">
            
            {/* 1. Außenansicht (Dominantes Bild) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <LargeImageCard 
                    category="exterior"
                    optionName={currentConfig.exterior.name}
                    imageUrl={currentConfig.exteriorImageUrl}
                    onClick={() => openModal(currentConfig.exteriorImageUrl)} // Klick-Handler
                />
            </div>

            {/* 2. Innenansicht (Kleine Vorschau unten links, um Platz zu sparen) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <LargeImageCard 
                    category="int"
                    optionName={currentConfig.interior.name}
                    imageUrl={currentConfig.interiorImageUrl}
                    onClick={() => openModal(currentConfig.interiorImageUrl)} // Klick-Handler
                />
              </div>
              <div className="md:col-span-1">
                {/* 3. Detail-Zusammenfassung (Liste der gewählten Optionen) */}
                <ConfiguratorDetails config={currentConfig} />
              </div>
            </div>


          </div>

          
          {/* RECHTES FELD: Auswahl-Optionen (Scrollbar) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Sektion: 1. Nutzungsart */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Truck size={18} className="mr-3 text-blue-600" /> 1. Nutzungsart
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {USAGE_OPTIONS.map(option => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={option.id === selectedUsageId}
                    onClick={() => setSelectedUsageId(option.id)}
                    Icon={option.icon}
                    category="usage"
                  />
                ))}
              </div>
            </section>
            
            {/* Sektion: 2. Lackierung (Runde Swatches) */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Palette size={18} className="mr-3 text-blue-600" /> 2. Lackierung
              </h2>
              <div className="flex flex-wrap gap-4">
                {EXTERIOR_OPTIONS.map(option => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={option.id === selectedExteriorId}
                    onClick={() => setSelectedExteriorId(option.id)}
                    category="ext"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-600 font-medium">Gewählt: {currentConfig.exterior.name}</p>
            </section>
            
            {/* Sektion: 3. Interieur */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Trello size={18} className="mr-3 text-blue-600" /> 3. Interieur
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {INTERIOR_OPTIONS.map(option => (
                  <OptionButton
                    key={option.id}
                    option={{...option, previewUrl: INTERIOR_TEXTURE_IMAGES[option.id]}}
                    isSelected={option.id === selectedInteriorId}
                    onClick={() => setSelectedInteriorId(option.id)}
                    category="int"
                  />
                ))}
              </div>
            </section>
            
            {/* Sektion: 4. Felgen */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Gauge size={18} className="mr-3 text-blue-600" /> 4. Felgen
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {WHEEL_OPTIONS.map(option => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={option.id === selectedWheelId}
                    onClick={() => setSelectedWheelId(option.id)}
                    category="wheel"
                  />
                ))}
              </div>
            </section>

             {/* Sektion: 5. Zierleisten */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Box size={18} className="mr-3 text-blue-600" /> 5. Zierleisten
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {TRIM_OPTIONS.map(option => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={option.id === selectedTrimId}
                    onClick={() => setSelectedTrimId(option.id)}
                    category="trim"
                  />
                ))}
              </div>
            </section>

          </div>{/* Ende Rechtes Feld */}
        </div>{/* Ende Haupt-Grid */}
      </div>{/* Ende Max-Breite Container */}

      {/* Das Modal wird außerhalb des Haupt-Containers gerendert */}
      <ImageModal imageUrl={modalImageUrl} onClose={closeModal} />
    </div>
  );
}