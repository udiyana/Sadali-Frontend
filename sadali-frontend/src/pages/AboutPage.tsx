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
    { id: 'sani', name: 'Sani', role: 'Lead Therapist', image: '/images/Sani.jpg', description: 'Over 8 years of therapeutic Balinese healing mastery and pressure-point wellness.' },
    { id: 'budi', name: 'Budi', role: 'Senior Therapist', image: '/images/Budi.jpg', description: 'Certified Balinese ritual practitioner dedicated to restoring muscle harmony.' },
    { id: 'nanda', name: 'Nanda', role: 'Hair & Beauty Specialist', image: '/images/Nanda.jpg', description: 'Expert in botanical cream baths, scalp rejuvenation, and modern styling techniques.' },
    { id: 'dewi', name: 'Ayu Dewi', role: 'Nail & Care Artisan', image: '/images/Manicure-Pedicure.jpeg', description: 'Precision aesthetician specializing in luxury spa manicures and flower foot rituals.' },
    { id: 'surya', name: 'Komang Surya', role: 'Holistic Therapist', image: '/images/Model.JPG', description: 'Blends handcrafted Balinese essential oils and herbal compresses for mindfulness.' }
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
        <main className="bg-[#f6f6f4] min-h-screen text-[#3d3b38]">
            {/* Hero Banner */}
            <section
                className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col justify-between mt-16 md:mt-20"
                style={{ backgroundImage: "url('/images/About-bg.jpg')" }}
            >
                <div className="w-full h-14 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                <div className="w-full h-24 md:h-28 bg-gradient-to-t from-[#f6f6f4] via-[#f6f6f4]/50 to-transparent pointer-events-none" />
            </section>

            {/* Intro Section */}
            <section className="pt-8 pb-20 px-6 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center mb-4"
                >
                    <img src="/images/Logo-Sadali.png" alt="SADALI" className="h-16 md:h-20 object-contain mb-3" />
                </motion.div>
                <div className="text-xs md:text-sm tracking-[0.2em] font-semibold uppercase mb-6 text-[#5a4033]">
                    The Sadali Experience
                </div>
                <h2 className="text-3xl md:text-[46px] font-serif text-[#2b2927] font-normal leading-[1.2] mb-8">
                    Crafting Authentic Balinese Healing<br />&amp; Beauty inside Bali Collection
                </h2>
                <div className="space-y-6 text-[#3d3b38]/85 text-base md:text-[18px] leading-relaxed max-w-3xl mx-auto font-light">
                    <p>Welcome to Sadali Spa &amp; Salon, widely celebrated as the best spa in Nusa Dua. Tucked inside the serene grounds of Bali Collection, our sanctuary was created to provide a tranquil escape from island exploration.</p>
                    <p>Whether you are searching for a restorative massage near me after a day on the beach or seeking a full beauty refresh at a top salon near me, we welcome you to experience pure relaxation.</p>
                </div>
            </section>

            {/* Lounge Banner */}
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                    className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] overflow-hidden rounded-xs shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-[#3d3b38]/10 group"
                >
                    <img
                        src="/images/about-lounge-banner.jpg"
                        alt="Sadali Spa Relaxation Lounge"
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                </motion.div>
            </section>

            {/* Team Carousel - Smooth AnimatePresence with direction */}
            <section className="py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-[#f6f6f4] via-[#faf8f5] to-[#f6f6f4]">
                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-[44px] font-serif font-bold text-[#2b2927] leading-tight mb-3">
                        Meet Our<br />Professional Team
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base font-light max-w-md mx-auto">
                        Dedicated therapists and stylists providing exceptional care for your spa near me experience.
                    </p>
                </div>

                <div
                    className="relative max-w-4xl mx-auto flex items-center justify-center select-none"
                    style={{ minHeight: '520px' }}
                >
                    {/* Left Arrow - SVG Chevron */}
                    <button
                        onClick={handlePrev}
                        aria-label="Previous Team Member"
                        className="absolute left-0 sm:-left-6 md:-left-14 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none border border-[#e8e2da]"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d3b38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div className="relative w-full flex items-center justify-center" style={{ height: '480px' }}>

                        {/* Side Card Left */}
                        <div
                            className="hidden sm:block absolute z-10 cursor-pointer"
                            style={{ left: '2%', transform: 'translateX(-5%) scale(0.84)', opacity: 0.42 }}
                            onClick={handlePrev}
                        >
                            <div className="w-[190px] md:w-[215px] h-[290px] md:h-[330px] rounded-xs overflow-hidden shadow-lg hover:opacity-65 transition-opacity duration-300 relative">
                                <img src={getMemberImage(prevMember)} alt={prevMember.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                            </div>
                        </div>

                        {/* Center Card with AnimatePresence */}
                        <div className="relative z-30" style={{ width: '310px', height: '460px' }}>
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
                                    className="absolute inset-0 rounded-xs overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.28)] flex flex-col bg-[#1f150e] cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex-1 overflow-hidden relative">
                                        <img
                                            src={getMemberImage(currentMember)}
                                            alt={currentMember.name}
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="bg-[#d6b77c] px-5 py-4 flex items-center justify-between shadow-md shrink-0">
                                        <span className="font-serif text-xl md:text-2xl font-bold text-[#2b2927] truncate">
                                            {currentMember.name}
                                        </span>
                                        <span className="text-xs font-medium text-[#3d3b38]/80 tracking-wide text-right ml-2 shrink-0">
                                            {currentMember.role}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Side Card Right */}
                        <div
                            className="hidden sm:block absolute z-10 cursor-pointer"
                            style={{ right: '2%', transform: 'translateX(5%) scale(0.84)', opacity: 0.42 }}
                            onClick={handleNext}
                        >
                            <div className="w-[190px] md:w-[215px] h-[290px] md:h-[330px] rounded-xs overflow-hidden shadow-lg hover:opacity-65 transition-opacity duration-300 relative">
                                <img src={getMemberImage(nextMember)} alt={nextMember.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Right Arrow - SVG Chevron */}
                    <button
                        onClick={handleNext}
                        aria-label="Next Team Member"
                        className="absolute right-0 sm:-right-6 md:-right-14 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none border border-[#e8e2da]"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d3b38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center items-center gap-2.5 mt-8 mb-14">
                    {teamMembers.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDot(idx)}
                            className={`transition-all duration-400 cursor-pointer focus:outline-none ${
                                idx === currentIndex
                                    ? 'w-8 h-2 bg-[#2b2927] rounded-full'
                                    : 'w-2 h-2 bg-[#8c6753]/40 hover:bg-[#8c6753] rounded-full'
                            }`}
                            aria-label={`Go to staff slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Sub-Banner CTA */}
                <div className="max-w-2xl mx-auto px-4 mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 mb-2">
                        Elevate Your Vacation Experience
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif text-[#2b2927] leading-tight mb-8">
                        Discover the Most Recommended Massage Spa<br className="hidden sm:inline" /> Near Me in Nusa Dua
                    </h3>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button
                            onClick={() => onOpenBooking('Body Massage')}
                            className="bg-gold text-[#3d3b38] px-12 py-3.5 text-base font-medium transition hover:bg-[#d6b77c] shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer w-full sm:w-auto"
                        >
                            Book Now
                        </button>
                        <button
                            onClick={() => onNavigate('home', 'treatments')}
                            className="bg-transparent border border-[#3d3b38]/30 text-[#3d3b38] px-10 py-3.5 text-base font-medium transition hover:bg-[#3d3b38] hover:text-white hover:scale-105 active:scale-95 duration-200 cursor-pointer w-full sm:w-auto"
                        >
                            View Treatments
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Guests Love Section */}
            <section className="py-24 px-4 bg-[#f6f6f4] border-t border-[#3d3b38]/10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-[42px] font-serif font-bold text-[#2b2927] text-center mb-16 leading-tight">
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
                                className="border border-[#c5b59f]/80 bg-white/40 shadow-sm hover:shadow-xl transition-all duration-400 group overflow-hidden flex flex-col"
                            >
                                <div className="h-[210px] md:h-[230px] overflow-hidden">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-7 md:p-8 flex-1 flex flex-col justify-start">
                                    <h3 className="text-xl md:text-[22px] font-serif font-bold text-[#2b2927] mb-3 group-hover:text-gold transition-colors leading-tight">
                                        {card.title}
                                    </h3>
                                    <p className="text-[#3d3b38]/80 text-sm md:text-[15px] leading-relaxed font-light">
                                        {card.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
