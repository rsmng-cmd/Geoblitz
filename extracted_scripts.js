






    // Global hata yakalayÄ±cÄ± - sessiz crash'leri Ã¶nle
    window.onerror = function (msg, src, line, col, err) {
      console.error('GeoMeister Error:', msg, 'at', src, line);
      return false; // hatayÄ± yutma, console'da gÃ¶ster ama loading-error'a yazma
    };
    window.addEventListener('unhandledrejection', function (e) {
      console.error('Unhandled promise rejection:', e.reason);
    });

    // ===== FIREBASE INIT =====
    const firebaseConfig = {
      apiKey: "AIzaSyDbW4HmzwMARnqL2qDS44AvEYYv9_-k06k",
      authDomain: "sehirbul.web.app",  // firebaseapp.com mobilde cross-origin sorun cikariyor
      projectId: "sehirbul",
      storageBucket: "sehirbul.firebasestorage.app",
      messagingSenderId: "25962377570",
      appId: "1:25962377570:web:e1c1d38670ae64fabc3c3b"
    };

    try {
      firebase.initializeApp(firebaseConfig);
    } catch (e) { console.warn('Firebase init error:', e); }
    const db = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) ? firebase.firestore() : null;
    const auth = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) ? firebase.auth() : null;

    // Service Worker kaydÄ± (PWA iÃ§in)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Mobil tarayici uyumluluÄŸu â€” localStorage persistence kullan
    // (varsayilan session persistence mobilde cross-origin sorunlara neden olabilir)
    if (auth) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => {
        console.warn('Persistence ayarlanamadi:', e);
      });
    }

    // Firebase Auth state â€” sayfa yÃ¼klenince aktif oturumu kontrol et
    let _loggingOut = false; // logout sÄ±rasÄ±nda listener'Ä± engelle
    if (auth) {
      auth.onAuthStateChanged(async (fireUser) => {
        if (_loggingOut) return; // logout sÄ±rasÄ±nda tetiklenmesin
        if (fireUser && !currentUser) {
          try {
            const mapSnap = await db.collection('uid_to_username').doc(fireUser.uid).get();
            if (mapSnap.exists) {
              const key = mapSnap.data().key;
              const userSnap = await db.collection('users').doc(key).get();
              if (userSnap.exists) {
                currentUser = userSnap.data();
window._geomeisterUser = currentUser;
                const authModal = document.getElementById('auth-modal');
                if (authModal && !authModal.classList.contains('hidden')) {
                  onAuthSuccess();
                }
              }
            }
          } catch (e) { console.warn('Auto-login error:', e); }
        }
      });
    }

    // ===== Ä°NGÄ°LÄ°ZCE Ã‡EVÄ°RÄ° =====
    const COUNTRY_EN = {
      "TÃ¼rkiye": "Turkey", "Rusya": "Russia", "Almanya": "Germany", "Fransa": "France",
      "Ä°ngiltere": "United Kingdom", "Ä°talya": "Italy", "Ä°spanya": "Spain", "Ukrayna": "Ukraine",
      "Polonya": "Poland", "Romanya": "Romania", "Hollanda": "Netherlands", "BelÃ§ika": "Belgium",
      "Yunanistan": "Greece", "Portekiz": "Portugal", "Ã‡ekya": "Czechia", "Macaristan": "Hungary",
      "Ä°sveÃ§": "Sweden", "Avusturya": "Austria", "Ä°sviÃ§re": "Switzerland", "SÄ±rbistan": "Serbia",
      "Bulgaristan": "Bulgaria", "Danimarka": "Denmark", "Finlandiya": "Finland", "NorveÃ§": "Norway",
      "Slovakya": "Slovakia", "HÄ±rvatistan": "Croatia", "Moldova": "Moldova", "Arnavutluk": "Albania",
      "Letonya": "Latvia", "Litvanya": "Lithuania", "Estonya": "Estonia", "Ä°rlanda": "Ireland",
      "GÃ¼rcistan": "Georgia", "Ermenistan": "Armenia", "Azerbaycan": "Azerbaijan",
      "Kuzey Makedonya": "N. Macedonia", "KaradaÄŸ": "Montenegro", "Slovenya": "Slovenia",
      "Ã‡in": "China", "Hindistan": "India", "Japonya": "Japan", "Endonezya": "Indonesia",
      "Pakistan": "Pakistan", "BangladeÅŸ": "Bangladesh", "Filipinler": "Philippines",
      "Ä°ran": "Iran", "Irak": "Iraq", "Suudi Arabistan": "Saudi Arabia", "BAE": "UAE",
      "Kazakistan": "Kazakhstan", "Ã–zbekistan": "Uzbekistan", "Afganistan": "Afghanistan",
      "Malezya": "Malaysia", "Tayland": "Thailand", "Vietnam": "Vietnam",
      "GÃ¼ney Kore": "South Korea", "Kuzey Kore": "North Korea", "KamboÃ§ya": "Cambodia",
      "Myanmar": "Myanmar", "Tayvan": "Taiwan", "MoÄŸolistan": "Mongolia",
      "TÃ¼rkmenistan": "Turkmenistan", "KÄ±rgÄ±zistan": "Kyrgyzstan", "Tacikistan": "Tajikistan",
      "ÃœrdÃ¼n": "Jordan", "Ä°srail": "Israel", "LÃ¼bnan": "Lebanon", "Suriye": "Syria",
      "Katar": "Qatar", "Kuveyt": "Kuwait", "Umman": "Oman", "Yemen": "Yemen",
      "MÄ±sÄ±r": "Egypt", "Nijerya": "Nigeria", "Etiyopya": "Ethiopia", "Kongo": "D.R. Congo",
      "Tanzanya": "Tanzania", "Kenya": "Kenya", "GÃ¼ney Afrika": "South Africa", "Sudan": "Sudan",
      "Cezayir": "Algeria", "Uganda": "Uganda", "Fas": "Morocco", "Mozambik": "Mozambique",
      "Angola": "Angola", "Madagaskar": "Madagascar", "Kamerun": "Cameroon",
      "FildiÅŸi Sahili": "Ivory Coast", "Nijer": "Niger", "Burkina Faso": "Burkina Faso",
      "Mali": "Mali", "Malawi": "Malawi", "Senegal": "Senegal", "Zambiya": "Zambia",
      "Zimbabve": "Zimbabwe", "Ã‡ad": "Chad", "Ruanda": "Rwanda", "Tunus": "Tunisia",
      "Somali": "Somalia", "Botsvana": "Botswana", "Namibya": "Namibia", "Liberya": "Liberia",
      "Gine": "Guinea", "Gabon": "Gabon", "Benin": "Benin", "Togo": "Togo", "Libya": "Libya",
      "ABD": "USA", "Kanada": "Canada", "Meksika": "Mexico", "Brezilya": "Brazil",
      "Arjantin": "Argentina", "Kolombiya": "Colombia", "Åili": "Chile", "Peru": "Peru",
      "Venezuela": "Venezuela", "Ekvador": "Ecuador", "Bolivya": "Bolivia", "Paraguay": "Paraguay",
      "Uruguay": "Uruguay", "KÃ¼ba": "Cuba", "Dominik Cum.": "Dominican Rep.", "Haiti": "Haiti",
      "Guatemala": "Guatemala", "Honduras": "Honduras", "El Salvador": "El Salvador",
      "Nikaragua": "Nicaragua", "Kosta Rika": "Costa Rica", "Panama": "Panama",
      "Jamaika": "Jamaica", "Avustralya": "Australia", "Yeni Zelanda": "New Zealand",
      "Papua Yeni Gine": "Papua New Guinea", "KÄ±brÄ±s": "Cyprus",
      "Bahreyn": "Bahrain", "Cibuti": "Djibouti", "Singapur": "Singapore", "Fiji": "Fiji",
      "Laos": "Laos", "Trinidad": "Trinidad & Tobago", "Bosna": "Bosnia & Herzegovina",
      "Sri Lanka": "Sri Lanka", "Nepal": "Nepal", "Gana": "Ghana", "Sierra Leone": "Sierra Leone",
      "Kongo Cum.": "Rep. of Congo", "Orta Afrika Cumhuriyeti": "C.A.R.",
      "Eritre": "Eritrea", "Kuzey Kore": "North Korea", "GÃ¼ney Kore": "South Korea",
      "Belarus": "Belarus", "Ã–zbekistan": "Uzbekistan", "Kazakistan": "Kazakhstan",
    };
    const CITY_EN = {
      // TÃ¼rkiye
      "Ä°stanbul": "Istanbul", "Ankara": "Ankara", "Ä°zmir": "Izmir", "Bursa": "Bursa",
      "Adana": "Adana", "Gaziantep": "Gaziantep", "Konya": "Konya", "Antalya": "Antalya", "EskiÅŸehir": "Eskisehir",
      // Avrupa
      "Moskova": "Moscow", "St. Petersburg": "St. Petersburg", "MÃ¼nih": "Munich", "KÃ¶ln": "Cologne",
      "DÃ¼sseldorf": "DÃ¼sseldorf", "Frankfurt": "Frankfurt", "Stuttgart": "Stuttgart", "Hamburg": "Hamburg", "Berlin": "Berlin",
      "VarÅŸova": "Warsaw", "BÃ¼kreÅŸ": "Bucharest", "BrÃ¼ksel": "Brussels", "Atina": "Athens",
      "Lizbon": "Lisbon", "Viyana": "Vienna", "Sofya": "Sofia", "Kopenhag": "Copenhagen",
      "Londra": "London", "Marsilya": "Marseille", "Barselona": "Barcelona", "Valensiya": "Valencia",
      "Sevilla": "Seville", "Selanik": "Thessaloniki", "Harkiv": "Kharkiv", "Stokholm": "Stockholm",
      "BudapeÅŸte": "Budapest", "Prag": "Prague", "Bratislava": "Bratislava", "Ljubljana": "Ljubljana",
      "Zagreb": "Zagreb", "Saraybosna": "Sarajevo", "Beograd": "Belgrade", "Belgrad": "Belgrade",
      "Sofya": "Sofia", "Tiran": "Tirana", "Podgorica": "Podgorica", "ÃœskÃ¼p": "Skopje",
      "KiÅŸinev": "Chisinau", "Riga": "Riga", "Vilnius": "Vilnius", "Tallinn": "Tallinn",
      "Helsinki": "Helsinki", "Oslo": "Oslo", "Bergen": "Bergen", "Dublin": "Dublin",
      "GÃ¶teborg": "Gothenburg", "MalmÃ¶": "MalmÃ¶", "Brno": "Brno", "Krakow": "Krakow",
      "Wroclaw": "Wroclaw", "Gdansk": "Gdansk", "Poznan": "Poznan", "Lviv": "Lviv",
      "Kiev": "Kyiv", "Dnipro": "Dnipro", "Odessa": "Odessa", "Cluj-Napoca": "Cluj-Napoca",
      "TamÄ±ÅŸvar": "TimiÈ™oara", "Plovdiv": "Plovdiv", "ZÃ¼rih": "Zurich", "Cenevre": "Geneva",
      "Bern": "Bern", "Cenova": "Genoa", "Napoli": "Naples", "Palermo": "Palermo",
      "Bologna": "Bologna", "Turin": "Turin", "Milano": "Milan", "Roma": "Rome",
      "Floransa": "Florence", "Venedik": "Venice", "Katanya": "Catania",
      "BrÃ¼ksel": "Brussels", "Antwerpen": "Antwerp", "Lyon": "Lyon", "Bordeaux": "Bordeaux",
      "Toulouse": "Toulouse", "Nice": "Nice", "Graz": "Graz", "Rotterdam": "Rotterdam",
      "Amsterdam": "Amsterdam", "Bilbao": "Bilbao", "Malaga": "Malaga", "Zaragoza": "Zaragoza",
      "Strazburg": "Strasbourg", "Lahey": "The Hague", "Lozan": "Lausanne",
      "KaloÅŸvar": "Cluj-Napoca", "TimiÅŸoara": "TimiÈ™oara", "IaÅŸi": "IaÈ™i", "KÃ¶stence": "ConstanÈ›a",
      "LiÃ¨ge": "LiÃ¨ge", "Brugge": "Bruges", "Anvers": "Antwerp", "Gent": "Ghent",
      "Aarhus": "Aarhus", "Odense": "Odense", "PriÅŸtine": "Pristina",
      // Rusya / BDT
      "Novosibirsk": "Novosibirsk", "Yekaterinburg": "Yekaterinburg", "Kazan": "Kazan",
      "Nizhny Novgorod": "Nizhny Novgorod", "Ã‡elyabinsk": "Chelyabinsk", "Omsk": "Omsk",
      "Samara": "Samara", "Ufa": "Ufa", "Rostov-na-Donu": "Rostov", "Vladivostok": "Vladivostok",
      "Tiflis": "Tbilisi", "BakÃ¼": "Baku", "Erivan": "Yerevan", "Minsk": "Minsk",
      "BiÅŸkek": "Bishkek", "DuÅŸanbe": "Dushanbe", "AÅŸkabat": "Ashgabat",
      "AlmatÄ±": "Almaty", "TaÅŸkent": "Tashkent", "Semerkant": "Samarkand", "Åymkent": "Shymkent",
      // Orta DoÄŸu
      "Tahran": "Tehran", "MeÅŸhed": "Mashhad", "Ä°sfahan": "Isfahan", "Tebriz": "Tabriz", "Åiraz": "Shiraz", "Ahvaz": "Ahvaz",
      "BaÄŸdat": "Baghdad", "Basra": "Basra", "Musul": "Mosul", "Erbil": "Erbil",
      "Riyad": "Riyadh", "Cidde": "Jeddah", "Mekke": "Mecca", "Medine": "Medina", "Dammam": "Dammam",
      "Åam": "Damascus", "Halep": "Aleppo", "Amman": "Amman", "Beyrut": "Beirut",
      "KudÃ¼s": "Jerusalem", "Tel Aviv": "Tel Aviv", "Doha": "Doha", "Manama": "Bahrain City",
      "Kuveyt": "Kuwait City", "Maskat": "Muscat", "Sana": "Sana'a", "Aden": "Aden",
      // Orta Asya / GÃ¼ney Asya
      "Kabil": "Kabul", "Kandahar": "Kandahar", "Herat": "Herat", "Mazar-i Serif": "Mazar-i-Sharif",
      "Ä°slamabad": "Islamabad", "Ravalpindi": "Rawalpindi", "Lahore": "Lahore",
      "KaraÃ§i": "Karachi", "Faisalabad": "Faisalabad", "Multan": "Multan", "PeÅŸaver": "Peshawar",
      "Delhi": "Delhi", "Mumbai": "Mumbai", "KalkÃ¼ta": "Kolkata", "Chennai": "Chennai",
      "Bangalore": "Bangalore", "Haydarabad": "Hyderabad", "Ahmedabad": "Ahmedabad",
      "Pune": "Pune", "Surat": "Surat", "Jaipur": "Jaipur", "Lucknow": "Lucknow",
      "Nagpur": "Nagpur", "Patna": "Patna", "Bhopal": "Bhopal", "Katmandu": "Kathmandu",
      "Pokhara": "Pokhara", "Dhaka": "Dhaka", "Chittagong": "Chittagong", "Khulna": "Khulna",
      "Colombo": "Colombo", "Kandy": "Kandy",
      // DoÄŸu Asya
      "Pekin": "Beijing", "Åangay": "Shanghai", "Guangzhou": "Guangzhou", "Shenzhen": "Shenzhen",
      "Chengdu": "Chengdu", "Chongqing": "Chongqing", "Tianjin": "Tianjin", "Wuhan": "Wuhan",
      "Hangzhou": "Hangzhou", "Nanjing": "Nanjing", "Harbin": "Harbin", "Kunming": "Kunming",
      "Xian": "Xi'an", "Urumqi": "Urumqi", "Hong Kong": "Hong Kong", "Kaohsiung": "Kaohsiung",
      "Taipei": "Taipei", "Taichung": "Taichung", "Seul": "Seoul", "Busan": "Busan",
      "Daegu": "Daegu", "Incheon": "Incheon", "Pyongyang": "Pyongyang", "Ulan Batur": "Ulaanbaatar",
      "Tokyo": "Tokyo", "Osaka": "Osaka", "Nagoya": "Nagoya", "Sapporo": "Sapporo",
      "Fukuoka": "Fukuoka", "Kobe": "Kobe", "Kyoto": "Kyoto", "Hiroshima": "Hiroshima", "Sendai": "Sendai",
      // GD Asya
      "Bangkok": "Bangkok", "Chiang Mai": "Chiang Mai", "Hanoi": "Hanoi", "Ho Chi Minh": "Ho Chi Minh City",
      "Haiphong": "Haiphong", "Da Nang": "Da Nang", "Phnom Penh": "Phnom Penh", "Vientiane": "Vientiane",
      "Rangun": "Yangon", "Mandalay": "Mandalay", "Kuala Lumpur": "Kuala Lumpur",
      "George Town": "George Town", "Johor Bahru": "Johor Bahru", "Singapur": "Singapore",
      "Jakarta": "Jakarta", "Surabaya": "Surabaya", "Bandung": "Bandung", "Medan": "Medan",
      "Semarang": "Semarang", "Makassar": "Makassar", "Palembang": "Palembang",
      "Manila": "Manila", "Cebu": "Cebu", "Davao": "Davao", "LefkoÅŸa": "Nicosia",
      // Afrika
      "Kahire": "Cairo", "Ä°skenderiye": "Alexandria", "Hartum": "Khartoum", "Omdurman": "Omdurman",
      "Cezayir": "Algiers", "Oran": "Oran", "Constantine": "Constantine",
      "Casablanca": "Casablanca", "Rabat": "Rabat", "Fes": "Fez", "MarakeÅŸ": "Marrakesh",
      "Trablus": "Tripoli", "Bingazi": "Benghazi", "Tunus": "Tunis", "Sfaks": "Sfax",
      "Lagos": "Lagos", "Abuja": "Abuja", "Kano": "Kano", "Ibadan": "Ibadan", "Port Harcourt": "Port Harcourt",
      "Nairobi": "Nairobi", "Mombasa": "Mombasa", "Kampala": "Kampala", "Dar es Salaam": "Dar es Salaam",
      "Dodoma": "Dodoma", "Kigali": "Kigali", "Addis Ababa": "Addis Ababa", "Dire Dawa": "Dire Dawa",
      "Asmara": "Asmara", "MogadiÅŸu": "Mogadishu", "Cibuti": "Djibouti",
      "Johannesburg": "Johannesburg", "Kapstadt": "Cape Town", "Durban": "Durban", "Pretoria": "Pretoria",
      "Kinshasa": "Kinshasa", "Lubumbashi": "Lubumbashi", "Brazzaville": "Brazzaville",
      "Luanda": "Luanda", "Huambo": "Huambo", "Maputo": "Maputo", "Beira": "Beira", "Nampula": "Nampula",
      "Antananarivo": "Antananarivo", "Lusaka": "Lusaka", "Ndola": "Ndola",
      "Harare": "Harare", "Bulawayo": "Bulawayo", "Gaborone": "Gaborone", "Windhoek": "Windhoek",
      "Dakar": "Dakar", "Bamako": "Bamako", "Ouagadougou": "Ouagadougou", "Niamey": "Niamey",
      "Accra": "Accra", "Kumasi": "Kumasi", "Abidjan": "Abidjan", "Cotonou": "Cotonou",
      "Lome": "LomÃ©", "Yaounde": "YaoundÃ©", "Douala": "Douala", "Bangui": "Bangui",
      "Libreville": "Libreville", "Freetown": "Freetown", "Monrovia": "Monrovia", "Konakri": "Conakry",
      // Amerika
      "New York": "New York", "Los Angeles": "Los Angeles", "Chicago": "Chicago",
      "Houston": "Houston", "Phoenix": "Phoenix", "Philadelphia": "Philadelphia",
      "San Antonio": "San Antonio", "San Diego": "San Diego", "Dallas": "Dallas",
      "San Jose": "San Jose", "Austin": "Austin", "Jacksonville": "Jacksonville",
      "Boston": "Boston", "Seattle": "Seattle", "Denver": "Denver", "Detroit": "Detroit",
      "Miami": "Miami", "Atlanta": "Atlanta", "Minneapolis": "Minneapolis",
      "New Orleans": "New Orleans", "Las Vegas": "Las Vegas", "Portland": "Portland",
      "Honolulu": "Honolulu", "Anchorage": "Anchorage", "Washington DC": "Washington DC",
      "Toronto": "Toronto", "Montreal": "Montreal", "Vancouver": "Vancouver", "Calgary": "Calgary",
      "Edmonton": "Edmonton", "Ottawa": "Ottawa", "Winnipeg": "Winnipeg",
      "Mexico City": "Mexico City", "Guadalajara": "Guadalajara", "Monterrey": "Monterrey",
      "Puebla": "Puebla", "Tijuana": "Tijuana", "Leon": "LeÃ³n",
      "Bogota": "BogotÃ¡", "Medellin": "MedellÃ­n", "Cali": "Cali", "Barranquilla": "Barranquilla",
      "Lima": "Lima", "Arequipa": "Arequipa", "Trujillo": "Trujillo",
      "Sao Paulo": "SÃ£o Paulo", "Rio de Janeiro": "Rio de Janeiro", "Brasilia": "BrasÃ­lia",
      "Salvador": "Salvador", "Fortaleza": "Fortaleza", "Belo Horizonte": "Belo Horizonte",
      "Manaus": "Manaus", "Curitiba": "Curitiba", "Recife": "Recife",
      "Porto Alegre": "Porto Alegre", "Belem": "BelÃ©m",
      "Buenos Aires": "Buenos Aires", "Cordoba": "CÃ³rdoba", "Rosario": "Rosario",
      "Mendoza": "Mendoza", "Tucuman": "TucumÃ¡n",
      "Santiago": "Santiago", "Valparaiso": "ValparaÃ­so", "Concepcion": "ConcepciÃ³n",
      "Caracas": "Caracas", "Maracaibo": "Maracaibo", "Valencia": "Valencia",
      "Quito": "Quito", "Guayaquil": "Guayaquil",
      "La Paz": "La Paz", "Santa Cruz": "Santa Cruz", "Cochabamba": "Cochabamba",
      "Asuncion": "AsunciÃ³n", "Montevideo": "Montevideo",
      "Havana": "Havana", "Santo Domingo": "Santo Domingo", "Port-au-Prince": "Port-au-Prince",
      "Guatemala City": "Guatemala City", "Tegucigalpa": "Tegucigalpa",
      "San Salvador": "San Salvador", "Managua": "Managua", "San Jose": "San JosÃ©",
      "Panama City": "Panama City", "Kingston": "Kingston", "Port of Spain": "Port of Spain",
      // Avustralya/Okyanusya
      "Sidney": "Sydney", "Melbourne": "Melbourne", "Brisbane": "Brisbane", "Perth": "Perth",
      "Adelaide": "Adelaide", "Canberra": "Canberra", "Darwin": "Darwin", "Christchurch": "Christchurch",
      "Auckland": "Auckland", "Wellington": "Wellington", "Suva": "Suva",
      // DiÄŸer
      "N'Djamena": "N'Djamena", "Lilongwe": "Lilongwe", "Gaborone": "Gaborone",
      "Phnom Penh": "Phnom Penh", "Erivan": "Yerevan", "MarakeÅŸ": "Marrakesh",
    };
    function cityDisplayName(city) { return lang === 'en' ? (CITY_EN[city.name] || city.name) : city.name; }
    function countryDisplayName(city) { return lang === 'en' ? (COUNTRY_EN[city.country] || city.country) : city.country; }

    // ===== DÄ°L SÄ°STEMÄ° =====
    let lang = 'tr';
    const T = {
      tr: {
        play: 'OYNA', leaderboard: 'ğŸ† SKOR TABLOSU', logout: 'Ã‡IKIÅ YAP',
        welcome: 'HoÅŸ geldin,', guest: 'Misafir olarak oynuyorsun',
        markCity: 'ÅŸehri haritada iÅŸaretle:',
        nextQ: 'DEVAM â†’', nextLevel: 'SONRAKÄ° SEVÄ°YE â†’', retry: 'TEKRAR DENE', playAgain: 'YENÄ°DEN OYNA',
        viewLb: 'SKOR TABLOSU', logoutBtn: 'Ã‡IKIÅ YAP',
        winTitle: 'ğŸ† TEBRÄ°KLER, KAZANDINIZ!',
        winDesc: (score) => `TÃ¼m 10 seviyeyi tamamladÄ±n!<br>Bu oyunun puanÄ±: <b style="color:var(--accent)">${score}</b>`,
        levelOk: (lvl) => `ğŸ‰ SEVÄ°YE ${lvl} TAMAM!`,
        levelOkDesc: (ls, tgt, nl, nq, ntgt, total) => `PuanÄ±n: <b style="color:var(--green)">${ls}</b> / Hedef: ${tgt} &nbsp;|&nbsp; Toplam: <b style="color:var(--accent)">${total || 0}</b><br><br>Seviye ${nl}: ${nq} soru, hedef <b style="color:var(--accent)">${ntgt}</b> puan`,
        failTitle: 'âŒ BAÅARISIZ!',
        failDesc: (ls, tgt, total) => `PuanÄ±n: <b style="color:var(--red)">${ls}</b> / Hedef: ${tgt}<br>Toplam puan: <b style="color:var(--accent)">${total || 0}</b><br><br>ÃœzÃ¼lme, 1. seviyeden tekrar baÅŸla!`,
        lbTitle: 'ğŸ† LÄ°DERLÄ°K TABLOSU', lbSub: 'Tek oyundan alÄ±nan en yÃ¼ksek puanlar',
        lbOrientationNote: 'ğŸ“± Liderlik tablosunu dikey ekranda gÃ¶rÃ¼ntÃ¼lemeniz tavsiye edilir.',
        lbClose: 'KAPAT', lbReset: 'SKORUMU SIFIRLA', lbLoading: 'â³ YÃ¼kleniyor...', lbEmpty: 'HenÃ¼z skor yok.',
        lbFail: 'YÃ¼klenemedi',
        games: 'oyun', level: 'Sv.',
        loginTab: 'GÄ°RÄ°Å YAP', registerTab: 'KAYIT OL',
        userPlaceholder: 'KullanÄ±cÄ± adÄ±', passPlaceholder: 'Åifre',
        submit: 'DEVAM', guestLink: 'misafir olarak oyna', authSubtitle: 'Skor tablosunda yer almak iÃ§in giriÅŸ yap',
        errShort: 'KullanÄ±cÄ± adÄ± en az 2 karakter olmalÄ±.',
        errPass: 'Åifre en az 4 karakter olmalÄ±.',
        errLong: 'KullanÄ±cÄ± adÄ± en fazla 20 karakter.',
        errTaken: 'Bu kullanÄ±cÄ± adÄ± zaten alÄ±nmÄ±ÅŸ.',
        errNotFound: 'KullanÄ±cÄ± bulunamadÄ±.',
        errWrongPass: 'HatalÄ± ÅŸifre.',
        errConn: 'BaÄŸlantÄ± hatasÄ±, tekrar dene.',
        waiting: 'â³ Bekleniyor...',
        confirmReset: 'EMÄ°N MÄ°SÄ°N? (tekrar bas)',
        fullscreenTitle: 'MOBÄ°L ALGILANDI',
        fullscreenDesc: 'Daha iyi bir deneyim iÃ§in tam ekrana geÃ§mek ister misiniz?',
        fullscreenYes: 'TAM EKRANA GEÃ‡', fullscreenNo: 'HAYIR, DEVAM ET',
        combo: 'KOMBO', timeout: 'â± SÃ¼re doldu!', away: 'km uzakta',
        score: 'Puan', target: 'Hedef', progress: 'Ä°lerleme',
        fullscreenBtn: 'â›¶ TAM EKRAN',
        playWorld: 'ğŸŒ DÃœNYA', playTurkey: 'ğŸ‡¹ğŸ‡· TÃœRKÄ°YE',
        markDistrict: 'ilÃ§eyi haritada iÅŸaretle:',
        mainMenu: 'ğŸ  ANA MENÃœ',
        mainMenuTitle: 'ANA MENÃœ',
        mainMenuCurrent: (m) => m === 'turkey' ? 'ğŸ‡¹ğŸ‡· Åu an: TÃ¼rkiye Modu' : m === 'europe' ? 'ğŸ‡ªğŸ‡º Åu an: Avrupa Modu' : 'ğŸŒ Åu an: DÃ¼nya Modu',
        // Multiplayer
        mp: 'âš”ï¸ Ã‡OKLU OYUNCU',
        mpMainTitle: 'âš”ï¸ Ã‡OKLU OYUNCU',
        mpMainSub: '2-5 kiÅŸiyle gerÃ§ek zamanlÄ± oyna',
        mpCreateBtn: 'â• LOBÄ° OLUÅTUR',
        mpJoinBtn: 'ğŸ”— LOBÄ°YE KATIL',
        mpBack: 'â† GERÄ°',
        mpCreateTitle: 'â• LOBÄ° OLUÅTUR',
        mpCreateSub: 'Mod seÃ§ â€” 12 soru, en yÃ¼ksek puan kazanÄ±r',
        mpCreateGo: 'ğŸš€ LOBÄ° OLUÅTUR',
        mpCreating: 'OLUÅTURULUYOR...',
        mpJoinTitle: 'ğŸ”— LOBÄ°YE KATIL',
        mpJoinSub: 'ArkadaÅŸÄ±ndan aldÄ±ÄŸÄ±n 4 haneli kodu gir',
        mpJoinPlaceholder: 'LOBÄ° KODU (4 HANE)',
        mpJoinGo: 'GÄ°RÄ°Å YAP',
        mpJoining: 'BAÄLANILIYOR...',
        mpLobbyTitle: 'ğŸ  LOBÄ°',
        mpLobbySub: 'Kodu arkadaÅŸlarÄ±nla paylaÅŸ',
        mpCopyTitle: 'Kopyalamak iÃ§in tÄ±kla',
        mpWaitingPlayers: 'Oyuncular bekleniyorâ€¦',
        mpStartBtn: (n) => n < 2 ? `â–¶ BAÅLAT (min 2 kiÅŸi gerek, ÅŸu an ${n})` : `â–¶ BAÅLAT (${n} kiÅŸi)`,
        mpGuestTitle: 'â³ OYUN BEKLENÄ°YOR',
        mpGuestSub: (code, mode) => `Kod: ${code} â€” ${mode === 'turkey' ? 'ğŸ‡¹ğŸ‡· TÃ¼rkiye' : mode === 'europe' ? 'ğŸ‡ªğŸ‡º Avrupa' : mode === 'flag' ? 'ğŸš© Bayraklar' : 'ğŸŒ DÃ¼nya'} â€¢ 12 soru â€¢ Lobi sahibi baÅŸlatana kadar bekle`,
        mpGuestStatus: 'Lobiye baÄŸlanÄ±ldÄ±â€¦',
        mpLeave: 'LOBÄ°DEN AYRIL',
        mpCopied: 'KOPYALANDI!',
        mpPlayerCount: (n, mode) => `${n}/5 oyuncu â€¢ ${mode === 'turkey' ? 'ğŸ‡¹ğŸ‡· TÃ¼rkiye' : mode === 'europe' ? 'ğŸ‡ªğŸ‡º Avrupa' : mode === 'flag' ? 'ğŸš© Bayraklar' : 'ğŸŒ DÃ¼nya'} â€¢ 12 soru`,
        mpErrConn: 'BaÄŸlantÄ± hatasÄ±!',
        mpErrFull: 'Lobi dolu! (Max 5 kiÅŸi)',
        mpErrExists: 'Bu lobide zaten varsÄ±n!',
        mpErrNotFound: 'Lobi bulunamadÄ± veya oyun baÅŸlamÄ±ÅŸ!',
        mpErrLogin: 'Ã‡ok oyunculu mod iÃ§in giriÅŸ yapman gerekiyor!',
        mpErrMin2: 'En az 2 oyuncu gerekli!',
        mpGameOver: 'ğŸ† OYUN BÄ°TTÄ°',
        mpBackMenu: 'ANA MENÃœYE DÃ–N',
        mpWinner: (name) => `ğŸ† KAZANAN: ${name}`,
        mpYouWin: 'ğŸ† KAZANDINIZ!',
        mpYou: '(Sen)',
        mpBadge: 'âš”ï¸ Ã‡OKLU',
        mpBetweenQ: (n) => `SORU ${n} SONUÃ‡LARI`,
        mpBetweenFinal: 'FÄ°NAL SONUÃ‡LARI',
        mpBetweenSub: (n, total) => `${n}/${total} soru tamamlandÄ±`,
        mpBetweenFinalSub: (total) => `TÃ¼m ${total} soru tamamlandÄ±`,
        mpThisQ: (pts) => `+${pts} bu soruda`,
        mpNoAns: 'â€” puan (cevapsÄ±z)',
        mpWaitHost: 'Lobi sahibi devam edene kadar bekleâ€¦',
        mpWaitFinal: 'Final sonuÃ§larÄ± bekleniyorâ€¦',
        mpNextQ: 'â–¶ SONRAKÄ° SORU',
        mpSeeFinal: 'ğŸ† FÄ°NAL SONUÃ‡LARINI GÃ–R',
        mpLastQ: (n, pts) => `Q${n}'de +${pts}`,
        mpMatchmaking: 'âš¡ RASTGELE EÅLEÅTÄ°R',
        mpBrowse: 'ğŸŒ AKTÄ°F LOBÄ°LER',
        mpJoinByCode: 'ğŸ”— KOD Ä°LE KATIL',
        mpMatchmakingSelectSub: 'Mod seÃ§ ve rankÄ±nÄ± gÃ¶r',
        mpStartSearch: 'ğŸ” EÅLEÅTÄ°R',
        mpCancel: 'âœ• Ä°PTAL',
        mpBrowseTitle: 'ğŸŒ AKTÄ°F LOBÄ°LER',
        mpRefresh: 'ğŸ”„ YENÄ°LE',
        mpBackBtn: 'â† GERÄ°',
        mpResume: 'â–¶ OYUNA DEVAM ET',
        mpLeaveBtn: 'LOBÄ°DEN AYRIL',
      },
      en: {
        play: 'PLAY', leaderboard: 'ğŸ† LEADERBOARD', logout: 'LOG OUT',
        welcome: 'Welcome,', guest: 'Playing as guest',
        markCity: 'mark the city on the map:',
        nextQ: 'NEXT â†’', nextLevel: 'NEXT LEVEL â†’', retry: 'TRY AGAIN', playAgain: 'PLAY AGAIN',
        viewLb: 'LEADERBOARD', logoutBtn: 'LOG OUT',
        winTitle: 'ğŸ† CONGRATULATIONS!',
        winDesc: (score) => `You completed all 10 levels!<br>Your score: <b style="color:var(--accent)">${score}</b>`,
        levelOk: (lvl) => `ğŸ‰ LEVEL ${lvl} COMPLETE!`,
        levelOkDesc: (ls, tgt, nl, nq, ntgt, total) => `Score: <b style="color:var(--green)">${ls}</b> / Target: ${tgt} &nbsp;|&nbsp; Total: <b style="color:var(--accent)">${total || 0}</b><br><br>Level ${nl}: ${nq} questions, target <b style="color:var(--accent)">${ntgt}</b> pts`,
        failTitle: 'âŒ FAILED!',
        failDesc: (ls, tgt, total) => `Score: <b style="color:var(--red)">${ls}</b> / Target: ${tgt}<br>Total score: <b style="color:var(--accent)">${total || 0}</b><br><br>Don't worry, start again from level 1!`,
        lbTitle: 'ğŸ† LEADERBOARD', lbSub: 'Best score from a single game',
        lbOrientationNote: 'ğŸ“± We recommend viewing the leaderboard in portrait mode.',
        lbClose: 'CLOSE', lbReset: 'RESET MY SCORE', lbLoading: 'â³ Loading...', lbEmpty: 'No scores yet.',
        lbFail: 'Failed to load',
        games: 'games', level: 'Lv.',
        loginTab: 'LOG IN', registerTab: 'REGISTER',
        userPlaceholder: 'Username', passPlaceholder: 'Password',
        submit: 'CONTINUE', guestLink: 'play as guest', authSubtitle: 'Log in to appear on the leaderboard',
        errShort: 'Username must be at least 2 characters.',
        errPass: 'Password must be at least 4 characters.',
        errLong: 'Username can be at most 20 characters.',
        errTaken: 'This username is already taken.',
        errNotFound: 'User not found.',
        errWrongPass: 'Wrong password.',
        errConn: 'Connection error, try again.',
        waiting: 'â³ Please wait...',
        confirmReset: 'ARE YOU SURE? (tap again)',
        fullscreenTitle: 'MOBILE DETECTED',
        fullscreenDesc: 'Would you like to switch to fullscreen for a better experience?',
        fullscreenYes: 'GO FULLSCREEN', fullscreenNo: 'NO, CONTINUE',
        combo: 'COMBO', timeout: 'â± Time\'s up!', away: 'km away',
        score: 'Score', target: 'Target', progress: 'Progress',
        fullscreenBtn: 'â›¶ FULLSCREEN',
        playWorld: 'ğŸŒ WORLD', playTurkey: 'ğŸ‡¹ğŸ‡· TURKEY',
        markDistrict: 'mark the district on the map:',
        mainMenu: 'ğŸ  MAIN MENU',
        mainMenuTitle: 'MAIN MENU',
        mainMenuCurrent: (m) => m === 'turkey' ? 'ğŸ‡¹ğŸ‡· Now: Turkey Mode' : m === 'europe' ? 'ğŸ‡ªğŸ‡º Now: Europe Mode' : 'ğŸŒ Now: World Mode',
        // Multiplayer
        mp: 'âš”ï¸ MULTIPLAYER',
        mpMainTitle: 'âš”ï¸ MULTIPLAYER',
        mpMainSub: 'Play real-time with 2-5 players',
        mpCreateBtn: 'â• CREATE LOBBY',
        mpJoinBtn: 'ğŸ”— JOIN LOBBY',
        mpBack: 'â† BACK',
        mpCreateTitle: 'â• CREATE LOBBY',
        mpCreateSub: 'Pick a mode â€” 12 questions, highest score wins',
        mpCreateGo: 'ğŸš€ CREATE LOBBY',
        mpCreating: 'CREATING...',
        mpJoinTitle: 'ğŸ”— JOIN LOBBY',
        mpJoinSub: 'Enter the 4-letter code from your friend',
        mpJoinPlaceholder: 'LOBBY CODE (4 CHARS)',
        mpJoinGo: 'JOIN',
        mpJoining: 'JOINING...',
        mpLobbyTitle: 'ğŸ  LOBBY',
        mpLobbySub: 'Share this code with your friends',
        mpCopyTitle: 'Click to copy',
        mpWaitingPlayers: 'Waiting for playersâ€¦',
        mpStartBtn: (n) => n < 2 ? `â–¶ START GAME (need min 2, currently ${n})` : `â–¶ START GAME (${n} players)`,
        mpGuestTitle: 'â³ WAITING FOR HOST',
        mpGuestSub: (code, mode) => `Code: ${code} â€” ${mode === 'turkey' ? 'ğŸ‡¹ğŸ‡· Turkey' : mode === 'europe' ? 'ğŸ‡ªğŸ‡º Europe' : mode === 'flag' ? 'ğŸš© Flags' : 'ğŸŒ World'} â€¢ 12 questions â€¢ Wait for host to start`,
        mpGuestStatus: 'Connected to lobbyâ€¦',
        mpLeave: 'LEAVE LOBBY',
        mpCopied: 'COPIED!',
        mpPlayerCount: (n, mode) => `${n}/5 players â€¢ ${mode === 'turkey' ? 'ğŸ‡¹ğŸ‡· Turkey' : mode === 'europe' ? 'ğŸ‡ªğŸ‡º Europe' : mode === 'flag' ? 'ğŸš© Flags' : 'ğŸŒ World'} â€¢ 12 questions`,
        mpErrConn: 'Connection error!',
        mpErrFull: 'Lobby is full! (Max 5 players)',
        mpErrExists: 'You are already in this lobby!',
        mpErrNotFound: 'Lobby not found or game already started!',
        mpErrLogin: 'You need to be logged in to play multiplayer!',
        mpErrMin2: 'At least 2 players are required!',
        mpGameOver: 'ğŸ† GAME OVER',
        mpBackMenu: 'BACK TO MENU',
        mpWinner: (name) => `ğŸ† WINNER: ${name}`,
        mpYouWin: 'ğŸ† YOU WIN!',
        mpYou: '(You)',
        mpBadge: 'âš”ï¸ MULTI',
        mpBetweenQ: (n) => `QUESTION ${n} RESULTS`,
        mpBetweenFinal: 'FINAL RESULTS',
        mpBetweenSub: (n, total) => `After ${n} of ${total} questions`,
        mpBetweenFinalSub: (total) => `All ${total} questions done`,
        mpThisQ: (pts) => `+${pts} this question`,
        mpNoAns: 'â€” pts (no answer)',
        mpWaitHost: 'Waiting for host to continueâ€¦',
        mpWaitFinal: 'Waiting for final resultsâ€¦',
        mpNextQ: 'â–¶ NEXT QUESTION',
        mpSeeFinal: 'ğŸ† SEE FINAL RESULTS',
        mpLastQ: (n, pts) => `+${pts} on Q${n}`,
        mpMatchmaking: 'âš¡ QUICK MATCH',
        mpBrowse: 'ğŸŒ ACTIVE LOBBIES',
        mpJoinByCode: 'ğŸ”— JOIN WITH CODE',
        mpMatchmakingSelectSub: 'Select mode and see your rank',
        mpStartSearch: 'ğŸ” FIND MATCH',
        mpCancel: 'âœ• CANCEL',
        mpBrowseTitle: 'ğŸŒ ACTIVE LOBBIES',
        mpRefresh: 'ğŸ”„ REFRESH',
        mpBackBtn: 'â† BACK',
        mpResume: 'â–¶ CONTINUE',
        mpLeaveBtn: 'LEAVE LOBBY',
      }
    };

    function t(key, ...args) {
      const val = (T[lang] && T[lang][key]) || (T['tr'][key]) || undefined;
      if (val === undefined) return ''; // key bulunamazsa boÅŸ dÃ¶ndÃ¼r (key adÄ±nÄ± gÃ¶sterme)
      return typeof val === 'function' ? val(...args) : val;
    }

    function setLang(l) {
      try {
        lang = l;
        // Dil butonlarÄ±nÄ± gÃ¼ncelle
        const _ltr = document.getElementById('lang-tr');
        const _len = document.getElementById('lang-en');
        if (_ltr) _ltr.classList.toggle('active', l === 'tr');
        if (_len) _len.classList.toggle('active', l === 'en');
        // Auth ekranÄ± dil butonlarÄ±
        const aLangTr = document.getElementById('auth-lang-tr');
        const aLangEn = document.getElementById('auth-lang-en');
        if (aLangTr && aLangEn) {
          if (l === 'tr') {
            aLangTr.style.background = 'rgba(240,165,0,.12)'; aLangTr.style.borderColor = 'var(--accent)'; aLangTr.style.color = 'var(--accent)';
            aLangEn.style.background = 'transparent'; aLangEn.style.borderColor = 'var(--border)'; aLangEn.style.color = 'var(--muted)';
          } else {
            aLangEn.style.background = 'rgba(240,165,0,.12)'; aLangEn.style.borderColor = 'var(--accent)'; aLangEn.style.color = 'var(--accent)';
            aLangTr.style.background = 'transparent'; aLangTr.style.borderColor = 'var(--border)'; aLangTr.style.color = 'var(--muted)';
          }
        }
        applyLang();
      } catch (e) { console.error('[SETLANG ERROR]', e.message, e.stack); }
    }

    function applyLang() {
      // Auth modal
      (document.getElementById('auth-subtitle') || {}).textContent = t('authSubtitle');
      const _tabs = document.querySelectorAll('.auth-tab');
      if (_tabs[0]) _tabs[0].textContent = t('loginTab');
      if (_tabs[1]) _tabs[1].textContent = t('registerTab');
      if (document.getElementById('auth-forgot-link')) document.getElementById('auth-forgot-link').textContent = lang === 'en' ? 'Forgot password?' : 'Åifremi unuttum';
      if (document.getElementById('auth-back-link')) document.getElementById('auth-back-link').textContent = lang === 'en' ? 'â† Back' : 'â† Geri';
      if (document.getElementById('auth-forgot-btn')) document.getElementById('auth-forgot-btn').textContent = lang === 'en' ? 'SEND' : 'GÃ–NDER';
      if (document.getElementById('auth-username-btn') && !document.getElementById('auth-username-btn').disabled) document.getElementById('auth-username-btn').textContent = t('submit');
      if (_tabs[1]) _tabs[1].textContent = t('registerTab');
      (document.getElementById('auth-username') || {}).placeholder = t('userPlaceholder');
      (document.getElementById('auth-password') || {}).placeholder = t('passPlaceholder');
      const _asb = document.getElementById('auth-submit-btn'); if (_asb && !_asb.disabled) _asb.textContent = t('submit');
      const guestLine = document.getElementById('auth-guest-line');
      if (guestLine) {
        guestLine.innerHTML = (lang === 'tr' ? 'ya da ' : 'or ') + '<a onclick="authGuest()">' + t('guestLink') + '</a>';
      }
      // Welcome
      const el = (id) => document.getElementById(id);
      if (el('btn-play-world')) el('btn-play-world').textContent = lang === 'tr' ? 'ğŸŒ DÃœNYA' : 'ğŸŒ WORLD';
      if (el('btn-play-europe')) el('btn-play-europe').textContent = lang === 'tr' ? 'ğŸ‡ªğŸ‡º AVRUPA' : 'ğŸ‡ªğŸ‡º EUROPE';
      if (el('btn-play-turkey')) el('btn-play-turkey').textContent = lang === 'tr' ? 'ğŸ‡¹ğŸ‡· TÃœRKÄ°YE' : 'ğŸ‡¹ğŸ‡· TURKEY';
      if (el('btn-flag-label')) el('btn-flag-label').textContent = lang === 'tr' ? 'BAYRAK YARIÅI' : 'FLAG QUIZ';
      if (el('mm-flag-label')) el('mm-flag-label').textContent = lang === 'tr' ? 'BAYRAK YARIÅI' : 'FLAG QUIZ';
      const fip = el('flag-input-placeholder'); if (fip) fip.placeholder = lang === 'tr' ? 'Ãœlke adÄ±nÄ± yaz...' : 'Type the country name...';
      const ftl = el('flag-round-info'); // runtime'da gÃ¼ncelleniyor
      if (el('mm-btn-world')) el('mm-btn-world').textContent = lang === 'tr' ? 'ğŸŒ DÃœNYA' : 'ğŸŒ WORLD';
      if (el('mm-btn-europe')) el('mm-btn-europe').textContent = lang === 'tr' ? 'ğŸ‡ªğŸ‡º AVRUPA' : 'ğŸ‡ªğŸ‡º EUROPE';
      if (el('mm-btn-turkey')) el('mm-btn-turkey').textContent = lang === 'tr' ? 'ğŸ‡¹ğŸ‡· TÃœRKÄ°YE' : 'ğŸ‡¹ğŸ‡· TURKEY';
      if (el('mm-btn-resume')) el('mm-btn-resume').textContent = lang === 'tr' ? 'â–¶ OYUNA DEVAM ET' : 'â–¶ RESUME GAME';
      if (el('mm-btn-lb')) el('mm-btn-lb').textContent = lang === 'tr' ? 'ğŸ† LÄ°DERLÄ°K TABLOSU' : 'ğŸ† LEADERBOARD';
      if (el('mm-btn-options')) el('mm-btn-options').textContent = lang === 'tr' ? 'âš™ï¸ SEÃ‡ENEKLER' : 'âš™ï¸ OPTIONS';
      if (el('mm-btn-logout')) el('mm-btn-logout').textContent = lang === 'tr' ? 'ğŸšª Ã‡IKIÅ YAP' : 'ğŸšª LOG OUT';
      if (el('mm-btn-home')) el('mm-btn-home').textContent = lang === 'tr' ? 'ğŸ  ANA MENÃœ' : 'ğŸ  MAIN MENU';
      // Welcome kullanÄ±cÄ± metni dil deÄŸiÅŸince gÃ¼ncelle
      const _userText = document.getElementById('welcome-user-text');
      if (_userText) {
        if (currentUser && !currentUser.isGuest) {
          _userText.innerHTML = t('welcome') + ' <span id="welcome-username">' + currentUser.username + '</span>!';
        } else if (currentUser && currentUser.isGuest) {
          _userText.textContent = t('guest');
        }
      }
      if (el('btn-search-player')) el('btn-search-player').textContent = lang === 'tr' ? 'ğŸ” OYUNCU ARA' : 'ğŸ” SEARCH PLAYER';
      if (el('btn-welcome-lb')) el('btn-welcome-lb').textContent = lang === 'tr' ? 'ğŸ† SKOR TABLOSU' : 'ğŸ† LEADERBOARD';
      // Profil & Arama modal Ã§evirileri
      const el5 = (id) => document.getElementById(id);
      if (el5('search-title')) el5('search-title').textContent = lang === 'tr' ? 'ğŸ” OYUNCU ARA' : 'ğŸ” SEARCH PLAYER';
      if (el5('search-btn')) el5('search-btn').textContent = lang === 'tr' ? 'ARA' : 'SEARCH';
      if (el5('search-close-btn')) el5('search-close-btn').textContent = lang === 'tr' ? 'KAPAT' : 'CLOSE';
      if (el5('search-input')) el5('search-input').placeholder = lang === 'tr' ? 'KullanÄ±cÄ± adÄ±...' : 'Username...';
      if (el5('profile-offline-title')) el5('profile-offline-title').textContent = lang === 'tr' ? 'OFFLÄ°NE Ä°STATÄ°STÄ°KLER' : 'OFFLINE STATS';
      if (el5('profile-online-title')) el5('profile-online-title').textContent = lang === 'tr' ? 'ONLÄ°NE RANKLAR' : 'ONLINE RANKS';
      if (el5('profile-privacy-label')) el5('profile-privacy-label').textContent = lang === 'tr' ? 'Ä°statistiklerimi gizle' : 'Hide my stats';
      if (el5('profile-privacy-label2')) el5('profile-privacy-label2').textContent = lang === 'tr' ? 'Ä°statistiklerimi gizle' : 'Hide my stats';
      if (el('btn-options-welcome')) el('btn-options-welcome').textContent = lang === 'tr' ? 'âš™ï¸ SEÃ‡ENEKLER' : 'âš™ï¸ OPTIONS';
      if (el('btn-welcome-logout')) el('btn-welcome-logout').textContent = lang === 'tr' ? 'ğŸšª Ã‡IKIÅ YAP' : 'ğŸšª LOG OUT';
      if (el('btn-privacy')) el('btn-privacy').textContent = lang === 'tr' ? 'Gizlilik' : 'Privacy';
      if (el('btn-terms')) el('btn-terms').textContent = lang === 'tr' ? 'Åartlar' : 'Terms';
      // Topbar (artÄ±k bu elementler olmayabilir)
      if (el('btn-leaderboard')) el('btn-leaderboard').textContent = 'ğŸ†';
      if (el('btn-logout')) el('btn-logout').textContent = lang === 'tr' ? 'Ã§Ä±kÄ±ÅŸ' : 'logout';
      // Leaderboard
      (document.querySelector('#lb-box h2') || {}).textContent = t('lbTitle');
      (document.getElementById('lb-subtitle') || {}).textContent = t('lbSub');
      (document.getElementById('lb-orientation-note') || {}).textContent = t('lbOrientationNote');
      (document.querySelector('.lb-close') || {}).textContent = t('lbClose');
      (document.getElementById('btn-reset-score') || {}).textContent = t('lbReset');
      // Fullscreen modal
      (document.getElementById('fs-title') || {}).textContent = t('fullscreenTitle');
      (document.getElementById('fs-desc') || {}).textContent = t('fullscreenDesc');
      (document.getElementById('fs-yes') || {}).textContent = t('fullscreenYes');
      (document.getElementById('fs-no') || {}).textContent = t('fullscreenNo');
      (document.getElementById('btn-fullscreen') || {}).textContent = t('fullscreenBtn');
      // Question banner
      (document.getElementById('question-text') || {}).textContent = t('markCity');
      const nextBtn = document.getElementById('btn-next-q');
      if (nextBtn) nextBtn.textContent = t('nextQ');
      // Score/target labels
      const _labels = document.querySelectorAll('.stat-box .label'); if (_labels[0]) _labels[0].textContent = t('score');
      if (_labels[1]) _labels[1].textContent = t('target');
      // Progress label
      const progLabel = document.getElementById('progress-label-text');
      if (progLabel) progLabel.textContent = t('progress');
      // Options modal
      const el2 = (id) => document.getElementById(id);
      if (el2('opt-title')) el2('opt-title').textContent = lang === 'tr' ? 'SEÃ‡ENEKLER' : 'OPTIONS';
      if (el2('opt-subtitle')) el2('opt-subtitle').textContent = lang === 'tr' ? 'Klavye kÄ±sayollarÄ±nÄ± Ã¶zelleÅŸtir' : 'Customize key bindings';
      if (el2('opt-mark-label')) el2('opt-mark-label').textContent = lang === 'tr' ? 'HARÄ°TA Ä°ÅARETLEME' : 'MAP MARK';
      if (el2('opt-mark-desc')) el2('opt-mark-desc').textContent = lang === 'tr' ? 'Fareyle tÄ±kla veya bu tuÅŸa bas' : 'Click on map or press this key';
      if (el2('opt-next-label')) el2('opt-next-label').textContent = lang === 'tr' ? 'SONRAKÄ° SORU' : 'NEXT QUESTION';
      if (el2('opt-next-desc')) el2('opt-next-desc').textContent = lang === 'tr' ? 'Cevaptan sonra devam et' : 'Continue after answering';
      if (el2('opt-zoomin-label')) el2('opt-zoomin-label').textContent = lang === 'tr' ? 'ZOOM ARTIR' : 'ZOOM IN';
      if (el2('opt-zoomin-desc')) el2('opt-zoomin-desc').textContent = lang === 'tr' ? 'HaritayÄ± yakÄ±nlaÅŸtÄ±r' : 'Zoom into the map';
      if (el2('opt-zoomout-label')) el2('opt-zoomout-label').textContent = lang === 'tr' ? 'ZOOM AZALT' : 'ZOOM OUT';
      if (el2('opt-zoomout-desc')) el2('opt-zoomout-desc').textContent = lang === 'tr' ? 'HaritayÄ± uzaklaÅŸtÄ±r' : 'Zoom out of the map';
      if (el2('opt-zoomreset-label')) el2('opt-zoomreset-label').textContent = lang === 'tr' ? 'ZOOM SIFIRLA' : 'ZOOM RESET';
      if (el2('opt-zoomreset-desc')) el2('opt-zoomreset-desc').textContent = lang === 'tr' ? 'HaritayÄ± varsayÄ±lana dÃ¶ndÃ¼r' : 'Reset map to default view';
      if (el2('opt-reset-btn')) el2('opt-reset-btn').textContent = lang === 'tr' ? 'VARSAYILANA DONDUR' : 'RESET DEFAULTS';
      if (el2('opt-close-btn')) el2('opt-close-btn').textContent = lang === 'tr' ? 'KAYDET' : 'SAVE';
      // Multiplayer metinleri
      const el3 = (id) => document.getElementById(id);
      if (el3('btn-mp-label')) el3('btn-mp-label').textContent = t('mp');
      if (el3('btn-multiplayer')) el3('btn-multiplayer').textContent = t('mp');
      if (el3('mm-btn-multiplayer')) el3('mm-btn-multiplayer').textContent = t('mp');
      if (el3('mp-main-h2')) el3('mp-main-h2').textContent = t('mpMainTitle');
      if (el3('mp-main-sub')) el3('mp-main-sub').textContent = t('mpMainSub');
      if (el3('mp-btn-create')) el3('mp-btn-create').textContent = t('mpCreateBtn');
      // mp-btn-join el4 bloÄŸunda gÃ¼ncelleniyor
      if (el3('mp-btn-back-main')) el3('mp-btn-back-main').textContent = t('mpBack');
      if (el3('mp-create-h2')) el3('mp-create-h2').textContent = t('mpCreateTitle');
      if (el3('mp-create-sub')) el3('mp-create-sub').textContent = t('mpCreateSub');
      if (el3('mp-create-go')) el3('mp-create-go').textContent = t('mpCreateGo');
      if (el3('mp-back-create')) el3('mp-back-create').textContent = t('mpBack');
      if (el3('mp-join-h2')) el3('mp-join-h2').textContent = t('mpJoinTitle');
      if (el3('mp-join-sub')) el3('mp-join-sub').textContent = t('mpJoinSub');
      if (el3('mp-join-input')) el3('mp-join-input').placeholder = t('mpJoinPlaceholder');
      if (el3('mp-join-go')) el3('mp-join-go').textContent = t('mpJoinGo');
      if (el3('mp-back-join')) el3('mp-back-join').textContent = t('mpBack');
      if (el3('mp-lobby-h2')) el3('mp-lobby-h2').textContent = t('mpLobbyTitle');
      if (el3('mp-lobby-sub')) el3('mp-lobby-sub').textContent = t('mpLobbySub');
      if (el3('mp-code-display-wrap') && el3('mp-code-display-wrap').title) el3('mp-code-display-wrap').title = t('mpCopyTitle');
      if (el3('mp-host-waiting')) el3('mp-host-waiting').textContent = t('mpWaitingPlayers');
      if (el3('mp-start-label')) el3('mp-start-label').textContent = t('mpStartBtn', 0);
      if (el3('mp-guest-h2')) el3('mp-guest-h2').textContent = t('mpGuestTitle');
      if (el3('mp-guest-connected')) el3('mp-guest-connected').textContent = t('mpGuestStatus');
      if (el3('mp-leave-btn')) el3('mp-leave-btn').textContent = t('mpLeave');
      if (el3('mp-result-title')) el3('mp-result-title').textContent = t('mpGameOver');
      if (el3('mp-back-menu-btn')) el3('mp-back-menu-btn').textContent = t('mpBackMenu');
      const lbTabW = document.getElementById('lb-tab-world');
      if (lbTabW) lbTabW.textContent = lang === 'tr' ? 'ğŸŒ DÃœNYA' : 'ğŸŒ WORLD';
      const lbTabEu = document.getElementById('lb-tab-europe');
      if (lbTabEu) lbTabEu.textContent = lang === 'tr' ? 'ğŸ‡ªğŸ‡º AVRUPA' : 'ğŸ‡ªğŸ‡º EUROPE';
      const lbTabTr = document.getElementById('lb-tab-turkey');
      if (lbTabTr) lbTabTr.textContent = lang === 'tr' ? 'ğŸ‡¹ğŸ‡· TÃœRKÄ°YE' : 'ğŸ‡¹ğŸ‡· TURKEY';
      const lbTabFl = document.getElementById('lb-tab-flag');
      if (lbTabFl) lbTabFl.textContent = lang === 'tr' ? 'ğŸš© BAYRAK' : 'ğŸš© FLAGS';

      // MP â€” yeni ekranlar
      const el4 = (id) => document.getElementById(id);
      if (el4('mp-btn-matchmaking')) el4('mp-btn-matchmaking').textContent = t('mpMatchmaking');
      if (el4('mp-btn-browse')) el4('mp-btn-browse').textContent = t('mpBrowse');
      if (el4('mp-btn-join')) el4('mp-btn-join').textContent = t('mpJoinByCode');
      if (el4('mp-mm-select-sub')) el4('mp-mm-select-sub').textContent = t('mpMatchmakingSelectSub');
      if (el4('mm-start-search-btn')) el4('mm-start-search-btn').textContent = t('mpStartSearch');
      if (el4('mp-mm-cancel')) el4('mp-mm-cancel').textContent = t('mpCancel');
      // Matchmaking baÅŸlÄ±klarÄ±
      const mmSelectH2 = el4('mp-mm-select')?.querySelector('h2');
      if (mmSelectH2) mmSelectH2.textContent = lang === 'en' ? 'âš¡ QUICK MATCH' : 'âš¡ HIZLI EÅLEÅTÄ°R';
      if (el4('mp-mm-h2')) el4('mp-mm-h2').textContent = lang === 'en' ? 'âš¡ MATCHINGâ€¦' : 'âš¡ EÅLEÅTÄ°RÄ°LÄ°YORâ€¦';
      // Join code placeholder
      const joinCode = el4('mp-join-code');
      if (joinCode) joinCode.placeholder = lang === 'en' ? 'LOBBY CODE (4 CHARS)' : 'LOBÄ° KODU (4 HANE)';
      if (el4('mp-browse-h2')) el4('mp-browse-h2').textContent = t('mpBrowseTitle');
      if (el4('mp-browse-refresh')) el4('mp-browse-refresh').textContent = t('mpRefresh');
      if (el4('mp-back-browse')) el4('mp-back-browse').textContent = t('mpBackBtn');
      if (el4('mp-back-create')) el4('mp-back-create').textContent = t('mpBackBtn');
      if (el4('mp-back-join')) el4('mp-back-join').textContent = t('mpBackBtn');
      if (el4('mm-btn-resume')) el4('mm-btn-resume').textContent = t('mpResume');
      if (el4('mp-leave-btn')) el4('mp-leave-btn').textContent = t('mpLeaveBtn');
      if (el4('mp-join-h2')) el4('mp-join-h2').textContent = t('mpJoinByCode');
      // Expand range button labels
      const expandLabel = el4('mp-mm-expand-label');
      if (expandLabel && expandLabel.dataset.i18n !== 'active') {
        expandLabel.textContent = lang === 'en' ? 'No opponent found nearby. Expand rank range?' : 'YakÄ±n rakip bulunamadÄ±. Rank aralÄ±ÄŸÄ± geniÅŸletilsin mi?';
      }
      const expandYes = el4('mp-mm-expand-yes');
      if (expandYes) expandYes.textContent = lang === 'en' ? 'âœ“ YES' : 'âœ“ EVET';
      const expandNo = el4('mp-mm-expand-no');
      if (expandNo) expandNo.textContent = lang === 'en' ? 'âœ• NO' : 'âœ• HAYIR';

      // Lobi oluÅŸturma ekranÄ±
      if (el4('mp-create-private-label')) el4('mp-create-private-label').innerHTML = lang === 'en' ? 'ğŸ”’ Password protect' : 'ğŸ”’ Åifreli lobi';
      if (el4('mp-create-name')) el4('mp-create-name').placeholder = lang === 'en' ? 'LOBBY NAME' : 'LOBÄ° ADI';
      if (el4('mp-create-password')) el4('mp-create-password').placeholder = lang === 'en' ? 'Set password' : 'Åifre belirle';
      if (el4('mp-join-password')) el4('mp-join-password').placeholder = lang === 'en' ? 'Lobby password' : 'Lobi ÅŸifresi';
      if (el4('mp-browse-pw-input')) el4('mp-browse-pw-input').placeholder = lang === 'en' ? 'Enter password' : 'Åifreyi gir';
      if (el4('mp-browse-sub')) el4('mp-browse-sub').textContent = lang === 'en' ? 'Tap open lobby, ğŸ”’ enter password for private' : 'AÃ§Ä±k lobiye tÄ±kla, ğŸ”’ ÅŸifreli lobiye ÅŸifre gir';
      if (el4('mp-browse-empty')) el4('mp-browse-empty').textContent = lang === 'en' ? 'Searchingâ€¦' : 'AranÄ±yorâ€¦';

      // Flag input placeholder  
      const flagInp = document.getElementById('flag-input');
      if (flagInp) flagInp.placeholder = lang === 'en' ? 'Type the country name' : 'Ãœlke adÄ±nÄ± yaz...';

      // flag-portrait-hint
      const fph = document.getElementById('flag-portrait-hint');
      if (fph) fph.textContent = lang === 'en' ? 'ğŸ“± This mode works best in portrait Â· Dikey ekranda daha iyi gÃ¶rÃ¼nÃ¼r' : 'ğŸ“± Bu mod dikey ekranda daha iyi gÃ¶rÃ¼nÃ¼r Â· This mode works best in portrait';

      // Auth username screen  
      if (el4('auth-username-subtitle')) el4('auth-username-subtitle').textContent = lang === 'en' ? 'Choose a username for the leaderboard' : 'Liderlik tablosunda gÃ¶rÃ¼necek kullanÄ±cÄ± adÄ±nÄ± seÃ§';
      if (el4('auth-username-input')) el4('auth-username-input').placeholder = lang === 'en' ? 'Username (2-20 chars)' : 'KullanÄ±cÄ± adÄ± (2-20 karakter)';
      if (el4('auth-forgot-subtitle')) el4('auth-forgot-subtitle').textContent = lang === 'en' ? 'A password reset link will be sent to your email' : 'E-posta adresine ÅŸifre sÄ±fÄ±rlama linki gÃ¶nderilecek';
      if (el4('auth-forgot-email')) el4('auth-forgot-email').placeholder = lang === 'en' ? 'Email' : 'E-posta';
      if (el4('auth-remember-label')) el4('auth-remember-label').textContent = lang === 'en' ? 'Remember me' : 'Beni hatÄ±rla';
      // SÃ¶zleÅŸme onay label'larÄ± â€” her biri ayrÄ±
      const privacyLabel = el4('auth-privacy-label');
      if (privacyLabel) {
        privacyLabel.innerHTML = lang === 'en'
          ? `I have read and accept the <a onclick="openDocModal('privacy')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">Privacy Policy</a>.`
          : `<a onclick="openDocModal('privacy')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">Gizlilik PolitikasÄ±</a>'nÄ± okudum ve kabul ediyorum.`;
      }
      const termsLabel = el4('auth-terms-label');
      if (termsLabel) {
        termsLabel.innerHTML = lang === 'en'
          ? `I have read and accept the <a onclick="openDocModal('terms')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">Terms of Service</a>.`
          : `<a onclick="openDocModal('terms')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">KullanÄ±m ÅartlarÄ±</a>'nÄ± okudum ve kabul ediyorum.`;
      }
      const kvkkLabel = el4('auth-kvkk-row')?.querySelector('span');
      if (kvkkLabel) {
        kvkkLabel.innerHTML = lang === 'en'
          ? `I have read and accept the <a onclick="openDocModal('kvkk')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">KVKK Notice</a>.`
          : `<a onclick="openDocModal('kvkk')" style="color:var(--accent);cursor:pointer;text-decoration:underline;">KVKK AydÄ±nlatma Metni</a>'ni okudum ve kabul ediyorum.`;
      }
    }
    let currentUser = null;

    function hashPassword(pass) {
      let hash = 0;
      for (let i = 0; i < pass.length; i++) {
        const char = pass.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    }

    function switchAuthTab(tab) {
      document.querySelectorAll('.auth-tab').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
      });
      document.getElementById('auth-error').textContent = '';
      document.getElementById('auth-modal').dataset.tab = tab;
      const identifierInp = document.getElementById('auth-identifier');
      const emailInp = document.getElementById('auth-email');
      const termsRow = document.getElementById('auth-terms-row');
      const termsCheck = document.getElementById('auth-terms-check');
      const kvkkCheck = document.getElementById('auth-kvkk-check');
      const rememberRow = document.getElementById('auth-remember-row');
      if (tab === 'register') {
        if (identifierInp) { identifierInp.style.display = 'none'; identifierInp.value = ''; }
        if (emailInp) { emailInp.style.display = 'block'; }
        if (termsRow) termsRow.style.display = 'block';
        if (rememberRow) rememberRow.style.display = 'none';
        if (termsCheck) { termsCheck.checked = false; termsCheck.disabled = true; }
        if (kvkkCheck) { kvkkCheck.checked = false; kvkkCheck.disabled = true; }
        const privacyCheck = document.getElementById('auth-privacy-check');
        if (privacyCheck) { privacyCheck.checked = false; privacyCheck.disabled = true; }
        _showKvkkIfTurkey();
      } else {
        if (identifierInp) { identifierInp.style.display = 'block'; }
        if (emailInp) { emailInp.style.display = 'none'; emailInp.value = ''; }
        if (termsRow) termsRow.style.display = 'none';
        if (rememberRow) rememberRow.style.display = 'flex';
        _fillRememberedCredentials();
      }
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // AUTH SÄ°STEMÄ° â€” Firebase Authentication
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function showAuthMain() {
      document.getElementById('auth-screen-main').style.display = 'block';
      document.getElementById('auth-screen-username').style.display = 'none';
      document.getElementById('auth-screen-forgot').style.display = 'none';
    }
    function showForgotPassword() {
      document.getElementById('auth-screen-main').style.display = 'none';
      document.getElementById('auth-screen-forgot').style.display = 'block';
      const identVal = document.getElementById('auth-identifier');
      const emailVal = document.getElementById('auth-email');
      const val = (identVal && identVal.value.includes('@')) ? identVal.value : (emailVal ? emailVal.value : '');
      if (val) document.getElementById('auth-forgot-email').value = val;
      document.getElementById('auth-forgot-error').textContent = '';
    }

    async function authSendReset() {
      const email = document.getElementById('auth-forgot-email').value.trim();
      const errEl = document.getElementById('auth-forgot-error');
      const btn = document.getElementById('auth-forgot-btn');
      if (!email) { errEl.textContent = 'E-posta girin'; return; }
      btn.disabled = true;
      try {
        await auth.sendPasswordResetEmail(email);
        errEl.style.color = 'var(--green)';
        errEl.textContent = 'Åifre sÄ±fÄ±rlama e-postasÄ± gÃ¶nderildi!';
        setTimeout(() => { errEl.style.color = ''; showAuthMain(); }, 2500);
      } catch (e) {
        errEl.style.color = '';
        errEl.textContent = e.code === 'auth/user-not-found' ? 'Bu e-posta ile kayÄ±tlÄ± kullanÄ±cÄ± yok.'
          : e.code === 'auth/invalid-email' ? 'GeÃ§ersiz e-posta.'
            : 'Hata: ' + e.message;
      }
      btn.disabled = false;
    }

    let _authSubmitting = false;
    let _authSubmitTimeout = null;
    function _clearAuthSubmit() {
      _authSubmitting = false;
      if (_authSubmitTimeout) { clearTimeout(_authSubmitTimeout); _authSubmitTimeout = null; }
    }
    async function authSubmit() {
      if (_authSubmitting) return;
      _authSubmitting = true;
      // Safety: release the lock after 15s no matter what (network timeout etc.)
      _authSubmitTimeout = setTimeout(_clearAuthSubmit, 15000);
      const tab = document.getElementById('auth-modal').dataset.tab || 'login';
      const rawPassword = (document.getElementById('auth-password').value || '');
      const password = rawPassword.length < 6 ? rawPassword + ('_gb_' + rawPassword).slice(0, 6 - rawPassword.length) : rawPassword;
      const errEl = document.getElementById('auth-error');
      const btn = document.getElementById('auth-submit-btn');
      const btnOrigText = btn.textContent;

      errEl.textContent = '';
      if (!rawPassword) { errEl.textContent = lang === 'en' ? 'Enter password' : 'Åifre girin'; _clearAuthSubmit(); return; }

      btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = lang === 'en' ? 'Please wait...' : 'LÃ¼tfen bekle...';

      const _resetBtn = () => { btn.disabled = false; btn.style.opacity = ''; btn.textContent = t('submit'); _clearAuthSubmit(); };

      try {
        let fireUser;
        if (tab === 'register') {
          // SÃ¶zleÅŸme onayÄ± kontrolÃ¼
          const privacyCheck = document.getElementById('auth-privacy-check');
          const termsCheck = document.getElementById('auth-terms-check');
          const kvkkCheck = document.getElementById('auth-kvkk-check');
          const kvkkRow = document.getElementById('auth-kvkk-row');
          const kvkkRequired = kvkkRow && kvkkRow.style.display !== 'none';
          if (!privacyCheck || !privacyCheck.checked) {
            errEl.textContent = lang === 'en'
              ? 'Please read and accept the Privacy Policy.'
              : 'LÃ¼tfen Gizlilik PolitikasÄ±\'nÄ± okuyup onaylayÄ±n.';
            _resetBtn(); return;
          }
          if (!termsCheck || !termsCheck.checked) {
            errEl.textContent = lang === 'en'
              ? 'Please read and accept the Terms of Service.'
              : 'LÃ¼tfen KullanÄ±m ÅartlarÄ±\'nÄ± okuyup onaylayÄ±n.';
            _resetBtn(); return;
          }
          if (kvkkRequired && (!kvkkCheck || !kvkkCheck.checked)) {
            errEl.textContent = lang === 'en'
              ? 'Please read and accept the KVKK Notice.'
              : 'LÃ¼tfen KVKK AydÄ±nlatma Metni\'ni okuyup onaylayÄ±n.';
            _resetBtn(); return;
          }
          // KayÄ±t: e-posta zorunlu
          const email = (document.getElementById('auth-email').value || '').trim();
          if (!email) { errEl.textContent = lang === 'en' ? 'Enter email' : 'E-posta girin'; _resetBtn(); return; }
          const cred = await auth.createUserWithEmailAndPassword(email, password);
          fireUser = cred.user;
          _resetBtn();
          document.getElementById('auth-screen-main').style.display = 'none';
          document.getElementById('auth-screen-username').style.display = 'block';
          document.getElementById('auth-username-input').focus();
          window._pendingFireUser = fireUser;
          return;
        } else {
          // GiriÅŸ: e-posta veya kullanÄ±cÄ± adÄ±
          const identifier = (document.getElementById('auth-identifier').value || '').trim();
          if (!identifier) { errEl.textContent = lang === 'en' ? 'Enter email or username' : 'E-posta veya kullanÄ±cÄ± adÄ± girin'; _resetBtn(); return; }
          const isEmail = identifier.includes('@');
          let loginEmail = identifier;
          if (!isEmail) {
            // KullanÄ±cÄ± adÄ±yla giriÅŸ â€” Firestore'dan e-posta bul (5s timeout)
            try {
              const key = identifier.toLowerCase();
              const snap = await Promise.race([
                db.collection('users').doc(key).get(),
                new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), 5000))
              ]);
              if (!snap.exists) { errEl.textContent = lang === 'en' ? 'User not found.' : 'KullanÄ±cÄ± bulunamadÄ±.'; _resetBtn(); return; }
              loginEmail = snap.data().email;
              if (!loginEmail) { errEl.textContent = lang === 'en' ? 'No email on file. Use email to log in.' : 'E-posta bulunamadÄ±. E-posta ile giriÅŸ dene.'; _resetBtn(); return; }
            } catch (fe) {
              errEl.textContent = fe.code === 'timeout'
                ? (lang === 'en' ? 'Connection slow. Please retry.' : 'BaÄŸlantÄ± yavaÅŸ. Tekrar dene.')
                : 'ğŸ“¶ ' + (lang === 'en' ? 'Connection error.' : 'BaÄŸlantÄ± hatasÄ±.');
              _resetBtn(); return;
            }
          }
          // Firebase Auth ile giriÅŸ (10s timeout)
          const cred = await Promise.race([
            auth.signInWithEmailAndPassword(loginEmail, password),
            new Promise((_, rej) => setTimeout(() => rej({ code: 'auth/timeout' }), 10000))
          ]);
          fireUser = cred.user;
        }
        // Beni HatÄ±rla
        const rememberCheck = document.getElementById('auth-remember-check');
        if (rememberCheck && rememberCheck.checked) {
          const identifier = (document.getElementById('auth-identifier').value || '').trim();
          const rawPw = document.getElementById('auth-password').value || '';
          _saveRememberedCredentials(identifier, rawPw);
        } else {
          _clearRememberedCredentials();
        }
        await _loadUserFromFirestore(fireUser.uid, '');
        _resetBtn();
      } catch (e) {
        _resetBtn();
        errEl.textContent =
          e.code === 'auth/timeout' ? (lang === 'en' ? 'Connection timed out. Check your internet.' : 'BaÄŸlantÄ± zaman aÅŸÄ±mÄ±. Ä°nterneti kontrol et.') :
            e.code === 'auth/user-not-found' ? (lang === 'en' ? 'User not found.' : 'KullanÄ±cÄ± bulunamadÄ±.') :
              e.code === 'auth/wrong-password' ? (lang === 'en' ? 'Wrong password.' : 'YanlÄ±ÅŸ ÅŸifre.') :
                e.code === 'auth/invalid-credential' ? (lang === 'en' ? 'Wrong credentials.' : 'GiriÅŸ bilgileri hatalÄ±.') :
                  e.code === 'auth/email-already-in-use' ? (lang === 'en' ? 'Email already registered.' : 'Bu e-posta zaten kayÄ±tlÄ±.') :
                    e.code === 'auth/invalid-email' ? (lang === 'en' ? 'Invalid email.' : 'GeÃ§ersiz e-posta.') :
                      e.code === 'auth/network-request-failed' ? 'ğŸ“¶ ' + (lang === 'en' ? 'No internet connection.' : 'Ä°nternet baÄŸlantÄ±sÄ± yok.') :
                        'Hata: ' + (e.message || e.code);
      }
    }

    async function authSetUsername() {
      const username = (document.getElementById('auth-username-input').value || '').trim();
      const errEl = document.getElementById('auth-username-error');
      const btn = document.getElementById('auth-username-btn');
      if (!username || username.length < 2) { errEl.textContent = 'KullanÄ±cÄ± adÄ± en az 2 karakter olmalÄ±'; return; }
      if (username.length > 20) { errEl.textContent = 'KullanÄ±cÄ± adÄ± en fazla 20 karakter olabilir'; return; }
      if (!/^[a-zA-Z0-9_Ã€-É]+$/.test(username)) { errEl.textContent = 'Sadece harf, rakam ve _ kullanÄ±labilir'; return; }
      btn.disabled = true; btn.style.opacity = '0.6';
      // KullanÄ±cÄ± adÄ± benzersiz mi?
      const key = username.toLowerCase();
      try {
        const snap = await db.collection('users').doc(key).get();
        if (snap.exists) { errEl.textContent = 'Bu kullanÄ±cÄ± adÄ± alÄ±nmÄ±ÅŸ, baÅŸka birini dene'; btn.disabled = false; btn.style.opacity = ''; return; }
        const fireUser = window._pendingFireUser || auth.currentUser;
        const userData = { username, uid: fireUser.uid, email: fireUser.email || '', bestScore: 0, bestLevel: 0, gamesPlayed: 0, bestScoreTurkey: 0, bestScoreFlag: 0, created: Date.now() };
        await db.collection('users').doc(key).set(userData);
        await db.collection('uid_to_username').doc(fireUser.uid).set({ username, key });
        window._pendingFireUser = null;
        currentUser = userData;
        errEl.textContent = '';
        btn.disabled = false; btn.style.opacity = '';
        onAuthSuccess();
      } catch (e) {
        errEl.textContent = 'Hata: ' + e.message;
        btn.disabled = false; btn.style.opacity = '';
      }
    }

    async function _loadUserFromFirestore(uid, email) {
      // uid â†’ username map
      const mapSnap = await db.collection('uid_to_username').doc(uid).get();
      if (mapSnap.exists) {
        const { key } = mapSnap.data();
        const userSnap = await db.collection('users').doc(key).get();
        if (userSnap.exists) {
          currentUser = userSnap.data();
window._geomeisterUser = currentUser;
          onAuthSuccess();
          return;
        }
      }
      // uid_to_username yok â†’ kullanÄ±cÄ± adÄ± ekranÄ±na git (eski hesap migrasyonu)
      window._pendingFireUser = auth.currentUser;
      document.getElementById('auth-screen-main').style.display = 'none';
      document.getElementById('auth-screen-username').style.display = 'block';
      document.getElementById('auth-username-input').focus();
    }

    function mpWatchSession(userRef, mySessionId) {
      // Session izleme devre dÄ±ÅŸÄ±
    }

    function authGuest() {
      currentUser = null;
      onAuthSuccess();
    }

    function authLogout() {
      // Ã–NCE watcher'Ä± durdur, sonra Firebase'e yaz (yoksa kendi silme iÅŸlemimizi "baÅŸka cihaz" sanÄ±r)
      if (window._sessionHeartbeat) { clearInterval(window._sessionHeartbeat); window._sessionHeartbeat = null; }
      if (window._sessionWatcher) { window._sessionWatcher(); window._sessionWatcher = null; }
      // Firestore'daki sessionId'yi temizle
      if (window._mySessionRef && window._mySessionId) {
        const refToClean = window._mySessionRef;
        const idToClean = window._mySessionId;
        refToClean.get().then(snap => {
          if (snap.exists && snap.data().sessionId === idToClean) {
            refToClean.update({ sessionId: '', sessionAt: 0 }).catch(() => { });
          }
        }).catch(() => { });
      }
      window._mySessionId = null;
      window._mySessionRef = null;
      currentUser = null;
      gameMode = 'world';
      _loggingOut = true;
      _clearRememberedCredentials(); // Ã§Ä±kÄ±ÅŸ yapÄ±nca kayÄ±tlÄ± bilgileri sil
      if (auth) auth.signOut().catch(() => { }).finally(() => { setTimeout(() => { _loggingOut = false; }, 1000); });
      const savedLang = lang;
      document.getElementById('welcome-modal').style.display = 'none';
      document.getElementById('overlay').classList.add('hidden');
      document.getElementById('lb-modal').classList.add('hidden');
      document.getElementById('auth-modal').dataset.tab = 'login';
      document.getElementById('auth-email').value = '';
      document.getElementById('auth-password').value = '';
      document.getElementById('auth-error').textContent = '';
      document.getElementById('auth-modal').classList.remove('hidden');
      stopTimer();
      setLang(savedLang);
    }

    // Privacy Policy ve Terms of Service
    function showPrivacyPolicy() {
      const tr = lang !== 'en';
      const date = new Date().toLocaleDateString(tr ? 'tr-TR' : 'en-US');
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.97);z-index:600;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:20px;padding:32px;max-width:500px;width:92%;max-height:80vh;overflow-y:auto;">
          <h2 style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--accent);margin-bottom:16px;text-align:center;">
            ${tr ? 'GÄ°ZLÄ°LÄ°K POLÄ°TÄ°KASI' : 'PRIVACY POLICY'}
          </h2>
          <div style="color:var(--text);line-height:1.6;font-size:.9rem;">
            <p><strong>${tr ? 'Son gÃ¼ncelleme' : 'Last updated'}:</strong> ${date}</p>
            <br>
            <p><strong>${tr ? '1. Toplanan Bilgiler' : '1. Information We Collect'}</strong></p>
            <p>â€¢ ${tr ? 'KullanÄ±cÄ± adÄ± ve e-posta adresi (kayÄ±t iÃ§in)' : 'Username and email address (for registration)'}</p>
            <p>â€¢ ${tr ? 'Oyun skorlarÄ± ve istatistikleri' : 'Game scores and statistics'}</p>
            <p>â€¢ ${tr ? 'Cihaz bilgileri (performans optimizasyonu iÃ§in)' : 'Device information (for performance optimization)'}</p>
            <br>
            <p><strong>${tr ? '2. Bilgilerin KullanÄ±mÄ±' : '2. How We Use Your Information'}</strong></p>
            <p>â€¢ ${tr ? 'Oyun deneyimini kiÅŸiselleÅŸtirmek' : 'To personalize your game experience'}</p>
            <p>â€¢ ${tr ? 'Liderlik tablolarÄ±nÄ± gÃ¼ncellemek' : 'To update leaderboards'}</p>
            <p>â€¢ ${tr ? 'Teknik destek saÄŸlamak' : 'To provide technical support'}</p>
            <br>
            <p><strong>${tr ? '3. Bilgi PaylaÅŸÄ±mÄ±' : '3. Information Sharing'}</strong></p>
            <p>${tr ? 'KiÅŸisel bilgileriniz Ã¼Ã§Ã¼ncÃ¼ taraflarla paylaÅŸÄ±lmaz.' : 'Your personal information is not shared with third parties.'}</p>
            <br>
            <p><strong>${tr ? '4. Ä°letiÅŸim' : '4. Contact'}</strong></p>
            <p>${tr ? 'SorularÄ±nÄ±z iÃ§in' : 'For questions'}: aresmungan@gmail.com</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="width:100%;margin-top:20px;padding:12px;background:var(--accent);color:#000;border:none;border-radius:10px;font-family:'Bebas Neue',cursive;font-size:1.1rem;cursor:pointer;">
            ${tr ? 'TAMAM' : 'OK'}
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    function showTermsOfService() {
      const tr = lang !== 'en';
      const date = new Date().toLocaleDateString(tr ? 'tr-TR' : 'en-US');
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.97);z-index:600;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:20px;padding:32px;max-width:500px;width:92%;max-height:80vh;overflow-y:auto;">
          <h2 style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:var(--accent);margin-bottom:16px;text-align:center;">
            ${tr ? 'KULLANIM ÅARTLARI' : 'TERMS OF SERVICE'}
          </h2>
          <div style="color:var(--text);line-height:1.6;font-size:.9rem;">
            <p><strong>${tr ? 'Son gÃ¼ncelleme' : 'Last updated'}:</strong> ${date}</p>
            <br>
            <p><strong>${tr ? '1. Kabul Edilen Åartlar' : '1. Acceptance of Terms'}</strong></p>
            <p>${tr ? 'Bu oyunu kullanarak aÅŸaÄŸÄ±daki ÅŸartlarÄ± kabul etmiÅŸ olursunuz.' : 'By using this game, you agree to the following terms.'}</p>
            <br>
            <p><strong>${tr ? '2. KullanÄ±m KurallarÄ±' : '2. Usage Rules'}</strong></p>
            <p>â€¢ ${tr ? 'Oyunu adil ÅŸekilde oynayÄ±n' : 'Play the game fairly'}</p>
            <p>â€¢ ${tr ? 'Hileli yazÄ±lÄ±m kullanmayÄ±n' : 'Do not use cheating software'}</p>
            <p>â€¢ ${tr ? 'DiÄŸer oyunculara saygÄ±lÄ± davranÄ±n' : 'Be respectful to other players'}</p>
            <br>
            <p><strong>${tr ? '3. Hesap SorumluluÄŸu' : '3. Account Responsibility'}</strong></p>
            <p>${tr ? 'HesabÄ±nÄ±zÄ±n gÃ¼venliÄŸinden siz sorumlusunuz.' : 'You are responsible for the security of your account.'}</p>
            <br>
            <p><strong>${tr ? '4. Hizmet DeÄŸiÅŸiklikleri' : '4. Service Changes'}</strong></p>
            <p>${tr ? 'Oyun Ã¶zelliklerini Ã¶nceden haber vermeksizin deÄŸiÅŸtirebiliriz.' : 'We may change game features without prior notice.'}</p>
            <br>
            <p><strong>${tr ? '5. Ä°letiÅŸim' : '5. Contact'}</strong></p>
            <p>${tr ? 'SorularÄ±nÄ±z iÃ§in' : 'For questions'}: aresmungan@gmail.com</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="width:100%;margin-top:20px;padding:12px;background:var(--accent);color:#000;border:none;border-radius:10px;font-family:'Bebas Neue',cursive;font-size:1.1rem;cursor:pointer;">
            ${tr ? 'TAMAM' : 'OK'}
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    function showKvkk() {
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.97);z-index:600;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:20px;padding:32px;max-width:500px;width:92%;max-height:80vh;overflow-y:auto;">
          <h2 style="font-family:'Bebas Neue',cursive;font-size:1.6rem;color:var(--accent);margin-bottom:16px;text-align:center;">KVKK AYDINLATMA METNÄ°</h2>
          <div style="color:var(--text);line-height:1.6;font-size:.85rem;">
            <p><strong>Veri Sorumlusu:</strong> Ares | aresmungan@gmail.com</p><br>
            <p><strong>Toplanan Veriler:</strong> KullanÄ±cÄ± adÄ±, e-posta, oyun skorlarÄ±, cihaz bilgisi.</p><br>
            <p><strong>Ä°ÅŸleme AmaÃ§larÄ±:</strong> Oyun hizmeti sunmak, liderlik tablosu yÃ¶netimi, teknik destek.</p><br>
            <p><strong>AktarÄ±m:</strong> Google Firebase (kimlik doÄŸrulama, veritabanÄ±) ve Google AdMob (reklam) ile paylaÅŸÄ±lÄ±r.</p><br>
            <p><strong>HaklarÄ±nÄ±z (KVKK m.11):</strong> Verilerinize eriÅŸim, dÃ¼zeltme, silme ve itiraz hakkÄ±na sahipsiniz. BaÅŸvuru: aresmungan@gmail.com</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="width:100%;margin-top:20px;padding:12px;background:var(--accent);color:#000;border:none;border-radius:10px;font-family:'Bebas Neue',cursive;font-size:1.1rem;cursor:pointer;">TAMAM</button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Belge modalÄ± â€” iframe ile HTML dosyasÄ±nÄ± aÃ§, sonuna kadar okunmadan checkbox aktif olmaz
    function openDocModal(type) {
      const urls = { privacy: 'privacy.html', terms: 'terms.html', kvkk: 'kvkk.html' };
      const checkIds = { privacy: 'auth-privacy-check', terms: 'auth-terms-check', kvkk: 'auth-kvkk-check' };
      const hintIds = { privacy: 'auth-privacy-hint', terms: 'auth-terms-hint', kvkk: 'auth-kvkk-hint' };
      const url = (lang === 'en' && type === 'privacy') ? 'privacy_en.html'
                : (lang === 'en' && type === 'terms') ? 'terms_en.html'
                : urls[type];
      const checkId = checkIds[type];
      const hintId = hintIds[type];

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.97);z-index:700;display:flex;flex-direction:column;';
      overlay.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--panel);border-bottom:1px solid var(--border);flex-shrink:0;">
          <span style="font-family:\'Bebas Neue\',cursive;font-size:1.1rem;color:var(--accent);letter-spacing:2px;" id="doc-modal-title">YÃ¼kleniyorâ€¦</span>
          <button onclick="this.closest('[data-doc-overlay]').remove()" style="background:transparent;border:none;color:var(--muted);font-size:1.4rem;cursor:pointer;padding:4px 8px;">âœ•</button>
        </div>
        <iframe src="${url}" style="flex:1;border:none;background:#fff;" id="doc-iframe"></iframe>
        <div style="padding:12px 16px;background:var(--panel);border-top:1px solid var(--border);flex-shrink:0;text-align:center;">
          <div id="doc-scroll-hint" style="color:var(--accent);font-size:.82rem;margin-bottom:8px;">
            ${lang === 'en' ? 'â¬‡ Scroll to the bottom to accept' : 'â¬‡ Kabul etmek iÃ§in sayfanÄ±n sonuna kadar kaydÄ±rÄ±n'}
          </div>
          <button id="doc-accept-btn" disabled
            style="width:100%;padding:12px;background:var(--border);color:var(--muted);border:none;border-radius:10px;font-family:\'Bebas Neue\',cursive;font-size:1.1rem;letter-spacing:2px;cursor:not-allowed;transition:all .2s;">
            ${lang === 'en' ? 'READ TO END TO ACCEPT' : 'KABUL ETMEK Ä°Ã‡Ä°N SONUNA KADAR OKU'}
          </button>
        </div>
      `;
      overlay.setAttribute('data-doc-overlay', '1');
      document.body.appendChild(overlay);

      // iframe yÃ¼klenince scroll takibi baÅŸlat
      const iframe = overlay.querySelector('#doc-iframe');
      const acceptBtn = overlay.querySelector('#doc-accept-btn');
      const scrollHint = overlay.querySelector('#doc-scroll-hint');
      const titleEl = overlay.querySelector('#doc-modal-title');

      iframe.onload = () => {
        try {
          const titles = { privacy: lang === 'en' ? 'Privacy Policy' : 'Gizlilik PolitikasÄ±', terms: lang === 'en' ? 'Terms of Service' : 'KullanÄ±m ÅartlarÄ±', kvkk: 'KVKK' };
          titleEl.textContent = titles[type] || '';
          const iDoc = iframe.contentDocument || iframe.contentWindow.document;
          const iWin = iframe.contentWindow;
          const hasCheckbox = !!document.getElementById(checkId);

          const unlock = () => {
            acceptBtn.disabled = false;
            acceptBtn.style.background = 'linear-gradient(135deg,var(--accent2),var(--accent))';
            acceptBtn.style.color = '#000';
            acceptBtn.style.cursor = 'pointer';
            acceptBtn.textContent = hasCheckbox
              ? (lang === 'en' ? 'ACCEPT' : 'KABUL ET')
              : (lang === 'en' ? 'CLOSE' : 'KAPAT');
            scrollHint.style.display = 'none';
          };

          // Welcome ekranÄ±ndan aÃ§Ä±ldÄ±ysa (checkbox yok) veya daha Ã¶nce okunmuÅŸsa direkt aktif et
          if (!hasCheckbox || alreadyRead) { unlock(); return; }

          // YÃ¶ntem 1: #doc-end IntersectionObserver
          const endEl = iDoc.getElementById('doc-end');
          if (endEl && iWin.IntersectionObserver) {
            const obs = new iWin.IntersectionObserver(entries => {
              if (entries[0].isIntersecting) { unlock(); obs.disconnect(); }
            }, { threshold: 0.1 });
            obs.observe(endEl);
          }

          // YÃ¶ntem 2: scroll fallback
          const checkScroll = () => {
            const scrolled = iDoc.documentElement.scrollTop || iDoc.body.scrollTop;
            const total = iDoc.documentElement.scrollHeight - iDoc.documentElement.clientHeight;
            if (total <= 10 || scrolled >= total - 60) unlock();
          };
          iWin.addEventListener('scroll', checkScroll, { passive: true });
          checkScroll();
        } catch(e) {
          // cross-origin fallback
          acceptBtn.disabled = false;
          acceptBtn.style.background = 'linear-gradient(135deg,var(--accent2),var(--accent))';
          acceptBtn.style.color = '#000';
          acceptBtn.style.cursor = 'pointer';
          acceptBtn.textContent = lang === 'en' ? 'CLOSE' : 'KAPAT';
          scrollHint.style.display = 'none';
        }
      };

      // Buton metni: checkbox varsa "Kabul Et", yoksa "Kapat"
      const hasCheckbox = !!document.getElementById(checkId);
      // Daha Ã¶nce okunmuÅŸsa (disabled=false) direkt aktif aÃ§
      const cb0 = document.getElementById(checkId);
      const alreadyRead = cb0 && !cb0.disabled;
      acceptBtn.textContent = hasCheckbox
        ? (lang === 'en' ? 'READ TO END TO ACCEPT' : 'KABUL ETMEK Ä°Ã‡Ä°N SONUNA KADAR OKU')
        : (lang === 'en' ? 'CLOSE' : 'KAPAT');
      // Welcome'dan aÃ§Ä±lÄ±nca scroll hint'i gizle
      if (!hasCheckbox) scrollHint.style.display = 'none';

      acceptBtn.onclick = () => {
        if (acceptBtn.disabled) return;
        const cb = document.getElementById(checkId);
        if (cb) { cb.checked = true; cb.disabled = false; }
        const hint = document.getElementById(hintId);
        if (hint) hint.style.display = 'none';
        overlay.remove();
      };
    }

    // TÃ¼rkiye IP kontrolÃ¼ â€” KVKK satÄ±rÄ±nÄ± gÃ¶ster/gizle
    let _isTurkeyUser = null;
    async function _showKvkkIfTurkey() {
      const kvkkRow = document.getElementById('auth-kvkk-row');
      if (!kvkkRow) return;
      // Daha Ã¶nce kontrol edildiyse cache kullan
      if (_isTurkeyUser !== null) {
        kvkkRow.style.display = _isTurkeyUser ? 'block' : 'none';
        return;
      }
      // TarayÄ±cÄ± dili TÃ¼rkÃ§e ise bÃ¼yÃ¼k ihtimalle TR kullanÄ±cÄ±sÄ±
      const browserLang = navigator.language || navigator.userLanguage || '';
      if (browserLang.toLowerCase().startsWith('tr')) {
        _isTurkeyUser = true;
        kvkkRow.style.display = 'block';
        return;
      }
      // IP tabanlÄ± kontrol
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        _isTurkeyUser = data.country_code === 'TR';
      } catch(e) {
        _isTurkeyUser = false;
      }
      kvkkRow.style.display = _isTurkeyUser ? 'block' : 'none';
    }

    // ===== BENÄ° HATIRLA =====
    const REMEMBER_KEY = 'geomeister_remember';

    function _saveRememberedCredentials(identifier, password) {
      try {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ identifier, password }));
      } catch(e) {}
    }

    function _clearRememberedCredentials() {
      try { localStorage.removeItem(REMEMBER_KEY); } catch(e) {}
    }

    function _fillRememberedCredentials() {
      try {
        const raw = localStorage.getItem(REMEMBER_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        const identifierInp = document.getElementById('auth-identifier');
        const passwordInp = document.getElementById('auth-password');
        const rememberCheck = document.getElementById('auth-remember-check');
        if (identifierInp && data.identifier) identifierInp.value = data.identifier;
        if (passwordInp && data.password) passwordInp.value = data.password;
        if (rememberCheck) rememberCheck.checked = true;
      } catch(e) {}
    }

    // ===== KEYBIND SÄ°STEMÄ° =====
    const DEFAULT_BINDS = { mark: 'Space', next: 'Enter', zoomin: 'Equal', zoomout: 'Minus', zoomreset: 'KeyR' };
    let keybinds = Object.assign({}, DEFAULT_BINDS);
    let rebindTarget = null;

    function loadKeybinds() {
      try {
        const saved = localStorage.getItem('geomeister_keybinds');
        if (saved) keybinds = Object.assign({}, DEFAULT_BINDS, JSON.parse(saved));
      } catch (e) { }
      applyKeybindUI();
    }

    function saveKeybinds() {
      try { localStorage.setItem('geomeister_keybinds', JSON.stringify(keybinds)); } catch (e) { }
    }

    function applyKeybindUI() {
      Object.keys(keybinds).forEach(action => {
        const btn = document.getElementById('keybind-' + action);
        if (btn) btn.textContent = formatKey(keybinds[action]);
      });
    }

    function formatKey(code) {
      const map = {
        Space: 'SPACE', Enter: 'ENTER', Equal: '+', Minus: '-', KeyR: 'R',
        ArrowUp: 'â†‘', ArrowDown: 'â†“', ArrowLeft: 'â†', ArrowRight: 'â†’'
      };
      if (map[code]) return map[code];
      if (code.startsWith('Key')) return code.slice(3);
      if (code.startsWith('Digit')) return code.slice(5);
      return code;
    }

    function startRebind(btn) {
      if (rebindTarget) {
        rebindTarget.classList.remove('listening');
      }
      rebindTarget = btn;
      btn.classList.add('listening');
      btn.textContent = '...';
      const hint = document.getElementById('rebind-hint');
      if (hint) hint.textContent = lang === 'tr' ? 'âŒ¨ï¸ Yeni tuÅŸa bas...' : 'âŒ¨ï¸ Press a new key...';
    }

    function resetKeybinds() {
      keybinds = Object.assign({}, DEFAULT_BINDS);
      saveKeybinds();
      applyKeybindUI();
    }

    document.addEventListener('keydown', function (e) {
      if (rebindTarget) {
        e.preventDefault();
        const action = rebindTarget.dataset.action;
        keybinds[action] = e.code;
        saveKeybinds();
        applyKeybindUI();
        rebindTarget.classList.remove('listening');
        rebindTarget = null;
        const hint = document.getElementById('rebind-hint');
        if (hint) hint.textContent = lang === 'tr' ? 'âœ“ Kaydedildi' : 'âœ“ Saved';
        setTimeout(() => { if (hint) hint.textContent = ''; }, 1500);
        return;
      }
      // Normal keybind actions (sadece oyun sÄ±rasÄ±nda)
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (document.getElementById('auth-modal') && !document.getElementById('auth-modal').classList.contains('hidden')) return;
      if (document.getElementById('welcome-modal') && document.getElementById('welcome-modal').style.display === 'flex') return;
      if (document.getElementById('main-menu-modal') && document.getElementById('main-menu-modal').style.display === 'flex') return;
      if (document.getElementById('mp-modal') && document.getElementById('mp-modal').classList.contains('open')) return;
      if (e.code === keybinds.next) { e.preventDefault(); const nb = document.getElementById('next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      if (e.code === keybinds.zoomin) { e.preventDefault(); document.getElementById('btn-zoom-in') && document.getElementById('btn-zoom-in').click(); }
      if (e.code === keybinds.zoomout) { e.preventDefault(); document.getElementById('btn-zoom-out') && document.getElementById('btn-zoom-out').click(); }
      if (e.code === keybinds.zoomreset) { e.preventDefault(); document.getElementById('btn-zoom-r') && document.getElementById('btn-zoom-r').click(); }
    });

    // opt-reset-btn onclick
    document.addEventListener('DOMContentLoaded', function () {
      const resetBtn = document.getElementById('opt-reset-btn');
      if (resetBtn) resetBtn.onclick = function () { resetKeybinds(); };
      const closeBtn = document.getElementById('opt-close-btn');
      if (closeBtn) closeBtn.onclick = function () { closeOptions(); };

      // â”€â”€ iOS MOBILE LOGIN FIX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Timestamp tabanlÄ± debounce: touchend â†’ fn() Ã§aÄŸÄ±r, 800ms iÃ§inde gelen
      // click event'ini yoksay. stopPropagation/preventDefault SADECE buton iÃ§in,
      // input'lara DOKUNMA â€” klavye aÃ§Ä±lmasÄ±nÄ± engeller.

      function _bindAuthBtn(id, fn) {
        const el = document.getElementById(id);
        if (!el) return;
        let _lastFire = 0;
        el.addEventListener('touchstart', function () {
          this.style.opacity = '0.75';
        }, { passive: true });
        el.addEventListener('touchend', function (e) {
          e.preventDefault(); // synthetic click'i durdur
          this.style.opacity = '';
          const now = Date.now();
          if (now - _lastFire > 600) { _lastFire = now; fn(); }
        }, { passive: false });
        el.addEventListener('touchcancel', function () {
          this.style.opacity = '';
        }, { passive: true });
        // Desktop mouse click
        el.addEventListener('click', function () {
          const now = Date.now();
          if (now - _lastFire > 600) { _lastFire = now; fn(); }
        });
      }

      _bindAuthBtn('auth-submit-btn', authSubmit);
      _bindAuthBtn('auth-username-btn', authSetUsername);
      _bindAuthBtn('auth-forgot-btn', authSendReset);

      // Input'lar iÃ§in addTouchFix YOK â€” preventDefault klavyeyi engeller
      // iOS input focus iÃ§in sadece focus event + scrollIntoView yeterli

      // Guest link
      const guestLink = document.querySelector('#auth-guest-line a');
      if (guestLink) {
        let _gt = 0;
        guestLink.addEventListener('touchend', function (e) {
          e.preventDefault();
          const now = Date.now();
          if (now - _gt > 600) { _gt = now; authGuest(); }
        }, { passive: false });
        guestLink.addEventListener('click', function () {
          const now = Date.now();
          if (now - _gt > 600) { _gt = now; authGuest(); }
        });
      }

      // Auth tab buttons
      const tabLogin = document.getElementById('auth-tab-login');
      const tabReg = document.getElementById('auth-tab-register');
      function _bindTab(el, tab) {
        if (!el) return;
        let _tt = 0;
        el.addEventListener('touchend', function (e) { e.preventDefault(); const n = Date.now(); if (n - _tt > 600) { _tt = n; switchAuthTab(tab); } }, { passive: false });
        el.addEventListener('click', function () { const n = Date.now(); if (n - _tt > 600) { _tt = n; switchAuthTab(tab); } });
      }
      _bindTab(tabLogin, 'login');
      _bindTab(tabReg, 'register');

      // Language buttons
      const alTr = document.getElementById('auth-lang-tr');
      const alEn = document.getElementById('auth-lang-en');
      function _bindLang(el, l) {
        if (!el) return;
        let _lt = 0;
        el.addEventListener('touchend', function (e) { e.preventDefault(); const n = Date.now(); if (n - _lt > 600) { _lt = n; setLang(l); } }, { passive: false });
        el.addEventListener('click', function () { const n = Date.now(); if (n - _lt > 600) { _lt = n; setLang(l); } });
      }
      _bindLang(alTr, 'tr');
      _bindLang(alEn, 'en');

      // Forgot / back links
      function _bindLink(id, fn) {
        const el = document.getElementById(id);
        if (!el) return;
        let _ft = 0;
        el.addEventListener('touchend', function (e) { e.preventDefault(); const n = Date.now(); if (n - _ft > 600) { _ft = n; fn(); } }, { passive: false });
        el.addEventListener('click', function () { const n = Date.now(); if (n - _ft > 600) { _ft = n; fn(); } });
      }
      _bindLink('auth-forgot-link', showForgotPassword);
      _bindLink('auth-back-link', showAuthMain);
      // â”€â”€ END iOS MOBILE LOGIN FIX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    });

    function onAuthSuccess() {
      document.getElementById('auth-modal').classList.add('hidden');
      // Harita verilerini arka planda cache'e al
      if (typeof prefetchMapData === 'function') prefetchMapData();
      // HaritayÄ± baÅŸlat (daha Ã¶nce yapÄ±lmadÄ±ysa)
      if (!markersG) initMap();
      // Welcome modal'Ä± gÃ¶ster
      const wm = document.getElementById('welcome-modal');
      wm.style.display = 'flex';
      wm.style.visibility = 'visible';
      wm.style.pointerEvents = 'auto';
      wm.style.zIndex = '450';
      const nameEl = document.getElementById('welcome-username');
      const userText = document.getElementById('welcome-user-text');
      if (currentUser) {
        nameEl.textContent = currentUser.username;
        userText.innerHTML = t('welcome') + ' <span id="welcome-username">' + currentUser.username + '</span>!';
      } else {
        userText.textContent = t('guest');
      }
      applyLang();
      updateUserUI();
      loadKeybinds();
      // Eski hesaplar iÃ§in wins_/losses_ alanlarÄ±nÄ± arka planda initialize et
      if (currentUser && db) _initWinsLossesIfMissing();
    }

    // Eski hesaplar iÃ§in wins_/losses_ alanlarÄ±nÄ± 0 ile initialize et (bir kez)
    async function _initWinsLossesIfMissing() {
      if (!currentUser || !db) return;
      const key = currentUser.username.toLowerCase();
      try {
        const snap = await db.collection('users').doc(key).get();
        if (!snap.exists) return;
        const u = snap.data();
        const modes = ['world', 'europe', 'turkey', 'flag'];
        const updates = {};
        modes.forEach(m => {
          if (u['wins_' + m] === undefined) updates['wins_' + m] = 0;
          if (u['losses_' + m] === undefined) updates['losses_' + m] = 0;
        });
        if (Object.keys(updates).length > 0) {
          await db.collection('users').doc(key).update(updates);
          Object.assign(currentUser, updates);
        }
        // Aktif MP oyununa reconnect dene â€” baÅŸarÄ±lÄ±ysa forfeit kontrolÃ¼ yapma
        const reconnected = await _checkAndReconnectMpGame();
        if (reconnected) return;
        // Sayfa kapanma forfeit kontrolÃ¼: Ã¶nceki oturumda forfeit yazÄ±ldÄ±ysa ELO dÃ¼ÅŸÃ¼r
        await _checkPendingForfeit();
      } catch(e) { /* sessizce geÃ§ */ }
    }

    // Ã–nceki oturumda aktif MP oyunu varsa yeniden baÄŸlan
    async function _checkAndReconnectMpGame() {
      if (!currentUser || !db) return false;
      try {
        const myUsername = currentUser.username;
        const savedKey = 'active_mp_lobby_' + myUsername;
        const saved = localStorage.getItem(savedKey);
        if (!saved) return false;

        const { lobbyId, isBot, timestamp } = JSON.parse(saved);
        if (!lobbyId) return false;

        // 20 saniyeden eskiyse reconnect etme â€” forfeit sÃ¼resi geÃ§miÅŸ
        if (Date.now() - timestamp > 20 * 1000) {
          localStorage.removeItem(savedKey);
          return false;
        }

        // Firestore'dan lobi durumunu kontrol et
        const snap = await db.collection('mp_lobbies').doc(lobbyId).get();
        if (!snap.exists) { localStorage.removeItem(savedKey); return false; }

        const lobby = snap.data();

        // Lobi bitmiÅŸse reconnect etme
        if (lobby.status === 'finished') { localStorage.removeItem(savedKey); return false; }

        // Oyuncu hÃ¢lÃ¢ lobide mi?
        if (!lobby.players || !lobby.players[myUsername]) { localStorage.removeItem(savedKey); return false; }

        // Lobi aktif â€” reconnect et
        localStorage.removeItem(savedKey);
        // GerÃ§ek maÃ§: pending forfeit kaydÄ±nÄ± temizle â€” reconnect oldu, forfeit iÅŸlenmemeli
        if (!isBot) {
          localStorage.removeItem('pending_forfeit_' + lobbyId);
        }

        // MP state'ini restore et
        mpLobbyId = lobbyId;
        mpLobby = lobby;
        mpIsHost = lobby.hostId === myUsername;
        mpMode = lobby.mode || 'world';
        mpQuestions = lobby.questions || [];
        mpMyScore = (lobby.scores || {})[myUsername] || 0;

        // Welcome modal'Ä± kapat
        const wm = document.getElementById('welcome-modal');
        if (wm) { wm.style.display = 'none'; wm.style.visibility = 'hidden'; }
        document.getElementById('mp-modal').classList.remove('open');

        // Lobi listener'Ä± baÅŸlat â€” bu mpStartMultiplayerGame'i tetikleyecek
        mpSubscribeLobby();

        // EÄŸer oyun zaten playing durumundaysa direkt baÅŸlat
        if (lobby.status === 'playing') {
          // questionIndex'i Firestore'daki mevcut soruya ayarla
          const currentQ = lobby.currentQuestion || 0;
          state.questionIndex = currentQ;
          await mpStartMultiplayerGame();
          // DoÄŸru soruya atla
          if (state.questionIndex !== currentQ) {
            state.questionIndex = currentQ;
            mpLoadQuestion();
          }
        }

        return true;
      } catch (e) {
        console.warn('Reconnect error:', e);
        return false;
      }
    }

    // Ã–nceki oturumda sayfa kapanarak Ã§Ä±kÄ±ldÄ±ysa ELO'yu gÃ¼ncelle
    async function _checkPendingForfeit() {
      if (!currentUser || !db) return;
      try {
        const myUsername = currentUser.username;

        // 1) localStorage'daki pending forfeit kayÄ±tlarÄ±nÄ± kontrol et
        //    (sendBeacon baÅŸarÄ±sÄ±z olsa bile bu Ã§alÄ±ÅŸÄ±r)
        const pendingKeys = Object.keys(localStorage).filter(k => k.startsWith('pending_forfeit_'));
        for (const key of pendingKeys) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data || data.username !== myUsername) continue;
            // 1 saatten eski kayÄ±tlarÄ± temizle, iÅŸleme
            if (Date.now() - data.timestamp > 60 * 60 * 1000) {
              localStorage.removeItem(key);
              continue;
            }
            const processedKey = 'forfeit_processed_' + data.lobbyId;
            if (localStorage.getItem(processedKey)) {
              localStorage.removeItem(key); // iÅŸlendi, temizle
              continue;
            }
            await updateRankAfterMatch(false, data.mode || 'world');
            localStorage.setItem(processedKey, '1');
            localStorage.removeItem(key);
          } catch(e) { /* sessizce geÃ§ */ }
        }

        // 2) Firestore'daki forfeit kayÄ±tlarÄ±nÄ± kontrol et (sendBeacon baÅŸarÄ±lÄ±ysa)
        const tenMinAgo = Date.now() - 10 * 60 * 1000;
        const snap = await db.collection('mp_lobbies')
          .where('forfeitedBy', '==', myUsername)
          .where('status', '==', 'finished')
          .where('finishedAt', '>', tenMinAgo)
          .limit(5).get();
        if (snap.empty) return;
        for (const doc of snap.docs) {
          const lobby = doc.data();
          const processedKey = 'forfeit_processed_' + doc.id;
          if (localStorage.getItem(processedKey)) continue; // zaten iÅŸlendi
          await updateRankAfterMatch(false, lobby.mode || 'world');
          localStorage.setItem(processedKey, '1');
          // EÄŸer localStorage'da pending kaydÄ± varsa temizle
          localStorage.removeItem('pending_forfeit_' + doc.id);
        }
      } catch(e) { /* sessizce geÃ§ */ }
    }

    function goToWelcome() {
      // Her yerden ana ekrana dÃ¶n â€” tÃ¼m ekranlarÄ±/overlay'leri kapat
      if (typeof stopTimer === 'function') stopTimer();
      if (typeof hideFlagScreen === 'function') hideFlagScreen();
      // MP oyunundaysa lobi'yi temizle (host ise sil, guest ise Ã§Ä±k)
      if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
        mpLeaveLobby(); return; // mpLeaveLobby zaten goToWelcome'a yÃ¶nlendirir
      }

      const ids = ['overlay', 'main-menu-modal', 'flag-between-overlay'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('hidden');
        el.style.display = 'none';
      });
      const toast = document.getElementById('result-toast');
      if (toast) { toast.classList.remove('show'); toast.style.display = 'none'; }
      const mpo = document.getElementById('mp-between-overlay');
      if (mpo) mpo.classList.remove('show');

      // HaritayÄ± temizle
      if (typeof clearMarkers === 'function') clearMarkers();

      // Welcome modal'Ä± gÃ¶ster
      const wm = document.getElementById('welcome-modal');
      if (wm) {
        wm.style.display = 'flex';
        wm.style.visibility = 'visible';
        wm.style.pointerEvents = 'auto';
        wm.style.zIndex = '450';
        
        // Banner reklam gÃ¶ster
        setTimeout(() => {
          showBannerAd('welcome-banner-ad');
        }, 500);
      }
    }

    function startGame() {
      const wm = document.getElementById('welcome-modal');
      wm.style.display = 'none';
      wm.style.visibility = 'hidden';
      wm.style.pointerEvents = 'none';
      wm.style.zIndex = '-1';
      document.getElementById('overlay').classList.add('hidden');
      document.getElementById('main-menu-modal').style.display = 'none';
      state.level = 1; state.totalScore = 0;
      resetAdGameFlag();
      // Ã–nceki oyundan kalma toast'u temizle
      const toast = document.getElementById('result-toast');
      if (toast) { toast.classList.remove('show'); toast.style.display = 'none'; toast.style.bottom = ''; }
      startLevel();
    }

    function welcomeStart(mode) {
      gameMode = mode || 'world';
      startGame();
    }

    function updateUserUI() {
      // Premium rozet
      const existingBadge = document.getElementById('premium-badge');
      if (isPremium()) {
        if (!existingBadge) {
          const badge = document.createElement('span');
          badge.id = 'premium-badge';
          badge.title = 'Premium Ãœye';
          badge.style.cssText = 'font-size:.75rem;background:linear-gradient(135deg,#e05c2a,#f0a500);color:#000;padding:2px 7px;border-radius:10px;font-family:Lato,sans-serif;font-weight:700;letter-spacing:1px;margin-left:4px;';
          badge.textContent = 'â­ PRO';
          const nameEl2 = document.getElementById('user-name-display');
          if (nameEl2) nameEl2.after(badge);
        }
      } else {
        if (existingBadge) existingBadge.remove();
      }
      const avatarEl = document.getElementById('user-avatar');
      const nameEl = document.getElementById('user-name-display');
      if (currentUser) {
        avatarEl.textContent = currentUser.username[0].toUpperCase();
        nameEl.textContent = currentUser.username;
      } else {
        avatarEl.textContent = '?';
        nameEl.textContent = lang === 'en' ? 'Guest' : 'Misafir';
      }
    }

    function dbReady() { return db !== null; }

    // ===== PREMIUM & REKLAM SÄ°STEMÄ° =====

    function isPremium() {
      return !!(currentUser && currentUser.premium === true);
    }

    // --- Reklam limitleri (gÃ¼nlÃ¼k) ---
    // Normal (interstitial): gÃ¼nde max 5, her 3 oyun sonunda 1
    // Ã–dÃ¼llÃ¼ (rewarded): gÃ¼nde max 5, oyun baÅŸÄ±na max 1
    const AD_LIMITS = { interstitial: 5, rewarded: 5 };

    function getAdStorage() {
      const today = new Date().toDateString();
      try {
        const raw = localStorage.getItem('geomeister_ads');
        const data = raw ? JSON.parse(raw) : {};
        if (data.date !== today) return { date: today, interstitial: 0, rewarded: 0, rewardedThisGame: false };
        return data;
      } catch (e) { return { date: today, interstitial: 0, rewarded: 0, rewardedThisGame: false }; }
    }

    function saveAdStorage(data) {
      try { localStorage.setItem('geomeister_ads', JSON.stringify(data)); } catch (e) { }
    }

    function canShowAd(type) {
      if (isPremium()) return false;
      const data = getAdStorage();
      if (type === 'rewarded') return data.rewarded < AD_LIMITS.rewarded && !data.rewardedThisGame;
      return data[type] < AD_LIMITS[type];
    }

    function recordAd(type) {
      const data = getAdStorage();
      data[type] = (data[type] || 0) + 1;
      if (type === 'rewarded') data.rewardedThisGame = true;
      saveAdStorage(data);
    }

    // Yeni oyun baÅŸlayÄ±nca rewardedThisGame sÄ±fÄ±rla
    function resetAdGameFlag() {
      const data = getAdStorage();
      data.rewardedThisGame = false;
      saveAdStorage(data);
    }

    // ===== GOOGLE ADS FUNCTIONS =====
    
    // Banner reklam gÃ¶ster
    function showBannerAd(containerId) {
      if (isPremium()) return;
      
      const container = document.getElementById(containerId);
      if (!container) return;
      
      try {
        // AdSense banner kodu buraya gelecek
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
        adElement.setAttribute('data-ad-slot', 'BANNER_SLOT_ID');
        adElement.setAttribute('data-ad-format', 'auto');
        
        container.innerHTML = '';
        container.appendChild(adElement);
        
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Banner ad error - fallback to placeholder
        container.innerHTML = '<div class="banner-ad">Reklam AlanÄ±</div>';
      }
    }
    
    // Interstitial reklam gÃ¶ster
    function showInterstitialAd(onClose) {
      if (isPremium() || !canShowAd('interstitial')) {
        if (onClose) onClose();
        return;
      }
      
      recordAd('interstitial');
      
      try {
        // AdSense interstitial kodu buraya gelecek
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
        adElement.setAttribute('data-ad-slot', 'INTERSTITIAL_SLOT_ID');
        adElement.setAttribute('data-ad-format', 'auto');
        
        // Interstitial overlay oluÅŸtur
        const overlay = document.createElement('div');
        overlay.className = 'interstitial-ad';
        overlay.style.display = 'flex';
        
        const content = document.createElement('div');
        content.className = 'interstitial-content';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ad-close-btn';
        closeBtn.innerHTML = 'Ã—';
        closeBtn.onclick = () => {
          document.body.removeChild(overlay);
          if (onClose) onClose();
        };
        
        content.appendChild(adElement);
        overlay.appendChild(content);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        (adsbygoogle = window.adsbygoogle || []).push({});
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
            if (onClose) onClose();
          }
        }, 5000);
        
      } catch (e) {
        if (onClose) onClose();
      }
    }
    
    // Rewarded reklam gÃ¶ster
    function showRewardedAd(onReward, onClose) {
      if (isPremium() || !canShowAd('rewarded')) {
        if (onClose) onClose();
        return;
      }
      
      recordAd('rewarded');
      
      try {
        // AdSense rewarded kodu buraya gelecek
        // Åimdilik basit modal gÃ¶ster
        const overlay = document.createElement('div');
        overlay.className = 'interstitial-ad';
        overlay.style.display = 'flex';
        
        const content = document.createElement('div');
        content.className = 'interstitial-content';
        content.innerHTML = `
          <h3 style="color: var(--accent); margin-bottom: 10px;">Ã–dÃ¼llÃ¼ Reklam</h3>
          <p style="margin-bottom: 15px;">ReklamÄ± izleyerek bonus kazanÄ±n!</p>
          <button onclick="this.parentElement.parentElement.remove(); if(${onReward}) ${onReward}();" 
                  style="background: var(--green); color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px;">
            Ä°zle ve Kazan
          </button>
          <button onclick="this.parentElement.parentElement.remove(); if(${onClose}) ${onClose}();" 
                  style="background: var(--red); color: white; border: none; padding: 10px 20px; border-radius: 5px;">
            Ä°ptal
          </button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
      } catch (e) {
        if (onClose) onClose();
      }
    }
    
    // Premium kontrol
    function isPremium() {
      // Premium kullanÄ±cÄ± kontrolÃ¼ - ÅŸimdilik false
      return false;
    }

    // Offline: her 3 oyundan sonra 1 zorunlu reklam
    // Online:  her 2 oyundan sonra 1 zorunlu reklam
    let _offlineGamesPlayed = 0;
    let _onlineGamesPlayed  = 0;

    function maybeShowInterstitialAfterGame(onDone, isOnline) {
      if (isPremium()) { onDone(); return; }

      if (isOnline) {
        _onlineGamesPlayed++;
        if (_onlineGamesPlayed >= 2) {
          _onlineGamesPlayed = 0;
          showInterstitialAd(onDone);
          return;
        }
      } else {
        _offlineGamesPlayed++;
        if (_offlineGamesPlayed >= 3) {
          _offlineGamesPlayed = 0;
          showInterstitialAd(onDone);
          return;
        }
      }
      onDone();
    }

    // BaÅŸarÄ±sÄ±zlÄ±k sonrasÄ± Ã¶dÃ¼llÃ¼ reklam teklifi
    function offerRewardedAd(onRewarded, onSkip) {
      const canShow = canShowAd('rewarded');
      if (!canShow) {
        setTimeout(onSkip, 0);
        return;
      }
      showRewardedAd(onRewarded, onSkip);
    }

    function closeAd() {
      const div = document.getElementById('ad-overlay');
      if (div) div.remove();
    }

    // Premium satÄ±n alma modal
    function showPremiumModal() {
      closeAd();
      const existing = document.getElementById('premium-modal');
      if (existing) existing.remove();
      const div = document.createElement('div');
      div.id = 'premium-modal';
      div.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,26,.97);z-index:810;display:flex;align-items:center;justify-content:center;';
      div.innerHTML = `
    <div style="background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:36px 40px;text-align:center;max-width:400px;width:92%;">
      <div style="font-family:'Bebas Neue',cursive;font-size:2.2rem;color:#f0a500;letter-spacing:3px;margin-bottom:4px;">â­ PREMÄ°UM</div>
      <div style="color:#5a6a80;font-size:.85rem;margin-bottom:24px;">ReklamsÄ±z, sÄ±nÄ±rsÄ±z oyun deneyimi</div>
      <div style="background:rgba(240,165,0,.06);border:1px solid rgba(240,165,0,.2);border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="font-family:'Bebas Neue',cursive;font-size:2.8rem;color:#f0a500;">â‚º10</div>
        <div style="color:#d4dce8;font-size:.85rem;margin-top:8px;line-height:1.6;">
          âœ… TÃ¼m reklamlar kaldÄ±rÄ±lÄ±r<br>
          âœ… Tek seferlik Ã¶deme<br>
          âœ… Sonsuza kadar reklamsÄ±z<br>
          âœ… Premium rozet
        </div>
      </div>
      <div style="color:#5a6a80;font-size:.78rem;margin-bottom:16px;">Tek seferlik Ã¶deme â€” sonsuza kadar reklamsÄ±z.</div>
      <button type="button" onclick="initiatePurchase()" style="background:linear-gradient(135deg,#e05c2a,#f0a500);color:#000;border:none;border-radius:10px;padding:14px;font-family:'Bebas Neue',cursive;font-size:1.2rem;letter-spacing:2px;cursor:pointer;width:100%;margin-bottom:10px;">SATIN AL â€” â‚º10</button>
      <button type="button" id="premium-cancel-btn" style="background:transparent;color:#5a6a80;border:1px solid #1e2d45;border-radius:8px;padding:10px;font-size:.85rem;cursor:pointer;width:100%;">Åimdi deÄŸil</button>
    </div>`;
      document.body.appendChild(div);
      div.querySelector('#premium-cancel-btn').addEventListener('click', () => {
        div.remove();
        // Interstitial ad overlay varsa kapat
        const adOv = document.getElementById('ad-overlay');
        if (adOv) adOv.remove();
        if (window._pendingAdDone) {
          const fn = window._pendingAdDone;
          window._pendingAdDone = null;
          fn();
        }
      });
    }

    async function initiatePurchase() {
      if (window.getDigitalGoodsService) {
        try {
          const service = await window.getDigitalGoodsService('https://play.google.com/billing');
          const request = new PaymentRequest([{
            supportedMethods: 'https://play.google.com/billing',
            data: { sku: 'geomeister_premium' }
          }], { total: { label: 'GeoMeister Premium', amount: { currency: 'TRY', value: '10.00' } } });
          const response = await request.show();
          await response.complete('success');
          await activatePremium(response.details.token);
        } catch (e) { console.error('Purchase failed:', e); }
      } else {
        alert('Bu Ã¶zellik Google Play uygulamasÄ±nda Ã§alÄ±ÅŸÄ±r.');
      }
    }

    async function activatePremium(purchaseToken) {
      if (!currentUser || !dbReady()) return;
      try {
        const key = currentUser.username.toLowerCase();
        await db.collection('users').doc(key).update({
          premium: true, premiumType: 'lifetime',
          premiumSince: Date.now(), premiumToken: purchaseToken || 'manual'
        });
        currentUser.premium = true;
        document.getElementById('premium-modal') && document.getElementById('premium-modal').remove();
        updateUserUI();
        alert('ğŸ‰ Premium Ã¼yeliÄŸiniz aktif edildi!');
      } catch (e) { console.error('Premium activation error:', e); }
    }


    // ===== PREMIUM & REKLAM SÄ°STEMÄ° =====
    // isPremium() â€” kullanÄ±cÄ±nÄ±n premium Ã¼ye olup olmadÄ±ÄŸÄ±nÄ± dÃ¶ndÃ¼rÃ¼r
    function isPremium() {
      return !!(currentUser && currentUser.premium === true);
    }

    // Premium satÄ±n alma modal


    // Google Play Billing entegrasyonu (TWA / Play Store)
    async function initiatePurchase() {
      // Google Play Billing API (Trusted Web Activity iÃ§inde Ã§alÄ±ÅŸÄ±r)
      if (window.getDigitalGoodsService) {
        try {
          const service = await window.getDigitalGoodsService('https://play.google.com/billing');
          const details = await service.getDetails(['geomeister_premium']);
          const request = new PaymentRequest([{
            supportedMethods: 'https://play.google.com/billing',
            data: { sku: 'geomeister_premium' }
          }], { total: { label: 'GeoMeister Premium', amount: { currency: 'TRY', value: '10.00' } } });
          const response = await request.show();
          await response.complete('success');
          // SatÄ±n alma baÅŸarÄ±lÄ± - kullanÄ±cÄ±yÄ± premium yap
          await activatePremium(response.details.token);
        } catch (e) {
          console.error('Purchase failed:', e);
          alert('SatÄ±n alma baÅŸarÄ±sÄ±z: ' + e.message);
        }
      } else {
        // TarayÄ±cÄ±da test modu - gerÃ§ek uygulamada bu kod Ã§alÄ±ÅŸmaz
        alert('Bu Ã¶zellik Google Play uygulamasÄ±nda Ã§alÄ±ÅŸÄ±r.');
      }
    }

    // Premium aktifleÅŸtir (satÄ±n alma doÄŸrulandÄ±ktan sonra)
    async function activatePremium(purchaseToken) {
      if (!currentUser || !dbReady()) return;
      try {
        const key = currentUser.username.toLowerCase();
        await db.collection('users').doc(key).update({
          premium: true,
          premiumType: 'lifetime',
          premiumSince: Date.now(),
          premiumToken: purchaseToken || 'manual'
        });
        currentUser.premium = true;
        document.getElementById('premium-modal') && document.getElementById('premium-modal').remove();
        // Premium rozet gÃ¼ncelle
        updateUserUI();
        alert('ğŸ‰ Premium Ã¼yeliÄŸiniz aktif edildi!');
      } catch (e) {
        console.error('Premium activation error:', e);
      }
    }

    async function saveScore(thisGameScore, thisGameLevel) {
      if (!currentUser || !dbReady()) return;
      const key = currentUser.username.toLowerCase();
      try {
        const userRef = db.collection('users').doc(key);
        const snap = await userRef.get();
        let userData = snap.exists ? snap.data() : Object.assign({}, currentUser);
        userData.gamesPlayed = (userData.gamesPlayed || 0) + 1;
        if (gameMode === 'turkey') {
          userData.gamesPlayedTurkey = (userData.gamesPlayedTurkey || 0) + 1;
          if (thisGameScore > (userData.bestScoreTurkey || 0)) userData.bestScoreTurkey = thisGameScore;
          if (thisGameLevel > (userData.bestLevelTurkey || 0)) userData.bestLevelTurkey = thisGameLevel;
        } else if (gameMode === 'europe') {
          userData.gamesPlayedEurope = (userData.gamesPlayedEurope || 0) + 1;
          if (thisGameScore > (userData.bestScoreEurope || 0)) userData.bestScoreEurope = thisGameScore;
          if (thisGameLevel > (userData.bestLevelEurope || 0)) userData.bestLevelEurope = thisGameLevel;
        } else if (gameMode === 'flag') {
          userData.gamesPlayedFlag = (userData.gamesPlayedFlag || 0) + 1;
          if (thisGameScore > (userData.bestScoreFlag || 0)) userData.bestScoreFlag = thisGameScore;
          if (thisGameLevel > (userData.bestLevelFlag || 0)) userData.bestLevelFlag = thisGameLevel;
        } else {
          userData.gamesPlayedWorld = (userData.gamesPlayedWorld || 0) + 1;
          if (thisGameScore > (userData.bestScore || 0)) userData.bestScore = thisGameScore;
          if (thisGameLevel > (userData.bestLevel || 0)) userData.bestLevel = thisGameLevel;
        }
        userData.lastPlayed = Date.now();
        await userRef.set(userData);
        currentUser = userData;
        updateUserUI();
      } catch (e) { console.error('Score save error:', e); }
    }

    let lbOrigin = null; // 'welcome' | 'overlay' | null

    let lbCurrentMode = 'world';
    let lbCurrentPage = 0;
    const LB_PAGE_SIZE = 10;
    let lbAllUsers = [];

    async function showLeaderboard(origin, lbMode) {
      if (origin !== undefined) lbOrigin = origin || lbOrigin;
      const mode = lbMode || lbCurrentMode || 'world';
      lbCurrentMode = mode;
      lbCurrentPage = 0;
      if (origin === 'welcome') document.getElementById('welcome-modal').style.display = 'none';
      document.getElementById('lb-modal').classList.remove('hidden');

      const orientNote = document.getElementById('lb-orientation-note');
      if (orientNote) {
        orientNote.style.display = window.innerWidth > window.innerHeight ? 'block' : 'none';
        orientNote.textContent = t('lbOrientationNote');
      }
      // Tab aktiflik
      ['world', 'europe', 'turkey', 'flag'].forEach(m => {
        const btn = document.getElementById('lb-tab-' + m);
        if (btn) btn.classList.toggle('active', m === mode);
      });

      const titles = {
        turkey: 'ğŸ‡¹ğŸ‡· ' + (lang === 'tr' ? 'TÃœRKÄ°YE SKOR TABLOSU' : 'TURKEY LEADERBOARD'),
        europe: 'ğŸ‡ªğŸ‡º ' + (lang === 'tr' ? 'AVRUPA SKOR TABLOSU' : 'EUROPE LEADERBOARD'),
        flag: 'ğŸš© ' + (lang === 'tr' ? 'BAYRAK YARIÅI SKOR TABLOSU' : 'FLAG QUIZ LEADERBOARD'),
      };
      document.querySelector('#lb-box h2').textContent = titles[mode] || t('lbTitle');
      (document.getElementById('lb-subtitle') || {}).textContent = t('lbSub');

      const scoreField = { turkey: 'bestScoreTurkey', europe: 'bestScoreEurope', flag: 'bestScoreFlag' }[mode] || 'bestScore';
      const levelField = { turkey: 'bestLevelTurkey', europe: 'bestLevelEurope', flag: 'bestLevelFlag' }[mode] || 'bestLevel';
      const gamesField = { turkey: 'gamesPlayedTurkey', europe: 'gamesPlayedEurope', flag: 'gamesPlayedFlag' }[mode] || 'gamesPlayedWorld';

      const listEl = document.getElementById('lb-list');
      listEl.innerHTML = '<div class="lb-loading">' + t('lbLoading') + '</div>';
      document.getElementById('lb-pagination').style.display = 'none';

      try {
        const snap = await db.collection('users').orderBy(scoreField, 'desc').limit(200).get();
        lbAllUsers = [];
        snap.forEach(d => {
          const u = d.data();
          // Sadece Firebase Auth ile oluÅŸturulmuÅŸ yeni hesaplar (uid alanÄ± var)
          if (u.uid && (u[scoreField] || 0) > 0) lbAllUsers.push({ ...u, _sf: scoreField, _lf: levelField, _gf: gamesField });
        });
        lbRenderPage(0);
      } catch (e) {
        listEl.innerHTML = '<div class="lb-loading">' + t('lbFail') + ': ' + e.message + '</div>';
      }
    }

    function lbRenderPage(page) {
      lbCurrentPage = page;
      const listEl = document.getElementById('lb-list');
      const pagEl = document.getElementById('lb-pagination');
      if (lbAllUsers.length === 0) {
        listEl.innerHTML = '<div class="lb-loading">' + t('lbEmpty') + '</div>';
        pagEl.style.display = 'none'; return;
      }
      const totalPages = Math.ceil(lbAllUsers.length / LB_PAGE_SIZE);
      const start = page * LB_PAGE_SIZE;
      const slice = lbAllUsers.slice(start, start + LB_PAGE_SIZE);
      const rankEmojis = ['ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰'];
      listEl.innerHTML = slice.map((u, i) => {
        const globalRank = start + i;
        const isMe = currentUser && u.username.toLowerCase() === currentUser.username.toLowerCase();
        const rankClass = globalRank < 3 ? ['gold', 'silver', 'bronze'][globalRank] : 'other';
        const rankLabel = globalRank < 3 ? rankEmojis[globalRank] : '#' + (globalRank + 1);
        return '<div class="lb-row' + (isMe ? ' lb-me-row' : '') + '" onclick="openProfileByUsername(\'' + u.username + '\')" style="cursor:pointer;" title="' + (lang === 'en' ? 'View profile' : 'Profili gÃ¶rÃ¼ntÃ¼le') + '">' +
          '<div class="lb-rank ' + rankClass + '">' + rankLabel + '</div>' +
          '<div class="lb-avatar">' + u.username[0].toUpperCase() + '</div>' +
          '<div class="lb-name' + (isMe ? ' me' : '') + '">' + u.username + (isMe ? ' (' + (lang === 'tr' ? 'Sen' : 'You') + ')' : '') + '</div>' +
          '<div style="text-align:right">' +
          '<div class="lb-score">' + (u[u._sf] || 0).toLocaleString() + '</div>' +
          '<div class="lb-level">' + t('level') + (u[u._lf] || 0) + ' &middot; ' + (u[u._gf] || 0) + ' ' + t('games') + '</div>' +
          '</div></div>';
      }).join('');

      // Sayfalama butonlarÄ±
      if (totalPages > 1) {
        pagEl.style.display = 'flex';
        const prevDisabled = page === 0;
        const nextDisabled = page >= totalPages - 1;
        const rangeStart = page * LB_PAGE_SIZE + 1;
        const rangeEnd = Math.min((page + 1) * LB_PAGE_SIZE, lbAllUsers.length);
        const btnStyle = (disabled, active) =>
          'padding:7px 14px;border-radius:8px;border:1px solid ' + (active ? 'var(--accent)' : disabled ? 'rgba(255,255,255,.08)' : 'var(--border)') +
          ';background:' + (active ? 'rgba(240,165,0,.15)' : 'transparent') +
          ';color:' + (disabled ? 'rgba(255,255,255,.2)' : active ? 'var(--accent)' : 'var(--muted)') +
          ';font-family:Lato,sans-serif;font-size:.85rem;cursor:' + (disabled ? 'default' : 'pointer') +
          ';pointer-events:' + (disabled ? 'none' : 'auto') + ';';
        let btns = '<button type="button" onclick="lbRenderPage(' + (page - 1) + ')" style="' + btnStyle(prevDisabled, false) + '">â€¹ ' + (lang === 'en' ? 'Prev' : 'Ã–nceki') + '</button>';
        btns += '<span style="color:var(--muted);font-size:.8rem;padding:7px 10px;align-self:center;">' + (lang === 'en' ? 'Page' : 'Sayfa') + ' ' + (page + 1) + ' / ' + totalPages + '<br><span style="font-size:.7rem;opacity:.6">' + rangeStart + 'â€“' + rangeEnd + '</span></span>';
        btns += '<button type="button" onclick="lbRenderPage(' + (page + 1) + ')" style="' + btnStyle(nextDisabled, false) + '">' + (lang === 'en' ? 'Next' : 'Sonraki') + ' â€º</button>';
        pagEl.innerHTML = btns;
      } else {
        pagEl.style.display = 'none';
      }
    }


    // ===== OYUNCU PROFÄ°L SÄ°STEMÄ° =====

    function openOwnProfile() {
      if (!currentUser) return;
      openProfileByUsername(currentUser.username);
    }

    function openSearchModal() {
      document.getElementById('search-modal').classList.add('open');
      document.getElementById('search-input').value = '';
      document.getElementById('search-results').innerHTML = '';
      setTimeout(() => document.getElementById('search-input').focus(), 100);
    }

    function closeSearchModal() {
      document.getElementById('search-modal').classList.remove('open');
    }

    function closeProfileModal() {
      document.getElementById('profile-modal').classList.remove('open');
    }

    async function doPlayerSearch() {
      const q = (document.getElementById('search-input').value || '').trim().toLowerCase();
      const resultsEl = document.getElementById('search-results');
      if (!q || q.length < 2) {
        resultsEl.innerHTML = '<div style="color:var(--muted);font-size:.85rem;text-align:center;padding:12px;">' + (lang === 'en' ? 'Enter at least 2 characters.' : 'En az 2 karakter girin.') + '</div>';
        return;
      }
      resultsEl.innerHTML = '<div style="color:var(--muted);font-size:.85rem;text-align:center;padding:12px;">â³</div>';
      try {
        // TÃ¼m kullanÄ±cÄ±larÄ± Ã§ek, client-side substring filtrele
        const snap = await db.collection('users').limit(500).get();
        const matches = [];
        snap.forEach(doc => {
          const u = doc.data();
          if (u.username && u.username.toLowerCase().includes(q)) {
            matches.push(u);
          }
        });
        matches.sort((a, b) => {
          // BaÅŸtan eÅŸleÅŸenler Ã¶nce
          const aStarts = a.username.toLowerCase().startsWith(q) ? 0 : 1;
          const bStarts = b.username.toLowerCase().startsWith(q) ? 0 : 1;
          return aStarts - bStarts || a.username.localeCompare(b.username);
        });
        if (!matches.length) {
          resultsEl.innerHTML = '<div style="color:var(--muted);font-size:.85rem;text-align:center;padding:12px;">' + (lang === 'en' ? 'No players found.' : 'Oyuncu bulunamadÄ±.') + '</div>';
          return;
        }
        resultsEl.innerHTML = '';
        matches.slice(0, 20).forEach(u => {
          const row = document.createElement('div');
          row.className = 'search-result-row';
          // EÅŸleÅŸen kÄ±smÄ± vurgula
          const uname = u.username;
          const idx = uname.toLowerCase().indexOf(q);
          const highlighted = idx >= 0
            ? uname.slice(0, idx) + '<span style="color:var(--accent);font-weight:700;">' + uname.slice(idx, idx + q.length) + '</span>' + uname.slice(idx + q.length)
            : uname;
          row.innerHTML = '<div class="search-result-avatar">' + uname[0].toUpperCase() + '</div>' +
            '<div style="flex:1"><div style="font-size:.95rem;">' + highlighted + '</div>' +
            '<div style="font-size:.72rem;color:var(--muted);">' + (u.gamesPlayed || 0) + ' ' + t('games') + '</div></div>' +
            '<div style="font-size:.75rem;color:var(--muted);">ğŸ‘</div>';
          row.onclick = () => { closeSearchModal(); openProfileByUsername(u.username); };
          resultsEl.appendChild(row);
        });
      } catch(e) {
        resultsEl.innerHTML = '<div style="color:var(--red);font-size:.82rem;text-align:center;padding:12px;">' + (lang === 'en' ? 'Error: ' : 'Hata: ') + e.message + '</div>';
      }
    }

    async function openProfileByUsername(username) {
      if (!username) return;
      const key = username.toLowerCase();
      document.getElementById('profile-modal').classList.add('open');
      document.getElementById('profile-avatar-big').textContent = username[0].toUpperCase();
      document.getElementById('profile-username').textContent = username;
      document.getElementById('profile-rank-badge').innerHTML = '';
      document.getElementById('profile-stats-content').style.display = 'block';
      document.getElementById('profile-private-notice').style.display = 'none';
      document.getElementById('profile-offline-grid').innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:8px;">â³ ' + (lang === 'en' ? 'Loadingâ€¦' : 'YÃ¼kleniyorâ€¦') + '</div>';
      document.getElementById('profile-online-grid').innerHTML = '';
      // Kendi profili mi?
      const isOwn = currentUser && currentUser.username.toLowerCase() === key;
      const toggleRow = document.getElementById('profile-privacy-toggle');
      toggleRow.style.display = isOwn ? 'block' : 'none';
      try {
        const snap = await db.collection('users').doc(key).get();
        if (!snap.exists) {
          document.getElementById('profile-offline-grid').innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:8px;">' + (lang === 'en' ? 'Player not found.' : 'Oyuncu bulunamadÄ±.') + '</div>';
          return;
        }
        const u = snap.data();
        // Gizlilik kontrolÃ¼
        if (u.statsPrivate && !isOwn) {
          document.getElementById('profile-stats-content').style.display = 'none';
          document.getElementById('profile-private-notice').style.display = 'block';
          document.getElementById('profile-private-text').textContent = lang === 'en'
            ? 'This player\'s stats are private!' : 'Bu oyuncunun istatistikleri gizli!';
          return;
        }
        // Kendi profili â€” gizlilik toggle'Ä± ayarla
        if (isOwn) {
          document.getElementById('profile-privacy-check').checked = !!u.statsPrivate;
        }
        // Offline istatistikler
        const modes = [
          { key: 'world',  label: lang === 'en' ? 'ğŸŒ World' : 'ğŸŒ DÃ¼nya',    sf: 'bestScore',      lf: 'bestLevel',       gf: 'gamesPlayedWorld',  gfAlt: 'gamesPlayed' },
          { key: 'europe', label: lang === 'en' ? 'ğŸ‡ªğŸ‡º Europe' : 'ğŸ‡ªğŸ‡º Avrupa', sf: 'bestScoreEurope', lf: 'bestLevelEurope',  gf: 'gamesPlayedEurope' },
          { key: 'turkey', label: lang === 'en' ? 'ğŸ‡¹ğŸ‡· Turkey' : 'ğŸ‡¹ğŸ‡· TÃ¼rkiye', sf: 'bestScoreTurkey', lf: 'bestLevelTurkey',  gf: 'gamesPlayedTurkey' },
          { key: 'flag',   label: lang === 'en' ? 'ğŸš© Flags' : 'ğŸš© Bayraklar', sf: 'bestScoreFlag',   lf: 'bestLevelFlag',    gf: 'gamesPlayedFlag' },
        ];
        let offlineHtml = '';
        modes.forEach(m => {
          const best = u[m.sf] || 0;
          const games = u[m.gf] || (m.gfAlt ? u[m.gfAlt] : 0) || 0;
          const lvl = u[m.lf] || 0;
          if (games === 0 && best === 0) return;
          const lvlDisplay = lvl > 0 ? lvl : (best > 0 ? '1+' : 'â€”');
          offlineHtml += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;">' +
            '<div style="font-size:.85rem;font-weight:700;margin-bottom:6px;">' + m.label + '</div>' +
            '<div class="profile-stat-grid">' +
            '<div class="profile-stat-card"><div class="psv">' + best.toLocaleString() + '</div><div class="psl">' + (lang === 'en' ? 'Best' : 'En Ä°yi') + '</div></div>' +
            '<div class="profile-stat-card"><div class="psv">' + lvlDisplay + '</div><div class="psl">' + (lang === 'en' ? 'Level' : 'Seviye') + '</div></div>' +
            '<div class="profile-stat-card"><div class="psv">' + games + '</div><div class="psl">' + (lang === 'en' ? 'Games' : 'Oyun') + '</div></div>' +
            '</div></div>';
        });
        document.getElementById('profile-offline-grid').innerHTML = offlineHtml || '<div style="color:var(--muted);font-size:.82rem;padding:8px;">' + (lang === 'en' ? 'No offline games yet.' : 'HenÃ¼z offline oyun yok.') + '</div>';
        // Online rank istatistikleri
        const rankModes = [
          { key: 'world',  label: lang === 'en' ? 'ğŸŒ World' : 'ğŸŒ DÃ¼nya' },
          { key: 'europe', label: lang === 'en' ? 'ğŸ‡ªğŸ‡º Europe' : 'ğŸ‡ªğŸ‡º Avrupa' },
          { key: 'turkey', label: lang === 'en' ? 'ğŸ‡¹ğŸ‡· Turkey' : 'ğŸ‡¹ğŸ‡· TÃ¼rkiye' },
          { key: 'flag',   label: lang === 'en' ? 'ğŸš© Flags' : 'ğŸš© Bayraklar' },
        ];
        let onlineHtml = '';
        rankModes.forEach(m => {
          const elo = getElo(u, m.key);
          const rankGames = u[getRankGamesField(m.key)] || 0;
          const wins = u['wins_' + m.key] || 0;
          const losses = u['losses_' + m.key] || 0;
          const total = wins + losses;
          // HiÃ§ ranked oyun yoksa gÃ¶sterme
          if (rankGames === 0) return;
          const winPct = total > 0 ? Math.round(wins / total * 100) : null;
          const rankLabel = getRankLabel(elo, lang);
          const rankEmoji = getRankEmoji(elo);
          const rankCls = getRankClass(elo);
          const gamesLabel = lang === 'en' ? 'games' : 'oyun';
          const winLabel = lang === 'en' ? 'win rate' : 'kazanma';
          const placementLeft = Math.max(0, RANK_PLACEMENT_GAMES - rankGames);
          const placementText = placementLeft > 0
            ? '<span style="color:var(--muted);">' + placementLeft + ' ' + (lang === 'en' ? 'placement left' : 'yerleÅŸme kaldÄ±') + '</span>'
            : '';
          // Kazanma yÃ¼zdesi satÄ±rÄ±
          let statsLine = rankGames + ' ' + gamesLabel;
          if (winPct !== null) {
            statsLine += ' &nbsp;Â·&nbsp; ' + wins + 'W ' + losses + 'L &nbsp;Â·&nbsp; <span style="color:' + (winPct >= 50 ? 'var(--green)' : 'var(--red)') + ';">' + winPct + '% ' + winLabel + '</span>';
          } else if (placementLeft > 0) {
            statsLine += ' &nbsp;Â·&nbsp; ' + placementText;
          }
          // wins/losses yoksa sadece oyun sayÄ±sÄ±nÄ± gÃ¶ster, "gÃ¼ncelleniyor" yazma
          onlineHtml += '<div class="profile-rank-row">' +
            '<div class="profile-rank-mode">' + m.label + '</div>' +
            '<div class="profile-rank-right">' +
            '<div style="text-align:right;">' +
            '<span class="rank-badge ' + rankCls + '">' + rankEmoji + ' ' + rankLabel + '</span>' +
            '<div style="font-size:.72rem;color:var(--muted);margin-top:3px;">' + statsLine + '</div>' +
            '</div></div></div>';
        });
        document.getElementById('profile-online-grid').innerHTML = onlineHtml || '<div style="color:var(--muted);font-size:.82rem;padding:8px;">' + (lang === 'en' ? 'No ranked games yet.' : 'HenÃ¼z ranked oyun yok.') + '</div>';
      } catch(e) {
        document.getElementById('profile-offline-grid').innerHTML = '<div style="color:var(--red);font-size:.82rem;padding:8px;">' + (lang === 'en' ? 'Error loading profile.' : 'Profil yÃ¼klenemedi.') + '</div>';
      }
    }

    async function toggleProfilePrivacy(checked) {
      if (!currentUser || !db) return;
      const key = currentUser.username.toLowerCase();
      try {
        await db.collection('users').doc(key).update({ statsPrivate: checked });
        currentUser.statsPrivate = checked;
      } catch(e) { console.error('Privacy toggle error:', e); }
    }

    function showEndMainMenu() {
      goToWelcome();
    }

    function closeLeaderboard() {
      document.getElementById('lb-modal').classList.add('hidden');
      if (lbOrigin === 'welcome') {
        document.getElementById('welcome-modal').style.display = 'flex';
        document.getElementById('welcome-modal').style.visibility = 'visible';
        document.getElementById('welcome-modal').style.zIndex = '450';
      } else if (lbOrigin === 'overlay') {
        // Seviye sonu/fail overlay'den aÃ§Ä±ldÄ±ysa overlay'e geri dÃ¶n
        const ov = document.getElementById('overlay');
        ov.classList.remove('hidden');
        ov.style.setProperty('display', 'flex', 'important');
      }
      // lbOrigin === 'game' ise oyun devam ediyor, sadece lb'yi kapat yeterli
      lbOrigin = null;
    }

    async function resetMyScore() {
      if (!currentUser) return;
      const btn = document.getElementById('btn-reset-score');
      if (btn.dataset.confirm !== '1') {
        btn.textContent = t('confirmReset');
        btn.dataset.confirm = '1';
        setTimeout(() => { btn.textContent = 'SKORUMU SIFIRLA'; btn.dataset.confirm = '0'; }, 3000);
        return;
      }
      btn.dataset.confirm = '0';
      btn.textContent = 'SKORUMU SIFIRLA';
      const key = currentUser.username.toLowerCase();
      try {
        const userRef = db.collection('users').doc(key);
        const snap = await userRef.get();
        let userData = snap.exists ? snap.data() : Object.assign({}, currentUser);
        userData.bestScore = 0;
        userData.bestLevel = 0;
        userData.gamesPlayed = 0;
        await userRef.set(userData);
        currentUser = userData;
        showLeaderboard();
      } catch (e) { console.error(e); }
    }

    // Enter key support & init
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('auth-modal').dataset.tab = 'login';
      ['auth-identifier', 'auth-email', 'auth-password'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') { const scr = document.getElementById('auth-screen-username'); if (scr && scr.style.display !== 'none') authSetUsername(); else authSubmit(); }
        });
        // Mobilde klavye aÃ§Ä±lÄ±nca input gÃ¶rÃ¼nÃ¼r kalsÄ±n
        el.addEventListener('focus', () => {
          // iOS: delay longer to let keyboard fully animate in
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Also scroll the auth modal container
            const modal = document.getElementById('auth-modal');
            if (modal) modal.scrollTop = Math.max(0, el.offsetTop - 80);
          }, 400);
        });
      });
    });

    // ===== TAM EKRAN =====
    function toggleFullscreen() {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFs) {
        if (req) req.call(el).catch(() => { });
      } else {
        if (exit) exit.call(document);
      }
    }

    function acceptFullscreen() {
      document.getElementById('fs-modal').style.display = 'none';
      document.getElementById('auth-modal').classList.remove('hidden');
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
      if (req) req.call(el).catch(() => { });
    }

    function declineFullscreen() {
      document.getElementById('fs-modal').style.display = 'none';
      document.getElementById('auth-modal').classList.remove('hidden');
    }

    (function () {
      const btn = document.getElementById('btn-fullscreen');
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ('ontouchstart' in window);

      if (isMobile) {
        btn.style.display = 'block';
        // Tam ekran sorusu â€” sadece mobilde, oturumda bir kez
        const fsSupported = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
        if (fsSupported && !sessionStorage.getItem('fs-asked')) {
          sessionStorage.setItem('fs-asked', '1');
          // Auth modal'Ä± geÃ§ici gizle, Ã¶nce fs sorusunu sor
          document.getElementById('auth-modal').classList.add('hidden');
          const fsModal = document.getElementById('fs-modal');
          fsModal.style.display = 'flex';
        }
      }

      const fsChange = () => {
        const isFs = document.fullscreenElement || document.webkitFullscreenElement;
        btn.style.display = isFs ? 'none' : (isMobile ? 'block' : 'none');
        btn.textContent = isFs ? 'âœ• Ã‡IKIÅ' : 'â›¶ TAM EKRAN';
      };
      document.addEventListener('fullscreenchange', fsChange);
      document.addEventListener('webkitfullscreenchange', fsChange);
    })();

    // ===== iOS KEYBOARD / VISUAL VIEWPORT FIX =====
    // When the keyboard opens on iOS, the auth modal can get pushed behind it.
    // We listen to visualViewport resize and scroll the focused input into view.
    (function () {
      if (!window.visualViewport) return;
      window.visualViewport.addEventListener('resize', function () {
        const active = document.activeElement;
        if (!active) return;
        const tag = active.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') return;
        const authModal = document.getElementById('auth-modal');
        if (!authModal || authModal.classList.contains('hidden')) return;
        setTimeout(() => {
          active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      });
    })();

    // ===== END AUTH =====

    const CITIES = [
      // ===== AVRUPA =====
      { name: "Ä°stanbul", country: "TÃ¼rkiye", lat: 41.01, lon: 28.95 },
      { name: "Ankara", country: "TÃ¼rkiye", lat: 39.92, lon: 32.85 },
      { name: "Ä°zmir", country: "TÃ¼rkiye", lat: 38.42, lon: 27.14 },
      { name: "Bursa", country: "TÃ¼rkiye", lat: 40.19, lon: 29.06 },
      { name: "Adana", country: "TÃ¼rkiye", lat: 37.00, lon: 35.32 },
      { name: "Gaziantep", country: "TÃ¼rkiye", lat: 37.07, lon: 37.38 },
      { name: "Konya", country: "TÃ¼rkiye", lat: 37.87, lon: 32.48 },
      { name: "Antalya", country: "TÃ¼rkiye", lat: 36.89, lon: 30.70 },
      { name: "Moskova", country: "Rusya", lat: 55.75, lon: 37.62 },
      { name: "St. Petersburg", country: "Rusya", lat: 59.93, lon: 30.32 },
      { name: "Novosibirsk", country: "Rusya", lat: 54.99, lon: 82.90 },
      { name: "Yekaterinburg", country: "Rusya", lat: 56.84, lon: 60.61 },
      { name: "Kazan", country: "Rusya", lat: 55.79, lon: 49.12 },
      { name: "Nizhny Novgorod", country: "Rusya", lat: 56.33, lon: 44.00 },
      { name: "Ã‡elyabinsk", country: "Rusya", lat: 55.16, lon: 61.40 },
      { name: "Omsk", country: "Rusya", lat: 54.99, lon: 73.37 },
      { name: "Samara", country: "Rusya", lat: 53.20, lon: 50.15 },
      { name: "Rostov", country: "Rusya", lat: 47.23, lon: 39.72 },
      { name: "Ufa", country: "Rusya", lat: 54.74, lon: 55.97 },
      { name: "Vladivostok", country: "Rusya", lat: 43.13, lon: 131.90 },
      { name: "Berlin", country: "Almanya", lat: 52.52, lon: 13.40 },
      { name: "Hamburg", country: "Almanya", lat: 53.55, lon: 10.00 },
      { name: "MÃ¼nih", country: "Almanya", lat: 48.14, lon: 11.58 },
      { name: "KÃ¶ln", country: "Almanya", lat: 50.94, lon: 6.96 },
      { name: "Frankfurt", country: "Almanya", lat: 50.11, lon: 8.68 },
      { name: "Stuttgart", country: "Almanya", lat: 48.78, lon: 9.18 },
      { name: "DÃ¼sseldorf", country: "Almanya", lat: 51.23, lon: 6.79 },
      { name: "Paris", country: "Fransa", lat: 48.85, lon: 2.35 },
      { name: "Marsilya", country: "Fransa", lat: 43.30, lon: 5.37 },
      { name: "Lyon", country: "Fransa", lat: 45.75, lon: 4.85 },
      { name: "Toulouse", country: "Fransa", lat: 43.60, lon: 1.44 },
      { name: "Nice", country: "Fransa", lat: 43.71, lon: 7.26 },
      { name: "Bordeaux", country: "Fransa", lat: 44.84, lon: -0.58 },
      { name: "Londra", country: "Ä°ngiltere", lat: 51.51, lon: -0.13 },
      { name: "Birmingham", country: "Ä°ngiltere", lat: 52.49, lon: -1.90 },
      { name: "Manchester", country: "Ä°ngiltere", lat: 53.48, lon: -2.24 },
      { name: "Glasgow", country: "Ä°ngiltere", lat: 55.86, lon: -4.25 },
      { name: "Liverpool", country: "Ä°ngiltere", lat: 53.41, lon: -2.99 },
      { name: "Leeds", country: "Ä°ngiltere", lat: 53.80, lon: -1.55 },
      { name: "Roma", country: "Ä°talya", lat: 41.90, lon: 12.50 },
      { name: "Milano", country: "Ä°talya", lat: 45.46, lon: 9.19 },
      { name: "Napoli", country: "Ä°talya", lat: 40.85, lon: 14.27 },
      { name: "Turin", country: "Ä°talya", lat: 45.07, lon: 7.69 },
      { name: "Palermo", country: "Ä°talya", lat: 38.12, lon: 13.36 },
      { name: "Cenova", country: "Ä°talya", lat: 44.41, lon: 8.93 },
      { name: "Bologna", country: "Ä°talya", lat: 44.50, lon: 11.34 },
      { name: "Madrid", country: "Ä°spanya", lat: 40.42, lon: -3.70 },
      { name: "Barselona", country: "Ä°spanya", lat: 41.39, lon: 2.16 },
      { name: "Valensiya", country: "Ä°spanya", lat: 39.47, lon: -0.38 },
      { name: "Sevilla", country: "Ä°spanya", lat: 37.39, lon: -5.99 },
      { name: "Zaragoza", country: "Ä°spanya", lat: 41.65, lon: -0.88 },
      { name: "Malaga", country: "Ä°spanya", lat: 36.72, lon: -4.42 },
      { name: "Bilbao", country: "Ä°spanya", lat: 43.26, lon: -2.93 },
      { name: "Kiev", country: "Ukrayna", lat: 50.45, lon: 30.52 },
      { name: "Harkiv", country: "Ukrayna", lat: 49.99, lon: 36.23 },
      { name: "Odessa", country: "Ukrayna", lat: 46.48, lon: 30.72 },
      { name: "Dnipro", country: "Ukrayna", lat: 48.46, lon: 35.05 },
      { name: "Lviv", country: "Ukrayna", lat: 49.84, lon: 24.03 },
      { name: "VarÅŸova", country: "Polonya", lat: 52.23, lon: 21.01 },
      { name: "Krakow", country: "Polonya", lat: 50.06, lon: 19.94 },
      { name: "Wroclaw", country: "Polonya", lat: 51.11, lon: 17.04 },
      { name: "Gdansk", country: "Polonya", lat: 54.35, lon: 18.64 },
      { name: "Poznan", country: "Polonya", lat: 52.41, lon: 16.93 },
      { name: "BÃ¼kreÅŸ", country: "Romanya", lat: 44.43, lon: 26.10 },
      { name: "Cluj-Napoca", country: "Romanya", lat: 46.77, lon: 23.59 },
      { name: "TamÄ±ÅŸvar", country: "Romanya", lat: 45.75, lon: 21.23 },
      { name: "Amsterdam", country: "Hollanda", lat: 52.37, lon: 4.90 },
      { name: "Rotterdam", country: "Hollanda", lat: 51.92, lon: 4.48 },
      { name: "BrÃ¼ksel", country: "BelÃ§ika", lat: 50.85, lon: 4.35 },
      { name: "Antwerpen", country: "BelÃ§ika", lat: 51.22, lon: 4.40 },
      { name: "Atina", country: "Yunanistan", lat: 37.98, lon: 23.73 },
      { name: "Selanik", country: "Yunanistan", lat: 40.64, lon: 22.94 },
      { name: "Lizbon", country: "Portekiz", lat: 38.72, lon: -9.14 },
      { name: "Porto", country: "Portekiz", lat: 41.16, lon: -8.63 },
      { name: "Prag", country: "Ã‡ekya", lat: 50.08, lon: 14.44 },
      { name: "Brno", country: "Ã‡ekya", lat: 49.20, lon: 16.61 },
      { name: "BudapeÅŸte", country: "Macaristan", lat: 47.50, lon: 19.04 },
      { name: "Stokholm", country: "Ä°sveÃ§", lat: 59.33, lon: 18.07 },
      { name: "GÃ¶teborg", country: "Ä°sveÃ§", lat: 57.71, lon: 11.97 },
      { name: "MalmÃ¶", country: "Ä°sveÃ§", lat: 55.60, lon: 13.00 },
      { name: "Minsk", country: "Belarus", lat: 53.90, lon: 27.57 },
      { name: "Viyana", country: "Avusturya", lat: 48.21, lon: 16.37 },
      { name: "Graz", country: "Avusturya", lat: 47.07, lon: 15.44 },
      { name: "ZÃ¼rih", country: "Ä°sviÃ§re", lat: 47.38, lon: 8.54 },
      { name: "Cenevre", country: "Ä°sviÃ§re", lat: 46.20, lon: 6.14 },
      { name: "Bern", country: "Ä°sviÃ§re", lat: 46.95, lon: 7.45 },
      { name: "Belgrad", country: "SÄ±rbistan", lat: 44.80, lon: 20.46 },
      { name: "Sofya", country: "Bulgaristan", lat: 42.70, lon: 23.32 },
      { name: "Plovdiv", country: "Bulgaristan", lat: 42.14, lon: 24.75 },
      { name: "Kopenhag", country: "Danimarka", lat: 55.68, lon: 12.57 },
      { name: "Helsinki", country: "Finlandiya", lat: 60.17, lon: 24.94 },
      { name: "Oslo", country: "NorveÃ§", lat: 59.91, lon: 10.75 },
      { name: "Bergen", country: "NorveÃ§", lat: 60.39, lon: 5.32 },
      { name: "Bratislava", country: "Slovakya", lat: 48.15, lon: 17.11 },
      { name: "Zagreb", country: "HÄ±rvatistan", lat: 45.81, lon: 15.98 },
      { name: "KiÅŸinev", country: "Moldova", lat: 47.01, lon: 28.86 },
      { name: "Saraybosna", country: "Bosna", lat: 43.85, lon: 18.36 },
      { name: "Tiran", country: "Arnavutluk", lat: 41.33, lon: 19.82 },
      { name: "Riga", country: "Letonya", lat: 56.95, lon: 24.11 },
      { name: "Vilnius", country: "Litvanya", lat: 54.69, lon: 25.28 },
      { name: "Tallinn", country: "Estonya", lat: 59.44, lon: 24.75 },
      { name: "Dublin", country: "Ä°rlanda", lat: 53.33, lon: -6.25 },
      { name: "Tiflis", country: "GÃ¼rcistan", lat: 41.69, lon: 44.83 },
      { name: "Erivan", country: "Ermenistan", lat: 40.18, lon: 44.51 },
      { name: "BakÃ¼", country: "Azerbaycan", lat: 40.41, lon: 49.87 },
      { name: "ÃœskÃ¼p", country: "Kuzey Makedonya", lat: 42.00, lon: 21.43 },
      { name: "Podgorica", country: "KaradaÄŸ", lat: 42.44, lon: 19.26 },
      { name: "Ljubljana", country: "Slovenya", lat: 46.05, lon: 14.51 },
      // ===== ASYA =====
      { name: "Pekin", country: "Ã‡in", lat: 39.91, lon: 116.39 },
      { name: "Åangay", country: "Ã‡in", lat: 31.23, lon: 121.47 },
      { name: "Guangzhou", country: "Ã‡in", lat: 23.13, lon: 113.26 },
      { name: "Shenzhen", country: "Ã‡in", lat: 22.54, lon: 114.06 },
      { name: "Chongqing", country: "Ã‡in", lat: 29.56, lon: 106.55 },
      { name: "Tianjin", country: "Ã‡in", lat: 39.13, lon: 117.20 },
      { name: "Wuhan", country: "Ã‡in", lat: 30.59, lon: 114.31 },
      { name: "Chengdu", country: "Ã‡in", lat: 30.67, lon: 104.07 },
      { name: "Xian", country: "Ã‡in", lat: 34.34, lon: 108.94 },
      { name: "Nanjing", country: "Ã‡in", lat: 32.06, lon: 118.78 },
      { name: "Hangzhou", country: "Ã‡in", lat: 30.27, lon: 120.15 },
      { name: "Kunming", country: "Ã‡in", lat: 24.88, lon: 102.83 },
      { name: "Harbin", country: "Ã‡in", lat: 45.75, lon: 126.63 },
      { name: "Urumqi", country: "Ã‡in", lat: 43.80, lon: 87.60 },
      { name: "Hong Kong", country: "Ã‡in", lat: 22.32, lon: 114.17 },
      { name: "Mumbai", country: "Hindistan", lat: 19.08, lon: 72.88 },
      { name: "Delhi", country: "Hindistan", lat: 28.63, lon: 77.22 },
      { name: "KalkÃ¼ta", country: "Hindistan", lat: 22.57, lon: 88.36 },
      { name: "Chennai", country: "Hindistan", lat: 13.08, lon: 80.27 },
      { name: "Bangalore", country: "Hindistan", lat: 12.97, lon: 77.59 },
      { name: "Haydarabad", country: "Hindistan", lat: 17.39, lon: 78.47 },
      { name: "Ahmedabad", country: "Hindistan", lat: 23.03, lon: 72.58 },
      { name: "Pune", country: "Hindistan", lat: 18.52, lon: 73.86 },
      { name: "Surat", country: "Hindistan", lat: 21.20, lon: 72.84 },
      { name: "Jaipur", country: "Hindistan", lat: 26.91, lon: 75.79 },
      { name: "Lucknow", country: "Hindistan", lat: 26.85, lon: 80.95 },
      { name: "Nagpur", country: "Hindistan", lat: 21.15, lon: 79.09 },
      { name: "Patna", country: "Hindistan", lat: 25.59, lon: 85.14 },
      { name: "Bhopal", country: "Hindistan", lat: 23.25, lon: 77.41 },
      { name: "Tokyo", country: "Japonya", lat: 35.69, lon: 139.69 },
      { name: "Osaka", country: "Japonya", lat: 34.69, lon: 135.50 },
      { name: "Nagoya", country: "Japonya", lat: 35.18, lon: 136.91 },
      { name: "Sapporo", country: "Japonya", lat: 43.06, lon: 141.35 },
      { name: "Fukuoka", country: "Japonya", lat: 33.59, lon: 130.40 },
      { name: "Kyoto", country: "Japonya", lat: 35.01, lon: 135.77 },
      { name: "Kobe", country: "Japonya", lat: 34.69, lon: 135.20 },
      { name: "Hiroshima", country: "Japonya", lat: 34.39, lon: 132.46 },
      { name: "Sendai", country: "Japonya", lat: 38.27, lon: 140.87 },
      { name: "Jakarta", country: "Endonezya", lat: -6.21, lon: 106.85 },
      { name: "Surabaya", country: "Endonezya", lat: -7.25, lon: 112.75 },
      { name: "Bandung", country: "Endonezya", lat: -6.92, lon: 107.61 },
      { name: "Medan", country: "Endonezya", lat: 3.58, lon: 98.67 },
      { name: "Makassar", country: "Endonezya", lat: -5.14, lon: 119.43 },
      { name: "Semarang", country: "Endonezya", lat: -7.00, lon: 110.42 },
      { name: "Palembang", country: "Endonezya", lat: -2.99, lon: 104.76 },
      { name: "KaraÃ§i", country: "Pakistan", lat: 24.86, lon: 67.01 },
      { name: "Lahore", country: "Pakistan", lat: 31.55, lon: 74.34 },
      { name: "Ä°slamabad", country: "Pakistan", lat: 33.73, lon: 73.04 },
      { name: "Faisalabad", country: "Pakistan", lat: 31.42, lon: 73.08 },
      { name: "Ravalpindi", country: "Pakistan", lat: 33.60, lon: 73.04 },
      { name: "Multan", country: "Pakistan", lat: 30.20, lon: 71.48 },
      { name: "PeÅŸaver", country: "Pakistan", lat: 34.01, lon: 71.58 },
      { name: "Dhaka", country: "BangladeÅŸ", lat: 23.72, lon: 90.41 },
      { name: "Chittagong", country: "BangladeÅŸ", lat: 22.33, lon: 91.83 },
      { name: "Khulna", country: "BangladeÅŸ", lat: 22.82, lon: 89.55 },
      { name: "Manila", country: "Filipinler", lat: 14.60, lon: 120.98 },
      { name: "Davao", country: "Filipinler", lat: 7.07, lon: 125.61 },
      { name: "Cebu", country: "Filipinler", lat: 10.32, lon: 123.90 },
      { name: "Tahran", country: "Ä°ran", lat: 35.69, lon: 51.42 },
      { name: "MeÅŸhed", country: "Ä°ran", lat: 36.30, lon: 59.60 },
      { name: "Isfahan", country: "Ä°ran", lat: 32.66, lon: 51.68 },
      { name: "Tebriz", country: "Ä°ran", lat: 38.08, lon: 46.29 },
      { name: "Åiraz", country: "Ä°ran", lat: 29.61, lon: 52.54 },
      { name: "Ahvaz", country: "Ä°ran", lat: 31.33, lon: 48.67 },
      { name: "BaÄŸdat", country: "Irak", lat: 33.34, lon: 44.40 },
      { name: "Basra", country: "Irak", lat: 30.51, lon: 47.82 },
      { name: "Erbil", country: "Irak", lat: 36.19, lon: 44.01 },
      { name: "Musul", country: "Irak", lat: 36.34, lon: 43.14 },
      { name: "Riyad", country: "Suudi Arabistan", lat: 24.69, lon: 46.72 },
      { name: "Cidde", country: "Suudi Arabistan", lat: 21.49, lon: 39.19 },
      { name: "Mekke", country: "Suudi Arabistan", lat: 21.39, lon: 39.86 },
      { name: "Medine", country: "Suudi Arabistan", lat: 24.47, lon: 39.61 },
      { name: "Dammam", country: "Suudi Arabistan", lat: 26.43, lon: 50.10 },
      { name: "Dubai", country: "BAE", lat: 25.20, lon: 55.27 },
      { name: "Abu Dabi", country: "BAE", lat: 24.47, lon: 54.37 },
      { name: "Sharjah", country: "BAE", lat: 25.34, lon: 55.39 },
      { name: "AlmatÄ±", country: "Kazakistan", lat: 43.25, lon: 76.95 },
      { name: "Astana", country: "Kazakistan", lat: 51.19, lon: 71.45 },
      { name: "Åymkent", country: "Kazakistan", lat: 42.32, lon: 69.60 },
      { name: "TaÅŸkent", country: "Ã–zbekistan", lat: 41.30, lon: 69.24 },
      { name: "Semerkant", country: "Ã–zbekistan", lat: 39.65, lon: 66.97 },
      { name: "Namangan", country: "Ã–zbekistan", lat: 40.99, lon: 71.67 },
      { name: "Kabil", country: "Afganistan", lat: 34.53, lon: 69.17 },
      { name: "Kandahar", country: "Afganistan", lat: 31.62, lon: 65.71 },
      { name: "Herat", country: "Afganistan", lat: 34.35, lon: 62.20 },
      { name: "Mazar-i Serif", country: "Afganistan", lat: 36.71, lon: 67.11 },
      { name: "Colombo", country: "Sri Lanka", lat: 6.93, lon: 79.85 },
      { name: "Kandy", country: "Sri Lanka", lat: 7.29, lon: 80.64 },
      { name: "Katmandu", country: "Nepal", lat: 27.70, lon: 85.32 },
      { name: "Pokhara", country: "Nepal", lat: 28.21, lon: 83.99 },
      { name: "Kuala Lumpur", country: "Malezya", lat: 3.14, lon: 101.69 },
      { name: "George Town", country: "Malezya", lat: 5.41, lon: 100.34 },
      { name: "Johor Bahru", country: "Malezya", lat: 1.46, lon: 103.75 },
      { name: "Bangkok", country: "Tayland", lat: 13.75, lon: 100.52 },
      { name: "Chiang Mai", country: "Tayland", lat: 18.79, lon: 98.98 },
      { name: "Ho Chi Minh", country: "Vietnam", lat: 10.82, lon: 106.63 },
      { name: "Hanoi", country: "Vietnam", lat: 21.03, lon: 105.85 },
      { name: "Da Nang", country: "Vietnam", lat: 16.07, lon: 108.22 },
      { name: "Haiphong", country: "Vietnam", lat: 20.86, lon: 106.69 },
      { name: "Rangun", country: "Myanmar", lat: 16.87, lon: 96.19 },
      { name: "Mandalay", country: "Myanmar", lat: 21.98, lon: 96.09 },
      { name: "Singapur", country: "Singapur", lat: 1.29, lon: 103.85 },
      { name: "Seul", country: "GÃ¼ney Kore", lat: 37.57, lon: 126.98 },
      { name: "Busan", country: "GÃ¼ney Kore", lat: 35.18, lon: 129.07 },
      { name: "Incheon", country: "GÃ¼ney Kore", lat: 37.46, lon: 126.71 },
      { name: "Daegu", country: "GÃ¼ney Kore", lat: 35.87, lon: 128.60 },
      { name: "Taipei", country: "Tayvan", lat: 25.05, lon: 121.56 },
      { name: "Kaohsiung", country: "Tayvan", lat: 22.62, lon: 120.30 },
      { name: "Taichung", country: "Tayvan", lat: 24.15, lon: 120.67 },
      { name: "Pyongyang", country: "Kuzey Kore", lat: 39.02, lon: 125.75 },
      { name: "Amman", country: "ÃœrdÃ¼n", lat: 31.95, lon: 35.93 },
      { name: "Tel Aviv", country: "Ä°srail", lat: 32.09, lon: 34.79 },
      { name: "KudÃ¼s", country: "Ä°srail", lat: 31.77, lon: 35.23 },
      { name: "Beyrut", country: "LÃ¼bnan", lat: 33.89, lon: 35.50 },
      { name: "Åam", country: "Suriye", lat: 33.51, lon: 36.29 },
      { name: "Halep", country: "Suriye", lat: 36.20, lon: 37.16 },
      { name: "Doha", country: "Katar", lat: 25.29, lon: 51.53 },
      { name: "Kuveyt", country: "Kuveyt", lat: 29.37, lon: 47.98 },
      { name: "Maskat", country: "Umman", lat: 23.61, lon: 58.59 },
      { name: "Manama", country: "Bahreyn", lat: 26.22, lon: 50.59 },
      { name: "Tiflis", country: "GÃ¼rcistan", lat: 41.69, lon: 44.83 },
      { name: "Erivan", country: "Ermenistan", lat: 40.18, lon: 44.51 },
      { name: "BakÃ¼", country: "Azerbaycan", lat: 40.41, lon: 49.87 },
      { name: "BiÅŸkek", country: "KÄ±rgÄ±zistan", lat: 42.87, lon: 74.59 },
      { name: "DuÅŸanbe", country: "Tacikistan", lat: 38.56, lon: 68.77 },
      { name: "AÅŸkabat", country: "TÃ¼rkmenistan", lat: 37.95, lon: 58.38 },
      { name: "Ulan Batur", country: "MoÄŸolistan", lat: 47.90, lon: 106.91 },
      { name: "Phnom Penh", country: "KamboÃ§ya", lat: 11.56, lon: 104.92 },
      { name: "Vientiane", country: "Laos", lat: 17.97, lon: 102.63 },
      { name: "LefkoÅŸa", country: "KÄ±brÄ±s", lat: 35.17, lon: 33.37 },
      // ===== AFRÄ°KA =====
      { name: "Kahire", country: "MÄ±sÄ±r", lat: 30.06, lon: 31.25 },
      { name: "Ä°skenderiye", country: "MÄ±sÄ±r", lat: 31.20, lon: 29.92 },
      { name: "Aswan", country: "MÄ±sÄ±r", lat: 24.09, lon: 32.90 },
      { name: "Lagos", country: "Nijerya", lat: 6.52, lon: 3.38 },
      { name: "Abuja", country: "Nijerya", lat: 9.07, lon: 7.40 },
      { name: "Kano", country: "Nijerya", lat: 12.00, lon: 8.52 },
      { name: "Ibadan", country: "Nijerya", lat: 7.38, lon: 3.93 },
      { name: "Port Harcourt", country: "Nijerya", lat: 4.77, lon: 7.01 },
      { name: "Addis Ababa", country: "Etiyopya", lat: 9.03, lon: 38.74 },
      { name: "Dire Dawa", country: "Etiyopya", lat: 9.60, lon: 41.87 },
      { name: "Kinshasa", country: "Kongo", lat: -4.32, lon: 15.32 },
      { name: "Lubumbashi", country: "Kongo", lat: -11.66, lon: 27.48 },
      { name: "Dar es Salaam", country: "Tanzanya", lat: -6.79, lon: 39.21 },
      { name: "Dodoma", country: "Tanzanya", lat: -6.17, lon: 35.74 },
      { name: "Nairobi", country: "Kenya", lat: -1.29, lon: 36.82 },
      { name: "Mombasa", country: "Kenya", lat: -4.05, lon: 39.67 },
      { name: "Johannesburg", country: "GÃ¼ney Afrika", lat: -26.20, lon: 28.04 },
      { name: "Kapstadt", country: "GÃ¼ney Afrika", lat: -33.93, lon: 18.42 },
      { name: "Durban", country: "GÃ¼ney Afrika", lat: -29.86, lon: 31.02 },
      { name: "Pretoria", country: "GÃ¼ney Afrika", lat: -25.75, lon: 28.19 },
      { name: "Hartum", country: "Sudan", lat: 15.55, lon: 32.53 },
      { name: "Omdurman", country: "Sudan", lat: 15.64, lon: 32.48 },
      { name: "Cezayir", country: "Cezayir", lat: 36.74, lon: 3.06 },
      { name: "Oran", country: "Cezayir", lat: 35.70, lon: -0.63 },
      { name: "Constantine", country: "Cezayir", lat: 36.37, lon: 6.61 },
      { name: "Kampala", country: "Uganda", lat: 0.32, lon: 32.58 },
      { name: "Casablanca", country: "Fas", lat: 33.59, lon: -7.62 },
      { name: "Rabat", country: "Fas", lat: 34.02, lon: -6.84 },
      { name: "Fes", country: "Fas", lat: 34.03, lon: -5.00 },
      { name: "Marakesh", country: "Fas", lat: 31.63, lon: -8.01 },
      { name: "Accra", country: "Gana", lat: 5.56, lon: -0.20 },
      { name: "Kumasi", country: "Gana", lat: 6.69, lon: -1.62 },
      { name: "Maputo", country: "Mozambik", lat: -25.97, lon: 32.59 },
      { name: "Beira", country: "Mozambik", lat: -19.84, lon: 34.84 },
      { name: "Nampula", country: "Mozambik", lat: -15.12, lon: 39.27 },
      { name: "Luanda", country: "Angola", lat: -8.84, lon: 13.23 },
      { name: "Huambo", country: "Angola", lat: -12.78, lon: 15.74 },
      { name: "Antananarivo", country: "Madagaskar", lat: -18.91, lon: 47.54 },
      { name: "Yaounde", country: "Kamerun", lat: 3.85, lon: 11.50 },
      { name: "Douala", country: "Kamerun", lat: 4.05, lon: 9.70 },
      { name: "Abidjan", country: "Fildisi Sahili", lat: 5.34, lon: -4.03 },
      { name: "Niamey", country: "Nijer", lat: 13.51, lon: 2.12 },
      { name: "Ouagadougou", country: "Burkina Faso", lat: 12.37, lon: -1.53 },
      { name: "Bamako", country: "Mali", lat: 12.65, lon: -8.00 },
      { name: "Lilongwe", country: "Malawi", lat: -13.97, lon: 33.79 },
      { name: "Dakar", country: "Senegal", lat: 14.72, lon: -17.47 },
      { name: "Lusaka", country: "Zambiya", lat: -15.41, lon: 28.28 },
      { name: "Ndola", country: "Zambiya", lat: -12.97, lon: 28.64 },
      { name: "Harare", country: "Zimbabve", lat: -17.83, lon: 31.05 },
      { name: "Bulawayo", country: "Zimbabve", lat: -20.17, lon: 28.58 },
      { name: "N'Djamena", country: "Ã‡ad", lat: 12.11, lon: 15.04 },
      { name: "Kigali", country: "Ruanda", lat: -1.96, lon: 30.06 },
      { name: "Tunus", country: "Tunus", lat: 36.82, lon: 10.17 },
      { name: "Sfaks", country: "Tunus", lat: 34.74, lon: 10.76 },
      { name: "MogadiÅŸu", country: "Somali", lat: 2.05, lon: 45.34 },
      { name: "Asmara", country: "Eritre", lat: 15.34, lon: 38.93 },
      { name: "Cibuti", country: "Cibuti", lat: 11.59, lon: 43.15 },
      { name: "Gaborone", country: "Botsvana", lat: -24.65, lon: 25.91 },
      { name: "Windhoek", country: "Namibya", lat: -22.56, lon: 17.08 },
      { name: "Freetown", country: "Sierra Leone", lat: 8.49, lon: -13.23 },
      { name: "Monrovia", country: "Liberya", lat: 6.30, lon: -10.80 },
      { name: "Konakri", country: "Gine", lat: 9.54, lon: -13.68 },
      { name: "Libreville", country: "Gabon", lat: 0.39, lon: 9.45 },
      { name: "Brazzaville", country: "Kongo Cum.", lat: -4.27, lon: 15.28 },
      { name: "Bangui", country: "Orta Afrika Cumhuriyeti", lat: 4.36, lon: 18.56 },
      { name: "Cotonou", country: "Benin", lat: 6.37, lon: 2.42 },
      { name: "Lome", country: "Togo", lat: 6.14, lon: 1.22 },
      { name: "Trablus", country: "Libya", lat: 32.90, lon: 13.18 },
      { name: "Bingazi", country: "Libya", lat: 32.12, lon: 20.07 },
      { name: "Sana", country: "Yemen", lat: 15.35, lon: 44.21 },
      { name: "Aden", country: "Yemen", lat: 12.78, lon: 45.04 },
      // ===== AMERÄ°KA =====
      { name: "New York", country: "ABD", lat: 40.71, lon: -74.01 },
      { name: "Los Angeles", country: "ABD", lat: 34.05, lon: -118.24 },
      { name: "Chicago", country: "ABD", lat: 41.88, lon: -87.63 },
      { name: "Houston", country: "ABD", lat: 29.76, lon: -95.37 },
      { name: "Phoenix", country: "ABD", lat: 33.45, lon: -112.07 },
      { name: "Philadelphia", country: "ABD", lat: 39.95, lon: -75.16 },
      { name: "San Antonio", country: "ABD", lat: 29.42, lon: -98.49 },
      { name: "San Diego", country: "ABD", lat: 32.72, lon: -117.16 },
      { name: "Dallas", country: "ABD", lat: 32.78, lon: -96.80 },
      { name: "San Jose", country: "ABD", lat: 37.34, lon: -121.89 },
      { name: "Austin", country: "ABD", lat: 30.27, lon: -97.74 },
      { name: "Seattle", country: "ABD", lat: 47.61, lon: -122.33 },
      { name: "Denver", country: "ABD", lat: 39.74, lon: -104.98 },
      { name: "Washington DC", country: "ABD", lat: 38.91, lon: -77.04 },
      { name: "Miami", country: "ABD", lat: 25.77, lon: -80.19 },
      { name: "Atlanta", country: "ABD", lat: 33.75, lon: -84.39 },
      { name: "Minneapolis", country: "ABD", lat: 44.98, lon: -93.27 },
      { name: "Portland", country: "ABD", lat: 45.52, lon: -122.68 },
      { name: "Las Vegas", country: "ABD", lat: 36.17, lon: -115.14 },
      { name: "Detroit", country: "ABD", lat: 42.33, lon: -83.05 },
      { name: "New Orleans", country: "ABD", lat: 29.95, lon: -90.07 },
      { name: "Boston", country: "ABD", lat: 42.36, lon: -71.06 },
      { name: "Honolulu", country: "ABD", lat: 21.31, lon: -157.86 },
      { name: "Anchorage", country: "ABD", lat: 61.22, lon: -149.90 },
      { name: "Toronto", country: "Kanada", lat: 43.65, lon: -79.38 },
      { name: "Montreal", country: "Kanada", lat: 45.50, lon: -73.57 },
      { name: "Vancouver", country: "Kanada", lat: 49.25, lon: -123.12 },
      { name: "Calgary", country: "Kanada", lat: 51.04, lon: -114.07 },
      { name: "Edmonton", country: "Kanada", lat: 53.55, lon: -113.49 },
      { name: "Ottawa", country: "Kanada", lat: 45.42, lon: -75.70 },
      { name: "Winnipeg", country: "Kanada", lat: 49.90, lon: -97.14 },
      { name: "Mexico City", country: "Meksika", lat: 19.43, lon: -99.13 },
      { name: "Guadalajara", country: "Meksika", lat: 20.66, lon: -103.35 },
      { name: "Monterrey", country: "Meksika", lat: 25.67, lon: -100.31 },
      { name: "Puebla", country: "Meksika", lat: 19.04, lon: -98.20 },
      { name: "Tijuana", country: "Meksika", lat: 32.52, lon: -117.03 },
      { name: "Leon", country: "Meksika", lat: 21.12, lon: -101.68 },
      { name: "Sao Paulo", country: "Brezilya", lat: -23.55, lon: -46.63 },
      { name: "Rio de Janeiro", country: "Brezilya", lat: -22.91, lon: -43.17 },
      { name: "Brasilia", country: "Brezilya", lat: -15.78, lon: -47.93 },
      { name: "Salvador", country: "Brezilya", lat: -12.97, lon: -38.51 },
      { name: "Fortaleza", country: "Brezilya", lat: -3.72, lon: -38.54 },
      { name: "Belo Horizonte", country: "Brezilya", lat: -19.92, lon: -43.94 },
      { name: "Manaus", country: "Brezilya", lat: -3.10, lon: -60.02 },
      { name: "Curitiba", country: "Brezilya", lat: -25.43, lon: -49.27 },
      { name: "Recife", country: "Brezilya", lat: -8.05, lon: -34.88 },
      { name: "Porto Alegre", country: "Brezilya", lat: -30.03, lon: -51.23 },
      { name: "Belem", country: "Brezilya", lat: -1.46, lon: -48.50 },
      { name: "Buenos Aires", country: "Arjantin", lat: -34.60, lon: -58.38 },
      { name: "Cordoba", country: "Arjantin", lat: -31.40, lon: -64.18 },
      { name: "Rosario", country: "Arjantin", lat: -32.95, lon: -60.64 },
      { name: "Mendoza", country: "Arjantin", lat: -32.89, lon: -68.84 },
      { name: "Tucuman", country: "Arjantin", lat: -26.82, lon: -65.22 },
      { name: "Bogota", country: "Kolombiya", lat: 4.71, lon: -74.07 },
      { name: "Medellin", country: "Kolombiya", lat: 6.23, lon: -75.59 },
      { name: "Cali", country: "Kolombiya", lat: 3.44, lon: -76.52 },
      { name: "Barranquilla", country: "Kolombiya", lat: 10.96, lon: -74.80 },
      { name: "Santiago", country: "Åili", lat: -33.46, lon: -70.65 },
      { name: "Valparaiso", country: "Åili", lat: -33.05, lon: -71.62 },
      { name: "Concepcion", country: "Åili", lat: -36.83, lon: -73.05 },
      { name: "Lima", country: "Peru", lat: -12.05, lon: -77.04 },
      { name: "Arequipa", country: "Peru", lat: -16.41, lon: -71.54 },
      { name: "Trujillo", country: "Peru", lat: -8.11, lon: -79.03 },
      { name: "Caracas", country: "Venezuela", lat: 10.48, lon: -66.88 },
      { name: "Maracaibo", country: "Venezuela", lat: 10.63, lon: -71.61 },
      { name: "Valencia", country: "Venezuela", lat: 10.16, lon: -68.00 },
      { name: "Quito", country: "Ekvador", lat: -0.23, lon: -78.52 },
      { name: "Guayaquil", country: "Ekvador", lat: -2.17, lon: -79.92 },
      { name: "La Paz", country: "Bolivya", lat: -16.50, lon: -68.14 },
      { name: "Santa Cruz", country: "Bolivya", lat: -17.80, lon: -63.17 },
      { name: "Cochabamba", country: "Bolivya", lat: -17.39, lon: -66.16 },
      { name: "Asuncion", country: "Paraguay", lat: -25.29, lon: -57.64 },
      { name: "Montevideo", country: "Uruguay", lat: -34.90, lon: -56.19 },
      { name: "Havana", country: "KÃ¼ba", lat: 23.13, lon: -82.38 },
      { name: "Santo Domingo", country: "Dominik Cum.", lat: 18.47, lon: -69.90 },
      { name: "Port-au-Prince", country: "Haiti", lat: 18.54, lon: -72.34 },
      { name: "Guatemala City", country: "Guatemala", lat: 14.64, lon: -90.51 },
      { name: "Tegucigalpa", country: "Honduras", lat: 14.09, lon: -87.21 },
      { name: "San Salvador", country: "El Salvador", lat: 13.69, lon: -89.19 },
      { name: "Managua", country: "Nikaragua", lat: 12.13, lon: -86.29 },
      { name: "San Jose", country: "Kosta Rika", lat: 9.93, lon: -84.08 },
      { name: "Panama City", country: "Panama", lat: 8.99, lon: -79.52 },
      { name: "Kingston", country: "Jamaika", lat: 18.01, lon: -76.79 },
      { name: "Port of Spain", country: "Trinidad", lat: 10.65, lon: -61.52 },
      // ===== OKYANUSYA =====
      { name: "Sidney", country: "Avustralya", lat: -33.87, lon: 151.21 },
      { name: "Melbourne", country: "Avustralya", lat: -37.81, lon: 144.96 },
      { name: "Brisbane", country: "Avustralya", lat: -27.47, lon: 153.02 },
      { name: "Perth", country: "Avustralya", lat: -31.95, lon: 115.86 },
      { name: "Adelaide", country: "Avustralya", lat: -34.93, lon: 138.60 },
      { name: "Darwin", country: "Avustralya", lat: -12.46, lon: 130.84 },
      { name: "Canberra", country: "Avustralya", lat: -35.28, lon: 149.13 },
      { name: "Auckland", country: "Yeni Zelanda", lat: -36.86, lon: 174.77 },
      { name: "Wellington", country: "Yeni Zelanda", lat: -41.29, lon: 174.78 },
      { name: "Christchurch", country: "Yeni Zelanda", lat: -43.53, lon: 172.64 },
      { name: "EskiÅŸehir", country: "TÃ¼rkiye", lat: 39.78, lon: 30.52 },
      { name: "Suva", country: "Fiji", lat: -18.14, lon: 178.44 },
    ];


    const TOTAL_LEVELS = 10;

    const FLAG_COUNTRIES = [
      { tr: "Arnavutluk", en: "Albania", flag: "ğŸ‡¦ğŸ‡±", atr: ["arnavutluk"], aen: ["albania"], code: "al" },
      { tr: "Andorra", en: "Andorra", flag: "ğŸ‡¦ğŸ‡©", atr: ["andorra"], aen: ["andorra"], code: "ad" },
      { tr: "Avusturya", en: "Austria", flag: "ğŸ‡¦ğŸ‡¹", atr: ["avusturya"], aen: ["austria"], code: "at" },
      { tr: "BelÃ§ika", en: "Belgium", flag: "ğŸ‡§ğŸ‡ª", atr: ["belÃ§ika", "belcika"], aen: ["belgium"], code: "be" },
      { tr: "Bosna Hersek", en: "Bosnia and Herzegovina", flag: "ğŸ‡§ğŸ‡¦", atr: ["bosna hersek", "bosna", "bosna-hersek"], aen: ["bosnia", "bosnia and herzegovina", "bosnia herzegovina"], code: "ba" },
      { tr: "Bulgaristan", en: "Bulgaria", flag: "ğŸ‡§ğŸ‡¬", atr: ["bulgaristan"], aen: ["bulgaria"], code: "bg" },
      { tr: "HÄ±rvatistan", en: "Croatia", flag: "ğŸ‡­ğŸ‡·", atr: ["hÄ±rvatistan", "hirvatistan"], aen: ["croatia"], code: "hr" },
      { tr: "KÄ±brÄ±s", en: "Cyprus", flag: "ğŸ‡¨ğŸ‡¾", atr: ["kÄ±brÄ±s", "kibris"], aen: ["cyprus"], code: "cy" },
      { tr: "Ã‡ekya", en: "Czech Republic", flag: "ğŸ‡¨ğŸ‡¿", atr: ["Ã§ekya", "Ã§ek cumhuriyeti", "Ã§ek", "cekya", "cek"], aen: ["czech", "czechia", "czech republic"], code: "cz" },
      { tr: "Danimarka", en: "Denmark", flag: "ğŸ‡©ğŸ‡°", atr: ["danimarka"], aen: ["denmark"], code: "dk" },
      { tr: "Estonya", en: "Estonia", flag: "ğŸ‡ªğŸ‡ª", atr: ["estonya"], aen: ["estonia"], code: "ee" },
      { tr: "Finlandiya", en: "Finland", flag: "ğŸ‡«ğŸ‡®", atr: ["finlandiya"], aen: ["finland"], code: "fi" },
      { tr: "Fransa", en: "France", flag: "ğŸ‡«ğŸ‡·", atr: ["fransa"], aen: ["france"], code: "fr" },
      { tr: "Almanya", en: "Germany", flag: "ğŸ‡©ğŸ‡ª", atr: ["almanya"], aen: ["germany"], code: "de" },
      { tr: "Yunanistan", en: "Greece", flag: "ğŸ‡¬ğŸ‡·", atr: ["yunanistan"], aen: ["greece"], code: "gr" },
      { tr: "Macaristan", en: "Hungary", flag: "ğŸ‡­ğŸ‡º", atr: ["macaristan"], aen: ["hungary"], code: "hu" },
      { tr: "Ä°zlanda", en: "Iceland", flag: "ğŸ‡®ğŸ‡¸", atr: ["izlanda"], aen: ["iceland"], code: "is" },
      { tr: "Ä°rlanda", en: "Ireland", flag: "ğŸ‡®ğŸ‡ª", atr: ["irlanda"], aen: ["ireland"], code: "ie" },
      { tr: "Ä°talya", en: "Italy", flag: "ğŸ‡®ğŸ‡¹", atr: ["italya"], aen: ["italy"], code: "it" },
      { tr: "Kosovo", en: "Kosovo", flag: "ğŸ‡½ğŸ‡°", atr: ["kosovo", "kosova"], aen: ["kosovo"], code: "xk" },
      { tr: "Letonya", en: "Latvia", flag: "ğŸ‡±ğŸ‡»", atr: ["letonya"], aen: ["latvia"], code: "lv" },
      { tr: "Liechtenstein", en: "Liechtenstein", flag: "ğŸ‡±ğŸ‡®", atr: ["liechtenstein", "lihtenÅŸtayn", "lihtenstain", "lihtenstein"], aen: ["liechtenstein", "lichtenstein"], code: "li" },
      { tr: "Litvanya", en: "Lithuania", flag: "ğŸ‡±ğŸ‡¹", atr: ["litvanya"], aen: ["lithuania"], code: "lt" },
      { tr: "LÃ¼ksemburg", en: "Luxembourg", flag: "ğŸ‡±ğŸ‡º", atr: ["lÃ¼ksemburg", "luksemburg"], aen: ["luxembourg"], code: "lu" },
      { tr: "Malta", en: "Malta", flag: "ğŸ‡²ğŸ‡¹", atr: ["malta"], aen: ["malta"], code: "mt" },
      { tr: "Moldova", en: "Moldova", flag: "ğŸ‡²ğŸ‡©", atr: ["moldova"], aen: ["moldova"], code: "md" },
      { tr: "Monako", en: "Monaco", flag: "ğŸ‡²ğŸ‡¨", atr: ["monako"], aen: ["monaco"], code: "mc" },
      { tr: "KaradaÄŸ", en: "Montenegro", flag: "ğŸ‡²ğŸ‡ª", atr: ["karadaÄŸ", "karadag"], aen: ["montenegro"], code: "me" },
      { tr: "Kuzey Makedonya", en: "North Macedonia", flag: "ğŸ‡²ğŸ‡°", atr: ["kuzey makedonya", "makedonya"], aen: ["north macedonia", "macedonia"], code: "mk" },
      { tr: "Hollanda", en: "Netherlands", flag: "ğŸ‡³ğŸ‡±", atr: ["hollanda"], aen: ["netherlands", "holland"], code: "nl" },
      { tr: "NorveÃ§", en: "Norway", flag: "ğŸ‡³ğŸ‡´", atr: ["norveÃ§", "norvec"], aen: ["norway"], code: "no" },
      { tr: "Polonya", en: "Poland", flag: "ğŸ‡µğŸ‡±", atr: ["polonya"], aen: ["poland"], code: "pl" },
      { tr: "Portekiz", en: "Portugal", flag: "ğŸ‡µğŸ‡¹", atr: ["portekiz"], aen: ["portugal"], code: "pt" },
      { tr: "Romanya", en: "Romania", flag: "ğŸ‡·ğŸ‡´", atr: ["romanya"], aen: ["romania"], code: "ro" },
      { tr: "Rusya", en: "Russia", flag: "ğŸ‡·ğŸ‡º", atr: ["rusya"], aen: ["russia"], code: "ru" },
      { tr: "San Marino", en: "San Marino", flag: "ğŸ‡¸ğŸ‡²", atr: ["san marino"], aen: ["san marino"], code: "sm" },
      { tr: "SÄ±rbistan", en: "Serbia", flag: "ğŸ‡·ğŸ‡¸", atr: ["sÄ±rbistan", "sirbistan"], aen: ["serbia"], code: "rs" },
      { tr: "Slovakya", en: "Slovakia", flag: "ğŸ‡¸ğŸ‡°", atr: ["slovakya"], aen: ["slovakia"], code: "sk" },
      { tr: "Slovenya", en: "Slovenia", flag: "ğŸ‡¸ğŸ‡®", atr: ["slovenya"], aen: ["slovenia"], code: "si" },
      { tr: "Ä°spanya", en: "Spain", flag: "ğŸ‡ªğŸ‡¸", atr: ["ispanya"], aen: ["spain"], code: "es" },
      { tr: "Ä°sveÃ§", en: "Sweden", flag: "ğŸ‡¸ğŸ‡ª", atr: ["isveÃ§", "isvec"], aen: ["sweden"], code: "se" },
      { tr: "Ä°sviÃ§re", en: "Switzerland", flag: "ğŸ‡¨ğŸ‡­", atr: ["isviÃ§re", "isvicre"], aen: ["switzerland"], code: "ch" },
      { tr: "Ukrayna", en: "Ukraine", flag: "ğŸ‡ºğŸ‡¦", atr: ["ukrayna"], aen: ["ukraine"], code: "ua" },
      { tr: "Ä°ngiltere", en: "United Kingdom", flag: "ğŸ‡¬ğŸ‡§", atr: ["ingiltere", "birleÅŸik krallÄ±k", "birlesik krallik", "uk"], aen: ["uk", "united kingdom", "england", "britain", "great britain"], code: "gb" },
      { tr: "Vatikan", en: "Vatican", flag: "ğŸ‡»ğŸ‡¦", atr: ["vatikan"], aen: ["vatican", "holy see"], code: "va" },
      { tr: "Belarus", en: "Belarus", flag: "ğŸ‡§ğŸ‡¾", atr: ["belarus"], aen: ["belarus"], code: "by" },
      { tr: "Afganistan", en: "Afghanistan", flag: "ğŸ‡¦ğŸ‡«", atr: ["afganistan"], aen: ["afghanistan"], code: "af" },
      { tr: "Ermenistan", en: "Armenia", flag: "ğŸ‡¦ğŸ‡²", atr: ["ermenistan"], aen: ["armenia"], code: "am" },
      { tr: "Azerbaycan", en: "Azerbaijan", flag: "ğŸ‡¦ğŸ‡¿", atr: ["azerbaycan"], aen: ["azerbaijan"], code: "az" },
      { tr: "Bahreyn", en: "Bahrain", flag: "ğŸ‡§ğŸ‡­", atr: ["bahreyn"], aen: ["bahrain"], code: "bh" },
      { tr: "BangladeÅŸ", en: "Bangladesh", flag: "ğŸ‡§ğŸ‡©", atr: ["bangladeÅŸ", "banglades"], aen: ["bangladesh"], code: "bd" },
      { tr: "Bhutan", en: "Bhutan", flag: "ğŸ‡§ğŸ‡¹", atr: ["butan", "bhutan"], aen: ["bhutan"], code: "bt" },
      { tr: "Brunei", en: "Brunei", flag: "ğŸ‡§ğŸ‡³", atr: ["brunei"], aen: ["brunei"], code: "bn" },
      { tr: "KamboÃ§ya", en: "Cambodia", flag: "ğŸ‡°ğŸ‡­", atr: ["kamboÃ§ya", "kambocya"], aen: ["cambodia"], code: "kh" },
      { tr: "Ã‡in", en: "China", flag: "ğŸ‡¨ğŸ‡³", atr: ["Ã§in", "cin"], aen: ["china"], code: "cn" },
      { tr: "GÃ¼rcistan", en: "Georgia", flag: "ğŸ‡¬ğŸ‡ª", atr: ["gÃ¼rcistan", "gurcistan"], aen: ["georgia"], code: "ge" },
      { tr: "Hindistan", en: "India", flag: "ğŸ‡®ğŸ‡³", atr: ["hindistan"], aen: ["india"], code: "in" },
      { tr: "Endonezya", en: "Indonesia", flag: "ğŸ‡®ğŸ‡©", atr: ["endonezya"], aen: ["indonesia"], code: "id" },
      { tr: "Ä°ran", en: "Iran", flag: "ğŸ‡®ğŸ‡·", atr: ["iran"], aen: ["iran"], code: "ir" },
      { tr: "Irak", en: "Iraq", flag: "ğŸ‡®ğŸ‡¶", atr: ["irak"], aen: ["iraq"], code: "iq" },
      { tr: "Ä°srail", en: "Israel", flag: "ğŸ‡®ğŸ‡±", atr: ["israil"], aen: ["israel"], code: "il" },
      { tr: "Japonya", en: "Japan", flag: "ğŸ‡¯ğŸ‡µ", atr: ["japonya"], aen: ["japan"], code: "jp" },
      { tr: "ÃœrdÃ¼n", en: "Jordan", flag: "ğŸ‡¯ğŸ‡´", atr: ["Ã¼rdÃ¼n", "urdun"], aen: ["jordan"], code: "jo" },
      { tr: "Kazakistan", en: "Kazakhstan", flag: "ğŸ‡°ğŸ‡¿", atr: ["kazakistan"], aen: ["kazakhstan"], code: "kz" },
      { tr: "Kuveyt", en: "Kuwait", flag: "ğŸ‡°ğŸ‡¼", atr: ["kuveyt"], aen: ["kuwait"], code: "kw" },
      { tr: "KÄ±rgÄ±zistan", en: "Kyrgyzstan", flag: "ğŸ‡°ğŸ‡¬", atr: ["kÄ±rgÄ±zistan", "kirgizistan"], aen: ["kyrgyzstan"], code: "kg" },
      { tr: "Laos", en: "Laos", flag: "ğŸ‡±ğŸ‡¦", atr: ["laos"], aen: ["laos"], code: "la" },
      { tr: "LÃ¼bnan", en: "Lebanon", flag: "ğŸ‡±ğŸ‡§", atr: ["lÃ¼bnan", "lubnan"], aen: ["lebanon"], code: "lb" },
      { tr: "Malezya", en: "Malaysia", flag: "ğŸ‡²ğŸ‡¾", atr: ["malezya"], aen: ["malaysia"], code: "my" },
      { tr: "Maldivler", en: "Maldives", flag: "ğŸ‡²ğŸ‡»", atr: ["maldivler"], aen: ["maldives"], code: "mv" },
      { tr: "MoÄŸolistan", en: "Mongolia", flag: "ğŸ‡²ğŸ‡³", atr: ["moÄŸolistan", "mogolistan"], aen: ["mongolia"], code: "mn" },
      { tr: "Myanmar", en: "Myanmar", flag: "ğŸ‡²ğŸ‡²", atr: ["myanmar", "burma"], aen: ["myanmar", "burma"], code: "mm" },
      { tr: "Nepal", en: "Nepal", flag: "ğŸ‡³ğŸ‡µ", atr: ["nepal"], aen: ["nepal"], code: "np" },
      { tr: "Kuzey Kore", en: "North Korea", flag: "ğŸ‡°ğŸ‡µ", atr: ["kuzey kore"], aen: ["north korea"], code: "kp" },
      { tr: "Umman", en: "Oman", flag: "ğŸ‡´ğŸ‡²", atr: ["umman"], aen: ["oman"], code: "om" },
      { tr: "Pakistan", en: "Pakistan", flag: "ğŸ‡µğŸ‡°", atr: ["pakistan"], aen: ["pakistan"], code: "pk" },
      { tr: "Filistin", en: "Palestine", flag: "ğŸ‡µğŸ‡¸", atr: ["filistin"], aen: ["palestine"], code: "ps" },
      { tr: "Filipinler", en: "Philippines", flag: "ğŸ‡µğŸ‡­", atr: ["filipinler"], aen: ["philippines"], code: "ph" },
      { tr: "Katar", en: "Qatar", flag: "ğŸ‡¶ğŸ‡¦", atr: ["katar"], aen: ["qatar"], code: "qa" },
      { tr: "Suudi Arabistan", en: "Saudi Arabia", flag: "ğŸ‡¸ğŸ‡¦", atr: ["suudi arabistan", "arabistan"], aen: ["saudi arabia", "saudi"], code: "sa" },
      { tr: "Singapur", en: "Singapore", flag: "ğŸ‡¸ğŸ‡¬", atr: ["singapur"], aen: ["singapore"], code: "sg" },
      { tr: "GÃ¼ney Kore", en: "South Korea", flag: "ğŸ‡°ğŸ‡·", atr: ["gÃ¼ney kore", "guney kore"], aen: ["south korea", "korea"], code: "kr" },
      { tr: "Sri Lanka", en: "Sri Lanka", flag: "ğŸ‡±ğŸ‡°", atr: ["sri lanka"], aen: ["sri lanka"], code: "lk" },
      { tr: "Suriye", en: "Syria", flag: "ğŸ‡¸ğŸ‡¾", atr: ["suriye"], aen: ["syria"], code: "sy" },
      { tr: "Tayvan", en: "Taiwan", flag: "ğŸ‡¹ğŸ‡¼", atr: ["tayvan"], aen: ["taiwan"], code: "tw" },
      { tr: "Tacikistan", en: "Tajikistan", flag: "ğŸ‡¹ğŸ‡¯", atr: ["tacikistan"], aen: ["tajikistan"], code: "tj" },
      { tr: "Tayland", en: "Thailand", flag: "ğŸ‡¹ğŸ‡­", atr: ["tayland"], aen: ["thailand"], code: "th" },
      { tr: "DoÄŸu Timor", en: "Timor-Leste", flag: "ğŸ‡¹ğŸ‡±", atr: ["doÄŸu timor", "dogu timor", "timor"], aen: ["timor-leste", "east timor", "timor"], code: "tl" },
      { tr: "TÃ¼rkiye", en: "Turkey", flag: "ğŸ‡¹ğŸ‡·", atr: ["tÃ¼rkiye", "turkiye"], aen: ["turkey"], code: "tr" },
      { tr: "TÃ¼rkmenistan", en: "Turkmenistan", flag: "ğŸ‡¹ğŸ‡²", atr: ["tÃ¼rkmenistan", "turkmenistan"], aen: ["turkmenistan"], code: "tm" },
      { tr: "BAE", en: "United Arab Emirates", flag: "ğŸ‡¦ğŸ‡ª", atr: ["bae", "birleÅŸik arap emirlikleri", "emirlikler", "abu dabi"], aen: ["uae", "united arab emirates", "emirates"], code: "ae" },
      { tr: "Ã–zbekistan", en: "Uzbekistan", flag: "ğŸ‡ºğŸ‡¿", atr: ["Ã¶zbekistan", "ozbekistan"], aen: ["uzbekistan"], code: "uz" },
      { tr: "Vietnam", en: "Vietnam", flag: "ğŸ‡»ğŸ‡³", atr: ["vietnam"], aen: ["vietnam"], code: "vn" },
      { tr: "Yemen", en: "Yemen", flag: "ğŸ‡¾ğŸ‡ª", atr: ["yemen"], aen: ["yemen"], code: "ye" },
      { tr: "Cezayir", en: "Algeria", flag: "ğŸ‡©ğŸ‡¿", atr: ["cezayir"], aen: ["algeria"], code: "dz" },
      { tr: "Angola", en: "Angola", flag: "ğŸ‡¦ğŸ‡´", atr: ["angola"], aen: ["angola"], code: "ao" },
      { tr: "Benin", en: "Benin", flag: "ğŸ‡§ğŸ‡¯", atr: ["benin"], aen: ["benin"], code: "bj" },
      { tr: "Botsvana", en: "Botswana", flag: "ğŸ‡§ğŸ‡¼", atr: ["botsvana", "botswana"], aen: ["botswana"], code: "bw" },
      { tr: "Burkina Faso", en: "Burkina Faso", flag: "ğŸ‡§ğŸ‡«", atr: ["burkina faso"], aen: ["burkina faso"], code: "bf" },
      { tr: "Burundi", en: "Burundi", flag: "ğŸ‡§ğŸ‡®", atr: ["burundi"], aen: ["burundi"], code: "bi" },
      { tr: "Cabo Verde", en: "Cape Verde", flag: "ğŸ‡¨ğŸ‡»", atr: ["cabo verde", "yeÅŸil burun", "kap verde", "kape verde", "cape verde"], aen: ["cape verde", "cabo verde", "cap verde"], code: "cv" },
      { tr: "Kamerun", en: "Cameroon", flag: "ğŸ‡¨ğŸ‡²", atr: ["kamerun"], aen: ["cameroon"], code: "cm" },
      { tr: "Orta Afrika Cumhuriyeti", en: "Central African Republic", flag: "ğŸ‡¨ğŸ‡«", atr: ["orta afrika", "oac"], aen: ["central african republic", "car"], code: "cf" },
      { tr: "Ã‡ad", en: "Chad", flag: "ğŸ‡¹ğŸ‡©", atr: ["Ã§ad", "cad"], aen: ["chad"], code: "td" },
      { tr: "Komorlar", en: "Comoros", flag: "ğŸ‡°ğŸ‡²", atr: ["komorlar"], aen: ["comoros"], code: "km" },
      { tr: "Kongo", en: "Republic of the Congo", flag: "ğŸ‡¨ğŸ‡¬", atr: ["kongo", "kongo cumhuriyeti"], aen: ["congo", "republic of the congo"], code: "cg" },
      { tr: "Demokratik Kongo", en: "DR Congo", flag: "ğŸ‡¨ğŸ‡©", atr: ["demokratik kongo", "drc", "kongo dr"], aen: ["dr congo", "drc", "democratic republic of the congo"], code: "cd" },
      { tr: "Cibuti", en: "Djibouti", flag: "ğŸ‡©ğŸ‡¯", atr: ["cibuti", "djibouti"], aen: ["djibouti"], code: "dj" },
      { tr: "MÄ±sÄ±r", en: "Egypt", flag: "ğŸ‡ªğŸ‡¬", atr: ["mÄ±sÄ±r", "misir"], aen: ["egypt"], code: "eg" },
      { tr: "Ekvator Ginesi", en: "Equatorial Guinea", flag: "ğŸ‡¬ğŸ‡¶", atr: ["ekvator ginesi"], aen: ["equatorial guinea"], code: "gq" },
      { tr: "Eritre", en: "Eritrea", flag: "ğŸ‡ªğŸ‡·", atr: ["eritre"], aen: ["eritrea"], code: "er" },
      { tr: "Eswatini", en: "Eswatini", flag: "ğŸ‡¸ğŸ‡¿", atr: ["eswatini", "svaziland"], aen: ["eswatini", "swaziland"], code: "sz" },
      { tr: "Etiyopya", en: "Ethiopia", flag: "ğŸ‡ªğŸ‡¹", atr: ["etiyopya"], aen: ["ethiopia"], code: "et" },
      { tr: "Gabon", en: "Gabon", flag: "ğŸ‡¬ğŸ‡¦", atr: ["gabon"], aen: ["gabon"], code: "ga" },
      { tr: "Gambiya", en: "Gambia", flag: "ğŸ‡¬ğŸ‡²", atr: ["gambiya"], aen: ["gambia"], code: "gm" },
      { tr: "Gana", en: "Ghana", flag: "ğŸ‡¬ğŸ‡­", atr: ["gana"], aen: ["ghana"], code: "gh" },
      { tr: "Gine", en: "Guinea", flag: "ğŸ‡¬ğŸ‡³", atr: ["gine"], aen: ["guinea"], code: "gn" },
      { tr: "Gine-Bissau", en: "Guinea-Bissau", flag: "ğŸ‡¬ğŸ‡¼", atr: ["gine-bissau", "gine bissau"], aen: ["guinea-bissau"], code: "gw" },
      { tr: "FildiÅŸi Sahili", en: "Ivory Coast", flag: "ğŸ‡¨ğŸ‡®", atr: ["fildiÅŸi sahili", "fildisi sahili", "kote divuar"], aen: ["ivory coast", "cÃ´te d'ivoire", "cote d'ivoire"], code: "ci" },
      { tr: "Kenya", en: "Kenya", flag: "ğŸ‡°ğŸ‡ª", atr: ["kenya"], aen: ["kenya"], code: "ke" },
      { tr: "Lesotho", en: "Lesotho", flag: "ğŸ‡±ğŸ‡¸", atr: ["lesoto", "lesotho"], aen: ["lesotho"], code: "ls" },
      { tr: "Liberya", en: "Liberia", flag: "ğŸ‡±ğŸ‡·", atr: ["liberya"], aen: ["liberia"], code: "lr" },
      { tr: "Libya", en: "Libya", flag: "ğŸ‡±ğŸ‡¾", atr: ["libya"], aen: ["libya"], code: "ly" },
      { tr: "Madagaskar", en: "Madagascar", flag: "ğŸ‡²ğŸ‡¬", atr: ["madagaskar"], aen: ["madagascar"], code: "mg" },
      { tr: "Malawi", en: "Malawi", flag: "ğŸ‡²ğŸ‡¼", atr: ["malawi"], aen: ["malawi"], code: "mw" },
      { tr: "Mali", en: "Mali", flag: "ğŸ‡²ğŸ‡±", atr: ["mali"], aen: ["mali"], code: "ml" },
      { tr: "Moritanya", en: "Mauritania", flag: "ğŸ‡²ğŸ‡·", atr: ["moritanya"], aen: ["mauritania"], code: "mr" },
      { tr: "Mauritius", en: "Mauritius", flag: "ğŸ‡²ğŸ‡º", atr: ["morityus", "mauritius"], aen: ["mauritius"], code: "mu" },
      { tr: "Fas", en: "Morocco", flag: "ğŸ‡²ğŸ‡¦", atr: ["fas"], aen: ["morocco"], code: "ma" },
      { tr: "Mozambik", en: "Mozambique", flag: "ğŸ‡²ğŸ‡¿", atr: ["mozambik"], aen: ["mozambique"], code: "mz" },
      { tr: "Namibya", en: "Namibia", flag: "ğŸ‡³ğŸ‡¦", atr: ["namibya"], aen: ["namibia"], code: "na" },
      { tr: "Nijer", en: "Niger", flag: "ğŸ‡³ğŸ‡ª", atr: ["nijer"], aen: ["niger"], code: "ne" },
      { tr: "Nijerya", en: "Nigeria", flag: "ğŸ‡³ğŸ‡¬", atr: ["nijerya"], aen: ["nigeria"], code: "ng" },
      { tr: "Ruanda", en: "Rwanda", flag: "ğŸ‡·ğŸ‡¼", atr: ["ruanda", "rwanda"], aen: ["rwanda"], code: "rw" },
      { tr: "SÃ£o TomÃ© ve PrÃ­ncipe", en: "SÃ£o TomÃ© and PrÃ­ncipe", flag: "ğŸ‡¸ğŸ‡¹", atr: ["sao tome"], aen: ["sao tome"], code: "st" },
      { tr: "Senegal", en: "Senegal", flag: "ğŸ‡¸ğŸ‡³", atr: ["senegal"], aen: ["senegal"], code: "sn" },
      { tr: "SeyÅŸeller", en: "Seychelles", flag: "ğŸ‡¸ğŸ‡¨", atr: ["seyÅŸeller", "seyseller"], aen: ["seychelles"], code: "sc" },
      { tr: "Sierra Leone", en: "Sierra Leone", flag: "ğŸ‡¸ğŸ‡±", atr: ["sierra leone"], aen: ["sierra leone"], code: "sl" },
      { tr: "Somali", en: "Somalia", flag: "ğŸ‡¸ğŸ‡´", atr: ["somali"], aen: ["somalia"], code: "so" },
      { tr: "GÃ¼ney Afrika", en: "South Africa", flag: "ğŸ‡¿ğŸ‡¦", atr: ["gÃ¼ney afrika", "guney afrika"], aen: ["south africa"], code: "za" },
      { tr: "GÃ¼ney Sudan", en: "South Sudan", flag: "ğŸ‡¸ğŸ‡¸", atr: ["gÃ¼ney sudan", "guney sudan"], aen: ["south sudan"], code: "ss" },
      { tr: "Sudan", en: "Sudan", flag: "ğŸ‡¸ğŸ‡©", atr: ["sudan"], aen: ["sudan"], code: "sd" },
      { tr: "Tanzanya", en: "Tanzania", flag: "ğŸ‡¹ğŸ‡¿", atr: ["tanzanya"], aen: ["tanzania"], code: "tz" },
      { tr: "Togo", en: "Togo", flag: "ğŸ‡¹ğŸ‡¬", atr: ["togo"], aen: ["togo"], code: "tg" },
      { tr: "Tunus", en: "Tunisia", flag: "ğŸ‡¹ğŸ‡³", atr: ["tunus"], aen: ["tunisia"], code: "tn" },
      { tr: "Uganda", en: "Uganda", flag: "ğŸ‡ºğŸ‡¬", atr: ["uganda"], aen: ["uganda"], code: "ug" },
      { tr: "Zambiya", en: "Zambia", flag: "ğŸ‡¿ğŸ‡²", atr: ["zambiya"], aen: ["zambia"], code: "zm" },
      { tr: "Zimbabwe", en: "Zimbabwe", flag: "ğŸ‡¿ğŸ‡¼", atr: ["zimbabve", "zimbabwe"], aen: ["zimbabwe"], code: "zw" },
      { tr: "Antigua ve Barbuda", en: "Antigua and Barbuda", flag: "ğŸ‡¦ğŸ‡¬", atr: ["antigua"], aen: ["antigua", "antigua and barbuda"], code: "ag" },
      { tr: "Arjantin", en: "Argentina", flag: "ğŸ‡¦ğŸ‡·", atr: ["arjantin"], aen: ["argentina"], code: "ar" },
      { tr: "Bahamalar", en: "Bahamas", flag: "ğŸ‡§ğŸ‡¸", atr: ["bahamalar"], aen: ["bahamas"], code: "bs" },
      { tr: "Barbados", en: "Barbados", flag: "ğŸ‡§ğŸ‡§", atr: ["barbados"], aen: ["barbados"], code: "bb" },
      { tr: "Belize", en: "Belize", flag: "ğŸ‡§ğŸ‡¿", atr: ["belize"], aen: ["belize"], code: "bz" },
      { tr: "Bolivya", en: "Bolivia", flag: "ğŸ‡§ğŸ‡´", atr: ["bolivya"], aen: ["bolivia"], code: "bo" },
      { tr: "Brezilya", en: "Brazil", flag: "ğŸ‡§ğŸ‡·", atr: ["brezilya"], aen: ["brazil", "brasil"], code: "br" },
      { tr: "Kanada", en: "Canada", flag: "ğŸ‡¨ğŸ‡¦", atr: ["kanada"], aen: ["canada"], code: "ca" },
      { tr: "Åili", en: "Chile", flag: "ğŸ‡¨ğŸ‡±", atr: ["ÅŸili", "sili"], aen: ["chile"], code: "cl" },
      { tr: "Kolombiya", en: "Colombia", flag: "ğŸ‡¨ğŸ‡´", atr: ["kolombiya"], aen: ["colombia"], code: "co" },
      { tr: "Kosta Rika", en: "Costa Rica", flag: "ğŸ‡¨ğŸ‡·", atr: ["kosta rika"], aen: ["costa rica"], code: "cr" },
      { tr: "KÃ¼ba", en: "Cuba", flag: "ğŸ‡¨ğŸ‡º", atr: ["kÃ¼ba", "kuba"], aen: ["cuba"], code: "cu" },
      { tr: "Dominika", en: "Dominica", flag: "ğŸ‡©ğŸ‡²", atr: ["dominika"], aen: ["dominica"], code: "dm" },
      { tr: "Dominik Cumhuriyeti", en: "Dominican Republic", flag: "ğŸ‡©ğŸ‡´", atr: ["dominik", "dominik cumhuriyeti"], aen: ["dominican republic", "dominican"], code: "do" },
      { tr: "Ekvador", en: "Ecuador", flag: "ğŸ‡ªğŸ‡¨", atr: ["ekvador"], aen: ["ecuador"], code: "ec" },
      { tr: "El Salvador", en: "El Salvador", flag: "ğŸ‡¸ğŸ‡»", atr: ["el salvador", "salvador"], aen: ["el salvador"], code: "sv" },
      { tr: "Grenada", en: "Grenada", flag: "ğŸ‡¬ğŸ‡©", atr: ["grenada"], aen: ["grenada"], code: "gd" },
      { tr: "Guatemala", en: "Guatemala", flag: "ğŸ‡¬ğŸ‡¹", atr: ["guatemala"], aen: ["guatemala"], code: "gt" },
      { tr: "Guyana", en: "Guyana", flag: "ğŸ‡¬ğŸ‡¾", atr: ["guyana"], aen: ["guyana"], code: "gy" },
      { tr: "Haiti", en: "Haiti", flag: "ğŸ‡­ğŸ‡¹", atr: ["haiti"], aen: ["haiti"], code: "ht" },
      { tr: "Honduras", en: "Honduras", flag: "ğŸ‡­ğŸ‡³", atr: ["honduras"], aen: ["honduras"], code: "hn" },
      { tr: "Jamaika", en: "Jamaica", flag: "ğŸ‡¯ğŸ‡²", atr: ["jamaika"], aen: ["jamaica"], code: "jm" },
      { tr: "Meksika", en: "Mexico", flag: "ğŸ‡²ğŸ‡½", atr: ["meksika"], aen: ["mexico"], code: "mx" },
      { tr: "Nikaragua", en: "Nicaragua", flag: "ğŸ‡³ğŸ‡®", atr: ["nikaragua"], aen: ["nicaragua"], code: "ni" },
      { tr: "Panama", en: "Panama", flag: "ğŸ‡µğŸ‡¦", atr: ["panama"], aen: ["panama"], code: "pa" },
      { tr: "Paraguay", en: "Paraguay", flag: "ğŸ‡µğŸ‡¾", atr: ["paraguay"], aen: ["paraguay"], code: "py" },
      { tr: "Peru", en: "Peru", flag: "ğŸ‡µğŸ‡ª", atr: ["peru"], aen: ["peru"], code: "pe" },
      { tr: "Saint Kitts ve Nevis", en: "Saint Kitts and Nevis", flag: "ğŸ‡°ğŸ‡³", atr: ["saint kitts"], aen: ["saint kitts", "saint kitts and nevis"], code: "kn" },
      { tr: "Saint Lucia", en: "Saint Lucia", flag: "ğŸ‡±ğŸ‡¨", atr: ["saint lucia"], aen: ["saint lucia"], code: "lc" },
      { tr: "Saint Vincent", en: "Saint Vincent and the Grenadines", flag: "ğŸ‡»ğŸ‡¨", atr: ["saint vincent"], aen: ["saint vincent", "saint vincent and the grenadines"], code: "vc" },
      { tr: "Surinam", en: "Suriname", flag: "ğŸ‡¸ğŸ‡·", atr: ["surinam"], aen: ["suriname"], code: "sr" },
      { tr: "Trinidad ve Tobago", en: "Trinidad and Tobago", flag: "ğŸ‡¹ğŸ‡¹", atr: ["trinidad"], aen: ["trinidad", "trinidad and tobago"], code: "tt" },
      { tr: "ABD", en: "United States", flag: "ğŸ‡ºğŸ‡¸", atr: ["abd", "amerika", "usa", "birleÅŸik devletler", "birlesik devletler", "america"], aen: ["usa", "us", "united states", "america", "united states of america"], code: "us" },
      { tr: "Uruguay", en: "Uruguay", flag: "ğŸ‡ºğŸ‡¾", atr: ["uruguay"], aen: ["uruguay"], code: "uy" },
      { tr: "Venezuela", en: "Venezuela", flag: "ğŸ‡»ğŸ‡ª", atr: ["venezuela"], aen: ["venezuela"], code: "ve" },
      { tr: "Avustralya", en: "Australia", flag: "ğŸ‡¦ğŸ‡º", atr: ["avustralya"], aen: ["australia"], code: "au" },
      { tr: "Fiji", en: "Fiji", flag: "ğŸ‡«ğŸ‡¯", atr: ["fiji"], aen: ["fiji"], code: "fj" },
      { tr: "Kiribati", en: "Kiribati", flag: "ğŸ‡°ğŸ‡®", atr: ["kiribati"], aen: ["kiribati"], code: "ki" },
      { tr: "Marshall AdalarÄ±", en: "Marshall Islands", flag: "ğŸ‡²ğŸ‡­", atr: ["marshall adalarÄ±", "marshall"], aen: ["marshall islands", "marshall"], code: "mh" },
      { tr: "Mikronezya", en: "Micronesia", flag: "ğŸ‡«ğŸ‡²", atr: ["mikronezya"], aen: ["micronesia"], code: "fm" },
      { tr: "Nauru", en: "Nauru", flag: "ğŸ‡³ğŸ‡·", atr: ["nauru"], aen: ["nauru"], code: "nr" },
      { tr: "Yeni Zelanda", en: "New Zealand", flag: "ğŸ‡³ğŸ‡¿", atr: ["yeni zelanda"], aen: ["new zealand"], code: "nz" },
      { tr: "Palau", en: "Palau", flag: "ğŸ‡µğŸ‡¼", atr: ["palau"], aen: ["palau"], code: "pw" },
      { tr: "Papua Yeni Gine", en: "Papua New Guinea", flag: "ğŸ‡µğŸ‡¬", atr: ["papua yeni gine", "papua"], aen: ["papua new guinea", "papua"], code: "pg" },
      { tr: "Samoa", en: "Samoa", flag: "ğŸ‡¼ğŸ‡¸", atr: ["samoa"], aen: ["samoa"], code: "ws" },
      { tr: "Solomon AdalarÄ±", en: "Solomon Islands", flag: "ğŸ‡¸ğŸ‡§", atr: ["solomon adalarÄ±", "solomon"], aen: ["solomon islands", "solomon"], code: "sb" },
      { tr: "Tonga", en: "Tonga", flag: "ğŸ‡¹ğŸ‡´", atr: ["tonga"], aen: ["tonga"], code: "to" },
      { tr: "Tuvalu", en: "Tuvalu", flag: "ğŸ‡¹ğŸ‡»", atr: ["tuvalu"], aen: ["tuvalu"], code: "tv" },
      { tr: "Vanuatu", en: "Vanuatu", flag: "ğŸ‡»ğŸ‡º", atr: ["vanuatu"], aen: ["vanuatu"], code: "vu" },
    ];

    const LEVEL_CONFIG_WORLD = [
      { questions: 3, target: 873 },
      { questions: 4, target: 1358 },
      { questions: 5, target: 1885 },
      { questions: 6, target: 2509 },
      { questions: 7, target: 3250 },
      { questions: 8, target: 4123 },
      { questions: 8, target: 4760 },
      { questions: 8, target: 5283 },
      { questions: 8, target: 5865 },
      { questions: 8, target: 6360 },
    ];
    LEVEL_CONFIG_TURKEY = [
      { questions: 3, target: 890 },
      { questions: 4, target: 1385 },
      { questions: 5, target: 1923 },
      { questions: 6, target: 2559 },
      { questions: 7, target: 3315 },
      { questions: 8, target: 4205 },
      { questions: 8, target: 4855 },
      { questions: 8, target: 5389 },
      { questions: 8, target: 5982 },
      { questions: 8, target: 6360 },
    ];
    function getLevelConfig(l) { return (gameMode === 'turkey' ? LEVEL_CONFIG_TURKEY : LEVEL_CONFIG_WORLD)[l - 1]; }

    let state = { level: 1, levelScore: 0, totalScore: 0, questionIndex: 0, questions: [], answered: false, combo: 0 };
    let timerInterval = null, timerSeconds = 0;

    let downX = null, downY = null, downTime = null;

    // ===== D3 MAP =====

    function getActiveSvgSelection() {
      if (gameMode === 'turkey') return d3.select('#turkey-svg');
      if (gameMode === 'europe') return d3.select('#europe-svg');
      return svgEl;
    }
    function getActiveSvgNode() {
      if (gameMode === 'turkey') return document.getElementById('turkey-svg');
      if (gameMode === 'europe') return document.getElementById('europe-svg');
      return svgEl ? svgEl.node() : null;
    }
    function getActiveProjection() {
      if (gameMode === 'turkey' && window.turkeyProj) return window.turkeyProj;
      if (gameMode === 'europe' && europeProj) return europeProj;
      return projection;
    }
    function getActiveTransform() {
      if (gameMode === 'turkey') return window.turkeyTransform || d3.zoomIdentity;
      if (gameMode === 'europe') return europeTransform || d3.zoomIdentity;
      return currentTransform || d3.zoomIdentity;
    }
    function getActiveMarkersParent() {
      if (gameMode === 'turkey' && window.turkeyMarkersG) return window.turkeyMarkersG;
      if (gameMode === 'europe' && europeMarkersG) return europeMarkersG;
      return markersG;
    }
    function bindMapTapHandlers(svgSelection) {
      const svgNode = svgSelection.node();
      const allowedTargets = (el) => {
        while (el && el !== document.body) {
          const tag = el.tagName.toLowerCase();
          if (tag === 'svg' || tag === 'path' || tag === 'g' || tag === 'circle' || tag === 'line' || tag === 'polygon') return true;
          if (tag === 'button' || tag === 'div' || tag === 'span' || tag === 'a') return false;
          el = el.parentElement;
        }
        return false;
      };
      let _activePointers = 0;
      svgNode.addEventListener('pointerdown', e => {
        _activePointers++;
        if (!e.isPrimary) { downX = null; downY = null; return; }
        if (_activePointers > 1) { downX = null; downY = null; return; }
        if (!allowedTargets(e.target)) return;
        downX = e.clientX; downY = e.clientY; downTime = Date.now();
      }, { passive: true });
      svgNode.addEventListener('pointerup', e => {
        _activePointers = Math.max(0, _activePointers - 1);
        if (!e.isPrimary || downX === null) return;
        if (!allowedTargets(e.target)) { downX = null; downY = null; return; }
        const dx = e.clientX - downX, dy = e.clientY - downY, dt = Date.now() - downTime;
        downX = null; downY = null;
        const isMobile = 'ontouchstart' in window;
        const threshold = isMobile ? 8 : 14;
        const maxTime = isMobile ? 300 : 400;
        if (Math.sqrt(dx * dx + dy * dy) < threshold && dt < maxTime) { handleMapClick(e); }
      }, { passive: true });
      svgNode.addEventListener('pointercancel', e => {
        _activePointers = Math.max(0, _activePointers - 1);
        if (e.isPrimary) { downX = null; downY = null; }
      }, { passive: true });
      svgNode.addEventListener('pointerleave', e => {
        if (e.isPrimary) { _activePointers = 0; }
      }, { passive: true });
      // Android WebView touch fallback â€” pointer event'leri bazen Ã§alÄ±ÅŸmaz
      let _tStartX = null, _tStartY = null, _tStartTime = null;
      svgNode.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) { _tStartX = null; return; }
        _tStartX = e.touches[0].clientX;
        _tStartY = e.touches[0].clientY;
        _tStartTime = Date.now();
      }, { passive: true });
      svgNode.addEventListener('touchend', e => {
        if (_tStartX === null) return;
        if (e.changedTouches.length !== 1) { _tStartX = null; return; }
        const t = e.changedTouches[0];
        const dx = t.clientX - _tStartX, dy = t.clientY - _tStartY, dt = Date.now() - _tStartTime;
        _tStartX = null;
        if (Math.sqrt(dx * dx + dy * dy) < 8 && dt < 300) {
          // downX/downY pointer handler'Ä± tarafÄ±ndan zaten iÅŸlendiyse Ã§ift tetiklenmesin
          if (downX === null) handleMapClick(e);
        }
      }, { passive: true });
    }

    async function loadEuropeMap() {
      try {
        let world = await _getMapCache('europe-50m');
        if (!world) {
          const r = await fetch(EUROPE_URL);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          world = await r.json();
          _setMapCache('europe-50m', world);
        }
        const countries = topojson.feature(world, world.objects.countries);

        // ISO 3166-1 numeric ID whitelist â€” sadece bu Ã¼lkeler haritada gÃ¶rÃ¼nÃ¼r
        // Kafkasya (AZ=31,AM=51,GE=268), Kazakistan(398), TÃ¼rkmenistan(795),
        // Ã–zbekistan(860), KÄ±rgÄ±zistan(417), Tacikistan(762) hariÃ§
        const EUROPE_IDS = new Set([
          8,   // Arnavutluk
          20,  // Andorra
          40,  // Avusturya
          56,  // BelÃ§ika
          70,  // Bosna-Hersek
          100, // Bulgaristan
          191, // HÄ±rvatistan
          196, // KÄ±brÄ±s
          203, // Ã‡ekya
          208, // Danimarka
          233, // Estonya
          246, // Finlandiya
          250, // Fransa
          276, // Almanya
          300, // Yunanistan
          348, // Macaristan
          352, // Ä°zlanda
          372, // Ä°rlanda
          380, // Ä°talya
          383, // Kosova (bazÄ± topojson'larda yok)
          428, // Letonya
          438, // Liechtenstein
          440, // Litvanya
          442, // LÃ¼ksemburg
          470, // Malta
          498, // Moldova
          492, // Monako
          499, // KaradaÄŸ
          528, // Hollanda
          807, // Kuzey Makedonya
          578, // NorveÃ§
          616, // Polonya
          620, // Portekiz
          642, // Romanya
          643, // Rusya (batÄ±sÄ± â€” tam polygon gÃ¶sterilecek, ÅŸehirler lon<65)
          674, // San Marino
          688, // SÄ±rbistan
          703, // Slovakya
          705, // Slovenya
          724, // Ä°spanya
          752, // Ä°sveÃ§
          756, // Ä°sviÃ§re
          792, // TÃ¼rkiye
          804, // Ukrayna
          826, // Ä°ngiltere
          336, // Vatikan
          112, // Belarus
          498, // Moldova
          620, // Portekiz
        ]);

        // Helper: clip a feature to only keep polygons within European bounds
        // Removes Atlantic islands (Azores, Canaries, Madeira) and Siberian Russia
        // Rusya icin LON_MAX=57 â†’ Moskova(37), St.Petersburg(30), Kazan(49),
        // Samara(50) haritada gorulur; Ufa(56), Perm(56), Yekaterinburg(61) haric
        function clipToEuropeBounds(feature) {
          const isRussia = +feature.id === 643;
          const LON_MIN = -15;
          const LON_MAX = 57;   // 57Â°D boylamÄ±nÄ±n batÄ±sÄ±ndaki Rusya topraklarÄ±
          const LAT_MIN = 30;
          const LAT_MAX = isRussia ? 62 : 75; // Rusya kuzeyi hariÃ§

          // Centroid tabanlÄ± kontrol (kÃ¼Ã§Ã¼k Ã¼lkeler iÃ§in yeterli)
          function ringInBounds(ring) {
            let sumLon = 0, sumLat = 0;
            for (const pt of ring) { sumLon += pt[0]; sumLat += pt[1]; }
            const cLon = sumLon / ring.length;
            const cLat = sumLat / ring.length;
            return cLon >= LON_MIN && cLon <= LON_MAX && cLat >= LAT_MIN && cLat <= LAT_MAX;
          }

          // Rusya gibi kÄ±talar arasÄ± Ã¼lkeler iÃ§in: herhangi bir nokta
          // Avrupa sÄ±nÄ±rlarÄ± iÃ§indeyse polygon'u tut ve batÄ± kÄ±smÄ±nÄ± kÄ±rp
          function hasAnyPointInBounds(ring) {
            for (const pt of ring) {
              if (pt[0] >= LON_MIN && pt[0] <= LON_MAX && pt[1] >= LAT_MIN && pt[1] <= LAT_MAX) return true;
            }
            return false;
          }

          // Rusya polygon'unu hem LON_MAX hem LAT_MAX ile kÄ±rp (Sutherland-Hodgman)
          function clipRingToBounds(ring) {
            // 1. adÄ±m: LON_MAX ile kÄ±rp (doÄŸuyu kes)
            let output = ring;
            output = _clipEdge(output, function(p) { return p[0] <= LON_MAX; }, function(a, b) {
              const t = (LON_MAX - a[0]) / (b[0] - a[0]);
              return [LON_MAX, a[1] + t * (b[1] - a[1])];
            });
            if (output.length < 3) return null;
            // 2. adÄ±m: LAT_MAX ile kÄ±rp (kuzeyi kes â€” enlem bÃ¼yÃ¼k = kuzey)
            output = _clipEdge(output, function(p) { return p[1] <= LAT_MAX; }, function(a, b) {
              const t = (LAT_MAX - a[1]) / (b[1] - a[1]);
              return [a[0] + t * (b[0] - a[0]), LAT_MAX];
            });
            return output.length >= 3 ? output : null;
          }
          function _clipEdge(poly, inside, intersect) {
            const out = [];
            for (let i = 0; i < poly.length; i++) {
              const cur = poly[i];
              const next = poly[(i + 1) % poly.length];
              const curIn = inside(cur), nextIn = inside(next);
              if (curIn) out.push(cur);
              if (curIn !== nextIn) out.push(intersect(cur, next));
            }
            return out;
          }

          const geom = feature.geometry;
          if (!geom) return feature;

          if (geom.type === 'Polygon') {
            if (isRussia) {
              if (!hasAnyPointInBounds(geom.coordinates[0])) return null;
              const clippedOuter = clipRingToBounds(geom.coordinates[0]);
              if (!clippedOuter) return null;
              return { ...feature, geometry: { ...geom, coordinates: [clippedOuter] } };
            }
            if (!ringInBounds(geom.coordinates[0])) return null;
            return feature;
          }

          if (geom.type === 'MultiPolygon') {
            let filtered;
            if (isRussia) {
              filtered = [];
              for (const poly of geom.coordinates) {
                if (hasAnyPointInBounds(poly[0])) {
                  const clippedOuter = clipRingToBounds(poly[0]);
                  if (clippedOuter) filtered.push([clippedOuter]);
                }
              }
            } else {
              filtered = geom.coordinates.filter(poly => ringInBounds(poly[0]));
            }
            if (filtered.length === 0) return null;
            return { ...feature, geometry: { ...geom, coordinates: filtered } };
          }
          return feature;
        }

        const europeFeatures = countries.features
          .filter(f => EUROPE_IDS.has(+f.id))
          .map(f => clipToEuropeBounds(f))
          .filter(Boolean);

        const cont = document.getElementById('map-container');
        const W = cont.clientWidth, H = cont.clientHeight;

        // fitExtent: Izlanda(352) haric â€” Rusya(643) dahil, batÄ± kÄ±smÄ± gÃ¶rÃ¼nsÃ¼n
        const fitFeatures = europeFeatures.filter(f => +f.id !== 352);
        const fc = { type: 'FeatureCollection', features: fitFeatures.length > 5 ? fitFeatures : europeFeatures };

        // padTop buyuk â†’ projeksiyon merkezi asagi kayar â†’ harita asagidan baslar
        const padLeft = 16, padRight = 16, padTop = 56, padBot = 8;
        europeProj = d3.geoMercator().fitExtent([[padLeft, padTop], [W - padRight, H - padBot]], fc);
        europePathFn = d3.geoPath().projection(europeProj);

        if (!europeMapG) {
          europeMapG = europeSvgEl.append('g').attr('id', 'europe-map-g');
        }
        // markersG her zaman en Ã¼stte olsun â€” yeniden ekle
        const existingMG = document.getElementById('europe-markers-g');
        if (existingMG) existingMG.remove();
        europeMarkersG = europeSvgEl.append('g').attr('id', 'europe-markers-g');
        europeMapG.selectAll('*').remove();
        europeMapG.selectAll('.country')
          .data(europeFeatures)
          .enter().append('path')
          .attr('class', 'country')
          .attr('d', europePathFn);
        europeMapLoaded = true;
        // Ä°lk yÃ¼klemede haritayÄ± ortala
        const _europeInitScale = 1.15;
        const _ec = document.getElementById('map-container');
        const _ew = _ec.clientWidth, _eh = _ec.clientHeight;
        const _europeInitT = d3.zoomIdentity
          .translate(_ew / 2 * (1 - _europeInitScale), _eh / 2 * (1 - _europeInitScale))
          .scale(_europeInitScale);
        europeSvgEl.call(europeZoom.transform, _europeInitT);

        _bindEuropeClickHandler();
      } catch (err) {
        console.error('Avrupa haritasÄ± yÃ¼klenemedi:', err);
        const el = document.getElementById('loading-error');
        if (el) el.style.display = 'flex';
      }
    }

    function _bindEuropeClickHandler() {
      const svgEl2 = document.getElementById('europe-svg');
      if (!svgEl2) return;

      // Önceki handler'ları temizle
      if (svgEl2._epDown) svgEl2.removeEventListener('pointerdown', svgEl2._epDown);
      if (svgEl2._epUp) svgEl2.removeEventListener('pointerup', svgEl2._epUp);
      if (svgEl2._epCancel) svgEl2.removeEventListener('pointercancel', svgEl2._epCancel);
      if (svgEl2._epLeave) svgEl2.removeEventListener('pointerleave', svgEl2._epLeave);
      if (svgEl2._epClick) svgEl2.removeEventListener('click', svgEl2._epClick);

      // Dünya haritasıyla aynı pointer-based tap algılama
      let _epX = null, _epY = null, _epTime = null, _epCnt = 0;

      const _epFire = function(cx, cy) {
        if (state.answered) return;
        if (!europeProj) return;
        const rect = svgEl2.getBoundingClientRect();
        const px = cx - rect.left;
        const py = cy - rect.top;
        const tr = europeTransform || d3.zoomIdentity;
        const bx = (px - tr.x) / tr.k;
        const by = (py - tr.y) / tr.k;
        const coords = europeProj.invert([bx, by]);
        if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return;
        window.handleClickAtLonLat(coords[0], coords[1]);
      };

      svgEl2._epDown = function(e) {
        if (!e.isPrimary) { _epCnt = 0; _epX = null; return; }
        _epCnt++;
        if (_epCnt > 1) { _epX = null; return; }
        _epX = e.clientX; _epY = e.clientY; _epTime = Date.now();
      };
      svgEl2._epUp = function(e) {
        if (!e.isPrimary) return;
        _epCnt = Math.max(0, _epCnt - 1);
        if (_epX === null) return;
        const dx = e.clientX - _epX, dy = e.clientY - _epY;
        const dt = Date.now() - _epTime;
        const sx = _epX, sy = _epY;
        _epX = null;
        if (Math.sqrt(dx*dx + dy*dy) < 12 && dt < 400) _epFire(e.clientX, e.clientY);
      };
      svgEl2._epCancel = function(e) { if (e.isPrimary) { _epX = null; _epCnt = 0; } };
      svgEl2._epLeave = function(e) { if (e.isPrimary) { _epCnt = 0; } };
      svgEl2._epClick = function(evt) {
        // Sadece gerçek mouse click (touch simülasyonu değil)
        if (evt.pointerType === 'touch' || evt.detail === 0) return;
        _epFire(evt.clientX, evt.clientY);
      };

      svgEl2.addEventListener('pointerdown', svgEl2._epDown, { passive: true });
      svgEl2.addEventListener('pointerup', svgEl2._epUp, { passive: true });
      svgEl2.addEventListener('pointercancel', svgEl2._epCancel, { passive: true });
      svgEl2.addEventListener('pointerleave', svgEl2._epLeave, { passive: true });
      svgEl2.addEventListener('click', svgEl2._epClick);
    }

    let svgEl, mapG, markersG, projection, geoPathFn, zoomBehavior, currentTransform = d3.zoomIdentity;
    let europeSvgEl, europeMapG, europeMarkersG, europeProj, europePathFn, europeZoom, europeTransform = d3.zoomIdentity, europeMapLoaded = false;
    let savedMarkers = [];

    // Uygulama baÅŸlayÄ±nca harita verilerini arka planda cache'e al
    async function prefetchMapData() {
      // DÃ¼nya haritasÄ± cache'de yoksa arka planda yÃ¼kle
      const worldCached = await _getMapCache('world-110m');
      if (!worldCached) {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data) _setMapCache('world-110m', data); })
          .catch(() => { });
      }
      // Avrupa haritasÄ± cache'de yoksa arka planda yÃ¼kle
      const europeCached = await _getMapCache('europe-50m');
      if (!europeCached) {
        fetch(EUROPE_URL)
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data) _setMapCache('europe-50m', data); })
          .catch(() => { });
      }
      // TÃ¼rkiye haritasÄ± cache'de yoksa arka planda yÃ¼kle
      const turkeyCached = await _getMapCache('turkey-provinces');
      if (!turkeyCached) {
        fetch('https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json')
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data) _setMapCache('turkey-provinces', data); })
          .catch(() => { });
      }
    }

    function initMap() {
      const cont = document.getElementById('map-container');
      const W = cont.clientWidth, H = cont.clientHeight;

      svgEl = d3.select('#world-svg');

      // Daha kÃ¼Ã§Ã¼k baÅŸlangÄ±Ã§ scale â€” tÃ¼m dÃ¼nya gÃ¶rÃ¼nsÃ¼n
      const initialScale = Math.min(W, H) / Math.PI * 0.85;
      projection = d3.geoMercator()
        .scale(initialScale)
        .translate([W / 2, H / 2]);

      geoPathFn = d3.geoPath().projection(projection);

      mapG = svgEl.append('g').attr('id', 'map-g');
      markersG = svgEl.append('g').attr('id', 'markers-g');

      zoomBehavior = d3.zoom()
        .scaleExtent([0.8, 16])
        .on('zoom', evt => {
          currentTransform = evt.transform;
          mapG.attr('transform', evt.transform);
          markersG.attr('transform', evt.transform);
          // keep marker size constant in screen space
          const k = evt.transform.k;
          markersG.selectAll('.m-outer').attr('r', 7 / k);
          markersG.selectAll('.m-inner').attr('r', 3 / k);
          markersG.selectAll('.distance-line').style('stroke-width', 1.5 / k + 'px');
        });

      svgEl.call(zoomBehavior);

      europeSvgEl = d3.select('#europe-svg');
      europeZoom = d3.zoom()
        .scaleExtent([0.4, 16])
        .filter(function(event) {
          // Touch event'lerini tamamen D3 zoom'dan Ã§Ä±kar
          // Tek parmak tap ve pinch zoom'u manuel handle edeceÄŸiz
          if (event.type && event.type.startsWith('touch')) return false;
          return !event.button;
        })
        .on('zoom', evt => {
          europeTransform = evt.transform;
          if (europeMapG) europeMapG.attr('transform', evt.transform);
          if (europeMarkersG) europeMarkersG.attr('transform', evt.transform);
          const k = evt.transform.k;
          if (europeMarkersG) {
            europeMarkersG.selectAll('.m-outer').attr('r', 7 / k);
            europeMarkersG.selectAll('.m-inner').attr('r', 3 / k);
            europeMarkersG.selectAll('.distance-line').style('stroke-width', 1.5 / k + 'px');
          }
        });
      europeSvgEl.call(europeZoom);

      // DÃ¼nya haritasÄ± tÄ±klama handler'larÄ±
      const svgNode = svgEl.node();
      const allowedTargets = (el) => {
        while (el && el !== document.body) {
          const tag = el.tagName.toLowerCase();
          if (tag === 'svg' || tag === 'path' || tag === 'g' || tag === 'circle' || tag === 'line' || tag === 'polygon') return true;
          if (tag === 'button' || tag === 'div' || tag === 'span' || tag === 'a') return false;
          el = el.parentElement;
        }
        return false;
      };
      let _activePointers = 0; // multi-touch takibi
      svgNode.addEventListener('pointerdown', e => {
        _activePointers++;
        if (_activePointers > 1) { downX = null; downY = null; return; } // pinch-to-zoom
        if (!allowedTargets(e.target)) return;
        downX = e.clientX; downY = e.clientY; downTime = Date.now();
      }, { passive: true });

      svgNode.addEventListener('pointerup', e => {
        _activePointers = Math.max(0, _activePointers - 1);
        if (!e.isPrimary || downX === null) return;
        if (!allowedTargets(e.target)) { downX = null; downY = null; return; }
        const dx = e.clientX - downX, dy = e.clientY - downY, dt = Date.now() - downTime;
        downX = null; downY = null;
        // Mobilde daha sÄ±kÄ± threshold â€” zoom hareketi ile karÄ±ÅŸmasÄ±n
        const isMobile = 'ontouchstart' in window;
        const threshold = isMobile ? 8 : 14;
        const maxTime = isMobile ? 300 : 400;
        if (Math.sqrt(dx * dx + dy * dy) < threshold && dt < maxTime) { handleMapClick(e); }
      }, { passive: true });

      svgNode.addEventListener('pointercancel', e => {
        _activePointers = Math.max(0, _activePointers - 1);
        if (e.isPrimary) { downX = null; downY = null; }
      }, { passive: true });
      svgNode.addEventListener('pointerleave', e => {
        if (e.isPrimary) { _activePointers = 0; }
      }, { passive: true });
      // Zoom buttons
      // Zoom butonlarÄ±na tÄ±klanÄ±nca downX sÄ±fÄ±rla â€” hayalet tÄ±klama Ã¶nle
      ['btn-zoom-in', 'btn-zoom-out', 'btn-zoom-reset'].forEach(id => {
        document.getElementById(id).addEventListener('pointerdown', e => {
          e.stopPropagation();
          downX = null; downY = null;
        }, { capture: true });
      });
      document.getElementById('btn-zoom-in').onclick = () => {
        if (gameMode === 'turkey' && window.turkeyZoom) d3.select('#turkey-svg').transition().duration(300).call(window.turkeyZoom.scaleBy, 1.8);
        else if (gameMode === 'europe' && europeZoom) europeSvgEl.transition().duration(300).call(europeZoom.scaleBy, 1.8);
        else svgEl.transition().duration(300).call(zoomBehavior.scaleBy, 1.8);
      };
      document.getElementById('btn-zoom-out').onclick = () => {
        if (gameMode === 'turkey' && window.turkeyZoom) d3.select('#turkey-svg').transition().duration(300).call(window.turkeyZoom.scaleBy, 1 / 1.8);
        else if (gameMode === 'europe' && europeZoom) europeSvgEl.transition().duration(300).call(europeZoom.scaleBy, 1 / 1.8);
        else svgEl.transition().duration(300).call(zoomBehavior.scaleBy, 1 / 1.8);
      };
      document.getElementById('btn-zoom-reset').onclick = () => {
        if (gameMode === 'turkey' && window.turkeyZoom) d3.select('#turkey-svg').transition().duration(400).call(window.turkeyZoom.transform, d3.zoomIdentity);
        else if (gameMode === 'europe' && europeZoom) {
          const _ecR = document.getElementById('map-container');
          const _ewR = _ecR.clientWidth, _ehR = _ecR.clientHeight;
          const _esR = 1.3;
          const _etR = d3.zoomIdentity.translate(_ewR / 2 * (1 - _esR), _ehR / 2 * (1 - _esR) - 30).scale(_esR);
          europeSvgEl.transition().duration(400).call(europeZoom.transform, _etR);
        }
        else svgEl.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity);
      };

      _loadWorldMap(mapG, geoPathFn);
      loadEuropeMap();

      window.addEventListener('resize', () => {
        const W2 = cont.clientWidth, H2 = cont.clientHeight;
        const initialScale2 = Math.min(W2, H2) / Math.PI * 0.85;
        projection.scale(initialScale2).translate([W2 / 2, H2 / 2]);
        geoPathFn = d3.geoPath().projection(projection);
        mapG.selectAll('.country').attr('d', geoPathFn);
        if (turkeyMapG) turkeyMapG.selectAll('.turkey-province').attr('d', geoPathFn);
        // For turkey mode: re-fit projection to new screen size
        if (typeof gameMode !== 'undefined' && gameMode === 'turkey') {
          turkeyMapLoaded = false;
          loadTurkeyMap();
        } else if (typeof gameMode !== 'undefined' && gameMode === 'europe') {
          europeMapLoaded = false;
          loadEuropeMap();
        } else {
          setTimeout(() => resetWorldMap(false), 0);
        }
        // redraw markers at new positions
        savedMarkers.forEach(m => {
          if (m.cls === 'line') return;
          const rProj = getActiveProjection(); const [px, py] = rProj([m.lon, m.lat]);
          m.node.select('.m-outer').attr('cx', px).attr('cy', py);
          m.node.select('.m-inner').attr('cx', px).attr('cy', py);
        });
      });
    }

    function getBoundsTransform(lonMin, latMin, lonMax, latMax, padding = 24) {
      const cont = document.getElementById('map-container');
      const W = cont.clientWidth, H = cont.clientHeight;
      const pts = [projection([lonMin, latMin]), projection([lonMax, latMax])].filter(Boolean);
      if (pts.length < 2) return d3.zoomIdentity;
      const x0 = Math.min(pts[0][0], pts[1][0]);
      const y0 = Math.min(pts[0][1], pts[1][1]);
      const x1 = Math.max(pts[0][0], pts[1][0]);
      const y1 = Math.max(pts[0][1], pts[1][1]);
      const dx = Math.max(1, x1 - x0);
      const dy = Math.max(1, y1 - y0);
      const scale = Math.max(0.8, Math.min(16, 0.95 / Math.max(dx / Math.max(1, W - padding * 2), dy / Math.max(1, H - padding * 2))));
      const tx = W / 2 - scale * (x0 + x1) / 2;
      const ty = H / 2 - scale * (y0 + y1) / 2;
      return d3.zoomIdentity.translate(tx, ty).scale(scale);
    }


    function focusEuropeMap(animated = true) {
      document.getElementById('world-svg').style.display = 'none';
      document.getElementById('turkey-svg').style.display = 'none';
      document.getElementById('europe-svg').style.display = 'block';
      if (!europeMapLoaded) { loadEuropeMap(); return; }
      _bindEuropeClickHandler();
      const _ec2 = document.getElementById('map-container');
      const _ew2 = _ec2.clientWidth, _eh2 = _ec2.clientHeight;
      const _europeScale = 1.15;
      const _europeT = d3.zoomIdentity
        .translate(_ew2 / 2 * (1 - _europeScale), _eh2 / 2 * (1 - _europeScale))
        .scale(_europeScale);
      const sel = animated ? europeSvgEl.transition().duration(300) : europeSvgEl;
      sel.call(europeZoom.transform, _europeT);
    }



    function resetWorldMap(animated = true) {
      if (!svgEl || !zoomBehavior) return;
      document.getElementById('world-svg').style.display = 'block';
      document.getElementById('turkey-svg').style.display = 'none';
      document.getElementById('europe-svg').style.display = 'none';
      const sel = animated ? svgEl.transition().duration(350) : svgEl;
      sel.call(zoomBehavior.transform, d3.zoomIdentity);
    }


    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // OFFLINE HARÄ°TA CACHE â€” IndexedDB
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const MAP_CACHE_DB = 'geomeister-maps';
    const MAP_CACHE_VER = 2;
    const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    const EUROPE_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
    const TURKEY_GEOJSON_URL = 'https://cdn.jsdelivr.net/npm/@turf/turf/examples/turkey.geojson';

    function _openMapDB() {
      return new Promise((res, rej) => {
        const req = indexedDB.open(MAP_CACHE_DB, MAP_CACHE_VER);
        req.onupgradeneeded = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('maps')) db.createObjectStore('maps');
        };
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
      });
    }

    async function _getMapCache(key) {
      try {
        const db = await _openMapDB();
        return new Promise((res, rej) => {
          const tx = db.transaction('maps', 'readonly');
          const req = tx.objectStore('maps').get(key);
          req.onsuccess = e => res(e.target.result || null);
          req.onerror = e => rej(e.target.error);
        });
      } catch (e) { return null; }
    }

    async function _setMapCache(key, data) {
      try {
        const db = await _openMapDB();
        return new Promise((res, rej) => {
          const tx = db.transaction('maps', 'readwrite');
          const req = tx.objectStore('maps').put(data, key);
          req.onsuccess = () => res();
          req.onerror = e => rej(e.target.error);
        });
      } catch (e) { }
    }

    async function _loadWorldMap(mapG, geoPathFn) {
      try {
        // Ã–nce cache'e bak
        let world = await _getMapCache('world-110m');
        if (!world) {
          // Cache yok â€” fetch et ve kaydet
          const r = await fetch(WORLD_URL);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          world = await r.json();
          _setMapCache('world-110m', world); // fire and forget
        }
        const countries = topojson.feature(world, world.objects.countries);
        mapG.selectAll('.country')
          .data(countries.features.filter(f => +f.id !== 10))
          .enter().append('path')
          .attr('class', 'country')
          .attr('d', geoPathFn);
      } catch (err) {
        console.error('DÃ¼nya haritasÄ± yÃ¼klenemedi:', err);
        const el = document.getElementById('loading-error');
        if (el) el.style.display = 'flex';
      }
    }

    function clearMarkers() {
      if (markersG) markersG.selectAll('*').remove();
      if (window.turkeyMarkersG) window.turkeyMarkersG.selectAll('*').remove();
      if (europeMarkersG) europeMarkersG.selectAll('*').remove();
      savedMarkers = [];
    }


    function addMarker(lat, lon, cls) {
      const useProj = getActiveProjection();
      const [px, py] = useProj([lon, lat]);
      const t = getActiveTransform();
      const k = t.k || 1;
      const markerParent = getActiveMarkersParent();
      const grp = markerParent.append('g').attr('class', cls);
      grp.append('circle').attr('class', 'm-outer').attr('cx', px).attr('cy', py).attr('r', 7 / k);
      grp.append('circle').attr('class', 'm-inner').attr('cx', px).attr('cy', py).attr('r', 3 / k).attr('fill', 'white').attr('opacity', .9);
      savedMarkers.push({ lat, lon, cls, node: grp });
      return { x: px, y: py };
    }


    function addLine(x1, y1, x2, y2) {
      const activeT = getActiveTransform();
      const k = activeT.k || 1;
      const sw = 1.5 / k;
      const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) return;
      const ux = dx / len, uy = dy / len;
      const as = 10 / k;
      const ax = x2 - ux * as * 1.5, ay = y2 - uy * as * 1.5;
      const lineParent = getActiveMarkersParent();
      const grp = lineParent.insert('g', ':first-child').attr('class', 'anim-arrow');
      grp.append('line')
        .attr('x1', x1).attr('y1', y1).attr('x2', ax).attr('y2', ay)
        .style('stroke-width', sw + 'px')
        .attr('stroke-dasharray', `${6 / k},${4 / k}`)
        .attr('stroke', 'rgba(255,255,255,.55)');
      const perp1x = x2 - ux * as + uy * as * 0.5, perp1y = y2 - uy * as - ux * as * 0.5;
      const perp2x = x2 - ux * as - uy * as * 0.5, perp2y = y2 - uy * as + ux * as * 0.5;
      grp.append('polygon')
        .attr('points', `${x2},${y2} ${perp1x},${perp1y} ${perp2x},${perp2y}`)
        .attr('fill', 'rgba(255,255,255,.7)')
        .attr('stroke', 'none');
      savedMarkers.push({ lat: 0, lon: 0, cls: 'line', node: grp });
    }

    // ===== TIMER =====
    const TIMER_TOTAL = 17, TIMER_GRACE = 5;

    function startTimer() {
      stopTimer();
      timerSeconds = 0;
      updateTimerUI();
      timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerUI();
        if (timerSeconds >= TIMER_TOTAL) {
          stopTimer();
          if (!state.answered) {
            state.answered = true;
            const city = state.questions[state.questionIndex];
            state.combo = 0; updateComboUI();
            addMarker(city.lat, city.lon, 'marker-real');
            if (typeof mpGameActive !== 'undefined' && mpGameActive) {
              if (typeof mpSubmitAnswer === 'function') mpSubmitAnswer(0);
              showToast(0, null, city, 1.0, true);
              // SÃ¼re bitti: mpNextQuestion ile showScores Firebase'e yaz
              // KÄ±sa gecikme: Ã¶nce mpSubmitAnswer'Ä±n Firestore'a yazmasÄ± iÃ§in bekle
              setTimeout(() => { if (mpGameActive) mpNextQuestion(); }, 2500);
            } else {
              state.levelScore += 0; state.totalScore += 0;
              showToast(0, null, city, 1.0, true);
              updateTopBar();
            }
          }
        }
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function updateTimerUI() {
      const remaining = Math.max(0, TIMER_TOTAL - timerSeconds);
      const pct = (remaining / TIMER_TOTAL) * 100;
      const fill = document.getElementById('timer-bar-fill');
      const label = document.getElementById('timer-label');
      fill.style.width = pct + '%';
      label.textContent = remaining;
      // renk: yeÅŸilâ†’sarÄ±â†’kÄ±rmÄ±zÄ±
      if (remaining > 8) fill.style.background = 'var(--green)';
      else if (remaining > 4) fill.style.background = 'var(--accent)';
      else fill.style.background = 'var(--red)';
    }

    // ===== COMBO =====
    const COMBO_MULT = [1.0, 1.05, 1.10, 1.20];
    function getComboMult() { return 1; } // Combo disabled
    function updateComboUI() {
      const badge = document.getElementById('combo-badge');
      if (badge) badge.style.display = 'none';
    }

    // ===== SÃœRE Ã‡ARPANI =====
    function getTimeMult() {
      if (timerSeconds <= TIMER_GRACE) return 1.0;
      const over = timerSeconds - TIMER_GRACE;
      return Math.max(0, 1.0 - over * 0.03);
    }

    // ===== CLICK =====


    function openMainMenu() {
  if (typeof mpGameActive !== 'undefined' && mpGameActive) {
    mpShowForfeitConfirm();
    return;
  }
  const modeEl = document.getElementById('main-menu-mode-label');
  if (modeEl) modeEl.textContent = '';
  const mmMp = document.getElementById('mm-btn-multiplayer');
  if (mmMp) mmMp.style.display = (typeof mpLobbyId !== 'undefined' && mpLobbyId) ? 'none' : '';
  const resumeEl = document.getElementById('mm-btn-resume');
  if (resumeEl) resumeEl.textContent = t('mpResume');
  document.getElementById('main-menu-modal').style.display = 'flex';
}

    // Ana menÃ¼ye dÃ¶n â€” MP'deyse forfeit uyarÄ±sÄ± gÃ¶ster
    function mmGoToWelcome() {
      if (typeof mpGameActive !== 'undefined' && mpGameActive) {
        // MP oyunundaysa forfeit uyarÄ±sÄ± â€” Ã§Ä±kÄ±nca ELO dÃ¼ÅŸer
        closeMainMenu();
        mpShowForfeitConfirm();
        // Forfeit onaylanÄ±nca mpForfeitAndExit zaten goToWelcome Ã§aÄŸÄ±rÄ±r
        return;
      }
      closeMainMenu();
      goToWelcome();
    }

    function closeMainMenu() {
      document.getElementById('main-menu-modal').style.display = 'none';
    }

    function mainMenuStart(mode) {
      closeMainMenu();
      gameMode = mode;
      startGame();
    }

    function openOptions(origin) {
      window._optionsOrigin = origin || null;
      document.getElementById('options-modal').style.display = 'flex';
      // Close other modals
      if (origin === 'welcome') document.getElementById('welcome-modal').style.display = 'none';
    }

    function closeOptions() {
      document.getElementById('options-modal').style.display = 'none';
      if (window._optionsOrigin === 'welcome') {
        document.getElementById('welcome-modal').style.display = 'flex';
      }
      window._optionsOrigin = null;
    }

    let _lastAnswerTime = 0;
    function handleClickAtLonLat(lon, lat) {
      if (state.answered) return;
      state.answered = true;
      _lastAnswerTime = Date.now();

      stopTimer();

      const city = state.questions[state.questionIndex];
      const km = Math.round(haversine(lat, lon, city.lat, city.lon));
      const baseScore = gameMode === "turkey" ? distanceToScoreTurkey(km) : gameMode === "europe" ? distanceToScoreEurope(km) : (mpGameActive ? distanceToScore(km) : distanceToScoreWorld(km));

      // Ã‡arpanlar: Ã¶nce kombo, sonra sÃ¼re cezasÄ±
      const comboMult = getComboMult();
      const timeMult = getTimeMult();
      const finalScore = Math.round(baseScore * comboMult * timeMult);

      // Kombo gÃ¼ncelle
      if (baseScore >= 600) { state.combo = Math.min(state.combo + 1, COMBO_MULT.length - 1); }
      else { state.combo = 0; }
      updateComboUI();

      const gPos = addMarker(lat, lon, 'marker-guess');
      const rPos = addMarker(city.lat, city.lon, 'marker-real');
      addLine(gPos.x, gPos.y, rPos.x, rPos.y);

      state.levelScore += finalScore; state.totalScore += finalScore;

      // Zoom animasyonu: iki nokta arasÄ±nÄ±n ortasÄ±na zoom
      const midLat = (lat + city.lat) / 2, midLon = (lon + city.lon) / 2;
      const mProj = getActiveProjection(); const [mx, my] = mProj([midLon, midLat]);
      const cont = document.getElementById('map-container');
      const W = cont.clientWidth, H = cont.clientHeight;
      // hedef zoom: mesafeye gÃ¶re (yakÄ±n = daha fazla zoom)
      const zTarget = Math.min(4, Math.max(1.5, 600 / Math.max(km, 50)));
      const tx = W / 2 - mx * zTarget;
      const ty = H / 2 - my * zTarget;
      if (gameMode === 'turkey' && window.turkeyZoom) {
        d3.select('#turkey-svg').transition().duration(700).call(
          window.turkeyZoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      } else if (gameMode === 'europe' && europeZoom) {
        europeSvgEl.transition().duration(700).call(
          europeZoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      } else {
        svgEl.transition().duration(700).call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      }

      showToast(finalScore, km, city, comboMult, false, timeMult);
      updateTopBar();

    }


    function handleMapClick(evt) {
      // Pointer/touch event'inden gÃ¼venli ÅŸekilde koordinat al
      if (evt.changedTouches && evt.changedTouches.length > 0) {
        evt.preventDefault();
        const touch = evt.changedTouches[0];
        evt.clientX = touch.clientX;
        evt.clientY = touch.clientY;
      }
      if (state.answered) return;
      if (gameMode === 'turkey') return;
      if (!evt || (!evt.clientX && !evt.changedTouches)) return;

      const activeSvg = getActiveSvgNode();
      const activeProj = getActiveProjection();
      const activeTransform = getActiveTransform();

      let px, py;
      try {
        [px, py] = d3.pointer(evt, activeSvg);
      } catch (e) {
        const rect = activeSvg.getBoundingClientRect();
        px = evt.clientX - rect.left;
        py = evt.clientY - rect.top;
      }
      const bx = (px - activeTransform.x) / activeTransform.k;
      const by = (py - activeTransform.y) / activeTransform.k;
      const result = activeProj.invert([bx, by]);

      if (!result || isNaN(result[0]) || isNaN(result[1])) return;
      const [lon, lat] = result;
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return;

      state.answered = true;
      stopTimer();

      const city = state.questions[state.questionIndex];
      const km = Math.round(haversine(lat, lon, city.lat, city.lon));
      const baseScore = gameMode === "turkey" ? distanceToScoreTurkey(km) : gameMode === "europe" ? distanceToScoreEurope(km) : (mpGameActive ? distanceToScore(km) : distanceToScoreWorld(km));

      const comboMult = getComboMult();
      const timeMult = getTimeMult();
      const finalScore = Math.round(baseScore * comboMult * timeMult);

      if (baseScore >= 600) { state.combo = Math.min(state.combo + 1, COMBO_MULT.length - 1); }
      else { state.combo = 0; }
      updateComboUI();

      const gPos = addMarker(lat, lon, 'marker-guess');
      const rPos = addMarker(city.lat, city.lon, 'marker-real');
      addLine(gPos.x, gPos.y, rPos.x, rPos.y);

      state.levelScore += finalScore; state.totalScore += finalScore;

      const midLat = (lat + city.lat) / 2, midLon = (lon + city.lon) / 2;
      const mProj = getActiveProjection(); const [mx, my] = mProj([midLon, midLat]);
      const cont = document.getElementById('map-container');
      const W = cont.clientWidth, H = cont.clientHeight;
      const zTarget = Math.min(4, Math.max(1.5, 600 / Math.max(km, 50)));
      const tx = W / 2 - mx * zTarget;
      const ty = H / 2 - my * zTarget;
      if (gameMode === 'turkey' && window.turkeyZoom) {
        d3.select('#turkey-svg').transition().duration(700).call(
          window.turkeyZoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      } else if (gameMode === 'europe' && europeZoom) {
        europeSvgEl.transition().duration(700).call(
          europeZoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      } else {
        svgEl.transition().duration(700).call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(tx, ty).scale(zTarget)
        );
      }

      showToast(finalScore, km, city, comboMult, false, timeMult);
      updateTopBar();
    }

    // ===== DISTANCE & SCORE =====
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371, dL = (lat2 - lat1) * Math.PI / 180, dN = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dL / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dN / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    function distanceToScore(km) {
      if (km <= 50) return 1000;
      if (km <= 150) return Math.max(0, 1000 - Math.round((km - 50) * 2));   // -2/km
      if (km <= 450) return Math.max(0, 800 - Math.round((km - 150) * 1));  // -1/km
      return Math.max(0, 450 - Math.round((km - 450) / 3));               // -1/3km
    }

    // Offline dÃ¼nya modu: %10 bonus, yukarÄ± yuvarla
    function distanceToScoreWorld(km) {
      const base = distanceToScore(km);
      if (base <= 0) return 0;
      if (base >= 1000) return 1000;
      return Math.min(1000, Math.ceil(base * 1.1));
    }

    function distanceToScoreEurope(km) {
      // Avrupa modu dÃ¼nya moduna gÃ¶re yaklaÅŸÄ±k %25 daha zor.
      // AynÄ± uzaklÄ±k iÃ§in puanÄ± dÃ¼ÅŸÃ¼rmek adÄ±na efektif mesafeyi %25 artÄ±rÄ±yoruz.
      // Maksimum puan yine 1000.
      return distanceToScore(km * 1.25);
    }

    // ===== UI =====
    function updateTopBar() {
      const cfg = getLevelConfig(state.level);
      const modeEmoji = (typeof gameMode !== 'undefined' && gameMode === 'turkey') ? 'ğŸ‡¹ğŸ‡· ' : (typeof gameMode !== 'undefined' && gameMode === 'europe') ? 'ğŸ‡ªğŸ‡º ' : '';
      document.getElementById('level-badge').textContent = modeEmoji + `${lang === 'tr' ? 'SEVÄ°YE' : 'LEVEL'} ${state.level}`;
      document.getElementById('score-display').textContent = state.levelScore;
      document.getElementById('target-display').textContent = cfg.target;
      const fill = Math.min(100, state.levelScore / cfg.target * 100);
      document.getElementById('progress-bar-fill').style.width = fill + '%';
      document.getElementById('progress-text').textContent = `${state.levelScore} / ${cfg.target}`;
      const dots = document.getElementById('q-dots');
      dots.innerHTML = '';
      for (let i = 0; i < cfg.questions; i++) {
        const d = document.createElement('div');
        d.className = 'q-dot' + (i < state.questionIndex ? ' done' : i === state.questionIndex ? ' active' : '');
        dots.appendChild(d);
      }
    }

    let hideToastTimer = null;
    let _toastShownAt = 0;
    function showToast(pts, km, city, comboMult = 1.0, timeout = false, timeMult = 1.0) {
      _toastShownAt = Date.now();
      const toast = document.getElementById('result-toast');
      // Bekleyen hide timer'Ä± iptal et
      if (hideToastTimer) { clearTimeout(hideToastTimer); hideToastTimer = null; }
      toast.style.display = 'flex';
      document.getElementById('toast-score').textContent = `+${pts}`;
      document.getElementById('toast-score').style.color = pts > 500 ? 'var(--green)' : pts > 200 ? 'var(--accent)' : 'var(--red)';
      const dLabel = (typeof gameMode !== 'undefined' && gameMode === 'turkey') ? `${city.name}, ${city.city}` : `${cityDisplayName(city)}, ${countryDisplayName(city)}`;
      let info = timeout
        ? `${t('timeout')} â€” ${dLabel}`
        : `${dLabel} â€” ${km.toLocaleString()} ${t('away')}`;
      let extras = [];
      if (comboMult > 1.0) extras.push(`ğŸ”¥ ${t('combo')} x${comboMult.toFixed(2)}`);
      if (timeMult < 1.0) extras.push(`â± x${timeMult.toFixed(2)}`);
      if (extras.length) info += `  |  ${extras.join('  ')}`;
      document.getElementById('toast-dist').textContent = info;
      // MP'de DEVAM butonu gÃ¶sterilmesin â€” geÃ§iÅŸ otomatik
      const _nextBtn = document.getElementById('btn-next-q');
      if (_nextBtn) {
        _nextBtn.style.display = (typeof mpGameActive !== 'undefined' && mpGameActive) ? 'none' : '';
      }
      toast.classList.add('show');
    }
    function hideToast() {
      const toast = document.getElementById('result-toast');
      toast.classList.remove('show');
      hideToastTimer = setTimeout(() => {
        hideToastTimer = null;
        if (!toast.classList.contains('show')) toast.style.display = 'none';
      }, 500);
    }

    function nextQuestion() {
      if (Date.now() - _toastShownAt < 1500) return;
      downX = null; downY = null;
      stopTimer();
      // Toast'u anÄ±nda kapat â€” timer bekleme
      if (hideToastTimer) { clearTimeout(hideToastTimer); hideToastTimer = null; }
      const toast = document.getElementById('result-toast');
      toast.classList.remove('show');
      toast.style.display = 'none';
      const cfg = getLevelConfig(state.level);
      state.questionIndex++;
      if (state.questionIndex >= cfg.questions) {
        if (state.levelScore >= cfg.target) {
          if (state.level >= TOTAL_LEVELS) {
            saveScore(state.totalScore, state.level);
            maybeShowInterstitialAfterGame(() => {
              showOverlay(
                t('winTitle'),
                t('winDesc', state.totalScore),
                t('playAgain'),
                () => { state.level = 1; state.totalScore = 0; startLevel(); },
                [
                  { label: t('mainMenu'), cls: 'secondary', action: () => showEndMainMenu() },
                  { label: t('viewLb'), cls: 'secondary', action: () => showLeaderboard('overlay') },
                  { label: t('logoutBtn'), cls: 'danger', action: authLogout }
                ]
              );
            }, false);
          } else {
            const nc = getLevelConfig(state.level + 1);
            showOverlay(
              t('levelOk', state.level),
              t('levelOkDesc', state.levelScore, getLevelConfig(state.level).target, state.level + 1, nc.questions, nc.target, state.totalScore),
              t('nextLevel'),
              () => { state.level++; startLevel(); },
              [
                { label: t('viewLb'), cls: 'secondary', action: () => showLeaderboard('overlay') },
              ]
            );
          }
        } else {
          saveScore(state.totalScore, state.level);
          const _extraBtns = [
            { label: t('mainMenu'), cls: 'secondary', action: () => showEndMainMenu() },
            { label: t('viewLb'), cls: 'secondary', action: () => showLeaderboard('overlay') },
            { label: t('logoutBtn'), cls: 'danger', action: authLogout }
          ];
          if (canShowAd('rewarded')) {
            _extraBtns.unshift({
              label: 'ğŸ¬ Reklam Ä°zle â€” Tekrar Oyna',
              cls: 'secondary',
              action: () => { recordAd('rewarded'); startLevel(); }
            });
          }
          maybeShowInterstitialAfterGame(() => {
            showOverlay(
              t('failTitle'),
              t('failDesc', state.levelScore, getLevelConfig(state.level).target, state.totalScore),
              t('retry'),
              () => { state.level = 1; state.totalScore = 0; resetAdGameFlag(); startLevel(); },
              _extraBtns
            );
          }, false);
        }
      } else { loadQuestion(); }
    }

    function showOverlay(title, desc, btn, action, extraButtons) {
      const ovEl = document.getElementById('overlay');
      document.getElementById('overlay-title').innerHTML = title;
      document.getElementById('overlay-desc').innerHTML = desc;
      const btnsEl = document.getElementById('overlay-buttons');
      btnsEl.innerHTML = '';
      // Ana buton
      const main = document.createElement('button');
      main.className = 'overlay-btn';
      main.addEventListener('touchend', function (e) { e.preventDefault(); if (action) action(); }, { passive: false });
      main.textContent = btn;
      main.onclick = () => { document.getElementById('overlay').classList.add('hidden'); document.getElementById('overlay').style.display = 'none'; action(); };
      btnsEl.appendChild(main);
      // Ekstra butonlar
      if (extraButtons) extraButtons.forEach(eb => {
        const b = document.createElement('button');
        b.className = 'overlay-btn ' + (eb.cls || 'secondary');
        b.textContent = eb.label;
        b.onclick = () => { document.getElementById('overlay').classList.add('hidden'); document.getElementById('overlay').style.display = 'none'; eb.action(); };
        btnsEl.appendChild(b);
      });
      const ov = document.getElementById('overlay');
      ov.classList.remove('hidden');
      ov.style.setProperty('display', 'flex', 'important');
    }

    const EUROPE_COUNTRY_SET = new Set(['TÃ¼rkiye', 'Rusya', 'Almanya', 'Fransa', 'Ä°ngiltere', 'Ä°talya', 'Ä°spanya', 'Portekiz', 'Hollanda', 'BelÃ§ika', 'Ä°sviÃ§re', 'Avusturya', 'Polonya', 'Ã‡ekya', 'Macaristan', 'Romanya', 'Bulgaristan', 'Yunanistan', 'Ä°sveÃ§', 'NorveÃ§', 'Finlandiya', 'Danimarka', 'Ä°rlanda', 'Ukrayna', 'Belarus', 'Litvanya', 'Letonya', 'Estonya', 'Moldova', 'SÄ±rbistan', 'HÄ±rvatistan', 'Bosna', 'KaradaÄŸ', 'Kuzey Makedonya', 'Arnavutluk', 'Slovakya', 'Slovenya', 'KÄ±brÄ±s', 'LÃ¼ksemburg', 'Malta', 'Ä°zlanda', 'Kosova', 'Monako', 'Andorra', 'San Marino', 'Liechtenstein', 'Vatikan']);
    const EXTRA_EUROPE_CITIES = [
      // TÃ¼rkiye ÅŸehirleri (CITIES'takiler dÄ±ÅŸÄ±nda ekstra)
      { "name": "EskiÅŸehir", "country": "TÃ¼rkiye", "lat": 39.78, "lon": 30.52 }, { "name": "Samsun", "country": "TÃ¼rkiye", "lat": 41.29, "lon": 36.33 }, { "name": "Kayseri", "country": "TÃ¼rkiye", "lat": 38.72, "lon": 35.49 }, { "name": "Mersin", "country": "TÃ¼rkiye", "lat": 36.8, "lon": 34.63 }, { "name": "DiyarbakÄ±r", "country": "TÃ¼rkiye", "lat": 37.91, "lon": 40.23 }, { "name": "Trabzon", "country": "TÃ¼rkiye", "lat": 41.00, "lon": 39.72 }, { "name": "Erzurum", "country": "TÃ¼rkiye", "lat": 39.91, "lon": 41.27 }, { "name": "Malatya", "country": "TÃ¼rkiye", "lat": 38.35, "lon": 38.32 }, { "name": "ÅanlÄ±urfa", "country": "TÃ¼rkiye", "lat": 37.16, "lon": 38.79 }, { "name": "Hatay", "country": "TÃ¼rkiye", "lat": 36.20, "lon": 36.16 },
      // BatÄ± Rusya ÅŸehirleri (lon < 57)
      { "name": "Moskova", "country": "Rusya", "lat": 55.75, "lon": 37.62 }, { "name": "St. Petersburg", "country": "Rusya", "lat": 59.93, "lon": 30.32 }, { "name": "Nizhny Novgorod", "country": "Rusya", "lat": 56.33, "lon": 44.00 }, { "name": "Kazan", "country": "Rusya", "lat": 55.79, "lon": 49.12 }, { "name": "Samara", "country": "Rusya", "lat": 53.20, "lon": 50.15 }, { "name": "Rostov-na-Donu", "country": "Rusya", "lat": 47.23, "lon": 39.72 }, { "name": "Voronej", "country": "Rusya", "lat": 51.67, "lon": 39.18 }, { "name": "Volgograd", "country": "Rusya", "lat": 48.71, "lon": 44.51 }, { "name": "Krasnodar", "country": "Rusya", "lat": 45.04, "lon": 38.98 }, { "name": "Kaliningrad", "country": "Rusya", "lat": 54.71, "lon": 20.51 }, { "name": "Saratov", "country": "Rusya", "lat": 51.54, "lon": 46.00 }, { "name": "Yaroslavl", "country": "Rusya", "lat": 57.63, "lon": 39.87 }, { "name": "Penza", "country": "Rusya", "lat": 53.20, "lon": 45.00 }, { "name": "Ryazan", "country": "Rusya", "lat": 54.63, "lon": 39.72 }, { "name": "Astrakhan", "country": "Rusya", "lat": 46.35, "lon": 48.04 }, { "name": "Kirov", "country": "Rusya", "lat": 58.60, "lon": 49.65 },
      // DiÄŸer Avrupa ÅŸehirleri
      { "name": "Leipzig", "country": "Almanya", "lat": 51.34, "lon": 12.37 }, { "name": "Dresden", "country": "Almanya", "lat": 51.05, "lon": 13.74 }, { "name": "Hannover", "country": "Almanya", "lat": 52.37, "lon": 9.73 }, { "name": "Bremen", "country": "Almanya", "lat": 53.08, "lon": 8.8 }, { "name": "NÃ¼rnberg", "country": "Almanya", "lat": 49.45, "lon": 11.08 }, { "name": "Lille", "country": "Fransa", "lat": 50.63, "lon": 3.06 }, { "name": "Nantes", "country": "Fransa", "lat": 47.22, "lon": -1.55 }, { "name": "Strazburg", "country": "Fransa", "lat": 48.58, "lon": 7.75 }, { "name": "Montpellier", "country": "Fransa", "lat": 43.61, "lon": 3.88 }, { "name": "Rennes", "country": "Fransa", "lat": 48.11, "lon": -1.68 }, { "name": "Bristol", "country": "Ä°ngiltere", "lat": 51.45, "lon": -2.59 }, { "name": "Sheffield", "country": "Ä°ngiltere", "lat": 53.38, "lon": -1.47 }, { "name": "Edinburgh", "country": "Ä°ngiltere", "lat": 55.95, "lon": -3.19 }, { "name": "Newcastle", "country": "Ä°ngiltere", "lat": 54.98, "lon": -1.61 }, { "name": "Cardiff", "country": "Ä°ngiltere", "lat": 51.48, "lon": -3.18 }, { "name": "Floransa", "country": "Ä°talya", "lat": 43.77, "lon": 11.26 }, { "name": "Bari", "country": "Ä°talya", "lat": 41.12, "lon": 16.87 }, { "name": "Verona", "country": "Ä°talya", "lat": 45.44, "lon": 10.99 }, { "name": "Venedik", "country": "Ä°talya", "lat": 45.44, "lon": 12.33 }, { "name": "Katanya", "country": "Ä°talya", "lat": 37.51, "lon": 15.08 }, { "name": "Sevilla", "country": "Ä°spanya", "lat": 37.39, "lon": -5.99 }, { "name": "Malaga", "country": "Ä°spanya", "lat": 36.72, "lon": -4.42 }, { "name": "Bilbao", "country": "Ä°spanya", "lat": 43.26, "lon": -2.93 }, { "name": "Zaragoza", "country": "Ä°spanya", "lat": 41.65, "lon": -0.89 }, { "name": "Murcia", "country": "Ä°spanya", "lat": 37.98, "lon": -1.13 }, { "name": "Braga", "country": "Portekiz", "lat": 41.55, "lon": -8.42 }, { "name": "Coimbra", "country": "Portekiz", "lat": 40.2, "lon": -8.41 }, { "name": "Faro", "country": "Portekiz", "lat": 37.02, "lon": -7.93 }, { "name": "Lahey", "country": "Hollanda", "lat": 52.08, "lon": 4.3 }, { "name": "Utrecht", "country": "Hollanda", "lat": 52.09, "lon": 5.12 }, { "name": "Eindhoven", "country": "Hollanda", "lat": 51.44, "lon": 5.48 }, { "name": "Groningen", "country": "Hollanda", "lat": 53.22, "lon": 6.57 }, { "name": "Anvers", "country": "BelÃ§ika", "lat": 51.22, "lon": 4.4 }, { "name": "Gent", "country": "BelÃ§ika", "lat": 51.05, "lon": 3.72 }, { "name": "Brugge", "country": "BelÃ§ika", "lat": 51.21, "lon": 3.22 }, { "name": "LiÃ¨ge", "country": "BelÃ§ika", "lat": 50.63, "lon": 5.58 }, { "name": "Basel", "country": "Ä°sviÃ§re", "lat": 47.56, "lon": 7.59 }, { "name": "Lozan", "country": "Ä°sviÃ§re", "lat": 46.52, "lon": 6.63 }, { "name": "Bern", "country": "Ä°sviÃ§re", "lat": 46.95, "lon": 7.45 }, { "name": "Graz", "country": "Avusturya", "lat": 47.07, "lon": 15.44 }, { "name": "Linz", "country": "Avusturya", "lat": 48.31, "lon": 14.29 }, { "name": "Innsbruck", "country": "Avusturya", "lat": 47.27, "lon": 11.4 }, { "name": "Gdansk", "country": "Polonya", "lat": 54.35, "lon": 18.65 }, { "name": "Wroclaw", "country": "Polonya", "lat": 51.11, "lon": 17.03 }, { "name": "Lodz", "country": "Polonya", "lat": 51.76, "lon": 19.46 }, { "name": "Poznan", "country": "Polonya", "lat": 52.41, "lon": 16.93 }, { "name": "Szczecin", "country": "Polonya", "lat": 53.43, "lon": 14.55 }, { "name": "Brno", "country": "Ã‡ekya", "lat": 49.2, "lon": 16.61 }, { "name": "Ostrava", "country": "Ã‡ekya", "lat": 49.82, "lon": 18.26 }, { "name": "Debrecen", "country": "Macaristan", "lat": 47.53, "lon": 21.63 }, { "name": "Szeged", "country": "Macaristan", "lat": 46.25, "lon": 20.15 }, { "name": "KaloÅŸvar", "country": "Romanya", "lat": 46.77, "lon": 23.59 }, { "name": "TimiÅŸoara", "country": "Romanya", "lat": 45.75, "lon": 21.23 }, { "name": "IaÅŸi", "country": "Romanya", "lat": 47.16, "lon": 27.59 }, { "name": "KÃ¶stence", "country": "Romanya", "lat": 44.18, "lon": 28.65 }, { "name": "Plovdiv", "country": "Bulgaristan", "lat": 42.14, "lon": 24.75 }, { "name": "Varna", "country": "Bulgaristan", "lat": 43.21, "lon": 27.91 }, { "name": "Patras", "country": "Yunanistan", "lat": 38.25, "lon": 21.73 }, { "name": "Heraklion", "country": "Yunanistan", "lat": 35.34, "lon": 25.13 }, { "name": "Larisa", "country": "Yunanistan", "lat": 39.64, "lon": 22.42 }, { "name": "GÃ¶teborg", "country": "Ä°sveÃ§", "lat": 57.71, "lon": 11.97 }, { "name": "MalmÃ¶", "country": "Ä°sveÃ§", "lat": 55.61, "lon": 13.0 }, { "name": "Uppsala", "country": "Ä°sveÃ§", "lat": 59.86, "lon": 17.64 }, { "name": "Bergen", "country": "NorveÃ§", "lat": 60.39, "lon": 5.32 }, { "name": "Trondheim", "country": "NorveÃ§", "lat": 63.43, "lon": 10.4 }, { "name": "Stavanger", "country": "NorveÃ§", "lat": 58.97, "lon": 5.73 }, { "name": "Tampere", "country": "Finlandiya", "lat": 61.5, "lon": 23.76 }, { "name": "Turku", "country": "Finlandiya", "lat": 60.45, "lon": 22.27 }, { "name": "Oulu", "country": "Finlandiya", "lat": 65.01, "lon": 25.47 }, { "name": "Aarhus", "country": "Danimarka", "lat": 56.16, "lon": 10.2 }, { "name": "Odense", "country": "Danimarka", "lat": 55.4, "lon": 10.39 }, { "name": "Cork", "country": "Ä°rlanda", "lat": 51.9, "lon": -8.47 }, { "name": "Galway", "country": "Ä°rlanda", "lat": 53.27, "lon": -9.05 }, { "name": "Lviv", "country": "Ukrayna", "lat": 49.84, "lon": 24.03 }, { "name": "Harkiv", "country": "Ukrayna", "lat": 49.99, "lon": 36.23 }, { "name": "Odesa", "country": "Ukrayna", "lat": 46.48, "lon": 30.72 }, { "name": "Dnipro", "country": "Ukrayna", "lat": 48.46, "lon": 35.05 }, { "name": "Grodno", "country": "Belarus", "lat": 53.67, "lon": 23.83 }, { "name": "Gomel", "country": "Belarus", "lat": 52.43, "lon": 30.99 }, { "name": "Kaunas", "country": "Litvanya", "lat": 54.9, "lon": 23.9 }, { "name": "Daugavpils", "country": "Letonya", "lat": 55.87, "lon": 26.53 }, { "name": "Tartu", "country": "Estonya", "lat": 58.38, "lon": 26.73 }, { "name": "Belgrad", "country": "SÄ±rbistan", "lat": 44.81, "lon": 20.46 }, { "name": "Novi Sad", "country": "SÄ±rbistan", "lat": 45.27, "lon": 19.83 }, { "name": "Zagreb", "country": "HÄ±rvatistan", "lat": 45.81, "lon": 15.98 }, { "name": "Split", "country": "HÄ±rvatistan", "lat": 43.51, "lon": 16.44 }, { "name": "Saraybosna", "country": "Bosna", "lat": 43.86, "lon": 18.41 }, { "name": "Podgorica", "country": "KaradaÄŸ", "lat": 42.43, "lon": 19.26 }, { "name": "ÃœskÃ¼p", "country": "Kuzey Makedonya", "lat": 41.99, "lon": 21.43 }, { "name": "Tiran", "country": "Arnavutluk", "lat": 41.33, "lon": 19.82 }, { "name": "PriÅŸtine", "country": "Kosova", "lat": 42.66, "lon": 21.16 }, { "name": "Bratislava", "country": "Slovakya", "lat": 48.15, "lon": 17.11 }, { "name": "Ljubljana", "country": "Slovenya", "lat": 46.05, "lon": 14.51 }, { "name": "KiÅŸinev", "country": "Moldova", "lat": 47.01, "lon": 28.86 }, { "name": "LefkoÅŸa", "country": "KÄ±brÄ±s", "lat": 35.18, "lon": 33.36 }, { "name": "Limasol", "country": "KÄ±brÄ±s", "lat": 34.68, "lon": 33.04 }, { "name": "Larnaka", "country": "KÄ±brÄ±s", "lat": 34.92, "lon": 33.63 }, { "name": "Reykjavik", "country": "Ä°zlanda", "lat": 64.15, "lon": -21.94 }, { "name": "Valletta", "country": "Malta", "lat": 35.9, "lon": 14.51 }, { "name": "LÃ¼ksemburg", "country": "LÃ¼ksemburg", "lat": 49.61, "lon": 6.13 }, { "name": "Andorra la Vella", "country": "Andorra", "lat": 42.51, "lon": 1.52 }, { "name": "Monako", "country": "Monako", "lat": 43.74, "lon": 7.42 }, { "name": "San Marino", "country": "San Marino", "lat": 43.94, "lon": 12.45 }, { "name": "Vaduz", "country": "Liechtenstein", "lat": 47.14, "lon": 9.52 }, { "name": "Vatikan", "country": "Vatikan", "lat": 41.9, "lon": 12.45 }
    ];
    const EUROPE_CITIES = [
      // CITIES'ten Avrupa ulkeleri â€” Rusya icin lon<57 filtresi (57Â°D doÄŸusu haritada yok)
      ...CITIES.filter(c => EUROPE_COUNTRY_SET.has(c.country) && (c.country !== 'Rusya' || c.lon < 57)),
      // Extra Avrupa sehirleri (EXTRA_EUROPE_CITIES zaten sadece Bati Rusya icerir)
      ...EXTRA_EUROPE_CITIES,
    ];
    const EUROPE_CAPITALS = new Set(['Ankara', 'Moskova', 'Berlin', 'Paris', 'Londra', 'Roma', 'Madrid', 'Lizbon', 'Amsterdam', 'BrÃ¼ksel', 'Bern', 'Viyana', 'VarÅŸova', 'Prag', 'BudapeÅŸte', 'BÃ¼kreÅŸ', 'Sofya', 'Atina', 'Stockholm', 'Oslo', 'Helsinki', 'Kopenhag', 'Dublin', 'Kiev', 'Minsk', 'Vilnius', 'Riga', 'Tallinn', 'KiÅŸinev', 'Belgrad', 'Zagreb', 'Saraybosna', 'Podgorica', 'ÃœskÃ¼p', 'Tiran', 'Bratislava', 'Ljubljana', 'LefkoÅŸa', 'LÃ¼ksemburg', 'Valletta', 'Reykjavik', 'PriÅŸtine', 'Monako', 'Andorra la Vella', 'San Marino', 'Vaduz', 'Vatikan']);
    const CAPITALS = new Set([
      "Ankara", "Moskova", "Berlin", "Paris", "Londra", "Roma", "Madrid", "Kiev", "VarÅŸova",
      "BÃ¼kreÅŸ", "Amsterdam", "BrÃ¼ksel", "Atina", "Lizbon", "Prag", "BudapeÅŸte", "Stokholm",
      "Minsk", "Viyana", "Belgrad", "Sofya", "Kopenhag", "Helsinki", "Oslo", "Bratislava",
      "Zagreb", "KiÅŸinev", "Saraybosna", "Tiran", "Riga", "Vilnius", "Tallinn", "Dublin",
      "Tiflis", "Erivan", "BakÃ¼", "ÃœskÃ¼p", "Podgorica", "Ljubljana", "Bern", "Pekin",
      "Delhi", "Tokyo", "Jakarta", "Ä°slamabad", "Dhaka", "Manila", "Tahran", "BaÄŸdat",
      "Riyad", "TaÅŸkent", "Kabil", "Kuala Lumpur", "Bangkok", "Hanoi", "Singapur", "Seul",
      "Pyongyang", "Amman", "Tel Aviv", "Beyrut", "Åam", "Doha", "Kuveyt", "Maskat",
      "Manama", "AÅŸkabat", "BiÅŸkek", "DuÅŸanbe", "Ulan Batur", "Phnom Penh", "Vientiane",
      "Kahire", "Lagos", "Abuja", "Addis Ababa", "Kinshasa", "Dar es Salaam", "Nairobi",
      "Johannesburg", "Hartum", "Cezayir", "Kampala", "Casablanca", "Rabat", "Accra",
      "Maputo", "Luanda", "Antananarivo", "Yaounde", "Abidjan", "Niamey", "Ouagadougou",
      "Bamako", "Lilongwe", "Dakar", "Lusaka", "Harare", "N'Djamena", "Kigali", "Tunus",
      "MogadiÅŸu", "Asmara", "Cibuti", "Gaborone", "Windhoek", "Freetown", "Monrovia",
      "Konakri", "Libreville", "Brazzaville", "Bangui", "Cotonou", "Lome", "Trablus", "Sana",
      "New York", "Washington DC", "Toronto", "Ottawa", "Mexico City", "Sao Paulo", "Brasilia",
      "Buenos Aires", "Bogota", "Santiago", "Lima", "Caracas", "Quito", "La Paz", "Asuncion",
      "Montevideo", "Havana", "Santo Domingo", "Port-au-Prince", "Guatemala City",
      "Tegucigalpa", "San Salvador", "Managua", "San Jose", "Panama City", "Kingston",
      "Port of Spain", "Sidney", "Wellington", "Port Moresby", "Suva", "Lefkosa"
    ]);

    function weightedPickFromPool(pool, capitalsSet) {
      const total = pool.reduce((a, c) => a + (capitalsSet.has(c.name) ? 1.5 : 1), 0);
      let r = Math.random() * total;
      for (let _i = 0; _i < pool.length; _i++) {
        const c = pool[_i];
        r -= capitalsSet.has(c.name) ? 1.5 : 1;
        if (r <= 0) return c;
      }
      return pool[pool.length - 1];
    }

    function weightedPick() {
      return weightedPickFromPool(CITIES, CAPITALS);
    }

    function pickQuestions(n) {
      const picked = [];
      for (let i = 0; i < n; i++) picked.push(weightedPick());
      return picked;
    }

    function pickEuropeQuestions(n) {
      const picked = [];
      for (let i = 0; i < n; i++) picked.push(weightedPickFromPool(EUROPE_CITIES, EUROPE_CAPITALS));
      return picked;
    }

    function pickTurkeyQuestions(n) {
      var pool = TURKEY_DISTRICTS.slice();
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
      var picked = [];
      for (var k = 0; k < n; k++) picked.push(pool[k % pool.length]);
      return picked;
    }

    function startLevel() {
      // Overlay'i kapat
      const ov = document.getElementById('overlay');
      if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
      state.levelScore = 0; state.questionIndex = 0; state.answered = false; state.combo = 0;
      const n = getLevelConfig(state.level).questions;
      state.questions = gameMode === 'turkey' ? pickTurkeyQuestions(n) : gameMode === 'europe' ? pickEuropeQuestions(n) : pickQuestions(n);
      clearMarkers(); updateTopBar(); updateComboUI(); loadQuestion();
    }

    function loadQuestion() {
      state.answered = false; clearMarkers();
      downX = null; downY = null;
      const city = state.questions[state.questionIndex];
      if (gameMode === 'turkey') {
        document.getElementById('city-name').textContent = city.name.toUpperCase();
        document.getElementById('city-country').textContent = city.city.toUpperCase();
        document.getElementById('question-text').textContent = t('markDistrict');
      } else {
        document.getElementById('city-name').textContent = cityDisplayName(city).toUpperCase();
        document.getElementById('city-country').textContent = countryDisplayName(city).toUpperCase();
        document.getElementById('question-text').textContent = t('markCity');
      }
      updateTopBar();
      // Harita gÃ¶ster/gizle
      if (gameMode === 'turkey') {
        document.getElementById('world-svg').style.display = 'none';
        document.getElementById('turkey-svg').style.display = 'block';
        document.getElementById('europe-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'none';
        if (!turkeyMapLoaded) loadTurkeyMap();
      } else if (gameMode === 'europe') {
        document.getElementById('world-svg').style.display = 'none';
        document.getElementById('turkey-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'block';
        focusEuropeMap(true);
      } else {
        document.getElementById('world-svg').style.display = 'block';
        document.getElementById('turkey-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'none';
        resetWorldMap(true);
      }
      // Timer baÅŸlat
      startTimer();
    }

    // ===== OYUN MODU =====
    let gameMode = 'world'; // 'world' | 'turkey'

    // ===== TÃœRKÄ°YE Ä°LÃ‡ELERÄ° =====
    // format: {name, city, lat, lon}
    // Kural: Her ilin merkez ilÃ§esi + ek ilÃ§eler
    // BÃ¼yÃ¼k ÅŸehirler: merkez + 2 ek; diÄŸerleri: merkez + 1 ek
    const TURKEY_DISTRICTS = [
      // ADANA (bÃ¼yÃ¼k)
      { name: "Seyhan", city: "Adana", lat: 37.002, lon: 35.321 }, { name: "Ã‡ukurova", city: "Adana", lat: 37.060, lon: 35.396 }, { name: "Kozan", city: "Adana", lat: 37.452, lon: 35.814 },
      // ADIYAMAN
      { name: "Merkez", city: "AdÄ±yaman", lat: 37.764, lon: 38.276 }, { name: "Kahta", city: "AdÄ±yaman", lat: 37.784, lon: 38.619 },
      // AFYONKARAHÄ°SAR
      { name: "Merkez", city: "Afyonkarahisar", lat: 38.757, lon: 30.540 }, { name: "SandÄ±klÄ±", city: "Afyonkarahisar", lat: 38.460, lon: 30.262 },
      // AÄRI
      { name: "Merkez", city: "AÄŸrÄ±", lat: 39.719, lon: 43.051 }, { name: "DoÄŸubayazÄ±t", city: "AÄŸrÄ±", lat: 39.547, lon: 44.088 },
      // AMASYA
      { name: "Merkez", city: "Amasya", lat: 40.649, lon: 35.833 }, { name: "Merzifon", city: "Amasya", lat: 40.875, lon: 35.464 },
      // ANKARA (bÃ¼yÃ¼k)
      { name: "Ã‡ankaya", city: "Ankara", lat: 39.906, lon: 32.863 }, { name: "KeÃ§iÃ¶ren", city: "Ankara", lat: 39.978, lon: 32.876 }, { name: "PolatlÄ±", city: "Ankara", lat: 39.584, lon: 32.146 },
      // ANTALYA (bÃ¼yÃ¼k)
      { name: "MuratpaÅŸa", city: "Antalya", lat: 36.886, lon: 30.701 }, { name: "Alanya", city: "Antalya", lat: 36.544, lon: 32.000 }, { name: "Manavgat", city: "Antalya", lat: 36.786, lon: 31.441 },
      // ARTVÄ°N
      { name: "Merkez", city: "Artvin", lat: 41.182, lon: 41.820 }, { name: "Hopa", city: "Artvin", lat: 41.412, lon: 41.426 },
      // AYDIN
      { name: "Efeler", city: "AydÄ±n", lat: 37.844, lon: 27.845 }, { name: "KuÅŸadasÄ±", city: "AydÄ±n", lat: 37.858, lon: 27.259 },
      // BALIKESÄ°R
      { name: "AltÄ±eylÃ¼l", city: "BalÄ±kesir", lat: 39.649, lon: 27.888 }, { name: "BandÄ±rma", city: "BalÄ±kesir", lat: 40.352, lon: 27.977 },
      // BÄ°LECÄ°K
      { name: "Merkez", city: "Bilecik", lat: 40.150, lon: 29.979 }, { name: "BozÃ¼yÃ¼k", city: "Bilecik", lat: 39.907, lon: 30.039 },
      // BÄ°NGÃ–L
      { name: "Merkez", city: "BingÃ¶l", lat: 38.885, lon: 40.499 }, { name: "Solhan", city: "BingÃ¶l", lat: 38.962, lon: 41.056 },
      // BÄ°TLÄ°S
      { name: "Merkez", city: "Bitlis", lat: 38.401, lon: 42.107 }, { name: "Tatvan", city: "Bitlis", lat: 38.508, lon: 42.279 },
      // BOLU (bÃ¼yÃ¼k)
      { name: "Merkez", city: "Bolu", lat: 40.576, lon: 31.579 }, { name: "Gerede", city: "Bolu", lat: 40.797, lon: 32.196 }, { name: "Mudurnu", city: "Bolu", lat: 40.460, lon: 31.211 },
      // BURDUR
      { name: "Merkez", city: "Burdur", lat: 37.720, lon: 30.291 }, { name: "Bucak", city: "Burdur", lat: 37.458, lon: 30.591 },
      // BURSA (bÃ¼yÃ¼k)
      { name: "Osmangazi", city: "Bursa", lat: 40.183, lon: 29.051 }, { name: "NilÃ¼fer", city: "Bursa", lat: 40.213, lon: 28.966 }, { name: "Ä°negÃ¶l", city: "Bursa", lat: 40.076, lon: 29.513 },
      // Ã‡ANAKKALE (bÃ¼yÃ¼k)
      { name: "Merkez", city: "Ã‡anakkale", lat: 40.155, lon: 26.413 }, { name: "Gelibolu", city: "Ã‡anakkale", lat: 40.418, lon: 26.671 }, { name: "Biga", city: "Ã‡anakkale", lat: 40.228, lon: 27.247 },
      // Ã‡ANKIRI
      { name: "Merkez", city: "Ã‡ankÄ±rÄ±", lat: 40.601, lon: 33.615 }, { name: "Ilgaz", city: "Ã‡ankÄ±rÄ±", lat: 40.920, lon: 33.619 },
      // Ã‡ORUM
      { name: "Merkez", city: "Ã‡orum", lat: 40.549, lon: 34.955 }, { name: "Sungurlu", city: "Ã‡orum", lat: 40.167, lon: 34.373 },
      // DENÄ°ZLÄ°
      { name: "Pamukkale", city: "Denizli", lat: 37.785, lon: 29.097 }, { name: "Merkezefendi", city: "Denizli", lat: 37.774, lon: 29.070 },
      // DÄ°YARBAKIR (bÃ¼yÃ¼k)
      { name: "BaÄŸlar", city: "DiyarbakÄ±r", lat: 37.924, lon: 40.195 }, { name: "Sur", city: "DiyarbakÄ±r", lat: 37.909, lon: 40.231 }, { name: "Ergani", city: "DiyarbakÄ±r", lat: 38.267, lon: 39.761 },
      // DÃœZCE
      { name: "Merkez", city: "DÃ¼zce", lat: 40.844, lon: 31.156 }, { name: "AkÃ§akoca", city: "DÃ¼zce", lat: 41.089, lon: 31.115 },
      // EDÄ°RNE (bÃ¼yÃ¼k)
      { name: "Merkez", city: "Edirne", lat: 41.677, lon: 26.556 }, { name: "KeÅŸan", city: "Edirne", lat: 40.861, lon: 26.636 }, { name: "UzunkÃ¶prÃ¼", city: "Edirne", lat: 41.268, lon: 26.689 },
      // ELAZIÄ
      { name: "Merkez", city: "ElazÄ±ÄŸ", lat: 38.674, lon: 39.223 }, { name: "KovancÄ±lar", city: "ElazÄ±ÄŸ", lat: 38.718, lon: 39.848 },
      // ERZÄ°NCAN
      { name: "Merkez", city: "Erzincan", lat: 39.730, lon: 39.494 }, { name: "Refahiye", city: "Erzincan", lat: 39.906, lon: 38.767 },
      // ERZURUM (bÃ¼yÃ¼k)
      { name: "Yakutiye", city: "Erzurum", lat: 39.908, lon: 41.270 }, { name: "PalandÃ¶ken", city: "Erzurum", lat: 39.878, lon: 41.259 }, { name: "Oltu", city: "Erzurum", lat: 40.552, lon: 41.992 },
      // ESKÄ°ÅEHÄ°R
      { name: "TepebaÅŸÄ±", city: "EskiÅŸehir", lat: 39.771, lon: 30.521 }, { name: "Sivrihisar", city: "EskiÅŸehir", lat: 39.451, lon: 31.540 },
      // GAZÄ°ANTEP (bÃ¼yÃ¼k)
      { name: "Åahinbey", city: "Gaziantep", lat: 37.062, lon: 37.367 }, { name: "Åehitkamil", city: "Gaziantep", lat: 37.095, lon: 37.328 }, { name: "Nizip", city: "Gaziantep", lat: 37.009, lon: 37.797 },
      // GÄ°RESUN
      { name: "Merkez", city: "Giresun", lat: 40.912, lon: 38.387 }, { name: "Bulancak", city: "Giresun", lat: 40.939, lon: 38.233 },
      // GÃœMÃœÅHANE
      { name: "Merkez", city: "GÃ¼mÃ¼ÅŸhane", lat: 40.460, lon: 39.481 }, { name: "Kelkit", city: "GÃ¼mÃ¼ÅŸhane", lat: 40.130, lon: 39.444 },
      // HAKKARÄ°
      { name: "Merkez", city: "Hakkari", lat: 37.574, lon: 43.740 }, { name: "YÃ¼ksekova", city: "Hakkari", lat: 37.572, lon: 44.285 },
      // HATAY (bÃ¼yÃ¼k)
      { name: "Antakya", city: "Hatay", lat: 36.202, lon: 36.160 }, { name: "Ä°skenderun", city: "Hatay", lat: 36.585, lon: 36.165 }, { name: "DÃ¶rtyol", city: "Hatay", lat: 36.848, lon: 36.223 },
      // IÄDIR
      { name: "Merkez", city: "IÄŸdÄ±r", lat: 39.921, lon: 44.046 }, { name: "Tuzluca", city: "IÄŸdÄ±r", lat: 40.048, lon: 43.660 },
      // ISPARTA
      { name: "Merkez", city: "Isparta", lat: 37.764, lon: 30.555 }, { name: "EÄŸirdir", city: "Isparta", lat: 37.875, lon: 30.855 },
      // MERSÄ°N (bÃ¼yÃ¼k) â€” eski adÄ± Ä°Ã§el
      { name: "Akdeniz", city: "Mersin", lat: 36.814, lon: 34.617 }, { name: "Tarsus", city: "Mersin", lat: 36.917, lon: 34.894 }, { name: "Erdemli", city: "Mersin", lat: 36.610, lon: 34.312 },
      // Ä°STANBUL (bÃ¼yÃ¼k)
      { name: "KadÄ±kÃ¶y", city: "Ä°stanbul", lat: 40.991, lon: 29.023 }, { name: "Fatih", city: "Ä°stanbul", lat: 41.019, lon: 28.950 }, { name: "ÃœskÃ¼dar", city: "Ä°stanbul", lat: 41.023, lon: 29.015 },
      // Ä°ZMÄ°R (bÃ¼yÃ¼k)
      { name: "Konak", city: "Ä°zmir", lat: 38.418, lon: 27.129 }, { name: "Bornova", city: "Ä°zmir", lat: 38.468, lon: 27.216 }, { name: "KarÅŸÄ±yaka", city: "Ä°zmir", lat: 38.460, lon: 27.109 },
      // KAHRAMANMARAÅ
      { name: "DulkadiroÄŸlu", city: "KahramanmaraÅŸ", lat: 37.576, lon: 36.937 }, { name: "Elbistan", city: "KahramanmaraÅŸ", lat: 38.203, lon: 37.197 },
      // KARABÃœK
      { name: "Merkez", city: "KarabÃ¼k", lat: 41.200, lon: 32.627 }, { name: "Safranbolu", city: "KarabÃ¼k", lat: 41.252, lon: 32.691 },
      // KARAMAN
      { name: "Merkez", city: "Karaman", lat: 37.182, lon: 33.215 }, { name: "Ermenek", city: "Karaman", lat: 36.638, lon: 32.888 },
      // KARS
      { name: "Merkez", city: "Kars", lat: 40.601, lon: 43.097 }, { name: "SarÄ±kamÄ±ÅŸ", city: "Kars", lat: 40.334, lon: 42.589 },
      // KASTAMONU
      { name: "Merkez", city: "Kastamonu", lat: 41.376, lon: 33.777 }, { name: "Tosya", city: "Kastamonu", lat: 41.018, lon: 34.030 },
      // KAYSERÄ° (bÃ¼yÃ¼k)
      { name: "Kocasinan", city: "Kayseri", lat: 38.725, lon: 35.487 }, { name: "Melikgazi", city: "Kayseri", lat: 38.730, lon: 35.477 }, { name: "Develi", city: "Kayseri", lat: 38.390, lon: 35.490 },
      // KÄ°LÄ°S
      { name: "Merkez", city: "Kilis", lat: 36.718, lon: 37.118 }, { name: "Musabeyli", city: "Kilis", lat: 36.838, lon: 37.194 },
      // KIRKLARELÄ° (bÃ¼yÃ¼k)
      { name: "Merkez", city: "KÄ±rklareli", lat: 41.735, lon: 27.225 }, { name: "LÃ¼leburgaz", city: "KÄ±rklareli", lat: 41.403, lon: 27.355 }, { name: "Babaeski", city: "KÄ±rklareli", lat: 41.433, lon: 27.096 },
      // KIRÅEHÄ°R
      { name: "Merkez", city: "KÄ±rÅŸehir", lat: 39.145, lon: 34.160 }, { name: "Kaman", city: "KÄ±rÅŸehir", lat: 39.354, lon: 33.722 },
      // KOCAELÄ° (bÃ¼yÃ¼k)
      { name: "Ä°zmit", city: "Kocaeli", lat: 40.766, lon: 29.917 }, { name: "Gebze", city: "Kocaeli", lat: 40.803, lon: 29.432 }, { name: "DarÄ±ca", city: "Kocaeli", lat: 40.765, lon: 29.377 },
      // KONYA (bÃ¼yÃ¼k)
      { name: "SelÃ§uklu", city: "Konya", lat: 37.900, lon: 32.490 }, { name: "Meram", city: "Konya", lat: 37.850, lon: 32.440 }, { name: "EreÄŸli", city: "Konya", lat: 37.514, lon: 34.049 },
      // KÃœTAHYA (bÃ¼yÃ¼k)
      { name: "Merkez", city: "KÃ¼tahya", lat: 39.419, lon: 29.983 }, { name: "TavÅŸanlÄ±", city: "KÃ¼tahya", lat: 39.547, lon: 29.484 }, { name: "Gediz", city: "KÃ¼tahya", lat: 39.044, lon: 29.414 },
      // MALATYA
      { name: "YeÅŸilyurt", city: "Malatya", lat: 38.364, lon: 38.312 }, { name: "Battalgazi", city: "Malatya", lat: 38.402, lon: 38.383 },
      // MANÄ°SA
      { name: "Åehzadeler", city: "Manisa", lat: 38.614, lon: 27.428 }, { name: "Akhisar", city: "Manisa", lat: 38.917, lon: 27.836 },
      // MARDÄ°N (bÃ¼yÃ¼k)
      { name: "Artuklu", city: "Mardin", lat: 37.312, lon: 40.733 }, { name: "KÄ±zÄ±ltepe", city: "Mardin", lat: 37.191, lon: 40.587 }, { name: "Nusaybin", city: "Mardin", lat: 37.079, lon: 41.217 },
      // MUÄLA (bÃ¼yÃ¼k)
      { name: "MenteÅŸe", city: "MuÄŸla", lat: 37.215, lon: 28.364 }, { name: "Bodrum", city: "MuÄŸla", lat: 37.038, lon: 27.430 }, { name: "Fethiye", city: "MuÄŸla", lat: 36.622, lon: 29.116 },
      // MUÅ
      { name: "Merkez", city: "MuÅŸ", lat: 38.745, lon: 41.494 }, { name: "BulanÄ±k", city: "MuÅŸ", lat: 38.943, lon: 42.271 },
      // NEVÅEHÄ°R
      { name: "Merkez", city: "NevÅŸehir", lat: 38.625, lon: 34.724 }, { name: "ÃœrgÃ¼p", city: "NevÅŸehir", lat: 38.628, lon: 34.912 },
      // NÄ°ÄDE
      { name: "Merkez", city: "NiÄŸde", lat: 37.966, lon: 34.679 }, { name: "Bor", city: "NiÄŸde", lat: 37.891, lon: 34.558 },
      // ORDU
      { name: "AltÄ±nordu", city: "Ordu", lat: 40.984, lon: 37.879 }, { name: "Ãœnye", city: "Ordu", lat: 41.133, lon: 37.293 },
      // OSMANÄ°YE
      { name: "Merkez", city: "Osmaniye", lat: 37.074, lon: 36.247 }, { name: "Kadirli", city: "Osmaniye", lat: 37.376, lon: 36.098 },
      // RÄ°ZE
      { name: "Merkez", city: "Rize", lat: 41.021, lon: 40.523 }, { name: "Pazar", city: "Rize", lat: 41.183, lon: 40.880 },
      // SAKARYA (bÃ¼yÃ¼k)
      { name: "AdapazarÄ±", city: "Sakarya", lat: 40.786, lon: 30.404 }, { name: "Serdivan", city: "Sakarya", lat: 40.791, lon: 30.428 }, { name: "Hendek", city: "Sakarya", lat: 40.799, lon: 30.748 },
      // SAMSUN (bÃ¼yÃ¼k)
      { name: "Atakum", city: "Samsun", lat: 41.328, lon: 36.265 }, { name: "Ä°lkadÄ±m", city: "Samsun", lat: 41.286, lon: 36.330 }, { name: "Bafra", city: "Samsun", lat: 41.567, lon: 35.907 },
      // SÄ°Ä°RT
      { name: "Merkez", city: "Siirt", lat: 37.932, lon: 41.946 }, { name: "Kurtalan", city: "Siirt", lat: 37.929, lon: 41.705 },
      // SÄ°NOP
      { name: "Merkez", city: "Sinop", lat: 42.023, lon: 35.153 }, { name: "Boyabat", city: "Sinop", lat: 41.466, lon: 34.770 },
      // SÄ°VAS (bÃ¼yÃ¼k)
      { name: "Merkez", city: "Sivas", lat: 39.748, lon: 37.017 }, { name: "ÅarkÄ±ÅŸla", city: "Sivas", lat: 39.341, lon: 36.406 }, { name: "Zara", city: "Sivas", lat: 39.898, lon: 37.750 },
      // ÅANLIURFA (bÃ¼yÃ¼k)
      { name: "Haliliye", city: "ÅanlÄ±urfa", lat: 37.160, lon: 38.795 }, { name: "KarakÃ¶prÃ¼", city: "ÅanlÄ±urfa", lat: 37.197, lon: 38.812 }, { name: "ViranÅŸehir", city: "ÅanlÄ±urfa", lat: 37.237, lon: 39.762 },
      // ÅIRNAK
      { name: "Merkez", city: "ÅÄ±rnak", lat: 37.518, lon: 42.458 }, { name: "Cizre", city: "ÅÄ±rnak", lat: 37.327, lon: 42.187 },
      // TEKÄ°RDAÄ (bÃ¼yÃ¼k)
      { name: "SÃ¼leymanpaÅŸa", city: "TekirdaÄŸ", lat: 40.977, lon: 27.511 }, { name: "Ã‡orlu", city: "TekirdaÄŸ", lat: 41.159, lon: 27.803 }, { name: "Malkara", city: "TekirdaÄŸ", lat: 41.292, lon: 26.901 },
      // TOKAT
      { name: "Merkez", city: "Tokat", lat: 40.313, lon: 36.554 }, { name: "Turhal", city: "Tokat", lat: 40.387, lon: 36.085 },
      // TRABZON (bÃ¼yÃ¼k)
      { name: "Ortahisar", city: "Trabzon", lat: 41.003, lon: 39.724 }, { name: "AkÃ§aabat", city: "Trabzon", lat: 40.998, lon: 39.567 }, { name: "Of", city: "Trabzon", lat: 40.948, lon: 40.261 },
      // TUNCELÄ°
      { name: "Merkez", city: "Tunceli", lat: 39.109, lon: 39.548 }, { name: "Pertek", city: "Tunceli", lat: 38.855, lon: 39.325 },
      // UÅAK
      { name: "Merkez", city: "UÅŸak", lat: 38.682, lon: 29.407 }, { name: "Banaz", city: "UÅŸak", lat: 38.727, lon: 29.754 },
      // VAN (bÃ¼yÃ¼k)
      { name: "Ä°pekyolu", city: "Van", lat: 38.495, lon: 43.380 }, { name: "TuÅŸba", city: "Van", lat: 38.500, lon: 43.398 }, { name: "ErciÅŸ", city: "Van", lat: 38.645, lon: 43.358 },
      // YALOVA
      { name: "Merkez", city: "Yalova", lat: 40.655, lon: 29.277 }, { name: "Ã‡Ä±narcÄ±k", city: "Yalova", lat: 40.643, lon: 29.126 },
      // YOZGAT
      { name: "Merkez", city: "Yozgat", lat: 39.820, lon: 34.808 }, { name: "Sorgun", city: "Yozgat", lat: 39.809, lon: 35.187 },
      // ZONGULDAK
      { name: "Merkez", city: "Zonguldak", lat: 41.454, lon: 31.796 }, { name: "EreÄŸli", city: "Zonguldak", lat: 41.278, lon: 31.435 },
    ];

    // TÃ¼rkiye puan sistemi: 0-40km tam puan, 40-140km -3/km, 140+ -2/km
    function distanceToScoreTurkey(km) {
      if (km <= 10) return 1000;
      if (km <= 50) return Math.max(0, 1000 - Math.round((km - 10) * 13)); // 10-50: -13/km â†’ 480 at 50km
      if (km <= 150) return Math.max(0, 480 - Math.round((km - 50) * 4));  // 50-150: -4/km â†’ 80 at 150km
      return Math.max(0, 80 - Math.round((km - 150) * 1));                 // 150+: -1/km â†’ 0 at 230km
    }

    let turkeyMapLoaded = false;
    let turkeyMapG = null;

    function loadTurkeyMap() {
      return new Promise(async (resolve) => {
        if (turkeyMapLoaded) { resolve(); return; }
        const cont = document.getElementById('map-container');
        const W = cont.clientWidth, H = cont.clientHeight;

        // Ã–nce IndexedDB cache'e bak
        let geo = await _getMapCache('turkey-provinces');
        if (geo) {
          drawTurkeyMap(geo, W, H);
          resolve();
          return;
        }

        // Cache yok â€” fetch et
        const URLS = [
          'https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json',
          'https://cdn.jsdelivr.net/gh/cihadturhan/tr-geojson@master/geo/tr-cities-utf8.json',
          'https://raw.githubusercontent.com/alpers/Turkey-Maps-D3/master/tr-cities.json',
        ];

        for (let ui = 0; ui < URLS.length; ui++) {
          try {
            const r = await fetch(URLS[ui]);
            if (!r.ok) continue;
            geo = await r.json();
            _setMapCache('turkey-provinces', geo); // cache'e kaydet
            drawTurkeyMap(geo, W, H);
            resolve();
            return;
          } catch (e) { continue; }
        }
        // TÃ¼mÃ¼ baÅŸarÄ±sÄ±z â€” fallback
        drawTurkeyFallback(W, H);
        resolve();
      });
    }

    function drawTurkeyMap(geo, W, H) {
      const turkeySvgEl = d3.select('#turkey-svg');
      turkeySvgEl.selectAll('*').remove();
      turkeySvgEl.on('.game', null); // Ã¶nceki handler'larÄ± temizle

      const pad = 30;
      window.turkeyProj = d3.geoMercator().fitExtent([[pad, pad], [W - pad, H - pad]], geo);
      window.turkeyPathFn = d3.geoPath().projection(window.turkeyProj);
      window.turkeyTransform = d3.zoomIdentity;

      const g = turkeySvgEl.append('g').attr('id', 'turkey-g');
      g.selectAll('path')
        .data(geo.features)
        .enter().append('path')
        .attr('class', 'turkey-province')
        .attr('d', window.turkeyPathFn);

      window.turkeyMarkersG = turkeySvgEl.append('g').attr('id', 'turkey-markers-g');

      // Zoom
      window.turkeyZoom = d3.zoom()
        .scaleExtent([1, 20])
        .filter(evt => {
          // Sadece sÃ¼rÃ¼kleme/scroll iÃ§in zoom - single click'i engelleme
          if (evt.type === 'click') return false;
          return !evt.ctrlKey && !evt.button;
        })
        .on('zoom', evt => {
          if (!evt.transform || isNaN(evt.transform.k)) return;
          window.turkeyTransform = evt.transform;
          g.attr('transform', evt.transform);
          if (window.turkeyMarkersG) {
            window.turkeyMarkersG.attr('transform', evt.transform);
            const k = evt.transform.k;
            window.turkeyMarkersG.selectAll('.m-outer').attr('r', 7 / k);
            window.turkeyMarkersG.selectAll('.m-inner').attr('r', 3 / k);
            window.turkeyMarkersG.selectAll('.distance-line').style('stroke-width', 1.5 / k + 'px');
          }
        });
      turkeySvgEl.call(window.turkeyZoom);

      // Click: doÄŸrudan SVG Ã¼zerinde native addEventListener
      const svgEl2 = document.getElementById('turkey-svg');
      svgEl2._turkeyClickHandler && svgEl2.removeEventListener('click', svgEl2._turkeyClickHandler);
      svgEl2._turkeyClickHandler = function (evt) {
        if (state.answered) return;
        if (!window.turkeyProj) return;
        const rect = svgEl2.getBoundingClientRect();
        // iOS touch desteÄŸi
        const clientX = evt.changedTouches ? evt.changedTouches[0].clientX : evt.clientX;
        const clientY = evt.changedTouches ? evt.changedTouches[0].clientY : evt.clientY;
        const px = (clientX - rect.left);
        const py = (clientY - rect.top);
        const t = window.turkeyTransform || d3.zoomIdentity;
        const bx = (px - t.x) / t.k;
        const by = (py - t.y) / t.k;
        const [lon, lat] = window.turkeyProj.invert([bx, by]);
        if (!lon || isNaN(lon) || lon < 24 || lon > 46 || lat < 34 || lat > 43) return;
        handleClickAtLonLat(lon, lat);
      };
      svgEl2.addEventListener('click', svgEl2._turkeyClickHandler);
      svgEl2._turkeyTouchHandler && svgEl2.removeEventListener('touchend', svgEl2._turkeyTouchHandler);
      svgEl2._turkeyTouchHandler = function (evt) {
        evt.preventDefault();
        svgEl2._turkeyClickHandler(evt);
      };
      svgEl2.addEventListener('touchend', svgEl2._turkeyTouchHandler, { passive: false });
      svgEl2._turkeyTouchHandler && svgEl2.removeEventListener('touchend', svgEl2._turkeyTouchHandler);
      svgEl2._turkeyTouchHandler = function (evt) {
        evt.preventDefault();
        svgEl2._turkeyClickHandler(evt);
      };
      svgEl2.addEventListener('touchend', svgEl2._turkeyTouchHandler, { passive: false });

      turkeyMapG = g;
      turkeyMapLoaded = true;

      // GÃ¶l ve bÃ¼yÃ¼k barajlarÄ± fetch et
      loadTurkeyLakes(g, window.turkeyProj, geo);
    }

    function loadTurkeyLakes(provinceG, proj, turkeyGeo) {
      const LAKE_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_lakes.geojson';

      // TÃ¼rkiye GeoJSON'Ä±ndan birleÅŸik outline oluÅŸtur (clip iÃ§in)
      const turkeyOutline = {
        type: 'Feature', geometry: {
          type: 'MultiPolygon', coordinates: turkeyGeo.features.map(f => {
            if (f.geometry.type === 'Polygon') return f.geometry.coordinates;
            if (f.geometry.type === 'MultiPolygon') return f.geometry.coordinates.flat();
            return [];
          }).flat().map(c => [c])
        }
      };

      const TURKEY_LAKE_NAMES = ['van', 'tuz', 'beyÅŸehir', 'beysehir', 'eÄŸirdir', 'egirdir',
        'burdur', 'iznik', 'sapanca', 'manyas', 'ulubat', 'acÄ±gÃ¶l', 'acigol', 'salda', 'eber',
        'akÅŸehir', 'aksehir', 'seyfe', 'karamuk'];

      fetch(LAKE_URL).then(r => r.json()).then(geo => {
        const lakePath = d3.geoPath().projection(proj);

        // TÃ¼rkiye bbox'Ä± ile Ã¶rtÃ¼ÅŸen gÃ¶lleri filtrele
        const turkBounds = [[25.5, 35.8], [44.8, 42.2]]; // [min_lon,min_lat],[max_lon,max_lat]

        geo.features.forEach(f => {
          try {
            const name = (f.properties.name || f.properties.Name || '').toLowerCase();
            const b = d3.geoBounds(f);
            const minLon = b[0][0], minLat = b[0][1], maxLon = b[1][0], maxLat = b[1][1];

            // TÃ¼rkiye bbox dÄ±ÅŸÄ±ndaysa atla
            if (maxLon < 25.5 || minLon > 44.8 || maxLat < 35.8 || minLat > 42.2) return;

            // Ä°sim kontrolÃ¼: ya TÃ¼rkiye'nin bilinen gÃ¶lÃ¼ olmalÄ±
            // ya da bbox tamamen TÃ¼rkiye iÃ§inde olmalÄ±
            const isKnownTurkeyLake = TURKEY_LAKE_NAMES.some(n => name.includes(n));
            const isInsideTurkey = minLon > 25.5 && maxLon < 44.8 && minLat > 35.8 && maxLat < 42.2;

            if (!isKnownTurkeyLake && !isInsideTurkey) return;

            // GÃ¶l Ã§ok bÃ¼yÃ¼kse (Hazar, Karadeniz gibi) atla
            const area = (maxLon - minLon) * (maxLat - minLat);
            if (area > 20) return;

            const d = lakePath(f);
            if (!d) return;
            provinceG.append('path').attr('class', 'turkey-lake-overlay').attr('d', d);
          } catch (e) { }
        });
      }).catch(() => {
        drawTurkeyLakesManual(provinceG, proj);
      });
    }

    function drawTurkeyLakesManual(provinceG, proj) {
      const LAKES = [
        { name: 'Van GÃ¶lÃ¼', coords: [[43.38, 38.35], [43.22, 38.12], [43.05, 38.08], [42.82, 38.18], [42.72, 38.42], [42.78, 38.68], [43.05, 38.88], [43.38, 38.98], [43.72, 38.92], [44.05, 38.75], [44.32, 38.52], [44.42, 38.28], [44.28, 38.02], [44.02, 37.88], [43.72, 37.85], [43.45, 37.95], [43.28, 38.18], [43.38, 38.35]] },
        { name: 'Tuz GÃ¶lÃ¼', coords: [[33.05, 38.10], [32.95, 38.28], [32.98, 38.52], [33.12, 38.68], [33.35, 38.78], [33.62, 38.80], [33.88, 38.72], [34.02, 38.52], [34.00, 38.28], [33.82, 38.10], [33.52, 38.02], [33.22, 38.05], [33.05, 38.10]] },
        { name: 'BeyÅŸehir', coords: [[31.48, 37.48], [31.42, 37.62], [31.45, 37.78], [31.55, 37.88], [31.72, 37.90], [31.88, 37.82], [31.95, 37.65], [31.88, 37.50], [31.72, 37.42], [31.55, 37.42], [31.48, 37.48]] },
        { name: 'EÄŸirdir', coords: [[30.85, 37.72], [30.82, 37.85], [30.88, 37.98], [31.00, 38.05], [31.12, 38.02], [31.18, 37.90], [31.12, 37.78], [30.98, 37.70], [30.85, 37.72]] },
        { name: 'Ä°znik', coords: [[29.42, 40.20], [29.38, 40.30], [29.45, 40.42], [29.60, 40.48], [29.72, 40.45], [29.78, 40.35], [29.72, 40.22], [29.58, 40.15], [29.45, 40.18], [29.42, 40.20]] },
        { name: 'Sapanca', coords: [[30.18, 40.60], [30.15, 40.68], [30.22, 40.72], [30.38, 40.74], [30.52, 40.70], [30.55, 40.62], [30.48, 40.55], [30.30, 40.52], [30.18, 40.57], [30.18, 40.60]] },
        { name: 'Burdur', coords: [[30.12, 37.62], [30.05, 37.72], [30.10, 37.82], [30.22, 37.88], [30.38, 37.88], [30.52, 37.80], [30.55, 37.68], [30.48, 37.58], [30.32, 37.55], [30.15, 37.58], [30.12, 37.62]] },
      ];
      const lakePath = d3.geoPath().projection(proj);
      LAKES.forEach(lake => {
        const ring = lake.coords.slice();
        if (ring[0].join() !== ring[ring.length - 1].join()) ring.push(ring[0]);
        const f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } };
        try { provinceG.append('path').attr('class', 'turkey-lake-overlay').attr('d', lakePath(f)); } catch (e) { }
      });
    }
  

    // ===== MULTIPLAYER SÄ°STEMÄ° =====

    let mpLobby = null;
    let mpLobbyId = null;
    let mpUnsubscribe = null;
    let mpMode = 'world';
    let mpIsHost = false;
    let mpMyScore = 0;
    let mpQuestions = [];
    let mpCurrentQ = 0;
    let mpGameActive = false;

    // â”€â”€ BAÄLANTI KESÄ°LME TAKÄ°BÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let _mpHeartbeatInterval = null;       // kendi heartbeat'imiz
    const MP_HEARTBEAT_INTERVAL = 3000;    // 3 saniyede bir yaz
    const MP_DISCONNECT_TIMEOUT = 20000;   // 20 saniye cevap yoksa forfeit
    let _mpDisconnectTimers = {};          // { username: timeoutId }

    // â”€â”€ RANK SÄ°STEMÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const RANK_TIERS = [
      { key: 'bronze1', label: 'Bronz I', min: 0, max: 60 },
      { key: 'bronze2', label: 'Bronz II', min: 60, max: 100 },
      { key: 'bronze3', label: 'Bronz III', min: 100, max: 140 },
      { key: 'silver1', label: 'GÃ¼mÃ¼ÅŸ I', min: 140, max: 180 },
      { key: 'silver2', label: 'GÃ¼mÃ¼ÅŸ II', min: 180, max: 220 },
      { key: 'silver3', label: 'GÃ¼mÃ¼ÅŸ III', min: 220, max: 260 },
      { key: 'gold1', label: 'AltÄ±n I', min: 260, max: 300 },
      { key: 'gold2', label: 'AltÄ±n II', min: 300, max: 340 },
      { key: 'gold3', label: 'AltÄ±n III', min: 340, max: 380 },
      { key: 'plat1', label: 'Platin I', min: 380, max: 420 },
      { key: 'plat2', label: 'Platin II', min: 420, max: 460 },
      { key: 'plat3', label: 'Platin III', min: 460, max: 9999 },
    ];
    const RANK_TIERS_EN = [
      { key: 'bronze1', label: 'Bronze I' }, { key: 'bronze2', label: 'Bronze II' }, { key: 'bronze3', label: 'Bronze III' },
      { key: 'silver1', label: 'Silver I' }, { key: 'silver2', label: 'Silver II' }, { key: 'silver3', label: 'Silver III' },
      { key: 'gold1', label: 'Gold I' }, { key: 'gold2', label: 'Gold II' }, { key: 'gold3', label: 'Gold III' },
      { key: 'plat1', label: 'Platinum I' }, { key: 'plat2', label: 'Platinum II' }, { key: 'plat3', label: 'Platinum III' },
    ];
    const RANK_PLACEMENT_ELO = [80, 70, 50, 40, 30]; // 5 yerleÅŸme maÃ§Ä± Ã§arpanlarÄ±
    const RANK_PLACEMENT_GAMES = 5;
    const RANK_WIN_ELO = 20;
    const RANK_LOSS_ELO = -20;
    const RANK_PLACEMENT_WIN_TOTAL = 270; // 5 galibiyet â†’ 270 elo â†’ GÃ¼mÃ¼ÅŸ III

    function getRankEloField(mode) {
      return { turkey: 'eloTurkey', europe: 'eloEurope', flag: 'eloFlag' }[mode] || 'eloWorld';
    }
    function getRankGamesField(mode) {
      return { turkey: 'rankGamesTurkey', europe: 'rankGamesEurope', flag: 'rankGamesFlag' }[mode] || 'rankGamesWorld';
    }
    function getElo(user, mode) {
      if (!user) return null;
      const games = user[getRankGamesField(mode)] || 0;
      if (games < RANK_PLACEMENT_GAMES) return null; // yerleÅŸmemiÅŸ
      return user[getRankEloField(mode)] || 0;
    }
    function getRankFromElo(elo) {
      if (elo === null) return null;
      for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
        if (elo >= RANK_TIERS[i].min) return RANK_TIERS[i];
      }
      return RANK_TIERS[0];
    }
    function getRankLabel(elo, lang) {
      if (elo === null) return lang === 'en' ? 'Unranked' : 'SÄ±rasÄ±z';
      const tier = getRankFromElo(elo);
      if (!tier) return '?';
      const enTier = RANK_TIERS_EN.find(t => t.key === tier.key);
      return lang === 'en' ? enTier.label : tier.label;
    }
    function getRankClass(elo) {
      if (elo === null) return 'rank-unranked';
      const tier = getRankFromElo(elo);
      return tier ? 'rank-' + tier.key : 'rank-unranked';
    }
    function getRankEmoji(elo) {
      if (elo === null) return 'â“';
      const tier = getRankFromElo(elo);
      if (!tier) return 'â“';
      if (tier.key === 'plat3') return 'ğŸ’';
      if (tier.key === 'plat2') return 'ğŸ”µ';
      if (tier.key === 'plat1') return 'ğŸŒŸ';
      if (tier.key === 'gold3') return 'ğŸ‘‘';
      if (tier.key === 'gold2') return 'ğŸ…';
      if (tier.key === 'gold1') return 'ğŸ¥‡';
      if (tier.key === 'silver3') return 'â­';
      if (tier.key === 'silver2') return 'ğŸ¥ˆ';
      if (tier.key === 'silver1') return 'ğŸ”·';
      if (tier.key === 'bronze3') return 'ğŸ”¶';
      if (tier.key === 'bronze2') return 'ğŸ¥‰';
      return 'ğŸ”¸'; // bronze1
    }

    // BÃ¼yÃ¼k rank kartÄ± HTML'i dÃ¶ndÃ¼r
    function getRankCardHTML(elo, langOverride) {
      const l = langOverride || lang;
      if (elo === null) {
        return `<div class="rank-card-display rank-card-unranked" style="background:rgba(60,70,90,.5);border:1px solid var(--border);">
      <div class="rank-card-icon">â“</div>
      <div class="rank-card-label" style="color:var(--muted)">${l === 'en' ? 'UNRANKED' : 'SIRASIZ'}</div>
    </div>`;
      }
      const tier = getRankFromElo(elo);
      if (!tier) return '';
      const label = getRankLabel(elo, l);
      const icon = getRankEmoji(elo);
      const cls = 'rank-card-' + tier.key;
      return `<div class="rank-card-display ${cls}">
    <div class="rank-card-icon">${icon}</div>
    <div class="rank-card-label">${label}</div>
    <div class="rank-card-elo">${elo} ELO</div>
  </div>`;
    }

    async function updateRankAfterMatch(won, mode) {
      if (!currentUser || !db) return { oldElo: null, newElo: null, oldRank: null, newRank: null };
      const eloField = getRankEloField(mode);
      const gamesField = getRankGamesField(mode);
      const key = currentUser.username.toLowerCase();
      try {
        const userRef = db.collection('users').doc(key);
        let result = {};

        await db.runTransaction(async tx => {
          const snap = await tx.get(userRef);
          const userData = snap.exists ? snap.data() : currentUser;
          let elo = userData[eloField] || 0;
          let games = userData[gamesField] || 0;
          const oldElo = games >= RANK_PLACEMENT_GAMES ? elo : null;
          const oldRank = getRankFromElo(oldElo);

          let delta;
          if (games < RANK_PLACEMENT_GAMES) {
            const placementMult = RANK_PLACEMENT_ELO[games] || 20;
            delta = won ? placementMult : -Math.floor(placementMult * 0.5);
          } else {
            delta = won ? RANK_WIN_ELO : RANK_LOSS_ELO;
          }
          elo = Math.max(0, elo + delta);
          games += 1;
          const winsField = 'wins_' + mode;
          const lossesField = 'losses_' + mode;
          const currentWins = userData[winsField] || 0;
          const currentLosses = userData[lossesField] || 0;
          tx.update(userRef, {
            [eloField]: elo,
            [gamesField]: games,
            [winsField]: won ? currentWins + 1 : currentWins,
            [lossesField]: won ? currentLosses : currentLosses + 1,
          });
          // Local cache
          currentUser[winsField] = won ? currentWins + 1 : currentWins;
          currentUser[lossesField] = won ? currentLosses : currentLosses + 1;

          const newElo = games >= RANK_PLACEMENT_GAMES ? elo : null;
          const newRank = getRankFromElo(newElo);
          result = { oldElo, newElo, oldRank, newRank, delta, games, placed: games === RANK_PLACEMENT_GAMES };
          // Local cache gÃ¼ncelle
          currentUser[eloField] = elo;
          currentUser[gamesField] = games;
        });

        return result;
      } catch (e) { console.error('Rank update error:', e); return { oldElo: null, newElo: null }; }
    }

    function openMultiplayerMenu() {
      if (!currentUser || currentUser.isGuest) {
        // GiriÅŸ yapmamÄ±ÅŸ kullanÄ±cÄ±ya auth modalÄ±nÄ± gÃ¶ster
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.remove('hidden');
          // KÄ±sa bir bilgi mesajÄ± gÃ¶ster
          const errEl = authModal.querySelector('.auth-error') || authModal.querySelector('#auth-login-error');
          if (errEl) {
            errEl.textContent = t('mpErrLogin');
            setTimeout(() => { errEl.textContent = ''; }, 4000);
          }
        }
        return;
      }
      document.getElementById('welcome-modal').style.display = 'none';
      mpShowMain();
      document.getElementById('mp-modal').classList.add('open');
    }

    function closeMultiplayerMenu() {
      mmCleanup();
      document.getElementById('mp-modal').classList.remove('open');
      document.getElementById('welcome-modal').style.display = 'flex';
    }

    function mpShowMain() {
      ['mp-screen-create', 'mp-screen-join', 'mp-screen-lobby-host', 'mp-screen-lobby-guest', 'mp-screen-browse', 'mp-screen-matchmaking'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      document.getElementById('mp-screen-main').style.display = 'block';
    }

    function mpShowCreate() {
      document.getElementById('mp-screen-main').style.display = 'none';
      document.getElementById('mp-screen-create').style.display = 'block';
      const cn = document.getElementById('mp-create-name');
      if (cn) { cn.value = ''; cn.focus(); }
      const pt = document.getElementById('mp-create-private-toggle');
      if (pt) { pt.checked = false; document.getElementById('mp-create-password-row').style.display = 'none'; }
      document.getElementById('mp-create-error').textContent = '';
    }

    function mpShowJoin() {
      document.getElementById('mp-screen-main').style.display = 'none';
      document.getElementById('mp-screen-join').style.display = 'block';
      const jc = document.getElementById('mp-join-code');
      if (jc) { jc.value = ''; jc.focus(); }
      document.getElementById('mp-join-error').textContent = '';
      document.getElementById('mp-join-password-row').style.display = 'none';
      setTimeout(() => document.getElementById('mp-join-code').focus(), 100);
    }

    function mpSelectMode(m) {
      mpMode = m;
      ['world', 'europe', 'turkey', 'flag'].forEach(id => {
        const btn = document.getElementById('mp-mode-' + id);
        if (btn) btn.classList.toggle('active', id === m);
      });
    }

    // Lobi iÃ§inde mod deÄŸiÅŸtir (sadece host)
    async function mpLobbySetMode(m) {
      if (!mpIsHost || !mpLobbyId) return;
      mpMode = m;
      ['world', 'europe', 'turkey', 'flag'].forEach(id => {
        const btn = document.getElementById('lobby-mode-' + id);
        if (btn) btn.classList.toggle('active', id === m);
      });

      try {
        await db.collection('mp_lobbies').doc(mpLobbyId).update({ mode: m });
      } catch (err) {
        console.error('Mode update error:', err);
      }
      // (matchmaking artÄ±k mpShowMatchmaking() Ã¼zerinden yÃ¶netiliyor)
    }

    // Rastgele 4 haneli lobi kodu Ã¼ret (sadece bÃ¼yÃ¼k harf)
    function mpGenerateCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    const MP_QUESTION_COUNT = 12;

    function mpTogglePasswordField() {
      const checked = document.getElementById('mp-create-private-toggle').checked;
      document.getElementById('mp-create-password-row').style.display = checked ? 'block' : 'none';
      if (checked) document.getElementById('mp-create-password').focus();
    }

    async function mpCreateLobby() {
      if (!db) { document.getElementById('mp-create-error').textContent = 'Connection error!'; return; }
      const lobbyNameRaw = (document.getElementById('mp-create-name').value || '').trim().toUpperCase();
      if (!lobbyNameRaw) { document.getElementById('mp-create-error').textContent = 'Lobi adÄ± boÅŸ olamaz!'; return; }
      const isPrivate = document.getElementById('mp-create-private-toggle').checked;
      const password = isPrivate ? (document.getElementById('mp-create-password').value || '').trim() : '';
      if (isPrivate && !password) { document.getElementById('mp-create-error').textContent = 'Åifre boÅŸ olamaz!'; return; }
      if (mpMode === 'flag') _showPortraitTip();
      const btn = document.getElementById('mp-create-go');
      btn.disabled = true; btn.textContent = t('mpCreating');

      try {
        // Åifreli lobilerde benzersiz kod Ã¼ret, ÅŸifresiz lobilerde gerek yok
        let code = '';
        if (isPrivate) {
          let exists = true;
          while (exists) {
            code = mpGenerateCode();
            const snap = await db.collection('mp_lobbies').where('code', '==', code).where('status', '==', 'waiting').get();
            exists = !snap.empty;
          }
        }

        const questions = mpMode === 'turkey' ? pickTurkeyQuestions(MP_QUESTION_COUNT) : mpMode === 'europe' ? pickEuropeQuestions(MP_QUESTION_COUNT) : mpMode === 'flag' ? pickFlagQuestions(12) : pickQuestions(MP_QUESTION_COUNT);

        const lobbyData = {
          code,
          lobbyName: lobbyNameRaw,
          isPrivate: isPrivate,
          password: isPrivate ? password : '',
          hostId: currentUser.username,
          status: 'waiting',
          mode: mpMode,
          questions: mpMode === 'flag'
            ? questions.map(q => ({ tr: q.tr, en: q.en, flag: q.flag, code: q.code || '', atr: q.atr || [], aen: q.aen || [] }))
            : questions.map(q => ({ name: q.name, name_en: q.name_en || '', country: q.country || '', city: q.city || '', lat: q.lat || 0, lon: q.lon || 0 })),
          players: {
            [currentUser.username]: { name: currentUser.username, score: 0, joinedAt: Date.now(), ready: true }
          },
          scores: {},
          createdAt: Date.now()
        };

        const ref = await db.collection('mp_lobbies').add(lobbyData);
        mpLobbyId = ref.id;
        mpLobby = lobbyData;
        mpIsHost = true;
        mpMyScore = 0;
        mpQuestions = questions;

        mpSubscribeLobby();
        mpShowLobbyHost();
      } catch (e) {
        document.getElementById('mp-create-error').textContent = 'Hata: ' + e.message;
      }
      btn.disabled = false; btn.textContent = t('mpCreateGo');
    }

    // Lobiye katÄ±lma â€” ortak yardÄ±mcÄ±
    async function _mpDoJoin(docSnap, password) {
      const lobbyData = docSnap.data();
      const playerCount = Object.keys(lobbyData.players || {}).length;
      const maxPlayers = lobbyData.maxPlayers || 5;
      if (playerCount >= maxPlayers) throw new Error(lang === 'en' ? 'Lobby is full!' : 'Lobi dolu!');
      if (lobbyData.players && lobbyData.players[currentUser.username]) throw new Error('Bu lobide zaten varsÄ±n!');
      if (lobbyData.isPrivate && lobbyData.password !== password) throw new Error('YanlÄ±ÅŸ ÅŸifre!');

      mpLobbyId = docSnap.id;
      mpIsHost = false;
      mpMyScore = 0;
      mpQuestions = lobbyData.questions;
      mpMode = lobbyData.mode;

      await db.collection('mp_lobbies').doc(mpLobbyId).update({
        [`players.${currentUser.username}`]: { name: currentUser.username, score: 0, joinedAt: Date.now(), ready: true }
      });
      mpSubscribeLobby();
      mpShowLobbyGuest();
      if (mpMode === 'flag') _showPortraitTip();
    }

    // Koda gÃ¶re katÄ±lma
    async function mpJoinLobbyByCode() {
      const code = document.getElementById('mp-join-code').value.trim().toUpperCase();
      if (code.length !== 4) { document.getElementById('mp-join-error').textContent = 'GeÃ§ersiz kod!'; return; }
      if (!db) { document.getElementById('mp-join-error').textContent = 'BaÄŸlantÄ± hatasÄ±!'; return; }
      const btn = document.getElementById('mp-join-go');
      btn.disabled = true; btn.textContent = t('mpJoining');
      try {
        const snap = await db.collection('mp_lobbies').where('code', '==', code).where('status', '==', 'waiting').get();
        if (snap.empty) { document.getElementById('mp-join-error').textContent = 'Lobi bulunamadÄ± veya oyun baÅŸladÄ±!'; btn.disabled = false; btn.textContent = t('mpJoinGo'); return; }
        const docSnap = snap.docs[0];
        const lobbyData = docSnap.data();
        if (lobbyData.isPrivate) {
          // Åifre alanÄ±nÄ± gÃ¶ster
          document.getElementById('mp-join-password-row').style.display = 'block';
          document.getElementById('mp-join-password').dataset.docId = docSnap.id;
          document.getElementById('mp-join-password').focus();
          btn.disabled = false; btn.textContent = t('mpJoinGo');
          btn.onclick = async function () {
            const pw = document.getElementById('mp-join-password').value.trim();
            btn.disabled = true; btn.textContent = t('mpJoining');
            try {
              await _mpDoJoin(docSnap, pw);
            } catch (e) { document.getElementById('mp-join-error').textContent = e.message; btn.disabled = false; btn.textContent = t('mpJoinGo'); }
          };
          return;
        }
        await _mpDoJoin(docSnap, '');
      } catch (e) {
        document.getElementById('mp-join-error').textContent = 'Hata: ' + e.message;
      }
      btn.disabled = false; btn.textContent = t('mpJoinGo');
      btn.onclick = mpJoinLobbyByCode;
    }

    // Eski alias
    function mpJoinLobby() { mpJoinLobbyByCode(); }

    // â”€â”€â”€ Aktif Lobi Listesi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let _mpBrowsePendingDoc = null;

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // RASTGELE EÅLEÅTÄ°RME (Matchmaking)
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    let _mmMode = 'world';
    let _mmInterval = null;
    let _mmDocRef = null;
    let _mmUnsubscribe = null;
    let _mmExpanded = false;
    let _mmExpandAsked = false;

    const MM_MODES = [
      { key: 'world', emoji: 'ğŸŒ', labelTr: 'DÃ¼nya', labelEn: 'World' },
      { key: 'europe', emoji: 'ğŸ‡ªğŸ‡º', labelTr: 'Avrupa', labelEn: 'Europe' },
      { key: 'turkey', emoji: 'ğŸ‡¹ğŸ‡·', labelTr: 'TÃ¼rkiye', labelEn: 'Turkey' },
      { key: 'flag', emoji: 'ğŸš©', labelTr: 'Bayraklar', labelEn: 'Flags' },
    ];

    function mmRenderRankGrid() {
      const grid = document.getElementById('mm-rank-grid');
      if (!grid) return;
      grid.innerHTML = MM_MODES.map(m => {
        const elo = currentUser ? getElo(currentUser, m.key) : null;
        const rkLabel = getRankLabel(elo, lang);
        const rkClass = getRankClass(elo);
        const rkEmoji = elo !== null ? getRankEmoji(elo) : 'â“';
        const games = currentUser ? (currentUser[getRankGamesField(m.key)] || 0) : 0;
        const gamesLeft = Math.max(0, RANK_PLACEMENT_GAMES - games);
        const sub = elo !== null ? rkLabel : (gamesLeft > 0 ? (lang === 'en' ? gamesLeft + ' games left' : gamesLeft + ' maÃ§ kaldÄ±') : (lang === 'en' ? 'Unranked' : 'SÄ±rasÄ±z'));
        return '<div class="mm-rank-card' + (m.key === _mmMode ? ' selected' : '') + '" onclick="mmSelectMode(\'' + m.key + '\')">'
          + '<div class="mm-rank-card-mode">' + m.emoji + '</div>'
          + '<div class="mm-rank-card-name">' + (lang === 'en' ? m.labelEn : m.labelTr) + '</div>'
          + '<div style="margin-top:4px"><span class="rank-badge ' + rkClass + '">' + rkEmoji + ' ' + sub + '</span></div>'
          + '</div>';
      }).join('');
    }

    function mmSelectMode(m) {
      _mmMode = m;
      mmRenderRankGrid();
    }

    function mpShowMatchmaking() {
      ['mp-screen-main', 'mp-screen-create', 'mp-screen-join', 'mp-screen-lobby-host', 'mp-screen-lobby-guest', 'mp-screen-browse'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      document.getElementById('mp-screen-matchmaking').style.display = 'block';
      document.getElementById('mp-mm-select').style.display = 'block';
      document.getElementById('mp-mm-searching').style.display = 'none';
      document.getElementById('mp-mm-expand-box').style.display = 'none';
      _mmExpanded = false; _mmExpandAsked = false;
      mmRenderRankGrid();
    }

   function mmStartSearch() {
  document.getElementById('mp-mm-select').style.display = 'none';
  document.getElementById('mp-mm-searching').style.display = 'block';
  document.getElementById('mp-mm-error').textContent = '';
  document.getElementById('mp-mm-expand-box').style.display = 'none';
  _mmExpanded = false; _mmExpandAsked = false;
  const modeNames = { world: lang === 'en' ? 'World' : 'DÃ¼nya', europe: lang === 'en' ? 'Europe' : 'Avrupa', turkey: lang === 'en' ? 'Turkey' : 'TÃ¼rkiye', flag: lang === 'en' ? 'Flags' : 'Bayraklar' };
  const sub = document.getElementById('mp-mm-sub');
  if (sub) sub.textContent = (MM_MODES.find(m => m.key === _mmMode) || {}).emoji + ' ' + (modeNames[_mmMode] || _mmMode);
  mmStart();
}

    function mmExpandRange() {
      _mmExpanded = true;
      document.getElementById('mp-mm-expand-box').style.display = 'none';
      document.getElementById('mp-mm-hint').textContent = lang === 'en' ? 'Expanding searchâ€¦' : 'Arama geniÅŸletiliyorâ€¦';
    }

    function mmDismissExpand() {
      // Geriye dÃ¶nÃ¼k uyumluluk: manuel kutu kapatma Ã§aÄŸrÄ±lÄ±rsa otomatik geniÅŸletmeye geÃ§
      document.getElementById('mp-mm-expand-box').style.display = 'none';
      _mmExpanded = true;
      _mmSearchPhaseRef = 'expanded';
      document.getElementById('mp-mm-hint').textContent = lang === 'en' ? 'Search expanded. Looking for any opponentâ€¦' : 'Arama geniÅŸletildi. Herhangi bir rakip aranÄ±yorâ€¦';
    }

    let _mmSearchPhaseRef = 'narrow';

    async function mmStart() {
      if (!currentUser || !db) return;
      const myName = currentUser.username;
      const myElo = getElo(currentUser, _mmMode) || 0;
      let cd = 20;
      _mmSearchPhaseRef = 'narrow';
      document.getElementById('mp-mm-timer').textContent = cd;
      document.getElementById('mp-mm-hint').textContent = lang === 'en' ? 'Looking for an opponentâ€¦' : 'Rakip aranÄ±yorâ€¦';
      document.getElementById('mp-mm-spinner').textContent = 'ğŸ”';

      // Bekleme kuyruÄŸuna gir
      try {
        _mmDocRef = await (async () => {
          const ref = db.collection('matchmaking').doc();
          await ref.set({ 
  uid: firebase.auth().currentUser?.uid || '',
  username: myName, 
  mode: _mmMode, 
  elo: myElo, 
  status: 'searching', 
  bot: false,
  createdAt: Date.now() 
});
          return ref;
        })();
      } catch (e) {
        document.getElementById('mp-mm-error').textContent = 'Hata: ' + e.message;
        return;
      }

      // Listener: biri eÅŸleÅŸtirirse
      _mmUnsubscribe = _mmDocRef.onSnapshot(async snap => {
        if (!snap.exists) return;
        const data = snap.data();
        if (data.status === 'matched') {
          clearInterval(_mmInterval);
          if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
          document.getElementById('mp-mm-hint').textContent = lang === 'en' ? 'Match found! Joiningâ€¦' : 'EÅŸleÅŸme bulundu! KatÄ±lÄ±yorumâ€¦';
          document.getElementById('mp-mm-spinner').textContent = 'âš¡';
          setTimeout(async () => { await mmJoinLobbyOf(data.matchedBy || data.matchedWith); }, 1000);
        }
      });

      // Countdown + aktif arama dÃ¶ngÃ¼sÃ¼
      // searchPhase dÄ±ÅŸarÄ±dan (mmDismissExpand) deÄŸiÅŸtirilebilsin diye _mmSearchPhaseRef kullanÄ±yoruz
      _mmSearchPhaseRef = 'narrow';
      _mmInterval = setInterval(async () => {
        cd--;
        const timerEl = document.getElementById('mp-mm-timer');
        if (timerEl) timerEl.textContent = cd;

        // 10. saniyede aramayÄ± otomatik geniÅŸlet: elo farkÄ± artÄ±k Ã¶nemsenmez
        if (cd === 10 && !_mmExpanded) {
          _mmExpandAsked = true;
          _mmExpanded = true;
          _mmSearchPhaseRef = 'expanded';
          document.getElementById('mp-mm-expand-box').style.display = 'none';
          const hintEl = document.getElementById('mp-mm-hint');
          const spinEl = document.getElementById('mp-mm-spinner');
          if (hintEl) hintEl.textContent = lang === 'en' ? 'Search expanded. Matching with any opponentâ€¦' : 'Arama geniÅŸletildi. Elo farkÄ± olmadan rakip aranÄ±yorâ€¦';
          if (spinEl) spinEl.textContent = 'âš¡';
        }

        // 20. saniye dolunca botla eÅŸleÅŸtir
        if (cd <= 0 && _mmSearchPhaseRef !== 'bot') {
          _mmSearchPhaseRef = 'bot';
          clearInterval(_mmInterval);
          if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
          if (_mmDocRef) { _mmDocRef.delete().catch(() => { }); _mmDocRef = null; }
          const hintEl = document.getElementById('mp-mm-hint');
          const spinEl = document.getElementById('mp-mm-spinner');
          if (hintEl) hintEl.textContent = lang === 'en' ? 'No player found in 20 seconds. Adding botâ€¦' : '20 saniyede oyuncu bulunamadÄ±. Bot ekleniyorâ€¦';
          if (spinEl) spinEl.textContent = 'ğŸ¤–';
          document.getElementById('mp-mm-expand-box').style.display = 'none';
          setTimeout(() => mmStartWithBot(), 1000);
          return;
        }

        // Her saniye aktif arama: baÅŸka biri var mÄ±?
        try {
          const snap = await db.collection('matchmaking')
            .where('status', '==', 'searching')
            .where('mode', '==', _mmMode)
            .limit(10).get();
          let opponent = null;
          snap.forEach(doc => {
            if (opponent) return;
            const d = doc.data();
            if (_mmDocRef && doc.id === _mmDocRef.id) return;
            if (_mmExpanded) { opponent = doc; return; }
            // Dar arama: elo Â±40
            if (Math.abs((d.elo || 0) - myElo) <= 40) { opponent = doc; }
          });
          if (opponent) {
            const opData = opponent.data();
            let iAmHost = false;
            // Transaction: ilk Ã§alÄ±ÅŸtÄ±ran host olur, deadlock engellenir
            try {
              const result = await db.runTransaction(async tx => {
                const myRef = _mmDocRef;
                const opRef = opponent.ref;
                const [mySnap, opSnap] = await Promise.all([tx.get(myRef), tx.get(opRef)]);
                if (!mySnap.exists || !opSnap.exists) throw new Error('missing-doc');
                const myData = mySnap.data() || {};
                const otherData = opSnap.data() || {};
                if (myData.status !== 'searching' || otherData.status !== 'searching') throw new Error('already-claimed');

// Ä°ki taraftan biri henÃ¼z darsa, ELO farkÄ± 40'tan fazlaysa eÅŸleÅŸme
const eloDiff = Math.abs((otherData.elo || 0) - myElo);
const opponentExpanded = (Date.now() - (otherData.createdAt || 0)) >= 10000;
if (eloDiff > 40 && (!_mmExpanded || !opponentExpanded)) {
  throw new Error('elo-too-far');
}
                // Ä°lk transaction'Ä± Ã§alÄ±ÅŸtÄ±ran host olur
                tx.update(myRef, { status: 'matched', matchedWith: otherData.username || '' });
                tx.update(opRef, { status: 'matched', matchedBy: myName });
                return { hostIsMe: true, opponentUsername: otherData.username || '' };
              });
              iAmHost = !!(result && result.hostIsMe);
            } catch (e) { return; } // baÅŸkasÄ± zaten host oldu

            clearInterval(_mmInterval);
            document.getElementById('mp-mm-expand-box').style.display = 'none';

            if (!iAmHost) {
              const hintEl = document.getElementById('mp-mm-hint');
              const spinEl = document.getElementById('mp-mm-spinner');
              if (hintEl) hintEl.textContent = lang === 'en' ? 'Opponent found! Waiting for lobbyâ€¦' : 'Rakip bulundu! Lobi bekleniyorâ€¦';
              if (spinEl) spinEl.textContent = 'âš¡';
              return;
            }

            if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
            document.getElementById('mp-mm-hint').textContent = lang === 'en' ? 'Match found! Creating lobbyâ€¦' : 'EÅŸleÅŸme bulundu! Lobi oluÅŸturuluyorâ€¦';
            document.getElementById('mp-mm-spinner').textContent = 'âš¡';
            await mmCreateLobbyWith(opData.username, opponent.id);
          }
        } catch (e) { /* sessizce devam */ }
      }, 1000);
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // BOT SÄ°STEMÄ°
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function _getBotConfig(elo, mode) {
      // Rank'a gÃ¶re bot gÃ¼cÃ¼ belirle
      const tier = elo === null ? 'bronze'
        : elo < 140 ? 'bronze'
          : elo < 260 ? 'silver'
            : elo < 380 ? 'gold'
              : 'plat';
      if (mode === 'flag') {
        // DoÄŸru cevap oranÄ±: bronze %30, silver %45, gold %60, plat %72 (%60 * 1.2)
        const rates = { bronze: 0.30, silver: 0.45, gold: 0.60, plat: 0.72 };
        return { tier, rate: rates[tier] };
      } else {
        // Soru baÅŸÄ± ortalama puan: bronze 280, silver 410, gold 580, plat 696 (580 * 1.2)
        const avgScores = { bronze: 280, silver: 410, gold: 580, plat: 696 };
        return { tier, avgScore: avgScores[tier] };
      }
    }

    function _botName(tier) {
      const names = {
        bronze: ['BronzBot', 'RustyBot', 'IronBot', 'CopperBot'],
        silver: ['SilverBot', 'QuickBot', 'SwiftBot', 'NimbleBot'],
        gold: ['GoldBot', 'EliteBot', 'MasterBot', 'ProBot'],
        plat: ['PlatBot', 'DiamondBot', 'ApexBot', 'NexusBot'],
      };
      const pool = names[tier] || names.bronze;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    async function mmStartWithBot() {
      const myElo = getElo(currentUser, _mmMode) || 0;
      const botCfg = _getBotConfig(myElo === 0 ? null : myElo, _mmMode);
      const botName = _botName(botCfg.tier);
      const mode = _mmMode;
      mpMode = mode;

      const questions = mode === 'turkey' ? pickTurkeyQuestions(MP_QUESTION_COUNT)
        : mode === 'europe' ? pickEuropeQuestions(MP_QUESTION_COUNT)
          : mode === 'flag' ? pickFlagQuestions(12)
            : pickQuestions(MP_QUESTION_COUNT);

      const questionsForFirebase = mode === 'flag'
        ? questions.map(q => ({ tr: q.tr, en: q.en, flag: q.flag, code: q.code || '', atr: q.atr || [], aen: q.aen || [] }))
        : questions.map(q => ({ name: q.name, name_en: q.name_en || '', country: q.country || '', city: q.city || '', lat: q.lat || 0, lon: q.lon || 0 }));

      // Bot skorlarÄ± artÄ±k oyun sÄ±rasÄ±nda dinamik hesaplanacak (botScores boÅŸ baÅŸlÄ±yor)
      const lobbyData = {
        code: mpGenerateCode(),
        lobbyName: 'BOT MATCH',
        isPrivate: false, password: '',
        hostId: currentUser.username,
        status: 'playing', // direkt baÅŸlat
        mode, isQuickMatch: true, isBot: true,
        botName, botConfig: botCfg,
        maxPlayers: 2,
        questions: questionsForFirebase,
        players: {
          [currentUser.username]: { name: currentUser.username, score: 0, joinedAt: Date.now(), ready: true },
          [botName]: { name: botName, score: 0, joinedAt: Date.now(), ready: true, isBot: true }
        },
        scores: { [currentUser.username]: 0, [botName]: 0 },
        qscores: {},
        botScores: {}, // dinamik olarak doldurulacak
        currentQuestion: 0, showScores: -1, advanceAt: 0,
        photoReady: {}, photoReadyAt: null,
        flagQuestion: 0, flagAnswered: {}, flagStartAt: 0,
        createdAt: Date.now(), startedAt: Date.now(),
      };

      try {
        const ref = await db.collection('mp_lobbies').add(lobbyData);
        mpLobbyId = ref.id;
        mpLobby = lobbyData;
        mpIsHost = true;
        mpMyScore = 0;
        mpQuestions = questions;
        mmCleanup();
        // Bot lobi ekranÄ± gÃ¶stermeden direkt oyuna baÅŸla
        const hintEl = document.getElementById('mp-mm-hint');
        if (hintEl) hintEl.textContent = lang === 'en' ? 'Starting vs Botâ€¦' : 'Bot ile baÅŸlanÄ±yorâ€¦';
        mpSubscribeLobby();
        const botNotice = document.createElement('div');
botNotice.style.cssText = `
  position:fixed; top:20px; left:50%; transform:translateX(-50%);
  background:#1a1a2e; color:#fff; border:1px solid #f0a500;
  border-radius:12px; padding:12px 24px; font-size:14px;
  text-align:center; z-index:99999; box-shadow:0 4px 20px rgba(0,0,0,0.5);
`;
botNotice.innerHTML = lang === 'en'
  ? 'ğŸ¤– <strong>You are playing against a bot.</strong><br><span style="opacity:.7;font-size:12px">No real opponent was found.</span>'
  : 'ğŸ¤– <strong>Bot ile oynuyorsunuz.</strong><br><span style="opacity:.7;font-size:12px">GerÃ§ek rakip bulunamadÄ±.</span>';
document.body.appendChild(botNotice);
setTimeout(() => botNotice.remove(), 4000);

setTimeout(() => mpStartMultiplayerGame(), 800);
      } catch (e) {
        const errEl = document.getElementById('mp-mm-error');
        if (errEl) errEl.textContent = 'Bot hatasÄ±: ' + e.message;
        mpShowMain();
      }
    }

    function _simulateBotScores(questions, botCfg, mode) {
      const scores = {};
      questions.forEach((q, i) => {
        if (mode === 'flag') {
          // DoÄŸru cevap verirse: rate'e gÃ¶re puan (tam sayÄ±)
          const correct = Math.random() < botCfg.rate;
          if (correct) {
            const avgSec = botCfg.tier === 'gold' ? 3 : botCfg.tier === 'silver' ? 5 : 7;
            const sec = Math.max(1, Math.min(11, avgSec + (Math.random() * 4 - 2)));
            const timeLeft = Math.floor(Math.max(0, 12 - sec)); // tam sayÄ±
            scores['q' + i] = timeLeft >= 7 ? 1000 : Math.max(0, 1000 - (7 - timeLeft) * 60);
          } else {
            scores['q' + i] = 0;
          }
        } else {
          // DÃ¼nya/TÃ¼rkiye/Harikalar: avg Â± %30 rastgele, kesinlikle tam sayÄ±
          const avg = botCfg.avgScore;
          const variance = avg * 0.3;
          scores['q' + i] = Math.max(0, Math.round(avg + (Math.random() * variance * 2 - variance)));
        }
      });
      return scores;
    }

    // Bot skorlarÄ±nÄ± MP oyunu sÄ±rasÄ±nda uygula
    let _botApplyInterval = null;

    // â”€â”€ HEARTBEAT: kendi baÄŸlantÄ±mÄ±zÄ± Firestore'a bildir â”€â”€
    function mpStartHeartbeat() {
      mpStopHeartbeat();
      if (!mpLobbyId || !currentUser || mpLobby?.isBot) return;
      const field = `lastSeen.${currentUser.username}`;
      // Hemen bir kez yaz, sonra interval
      db.collection('mp_lobbies').doc(mpLobbyId).update({ [field]: Date.now() }).catch(() => {});
      _mpHeartbeatInterval = setInterval(() => {
        if (!mpGameActive || !mpLobbyId) { mpStopHeartbeat(); return; }
        db.collection('mp_lobbies').doc(mpLobbyId).update({ [field]: Date.now() }).catch(() => {});
        // AynÄ± zamanda rakibin baÄŸlantÄ±sÄ±nÄ± da kontrol et (snapshot gelmese bile)
        if (mpLobby) mpCheckOpponentConnections(mpLobby);
      }, MP_HEARTBEAT_INTERVAL);
    }

    function mpStopHeartbeat() {
      if (_mpHeartbeatInterval) { clearInterval(_mpHeartbeatInterval); _mpHeartbeatInterval = null; }
    }

    // â”€â”€ DÄ°SCONNECT DETECTION: rakibin lastSeen'ini kontrol et â”€â”€
    // snapshot handler'dan Ã§aÄŸrÄ±lÄ±r
    function mpCheckOpponentConnections(lobbyData) {
      if (!mpGameActive || !currentUser || lobbyData.isBot) return;
      const players = lobbyData.players || {};
      const lastSeen = lobbyData.lastSeen || {};
      const now = Date.now();

      Object.keys(players).forEach(username => {
        if (username === currentUser.username) return; // kendimizi kontrol etme

        const seen = lastSeen[username] || 0;
        const isDisconnected = seen > 0 && (now - seen) > MP_DISCONNECT_TIMEOUT;
        const neverSeen = seen === 0; // henÃ¼z hiÃ§ heartbeat atmamÄ±ÅŸ (oyun yeni baÅŸladÄ±, tolerans ver)

        if (isDisconnected) {
          // Zaten timer varsa dokunma
          if (_mpDisconnectTimers[username]) return;

          // Rakip bu turu zaten cevapladÄ±ysa timer baÅŸlatma
          const answered = lobbyData.answered || {};
          const qIdx = state.questionIndex;
          if (answered[username] === qIdx) return;

          // 10 saniye doldu, hemen "cevap vermedi" iÅŸle
          _mpHandleOpponentTimeout(username, lobbyData);
        } else {
          // BaÄŸlantÄ± geri geldi â€” timer varsa iptal et
          if (_mpDisconnectTimers[username]) {
            clearTimeout(_mpDisconnectTimers[username]);
            delete _mpDisconnectTimers[username];
            // UI'daki "baÄŸlantÄ± kesildi" gÃ¶stergesini kaldÄ±r
            mpUpdateLiveScores();
          }
        }
      });
    }

    // Rakip timeout'a dÃ¼ÅŸtÃ¼ â€” forfeit olarak iÅŸle (sadece host yapar)
    async function _mpHandleOpponentTimeout(username, lobbyData) {
      if (!mpGameActive || !mpLobbyId) return;

      // Zaten cevaplandÄ±ysa atla
      const answered = lobbyData.answered || {};
      const qIdx = state.questionIndex;
      if (answered[username] === qIdx) return;

      // Sadece host yazar â€” iki taraf aynÄ± anda yazmasÄ±n
      if (!mpIsHost) return;

      try {
        // Taze veri al, hÃ¢lÃ¢ baÄŸlantÄ±sÄ± kopuksa forfeit yaz
        const freshSnap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
        if (!freshSnap.exists) return;
        const freshData = freshSnap.data();

        // Son bir kez lastSeen kontrolÃ¼ â€” arada geri dÃ¶ndÃ¼yse iptal
        const freshLastSeen = freshData.lastSeen || {};
        const freshSeen = freshLastSeen[username] || 0;
        if (freshSeen > 0 && (Date.now() - freshSeen) <= MP_DISCONNECT_TIMEOUT) return;

        // Zaten cevapladÄ±ysa atla
        const freshAnswered = freshData.answered || {};
        if (freshAnswered[username] === qIdx) return;

        // Forfeit yaz â€” lobi finished, kazanan biz
        await db.collection('mp_lobbies').doc(mpLobbyId).update({
          status: 'finished',
          finishedAt: Date.now(),
          forfeitedBy: username
        });
      } catch (e) { console.error('Opponent timeout forfeit error:', e); }
    }

    function _startBotScoreApplication() {
      if (!mpLobby || !mpLobby.isBot) return;
      if (_botApplyInterval) clearInterval(_botApplyInterval);
      const botName = mpLobby.botName;
      const totalQ = (mpLobby.questions || []).length;

      // BaÅŸlangÄ±Ã§ bot config'ini kopyala (oyun boyunca mutate edilecek)
      const baseCfg = Object.assign({}, mpLobby.botConfig || {});
      // Dinamik ortalama: her oyun baÅŸÄ±nda orijinal deÄŸere dÃ¶ner
      let dynamicAvg = baseCfg.avgScore || 0;        // harita modlarÄ± iÃ§in
      let dynamicRate = baseCfg.rate || 0;            // flag modu iÃ§in

      // Oyuncu ve bot birikimli skorlarÄ±nÄ± takip et
      let playerTotal = 0;
      let botTotal = 0;

      _botApplyInterval = setInterval(async () => {
        if (!mpGameActive || !mpLobbyId) { clearInterval(_botApplyInterval); return; }
        const currentQ = gameMode === 'flag' ? flagState.qIndex : state.questionIndex;
        if (currentQ >= totalQ) { clearInterval(_botApplyInterval); return; }

        // Oyuncu cevap verdiyse tetikle
        const playerAnswered = gameMode === 'flag' ? flagState.answered : state.answered;
        if (!playerAnswered) return;

        // Bu soru iÃ§in bot zaten cevap verdiyse geÃ§
        const alreadyAnswered = (() => {
          try {
            const ba = mpLobby[gameMode === 'flag' ? 'flagAnswered' : 'answered'] || {};
            return ba[botName] === currentQ;
          } catch (e) { return false; }
        })();
        if (alreadyAnswered) return;

        // â”€â”€ Oyuncunun bu sorudaki puanÄ±nÄ± oku â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const playerQScore = (() => {
          try {
            return (mpLobby.qscores || {})[currentUser.username]?.['q' + currentQ] ?? null;
          } catch (e) { return null; }
        })();

        // â”€â”€ Adaptif gÃ¼Ã§ ayarÄ± (Ã¶nceki soru bittiyse) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Ä°lk soruda oyuncu skoru henÃ¼z yazÄ±lmamÄ±ÅŸ olabilir; null ise atla
        if (currentQ > 0 && playerQScore !== null) {
          const prevPlayerQ = (() => {
            try {
              const qs = mpLobby.qscores?.[currentUser.username] || {};
              // Son yazÄ±lan soru skoru
              let last = null;
              for (let qi = currentQ - 1; qi >= 0; qi--) {
                if (qs['q' + qi] !== undefined) { last = qs['q' + qi]; break; }
              }
              return last;
            } catch (e) { return null; }
          })();

          // Bir Ã¶nceki sorudaki farka gÃ¶re bot gÃ¼cÃ¼nÃ¼ ayarla
          const prevBotQ = (() => {
            try {
              return (mpLobby.qscores || {})[botName]?.['q' + (currentQ - 1)] ?? 0;
            } catch (e) { return 0; }
          })();

          if (prevPlayerQ !== null) {
            const diff = prevPlayerQ - prevBotQ; // pozitif = oyuncu Ã¶nde
            if (Math.abs(diff) > 0) {
              const pct = 0.08 + Math.random() * 0.04; // %8â€“%12 arasÄ± rastgele
              const adjustment = Math.round(diff * pct);
              if (gameMode === 'flag') {
                // Rate'i Â±0.03â€“0.05 arasÄ± ayarla, 0.05â€“0.95 sÄ±nÄ±rlarÄ± iÃ§inde tut
                const rateAdj = (diff > 0 ? 1 : -1) * (0.03 + Math.random() * 0.02);
                dynamicRate = Math.min(0.95, Math.max(0.05, dynamicRate + rateAdj));
              } else {
                dynamicAvg = Math.max(50, dynamicAvg + adjustment);
              }
            }
          }
        }

        // â”€â”€ Bu soru iÃ§in bot skorunu hesapla â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let botScore;
        if (gameMode === 'flag') {
          const correct = Math.random() < dynamicRate;
          if (correct) {
            const avgSec = baseCfg.tier === 'gold' ? 3 : baseCfg.tier === 'silver' ? 5 : 7;
            const sec = Math.max(1, Math.min(11, avgSec + (Math.random() * 4 - 2)));
            const timeLeft = Math.floor(Math.max(0, 12 - sec));
            botScore = timeLeft >= 7 ? 1000 : Math.max(0, 1000 - (7 - timeLeft) * 60);
          } else {
            botScore = 0;
          }
        } else {
          const variance = dynamicAvg * 0.3;
          botScore = Math.max(0, Math.round(dynamicAvg + (Math.random() * variance * 2 - variance)));
        }

        // Birikimli toplamÄ± hesapla
        botTotal = 0;
        for (let qi = 0; qi < currentQ; qi++) {
          botTotal += Math.round((mpLobby.qscores?.[botName]?.['q' + qi]) || 0);
        }
        botTotal += botScore;

        if (!mpLobbyId || !mpGameActive) return;
        try {
          const update = {
            [`scores.${botName}`]: botTotal,
            [`qscores.${botName}.q${currentQ}`]: botScore,
          };
          if (gameMode === 'flag') {
            update[`flagAnswered.${botName}`] = currentQ;
          } else {
            update[`answered.${botName}`] = currentQ;
          }
          await db.collection('mp_lobbies').doc(mpLobbyId).update(update);
        } catch (e) { }
      }, 80);
    }

    async function mmCreateLobbyWith(opponentName, opponentDocId) {
      // Host olarak lobi oluÅŸtur, oponenti bekle
      const mode = _mmMode;
      mpMode = mode;
      const questions = mode === 'turkey' ? pickTurkeyQuestions(MP_QUESTION_COUNT)
        : mode === 'europe' ? pickEuropeQuestions(MP_QUESTION_COUNT)
          : mode === 'flag' ? pickFlagQuestions(12)
            : pickQuestions(MP_QUESTION_COUNT);

      const lobbyData = {
        code: mpGenerateCode(),
        lobbyName: 'QUICK MATCH',
        isPrivate: false, password: '',
        hostId: currentUser.username,
        status: 'waiting',
        mode,
        isQuickMatch: true,
        maxPlayers: 2,
        questions: mode === 'flag'
          ? questions.map(q => ({ tr: q.tr, en: q.en, flag: q.flag, code: q.code || '', atr: q.atr || [], aen: q.aen || [] }))
          : questions.map(q => ({ name: q.name, name_en: q.name_en || '', country: q.country || '', city: q.city || '', lat: q.lat || 0, lon: q.lon || 0 })),
        players: { [currentUser.username]: { name: currentUser.username, score: 0, joinedAt: Date.now(), ready: true } },
        scores: {}, createdAt: Date.now()
      };

      try {
        const ref = await db.collection('mp_lobbies').add(lobbyData);
        mpLobbyId = ref.id;
        mpLobby = lobbyData;
        mpIsHost = true;
        mpMyScore = 0;
        mpQuestions = questions;
        // Oponent doc'unu gÃ¼ncelle (lobbyId ekle)
        if (opponentDocId) {
          db.collection('matchmaking').doc(opponentDocId).update({ lobbyId: ref.id }).catch(() => { });
        } else {
          const waitingSnap = await db.collection('matchmaking')
            .where('username', '==', opponentName).where('status', '==', 'matched').limit(1).get();
          waitingSnap.forEach(doc => { doc.ref.update({ lobbyId: ref.id }).catch(() => { }); });
        }
        if (_mmDocRef) { _mmDocRef.delete().catch(() => { }); _mmDocRef = null; }
        mmCleanup();
        mpSubscribeLobby();
        mpShowLobbyHost();
        // 2 kiÅŸi dolunca otomatik baÅŸlat
        const _autoStart = setInterval(async () => {
          if (!mpLobby) { clearInterval(_autoStart); return; }
          const pCount = Object.keys(mpLobby.players || {}).length;
          if (pCount >= 2) { clearInterval(_autoStart); setTimeout(() => mpStartGame(), 500); }
        }, 500);
        setTimeout(() => clearInterval(_autoStart), 30000);
      } catch (e) {
        document.getElementById('mp-mm-error').textContent = 'Lobi hatasÄ±: ' + e.message;
      }
    }

    async function mmJoinLobbyOf(hostName) {
      // Kendi matchmaking doc'unu oku (lobbyId orada)
      // Ã–NEMLÄ°: mmCleanup() _mmDocRef'i siliyor, bu yÃ¼zden Ã¶nce lobbyId'yi oku
      let lobbyId = null;
      const myDocRef = _mmDocRef; // referansÄ± sakla, cleanup'tan Ã¶nce
      if (myDocRef) {
        try {
          // Biraz bekle host lobi oluÅŸturup lobbyId yazsÄ±n (max 6 saniye)
          for (let i = 0; i < 12; i++) {
            const mySnap = await myDocRef.get();
            if (mySnap.exists && mySnap.data().lobbyId) { lobbyId = mySnap.data().lobbyId; break; }
            await new Promise(r => setTimeout(r, 500));
          }
        } catch (e) { }
      }
      // lobbyId okunduktan SONRA temizle
      clearInterval(_mmInterval); _mmInterval = null;
      if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
      if (myDocRef) { myDocRef.delete().catch(() => { }); _mmDocRef = null; }
      try {
        if (lobbyId) {
          const docSnap = await db.collection('mp_lobbies').doc(lobbyId).get();
          if (docSnap.exists && docSnap.data().status === 'waiting') { await _mpDoJoin(docSnap, ''); return; }
        }
        // Fallback: hostId ile ara (biraz daha bekle, host lobi oluÅŸturuyor olabilir)
        for (let attempt = 0; attempt < 4; attempt++) {
          const snap = await db.collection('mp_lobbies')
            .where('hostId', '==', hostName).where('status', '==', 'waiting').where('isQuickMatch', '==', true).limit(1).get();
          if (!snap.empty) { await _mpDoJoin(snap.docs[0], ''); return; }
          if (attempt < 3) await new Promise(r => setTimeout(r, 1000));
        }
        const errEl = document.getElementById('mp-mm-error');
        if (errEl) errEl.textContent = lang === 'en' ? 'Could not find lobby.' : 'Lobi bulunamadÄ±.';
        setTimeout(mpShowMain, 2000);
      } catch (e) {
        const errEl = document.getElementById('mp-mm-error');
        if (errEl) errEl.textContent = 'KatÄ±lÄ±m hatasÄ±: ' + e.message;
        setTimeout(mpShowMain, 2000);
      }
    }

   function mmCancel() {
  clearInterval(_mmInterval);
  
  // YENÄ°: agent'Ä±n listener ve kuyruk kaydÄ±nÄ± da temizle
  if (window.FirestoreMatchmakingAgent) {
    FirestoreMatchmakingAgent.cancel();
  }
  
  mmCleanup();
  mpShowMain();
}

    function mmCleanup() {
      clearInterval(_mmInterval); _mmInterval = null;
      if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
      if (_mmDocRef) { _mmDocRef.delete().catch(() => { }); _mmDocRef = null; }
    }

    function mpShowBrowse() {
      ['mp-screen-main', 'mp-screen-create', 'mp-screen-join', 'mp-screen-lobby-host', 'mp-screen-lobby-guest'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      document.getElementById('mp-screen-browse').style.display = 'block';
      document.getElementById('mp-browse-error').textContent = '';
      document.getElementById('mp-browse-pw-box').style.display = 'none';
      _mpBrowsePendingDoc = null;
      mpRefreshBrowse();
    }

    async function mpRefreshBrowse() {
      const listEl = document.getElementById('mp-lobby-list');
      const emptyEl = document.getElementById('mp-browse-empty');
      listEl.innerHTML = '<div class="mp-lobby-empty">AranÄ±yorâ€¦</div>';
      document.getElementById('mp-browse-error').textContent = '';
      document.getElementById('mp-browse-pw-box').style.display = 'none';
      _mpBrowsePendingDoc = null;
      if (!db) { listEl.innerHTML = '<div class="mp-lobby-empty">BaÄŸlantÄ± hatasÄ±</div>'; return; }
      try {
        const snap = await db.collection('mp_lobbies')
          .where('status', '==', 'waiting')
          .limit(20)
          .get();
        const modeEmoji = { world: 'ğŸŒ', europe: 'ğŸ‡ªğŸ‡º', turkey: 'ğŸ‡¹ğŸ‡·', flag: 'ğŸš©' };
        listEl.innerHTML = '';
        // Client-side sort + eski lobileri filtrele (30dk+)
        const now = Date.now();
        const docs = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (now - (d.createdAt || 0) < 30 * 60 * 1000) docs.push(doc); // 30dk
        });
        docs.sort((a, b) => (b.data().createdAt || 0) - (a.data().createdAt || 0));
        if (!docs.length) { listEl.innerHTML = '<div class="mp-lobby-empty">' + (lang === 'en' ? 'No open lobbies right now ğŸ˜´' : 'Åu an aÃ§Ä±k lobi yok ğŸ˜´') + '</div>'; return; }
        docs.forEach(doc => {
          const d = doc.data();
          if (d.hostId === currentUser?.username) return; // kendi lobiyi gÃ¶sterme
          const pCount = Object.keys(d.players || {}).length;
          const locked = d.isPrivate;
          const name = d.lobbyName || d.code || '???';
          const mode = modeEmoji[d.mode] || 'ğŸŒ';
          const card = document.createElement('div');
          card.className = 'mp-lobby-card' + (locked ? ' locked' : '');
          card.innerHTML =
            '<div><div class="mp-lobby-card-name">' + mode + ' ' + name + '</div>'
            + '<div class="mp-lobby-card-info">Host: ' + d.hostId + '</div></div>'
            + '<div class="mp-lobby-card-right">'
            + '<span class="mp-lobby-card-players">' + pCount + '/5</span>'
            + '<span class="mp-lobby-card-lock">' + (locked ? 'ğŸ”’' : 'ğŸ”“') + '</span>'
            + '</div>';
          card.onclick = () => mpBrowseSelectLobby(doc, locked);
          listEl.appendChild(card);
        });
        if (!listEl.children.length) listEl.innerHTML = '<div class="mp-lobby-empty">' + (lang === 'en' ? 'No lobbies available to join' : 'KatÄ±labileceÄŸin lobi yok') + '</div>';
      } catch (e) {
        listEl.innerHTML = '<div class="mp-lobby-empty">' + (lang === 'en' ? 'Load error: ' : 'YÃ¼kleme hatasÄ±: ') + e.message + '</div>';
      }
    }

    function mpBrowseSelectLobby(doc, locked) {
      document.getElementById('mp-browse-error').textContent = '';
      if (!locked) {
        // DoÄŸrudan gir
        const btn = document.getElementById('mp-browse-refresh');
        btn.disabled = true;
        _mpDoJoin(doc, '').catch(e => {
          document.getElementById('mp-browse-error').textContent = e.message;
          btn.disabled = false;
        }).then(() => { btn.disabled = false; });
      } else {
        // Åifre kutusu aÃ§
        _mpBrowsePendingDoc = doc;
        const d = doc.data();
        document.getElementById('mp-browse-pw-label').textContent = 'ğŸ”’ "' + (d.lobbyName || d.code) + '" ÅŸifreli â€” ÅŸifreyi gir';
        document.getElementById('mp-browse-pw-input').value = '';
        document.getElementById('mp-browse-pw-box').style.display = 'block';
        document.getElementById('mp-browse-pw-input').focus();
      }
    }

    async function mpBrowseJoinWithPw() {
      if (!_mpBrowsePendingDoc) return;
      const pw = document.getElementById('mp-browse-pw-input').value.trim();
      const btn = document.querySelector('#mp-browse-pw-box .mp-btn');
      btn.disabled = true; btn.textContent = 'â€¦';
      try {
        await _mpDoJoin(_mpBrowsePendingDoc, pw);
      } catch (e) {
        document.getElementById('mp-browse-error').textContent = e.message;
        btn.disabled = false; btn.textContent = 'âœ“ GÄ°R';
      }
    }

    function mpBrowseCancelPw() {
      document.getElementById('mp-browse-pw-box').style.display = 'none';
      _mpBrowsePendingDoc = null;
    }

    function mpSubscribeLobby() {
      if (mpUnsubscribe) mpUnsubscribe();
      mpUnsubscribe = db.collection('mp_lobbies').doc(mpLobbyId).onSnapshot(snap => {
        if (!snap.exists) {
          // Lobi silindi â€” sadece guest'e mesaj gÃ¶ster
          if (mpIsHost) { mpCleanup(); return; }
          const wasPlaying = mpGameActive;
          const wasFlag = (gameMode === 'flag');
          mpCleanup();
          if (wasFlag) hideFlagScreen();
          else if (wasPlaying) { stopTimer(); document.getElementById('mp-live-scores').style.display = 'none'; }
          goToWelcome();
          setTimeout(() => {
            const msg = lang === 'en' ? 'Host left â€” lobby closed.' : 'Lobi sahibi ayrÄ±ldÄ±, lobi kapatÄ±ldÄ±.';
            const errEl = document.getElementById('mp-main-error');
            openMultiplayerMenu();
            if (errEl) { errEl.textContent = msg; setTimeout(() => { errEl.textContent = ''; }, 4000); }
          }, 200);
          return;
        }
        const prevLobby = mpLobby;
        mpLobby = snap.data();
        mpQuestions = mpLobby.questions;

        // BaÄŸlantÄ± kopma kontrolÃ¼ (bot maÃ§Ä±nda deÄŸil, oyun aktifken)
        if (mpGameActive && !mpLobby.isBot) {
          mpCheckOpponentConnections(mpLobby);
        }


        if (mpLobby.status === 'waiting') {
          // SonuÃ§ ekranÄ± aÃ§Ä±ksa kapat â†’ lobi ekranÄ±na dÃ¶n (Yeni Oyun sonrasÄ±)
          if (document.getElementById('mp-result-overlay').classList.contains('show')) {
            document.getElementById('mp-result-overlay').classList.remove('show');
            if (mpIsHost) mpShowLobbyHost(); else mpShowLobbyGuest();
          }
          mpUpdatePlayerList();
        } else if (mpLobby.status === 'playing' && !mpGameActive) {
          // Oyun ilk baÅŸlÄ±yor
          mpStartMultiplayerGame();
        } else if (mpLobby.status === 'playing' && mpGameActive) {
          const newQ = mpLobby.currentQuestion || 0;
          const showScoresQ = mpLobby.showScores;
          const advanceAt = mpLobby.advanceAt || null;

          // showScores yazÄ±ldÄ± â†’ herkes skor tablosunu aÃ§ (-1 baÅŸlangÄ±Ã§ deÄŸeri, atla)
          if (showScoresQ !== undefined && showScoresQ >= 0 && showScoresQ === state.questionIndex) {
            const betweenEl = document.getElementById('mp-between-overlay');
            if (!betweenEl.classList.contains('show')) {
              mpShowBetweenLeaderboard(advanceAt);
            }
          }

          // currentQuestion arttÄ± â†’ sonraki soruya geÃ§ (herkes, sadece ilerleme)
          if (newQ > state.questionIndex) {
            if (window._mpCountdownInterval) { clearInterval(window._mpCountdownInterval); window._mpCountdownInterval = null; }
            mpCancelAdvance();
            mpShowScoresWriting = false;
            mpAdvancing = false;
            document.getElementById('mp-between-overlay').classList.remove('show');
            state.questionIndex = newQ;
            mpLoadQuestion();
          }

          // Skor tablosu aÃ§Ä±ksa iÃ§eriÄŸi gÃ¼ncelle
          if (document.getElementById('mp-between-overlay').classList.contains('show')) {
            mpRefreshBetweenScores();
          }
          mpUpdateLiveScores();
          // Bayrak modu gÃ¼ncelleme
          if (gameMode === 'flag') mpHandleFlagUpdate(mpLobby);

          // Bot maÃ§Ä±nda: bot cevap verince "herkes cevapladÄ±" kontrolÃ¼ yap
          if (mpLobby.isBot && mpGameActive && state.answered && mpLobby.showScores !== state.questionIndex) {
            const answered = mpLobby.answered || {};
            const players = Object.keys(mpLobby.players || {});
            const qIdx = state.questionIndex;
            const allAnswered = players.length > 0 && players.every(n => answered[n] === qIdx);
            if (allAnswered) {
              // En az 2.5 saniye doÄŸru cevabÄ± gÃ¶ster, sonra skor tablosuna geÃ§
              setTimeout(() => { if (mpGameActive) mpNextQuestion(); }, 2500);
            }
          }
        } else if (mpLobby.status === 'finished') {
          document.getElementById('mp-between-overlay').classList.remove('show');
          mpGameActive = false;
          if (gameMode === 'flag') {
            if (flagState.nextCountdown) clearInterval(flagState.nextCountdown);
            hideFlagScreen();
            mpShowResults();
          } else {
            stopTimer();
            document.getElementById('mp-live-scores').classList.remove('show');
            mpShowResults();
          }
        }
      }, err => console.error('MP listener error:', err));
    }

    function mpShowLobbyHost() {
      // Lobi adÄ±nÄ± baÅŸlÄ±ÄŸa yaz
      const h2 = document.getElementById('mp-lobby-h2');
      if (h2 && mpLobby?.lobbyName) h2.textContent = 'ğŸ  ' + mpLobby.lobbyName;
      // Lobi mod butonlarÄ±nÄ± senkronize et
      ['world', 'turkey', 'flag'].forEach(id => {
        const btn = document.getElementById('lobby-mode-' + id);
        if (btn) btn.classList.toggle('active', id === mpMode);
      });
      const labels = { world: 'ğŸŒ DÃœNYA', europe: 'ğŸ‡ªğŸ‡º AVRUPA', turkey: 'ğŸ‡¹ğŸ‡· TÃœRKÄ°YE', flag: 'ğŸš© BAYRAKLAR' };
      const labelsEn = { world: 'ğŸŒ WORLD', europe: 'ğŸ‡ªğŸ‡º EUROPE', turkey: 'ğŸ‡¹ğŸ‡· TURKEY', flag: 'ğŸš© FLAGS' };
      const lbl = document.getElementById('lobby-mode-label');
      if (lbl) lbl.textContent = lang === 'tr' ? (labels[mpMode] || mpMode) : (labelsEn[mpMode] || mpMode);
      ['mp-screen-main', 'mp-screen-create', 'mp-screen-join', 'mp-screen-lobby-guest'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      document.getElementById('mp-screen-lobby-host').style.display = 'block';
      // Åifreli lobide kodu gÃ¶ster, ÅŸifresiz lobide gizle
      const codeWrap = document.getElementById('mp-lobby-code-display');
      if (codeWrap) {
        if (mpLobby.isPrivate) {
          codeWrap.textContent = mpLobby.code;
          codeWrap.style.display = 'block';
        } else {
          codeWrap.style.display = 'none';
        }
      }
      const lobbySub = document.getElementById('mp-lobby-sub');
      if (lobbySub) {
        lobbySub.textContent = mpLobby.isPrivate
          ? (lang === 'en' ? 'Share code or name with friends' : 'Kodu veya lobi adÄ±nÄ± arkadaÅŸlarÄ±nla paylaÅŸ')
          : (lang === 'en' ? 'Friends can find you in Active Lobbies' : 'ArkadaÅŸlarÄ±n Aktif Lobiler\u2019den bulabilir');
      }
      mpUpdatePlayerList();
    }

    function mpShowLobbyGuest() {
      ['mp-screen-main', 'mp-screen-create', 'mp-screen-join', 'mp-screen-lobby-host'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      document.getElementById('mp-screen-lobby-guest').style.display = 'block';
      document.getElementById('mp-guest-sub').textContent = t('mpGuestSub', mpLobby.code, mpLobby.mode);
      mpUpdatePlayerList();
    }

    function mpUpdatePlayerList() {
      if (!mpLobby) return;
      const players = mpLobby.players || {};
      const playerArr = Object.values(players).sort((a, b) => a.joinedAt - b.joinedAt);
      const count = playerArr.length;

      // Host ekranÄ±
      const hostList = document.getElementById('mp-host-player-list');
      const guestList = document.getElementById('mp-guest-player-list');
      const html = playerArr.map(p => `
    <div class="mp-player-row">
      <div class="mp-player-avatar">${p.name[0].toUpperCase()}</div>
      <div class="mp-player-name">${p.name}${p.name === mpLobby.hostId ? ' <span class="mp-player-host">HOST</span>' : ''}</div>
      <div class="mp-player-ready ready"></div>
    </div>`).join('');

      if (hostList) hostList.innerHTML = html;
      if (guestList) guestList.innerHTML = html;

      const statusText = t('mpPlayerCount', count, mpLobby.mode);
      const hostStatus = document.getElementById('mp-host-status');
      const guestStatus = document.getElementById('mp-guest-status');
      if (hostStatus) hostStatus.textContent = statusText;
      if (guestStatus) guestStatus.textContent = statusText;

      // BaÅŸlat butonu: min 2, max 5 kiÅŸi
      const startBtn = document.getElementById('mp-start-btn');
      if (startBtn) {
        startBtn.disabled = count < 2;
        startBtn.style.opacity = count < 2 ? '0.5' : '1';
        startBtn.textContent = t('mpStartBtn', count);
      }
    }

    function mpCopyCode() {
      if (!mpLobby) return;
      navigator.clipboard.writeText(mpLobby.code).then(() => {
        const el = document.getElementById('mp-lobby-code-display');
        const prev = el.textContent;
        el.textContent = t('mpCopied');
        setTimeout(() => { el.textContent = prev; }, 1200);
      }).catch(() => { });
    }

    async function mpStartGame() {
      if (!mpIsHost || !mpLobbyId) return;
      if (mpStartGame._inProgress) return;
      mpStartGame._inProgress = true;
      const playerCount = Object.keys(mpLobby.players || {}).length;
      if (playerCount < 2) { alert(t('mpErrMin2')); return; }

      try {
        // Firebase'den gÃ¼ncel mode'u oku (mpLobbySetMode ile deÄŸiÅŸmiÅŸ olabilir)
        const freshSnap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
        const currentMode = freshSnap.exists ? (freshSnap.data().mode || mpMode || 'world') : (mpMode || 'world');
        mpMode = currentMode;

        // Moda gÃ¶re taze sorular oluÅŸtur
        const questions = currentMode === 'turkey' ? pickTurkeyQuestions(MP_QUESTION_COUNT)
          : currentMode === 'europe' ? pickEuropeQuestions(MP_QUESTION_COUNT)
            : currentMode === 'flag' ? pickFlagQuestions(12)
              : pickQuestions(MP_QUESTION_COUNT);

        const questionsForFirebase = currentMode === 'flag'
          ? questions.map(q => ({ tr: q.tr, en: q.en, flag: q.flag, code: q.code || '', atr: q.atr || [], aen: q.aen || [] }))
          : questions.map(q => ({ name: q.name, name_en: q.name_en || '', country: q.country || '', city: q.city || '', lat: q.lat || 0, lon: q.lon || 0 }));

        await db.collection('mp_lobbies').doc(mpLobbyId).update({
          status: 'playing',
          mode: currentMode,
          questions: questionsForFirebase,
          startedAt: Date.now(),
          currentQuestion: 0,
          showScores: -1,
          advanceAt: 0,
          photoReady: {},
          photoReadyAt: null,
          flagQuestion: 0,
          flagAnswered: {},
          flagStartAt: 0,
          scores: {},
          qscores: {},
          answered: {}
        });
        // listener mpStartMultiplayerGame'i tetikleyecek
      } catch (e) { console.error('Start error:', e); }
      finally { mpStartGame._inProgress = false; }
    }

    async function mpStartMultiplayerGame() {
      if (mpGameActive) return;
      mpGameActive = true;
      mpCurrentQ = 0;
      mpMyScore = 0;
      mpQuestions = mpLobby.questions;
      mpMode = mpLobby.mode;

      // mode hÃ¢lÃ¢ undefined ise Firebase'den taze oku
      if (!mpMode) {
        try {
          const freshSnap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
          if (freshSnap.exists) {
            const freshData = freshSnap.data();
            mpMode = freshData.mode || 'world';
            mpLobby = freshData;
            mpQuestions = freshData.questions;
          }
        } catch (e) { console.error('mpStartMultiplayerGame fresh read error:', e); }
      }
      if (!mpMode) mpMode = 'world'; // son gÃ¼venlik aÄŸÄ±

      // Modali kapat, oyunu baÅŸlat
      document.getElementById('mp-modal').classList.remove('open');
      document.getElementById('welcome-modal').style.display = 'none';

      // Oyun modunu ayarla
      gameMode = mpMode;

      // State'i multiplayer moduna al (seviye kavramÄ± yok, dÃ¼z 12 soru)
      state.level = 1;
      state.levelScore = 0;
      state.totalScore = 0;
      state.questionIndex = 0;
      state.questions = mpQuestions;
      state.answered = false;
      state.combo = 0;

      // Overlay'leri kapat
      const ov = document.getElementById('overlay');
      if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }

      // HaritayÄ± gÃ¶ster
      clearMarkers();
      if (gameMode === 'turkey') {
        document.getElementById('world-svg').style.display = 'none';
        document.getElementById('turkey-svg').style.display = 'block';
        document.getElementById('europe-svg').style.display = 'none';
        if (!turkeyMapLoaded) loadTurkeyMap();
      } else if (gameMode === 'europe') {
        document.getElementById('world-svg').style.display = 'none';
        document.getElementById('turkey-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'block';
        focusEuropeMap(false);
        // Online mod iÃ§in: harita zaten yÃ¼klÃ¼yse handler'Ä± hemen baÄŸla
        if (europeMapLoaded) _bindEuropeClickHandler();
      } else {
        document.getElementById('world-svg').style.display = 'block';
        document.getElementById('turkey-svg').style.display = 'none';
        document.getElementById('europe-svg').style.display = 'none';
      }

      // Bayrak modu â€” ayrÄ± ekran
      if (gameMode === 'flag') {
        // Lobby'deki sorulardan FLAG_COUNTRIES objelerini restore et
        // Firebase'de kod+tr+en+flag+atr+aen var â€” direkt kullan, atr/aen eksikse FLAG_COUNTRIES'ten tamamla
        const lobbyQs = (mpLobby.questions || []).map(q => {
          // code ile kesin eÅŸleÅŸtir
          const found = q.code
            ? FLAG_COUNTRIES.find(c => c.code === q.code)
            : FLAG_COUNTRIES.find(c => c.en === q.en && c.tr === q.tr);
          if (found) return found; // orijinal objeyi kullan (atr/aen tam)
          // Yoksa Firebase verisini direkt kullan (atr/aen zaten var)
          return q;
        });
        flagState.questions = lobbyQs;
        flagState.qIndex = 0;
        flagState.myScore = 0;
        flagState.answered = false;
        flagState.solo = false;
        flagState._allAnsweredTriggered = false;
        showFlagScreen();
        flagLoadQuestion();
        // Bot maÃ§Ä± ise flag bot uygulamasÄ±nÄ± baÅŸlat
        if (mpLobby && mpLobby.isBot) {
          setTimeout(_startBotScoreApplication, 500);
        }
        // Heartbeat baÅŸlat (bot maÃ§Ä±nda deÄŸil)
        mpStartHeartbeat();
        return;
      }

      mpShowLiveScores();
      // Bot maÃ§Ä± ise bot skor uygulamasÄ±nÄ± baÅŸlat
      if (mpLobby && mpLobby.isBot) {
        setTimeout(_startBotScoreApplication, 500);
      }
      // Heartbeat baÅŸlat (bot maÃ§Ä±nda deÄŸil)
      mpStartHeartbeat();
      mpLoadQuestion();
    }

    function mpShowLiveScores() {
      if (!mpLobby) return;
      const liveEl = document.getElementById('mp-live-scores');
      liveEl.classList.add('show');
      // MP aktifken topbar'daki offline elemanlarÄ± gizle
      const levelBadge = document.getElementById('level-badge');
      const qDots = document.getElementById('q-dots');
      const scoreBox = document.querySelector('.bar-section:nth-of-type(2)');
      if (levelBadge) levelBadge.style.display = 'none';
      if (qDots) qDots.style.display = 'none';
      mpUpdateLiveScores();
    }

    function mpUpdateLiveScores() {
      if (!mpLobby) return;
      const liveEl = document.getElementById('mp-live-scores');
      const players = mpLobby.players || {};
      const scores = mpLobby.scores || {};
      const lastSeen = mpLobby.lastSeen || {};
      const now = Date.now();
      const playerArr = Object.values(players).sort((a, b) => {
        const sa = scores[a.name] || 0;
        const sb = scores[b.name] || 0;
        return sb - sa;
      });
      liveEl.innerHTML = playerArr.map(p => {
        const isMe = p.name === currentUser.username;
        const sc = scores[p.name] || 0;
        const seen = lastSeen[p.name] || 0;
        const isDisconnected = !isMe && seen > 0 && (now - seen) > MP_DISCONNECT_TIMEOUT;
        const disconnectIcon = isDisconnected ? ' ğŸ“¡' : '';
        return `<div class="mp-live-player${isMe ? ' me' : ''}${isDisconnected ? ' disconnected' : ''}">
      <div class="lp-name">${isMe ? 'â­' + p.name : p.name}${disconnectIcon}</div>
      <div class="lp-score">${sc}</div>
    </div>`;
      }).join('<div style="color:#1e2d45;font-size:.8rem;">|</div>');
    }

    function mpLoadQuestion() {
      if (!mpGameActive) return;
      state.answered = false;
      clearMarkers();
      downX = null; downY = null;

      // Bir Ã¶nceki sorudan kalan toast ve DEVAM butonunu temizle
      const toast = document.getElementById('result-toast');
      toast.classList.remove('show');
      toast.style.display = 'none';
      const nextBtn = document.getElementById('btn-next-q');
      nextBtn.style.display = 'none'; // MP'de buton yok â€” geÃ§iÅŸ otomatik

      const city = state.questions[state.questionIndex];
      if (!city) { mpEndGame(); return; }

      if (gameMode === 'turkey') {
        document.getElementById('city-name').textContent = city.name.toUpperCase();
        document.getElementById('city-country').textContent = (city.city || '').toUpperCase();
        document.getElementById('question-text').textContent = t('markDistrict');
      } else {
        document.getElementById('city-name').textContent = cityDisplayName(city).toUpperCase();
        document.getElementById('city-country').textContent = countryDisplayName(city).toUpperCase();
        document.getElementById('question-text').textContent = t('markCity');
      }

      // Topbar gÃ¼ncelle
      document.getElementById('level-badge').textContent = 'âš”ï¸ MULTI';
      document.getElementById('score-display').textContent = mpMyScore;
      document.getElementById('target-display').textContent = `${state.questionIndex + 1}/${state.questions.length}`;
      document.getElementById('progress-bar-fill').style.width = ((state.questionIndex / state.questions.length) * 100) + '%';
      // Hamburger menÃ¼yÃ¼ gizle
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = (typeof mpGameActive !== 'undefined' && mpGameActive) ? '' : 'none';
      document.getElementById('progress-text').textContent = `${lang === 'tr' ? 'Soru' : 'Q'} ${state.questionIndex + 1} / ${state.questions.length}`;

      // Q dots
      const dots = document.getElementById('q-dots');
      dots.innerHTML = '';
      for (let i = 0; i < state.questions.length; i++) {
        const d = document.createElement('div');
        d.className = 'q-dot' + (i < state.questionIndex ? ' done' : i === state.questionIndex ? ' active' : '');
        dots.appendChild(d);
      }

      if (gameMode !== 'turkey' && gameMode !== 'europe') {
        svgEl.transition().duration(200).call(zoomBehavior.transform, d3.zoomIdentity);
      }
      if (gameMode === 'europe' && europeZoom) {
        europeSvgEl.transition().duration(200).call(europeZoom.transform, d3.zoomIdentity);
        // Her soru baÅŸÄ±nda Europe handler'Ä±nÄ± yeniden baÄŸla (online mod iÃ§in kritik)
        _bindEuropeClickHandler();
      }
      startTimer();
    }
    async function mpSubmitAnswer(finalScore) {
      mpMyScore += finalScore;
      if (!mpLobbyId) return;
      const qIdx = state.questionIndex;
      try {
        await db.collection('mp_lobbies').doc(mpLobbyId).update({
          [`scores.${currentUser.username}`]: mpMyScore,
          [`qscores.${currentUser.username}.q${qIdx}`]: finalScore,
          [`answered.${currentUser.username}`]: qIdx
        });
      } catch (e) { console.error('Score update error:', e); }
      mpUpdateLiveScores();

      // Herkes cevapladÄ± mÄ±? â†’ erken geÃ§ (her oyuncu kontrol eder, ilk yazan kazanÄ±r)
      if (mpLobbyId) {
        try {
          const freshSnap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
          if (freshSnap.exists) {
            const freshData = freshSnap.data();
            const players = freshData.players || {};
            const answered = freshData.answered || {};
            const playerNames = Object.keys(players);
            const allAnswered = playerNames.length > 0 &&
              playerNames.every(name => answered[name] === qIdx);
            if (allAnswered && freshData.showScores !== qIdx) {
              stopTimer();
              state.answered = true;
              // En az 2.5 saniye doÄŸru cevabÄ± gÃ¶ster, sonra skor tablosuna geÃ§
              setTimeout(() => { if (mpGameActive) mpNextQuestion(); }, 2500);
            }
          }
        } catch (e) { console.error('Early advance check error:', e); }
      }
    }

    let mpShowScoresWriting = false; // aynÄ± anda birden fazla yazÄ±mÄ± engelle

    function mpNextQuestion() {
      if (!mpGameActive) return;
      if (document.getElementById('mp-between-overlay').classList.contains('show')) return;
      if (mpShowScoresWriting) return;
      if (!mpLobbyId) return;

      downX = null; downY = null;
      stopTimer();
      const toast = document.getElementById('result-toast');
      toast.classList.remove('show');
      toast.style.display = 'none';

      const qIdx = state.questionIndex;
      const advanceAt = Date.now() + 5000;

      mpShowScoresWriting = true;
      db.collection('mp_lobbies').doc(mpLobbyId).get().then(snap => {
        if (!snap.exists) { mpShowScoresWriting = false; return; }
        const data = snap.data();
        if (data.showScores === qIdx) { mpShowScoresWriting = false; return; }
        return db.collection('mp_lobbies').doc(mpLobbyId).update({
          showScores: qIdx,
          advanceAt: advanceAt
        });
      }).catch(e => console.error('showScores write error:', e))
        .finally(() => { mpShowScoresWriting = false; });
    }

    let mpAdvanceTimer = null;

    function mpCancelAdvance() {
      if (mpAdvanceTimer) { clearTimeout(mpAdvanceTimer); mpAdvanceTimer = null; }
    }

    let mpAdvancing = false; // Ã§ift advance engelleyici

    async function mpHostAdvance() {
      if (!mpLobbyId) return;
      if (mpAdvancing) return;
      mpCancelAdvance();
      mpAdvancing = true;

      const nextQ = state.questionIndex + 1;
      const isFinal = nextQ >= state.questions.length;
      document.getElementById('mp-between-overlay').classList.remove('show');

      try {
        if (isFinal) {
          await mpEndGame();
        } else {
          const snap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
          if (snap.exists && (snap.data().currentQuestion || 0) < nextQ) {
            await db.collection('mp_lobbies').doc(mpLobbyId).update({
              currentQuestion: nextQ,
              showScores: -1,
              advanceAt: 0,
              status: 'playing',
              answeredReset: Date.now(),
              photoReady: {},
              photoReadyAt: null
            });
          }
        }
      } catch (e) { console.error('Advance error:', e); }
      finally { mpAdvancing = false; }
    }

    function mpRenderBetweenList(qIdx) {
      const scores = mpLobby.scores || {};
      const qscores = mpLobby.qscores || {};
      const players = mpLobby.players || {};
      const playerArr = Object.values(players).sort((a, b) =>
        (scores[b.name] || 0) - (scores[a.name] || 0)
      );
      const rankEmojis = ['ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰'];
      return playerArr.map((p, i) => {
        const isMe = p.name === currentUser.username;
        const total = scores[p.name] || 0;
        const thisQ = (qscores[p.name] && qscores[p.name][`q${qIdx}`] !== undefined)
          ? qscores[p.name][`q${qIdx}`] : 'â€”';
        const thisQStr = thisQ === 'â€”' ? t('mpNoAns') : t('mpThisQ', thisQ);
        return `<div class="mp-bq-row${isMe ? ' me' : ''}">
      <div class="mp-bq-rank">${rankEmojis[i] || '#' + (i + 1)}</div>
      <div class="mp-bq-name" style="${isMe ? 'color:var(--accent);font-weight:700' : ''}">${p.name}${isMe ? ' ' + t('mpYou') : ''}</div>
      <div class="mp-bq-scores">
        <div class="mp-bq-total">${total.toLocaleString()}</div>
        <div class="mp-bq-this">${thisQStr}</div>
      </div>
    </div>`;
      }).join('');
    }

    function mpRefreshBetweenScores() {
      if (!mpLobby) return;
      const qIdx = state.questionIndex;
      document.getElementById('mp-bq-list').innerHTML = mpRenderBetweenList(qIdx);
    }

    function mpShowBetweenLeaderboard(advanceAt) {
      if (!mpLobby) return;
      const qIdx = state.questionIndex;
      const isFinal = (qIdx + 1) >= state.questions.length;
      const qNum = qIdx + 1;
      const total = state.questions.length;

      document.getElementById('mp-bq-list').innerHTML = mpRenderBetweenList(qIdx);
      document.getElementById('mp-bq-title').textContent = isFinal ? t('mpBetweenFinal') : t('mpBetweenQ', qNum);
      document.getElementById('mp-bq-sub').textContent = isFinal ? t('mpBetweenFinalSub', total) : t('mpBetweenSub', qNum, total);

      const nextBtn = document.getElementById('mp-bq-next-btn');
      const waitMsg = document.getElementById('mp-bq-waiting');
      nextBtn.style.display = 'none';
      waitMsg.style.display = 'block';

      // Geri sayÄ±m: advanceAt timestamp'e gÃ¶re senkronize
      if (window._mpCountdownInterval) { clearInterval(window._mpCountdownInterval); window._mpCountdownInterval = null; }

      const target = advanceAt || (Date.now() + 5000);
      const updateCountdown = () => {
        const remaining = Math.ceil((target - Date.now()) / 1000);
        if (remaining > 0) {
          waitMsg.textContent = isFinal
            ? (lang === 'tr' ? 'SonuÃ§lar hesaplanÄ±yorâ€¦' : 'Calculating resultsâ€¦')
            : (lang === 'tr' ? `Sonraki soru ${remaining} saniye sonraâ€¦` : `Next question in ${remaining} secondsâ€¦`);
        } else {
          waitMsg.textContent = isFinal
            ? (lang === 'tr' ? 'SonuÃ§lar hesaplanÄ±yorâ€¦' : 'Calculating resultsâ€¦')
            : (lang === 'tr' ? 'GeÃ§iliyorâ€¦' : 'Moving onâ€¦');
          clearInterval(window._mpCountdownInterval);
          window._mpCountdownInterval = null;
        }
      };
      updateCountdown();
      window._mpCountdownInterval = setInterval(updateCountdown, 250);

      // 5 sn sonra hepsi ilerler ama sadece biri Firebase'e yazar (mpHostAdvance iÃ§inde kontrol var)
      mpCancelAdvance();
      const delay = Math.max(0, target - Date.now());
      mpAdvanceTimer = setTimeout(() => { mpAdvanceTimer = null; mpHostAdvance(); }, delay);

      document.getElementById('mp-between-overlay').classList.add('show');
    }

    async function mpEndGame() {
      if (!mpLobbyId) return;
      try {
        const snap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
        if (!snap.exists || snap.data().status === 'finished') return;
        await db.collection('mp_lobbies').doc(mpLobbyId).update({
          status: 'finished',
          finishedAt: Date.now()
        });
      } catch (e) { console.error('Finish error:', e); }
    }

    let _mpResultsShownForLobby = null; // aynÄ± lobi iÃ§in iki kez Ã§alÄ±ÅŸmasÄ±n

    function mpShowResults() {
  // AynÄ± lobi iÃ§in iki kez Ã§alÄ±ÅŸma
  if (_mpResultsShownForLobby && _mpResultsShownForLobby === mpLobbyId) return;
  _mpResultsShownForLobby = mpLobbyId;

  // Multiplayer oyun bitiminde interstitial reklam gÃ¶ster
  maybeShowInterstitialAfterGame(() => {
    // Reklam sonrasÄ± sonuÃ§larÄ± gÃ¶ster
    _showMpResultsInternal();
  }, true);
}

function _showMpResultsInternal() {
  // Forfeit durumu: ELO sadece burada gÃ¼ncellenir
  // - Forfeit eden kiÅŸi mpForfeitAndExit'te zaten updateRankAfterMatch(false) Ã§aÄŸÄ±rdÄ± â†’ burada atlÄ±yoruz
  // - KarÅŸÄ± oyuncu (kazanan) burada updateRankAfterMatch(true) Ã§aÄŸÄ±rÄ±r
  const iForfeited = mpLobby && mpLobby.forfeitedBy && currentUser &&
      mpLobby.forfeitedBy === currentUser.username;
  const opponentForfeited = mpLobby && mpLobby.forfeitedBy && currentUser &&
      mpLobby.forfeitedBy !== currentUser.username && !mpLobby.isBot;

  if (opponentForfeited) {
    const mode = mpLobby.mode || 'world';
    updateRankAfterMatch(true, mode).catch(e => console.error('Forfeit win ELO error:', e));
  }

      // Hamburger menÃ¼yÃ¼ geri getir
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = '';
      if (!mpLobby) return;
      // MP maÃ§ skorunu liderlik tablosuna kaydet
      if (currentUser) {
        const myMpScore = (mpLobby.scores || {})[currentUser.username] || 0;
        if (myMpScore > 0) {
          const prevMode = gameMode;
          gameMode = mpLobby.mode || 'world';
          saveScore(myMpScore, 0).catch(() => { });
          gameMode = prevMode;
        }
      }
      const scores = mpLobby.scores || {};
      const qscores = mpLobby.qscores || {};
      const players = mpLobby.players || {};
      const totalQ = (mpLobby.questions || []).length;
      const lastQIdx = totalQ - 1;

      const playerArr = Object.values(players).sort((a, b) =>
        (scores[b.name] || 0) - (scores[a.name] || 0)
      );
      const rankEmojis = ['ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰'];
      const resultList = document.getElementById('mp-result-list');
      resultList.innerHTML = playerArr.map((p, i) => {
        const isMe = p.name === currentUser.username;
        const total = scores[p.name] || 0;
        // Son sorudan puan bul
        let lastQ = '';
        for (let qi = totalQ - 1; qi >= 0; qi--) {
          if (qscores[p.name] && qscores[p.name][`q${qi}`] !== undefined) {
            lastQ = `+${qscores[p.name][`q${qi}`]}`;
            break;
          }
        }
        const isWinner = i === 0;
        return `<div class="mp-result-row${isWinner ? ' winner' : ''}">
      <div class="mp-result-rank">${rankEmojis[i] || '#' + (i + 1)}</div>
      <div class="mp-result-name" style="${isMe ? 'color:var(--accent);font-weight:700' : ''}">${p.name}${isMe ? ' ' + t('mpYou') : ''}</div>
      <div class="mp-bq-scores">
        <div class="mp-result-score">${total.toLocaleString()}</div>
        ${lastQ ? `<div style="font-size:.72rem;color:var(--muted);text-align:right;">${lastQ}</div>` : ''}
      </div>
    </div>`;
      }).join('');

      const winner = playerArr[0];
      // Forfeit durumunda skora bakma â€” direkt belirle
      let isIWinner;
      if (opponentForfeited) {
        isIWinner = true;  // rakip forfeit etti â†’ ben kazandÄ±m
      } else if (iForfeited) {
        isIWinner = false; // ben forfeit ettim â†’ ben kaybettim
      } else {
        isIWinner = winner && winner.name === currentUser.username;
      }
      const winnerLabel = opponentForfeited
        ? (lang === 'en' ? 'ğŸ† YOU WIN! (Opponent left)' : 'ğŸ† KAZANDINIZ! (Rakip Ã§Ä±ktÄ±)')
        : iForfeited
          ? (lang === 'en' ? 'ğŸ³ï¸ You left the game' : 'ğŸ³ï¸ Oyundan Ã§Ä±ktÄ±nÄ±z')
          : gameMode === 'flag'
            ? (isIWinner
              ? (lang === 'en' ? 'ğŸ† YOU WIN!' : 'ğŸ† SEN KAZANDIN!')
              : (lang === 'en' ? `ğŸ† Winner: ${winner?.name || 'â€”'}` : `ğŸ† Kazanan: ${winner?.name || 'â€”'}`))
            : (isIWinner ? t('mpYouWin') : t('mpWinner', winner ? winner.name : 'â€”'));
      document.getElementById('mp-result-title').textContent = winnerLabel;

      // Butonlar: Rastgele eÅŸleÅŸme â†’ Yeniden EÅŸleÅŸtir + Ana MenÃ¼ | Normal lobi â†’ Yeni Oyun + Ana MenÃ¼
      const resultBtns = document.getElementById('mp-result-btns');
      if (resultBtns) {
        if (mpLobby && mpLobby.isQuickMatch) {
          // Rastgele eÅŸleÅŸme (bot dahil): Yeniden EÅŸleÅŸtir + Ana MenÃ¼
          resultBtns.innerHTML =
            '<button type="button" class="mp-btn" onclick="mpRematch()" style="flex:1">' + (lang === 'en' ? 'âš¡ REMATCH' : 'âš¡ YENÄ°DEN EÅLEÅTÄ°R') + '</button>'
            + '<button type="button" class="mp-btn secondary" onclick="mpBackToMenu()" style="flex:1">' + (lang === 'en' ? 'MENU' : 'ANA MENÃœ') + '</button>';
        } else {
          resultBtns.innerHTML = mpIsHost
            ? '<button type="button" class="mp-btn" onclick="mpPlayAgain()" style="flex:1">' + (lang === 'en' ? 'â–¶ PLAY AGAIN' : 'â–¶ YENÄ° OYUN') + '</button>'
            + '<button type="button" class="mp-btn secondary" onclick="mpBackToMenu()" style="flex:1">' + (lang === 'en' ? 'MENU' : 'ANA MENÃœ') + '</button>'
            : '<button type="button" class="mp-btn secondary" onclick="mpBackToMenu()">' + (lang === 'en' ? 'MENU' : 'ANA MENÃœ') + '</button>';
        }
      }
      document.getElementById('mp-result-overlay').classList.add('show');

      // Rank gÃ¼ncelle (rastgele eÅŸleÅŸme + normal lobi, forfeit yoksa)
      const rankChangeEl = document.getElementById('mp-rank-change');
      if (rankChangeEl) rankChangeEl.innerHTML = '';
      if (mpLobby && !mpLobby.forfeitedBy) {
        const scores = mpLobby.scores || {};
        const playerArr2 = Object.keys(scores).sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
        const myRank = playerArr2.indexOf(currentUser.username);
        const won = myRank === 0;
        updateRankAfterMatch(won, mpLobby.mode || 'world').then(result => {
          if (!rankChangeEl) return;
          const { oldRank, newRank, delta, games, placed, newElo, oldElo } = result;

          if (games <= RANK_PLACEMENT_GAMES) {
            // YerleÅŸme maÃ§Ä±
            if (placed) {
              // YerleÅŸim tamamlandÄ± â€” bÃ¼yÃ¼k modal gÃ¶ster
              rankChangeEl.innerHTML = getRankCardHTML(newElo);
              setTimeout(() => showRankUpModal('placed', null, newElo, delta), 600);
            } else {
              const remaining = RANK_PLACEMENT_GAMES - games;
              rankChangeEl.innerHTML = `<div style="color:var(--muted);font-size:.82rem;margin-top:6px">
            ${lang === 'en' ? 'Placement match' : 'YerleÅŸme maÃ§Ä±'} ${games}/${RANK_PLACEMENT_GAMES}
            &nbsp;Â·&nbsp; ${remaining} ${lang === 'en' ? 'left' : 'kaldÄ±'}
          </div>`;
            }
          } else {
            // Normal maÃ§ â€” rank deÄŸiÅŸimi
            const sign = delta >= 0 ? '+' : '';
            if (newRank && oldRank && newRank.key !== oldRank.key) {
              const up = RANK_TIERS.findIndex(t => t.key === newRank.key) > RANK_TIERS.findIndex(t => t.key === oldRank.key);
              // SonuÃ§ ekranÄ±na kÃ¼Ã§Ã¼k rank kartÄ± koy
              rankChangeEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px">
            <span class="rank-badge ${getRankClass(oldElo)}">${getRankEmoji(oldElo)} ${getRankLabel(oldElo, lang)}</span>
            <span style="color:var(--accent);font-size:1.2rem">${up ? 'â†’' : 'â†’'}</span>
            <span class="rank-badge ${getRankClass(newElo)}">${getRankEmoji(newElo)} ${getRankLabel(newElo, lang)}</span>
          </div>`;
              // BÃ¼yÃ¼k rank modal'Ä± biraz gecikmeli gÃ¶ster
              setTimeout(() => showRankUpModal(up ? 'up' : 'down', oldElo, newElo, delta), 700);
            } else {
              // AynÄ± rank, sadece elo deÄŸiÅŸimi
              const cls = delta >= 0 ? 'rank-up' : 'rank-down';
              const eloIcon = delta >= 0 ? 'â–²' : 'â–¼';
              rankChangeEl.innerHTML = `<div class="${cls}" style="font-size:.9rem;margin-top:6px">
            ${eloIcon} ${sign}${delta} ELO
            &nbsp;Â·&nbsp;
            <span class="rank-badge ${getRankClass(newElo)}">${getRankEmoji(newElo)} ${getRankLabel(newElo, lang)}</span>
          </div>`;
            }
          }
        });
      }
    } // end mpShowResults

    // â”€â”€ Rank atlama / yerleÅŸim modali â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function showRankUpModal(type, oldElo, newElo, delta) {
      const modal = document.getElementById('rank-up-modal');
      const titleEl = document.getElementById('rup-title');
      const subEl = document.getElementById('rup-sub');
      const cardsEl = document.getElementById('rup-cards');
      const closeBtn = document.getElementById('rank-up-close');
      if (!modal) return;

      if (type === 'placed') {
        titleEl.textContent = lang === 'en' ? 'ğŸ‰ PLACEMENT COMPLETE!' : 'ğŸ‰ YERLEÅÄ°M TAMAMLANDI!';
        titleEl.style.color = '#f0a500';
        subEl.textContent = lang === 'en' ? 'Your starting rank:' : 'BaÅŸlangÄ±Ã§ rankÄ±n:';
        cardsEl.innerHTML = getRankCardHTML(newElo);
        closeBtn.textContent = lang === 'en' ? 'LET\'S GO!' : 'HARIKA!';
      } else if (type === 'up') {
        titleEl.textContent = lang === 'en' ? 'â¬† RANK UP!' : 'â¬† RANK ATLADINIZ!';
        titleEl.style.color = '#4caf50';
        subEl.textContent = lang === 'en' ? `+${delta} ELO â€” New rank:` : `+${delta} ELO â€” Yeni rankÄ±n:`;
        cardsEl.innerHTML = getRankCardHTML(oldElo) + '<div class="rup-arrow">â†’</div>' + getRankCardHTML(newElo);
        closeBtn.textContent = lang === 'en' ? 'AWESOME!' : 'SÃœPER!';
      } else if (type === 'down') {
        titleEl.textContent = lang === 'en' ? 'â¬‡ RANK DOWN' : 'â¬‡ RANK DÃœÅTÃœNÃœZ';
        titleEl.style.color = '#f44336';
        subEl.textContent = lang === 'en' ? `${delta} ELO â€” New rank:` : `${delta} ELO â€” Yeni rankÄ±n:`;
        cardsEl.innerHTML = getRankCardHTML(oldElo) + '<div class="rup-arrow" style="color:#f44336">â†’</div>' + getRankCardHTML(newElo);
        closeBtn.textContent = lang === 'en' ? 'GOT IT' : 'TAMAM';
      }

      modal.classList.add('show');
    }

    function closeRankUpModal() {
      const modal = document.getElementById('rank-up-modal');
      if (modal) modal.classList.remove('show');
    }

    async function mpPlayAgain() {
      document.getElementById('mp-result-overlay').classList.remove('show');
      if (typeof hideFlagScreen === 'function') hideFlagScreen();
      // Overlay'leri temizle
      document.getElementById('mp-between-overlay').classList.remove('show');
      const menuBtn = document.getElementById('btn-main-menu');
    if (menuBtn) menuBtn.style.display = '';
      // State sÄ±fÄ±rla
      mpGameActive = false;
      mpCurrentQ = 0;
      mpMyScore = 0;
      _mpResultsShownForLobby = null; // guard sÄ±fÄ±rla â€” yeni oyun baÅŸlayabilsin
      if (mpIsHost && mpLobbyId) {
        try {
          // Mode'u taze oku
          const freshSnap = await db.collection('mp_lobbies').doc(mpLobbyId).get();
          const currentMode = freshSnap.exists ? (freshSnap.data().mode || mpMode || 'world') : mpMode;
          mpMode = currentMode;
          const questions = currentMode === 'turkey' ? pickTurkeyQuestions(MP_QUESTION_COUNT)
            : currentMode === 'europe' ? pickEuropeQuestions(MP_QUESTION_COUNT)
              : currentMode === 'flag' ? pickFlagQuestions(12)
                : pickQuestions(MP_QUESTION_COUNT);
          const questionsForFirebase = currentMode === 'flag'
            ? questions.map(q => ({ tr: q.tr, en: q.en, flag: q.flag, code: q.code || '', atr: q.atr || [], aen: q.aen || [] }))
            : questions.map(q => ({ name: q.name, name_en: q.name_en || '', country: q.country || '', city: q.city || '', lat: q.lat || 0, lon: q.lon || 0 }));
          await db.collection('mp_lobbies').doc(mpLobbyId).update({
            status: 'waiting',
            mode: currentMode,
            questions: questionsForFirebase,
            scores: {}, qscores: {}, answered: {},
            flagAnswered: {}, flagQuestion: 0, flagStartAt: 0,
            flagShowScores: -1, currentQuestion: 0, showScores: -1,
          });
          mpQuestions = questions;
          mpShowLobbyHost();
        } catch (e) { console.error('playAgain error', e); mpBackToMenu(); }
      } else if (!mpIsHost && mpLobbyId) {
        // Guest: sadece result overlay'i kapat, lobi ekranÄ±na geÃ§
        mpShowLobbyGuest();
      }
    }
// â”€â”€ Online oyundan Ã§Ä±kÄ±ÅŸ uyarÄ±sÄ± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mpShowForfeitConfirm() {
  const existing = document.getElementById('mp-forfeit-modal');
  if (existing) { existing.style.display = 'flex'; mpUpdateForfeitTexts(); return; }

  const el = document.createElement('div');
  el.id = 'mp-forfeit-modal';
  el.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.7);
    display:flex;align-items:center;justify-content:center;z-index:99999;
  `;
  el.innerHTML = `
    <div style="background:var(--card,#1a1a2e);border:1px solid var(--border,#333);
      border-radius:16px;padding:28px 24px;max-width:320px;width:90%;text-align:center;">
      <div style="font-size:2rem;margin-bottom:12px">âš ï¸</div>
      <div style="font-weight:700;font-size:1.1rem;margin-bottom:8px" id="mp-forfeit-title"></div>
      <div style="color:var(--muted,#aaa);font-size:.88rem;margin-bottom:24px" id="mp-forfeit-desc"></div>
      <div style="display:flex;gap:10px">
        <button type="button" id="mp-forfeit-cancel"
          style="flex:1;padding:12px;border-radius:10px;border:1px solid var(--border,#333);
          background:transparent;color:var(--text,#fff);font-size:.95rem;cursor:pointer">
        </button>
        <button type="button" id="mp-forfeit-confirm"
          style="flex:1;padding:12px;border-radius:10px;border:none;
          background:#e74c3c;color:#fff;font-size:.95rem;font-weight:700;cursor:pointer">
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  document.getElementById('mp-forfeit-cancel').onclick = mpHideForfeitConfirm;
  document.getElementById('mp-forfeit-confirm').onclick = mpForfeitAndExit;
  mpUpdateForfeitTexts();
}

function mpUpdateForfeitTexts() {
  const titleEl   = document.getElementById('mp-forfeit-title');
  const descEl    = document.getElementById('mp-forfeit-desc');
  const cancelEl  = document.getElementById('mp-forfeit-cancel');
  const confirmEl = document.getElementById('mp-forfeit-confirm');
  if (!titleEl) return;
  if (lang === 'en') {
    titleEl.textContent  = 'Leave the game?';
    descEl.textContent   = 'If you return to the main menu, you will be counted as defeated and lose ELO.';
    cancelEl.textContent = 'Stay';
    confirmEl.textContent = 'Leave';
  } else {
    titleEl.textContent  = 'Oyundan Ã§Ä±kÄ±lsÄ±n mÄ±?';
    descEl.textContent   = 'Ana menÃ¼ye dÃ¶nerseniz kaybetmiÅŸ sayÄ±lacaksÄ±nÄ±z ve ELO puanÄ± kaybedeceksiniz.';
    cancelEl.textContent = 'Geri DÃ¶n';
    confirmEl.textContent = 'Ã‡Ä±k';
  }
}


function mpHideForfeitConfirm() {
  const modal = document.getElementById('mp-forfeit-modal');
  if (modal) modal.style.display = 'none';
}

async function mpForfeitAndExit(silent) {
  mpHideForfeitConfirm();

  if (!mpLobby || !currentUser) { mpBackToMenu(); return; }

  const mode       = mpLobby.mode || 'world';
  const isBot      = mpLobby.isBot;
  const myUsername = currentUser.username;

  // Listener'Ä± hemen kapat â€” Firestore'dan gelen 'finished' eventi bizi tekrar tetiklemesin
  if (mpUnsubscribe) { mpUnsubscribe(); mpUnsubscribe = null; }

  try {
    if (mpLobbyId && !isBot) {
      await db.collection('mp_lobbies').doc(mpLobbyId).update({
        status: 'finished',
        finishedAt: Date.now(),
        forfeitedBy: myUsername
      });
    }

    await updateRankAfterMatch(false, mode);

  } catch(e) {
    console.error('Forfeit error:', e);
  }

  mpBackToMenu();
}
    function mpBackToMenu() {
      document.getElementById('mp-result-overlay').classList.remove('show');
      document.getElementById('mp-between-overlay').classList.remove('show');
      if (typeof hideFlagScreen === 'function') hideFlagScreen();
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = '';
      mpCleanup();
      goToWelcome();
    }

    function mpRematch() {
      // Mevcut modu hatÄ±rla, temizle, matchmaking ekranÄ±na geri dÃ¶n
      const prevMode = (mpLobby && mpLobby.mode) || _mmMode || 'world';
      document.getElementById('mp-result-overlay').classList.remove('show');
      document.getElementById('mp-between-overlay').classList.remove('show');
      if (typeof hideFlagScreen === 'function') hideFlagScreen();
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = '';
      mpCleanup();
      goToWelcome();
      // Welcome kapandÄ±ktan sonra multiplayer menÃ¼sÃ¼nÃ¼ aÃ§
      setTimeout(() => {
        openMultiplayerMenu();
        // Matchmaking ekranÄ±na geÃ§, Ã¶nceki mod seÃ§ili olsun
        _mmMode = prevMode;
        mpShowMatchmaking();
        // Otomatik aramayÄ± baÅŸlat
        mmStartSearch();
      }, 150);
    }

    async function mpLeaveLobby() {
      if (!mpLobbyId) { mpCleanup(); closeMultiplayerMenu(); return; }
      try {
        if (mpIsHost) {
          // Host ayrÄ±lÄ±rsa lobi silinir
          await db.collection('mp_lobbies').doc(mpLobbyId).delete();
        } else {
          await db.collection('mp_lobbies').doc(mpLobbyId).update({
            [`players.${currentUser.username}`]: firebase.firestore.FieldValue.delete()
          });
        }
      } catch (e) { console.error('Leave error:', e); }
      mpCleanup();
      mpShowMain();
    }

    function mpCleanup() {
      _mpResultsShownForLobby = null;
      if (_botApplyInterval) { clearInterval(_botApplyInterval); _botApplyInterval = null; }
      if (mpUnsubscribe) { mpUnsubscribe(); mpUnsubscribe = null; }
      if (typeof mpCancelAdvance === 'function') mpCancelAdvance();
      if (window._mpCountdownInterval) { clearInterval(window._mpCountdownInterval); window._mpCountdownInterval = null; }
      // Heartbeat ve disconnect timer'larÄ±nÄ± temizle
      mpStopHeartbeat();
      Object.values(_mpDisconnectTimers).forEach(t => clearTimeout(t));
      _mpDisconnectTimers = {};
      // Matchmaking state'ini de temizle (rematch sonrasÄ± eski interval kalmasÄ±n)
      if (_mmInterval) { clearInterval(_mmInterval); _mmInterval = null; }
      if (_mmUnsubscribe) { _mmUnsubscribe(); _mmUnsubscribe = null; }
      if (_mmDocRef) { _mmDocRef.delete().catch(() => {}); _mmDocRef = null; }
      _mmSearchPhaseRef = 'narrow';
      mpLobbyId = null;
      mpLobby = null;
      mpIsHost = false;
      mpGameActive = false;
      mpMyScore = 0;
      mpCurrentQ = 0;
      mpQuestions = [];
      document.getElementById('mp-live-scores').classList.remove('show');
      document.getElementById('mp-between-overlay').classList.remove('show');
    }

    // ===== MULTÄ°PLAYER: handleClickAtLonLat VE handleMapClick'Ä° OVERRIDE ET =====
    // Multiplayer modundayken farklÄ± nextQuestion Ã§aÄŸÄ±r

    const _origHandleClickAtLonLat = handleClickAtLonLat;
    window.handleClickAtLonLat = function (lon, lat) {
      if (!mpGameActive) { _origHandleClickAtLonLat(lon, lat); return; }
      if (state.answered) return;
      state.answered = true;
      stopTimer();

      const city = state.questions[state.questionIndex];
      const km = Math.round(haversine(lat, lon, city.lat, city.lon));
      const baseScore = gameMode === 'turkey' ? distanceToScoreTurkey(km) : gameMode === 'europe' ? distanceToScoreEurope(km) : distanceToScore(km);
      const timeMult = getTimeMult();
      const finalScore = Math.round(baseScore * timeMult);

      const gPos = addMarker(lat, lon, 'marker-guess');
      const rPos = addMarker(city.lat, city.lon, 'marker-real');
      addLine(gPos.x, gPos.y, rPos.x, rPos.y);

      mpSubmitAnswer(finalScore);

      const dLabel = gameMode === 'turkey' ? `${city.name}, ${city.city}` : `${cityDisplayName(city)}, ${countryDisplayName(city)}`;
      const toast = document.getElementById('result-toast');
      toast.style.display = 'flex';
      document.getElementById('toast-score').textContent = `+${finalScore}`;
      document.getElementById('toast-score').style.color = finalScore > 500 ? 'var(--green)' : finalScore > 200 ? 'var(--accent)' : 'var(--red)';
      document.getElementById('toast-dist').textContent = `${dLabel} â€” ${km.toLocaleString()} km`;
      toast.classList.add('show');

      // Cevap verildi, mpSubmitAnswer herkesin cevapladÄ±ÄŸÄ±nÄ± kontrol edecek

      // Zoom
      const midLat = (lat + city.lat) / 2, midLon = (lon + city.lon) / 2;
      const mProj = (gameMode === 'turkey' && window.turkeyProj) ? window.turkeyProj
        : (gameMode === 'europe' && europeProj) ? europeProj
          : projection;
      const [mx, my] = mProj([midLon, midLat]);
      const cont = document.getElementById('map-container');
      const W = cont.clientWidth, H = cont.clientHeight;
      const zTarget = Math.min(4, Math.max(1.5, 600 / Math.max(km, 50)));
      const tx = W / 2 - mx * zTarget;
      const ty = H / 2 - my * zTarget;
      if (gameMode === 'turkey' && window.turkeyZoom) {
        d3.select('#turkey-svg').transition().duration(700).call(window.turkeyZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(zTarget));
      } else if (gameMode === 'europe' && europeZoom) {
        europeSvgEl.transition().duration(700).call(europeZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(zTarget));
      } else {
        svgEl.transition().duration(700).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(zTarget));
      }
    };

    // handleMapClick iÃ§in de aynÄ± ÅŸeyi yap
    const _origHandleMapClick = handleMapClick;
    window.handleMapClick = function (evt) {
      if (!mpGameActive) { _origHandleMapClick(evt); return; }
      if (state.answered) return;
      if (gameMode === 'turkey') return; // turkey kendi click handler'Ä± var
      if (gameMode === 'europe') return; // europe kendi bindMapTapHandlers'Ä± var
      if (!evt) return;

      // Pointer/touch event'inden clientX/clientY al
      let clientX, clientY;
      if (evt.changedTouches && evt.changedTouches.length > 0) {
        clientX = evt.changedTouches[0].clientX;
        clientY = evt.changedTouches[0].clientY;
      } else if (evt.clientX !== undefined && evt.clientX !== 0) {
        clientX = evt.clientX;
        clientY = evt.clientY;
      } else {
        return; // koordinat yok
      }

      let px, py;
      try {
        const fakeEvt = { clientX, clientY };
        [px, py] = d3.pointer(fakeEvt, svgEl.node());
      } catch (e) {
        const rect = svgEl.node().getBoundingClientRect();
        px = clientX - rect.left;
        py = clientY - rect.top;
      }
      const bx = (px - currentTransform.x) / currentTransform.k;
      const by = (py - currentTransform.y) / currentTransform.k;
      const result = projection.invert([bx, by]);
      if (!result || isNaN(result[0]) || isNaN(result[1])) return;
      const [lon, lat] = result;
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return;

      handleClickAtLonLat(lon, lat);
    };

    // nextQuestion override
    const _origNextQuestion = nextQuestion;
    window.nextQuestion = function () {
      // MP'de DEVAM butonu gizli â€” klavye kÄ±sayolu da Ã§alÄ±ÅŸmasÄ±n
      if (mpGameActive) return;
      _origNextQuestion();
    };

    // mp-join-code iÃ§in enter key
    document.addEventListener('DOMContentLoaded', () => {
      const joinInput = document.getElementById('mp-join-code');
      if (joinInput) joinInput.addEventListener('keydown', e => { if (e.key === 'Enter') mpJoinLobby(); });
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doPlayerSearch(); });
    });

    // iOS gÃ¼venilir buton fix â€” onclick yerine touchend + click ikisi birden
    // Bu pattern iOS Safari'de butonlarÄ±n Ã§alÄ±ÅŸmamasÄ± sorununu Ã§Ã¶zer
    (function () {
      function iosFix(id, fn) {
        const el = document.getElementById(id);
        if (!el) return;
        // Ã‡ift tetiklenmeyi Ã¶nle
        let lastTouch = 0;
        el.addEventListener('touchend', function (e) {
          const now = Date.now();
          if (now - lastTouch < 400) return; // debounce
          lastTouch = now;
          e.preventDefault();
          fn();
        }, { passive: false });
      }

      document.addEventListener('DOMContentLoaded', function () {
        // Auth ekranÄ±
        iosFix('auth-lang-tr', () => setLang('tr'));
        iosFix('auth-lang-en', () => setLang('en'));
        iosFix('lang-tr', () => setLang('tr'));
        iosFix('lang-en', () => setLang('en'));
        // Welcome ekranÄ±
        iosFix('btn-play-world', () => welcomeStart('world'));
        iosFix('btn-play-europe', () => welcomeStart('europe'));
        iosFix('btn-play-turkey', () => welcomeStart('turkey'));
        iosFix('btn-multiplayer', () => openMultiplayerMenu());
        iosFix('btn-welcome-lb', () => showLeaderboard('welcome'));
        iosFix('btn-search-player', () => openSearchModal());
        iosFix('btn-options-welcome', () => openOptions('welcome'));
        iosFix('btn-welcome-logout', () => authLogout());
        // Ana menÃ¼
        iosFix('mm-btn-world', () => mainMenuStart('world'));
        iosFix('mm-btn-europe', () => mainMenuStart('europe'));
        iosFix('mm-btn-turkey', () => mainMenuStart('turkey'));
        iosFix('mm-btn-multiplayer', () => { closeMainMenu(); openMultiplayerMenu(); });
        iosFix('mm-btn-home', () => mmGoToWelcome());
        iosFix('btn-next-q', () => nextQuestion());
        iosFix('btn-main-menu', () => openMainMenu());
        // MP butonlarÄ±
        iosFix('mp-mode-world', () => mpSelectMode('world'));
        iosFix('mp-mode-turkey', () => mpSelectMode('turkey'));
        iosFix('mp-mode-flag', () => mpSelectMode('flag'));
        iosFix('btn-play-flag', () => startFlagSolo());
        iosFix('mm-btn-flag', () => { closeMainMenu(); startFlagSolo(); });
        iosFix('mp-btn-create', () => mpShowCreate());
        iosFix('mp-btn-join', () => mpShowJoin());
        iosFix('mp-create-go', () => mpCreateLobby());
        iosFix('mp-join-go', () => mpJoinLobby());
        iosFix('mp-start-btn', () => mpStartGame());
        iosFix('mp-back-menu-btn', () => mpBackToMenu());
      });
    })();
  


    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // BAYRAK MODU
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // Levenshtein mesafesi â€” tek harf toleransÄ± iÃ§in
    function levenshtein(a, b) {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
          dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      return dp[m][n];
    }

    function normalize(s) {
      return s.toLowerCase()
        .replace(/[ÄŸ]/g, 'g').replace(/[Ã¼]/g, 'u').replace(/[ÅŸ]/g, 's')
        .replace(/[Ä±]/g, 'i').replace(/[Ã¶]/g, 'o').replace(/[Ã§]/g, 'c')
        .replace(/[Ã Ã¡Ã¢Ã£Ã¤Ã¥]/g, 'a').replace(/[Ã¨Ã©ÃªÃ«]/g, 'e')
        .replace(/[Ã¬Ã­Ã®Ã¯]/g, 'i').replace(/[Ã²Ã³Ã´Ãµ]/g, 'o')
        .replace(/[Ã¹ÃºÃ»Ã¼]/g, 'u').replace(/[Ã±]/g, 'n')
        .replace(/[^a-z0-9 ]/g, '').trim();
    }

    function checkFlagAnswer(input, country) {
      const inp = normalize(input);
      if (!inp) return false;
      const atr = Array.isArray(country.atr) ? country.atr : [];
      const aen = Array.isArray(country.aen) ? country.aen : [];
      const allAnswers = [
        ...(atr.length ? atr : [country.tr]),
        ...(aen.length ? aen : [country.en]),
        country.tr, country.en
      ].filter(Boolean);
      for (const ans of allAnswers) {
        const norm = normalize(ans);
        if (norm === inp) return true;
        // KÄ±sa cevaplar iÃ§in tolerans: â‰¤4 karakter â†’ sadece tam eÅŸleÅŸme
        // 5-7 karakter â†’ 1 hata; 8+ â†’ 1 hata (max 1 tolerans)
        const maxDist = norm.length <= 4 ? 0 : 1;
        if (maxDist > 0 && levenshtein(inp, norm) <= maxDist) return true;
      }
      return false;
    }

    function pickFlagQuestions(n) {
      const pool = [...FLAG_COUNTRIES];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, Math.min(n, pool.length));
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // BAYRAK MODU â€” Tek oyunculu + Ã‡ok oyunculu
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    let flagState = {
      questions: [],
      qIndex: 0,
      myScore: 0,
      answered: false,
      timerInterval: null,
      timeLeft: 12,
      playerAnswers: {},
      nextCountdown: null,
      solo: false,
      soloResults: [],
      currentLevel: 1,
      grandTotal: 0,
      _allAnsweredTriggered: false,
      _betweenTimeout: null,
    };

    const FLAG_Q_COUNT = 15;
    const FLAG_SOLO_COUNT = 15;
    const FLAG_MAX_SCORE = 1000;
    const FLAG_FULL_TIME = 12;  // toplam sÃ¼re
    const FLAG_FULL_SECS = 7;   // ilk 7 saniye tam puan
    const FLAG_STEP = 60;  // her saniye azalma

    function flagCalcScore(timeLeft) {
      // 12â†’7s: 1000 puan  |  6sâ†’0s: her saniye -60
      if (timeLeft > FLAG_FULL_SECS - 1) return FLAG_MAX_SCORE;  // 7+ saniye kaldÄ±
      return Math.max(0, FLAG_MAX_SCORE - (FLAG_FULL_SECS - timeLeft) * FLAG_STEP);
    }

    function showFlagScreen() {
      document.getElementById('flag-screen').classList.add('show');
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = (typeof mpGameActive !== 'undefined' && mpGameActive) ? '' : 'none';
      // Mobilde klavye otomatik aÃ§Ä±lmasÄ±n
      const inp = document.getElementById('flag-input');
      if (inp) { inp.blur(); }
      // Dikey ekran Ã¶nerisi â€” mobil ve landscape ise gÃ¶ster
      const hint = document.getElementById('flag-portrait-hint');
      if (hint) {
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const isLandscape = window.innerWidth > window.innerHeight;
        hint.style.display = (isMobile && isLandscape) ? 'block' : 'none';
      }
    }

    function hideFlagScreen() {
      // Timer'larÄ± ve countdown'larÄ± temizle
      flagStopTimer();
      if (flagState.nextCountdown) { clearInterval(flagState.nextCountdown); flagState.nextCountdown = null; }
      if (flagState._betweenTimeout) { clearTimeout(flagState._betweenTimeout); flagState._betweenTimeout = null; }
      // Answered true yap ki flagTimesUp/flagSubmit artÄ±k tetiklenmesin
      flagState.answered = true;
      document.getElementById('flag-screen').classList.remove('show');
      document.getElementById('flag-between-overlay').style.display = 'none';
      const menuBtn = document.getElementById('btn-main-menu');
      if (menuBtn) menuBtn.style.display = '';
    }

    // Tek oyunculu baÅŸlatÄ±cÄ±
    function _showPortraitTip() {
      // Mobilde landscape ise dikey ekran Ã¶nerisi gÃ¶ster (engelleme deÄŸil, bilgi)
      if (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) return;
      const isLandscape = window.innerWidth > window.innerHeight;
      if (!isLandscape) return;
      // Toast tarzÄ± uyarÄ±
      let tip = document.getElementById('portrait-tip-toast');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'portrait-tip-toast';
        tip.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#1a3a2a;border:1px solid #2e7d52;color:#81c784;padding:8px 18px;border-radius:20px;font-size:.8rem;z-index:9999;white-space:nowrap;pointer-events:none;transition:opacity .4s;';
        document.body.appendChild(tip);
      }
      tip.textContent = lang === 'en' ? 'ğŸ“± Best in portrait mode' : 'ğŸ“± Dikey ekranda daha iyi gÃ¶rÃ¼nÃ¼r';
      tip.style.opacity = '1';
      setTimeout(() => { tip.style.opacity = '0'; }, 3500);
    }

    function startFlagSolo() {
      document.getElementById('welcome-modal').style.display = 'none';
      const mm = document.getElementById('main-menu-modal');
      if (mm) mm.style.display = 'none';
      flagState.currentLevel = 1;
      flagState.grandTotal = 0;
      flagState.questions = pickFlagQuestions(FLAG_LEVELS[0].questions);
      flagState.qIndex = 0;
      flagState.myScore = 0;
      flagState.answered = false;
      flagState.solo = true;
      flagState.soloResults = [];
      showFlagScreen();
      flagLoadQuestion();
    }

    function flagLoadQuestion() {

      if (flagState.qIndex >= flagState.questions.length) {
        flagEndRound(); return;
      }
      const country = flagState.questions[flagState.qIndex];
      flagState.answered = false;
      flagState.playerAnswers = {};
      flagState.timeLeft = FLAG_FULL_TIME;

      const flagImg = document.getElementById('flag-img');
      flagImg.style.display = 'block'; // her soruda sÄ±fÄ±rla
      if (country.code) {
        flagImg.src = `https://flagcdn.com/w320/${country.code}.png`;
        flagImg.srcset = `https://flagcdn.com/w160/${country.code}.png 160w, https://flagcdn.com/w320/${country.code}.png 320w`;
        flagImg.alt = country.en;
      } else {
        flagImg.src = '';
        flagImg.style.display = 'none';
        flagImg.alt = country.en;
      }
      const lvlTxt = flagState.solo ? ` Â· ${lang === 'en' ? 'Lv' : 'Sv'} ${flagState.currentLevel}` : '';
      const qWord = lang === 'en' ? 'Q' : 'SORU';
      document.getElementById('flag-round-info').textContent =
        `${qWord} ${flagState.qIndex + 1} / ${flagState.questions.length}${lvlTxt}`;
      document.getElementById('flag-feedback').textContent = '';
      document.getElementById('flag-feedback').className = '';
      document.getElementById('flag-input').value = '';
      document.getElementById('flag-input').disabled = false;
      document.getElementById('flag-submit-btn').disabled = false;
      document.getElementById('flag-hint-text').textContent =
        lang === 'en' ? 'Type the country name' : 'Ãœlke adÄ±nÄ± yaz';
      const lvl = flagState.solo ? flagState.currentLevel : null;
      const target = flagState.solo ? flagLevelTarget() : null;
      document.getElementById('flag-score-info').textContent = flagState.solo
        ? (lang === 'en'
          ? `Level ${lvl} Â· Target: ${(target || 0).toLocaleString()} pts | First ${FLAG_FULL_SECS}s=1000, then -${FLAG_STEP}/s`
          : `${lvl}. Seviye Â· Hedef: ${(target || 0).toLocaleString()} puan | Ä°lk ${FLAG_FULL_SECS}s=1000, sonra -${FLAG_STEP}/s`)
        : (lang === 'en'
          ? `First ${FLAG_FULL_SECS}s = 1000pts, then -${FLAG_STEP}pts/s`
          : `Ä°lk ${FLAG_FULL_SECS}s = 1000 puan, sonra saniyede -${FLAG_STEP}`);

      // Solo: oyuncu chip'lerini gizle
      document.getElementById('flag-players-scores').innerHTML = '';
      document.getElementById('flag-live-scores').innerHTML = '';

      if (!flagState.solo) flagUpdatePlayerChips();

      if (flagState.solo) {
        flagStartTimer();
      } else {
        // MP: host flagStartAt timestamp yazar, herkes o zamana gÃ¶re baÅŸlar
        if (mpIsHost) {
          db.collection('mp_lobbies').doc(mpLobbyId).update({
            flagStartAt: Date.now()
          }).catch(e => console.error('flagStartAt write error', e));
        }
        // mpHandleFlagUpdate flagStartAt'i alÄ±nca flagStartTimerAt() Ã§aÄŸÄ±racak
      }

      // MasaÃ¼stÃ¼nde otomatik focus, mobilde deÄŸil (klavye aÃ§Ä±lmasÄ±n)
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        setTimeout(() => { const inp = document.getElementById('flag-input'); if (inp) inp.focus(); }, 100);
      }
    }

    function flagStartTimerAt(startTs) {
      // Sunucu timestamp'ine gÃ¶re kaÃ§ saniye geÃ§miÅŸ hesapla
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      const remaining = Math.max(0, FLAG_FULL_TIME - elapsed);
      flagState.timeLeft = remaining;
      if (flagState.timerInterval) clearInterval(flagState.timerInterval);
      const bar = document.getElementById('flag-timer-bar');
      const pct = (remaining / FLAG_FULL_TIME) * 100;
      bar.style.transition = 'none';
      bar.style.width = pct + '%';
      document.getElementById('flag-time-left').textContent = remaining;
      if (remaining <= 0) { flagTimesUp(); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${remaining}s linear`;
        bar.style.width = '0%';
      }));
      flagState.timerInterval = setInterval(() => {
        flagState.timeLeft--;
        document.getElementById('flag-time-left').textContent = flagState.timeLeft;
        if (flagState.timeLeft <= 0) {
          clearInterval(flagState.timerInterval);
          flagState.timerInterval = null;
          flagTimesUp();
        }
      }, 1000);
    }

    function flagStartTimer() {
      if (flagState.timerInterval) clearInterval(flagState.timerInterval);
      const bar = document.getElementById('flag-timer-bar');
      bar.style.transition = 'none';
      bar.style.width = '100%';
      document.getElementById('flag-time-left').textContent = FLAG_FULL_TIME;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${FLAG_FULL_TIME}s linear`;
        bar.style.width = '0%';
      }));

      flagState.timerInterval = setInterval(() => {
        flagState.timeLeft--;
        document.getElementById('flag-time-left').textContent = flagState.timeLeft;
        if (flagState.timeLeft <= 0) {
          clearInterval(flagState.timerInterval);
          flagState.timerInterval = null;
          flagTimesUp();
        }
      }, 1000);
    }

    function flagStopTimer() {
      if (flagState.timerInterval) { clearInterval(flagState.timerInterval); flagState.timerInterval = null; }
      // Bar animasyonu durdur
      const bar = document.getElementById('flag-timer-bar');
      const w = bar.getBoundingClientRect().width;
      const wrap = document.getElementById('flag-timer-bar-wrap').getBoundingClientRect().width;
      bar.style.transition = 'none';
      bar.style.width = (wrap > 0 ? (w / wrap * 100) : 0) + '%';
    }

    function flagTimesUp() {
      if (flagState.answered) return;
      flagState.answered = true;
      document.getElementById('flag-input').disabled = true;
      document.getElementById('flag-submit-btn').disabled = true;
      const feedback = document.getElementById('flag-feedback');
      feedback.className = 'wrong';
      const country = flagState.questions[flagState.qIndex];
      feedback.textContent = lang === 'en'
        ? `â± Time's up! Answer: ${country.en}`
        : `â± SÃ¼re doldu! Cevap: ${country.tr}`;
      if (flagState.solo) {
        flagState.soloResults.push({ country, score: 0, correct: false });
        flagState._betweenTimeout = setTimeout(() => { flagState._betweenTimeout = null; flagShowBetween(0, false); }, 1000);
      } else if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
        flagShowBetween(0, false);
        flagMpSubmit(0);
      } else {
        flagShowBetween(0, false);
      }
    }

    function flagSubmit() {
      if (flagState.answered) return;
      const inp = document.getElementById('flag-input').value.trim();
      if (!inp) return;

      const country = flagState.questions[flagState.qIndex];
      const correct = checkFlagAnswer(inp, country);
      const score = correct ? flagCalcScore(flagState.timeLeft) : 0;

      flagState.answered = true;
      flagStopTimer();

      document.getElementById('flag-input').disabled = true;
      document.getElementById('flag-submit-btn').disabled = true;

      const feedback = document.getElementById('flag-feedback');
      if (correct) {
        feedback.textContent = `âœ“ +${score}`;
        feedback.className = 'correct';
        flagState.myScore += score;
      } else {
        feedback.textContent = lang === 'en'
          ? `âœ— Wrong â€” ${country.en}`
          : `âœ— YanlÄ±ÅŸ â€” ${country.tr}`;
        feedback.className = 'wrong';
      }

      if (flagState.solo) {
        flagState.soloResults.push({ country, score, correct });
        flagState._betweenTimeout = setTimeout(() => { flagState._betweenTimeout = null; flagShowBetween(score, correct); }, 800);
      } else if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
        // Between'i hemen aÃ§, Firebase'i arka planda yaz
        flagShowBetween(score, correct);
        flagMpSubmit(score);
      } else {
        setTimeout(() => flagShowBetween(score, correct), 800);
      }
    }

    // enter tuÅŸu
    document.addEventListener('DOMContentLoaded', () => {
      const inp = document.getElementById('flag-input');
      if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') flagSubmit(); });
    });

    // â”€â”€ MP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    async function flagMpSubmit(score) {

      if (!mpLobbyId) return;
if (!currentUser) return;
const qIdx = flagState.qIndex;
const myName = currentUser.username;
      flagState.myScore += score; // local skoru gÃ¼ncelle
      try {
        await db.collection('mp_lobbies').doc(mpLobbyId).update({
          [`scores.${myName}`]: (mpLobby.scores?.[myName] || 0) + score,
          [`qscores.${myName}.q${qIdx}`]: score,
          [`flagAnswered.${myName}`]: qIdx,
        });
      } catch (e) { console.error('flagMpSubmit error', e); }
    }

    function flagUpdatePlayerChips() {
      if (flagState.solo) return;
      const players = mpLobby ? Object.keys(mpLobby.players || {}) : [];
      const answered = mpLobby?.flagAnswered || {};
      const qIdx = flagState.qIndex;
      document.getElementById('flag-players-scores').innerHTML = players.map(p => {
        const done = answered[p] === qIdx;
        return `<span class="flag-player-chip${done ? ' answered' : ''}">${done ? 'âœ“ ' : ''}${p}</span>`;
      }).join('');
      const scores = mpLobby?.scores || {};
      document.getElementById('flag-live-scores').innerHTML = players.map(p =>
        `<span style="font-size:.8rem;color:var(--muted)">${p} <b style="color:var(--text)">${scores[p] || 0}</b></span>`
      ).join(' Â· ');
    }

    // â”€â”€ ArasÄ± ekran â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function flagShowBetween(myScore, correct) {
      const country = flagState.questions[flagState.qIndex];
      const overlay = document.getElementById('flag-between-overlay');
      overlay.style.display = 'flex';
      const titleEl = document.getElementById('flag-between-title');
      if (titleEl) titleEl.textContent = lang === 'en' ? 'SCORE' : 'SKOR';

      // Cevap
      const bCode = country.code || 'un';
      const primaryName = lang === 'en' ? country.en : country.tr;
      const secondaryName = lang === 'en' ? country.tr : country.en;
      document.getElementById('flag-between-answer').innerHTML =
        `<img src="https://flagcdn.com/w160/${bCode}.png" style="height:60px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.4);margin-bottom:8px;" /><br>`
        + `<b style="font-size:1.8rem">${primaryName}</b><br>`
        + `<span style="color:var(--muted);font-size:1.1rem">${secondaryName}</span>`;

      // Skor satÄ±rlarÄ±
      let listHtml = '';
      if (flagState.solo) {
        // Solo: tek satÄ±r
        listHtml = `<div style="background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px 16px;text-align:center;">
      <span style="font-size:1.1rem">${correct ? 'âœ“' : 'âœ—'} ${currentUser?.username || 'â€”'}</span>
      &nbsp;
      <b style="color:${correct ? '#4caf50' : 'var(--muted)'}">+${myScore}</b>
      &nbsp;Â·&nbsp;
      <span style="color:var(--accent)">${lang === 'en' ? 'Total' : 'Toplam'}: ${flagState.myScore}</span>
    </div>`;
      } else {
        const scores = mpLobby?.scores || {};
        const qscores = mpLobby?.qscores || {};
        const players = Object.keys(mpLobby?.players || {});
        const qIdx = flagState.qIndex;
        listHtml = players
          .map(p => ({ name: p, total: scores[p] || 0, q: qscores[p]?.[`q${qIdx}`] }))
          .sort((a, b) => b.total - a.total)
          .map((p, i) => {
            const isMe = p.name === currentUser?.username;
            const qPts = p.q !== undefined ? p.q : null;
            const qLine = qPts !== null
              ? `<div style="font-size:.72rem;color:${qPts > 0 ? 'var(--accent)' : 'var(--muted)'}">+${qPts} ${lang === 'en' ? 'this round' : 'bu soruda'}</div>`
              : `<div style="font-size:.72rem;color:var(--muted)">${lang === 'en' ? 'no answer' : 'cevap yok'}</div>`;
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--panel);border:1px solid ${isMe ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:10px 16px;">
          <span style="${isMe ? 'color:var(--accent);font-weight:700' : ''}">${['ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰'][i] || '#' + (i + 1)} ${p.name}</span>
          <div style="text-align:right"><div style="font-family:'Bebas Neue',cursive;font-size:1.2rem">${p.total.toLocaleString()}</div>${qLine}</div>
        </div>`;
          }).join('');

      }
      document.getElementById('flag-between-list').innerHTML = listHtml;

      // MP'de: diÄŸer oyuncu hÃ¢lÃ¢ cevaplamazsa sayacÄ± askÄ±ya al
      // Solo'da: normal 3s sayaÃ§
      if (flagState.nextCountdown) clearInterval(flagState.nextCountdown);
      const _isMpMode = typeof mpGameActive !== 'undefined' && mpGameActive;
      const _nextEl = document.getElementById('flag-between-next');

      if (flagState.solo) {
        let cd = 3;
        if (_nextEl) _nextEl.textContent = (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + cd + 's';
        flagState.nextCountdown = setInterval(() => {
          cd--;
          if (_nextEl) _nextEl.textContent = cd > 0 ? (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + cd + 's' : 'â€¦';
          if (cd <= 0) {
            clearInterval(flagState.nextCountdown); flagState.nextCountdown = null;
            overlay.style.display = 'none';
            flagState.qIndex++; flagState.answered = false; flagLoadQuestion();
          }
        }, 1000);
      } else if (_isMpMode) {
        // MP: sayacÄ± gÃ¶sterme â€” _allAnsweredTriggered olunca host'un countdown'Ä± devreye girer
        if (_nextEl) _nextEl.textContent = lang === 'en' ? 'Waiting for othersâ€¦' : 'DiÄŸerleri bekleniyorâ€¦';
        // overlay aÃ§Ä±k kalÄ±r, mpHandleFlagUpdate kapatacak
      }
    }

    // Bayrak seviye tablosu
    const FLAG_LEVELS = [
      { level: 1, questions: 3, target: 1000 },
      { level: 2, questions: 4, target: 2000 },
      { level: 3, questions: 5, target: 2700 },
      { level: 4, questions: 6, target: 4000 },
      { level: 5, questions: 8, target: 6400 },
    ];

    function flagLevelQuestionCount() {
      return FLAG_LEVELS[flagState.currentLevel - 1]?.questions || 3;
    }
    function flagLevelTarget() {
      return FLAG_LEVELS[flagState.currentLevel - 1]?.target || 1000;
    }

    function flagEndRound() {
      flagStopTimer();
      if (flagState.nextCountdown) { clearInterval(flagState.nextCountdown); flagState.nextCountdown = null; }

      if (flagState.solo) {
        hideFlagScreen();
        flagShowSoloResults();
      } else if (typeof mpGameActive !== 'undefined' && mpGameActive) {
        if (mpIsHost) mpEndGame();
        // guest: mpSubscribeLobby 'finished' bekleniyor
      }
    }

    function flagBackToMenu() {
      if (mpGameActive && mpLobbyId) {
        // MP flag oyunundayken Ã§Ä±kÄ±ÅŸ â†’ lobiden ayrÄ±l
        mpLeaveLobby();
      } else {
        goToWelcome();
      }
    }

    function openFlagMenu()  {
  // Online flag oyunundayken forfeit uyarÄ±sÄ± gÃ¶ster
  if (typeof mpGameActive !== 'undefined' && mpGameActive) {
    mpShowForfeitConfirm();
    return;
  }
      // Bayrak modunda â˜° â†’ main-menu-modal'Ä± gÃ¶ster
      // "Devam Et" butonu flagÄ± kapatmaz, sadece modal kapanÄ±r
      const resumeBtn = document.getElementById('mm-btn-resume');
      if (resumeBtn) {
        resumeBtn.textContent = t('mpResume');
        resumeBtn.onclick = () => closeMainMenu(); // sadece modal kapat, flag devam eder
      }
      // Yeni oyun butonlarÄ± flag moduna geÃ§memeli, flag Ã§Ä±kÄ±ÅŸÄ±nÄ± halledelim
      const mmWorld = document.getElementById('mm-btn-world');
      if (mmWorld) mmWorld.onclick = () => { if (mpGameActive && mpLobbyId) mpLeaveLobby(); else hideFlagScreen(); mainMenuStart('world'); };
      const mmTurkey = document.getElementById('mm-btn-turkey');
      if (mmTurkey) mmTurkey.onclick = () => { if (mpGameActive && mpLobbyId) mpLeaveLobby(); else hideFlagScreen(); mainMenuStart('turkey'); };
      const mmFlag = document.getElementById('mm-btn-flag');
      if (mmFlag) mmFlag.onclick = () => { closeMainMenu(); hideFlagScreen(); startFlagSolo(); };
      document.getElementById('main-menu-modal').style.display = 'flex';
    }

    function flagShowSoloResults() {
      const levelDef = FLAG_LEVELS[flagState.currentLevel - 1];
      const target = levelDef?.target || 0;
      const levelScore = flagState.myScore;       // bu level'da kazanÄ±lan
      const totalAll = flagState.grandTotal;     // tÃ¼m levellardaki toplam
      const correct = flagState.soloResults.filter(r => r.correct).length;
      const n = flagState.soloResults.length;
      const passed = levelScore >= target;
      const isLastLevel = flagState.currentLevel >= FLAG_LEVELS.length;
      const isWin = passed && isLastLevel;

      // Skoru kaydet
      gameMode = 'flag';
      saveScore(totalAll, passed ? flagState.currentLevel : flagState.currentLevel - 1);

      const ov = document.getElementById('overlay');
      const title = document.getElementById('overlay-title');
      const desc = document.getElementById('overlay-desc');
      const btns = document.getElementById('overlay-buttons');

      if (isWin) {
        title.textContent = lang === 'en' ? 'ğŸ† YOU WIN!' : 'ğŸ† KAZANDIN!';
      } else if (passed) {
        title.textContent = lang === 'en' ? `âœ… LEVEL ${flagState.currentLevel} PASSED!` : `âœ… ${flagState.currentLevel}. SEVÄ°YE GEÃ‡ILDI!`;
      } else {
        title.textContent = lang === 'en' ? `âŒ LEVEL ${flagState.currentLevel} FAILED` : `âŒ ${flagState.currentLevel}. SEVÄ°YE BAÅARISIZ`;
      }

      const targetLine = passed
        ? `<div style="color:#4caf50;font-size:.9rem;margin:4px 0">${lang === 'en' ? 'Target' : 'Hedef'}: ${target.toLocaleString()} âœ“</div>`
        : `<div style="color:#f44336;font-size:.9rem;margin:4px 0">${lang === 'en' ? 'Target' : 'Hedef'}: ${target.toLocaleString()} â€” ${lang === 'en' ? 'You got' : 'AldÄ±n'}: ${levelScore.toLocaleString()}</div>`;

      desc.innerHTML =
        `<div style="font-size:2rem;font-weight:700;color:var(--accent)">${levelScore.toLocaleString()} ${lang === 'en' ? 'pts' : 'puan'}</div>`
        + targetLine
        + `<div style="color:var(--muted);font-size:.85rem;margin:2px 0">${correct}/${n} ${lang === 'en' ? 'correct' : 'doÄŸru'} &nbsp;|&nbsp; ${lang === 'en' ? 'Total' : 'Toplam'}: ${totalAll.toLocaleString()}</div>`
        + `<div style="max-height:200px;overflow-y:auto;margin-top:10px;display:flex;flex-direction:column;gap:5px;">`
        + flagState.soloResults.map(r =>
          `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--panel);border:1px solid ${r.correct ? '#4caf50' : 'var(--border)'};border-radius:8px;padding:6px 12px;font-size:.85rem;">
          <span><img src="https://flagcdn.com/w40/${r.country.code || 'un'}.png" style="height:16px;vertical-align:middle;margin-right:5px;border-radius:2px;"/>${lang === 'en' ? r.country.en : r.country.tr}</span>
          <b style="color:${r.correct ? '#4caf50' : '#f44336'}">+${r.score}</b>
        </div>`
        ).join('')
        + `</div>`;

      // Butonlar
      if (isWin) {
        btns.innerHTML =
          `<button type="button" class="overlay-btn" onclick="startFlagSolo()">${lang === 'en' ? 'â–¶ PLAY AGAIN' : 'â–¶ TEKRAR OYNA'}</button>`
          + `<button type="button" class="overlay-btn secondary" onclick="flagBackToMenu()">${lang === 'en' ? 'MENU' : 'ANA MENÃœ'}</button>`;
      } else if (passed) {
        btns.innerHTML =
          `<button type="button" class="overlay-btn" onclick="flagNextLevel()">${lang === 'en' ? `â–¶ LEVEL ${flagState.currentLevel + 1}` : `â–¶ ${flagState.currentLevel + 1}. SEVÄ°YE`}</button>`
          + `<button type="button" class="overlay-btn secondary" onclick="startFlagSolo()">${lang === 'en' ? 'â†º RESTART' : 'â†º BAÅTAN BAÅLA'}</button>`
          + `<button type="button" class="overlay-btn secondary" onclick="flagBackToMenu()">${lang === 'en' ? 'MENU' : 'ANA MENÃœ'}</button>`;
      } else {
        btns.innerHTML =
          `<button type="button" class="overlay-btn" onclick="flagRetryLevel()">${lang === 'en' ? 'â†º TRY AGAIN' : 'â†º TEKRAR DENE'}</button>`
          + `<button type="button" class="overlay-btn secondary" onclick="startFlagSolo()">${lang === 'en' ? 'RESTART' : 'BAÅTAN BAÅLA'}</button>`
          + `<button type="button" class="overlay-btn secondary" onclick="flagBackToMenu()">${lang === 'en' ? 'MENU' : 'ANA MENÃœ'}</button>`;
      }

      maybeShowInterstitialAfterGame(() => {
        ov.classList.remove('hidden');
        ov.style.display = 'flex';
      }, false);
    }

    function flagNextLevel() {
      flagState.currentLevel++;
      flagState.grandTotal = (flagState.grandTotal || 0) + flagState.myScore;
      flagState.myScore = 0;
      flagState.qIndex = 0;
      flagState.answered = false;
      flagState.soloResults = [];
      flagState.questions = pickFlagQuestions(flagLevelQuestionCount());
      const ov = document.getElementById('overlay');
      if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
      showFlagScreen();
      flagLoadQuestion();
    }

    function flagRetryLevel() {
      flagState.myScore = 0;
      flagState.qIndex = 0;
      flagState.answered = false;
      flagState.soloResults = [];
      flagState.questions = pickFlagQuestions(flagLevelQuestionCount());
      const ov = document.getElementById('overlay');
      if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
      showFlagScreen();
      flagLoadQuestion();
    }


    function mpHandleFlagUpdate(lobbyData) {
      if (gameMode !== 'flag') return;
      const qIdx = flagState.qIndex;


      // â”€â”€ flagAnswered gÃ¼ncellemesi: between ekranÄ± aÃ§Ä±ksa skoru gÃ¼ncelle â”€â”€â”€â”€â”€â”€
      if (document.getElementById('flag-between-overlay').style.display === 'flex') {
        // Skor listesini gÃ¼ncelle (diÄŸer oyuncu cevap verdi)
        const scores = lobbyData.scores || {};
        const qscores = lobbyData.qscores || {};
        const players = Object.keys(lobbyData.players || {});
        const listHtml = players
          .map(p => ({ name: p, total: scores[p] || 0, q: qscores[p]?.[`q${qIdx}`] }))
          .sort((a, b) => b.total - a.total)
          .map((p, i) => {
            const isMe = p.name === currentUser?.username;
            const qPts = p.q !== undefined ? p.q : null;
            const qLine = qPts !== null
              ? `<div style="font-size:.72rem;color:${qPts > 0 ? 'var(--accent)' : 'var(--muted)'}">+${qPts} ${lang === 'en' ? 'this round' : 'bu soruda'}</div>`
              : `<div style="font-size:.72rem;color:var(--muted)">${lang === 'en' ? 'waiting...' : 'bekleniyor...'}</div>`;
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--panel);border:1px solid ${isMe ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:10px 16px;">
          <span style="${isMe ? 'color:var(--accent);font-weight:700' : ''}">${['ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰'][i] || '#' + (i + 1)} ${p.name}</span>
          <div style="text-align:right"><div style="font-family:'Bebas Neue',cursive;font-size:1.2rem">${p.total.toLocaleString()}</div>${qLine}</div>
        </div>`;
          }).join('');
        const listEl = document.getElementById('flag-between-list');
        if (listEl) listEl.innerHTML = listHtml;
      }

      // â”€â”€ Herkes cevapladÄ± mÄ±? â†’ host countdown baÅŸlatÄ±r â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (mpIsHost && !flagState._allAnsweredTriggered) {
        const fa = lobbyData.flagAnswered || {};
        const players = Object.keys(lobbyData.players || {});
        const allDone = players.length > 0 && players.every(p => fa[p] === qIdx);
        if (allDone) {
          flagState._allAnsweredTriggered = true;
          // SÃ¼reyi durdur
          flagStopTimer();
          if (!flagState.answered) {
            flagState.answered = true;
            document.getElementById('flag-input').disabled = true;
            document.getElementById('flag-submit-btn').disabled = true;
          }
          // Between aÃ§Ä±ksa sadece listeyi gÃ¼ncelle (sayacÄ± sÄ±fÄ±rlama!)
          // AÃ§Ä±k deÄŸilse aÃ§ â€” ama Ã¶nce 2.5s bekle ki doÄŸru cevap gÃ¶rÃ¼nsÃ¼n
          const _betweenOpen = document.getElementById('flag-between-overlay').style.display === 'flex';
          if (!_betweenOpen) {
            const myQ = (lobbyData.qscores?.[currentUser.username]?.[`q${qIdx}`]) ?? 0;
            setTimeout(() => {
              if (!mpGameActive) return;
              flagShowBetween(myQ, myQ > 0);
              // SayacÄ± between aÃ§Ä±ldÄ±ktan sonra baÅŸlat
              if (mpIsHost) {
                let _aaCd = 3;
                const _aaEl = document.getElementById('flag-between-next');
                if (_aaEl) _aaEl.textContent = (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + _aaCd + 's';
                if (flagState.nextCountdown) clearInterval(flagState.nextCountdown);
                flagState.nextCountdown = setInterval(() => {
                  _aaCd--;
                  if (_aaEl) _aaEl.textContent = _aaCd > 0 ? (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + _aaCd + 's' : 'â€¦';
                  if (_aaCd <= 0) {
                    clearInterval(flagState.nextCountdown);
                    flagState.nextCountdown = null;
                    document.getElementById('flag-between-overlay').style.display = 'none';
                    const nextQ = flagState.qIndex + 1;
                    db.collection('mp_lobbies').doc(mpLobbyId).update({
                      flagQuestion: nextQ,
                      flagAnswered: {},
                    }).catch(e => console.error('flag advance error', e));
                  }
                }, 1000);
              }
            }, 2500);
          } else {
            // Between zaten aÃ§Ä±k â€” sadece listeyi gÃ¼ncelle, sayacÄ± yeniden baÅŸlat
            if (mpIsHost) {
              let _aaCd = 3;
              const _aaEl = document.getElementById('flag-between-next');
              if (_aaEl) _aaEl.textContent = (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + _aaCd + 's';
              if (flagState.nextCountdown) clearInterval(flagState.nextCountdown);
              flagState.nextCountdown = setInterval(() => {
                _aaCd--;
                if (_aaEl) _aaEl.textContent = _aaCd > 0 ? (lang === 'en' ? 'Next in' : 'Sonraki') + ' ' + _aaCd + 's' : 'â€¦';
                if (_aaCd <= 0) {
                  clearInterval(flagState.nextCountdown);
                  flagState.nextCountdown = null;
                  document.getElementById('flag-between-overlay').style.display = 'none';
                  const nextQ = flagState.qIndex + 1;
                  db.collection('mp_lobbies').doc(mpLobbyId).update({
                    flagQuestion: nextQ,
                    flagAnswered: {},
                  }).catch(e => console.error('flag advance error', e));
                }
              }, 1000);
            }
          }
        }
      } // end if (mpIsHost && !flagState._allAnsweredTriggered)

      // â”€â”€ flagStartAt: herkes aynÄ± anda timer baÅŸlatsÄ±n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const fStartAt = lobbyData.flagStartAt || 0;
      if (fStartAt > 0 && !flagState.timerInterval && !flagState.answered) {
        // timestamp'e gÃ¶re senkronize baÅŸlat
        flagStartTimerAt(fStartAt);
      }

      // â”€â”€ flagQuestion: TÃœM oyuncular (host dahil) sonraki soruya geÃ§ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const fq = lobbyData.flagQuestion ?? 0;
      if (fq > flagState.qIndex) {
        if (flagState.nextCountdown) { clearInterval(flagState.nextCountdown); flagState.nextCountdown = null; }
        document.getElementById('flag-between-overlay').style.display = 'none';
        flagState.qIndex = fq;
        flagState.answered = false;
        flagState._allAnsweredTriggered = false;
        if (fq >= flagState.questions.length) {
          flagEndRound();
        } else {
          flagLoadQuestion();
        }
      }

     flagUpdatePlayerChips();
    }

window.addEventListener('beforeunload', function () {
  if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const myUsername = window._geomeisterUser?.username;
    if (!myUsername) return;

    // Aktif lobi bilgisini kaydet â€” 20 saniye iÃ§inde geri dÃ¶nÃ¼lÃ¼rse reconnect olur (bot maÃ§Ä± dahil)
    localStorage.setItem('active_mp_lobby_' + myUsername, JSON.stringify({
      lobbyId: mpLobbyId,
      isBot: !!(mpLobby?.isBot),
      timestamp: Date.now()
    }));

    // Bot maÃ§Ä±nda pending forfeit veya sendBeacon gerekmez
    if (mpLobby?.isBot) return;

    // Pending forfeit kaydet â€” 20 saniye iÃ§inde reconnect olursa _checkAndReconnectMpGame
    // bu kaydÄ± temizler ve iÅŸlenmez. Reconnect olmazsa _checkPendingForfeit iÅŸler.
    const pendingKey = 'pending_forfeit_' + mpLobbyId;
    if (!localStorage.getItem('forfeit_processed_' + mpLobbyId)) {
      localStorage.setItem(pendingKey, JSON.stringify({
        lobbyId: mpLobbyId,
        mode: mpLobby?.mode || 'world',
        username: myUsername,
        timestamp: Date.now()
      }));
    }
    // Not: sendBeacon kaldÄ±rÄ±ldÄ± â€” rakip heartbeat sistemi 20 saniye sonra forfeit yazar.
    // Reconnect olursa heartbeat yeniden baÅŸlar ve rakibin timer'Ä± iptal olur.
  }
});

// Sekme arka plana geÃ§ince (telefonda uygulama minimize) forfeit iÅŸlemi yap
let _visibilityForfeitTimer = null;

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
      // Heartbeat'i durdur (bot maÃ§Ä±nda zaten Ã§alÄ±ÅŸmÄ±yor, gerÃ§ek maÃ§ta durdur)
      if (typeof mpStopHeartbeat === 'function') mpStopHeartbeat();
      // 20 saniye gizli kalÄ±rsa forfeit baÅŸlat (bot maÃ§Ä± dahil)
      _visibilityForfeitTimer = setTimeout(function() {
        if (typeof mpForfeitAndExit === 'function' && mpGameActive) {
          mpForfeitAndExit(true);
        }
      }, 20 * 1000);
    }
  } else {
    // Sekmeye geri dÃ¶nÃ¼nce timer'Ä± iptal et ve heartbeat'i yeniden baÅŸlat
    if (_visibilityForfeitTimer) {
      clearTimeout(_visibilityForfeitTimer);
      _visibilityForfeitTimer = null;
    }
    // Heartbeat sadece gerÃ§ek maÃ§ta (bot maÃ§Ä±nda mpStartHeartbeat zaten erken return eder)
    if (typeof mpGameActive !== 'undefined' && mpGameActive && mpLobbyId) {
      if (typeof mpStartHeartbeat === 'function') mpStartHeartbeat();
    }
  }
});
  
