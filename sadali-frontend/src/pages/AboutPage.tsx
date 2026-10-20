import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    description?: string;
}

const teamMembersData: TeamMember[] = [
    { id: 'andi', name: 'Andi', role: 'Lead Therapist', image: '/images/Andi.jpg', description: 'Over 8 years of therapeutic Balinese healing mastery and pressure-point wellness.' },
    { id: 'budi', name: 'Budi', role: 'Senior Therapist', image: '/images/Budi.jpg', description: 'Certified Balinese ritual practitioner dedicated to restoring muscle harmony.' },
    { id: 'nanda', name: 'Nanda', role: 'Hair & Beauty Specialist', image: '/images/Nanda.jpg', description: 'Expert in botanical cream baths, scalp rejuvenation, and modern styling techniques.' },
    { id: 'dewi', name: 'Ayu Dewi', role: 'Nail & Care Artisan', image: '/images/ayu.jpg', description: 'Precision aesthetician specializing in luxury spa manicures and flower foot rituals.' },
    { id: 'eka', name: 'Komang Eka', role: 'Holistic Therapist', image: '/images/eka.jpg', description: 'Blends handcrafted Balinese essential oils and herbal compresses for mindfulness.' }
];

const getMemberImage = (member: TeamMember) =>
    member.image && member.image.trim() !== '' ? member.image : '/images/Sani.jpg';

interface AboutPageProps {
    onNavigate: (page: 'home' | 'about' | 'treatments', sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 340 : -340, opacity: 0, scale: 0.88 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -340 : 340, opacity: 0, scale: 0.88 }),
};

const swipeConfidenceThreshold = 8000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function AboutPage({ onNavigate, onOpenBooking }: AboutPageProps) {
    const teamMembers = teamMembersData;
    const [[currentIndex, direction], setPage] = useState([0, 0]);
    const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wrapIndex = (idx: number) => ((idx % teamMembers.length) + teamMembers.length) % teamMembers.length;

    const resetTimer = () => {
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        autoTimerRef.current = setInterval(() => setPage(([prev]) => [wrapIndex(prev + 1), 1]), 7000);
    };

    const handlePrev = () => { setPage(([prev]) => [wrapIndex(prev - 1), -1]); resetTimer(); };
    const handleNext = () => { setPage(([prev]) => [wrapIndex(prev + 1), 1]); resetTimer(); };
    const handleDot = (idx: number) => {
        const dir = idx > currentIndex ? 1 : -1;
        setPage([idx, dir]);
        resetTimer();
    };

    useEffect(() => {
        autoTimerRef.current = setInterval(() => setPage(([prev]) => [wrapIndex(prev + 1), 1]), 7000);
        return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); };
    }, []);

    const currentMember = teamMembers[currentIndex];
    const prevMember = teamMembers[wrapIndex(currentIndex - 1)];
    const nextMember = teamMembers[wrapIndex(currentIndex + 1)];

    const loveCards = [
        { id: 1, image: '/images/Scrub-Mask.jpg', title: 'Authentic Balinese Rituals', text: 'Every treatment at Sadali is rooted in centuries-old Balinese traditions, from aromatic herbal compresses to rhythmic massage techniques passed down through generations.' },
        { id: 2, image: '/images/Manicure-Pedicure.jpeg', title: 'Premium Nail Artistry', text: 'Our nail artisans craft exquisite manicure and pedicure experiences using only organic, botanically sourced products, leaving your hands and feet feeling silky and renewed.' },
        { id: 3, image: '/images/Short-Treatment.JPG', title: 'Tranquil Sanctuary', text: 'Sadali offers an unmatched atmosphere of serenity inside Bali Collection, where each visit feels like stepping into a private island retreat tailored exclusively for you.' }
    ];

    return (
        <main className="bg-gradient-to-b from-[#FAF5EB] via-[#F4E3C5] via-[#EED6AC] via-[#FAF2E1] to-[#E2C28F] min-h-screen text-[#3d3b38]">
            {/* Hero Banner matching Image 1 exact crop & mist fade */}
            <section className="relative w-full h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] overflow-hidden flex flex-col items-center justify-start text-center">
                {/* Background Image Container with exact crop and seamless mist fade */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/images/about-hero-cropped.jpg"
                        alt="About Sadali Spa & Salon Nusa Dua"
                        className="w-full h-full object-cover object-[center_86%] sm:object-[center_84%]"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.5) 92%, rgba(0,0,0,0) 100%)',
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.5) 92%, rgba(0,0,0,0) 100%)',
                        }}
                    />
                    {/* Atmospheric Dark Tint for Text Contrast */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0) 80%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0) 80%)'
                    }} />
                    {/* Cream mist fade at bottom matching design */}
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#FAF2E1] via-[#FAF2E1]/70 to-transparent pointer-events-none" />
                </div>

                {/* Hero Text Content matching Image 3 (original design) */}
                <div className="relative z-10 max-w-2xl px-4 flex flex-col items-center justify-center pt-32 sm:pt-36 md:pt-40 lg:pt-44">
                    <h1 className="text-4xl sm:text-5xl md:text-[56px] font-serif text-[#EBD5B3] mb-3 leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] tracking-wide font-normal">
                        About Sadali
                    </h1>
                    <p className="text-[#FAF3E6]/95 text-sm sm:text-base md:text-[16px] font-light max-w-lg mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                        Your sanctuary for authentic Balinese healing, luxury beauty rituals,<br className="hidden sm:inline" /> and holistic wellness Nusa Dua.
                    </p>
                </div>
            </section>

            {/* Intro Section matching Image 1 & 3 */}
            <section className="pt-8 pb-20 px-6 text-center max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-6">
                    <img src="/images/Logo-Sadali.png" alt="SADALI" className="h-16 md:h-20 object-contain mb-3" />
                </div>
                <div className="text-xs md:text-sm tracking-[0.2em] font-medium uppercase mb-6 text-[#5a4033]">
                    The Sadali Experience
                </div>
                <h2 className="text-3xl md:text-[44px] font-serif text-[#2b2927] font-normal leading-[1.25] mb-8">
                    Crafting Authentic Balinese Healing<br />&amp; Beauty inside Bali Collection
                </h2>
                <div className="space-y-6 text-gray-700 text-base md:text-[17px] leading-relaxed max-w-3xl mx-auto font-light">
                    <p>Welcome to Sadali Spa &amp; Salon, widely celebrated as the best spa in Nusa Dua. Tucked inside the serene grounds of Bali Collection, our sanctuary was created to provide a tranquil escape from island exploration.</p>
                    <p>Whether you are searching for a restorative massage near me after a day on the beach or seeking a full beauty refresh at a top salon near me, we welcome you to experience pure relaxation.</p>
                </div>
            </section>

            {/* Lounge Banner */}
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24">
                <div className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] overflow-hidden rounded-2xl shadow-[0_15px_40px_rgba(74,53,37,0.12)] border border-[#3d3b38]/10 group">
                    <img
                        src="/images/Background-2.jpg"
                        alt="Sadali Spa Relaxation Lounge"
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                </div>
            </section>

            {/* Team Carousel - Tight Overlap Spacing matching Image 2 */}
            <section className="py-20 px-4 text-center overflow-hidden">
                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-[44px] font-serif font-normal text-[#2b2927] leading-tight mb-3">
                        Meet Our<br />Professional Team
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base font-light max-w-md mx-auto">
                        Dedicated therapists and stylists providing exceptional care for your spa near me experience.
                    </p>
                </div>

                <div className="relative max-w-2xl mx-auto flex items-center justify-center select-none min-h-[480px]">
                    {/* Left Arrow - Clean Chevron matching Image 2 */}
                    <button
                        onClick={handlePrev}
                        aria-label="Previous Team Member"
                        className="absolute left-0 sm:left-4 md:-left-8 z-40 p-2 text-[#3d3b38]/70 hover:text-[#3d3b38] transition cursor-pointer focus:outline-none"
                    >
                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="relative w-full h-[450px] flex items-center justify-center">
                        {/* Side Card Left (Tight overlap matching Image 2) */}
                        <div
                            onClick={handlePrev}
                            className="absolute z-10 cursor-pointer transition-all duration-500 ease-out left-1/2 -translate-x-[118%] sm:-translate-x-[115%] scale-[0.88] opacity-50 hover:opacity-75"
                            style={{ width: '280px', height: '420px' }}
                        >
                            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg flex flex-col bg-[#1f150e]">
                                <div className="flex-1 overflow-hidden relative">
                                    <img src={getMemberImage(prevMember)} alt={prevMember.name} className="w-full h-full object-cover filter brightness-95" />
                                    <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                                </div>
                                <div className="bg-[#D8B97E] px-5 py-3.5 flex items-center justify-between shrink-0">
                                    <span className="font-serif text-xl font-bold text-[#2b2927] truncate">{prevMember.name}</span>
                                    <span className="text-xs font-medium text-[#2b2927]/90 tracking-wide">{prevMember.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Center Active Card matching Image 2 */}
                        <div className="relative z-30" style={{ width: '300px', height: '450px' }}>
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentMember.id}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: 'spring', stiffness: 260, damping: 28 },
                                        opacity: { duration: 0.22 },
                                        scale: { duration: 0.28 },
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.12}
                                    onDragEnd={(_e, { offset, velocity }) => {
                                        const swipe = swipePower(offset.x, velocity.x);
                                        if (swipe < -swipeConfidenceThreshold) handleNext();
                                        else if (swipe > swipeConfidenceThreshold) handlePrev();
                                    }}
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(74,59,50,0.25)] flex flex-col bg-[#1f150e] cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex-1 overflow-hidden relative">
                                        <img
                                            src={getMemberImage(currentMember)}
                                            alt={currentMember.name}
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="bg-[#D8B97E] px-5 py-4 flex items-center justify-between shrink-0">
                                        <span className="font-serif text-2xl font-bold text-[#2b2927] truncate">
                                            {currentMember.name}
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-[#2b2927]/90 tracking-wide ml-2 shrink-0">
                                            {currentMember.role}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Side Card Right (Tight overlap matching Image 2) */}
                        <div
                            onClick={handleNext}
                            className="absolute z-10 cursor-pointer transition-all duration-500 ease-out left-1/2 translate-x-[18%] sm:translate-x-[15%] scale-[0.88] opacity-50 hover:opacity-75"
                            style={{ width: '280px', height: '420px' }}
                        >
                            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg flex flex-col bg-[#1f150e]">
                                <div className="flex-1 overflow-hidden relative">
                                    <img src={getMemberImage(nextMember)} alt={nextMember.name} className="w-full h-full object-cover filter brightness-95" />
                                    <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                                </div>
                                <div className="bg-[#D8B97E] px-5 py-3.5 flex items-center justify-between shrink-0">
                                    <span className="font-serif text-xl font-bold text-[#2b2927] truncate">{nextMember.name}</span>
                                    <span className="text-xs font-medium text-[#2b2927]/90 tracking-wide">{nextMember.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Arrow - Clean Chevron matching Image 2 */}
                    <button
                        onClick={handleNext}
                        aria-label="Next Team Member"
                        className="absolute right-0 sm:right-4 md:-right-8 z-40 p-2 text-[#3d3b38]/70 hover:text-[#3d3b38] transition cursor-pointer focus:outline-none"
                    >
                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dots Indicator matching Image 2 */}
                <div className="flex justify-center items-center gap-2.5 mt-8 mb-14">
                    {teamMembers.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDot(idx)}
                            className={`transition-all duration-400 cursor-pointer focus:outline-none ${
                                idx === currentIndex
                                    ? 'w-8 h-2 bg-[#D8B97E] rounded-full'
                                    : 'w-2 h-2 bg-[#d1c5b8] hover:bg-[#b8a99a] rounded-full'
                            }`}
                            aria-label={`Go to staff slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Sub-Banner CTA matching Image 2 */}
                <div className="max-w-2xl mx-auto px-4 mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 mb-2">
                        Elevate Your Vacation Experience
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif text-[#2b2927] leading-tight mb-8">
                        Discover the Most Recommended Massage Spa<br className="hidden sm:inline" /> Near Me in Nusa Dua
                    </h3>
                    <div className="flex justify-center items-center">
                        <button
                            onClick={() => onOpenBooking('Body Massage')}
                            className="bg-[#4A3525] text-white px-14 py-3.5 text-base font-medium transition hover:bg-[#382619] shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Guests Love Section matching Photo 1 */}
            <section className="py-24 px-4 bg-gradient-to-b from-[#FAF2E1] via-[#F4E3C5] via-[#EED6AC] to-[#FAF2E1] border-t border-[#3d3b38]/10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-[44px] font-serif font-normal text-[#2b2927] text-center mb-16 leading-tight">
                        Why Guests Love Sadali<br />Spa &amp; Salon
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {loveCards.map((card, idx) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="bg-[#FDFBF7] rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(74,53,37,0.06)] border border-[#e8dfd3]/80 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                                onClick={() => onNavigate('treatments')}
                            >
                                <div className="h-[180px] sm:h-[200px] rounded-xl overflow-hidden mb-4">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2b2927] mb-2 leading-snug">
                                    {card.title}
                                </h3>
                                <p className="text-[#5c544d] text-xs sm:text-sm leading-relaxed font-light mb-4 flex-1">
                                    {card.text}
                                </p>
                                <div className="flex justify-end pt-2">
                                    <div className="w-8 h-8 rounded-full bg-[#E5C992] group-hover:bg-[#d8b87a] flex items-center justify-center text-[#4A3222] transition shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
