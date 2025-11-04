import React from "react";

// Lista completa di paesi supportati
const COUNTRIES = [
  { name: "Italia", available: true },
  { name: "Afghanistan", available: false },
  { name: "Albania", available: false },
  { name: "Algeria", available: false },
  { name: "Andorra", available: false },
  { name: "Angola", available: false },
  { name: "Antigua e Barbuda", available: false },
  { name: "Arabia Saudita", available: false },
  { name: "Argentina", available: false },
  { name: "Armenia", available: false },
  { name: "Australia", available: false },
  { name: "Austria", available: false },
  { name: "Azerbaigian", available: false },
  { name: "Bahamas", available: false },
  { name: "Bahrain", available: false },
  { name: "Bangladesh", available: false },
  { name: "Barbados", available: false },
  { name: "Belgio", available: false },
  { name: "Belize", available: false },
  { name: "Benin", available: false },
  { name: "Bhutan", available: false },
  { name: "Bielorussia", available: false },
  { name: "Bolivia", available: false },
  { name: "Bosnia ed Erzegovina", available: false },
  { name: "Botswana", available: false },
  { name: "Brasile", available: false },
  { name: "Brunei", available: false },
  { name: "Bulgaria", available: false },
  { name: "Burkina Faso", available: false },
  { name: "Burundi", available: false },
  { name: "Cambogia", available: false },
  { name: "Camerun", available: false },
  { name: "Canada", available: false },
  { name: "Capo Verde", available: false },
  { name: "Ciad", available: false },
  { name: "Cile", available: false },
  { name: "Cina", available: false },
  { name: "Cipro", available: false },
  { name: "Colombia", available: false },
  { name: "Comore", available: false },
  { name: "Congo", available: false },
  { name: "Corea del Nord", available: false },
  { name: "Corea del Sud", available: false },
  { name: "Costa d'Avorio", available: false },
  { name: "Costa Rica", available: false },
  { name: "Croazia", available: false },
  { name: "Cuba", available: false },
  { name: "Danimarca", available: false },
  { name: "Dominica", available: false },
  { name: "Ecuador", available: false },
  { name: "Egitto", available: false },
  { name: "El Salvador", available: false },
  { name: "Emirati Arabi Uniti", available: false },
  { name: "Eritrea", available: false },
  { name: "Estonia", available: false },
  { name: "Eswatini", available: false },
  { name: "Etiopia", available: false },
  { name: "Figi", available: false },
  { name: "Filippine", available: false },
  { name: "Finlandia", available: false },
  { name: "Francia", available: false },
  { name: "Gabon", available: false },
  { name: "Gambia", available: false },
  { name: "Georgia", available: false },
  { name: "Germania", available: false },
  { name: "Ghana", available: false },
  { name: "Giamaica", available: false },
  { name: "Giappone", available: false },
  { name: "Gibuti", available: false },
  { name: "Giordania", available: false },
  { name: "Grecia", available: false },
  { name: "Grenada", available: false },
  { name: "Guatemala", available: false },
  { name: "Guinea", available: false },
  { name: "Guinea-Bissau", available: false },
  { name: "Guinea Equatoriale", available: false },
  { name: "Guyana", available: false },
  { name: "Haiti", available: false },
  { name: "Honduras", available: false },
  { name: "India", available: false },
  { name: "Indonesia", available: false },
  { name: "Iran", available: false },
  { name: "Iraq", available: false },
  { name: "Irlanda", available: false },
  { name: "Islanda", available: false },
  { name: "Isole Marshall", available: false },
  { name: "Isole Salomone", available: false },
  { name: "Israele", available: false },
  { name: "Kazakistan", available: false },
  { name: "Kenya", available: false },
  { name: "Kirghizistan", available: false },
  { name: "Kiribati", available: false },
  { name: "Kosovo", available: false },
  { name: "Kuwait", available: false },
  { name: "Laos", available: false },
  { name: "Lesotho", available: false },
  { name: "Lettonia", available: false },
  { name: "Libano", available: false },
  { name: "Liberia", available: false },
  { name: "Libia", available: false },
  { name: "Liechtenstein", available: false },
  { name: "Lituania", available: false },
  { name: "Lussemburgo", available: false },
  { name: "Macedonia del Nord", available: false },
  { name: "Madagascar", available: false },
  { name: "Malawi", available: false },
  { name: "Maldive", available: false },
  { name: "Malesia", available: false },
  { name: "Mali", available: false },
  { name: "Malta", available: false },
  { name: "Marocco", available: false },
  { name: "Mauritania", available: false },
  { name: "Mauritius", available: false },
  { name: "Messico", available: false },
  { name: "Micronesia", available: false },
  { name: "Moldavia", available: false },
  { name: "Monaco", available: false },
  { name: "Mongolia", available: false },
  { name: "Montenegro", available: false },
  { name: "Mozambico", available: false },
  { name: "Myanmar", available: false },
  { name: "Namibia", available: false },
  { name: "Nauru", available: false },
  { name: "Nepal", available: false },
  { name: "Nicaragua", available: false },
  { name: "Niger", available: false },
  { name: "Nigeria", available: false },
  { name: "Norvegia", available: false },
  { name: "Nuova Zelanda", available: false },
  { name: "Oman", available: false },
  { name: "Paesi Bassi", available: false },
  { name: "Pakistan", available: false },
  { name: "Palau", available: false },
  { name: "Palestina", available: false },
  { name: "Panama", available: false },
  { name: "Papua Nuova Guinea", available: false },
  { name: "Paraguay", available: false },
  { name: "Perù", available: false },
  { name: "Polonia", available: false },
  { name: "Portogallo", available: false },
  { name: "Qatar", available: false },
  { name: "Regno Unito", available: false },
  { name: "Repubblica Ceca", available: false },
  { name: "Repubblica Centrafricana", available: false },
  { name: "Repubblica Democratica del Congo", available: false },
  { name: "Repubblica Dominicana", available: false },
  { name: "Romania", available: false },
  { name: "Ruanda", available: false },
  { name: "Russia", available: false },
  { name: "Saint Kitts e Nevis", available: false },
  { name: "Saint Lucia", available: false },
  { name: "Saint Vincent e Grenadine", available: false },
  { name: "Samoa", available: false },
  { name: "San Marino", available: false },
  { name: "São Tomé e Príncipe", available: false },
  { name: "Senegal", available: false },
  { name: "Serbia", available: false },
  { name: "Seychelles", available: false },
  { name: "Sierra Leone", available: false },
  { name: "Singapore", available: false },
  { name: "Siria", available: false },
  { name: "Slovacchia", available: false },
  { name: "Slovenia", available: false },
  { name: "Somalia", available: false },
  { name: "Spagna", available: false },
  { name: "Sri Lanka", available: false },
  { name: "Stati Uniti", available: false },
  { name: "Sudafrica", available: false },
  { name: "Sudan", available: false },
  { name: "Sudan del Sud", available: false },
  { name: "Suriname", available: false },
  { name: "Svezia", available: false },
  { name: "Svizzera", available: false },
  { name: "Tagikistan", available: false },
  { name: "Taiwan", available: false },
  { name: "Tanzania", available: false },
  { name: "Thailandia", available: false },
  { name: "Timor Est", available: false },
  { name: "Togo", available: false },
  { name: "Tonga", available: false },
  { name: "Trinidad e Tobago", available: false },
  { name: "Tunisia", available: false },
  { name: "Turchia", available: false },
  { name: "Turkmenistan", available: false },
  { name: "Tuvalu", available: false },
  { name: "Ucraina", available: false },
  { name: "Uganda", available: false },
  { name: "Ungheria", available: false },
  { name: "Uruguay", available: false },
  { name: "Uzbekistan", available: false },
  { name: "Vanuatu", available: false },
  { name: "Vaticano", available: false },
  { name: "Venezuela", available: false },
  { name: "Vietnam", available: false },
  { name: "Yemen", available: false },
  { name: "Zambia", available: false },
  { name: "Zimbabwe", available: false },
];

// Lista completa di lingue supportate
const LANGUAGES = [
  { name: "Italiano", available: true },
  { name: "Afrikaans", available: false },
  { name: "Albanese", available: false },
  { name: "Amarico", available: false },
  { name: "Arabo", available: false },
  { name: "Armeno", available: false },
  { name: "Azero", available: false },
  { name: "Bengalese", available: false },
  { name: "Bielorusso", available: false },
  { name: "Birmano", available: false },
  { name: "Bosniaco", available: false },
  { name: "Bulgaro", available: false },
  { name: "Catalano", available: false },
  { name: "Ceco", available: false },
  { name: "Cinese (Mandarino)", available: false },
  { name: "Cinese (Cantonese)", available: false },
  { name: "Coreano", available: false },
  { name: "Corso", available: false },
  { name: "Creolo Haitiano", available: false },
  { name: "Croato", available: false },
  { name: "Curdo", available: false },
  { name: "Danese", available: false },
  { name: "Ebraico", available: false },
  { name: "Esperanto", available: false },
  { name: "Estone", available: false },
  { name: "Filippino (Tagalog)", available: false },
  { name: "Finlandese", available: false },
  { name: "Francese", available: false },
  { name: "Frisone", available: false },
  { name: "Gaelico Scozzese", available: false },
  { name: "Gallese", available: false },
  { name: "Galiziano", available: false },
  { name: "Georgiano", available: false },
  { name: "Giapponese", available: false },
  { name: "Giavanese", available: false },
  { name: "Greco", available: false },
  { name: "Guaraní", available: false },
  { name: "Gujarati", available: false },
  { name: "Hausa", available: false },
  { name: "Hawaiano", available: false },
  { name: "Hindi", available: false },
  { name: "Hmong", available: false },
  { name: "Igbo", available: false },
  { name: "Indonesiano", available: false },
  { name: "Inglese", available: false },
  { name: "Irlandese", available: false },
  { name: "Islandese", available: false },
  { name: "Kannada", available: false },
  { name: "Kazako", available: false },
  { name: "Khmer", available: false },
  { name: "Kirghiso", available: false },
  { name: "Lao", available: false },
  { name: "Latino", available: false },
  { name: "Lettone", available: false },
  { name: "Lituano", available: false },
  { name: "Lussemburghese", available: false },
  { name: "Macedone", available: false },
  { name: "Malayalam", available: false },
  { name: "Malese", available: false },
  { name: "Malgascio", available: false },
  { name: "Maltese", available: false },
  { name: "Maori", available: false },
  { name: "Marathi", available: false },
  { name: "Mongolo", available: false },
  { name: "Nepalese", available: false },
  { name: "Norvegese", available: false },
  { name: "Olandese", available: false },
  { name: "Oriya", available: false },
  { name: "Pashto", available: false },
  { name: "Persiano", available: false },
  { name: "Polacco", available: false },
  { name: "Portoghese", available: false },
  { name: "Punjabi", available: false },
  { name: "Quechua", available: false },
  { name: "Rumeno", available: false },
  { name: "Russo", available: false },
  { name: "Samoano", available: false },
  { name: "Serbo", available: false },
  { name: "Sesotho", available: false },
  { name: "Shona", available: false },
  { name: "Sindhi", available: false },
  { name: "Singalese", available: false },
  { name: "Slovacco", available: false },
  { name: "Sloveno", available: false },
  { name: "Somalo", available: false },
  { name: "Spagnolo", available: false },
  { name: "Sundanese", available: false },
  { name: "Swahili", available: false },
  { name: "Svedese", available: false },
  { name: "Tagico", available: false },
  { name: "Tamil", available: false },
  { name: "Tataro", available: false },
  { name: "Tedesco", available: false },
  { name: "Telugu", available: false },
  { name: "Thailandese", available: false },
  { name: "Tigrino", available: false },
  { name: "Tongano", available: false },
  { name: "Turco", available: false },
  { name: "Turcmeno", available: false },
  { name: "Ucraino", available: false },
  { name: "Uiguro", available: false },
  { name: "Ungherese", available: false },
  { name: "Urdu", available: false },
  { name: "Uzbeco", available: false },
  { name: "Vietnamita", available: false },
  { name: "Xhosa", available: false },
  { name: "Yiddish", available: false },
  { name: "Yoruba", available: false },
  { name: "Zulu", available: false },
];

type PageInfoNoteProps = {
  title: string;
  description: string;
  tips?: string[];
  eventTypeSpecific?: {
    wedding?: string;
    baptism?: string;
    communion?: string;
    confirmation?: string;
    birthday?: string;
    graduation?: string;
    eighteenth?: string;
  };
  icon?: string;
  showCountries?: boolean;
  showLanguages?: boolean;
};

/**
 * Componente per mostrare note informative contestuali in ogni pagina.
 * Spiega il funzionamento della pagina e fornisce suggerimenti in base al tipo di evento.
 */
export default function PageInfoNote({ 
  title, 
  description, 
  tips = [], 
  eventTypeSpecific,
  icon = "💡",
  showCountries = false,
  showLanguages = false,
}: PageInfoNoteProps) {
  // Leggi il tipo di evento dal localStorage (client-side)
  const [eventType, setEventType] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const type = localStorage.getItem("eventType") || "wedding";
      setEventType(type);
    }
  }, []);

  // Messaggio specifico per tipo di evento
  const eventSpecificMessage = eventTypeSpecific && eventType 
    ? eventTypeSpecific[eventType as keyof typeof eventTypeSpecific]
    : null;

  return (
    <div className="mb-6 p-5 rounded-2xl border-2 border-[#A3B59D]/30 bg-linear-to-br from-[#A3B59D]/5 to-[#A3B59D]/10 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {description}
          </p>

          {/* Messaggio specifico per tipo di evento */}
          {eventSpecificMessage && (
            <div className="mb-3 p-3 rounded-lg bg-white/60 border border-[#A3B59D]/20">
              <p className="text-sm text-gray-700">
                <strong className="text-[#A3B59D]">Per il tuo evento:</strong> {eventSpecificMessage}
              </p>
            </div>
          )}

          {/* Suggerimenti */}
          {tips.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Suggerimenti:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#A3B59D] shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lista Paesi */}
          {showCountries && (
            <div className="mt-4 p-3 rounded-lg bg-white/40 border border-[#A3B59D]/15">
              <p className="text-xs font-semibold text-gray-700 mb-2">🌍 Paesi Supportati:</p>
              <div className="max-h-48 overflow-y-auto text-xs text-gray-600">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COUNTRIES.map((country) => (
                    <div key={country.name} className="flex items-center gap-1">
                      {country.available ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                      <span className={country.available ? "font-medium" : ""}>
                        {country.name}
                      </span>
                      {!country.available && (
                        <span className="text-orange-500 italic text-[10px]">(coming soon)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista Lingue */}
          {showLanguages && (
            <div className="mt-4 p-3 rounded-lg bg-white/40 border border-[#A3B59D]/15">
              <p className="text-xs font-semibold text-gray-700 mb-2">🗣️ Lingue Disponibili:</p>
              <div className="max-h-48 overflow-y-auto text-xs text-gray-600">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((language) => (
                    <div key={language.name} className="flex items-center gap-1">
                      {language.available ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                      <span className={language.available ? "font-medium" : ""}>
                        {language.name}
                      </span>
                      {!language.available && (
                        <span className="text-orange-500 italic text-[10px]">(coming soon)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
