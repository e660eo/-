/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Camera, 
  Check, 
  X, 
  Info, 
  Sparkles, 
  ChevronRight, 
  CornerRightUp, 
  MessageSquare,
  HelpCircle,
  AlertCircle,
  Users,
  Utensils,
  BookOpen,
  ArrowRight,
  BookmarkCheck,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ANIMALS_DATA, 
  SERVICES_DATA, 
  SPECIAL_BENEFITS, 
  RULES_DATA, 
  QUIZ_QUESTIONS, 
  Animal, 
  Service, 
  SpecialBenefit 
} from './types';

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<'all' | 'stars' | 'forest' | 'birds' | 'small'>('all');
  
  // Selected Animal for Details Modal
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Quiz States
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<Animal | null>(null);

  // Ticket Calculator States
  const [adults, setAdults] = useState<number>(2);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['feeding']); // Default has feed bag
  
  // Custom contact form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Notification Banner
  const [showNotification, setShowNotification] = useState(true);

  // Filter animals based on selection
  const filteredAnimals = useMemo(() => {
    if (activeTab === 'all') return ANIMALS_DATA;
    return ANIMALS_DATA.filter(animal => animal.category === activeTab);
  }, [activeTab]);

  // Quiz handler
  const handleQuizAnswer = (animalId: string) => {
    const updatedAnswers = [...quizAnswers, animalId];
    setQuizAnswers(updatedAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate most frequent matched category
      const counts: Record<string, number> = {};
      let maxCount = 0;
      let winningId = 'alpaca'; // Default fallback

      updatedAnswers.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
        if (counts[id] > maxCount) {
          maxCount = counts[id];
          winningId = id;
        }
      });

      // Special override or find match
      const matched = ANIMALS_DATA.find(a => a.id === winningId) || ANIMALS_DATA[0];
      setQuizResult(matched);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizResult(null);
    setQuizStarted(true);
  };

  // Calculator logic
  const ticketPrices = useMemo(() => {
    const entranceService = SERVICES_DATA.find(s => s.id === 'entrance');
    const basePrice = entranceService ? entranceService.price : 350;
    
    let subtotalEntrance = adults * basePrice;
    let addonsTotal = 0;

    selectedAddons.forEach(addonId => {
      const service = SERVICES_DATA.find(s => s.id === addonId);
      if (service) {
        if (addonId === 'feeding') {
          // One portion of food per person is a great default recommendation
          addonsTotal += service.price * adults;
        } else if (addonId === 'alpaca_vip' || addonId === 'deer_vip') {
          // Enclosure ticket is per person
          addonsTotal += service.price * adults;
        } else {
          // General add-on (like photography photo zone fee)
          addonsTotal += service.price;
        }
      }
    });

    const total = subtotalEntrance + addonsTotal;

    return {
      adultsCount: adults,
      basePrice,
      entranceTotal: subtotalEntrance,
      addonsTotal,
      total
    };
  }, [adults, selectedAddons]);

  // Toggle addon helper
  const toggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(prev => prev.filter(id => id !== addonId));
    } else {
      setSelectedAddons(prev => [...prev, addonId]);
    }
  };

  // Generate pre-filled WhatsApp link with booking data
  const whatsAppLink = useMemo(() => {
    const entranceService = SERVICES_DATA.find(s => s.id === 'entrance');
    const intro = `Привет, Альпаки-Дворик! 🦙\n\nХочу запланировать визит к вам:\n`;
    const details = `• Количество гостей: ${ticketPrices.adultsCount} чел.\n`;
    
    let addonsText = '';
    selectedAddons.forEach(addonId => {
      const s = SERVICES_DATA.find(x => x.id === addonId);
      if (s) {
        if (addonId === 'feeding') {
          addonsText += `• Кормление животных (${ticketPrices.adultsCount} порц.) — ${s.price * ticketPrices.adultsCount} ₽\n`;
        } else if (addonId === 'alpaca_vip' || addonId === 'deer_vip') {
          addonsText += `• ${s.name} (${ticketPrices.adultsCount} чел.) — ${s.price * ticketPrices.adultsCount} ₽\n`;
        } else {
          addonsText += `• ${s.name} — ${s.price} ₽\n`;
        }
      }
    });

    const summary = `\nСуммарная стоимость: *${ticketPrices.total} ₽*\n\nСкажите, пожалуйста, в какие часы лучше приехать и нужны ли паспорта для льгот? Спасибо!`;
    const fullMessage = `${intro}${details}${addonsText}${summary}`;
    
    return `https://wa.me/79896706060?text=${encodeURIComponent(fullMessage)}`;
  }, [ticketPrices, selectedAddons]);

  // Handle local contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactPhone('');
      setContactMessage('');
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans antialiased text-[#1C2D24] selection:bg-[#c5a059] selection:text-white pb-12">
      
      {/* 1. TOP BAR NOTIFICATION */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#121e17] text-white py-2 px-4 relative overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-medium gap-2">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c5a059] animate-pulse shrink-0" />
                <span>Единственный контактный дворик с альпаками в Дагестане прямо в черте города!</span>
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[#c5a059] hidden md:inline">🕒 Каждый день с 9:00 до 21:00</span>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="hover:text-[#c5a059] transition-colors p-1"
                  aria-label="Закрыть уведомление"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. BEAUTIFUL NAVIGATION / HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF6F0]/85 backdrop-blur-md border-b border-[#FAF6F0]/10 shadow-sm border-emerald-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#1C2D24] text-[#FAF6F0] flex items-center justify-center font-display text-lg sm:text-xl font-bold shadow-md">
              🦙
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#1C2D24]">
                Альпаки-Дворик
              </h1>
              <p className="text-[10px] sm:text-xs text-[#5A7365] font-semibold uppercase tracking-wider">
                Контактный зоопарк • Махачкала
              </p>
            </div>
          </div>

          {/* Quick Info & Social */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-[#E8F0EC] p-2 rounded-full text-[#1C2D24]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">ул. Джабраилова, 15</p>
                <p className="text-gray-500 font-mono text-[10px]">г. Махачкала (5-й посёлок)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="bg-[#E8F0EC] p-2 rounded-full text-[#1C2D24]">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">+7 (989) 670-60-60</p>
                <p className="text-gray-500 font-mono text-[10px]">alpaki.dvorik@yandex.ru</p>
              </div>
            </div>
          </div>

          {/* Call to action button */}
          <div className="flex items-center gap-2">
            <a 
              href="#calculator" 
              className="bg-[#c5a059] hover:bg-[#ab853f] text-white px-4 py-2 rounded-full font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Купить билет
            </a>
            <a 
              href="https://wa.me/79896706060"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full sm:px-3 sm:py-2 flex items-center gap-1.5 shadow-md text-xs sm:text-sm font-semibold transition-all"
              title="Написать в WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Soft background nature textures */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#ab853f_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#E2EDE8] border border-[#BBD7C8] text-[#1C2D24] px-4 py-1.5 rounded-full text-xs font-semibold self-center lg:self-start mb-6"
            >
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              Уютное пространство доброты и пушистых объятий
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C2D24] leading-tight"
            >
              Контактный зоопарк <br />
              <span className="text-[#c5a059] relative inline-block">
                «Альпаки-Дворик»
                <span className="absolute left-0 right-0 bottom-1 sm:bottom-2 h-1 bg-[#1C2D24] opacity-10 rounded"></span>
              </span> <br />
              в Махачкале
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-sm sm:text-base md:text-lg text-[#324D3D] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Единственный контактный зоопарк с настоящими альпаками и другими добрыми животными прямо в черте города. Вас ждут пушистые приключения, вкусное эко-кафе и яркие природные фотозоны для лучших воспоминаний!
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <a 
                href="#calculator"
                className="w-full xs:w-auto bg-[#1C2D24] hover:bg-[#294235] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Узнать цены и приехать
                <ChevronRight className="h-4 w-4" />
              </a>
              <a 
                href="https://wa.me/79896706060?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D1%82%D1%8C%20%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D0%B8%20%D0%BE%20%D0%BF%D0%BE%D1%81%D0%B5%D1%89%D0%B5%D0%BD%D0%B8%D0%B8%20%D0%B7%D0%BE%D0%BE%D0%BF%D0%B0%D1%80%D0%BA%D0%B0..."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full xs:w-auto bg-[#FAF6F0] hover:bg-[#E8F0EC] text-[#1C2D24] border-2 border-[#1C2D24] px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <MessageSquare className="h-4.5 w-4.5 text-[#1C2D24]" />
                Написать в WhatsApp
              </a>
            </motion.div>

            {/* Quick Benefits Tags */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0 border-t border-emerald-950/5 pt-6 text-left"
            >
              <div>
                <span className="font-display text-xl sm:text-2xl font-black text-[#1C2D24]">🦙 10+</span>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-1">Видов жителей</p>
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl font-black text-[#1C2D24]">🥗 100%</span>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-1">Экологичный корм</p>
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl font-black text-[#1C2D24]">🧒 0+</span>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-1">Для всех возрастов</p>
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl font-black text-[#1C2D24]">☕ Eco</span>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-1">Уютное кафе</p>
              </div>
            </motion.div>
          </div>

          {/* Right Showcase Banner Frame */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto max-w-[420px] lg:max-w-none shadow-2xl rounded-3xl overflow-hidden border-8 border-white bg-white group"
            >
              <div className="absolute inset-0 bg-[#1C2D24]/10 group-hover:bg-transparent transition-all duration-300 z-10"></div>
              {/* Using Unsplash high-quality Alpaca landscape photo as primary hero visual */}
              <img 
                src="https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop" 
                alt="Милая альпака у нас во дворике" 
                referrerPolicy="no-referrer"
                className="w-full h-[380px] sm:h-[450px] object-cover rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-700"
              />
              {/* Badge Overlay */}
              <div className="absolute top-4 right-4 z-20 bg-[#FAF6F0] border border-[#c5a059] px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <div className="text-left">
                  <p className="font-bold text-xs text-[#1C2D24]">Ждем в гости!</p>
                  <p className="text-[10px] text-gray-500">Махачкала, 5-й пос.</p>
                </div>
              </div>

              {/* Working hours badge on bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121e17] text-white p-3 rounded-xl shadow-lg flex items-center justify-between text-xs backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-[#c5a059]" />
                  <span>Работаем каждый день</span>
                </div>
                <span className="font-mono bg-[#c5a059] text-white px-2 py-0.5 rounded font-bold">09:00 - 21:00</span>
              </div>
            </motion.div>

            {/* Behind decorations */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#FAF6F0] border-4 border-[#c5a059]/25 rounded-full -z-10 animate-bounce" style={{ animationDuration: '4s' }}></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#FAF6F0] border-4 border-[#1C2D24]/10 rounded-full -z-10 animate-pulse"></div>
          </div>

        </div>
      </section>

      {/* 4. ABOUT SECTION (КТО МЫ) */}
      <section className="py-16 sm:py-24 bg-[#FAF6F0] border-t border-emerald-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
            
            {/* Left Graphics Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1597237154674-1a0d2274cef4?q=80&w=400&auto=format&fit=crop" 
                    alt="Енотик кушает сушеные фрукты" 
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                </div>
                <div className="bg-[#FAF6F0] border border-[#c5a059]/30 rounded-2xl p-5 shadow-inner text-center">
                  <p className="font-display text-3xl font-bold text-[#c5a059]">0 ₽</p>
                  <p className="text-xs font-semibold text-[#1C2D24] mt-1">Фотосессия на телефон или свою камеру</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-[#E8F0EC] border border-[#1C2D24]/15 rounded-2xl p-5 shadow-sm text-center">
                  <span className="text-3xl">☕</span>
                  <p className="font-bold text-[#1C2D24] text-sm mt-2">Кафе на территории</p>
                  <p className="text-[11px] text-gray-500 mt-1">Чай на горных травах, кофе и сладости</p>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=400&auto=format&fit=crop" 
                    alt="Милые кролики" 
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Information Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                <span className="h-1 bg-[#c5a059] w-4"></span> Кто мы такие
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C2D24] leading-tight">
                Островок кавказского гостеприимства и пушистого тепла
              </h2>
              
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                <p>
                  <strong>«Альпаки-Дворик»</strong> — это не обычный классический зооарк за железными решетками. Мы создали тёплое, семейное, открытое интерактивное пространство, где животные живут в просторных открытых вольерах, получают правильный уход, полноценный рацион и бесконечную любовь гостей.
                </p>
                <p>
                  Здесь вы можете зайти в вольеры к милым ручным альпакам и дружелюбным лесным оленятам, погладить шелковых кроликов, покормить забавных козлят с ладошки корм-смесью и насладиться грациозной красотой черных лебедей.
                </p>
                <p>
                  Наши питомцы приучены к общению с людьми, аккуратно ведут себя с детьми и очень любят обниматься. Для создания вашей идеальной прогулки мы обустроили зоны отдыха в экологичном стиле и открыли уютное семейное кафе с ароматным чаем и кофе.
                </p>
              </div>

              {/* Unique Features Icons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#E8F0EC] text-[#1C2D24] p-2 rounded-xl mt-1 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2D24]">Безопасно для аллергиков</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Шерсть альпак полностью гипоаллергенна.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#E8F0EC] text-[#1C2D24] p-2 rounded-xl mt-1 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2D24]">Прогулка без спешки</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Купив билет, вы можете гулять хоть весь день.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PERSONALITY MATCH MATCHING QUIZ */}
      <section className="py-16 bg-[#1C2D24] text-white rounded-[32px] mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-emerald-950/60 to-transparent pointer-events-none"></div>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="bg-[#c5a059] text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Интерактивный тест
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-4 mb-2">
            Какое ты животное сегодня?
          </h2>
          <p className="text-xs sm:text-sm text-[#BBD7C8] max-w-lg mx-auto mb-8 font-medium">
            Ответьте на 3 простых вопроса, и мы узнаем, на кого из обитателей дворика вы сегодня похожи больше всего!
          </p>

          <div className="bg-[#FAF6F0] text-[#1C2D24] rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-xl text-left border border-emerald-900/5">
            <AnimatePresence mode="wait">
              {!quizStarted ? (
                // INTRO SCREEN
                <motion.div 
                  key="quiz-intro"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-6"
                >
                  <div className="text-5xl mb-4">🔮</div>
                  <h4 className="font-display font-bold text-lg mb-2">Узнайте своего пушистого тотема!</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                    Это поднимет настроение и поможет найти животное, к которому вам обязательно стоит заглянуть в гости в первую очередь.
                  </p>
                  <button
                    onClick={() => {
                      setQuizStarted(true);
                      setQuizStep(0);
                      setQuizAnswers([]);
                      setQuizResult(null);
                    }}
                    className="bg-[#c5a059] hover:bg-[#ab853f] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider transition-all"
                  >
                    Пройти тест (1 минутка)
                  </button>
                </motion.div>
              ) : quizResult ? (
                // SUCCESS MATCH SCREEN
                <motion.div 
                  key="quiz-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <span className="text-xs font-black uppercase text-[#c5a059] tracking-widest">Тест завершен! Наш вердикт:</span>
                  <div className="text-6xl my-4 animate-bounce shrink-0">{quizResult.emoji}</div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1C2D24] mb-2">
                    Вы — кудрявый и ласковый {quizResult.name}!
                  </h3>
                  <div className="rounded-xl overflow-hidden max-w-xs mx-auto mb-4 border border-[#c5a059]/30 shadow">
                    <img 
                      src={quizResult.image} 
                      alt={quizResult.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-700 max-w-sm mx-auto leading-relaxed mb-4">
                    {quizResult.description} {quizResult.fullDescription.slice(0, 110)}...
                  </p>
                  <div className="bg-[#E8F0EC] p-3 rounded-xl text-left border border-[#1C2D24]/5 mb-6">
                    <p className="text-xs font-bold text-[#1C2D24]">💡 Забавный факт:</p>
                    <p className="text-[11px] text-[#294235] mt-0.5">{quizResult.funFact}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSelectedAnimal(quizResult);
                      }}
                      className="bg-[#1C2D24] hover:bg-[#294235] text-white px-4 py-2.5 rounded-lg text-xs font-bold"
                    >
                      Подробнее о моём тотеме
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="bg-transparent hover:bg-gray-150 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      Пройти заново
                    </button>
                  </div>
                </motion.div>
              ) : (
                // QUESTIONS STEP SCREEN
                <motion.div 
                  key={`quiz-step-${quizStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold border-b border-gray-100 pb-2">
                    <span>Вопрос {quizStep + 1} из {QUIZ_QUESTIONS.length}</span>
                    <span className="text-[#c5a059]">Готово: {Math.round(((quizStep) / QUIZ_QUESTIONS.length) * 100)}%</span>
                  </div>

                  <h4 className="font-display font-bold text-gray-800 text-sm sm:text-base py-2">
                    {QUIZ_QUESTIONS[quizStep].question}
                  </h4>

                  <div className="space-y-2.5">
                    {QUIZ_QUESTIONS[quizStep].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(option.animalId)}
                        className="w-full text-left p-3.5 rounded-xl border border-gray-200 hover:border-[#c5a059] hover:bg-[#FAF6F0] transition-all text-xs font-semibold text-gray-700 flex items-center gap-3 active:scale-[0.99]"
                      >
                        <span className="h-6 w-6 rounded-full bg-[#E8F0EC] text-xs font-bold text-[#1C2D24] flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option.text}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. OUR INHABITANTS SECTION (НАШИ ОБИТАТЕЛИ) */}
      <section id="residents" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059] bg-[#E8F0EC] px-3.5 py-1 rounded-full">
            Наши пушистые жители
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C2D24] tracking-tight">
            Познакомьтесь с нашими звёздами
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
            Каждый житель в Альпаки-Дворике имеет имя, характер и свои любимые привычки. Нажмите на карточку животного, чтобы узнать его историю и забавные факты!
          </p>

          {/* Filtering Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'Все обитатели 🌟' },
              { id: 'stars', label: 'Основные звёзды 🦙' },
              { id: 'forest', label: 'Лесные любимцы 🦌' },
              { id: 'birds', label: 'Пернатые друзья 🦢' },
              { id: 'small', label: 'Маленькие пушистики 🐇' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1C2D24] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1C2D24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnimals.map((animal) => (
              <motion.div
                key={animal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedAnimal(animal)}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#c5a059]/30 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
              >
                <div className="relative overflow-hidden h-52 sm:h-56 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent z-10 opacity-70"></div>
                  <img 
                    src={animal.image} 
                    alt={animal.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category overlay */}
                  <span className="absolute top-4 left-4 z-25 bg-[#FAF6F0] text-[#1C2D24] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
                    {animal.emoji} {animal.categoryLabel}
                  </span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-display font-extrabold text-lg group-hover:text-[#c5a059] transition-colors leading-tight text-[#1C2D24]">
                      {animal.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {animal.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>Любит: <span className="text-emerald-700 font-semibold">{animal.foodLike.split(',')[0]}</span></span>
                    <span className="text-[#c5a059] shrink-0 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Секреты <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 7. PRICES & SERVICES ENGINE (УСЛУГИ И ЦЕНЫ + ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР) */}
      <section id="calculator" className="py-16 sm:py-24 bg-[#E8F0EC] border-y border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1C2D24] bg-emerald-100 px-3.5 py-1 rounded-full">
              Прайс-лист и бронирование
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C2D24]">
              Наши честные цены и интерактивный расчёт
            </h2>
            <p className="text-xs sm:text-sm text-[#42594D] max-w-lg mx-auto">
              Никаких скрытых платежей! Соберите идеальный визит в реальном времени, рассчитайте точную стоимость и перейдите в WhatsApp для автоматического подтверждения.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Cost list (Услуги) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C2D24] flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-[#c5a059]" />
                Официальные цены зоопарка
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES_DATA.map((service) => (
                  <div 
                    key={service.id} 
                    className={`bg-white rounded-2xl p-5 border shadow-sm relative flex flex-col justify-between ${
                      service.popular ? 'border-[#c5a059]/40 ring-1 ring-[#c5a059]/10' : 'border-gray-100'
                    }`}
                  >
                    {service.popular && (
                      <span className="absolute top-3 right-3 bg-[#c5a059] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Популярно
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[#1C2D24]">{service.name}</h4>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline gap-1 bg-white">
                      <span className="font-display text-lg font-extrabold text-[#1C2D24]">
                        {service.price === 0 ? 'Бесплатно*' : `${service.price} ₽`}
                      </span>
                      {service.unit && (
                        <span className="text-[10px] text-gray-400 font-semibold italic">{service.unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Free Admission Box */}
              <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-amber-200/50 flex flex-col sm:flex-row items-start gap-4">
                <span className="text-3xl shrink-0">🎁</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1C2D24]">Бесплатное посещение и льготы</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Дети до 2-х лет, дети с ОВЗ, участники СВО и их дети отдыхают в нашем зоопарке совершенно бесплатно! <a href="#benefits" className="text-[#c5a059] font-bold underline hover:text-[#ab853f]">Узнать подробности ниже</a>.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: INTERACTIVE CALCULATOR ENGINE */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl sticky top-24 flex flex-col justify-between h-full">
                
                <div>
                  {/* Title Banner */}
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                    <div className="bg-[#1C2D24] text-white p-2.5 rounded-xl shrink-0">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-[#1C2D24]">Быстрый калькулятор</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Соберите свой сценарий</p>
                    </div>
                  </div>

                  {/* 1. Adult Count */}
                  <div className="space-y-3 mb-6">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-wider flex justify-between items-center">
                      <span>Количество гостей:</span>
                      <span className="text-[#1C2D24] font-mono text-[13px]">{adults} чел.</span>
                    </label>
                    <div className="flex items-center gap-3 bg-[#FAF6F0] p-1.5 rounded-xl border border-gray-150">
                      <button 
                        onClick={() => adults > 1 && setAdults(prev => prev - 1)}
                        className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-lg hover:border-[#1C2D24] transition-all"
                        aria-label="Уменьшить"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-extrabold text-sm text-[#1C2D24]">{adults}</span>
                      <button 
                        onClick={() => adults < 15 && setAdults(prev => prev + 1)}
                        className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-lg hover:border-[#1C2D24] transition-all"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 2. Choose Addons */}
                  <div className="space-y-2.5 mb-6">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-wider block">
                      Дополнительные услуги и VIP пропуски:
                    </label>

                    {SERVICES_DATA.filter(s => s.id !== 'entrance').map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-left group ${
                            isSelected 
                              ? 'bg-[#E8F0EC] border-[#1C2D24] scale-[1.01]' 
                              : 'bg-[#FAF6F0]/50 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {}} // toggled by parent div
                              className="mt-1 accent-[#1C2D24] pointer-events-none shrink-0"
                            />
                            <div>
                              <p className="font-bold text-xs text-[#1C2D24] flex items-center gap-1">
                                {addon.name}
                                {addon.id === 'feeding' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-mono">Топ</span>}
                              </p>
                              {addon.id === 'feeding' ? (
                                <p className="text-[10px] text-gray-400 mt-0.5">Классная порция корма каждому гостю</p>
                              ) : addon.id === 'alpaca_vip' || addon.id === 'deer_vip' ? (
                                <p className="text-[10px] text-gray-400 mt-0.5">Вход с гидом прямо в вольер</p>
                              ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5">{addon.description.slice(0, 50)}...</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0 ml-4 font-mono">
                            <p className="font-extrabold text-xs text-[#1C2D24]">
                              {addon.price === 0 ? '0 ₽' : `+ ${addon.price * (addon.id === 'photo_zone' ? 1 : adults)} ₽`}
                            </p>
                            {(addon.id === 'feeding' || addon.id === 'alpaca_vip' || addon.id === 'deer_vip') && (
                              <p className="text-[9px] text-gray-400">({addon.price}×{adults})</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Calculation Summary Footer inside Box */}
                <div className="border-t border-gray-100 pt-4 mt-4 bg-white">
                  <div className="space-y-1.5 text-xs text-gray-500 mb-4 font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Входные билеты ({adults} чел.):</span>
                      <span className="font-mono text-[#1C2D24]">{ticketPrices.entranceTotal} ₽</span>
                    </div>
                    {ticketPrices.addonsTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Дополнительные опции:</span>
                        <span className="font-mono text-[#1C2D24]">+ {ticketPrices.addonsTotal} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100 text-sm font-black text-[#1C2D24]">
                      <span>Итого к расчёту:</span>
                      <span className="font-display text-lg font-extrabold text-[#c5a059]">{ticketPrices.total} ₽</span>
                    </div>
                  </div>

                  <a 
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 px-4 font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/10 active:scale-[0.99]"
                  >
                    <MessageSquare className="h-4.5 w-4.5 text-white" />
                    Забронировать визит в WhatsApp
                  </a>
                  <p className="text-center text-[10px] text-gray-400 font-medium mt-2 leading-relaxed">
                    * Бронь бесплатная. Оплата происходит на кассе зоопарка. Приобретая билет, вы вносите вклад в правильное питание пушистиков! ❤️
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. SPECIAL OFFERS & BENEFITS (АКЦИИ И ЛЬГОТЫ) */}
      <section id="benefits" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
              <span className="h-1 bg-[#c5a059] w-4"></span> Льготы и условия
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C2D24] tracking-tight">
              Заботимся о каждом госте нашего круга
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
              Мы верим, что радость общения с живой природой должна быть доступна каждому. Именно поэтому у нас действуют постоянные льготы, полностью бесплатный проход для особых групп и персональные условия для проведения групповых туров.
            </p>

            <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#c5a059]/15 flex items-start gap-4">
              <span className="text-3xl">🚌</span>
              <div>
                <h4 className="font-bold text-sm text-[#1C2D24]">Групповые экскурсии</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  Для школьных классов, детских лагерей, детских садов и семейных праздников мы предлагаем особые сниженные цены на билеты, сопровождение кипера с лекциями и весёлые конкурсы. 
                </p>
                <a 
                  href="https://wa.me/79896706060?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D1%82%D1%8C%20%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D0%B4%D0%BB%D1%8F%20%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE%20%D0%BF%D0%BE%D1%81%D0%B5%D1%89%D0%B5%D0%BD%D0%B8%D1%8F..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#c5a059] font-bold text-xs mt-3 hover:underline"
                >
                  Обсудить условия в WhatsApp
                  <CornerRightUp className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SPECIAL_BENEFITS.map((benefit) => (
              <div 
                key={benefit.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="bg-[#E8F0EC] text-[#1C2D24] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
                    {benefit.badge || 'Акция'}
                  </span>
                  <h4 className="font-display font-extrabold text-sm sm:text-base text-[#1C2D24] mt-3">{benefit.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1 font-medium">
                    {benefit.description}
                  </p>
                </div>
                
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Вход в дворик:</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide text-[10px]">
                    {benefit.free ? '0 ₽ (Бесплатно)' : 'Скидка'}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. RULES SECTION (ПРАВИЛА ПОСЕЩЕНИЯ) */}
      <section className="py-16 sm:py-24 bg-[#1C2D24] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-3.5 py-1 rounded-full">
              Кодекс дружбы зоопарка
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Правила вежливого посещения
            </h2>
            <p className="text-xs sm:text-sm text-[#BBD7C8] max-w-lg mx-auto font-medium">
              Помните, мы в гостях у замечательных животных! Пожалуйста, ознакомьтесь с простыми правилами, чтобы ваш отдых был комфортным, а звери чувствовали себя прекрасно.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Allowed Rules (Green Column) */}
            <div className="bg-emerald-950/40 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-emerald-400 flex items-center gap-2 mb-6 pb-2 border-b border-emerald-900/30">
                  <Check className="h-5.5 w-5.5 text-emerald-400" />
                  Как подружиться с пушистиками?
                </h3>
                
                <div className="space-y-4">
                  {RULES_DATA.filter(r => r.type === 'do').map((rule, idx) => (
                    <div key={rule.id} className="flex gap-3">
                      <span className="h-5 w-5 rounded-full bg-emerald-900/50 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {rule.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-900/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 justify-center">
                <Utensils className="h-4.5 w-4.5" />
                <span>Животные будут бесконечно рады ласке!</span>
              </div>
            </div>

            {/* Forbidden Rules (Red Column) */}
            <div className="bg-red-950/20 border border-red-950/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-red-400 flex items-center gap-2 mb-6 pb-2 border-b border-red-950/25">
                  <AlertCircle className="h-5.5 w-5.5 text-red-500" />
                  Чего делать категорически не стоит:
                </h3>
                
                <div className="space-y-4">
                  {RULES_DATA.filter(r => r.type === 'dont').map((rule, idx) => (
                    <div key={rule.id} className="flex gap-3">
                      <span className="h-5 w-5 rounded-full bg-red-950/40 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {rule.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#3a1b1b]/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 justify-center">
                <Info className="h-4.5 w-4.5" />
                <span>За нарушение правил кипер может сделать предупреждение.</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 10. CONTACTS & INTEGRATED SIMULATED YANDEX/2GIS MAP */}
      <section id="contacts" className="py-16 sm:py-24 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Coordinates / Contacts Details column */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  <span className="h-1 bg-[#c5a059] w-4"></span> Контактная информация
                </span>
                <h2 className="font-display text-3xl font-bold text-[#1C2D24] tracking-tight mt-4 mb-2">
                  Как нас найти?
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mb-6">
                  Мы уютно расположились в черте города в Махачкале. К нам легко добраться как на личном авто, так и на общественном транспорте или такси. Ждём в гости всю вашу большую семью!
                </p>

                {/* Contact items block */}
                <div className="space-y-4">
                  
                  <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="bg-[#E8F0EC] text-[#1C2D24] p-3 rounded-xl shrink-0 self-start">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Наш адрес:</p>
                      <p className="font-bold text-sm text-[#1C2D24] mt-0.5">г. Махачкала, 5-й посёлок, ул. Джабраилова, д. 15</p>
                      <p className="text-xs text-gray-500 mt-1">Ориентир — тихий уединённый спальный район, идеальный для животных</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="bg-[#E8F0EC] text-[#1C2D24] p-3 rounded-xl shrink-0 self-start">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider font-mono">Телефон & WhatsApp:</p>
                      <p className="font-bold text-sm text-[#1C2D24] mt-0.5">+7 (989) 670-60-60</p>
                      <p className="text-xs text-brand-black-muted text-gray-500 mt-1 font-semibold">
                        Звоните нам или пишите круглосуточно. Отвечаем мгновенно в рабочее время!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="bg-[#E8F0EC] text-[#1C2D24] p-3 rounded-xl shrink-0 self-start">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Электронная почта:</p>
                      <p className="font-bold text-sm text-gray-700 mt-0.5 font-mono">alpaki.dvorik@yandex.ru</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Work Hours badge large */}
              <div className="bg-[#1C2D24] text-white p-5 rounded-2xl border border-emerald-900 shadow">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#c5a059]" />
                    <div>
                      <p className="font-bold">График работы:</p>
                      <p className="text-[#BBD7C8] font-medium text-[11px]">Без выходных и перерывов</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider bg-[#c5a059] text-white p-2.5 rounded-lg shrink-0">
                    09:00 - 21:00 ежедневно
                  </span>
                </div>
              </div>

            </div>

            {/* Right Map simulator & Location coordinates with action links */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl h-full flex flex-col justify-between">
                
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#1C2D24] mb-3">
                    Интерактивный навигатор маршрута
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Мы подготовили для вас точную и удобную карту. Вы можете нажать одну из кнопок ниже, чтобы проложить маршрут прямо в Яндекс.Навигаторе или приложении 2ГИС.
                  </p>

                  {/* Simulated Map Interface with accurate aesthetics */}
                  <div className="bg-[#E8F0EC] rounded-2xl border border-emerald-900/10 p-4 h-64 sm:h-72 relative overflow-hidden flex items-center justify-center">
                    
                    {/* Simulated contour design map */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#1C2D24_2px,transparent_2px)] [background-size:20px_20px] bg-sky-100"></div>
                    
                    {/* Simulated Roads Grid overlay (SVG representation) */}
                    <svg className="absolute inset-0 w-full h-full text-[#1C2D24]/10" style={{ pointerEvents: 'none' }}>
                      <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="6" />
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="12" />
                      <line x1="85%" y1="0" x2="85%" y2="100%" stroke="currentColor" strokeWidth="5" />
                      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="currentColor" strokeWidth="10" />
                      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="8" />
                      {/* Caspian Sea simulation on the right */}
                      <path d="M 85% 0 Q 90% 50% 95% 100% L 100% 100% L 100% 0 Z" fill="#c3e4f5" opacity="0.4" />
                    </svg>

                    {/* Landmark Tag Simulators */}
                    <div className="absolute top-10 left-6 bg-[#FAF6F0]/90 px-2 py-1 rounded text-[10px] font-bold text-gray-500 shadow-sm border border-gray-150">
                      🏢 5-й посёлок
                    </div>
                    <div className="absolute top-36 right-20 bg-[#FAF6F0]/90 px-2 py-1 rounded text-[10px] font-bold text-gray-500 shadow-sm border border-gray-150">
                      🌊 Каспийское море
                    </div>
                    <div className="absolute bottom-10 left-16 bg-[#FAF6F0]/90 px-2 py-1 rounded text-[10px] font-bold text-gray-500 shadow-sm border border-gray-150">
                      🛣️ просп. Шамиля
                    </div>

                    {/* Central Zoo Location Marker with Pulse animation */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="absolute -top-16 bg-[#121e17] text-[#FAF6F0] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl shrink-0 flex items-center gap-1 leading-none border border-[#c5a059]/40">
                        <span>Альпаки-Дворик</span>
                        <span className="text-[#c5a059]">🦙</span>
                      </div>
                      
                      {/* Pulse Circle */}
                      <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-red-400 opacity-30"></span>
                      
                      {/* Real Pin */}
                      <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl relative border-2 border-white">
                        <MapPin className="h-5 w-5 fill-white text-red-500 animate-bounce" />
                      </div>
                    </div>

                    {/* Map Coordinate overlay on bottom left */}
                    <div className="absolute bottom-3 left-3 bg-[#121e17]/85 text-white p-2 rounded text-[10px] font-mono leading-none backdrop-blur-md">
                      📍 42.9691° N, 47.4842° E
                    </div>

                  </div>
                </div>

                {/* Direct quick action buttons to construct the route */}
                <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                  
                  {/* Yandex Maps direct route button */}
                  <a
                    href="https://yandex.ru/maps/?rtext=~42.96913,47.484196"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#FAF6F0] hover:bg-[#E8F0EC] text-[#1C2D24] border border-gray-200 py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span>🌟 Построить в Яндекс.Картах</span>
                    <CornerRightUp className="h-3.5 w-3.5 text-[#1C2D24]" />
                  </a>

                  {/* 2GIS Map Route */}
                  <a
                    href="https://2gis.ru/makhachkala/search/42.96913,47.484196"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#FAF6F0] hover:bg-[#E8F0EC] text-[#1C2D24] border border-gray-200 py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span>🌿 Построить в 2ГИС</span>
                    <CornerRightUp className="h-3.5 w-3.5 text-[#1C2D24]" />
                  </a>

                </div>

              </div>
            </div>

          </div>

          {/* SVO & Guest Direct Contact Form inside page layout */}
          <div className="mt-16 bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#c5a059]/20 shadow">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#1C2D24]">Остались вопросы или хотите обсудить праздник?</h3>
              <p className="text-xs text-gray-500 max-w-lg mx-auto">
                Заполните форму, и наш приветливый администратор перезвонит вам в течение 10 минут, чтобы ответить на любые вопросы о проживании животных, ценах или проведении корпоративных съемок.
              </p>

              {contactSubmitted ? (
                <div className="bg-[#E8F0EC] text-[#1C2D24] p-6 rounded-2xl border border-[#BBD7C8] max-w-md mx-auto">
                  <div className="text-2xl">🎉</div>
                  <h4 className="font-bold text-sm mt-2">Спасибо за ваше обращение!</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Ваша заявка принята в систему. Мы уже завариваем горный чай и вот-вот вам позвоним! Пока можете спланировать маршрут у нас на карте.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
                  <input 
                    type="text" 
                    placeholder="Ваше имя"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-white border border-gray-200 focus:border-[#c5a059] outline-none text-xs rounded-xl px-4 py-3 text-[#1C2D24] "
                  />
                  <input 
                    type="tel" 
                    placeholder="Номер телефона"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="bg-white border border-gray-200 focus:border-[#c5a059] outline-none text-xs rounded-xl px-4 py-3 text-[#1C2D24] "
                  />
                  <button
                    type="submit"
                    className="bg-[#1C2D24] hover:bg-[#294235] text-white font-bold text-xs rounded-xl px-4 py-3 transition-colors shrink-0"
                  >
                    Перезвонить мне! 📞
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 11. IMMERSIVE ANIMAL DETAIL MODAL (ВСПЛЫВАЮЩЕЕ ОКНО ДЛЯ ИНФОРМАЦИИ) */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
          >
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-[#FAF6F0] rounded-[32px] overflow-hidden max-w-lg w-full shadow-2xl relative border border-emerald-900/5 flex flex-col justify-between"
            >
              
              {/* Image Frame */}
              <div className="relative h-48 sm:h-56 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-transparent to-transparent z-10"></div>
                <img 
                  src={selectedAnimal.image} 
                  alt={selectedAnimal.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Close Button top-right */}
                <button 
                  onClick={() => setSelectedAnimal(null)}
                  className="absolute top-4 right-4 z-30 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all border border-white/20 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Left Floating Category Tag */}
                <span className="absolute bottom-4 left-4 z-20 bg-emerald-900 text-white px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-md">
                  {selectedAnimal.emoji} {selectedAnimal.categoryLabel}
                </span>
              </div>

              {/* Contents Area */}
              <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#1C2D24] leading-tight">
                  Житель дворика: {selectedAnimal.name}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#42594D] leading-relaxed font-semibold">
                  {selectedAnimal.description}
                </p>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {selectedAnimal.fullDescription}
                </p>

                {/* Food Like and Fun Fact styled cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <div className="bg-[#E8F0EC] p-3.5 rounded-2xl border border-[#1C2D24]/5">
                    <span className="text-lg">🥕</span>
                    <h5 className="font-bold text-xs text-[#1C2D24] mt-1.5">Любимое лакомство:</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">{selectedAnimal.foodLike}</p>
                  </div>

                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-[#c5a059]/10">
                    <span className="text-lg">✨</span>
                    <h5 className="font-bold text-xs text-[#1C2D24] mt-1.5">Интересный факт:</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">{selectedAnimal.funFact}</p>
                  </div>
                </div>

              </div>

              {/* Footer action */}
              <div className="p-6 bg-white border-t border-gray-150/40 flex items-center gap-3 justify-between shrink-0 rounded-b-[32px]">
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">Хотите пообщаться?</p>
                  <p className="text-xs text-gray-500 font-semibold italic">Запишитесь к нам гулять!</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedAnimal(null)}
                    className="bg-transparent hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Понятно!
                  </button>
                  <a
                    href="#calculator"
                    onClick={() => {
                      setSelectedAnimal(null);
                      // Auto pre-select VIP addon if matching animal enclosure
                      if (selectedAnimal.id === 'alpaca' && !selectedAddons.includes('alpaca_vip')) {
                        setSelectedAddons(prev => [...prev, 'alpaca_vip']);
                      }
                      if (selectedAnimal.id === 'deer' && !selectedAddons.includes('deer_vip')) {
                        setSelectedAddons(prev => [...prev, 'deer_vip']);
                      }
                    }}
                    className="bg-[#c5a059] hover:bg-[#ab853f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow"
                  >
                    Встретиться 🦙
                  </a>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. FLOATING STATUTORY BOTTOM FOOTER */}
      <footer className="mt-16 border-t border-emerald-950/10 pt-10 pb-6 bg-[#121e17] text-white rounded-t-[40px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#c5a059] text-white flex items-center justify-center font-display text-lg font-bold shadow-md">
                🦙
              </div>
              <div>
                <h4 className="font-display font-black text-sm tracking-widest text-[#c5a059]">АЛЬПАКИ-ДВОРИК</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Контактный дворик в Махачкале</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Мы создаем теплое и уважительное пространство, где каждый гость может прикоснуться к частичке дружелюбной дикой природы и ощутить умиротворение от общения с милыми альпаками.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="font-display font-extrabold text-xs text-[#c5a059] uppercase tracking-wider">Навигация по сайту</h5>
            <ul className="space-y-1.5 text-xs text-gray-400 font-semibold font-sans">
              <li><a href="#" className="hover:text-white transition-colors">Главный экран</a></li>
              <li><a href="#residents" className="hover:text-white transition-colors">Наши обитатели</a></li>
              <li><a href="#calculator" className="hover:text-white transition-colors">Цены и услуги</a></li>
              <li><a href="#benefits" className="hover:text-white transition-colors">Специальные льготы</a></li>
              <li><a href="#contacts" className="hover:text-white transition-colors">Как к нам добраться</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h5 className="font-display font-extrabold text-xs text-[#c5a059] uppercase tracking-wider">Контакты в один клик</h5>
            <div className="space-y-2 text-xs text-gray-400 font-medium">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#c5a059]" />
                <span>г. Махачкала, ул. Джабраилова, д. 15</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#c5a059]" />
                <a href="tel:+79896706060" className="hover:text-white transition-colors font-mono font-bold font-sans">+7 (989) 670-60-60</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#c5a059]" />
                <a href="mailto:alpaki.dvorik@yandex.ru" className="hover:text-white transition-colors font-mono">alpaki.dvorik@yandex.ru</a>
              </p>
            </div>
            
            {/* Built for live checkouts */}
            <div className="pt-2">
              <span className="text-[10px] text-gray-500 font-mono tracking-wide">
                © {new Date().getFullYear()} Контактный дворик «Альпаки-Дворик». Все права сохранены.
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
