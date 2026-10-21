import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageProps {
    onNavigate: (page: 'home' | 'about' | 'treatments', sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function HomePage({ onNavigate, onOpenBooking }: HomePageProps) {
    const [expandedService, setExpandedService] = useState<string | null>(null);

    const services = [
        {
            id: 'body-massage',
            name: 'Body Massage',
            titleHtml: <>Body<br />Massage</>,
            image: '/images/Body-Massage.jpg',
            heightClass: 'h-[330px] md:h-[390px] md:mt-[60px]',
            description: 'Indulge in a deeply restorative full-body massage that melts away tension with warm Balinese herbal oils, soothing strokes, and time-honored pressure techniques.',
        },
        {
            id: 'scrub-mask',
            name: 'Scrub & Mask',
            titleHtml: <>Scrub<br />& Mask</>,
            image: '/images/Scrub-Mask.jpg',
            heightClass: 'h-[340px] md:h-[440px] md:mt-[110px]',
            description: 'Revitalize your skin with our signature botanical scrub and organic herbal mask ritual, leaving your complexion luminous, silky, and deeply nourished.',
        },
        {
            id: 'hair-treatment',
            name: 'Hair Treatment',
            titleHtml: <>Hair<br />Treatment</>,
            image: '/images/Hair-Treatment.jpg',
            heightClass: 'h-[340px] md:h-[465px] md:mt-[135px]',
            description: 'Restore radiance and strength to your hair with our luxurious hair spa and cream bath treatment, enriched with tropical botanical extracts and essential oils.',
        },
        {
            id: 'manicure-pedicure',
            name: 'Manicure & Pedicure',
            titleHtml: <>Manicure<br />& Pedicure</>,
            image: '/images/Manicure-Pedicure.jpeg',
            heightClass: 'h-[360px] md:h-[490px] md:mt-[0px]',
            description: 'Pamper your hands and feet with our meticulous manicure and pedicure service, featuring premium organic products and impeccable finishing that lasts.',
        },
        {
            id: 'kids-menu',
            name: 'Kids Menu',
            titleHtml: (
                <span className="flex flex-col items-start">
                    <span className="text-gold/90 text-2xl leading-none mb-1"></span>
                    Kids Menu
                </span>
            ),
            image: '/images/Kids-Menu.JPG',
            heightClass: 'h-[380px] md:h-[530px] md:mt-[130px]',
            description: 'A gentle and playful wellness experience designed especially for children, helping little ones relax and enjoy the magic of a luxury spa in a safe, caring environment.',
        },
        {
            id: 'short-treatment',
            name: 'Short Treatment',
            titleHtml: <>Short<br />Treatment</>,
            image: '/images/Short-Treatment.JPG',
            heightClass: 'h-[340px] md:h-[445px] md:mt-[75px]',
            description: 'Perfect for a quick escape — our express relaxation treatment targets key tension areas for a swift yet deeply satisfying sense of renewal and calm.',
        }
    ];

    const experienceSlides = [
        {
            image: '/images/Spa-room.jpg',
            text1: 'Experience world-class rejuvenation and tranquil ambiance.',
            text2: 'Curated wellness treatments nestled in Bali Collection',
            text3: 'designed for your ultimate peace.'
        },
        {
            image: '/images/Spa-room-1.jpg',
            text1: 'Authentic botanical healing and warm herbal aromatherapy.',
            text2: 'Restoring mind, body, and soul through timeless rituals',
            text3: 'at Sadali Spa & Salon.'
        },
        {
            image: '/images/Spa-room-2.jpg',
            text1: 'Nourish your body with organic botanicals.',
            text2: 'Our signature scrub and mask treatments rejuvenate',
            text3: 'and leave your skin glowing.'
        }
    ];

    const [experienceIndex, setExperienceIndex] = useState(0);

    const nextExperience = () => {
        setExperienceIndex((prev) => (prev + 1) % experienceSlides.length);
    };

    const prevExperience = () => {
        setExperienceIndex((prev) => (prev - 1 + experienceSlides.length) % experienceSlides.length);
    };

    const expandedData = services.find((s) => s.id === expandedService);

    return (
        <main className="bg-gradient-to-b from-[#FAF5EB] via-[#F4E3C5] via-[#EED6AC] via-[#FAF2E1] to-[#E2C28F] text-[#3d3b38] overflow-hidden">
            {/* Hero Section matching Image 1 */}
            <section id="home" className="relative min-h-[640px] md:h-[720px] flex items-center justify-center text-center overflow-hidden">
                {/* Background Image matching Image 1 */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/images/About-bg.jpg"
                        alt="Sadali Spa & Salon Nusa Dua Bali Collection"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Atmospheric Dark & Warm Gradient Overlay blending smoothly to cream at bottom */}
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-[#FAF5EB] via-black/25 to-black/45 pointer-events-none"></div>
                </div>

                {/* Left & Right Chevrons matching Image 1 */}
                <button
                    onClick={() => onNavigate('home', 'treatments')}
                    className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
                    aria-label="Previous"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={() => onNavigate('home', 'treatments')}
                    className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
                    aria-label="Next"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl px-4 flex flex-col items-center pt-24 pb-32 md:py-28">
                    <h1 className="text-4xl sm:text-5xl md:text-[58px] font-serif text-[#FBF6ED] mb-5 leading-[1.15] drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)] tracking-wide">
                        Rejuvenate at the Best Spa in<br />Nusa Dua
                    </h1>
                    <p className="text-[#FBF6ED]/95 text-base sm:text-lg md:text-xl font-light mb-8 max-w-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-relaxed">
                        Experience authentic Balinese massage spa treatments, luxury nail<br className="hidden md:inline" /> care, and holistic wellness Nusa Dua rituals at Sadali Spa &amp; Salon.
                    </p>
                    <button
                        onClick={() => onOpenBooking('Body Massage')}
                        className="bg-[#E5C989] text-[#3d3b38] px-12 py-3.5 text-base sm:text-lg font-medium transition hover:bg-[#d6b77c] shadow-2xl hover:scale-105 active:scale-95 duration-200 cursor-pointer rounded-xs"
                    >
                        Book Now
                    </button>

                    {/* Carousel indicator dots matching Image 1 */}
                    <div className="flex items-center gap-2 mt-8">
                        <span className="w-2 h-2 rounded-full bg-white/60"></span>
                        <span className="w-8 h-2 rounded-full bg-white"></span>
                        <span className="w-2 h-2 rounded-full bg-white/60"></span>
                    </div>
                </div>

                {/* Stats Bar with rounded corners matching Image 1 */}
                <div className="absolute -bottom-16 w-full max-w-5xl mx-auto px-4 left-0 right-0 z-20">
                    <div className="bg-[#FAF5EB] shadow-[0_15px_45px_rgba(74,53,37,0.12)] border border-[#E8D7B8]/70 py-10 px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[#3d3b38] rounded-2xl backdrop-blur-sm">
                        <div className="border-r border-[#3d3b38]/15 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">3+</div>
                            <div className="text-[14px] text-gray-600">Years of Excellence</div>
                        </div>
                        <div className="border-r border-[#3d3b38]/15 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">15k+</div>
                            <div className="text-[14px] text-gray-600">Happy Guests</div>
                        </div>
                        <div className="border-r border-[#3d3b38]/15 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">100%</div>
                            <div className="text-[14px] text-gray-600">Organic Products</div>
                        </div>
                        <div className="relative">
                            <div className="text-3xl font-sans font-medium mb-1 text-[#C89B3C]">4.9★</div>
                            <div className="text-[14px] text-gray-600">Google Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro Header matching Image 1 */}
            <section className="pt-44 pb-20 px-4 text-center max-w-3xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-6">
                    <img src="/images/Logo-Sadali.png" alt="SADALI" className="h-16 md:h-20 object-contain mb-2" />
                </div>
                <div className="text-xs tracking-widest font-bold uppercase mb-6 text-[#5a4033]">Escape • Indulge • Renew</div>
                <h2 className="text-4xl md:text-[44px] font-serif mb-6 text-[#3d3b38] leading-tight">
                    Premier Family Spa Near Me<br />inside Bali Collection
                </h2>
                <p className="text-gray-600 leading-relaxed mx-auto text-lg font-light">
                    Experience the harmony of luxury and tranquility at Sadali<br className="hidden md:inline" /> Spa &amp; Salon, where every detail in Nusa Dua Bali Collection is<br className="hidden md:inline" /> crafted to rejuvenate your body and soul.
                </p>
            </section>

            {/* Serene Sanctuary Dark Accent Banner matching Image 2 */}
            <section className="w-full bg-[#452C1D] text-[#FAF5EB] py-7 md:py-9 px-6 md:px-16 shadow-inner border-y border-[#362013]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-end text-right">
                    <div>
                        <div className="text-xs md:text-sm tracking-[0.22em] text-[#E5C989] uppercase font-sans font-medium mb-1.5">
                            Serene Sanctuary in Nusa Dua
                        </div>
                        <h3 className="text-2xl md:text-[30px] font-serif text-white font-normal tracking-wide">
                            Premier Family Spa Near Me inside Bali Collection
                        </h3>
                    </div>
                </div>
            </section>

            {/* About Us Preview Section */}
            <section id="about" className="py-24 px-4 w-full scroll-mt-20">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative flex justify-center group">
                        <div className="aspect-square w-[380px] md:w-[450px] rounded-full overflow-hidden shadow-2xl border-4 border-white/80 transition-transform duration-700 group-hover:scale-105">
                            <img src="/images/Model.JPG" alt="Spa Experience" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="w-full border-t border-[#3d3b38]/20 mb-8"></div>
                        <p className="text-gray-700 leading-relaxed text-lg max-w-md font-light">
                            Escape the island sun and unwind at our premier family spa near me, conveniently located inside Bali Collection. Whether you are searching for an authentic Balinese massage near me after a day on the beach or seeking a tranquil spa in Nusa Dua, our sanctuary blends traditional healing rituals with modern pampering.
                        </p>
                        <button
                            onClick={() => onNavigate('about')}
                            className="bg-[#E5C989] text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] inline-block mt-4 hover:scale-105 duration-200 cursor-pointer shadow-md rounded-xl"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Our Services Section with Rounded Photos ("agak bulat") */}
            <section id="treatments" className="pt-24 pb-20 px-4 text-center scroll-mt-20">
                <div className="text-[17px] md:text-[18px] font-sans font-normal text-[#5a4033] mb-3 tracking-wide">
                    Our Service
                </div>
                <h2 className="text-4xl md:text-[54px] font-serif font-bold text-[#2b2927] leading-[1.14] mb-16 md:mb-20 tracking-tight">
                    Discover your Path to<br />Wellness
                </h2>

                {/* Staggered Accordion Slider / Expanding Flex Cards with rounded-2xl */}
                <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row justify-center items-start gap-2.5 md:gap-3.5 mb-24 px-2 select-none">
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            layoutId={`service-card-${service.id}`}
                            onClick={() => setExpandedService(service.id)}
                            className={`relative w-full md:w-auto ${service.heightClass} md:flex-1 hover:md:flex-[3.5] group overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]`}
                            style={{ willChange: 'flex, box-shadow' }}
                        >
                            {/* Card Image */}
                            <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                            />

                            {/* Dark Elegant Overlay (fades out on hover for bright and clear photo) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1f150e]/95 via-[#1f150e]/40 to-transparent opacity-75 group-hover:opacity-15 transition-opacity duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />

                            {/* Corner Bottom Title matching design reference */}
                            <div className="absolute inset-0 flex items-end p-5 md:p-6 transition-transform duration-500 ease-out group-hover:-translate-y-2 pointer-events-none">
                                <span className="text-white font-serif text-2xl md:text-[26px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] text-left leading-tight">
                                    {service.titleHtml}
                                </span>
                            </div>

                            {/* Click hint — shows on hover */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                                  
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="max-w-3xl mx-auto text-gray-600 mb-10 text-lg leading-relaxed font-light">
                    Explore our curated selection of spa and salon treatments, each<br className="hidden md:inline" /> designed to provide you with the ultimate relaxation and beauty experience.
                </p>
                <button
                    onClick={() => onOpenBooking('Full Body Massage')}
                    className="bg-[#E5C989] text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-md rounded-xl"
                >
                    Book Now
                </button>
            </section>

            {/* === Framer Motion Expanded Service Overlay === */}
            <AnimatePresence>
                {expandedService && expandedData && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="service-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm cursor-pointer"
                            onClick={() => setExpandedService(null)}
                        />

                        {/* Expanded Card */}
                        <motion.div
                            key={`expanded-${expandedService}`}
                            layoutId={`service-card-${expandedService}`}
                            className="fixed inset-0 z-[61] flex items-center justify-center p-4 md:p-10 pointer-events-none"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                className="relative w-full max-w-4xl bg-[#1f150e] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col md:flex-row"
                                style={{ maxHeight: '90vh' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Image Panel */}
                                <div className="relative w-full md:w-[55%] h-[260px] md:h-auto overflow-hidden shrink-0">
                                    <img
                                        src={expandedData.image}
                                        alt={expandedData.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1f150e]/60 md:block hidden pointer-events-none" />
                                </div>

                                {/* Content Panel */}
                                <div className="flex flex-col justify-center p-8 md:p-10 flex-1">
                                    {/* Gold accent line */}
                                    <div className="w-10 h-[2px] bg-[#E5C989] mb-6" />

                                    <p className="text-[#E5C989]/80 text-xs tracking-[0.25em] uppercase mb-3 font-medium">
                                        Sadali Spa &amp; Salon
                                    </p>
                                    <h2 className="text-white font-serif text-3xl md:text-4xl font-medium leading-tight mb-6">
                                        {expandedData.name}
                                    </h2>
                                    <p className="text-white/70 text-base md:text-[17px] leading-relaxed mb-10">
                                        {expandedData.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => {
                                                setExpandedService(null);
                                                onOpenBooking(expandedData.name);
                                            }}
                                            className="bg-[#E5C989] text-[#3d3b38] px-8 py-3 font-medium text-sm tracking-wide transition hover:bg-[#d6b77c] hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-lg rounded-xl"
                                        >
                                            Book This Treatment
                                        </button>
                                        <button
                                            onClick={() => setExpandedService(null)}
                                            className="border border-white/30 text-white/80 px-8 py-3 font-medium text-sm tracking-wide transition hover:bg-white/10 hover:border-white/60 duration-200 cursor-pointer rounded-xl"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                                {/* Close X button */}
                                <button
                                    onClick={() => setExpandedService(null)}
                                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/70 hover:text-white transition text-lg leading-none cursor-pointer z-10"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Experience Carousel - Rounded Photos ("agak bulat") matching Image 3 */}
            <section id="experience" className="py-24 overflow-hidden scroll-mt-20 select-none">
                <div className="text-center mb-12">
                    <h2 className="text-[32px] md:text-[40px] font-serif text-[#5a4033]">Experience</h2>
                </div>

                {/* Sliding Carousel Showcase with rounded-2xl md:rounded-3xl photos */}
                <div className="relative max-w-6xl mx-auto flex justify-center items-center h-[340px] md:h-[480px] px-4">
                    {/* Left Previous Peek (Clickable to Slide) */}
                    {(() => {
                        const prevIdx = (experienceIndex - 1 + experienceSlides.length) % experienceSlides.length;
                        return (
                            <div
                                onClick={prevExperience}
                                className="absolute left-[-15%] md:left-[-5%] w-[45%] md:w-[48%] h-[75%] md:h-[80%] z-10 cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl shadow-md opacity-40 hover:opacity-70 transition-all duration-700 ease-in-out"
                            >
                                <img
                                    src={experienceSlides[prevIdx].image}
                                    className="w-full h-full object-cover transition-all duration-700 filter brightness-90"
                                    alt="Previous Experience"
                                />
                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                            </div>
                        );
                    })()}

                    {/* Center Active Main Image (Clickable to Slide) with rounded-2xl md:rounded-3xl */}
                    <div
                        onClick={nextExperience}
                        className="relative w-full max-w-[760px] md:max-w-[820px] h-[340px] md:h-[480px] z-20 cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(74,53,37,0.22)] transition-all duration-700 ease-in-out hover:scale-[1.01]"
                    >
                        <img
                            key={experienceSlides[experienceIndex].image}
                            src={experienceSlides[experienceIndex].image}
                            className="w-full h-full object-cover transition-all duration-700"
                            alt="Experience Main"
                        />
                    </div>

                    {/* Right Next Peek (Clickable to Slide) */}
                    {(() => {
                        const nextIdx = (experienceIndex + 1) % experienceSlides.length;
                        return (
                            <div
                                onClick={nextExperience}
                                className="absolute right-[-15%] md:right-[-5%] w-[45%] md:w-[48%] h-[75%] md:h-[80%] z-10 cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl shadow-md opacity-40 hover:opacity-70 transition-all duration-700 ease-in-out"
                            >
                                <img
                                    src={experienceSlides[nextIdx].image}
                                    className="w-full h-full object-cover transition-all duration-700 filter brightness-90"
                                    alt="Next Experience"
                                />
                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                            </div>
                        );
                    })()}
                </div>

                {/* Pagination Dots Indicator matching Image 3 */}
                <div className="flex justify-center items-center gap-3 mb-8 mt-10">
                    {experienceSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setExperienceIndex(idx)}
                            className={`transition-all duration-500 cursor-pointer ${idx === experienceIndex
                                ? 'w-10 h-2 bg-[#5a4033] rounded-full'
                                : 'w-2 h-2 bg-[#8c6753]/50 hover:bg-[#8c6753] rounded-full'
                                }`}
                            title={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Text Description matching Image 3 */}
                <div className="text-center max-w-lg mx-auto px-4 min-h-[60px] text-gray-600 text-sm md:text-[15px] leading-relaxed transition-all duration-500 font-light">
                    <p>{experienceSlides[experienceIndex].text1}</p>
                    <p>{experienceSlides[experienceIndex].text2}</p>
                    <p>{experienceSlides[experienceIndex].text3}</p>
                </div>
            </section>

            {/* Google Review Section matching Image 3 bottom */}
            <section id="reviews" className="py-20 md:py-24 border-t border-b border-[#3d3b38]/10 bg-[#FAF3E5]/50 backdrop-blur-xs scroll-mt-20">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
                    {/* Left: Google Logo + Reviews + Stars */}
                    <div className="flex flex-col items-center md:items-start shrink-0">
                        {/* Google Logo */}
                        <div className="text-5xl font-bold font-sans tracking-tight mb-2 select-none flex items-center">
                            <span className="text-[#4285F4]">G</span>
                            <span className="text-[#EA4335]">o</span>
                            <span className="text-[#FBBC05]">o</span>
                            <span className="text-[#4285F4]">g</span>
                            <span className="text-[#34A853]">l</span>
                            <span className="text-[#EA4335]">e</span>
                        </div>
                        {/* Reviews text and stars on one single line */}
                        <div className="flex items-center gap-3">
                            <span className="text-[#4a4a4a] text-xl font-bold tracking-tight">Reviews</span>
                            <span className="text-[#FBBC05] text-xl tracking-widest leading-none">★★★★★</span>
                        </div>
                    </div>

                    {/* Middle: Clean Vertical Divider */}
                    <div className="hidden md:block w-[1.5px] h-28 bg-[#3d3b38]/20 shrink-0"></div>

                    {/* Right: Reviewer Name & Testimonial */}
                    <div className="max-w-xl text-center md:text-left">
                        <h3 className="text-3xl font-serif text-[#5a4033] font-bold mb-3 tracking-wide">
                            John Doe
                        </h3>
                        <p className="text-gray-700 text-base md:text-[17px] leading-relaxed font-light">
                            The absolute best massage spa near me during our trip to Bali! We visited Sadali as a family after shopping around Bali Collection. The massages were deeply relaxing and the nail service was top tier.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 text-center">
                <div className="text-[#5a4033] mb-6 text-[15px] font-medium tracking-wide">Ready for Total Relaxation?</div>
                <h2 className="text-4xl md:text-[50px] font-serif text-[#3d3b38] mb-8 leading-tight">
                    Reserve Your Session at Sadali Spa<br />&amp; Salon
                </h2>
                <p className="max-w-2xl mx-auto text-gray-600 mb-12 text-lg leading-relaxed font-light">
                    Looking for a recommended spa near me or a top-rated salon near me in Nusa Dua? Book your appointment online to secure your preferred time.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    <button
                        onClick={() => onOpenBooking('Signature Ritual')}
                        className="bg-[#E5C989] text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-md rounded-xl"
                    >
                        Book Now
                    </button>
                    <button
                        onClick={() => onNavigate('home', 'treatments')}
                        className="bg-transparent border border-[#3d3b38]/40 text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#3d3b38] hover:text-white hover:scale-105 active:scale-95 duration-200 inline-block cursor-pointer rounded-xl"
                    >
                        View Menu
                    </button>
                </div>
            </section>

            {/* Blog Section matching Image 4 (Rounded cards, rounded photos with padding, View Detail + round arrow button) */}
            <section id="blog" className="py-24 px-4 scroll-mt-20">
                <h2 className="text-4xl md:text-[44px] font-serif text-[#3d3b38] mb-16 text-center font-medium">
                    Wellness Insights &amp; Stories
                </h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="rounded-2xl md:rounded-3xl bg-[#FAF4E8] border border-[#E5D2B3]/80 p-4 sm:p-5 shadow-[0_10px_30px_rgba(74,53,37,0.06)] hover:shadow-[0_20px_45px_rgba(74,53,37,0.14)] transition-all duration-300 group flex flex-col justify-between cursor-pointer">
                        <div className="overflow-hidden rounded-xl md:rounded-2xl h-[220px] mb-5">
                            <img src="/images/Short-Treatment.JPG" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="The Secrets of Balinese Healing" />
                        </div>
                        <div className="px-1 flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-[#B58B4C] font-semibold mb-2 block">Traditions</span>
                                <h3 className="text-2xl font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-[#B58B4C] transition">The Secrets of Balinese Healing</h3>
                                <p className="text-[#3d3b38]/75 text-sm leading-relaxed mb-6 font-light">
                                    Discover ancient herbs and time-honored pressure point techniques used for centuries in Bali to restore bodily equilibrium.
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#3d3b38]/10 mt-auto">
                                <span className="text-sm font-medium text-[#3d3b38] underline underline-offset-4 decoration-[#3d3b38]/30 group-hover:text-[#B58B4C] group-hover:decoration-[#B58B4C] transition-colors">
                                    
                                </span>
                                <div className="w-9 h-9 rounded-full bg-[#E5C989] text-[#4A3B32] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-2xl md:rounded-3xl bg-[#FAF4E8] border border-[#E5D2B3]/80 p-4 sm:p-5 shadow-[0_10px_30px_rgba(74,53,37,0.06)] hover:shadow-[0_20px_45px_rgba(74,53,37,0.14)] transition-all duration-300 group flex flex-col justify-between cursor-pointer">
                        <div className="overflow-hidden rounded-xl md:rounded-2xl h-[220px] mb-5">
                            <img src="/images/Manicure-Pedicure.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Holistic Luxury Nail Care" />
                        </div>
                        <div className="px-1 flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-[#B58B4C] font-semibold mb-2 block">Beauty &amp; Nails</span>
                                <h3 className="text-2xl font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-[#B58B4C] transition">Holistic Luxury Nail Care</h3>
                                <p className="text-[#3d3b38]/75 text-sm leading-relaxed mb-6 font-light">
                                    Nourish your nails with organic botanicals and premium essential oils during your blissful holiday in Nusa Dua.
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#3d3b38]/10 mt-auto">
                                <span className="text-sm font-medium text-[#3d3b38] underline underline-offset-4 decoration-[#3d3b38]/30 group-hover:text-[#B58B4C] group-hover:decoration-[#B58B4C] transition-colors">
                                    
                                </span>
                                <div className="w-9 h-9 rounded-full bg-[#E5C989] text-[#4A3B32] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="rounded-2xl md:rounded-3xl bg-[#FAF4E8] border border-[#E5D2B3]/80 p-4 sm:p-5 shadow-[0_10px_30px_rgba(74,53,37,0.06)] hover:shadow-[0_20px_45px_rgba(74,53,37,0.14)] transition-all duration-300 group flex flex-col justify-between cursor-pointer">
                        <div className="overflow-hidden rounded-xl md:rounded-2xl h-[220px] mb-5">
                            <img src="/images/Scrub-Mask.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Calming Scents for Island Living" />
                        </div>
                        <div className="px-1 flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-[#B58B4C] font-semibold mb-2 block">Aromatherapy</span>
                                <h3 className="text-2xl font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-[#B58B4C] transition">Calming Scents for Island Living</h3>
                                <p className="text-[#3d3b38]/75 text-sm leading-relaxed mb-6 font-light">
                                    How pure frangipani and lemongrass extracts awaken the senses and reduce fatigue after traveling across Bali.
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#3d3b38]/10 mt-auto">
                                <span className="text-sm font-medium text-[#3d3b38] underline underline-offset-4 decoration-[#3d3b38]/30 group-hover:text-[#B58B4C] group-hover:decoration-[#B58B4C] transition-colors">
                                   
                                </span>
                                <div className="w-9 h-9 rounded-full bg-[#E5C989] text-[#4A3B32] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
