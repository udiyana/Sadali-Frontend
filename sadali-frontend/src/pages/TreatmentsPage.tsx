import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreatmentsPageProps {
    onNavigate: (page: 'home' | 'about' | 'treatments', sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function TreatmentsPage({ onOpenBooking }: TreatmentsPageProps) {
    const [expandedService, setExpandedService] = useState<string | null>(null);
    const [activeMenuTab, setActiveMenuTab] = useState<string>('salon');

    /* ─── Service cards data (same photos as HomePage) ─── */
    const services = [
        {
            id: 'body-massage',
            name: 'Body Massage',
            titleHtml: <>Body<br />Massage</>,
            image: '/images/Body-Massage.jpg',
            heightClass: 'h-[330px] md:h-[380px] md:mt-[30px]',
            description:
                'Indulge in a deeply restorative full-body massage that melts away tension with warm Balinese herbal oils, soothing strokes, and time-honored pressure techniques.',
        },
        {
            id: 'scrub-mask',
            name: 'Scrub & Mask',
            titleHtml: <>Scrub<br />& Mask</>,
            image: '/images/Scrub-Mask.jpg',
            heightClass: 'h-[340px] md:h-[430px] md:mt-[60px]',
            description:
                'Revitalize your skin with our signature botanical scrub and organic herbal mask ritual, leaving your complexion luminous, silky, and deeply nourished.',
        },
        {
            id: 'hair-treatment',
            name: 'Hair Treatment',
            titleHtml: <>Hair<br />Treatment</>,
            image: '/images/Hair-Treatment.jpg',
            heightClass: 'h-[340px] md:h-[450px] md:mt-[80px]',
            description:
                'Restore radiance and strength to your hair with our luxurious hair spa and cream bath treatment, enriched with tropical botanical extracts and essential oils.',
        },
        {
            id: 'manicure-pedicure',
            name: 'Manicure & Pedicure',
            titleHtml: <>Manicure<br />& Pedicure</>,
            image: '/images/Manicure-Pedicure.jpeg',
            heightClass: 'h-[360px] md:h-[470px] md:mt-[0px]',
            description:
                'Pamper your hands and feet with our meticulous manicure and pedicure service, featuring premium organic products and impeccable finishing that lasts.',
        },
        {
            id: 'kids-menu',
            name: 'Kids Menu',
            titleHtml: (
                <span className="flex flex-col items-start">
                    Kids Menu
                </span>
            ),
            image: '/images/Kids-Menu.JPG',
            heightClass: 'h-[380px] md:h-[500px] md:mt-[70px]',
            description:
                'A gentle and playful wellness experience designed especially for children, helping little ones relax and enjoy the magic of a luxury spa in a safe, caring environment.',
        },
        {
            id: 'short-treatment',
            name: 'Short Treatment',
            titleHtml: <>Short<br />Treatment</>,
            image: '/images/Short-Treatment.JPG',
            heightClass: 'h-[340px] md:h-[430px] md:mt-[40px]',
            description:
                'Perfect for a quick escape — our express relaxation treatment targets key tension areas for a swift yet deeply satisfying sense of renewal and calm.',
        },
    ];

    const expandedData = services.find((s) => s.id === expandedService);

    return (
        <main className="min-h-screen text-[#4A3B32] overflow-x-clip">

            {/* ══════════════════════════════════════════════
                HERO SECTION — "Our Treatment Menu"
            ══════════════════════════════════════════════ */}
            <section className="relative w-full min-h-[480px] md:min-h-[560px] lg:min-h-[600px] flex items-center justify-center text-center overflow-hidden">

                {/* Background image – slow Ken Burns zoom */}
                <motion.div
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/images/blog-menu-hero.jpg"
                        alt="Sadali Spa Treatments"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Dark warm gradient — heavier top, fades to golden at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-[#C8A96E]/55" />
                </motion.div>

                {/* Hero text — centered */}
                <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-20 flex flex-col items-center justify-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
                        className="font-serif text-[35px] sm:text-[45px] md:text-[60px] lg:text-[70px] text-[#F8EDDA] font-bold leading-[1.1] tracking-tight drop-shadow-[0_4px_22px_rgba(0,0,0,0.6)] mb-4"
                    >
                        Our Treatment Menu
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        className="font-sans text-[#F3E8D8]/90 text-sm sm:text-base md:text-[17px] leading-relaxed max-w-lg drop-shadow"
                    >
                        Explore our full range of therapeutic bodywork, luxury salon care, and
                        holistic wellness Nusa Dua packages at Sadali Spa &amp; Salon.
                    </motion.p>
                </div>

                {/* Bottom fade into warm cream */}
                <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-[#F5E9CE] to-transparent pointer-events-none z-10" />
            </section>



            {/* ══════════════════════════════════════════════
                INTRO — "Customized Pampering" tagline
            ══════════════════════════════════════════════ */}
            <section className="relative w-full bg-gradient-to-b from-[#FAF4E6] via-[#F6EBD5] to-[#EED6B0] pt-6 pb-14 md:pb-20 px-6 text-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                    className="max-w-3xl mx-auto relative z-10"
                >
                    <p className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#8C6A3F] mb-4">
                        Customized Pampering
                    </p>

                    <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[46px] lg:text-[52px] text-[#3B2E23] font-bold leading-[1.15] mb-6">
                        Total Relaxation at the Best Spa in Nusa Dua
                    </h2>

                    <p className="font-sans text-[#6B5A4D] text-sm sm:text-base md:text-[16px] leading-relaxed max-w-2xl mx-auto">
                        Step into a world of tranquility located inside Bali Collection.
                        Whether you are looking for an authentic Balinese massage near me,
                        restorative hair treatments at a top salon near me, or flawless care
                        at a premier nail salon near me. Filter our full menu below to find
                        your ideal treatment.
                    </p>
                </motion.div>
            </section>


            {/* ══════════════════════════════════════════════
                PHOTO GALLERY — Staggered Accordion Cards
                (Same layout & animation as HomePage)
            ══════════════════════════════════════════════ */}
            <section className="relative bg-gradient-to-b from-[#EED6B0] via-[#E4CD9C] to-[#DFC48E] pt-10 pb-20 px-4 text-center overflow-hidden">

                <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row justify-center items-start gap-2.5 md:gap-3.5 mb-14 px-2 select-none">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            layoutId={`treatment-card-${service.id}`}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{
                                duration: 0.75,
                                delay: index * 0.08,
                                ease: [0.25, 1, 0.5, 1],
                            }}
                            onClick={() => setExpandedService(service.id)}
                            className={`relative w-full md:w-auto ${service.heightClass} md:flex-1 hover:md:flex-[3.5] group overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]`}
                            style={{ willChange: 'flex, box-shadow' }}
                        >
                            {/* Photo with scroll-in scale animation (same as HomePage) */}
                            <motion.img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                                initial={{ scale: 1.12 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
                            />

                            {/* Dark overlay — fades out on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1f150e]/95 via-[#1f150e]/40 to-transparent opacity-75 group-hover:opacity-15 transition-opacity duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />

                            {/* Bottom title */}
                            <div className="absolute inset-0 flex items-end p-5 md:p-6 transition-transform duration-500 ease-out group-hover:-translate-y-2 pointer-events-none">
                                <span className="text-white font-serif text-2xl md:text-[26px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] text-left leading-tight">
                                    {service.titleHtml}
                                </span>
                            </div>

                            {/* Hover hint badge */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                                    View Detail
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA below gallery */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
                    className="flex flex-col items-center gap-4"
                >
                    <p className="font-sans text-[#4A3B32]/75 text-sm md:text-[15px] max-w-xl leading-relaxed font-light">
                        Tap any treatment to learn more, then book your session online.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onOpenBooking('Body Massage')}
                        className="bg-[#4A3B32] hover:bg-[#3A2D25] text-[#F3E3C8] px-10 py-3 font-serif font-semibold text-sm tracking-wide shadow-lg transition-colors duration-200 cursor-pointer rounded-sm"
                    >
                        Book Your Treatment
                    </motion.button>
                </motion.div>
            </section>


            {/* ══════════════════════════════════════════════
                TREATMENT MENU IMAGE VIEWER
                (Jard'or-style: side photos + center menu images)
            ══════════════════════════════════════════════ */}
            <section className="relative w-full bg-gradient-to-b from-[#3E271B] via-[#321F14] to-[#25160E] border-t border-[#DFC48E]/30">

                {/* ── Tab bar (rich brown with gold gradient accents) ── */}
                <div className="relative z-20 bg-gradient-to-b from-[#4A3020] via-[#3B2518] to-[#2E1C12] border-b border-[#DFC48E]/30 shadow-md">
                    {/* Section heading above tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
                        className="text-center pt-14 pb-6 px-4"
                    >
                        <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#DFC48E] font-medium mb-2">
                            Sadali Spa &amp; Salon · Bali Collection · Nusa Dua
                        </p>
                        <h2 className="font-serif text-[28px] sm:text-[38px] md:text-[46px] font-bold leading-tight mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0DC] via-[#E5C989] to-[#DFC48E] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                            Our Treatment Menu
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-14 bg-gradient-to-r from-transparent via-[#DFC48E] to-[#DFC48E]/50" />
                            <span className="text-[#DFC48E] text-[11px]">✦</span>
                            <div className="h-px w-14 bg-gradient-to-l from-transparent via-[#DFC48E] to-[#DFC48E]/50" />
                        </div>
                    </motion.div>

                    {/* Tab row */}
                    <div
                        className="flex items-center justify-center flex-wrap gap-0 pb-0"
                        role="tablist"
                        aria-label="Treatment menu categories"
                    >
                        {[
                            { id: 'salon',  label: 'Salon Menu',      count: 5 },
                            { id: 'spa',    label: 'Spa Menu',        count: 5 },
                        ].map((tab, i) => (
                            <button
                                key={tab.id}
                                id={`menu-tab-${tab.id}`}
                                role="tab"
                                aria-selected={activeMenuTab === tab.id}
                                aria-controls={`menu-panel-${tab.id}`}
                                onClick={() => setActiveMenuTab(tab.id)}
                                className={`relative flex items-center gap-2 px-8 sm:px-12 py-4 font-sans text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-300 cursor-pointer ${
                                    activeMenuTab === tab.id
                                        ? 'text-[#F3E3C8] border-b-2 border-[#DFC48E] bg-[#DFC48E]/10'
                                        : 'text-[#E5C989]/60 border-b-2 border-transparent hover:text-[#F3E3C8] hover:bg-white/5'
                                } ${i > 0 ? 'border-l border-[#DFC48E]/20' : ''}`}
                            >
                                {tab.label}
                                {activeMenuTab === tab.id && (
                                    <motion.div
                                        layoutId="menu-tab-underline"
                                        className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#DFC48E] via-[#F3E3C8] to-[#DFC48E]"
                                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Quick download button bar */}
                    <div className="flex justify-center py-3 bg-gradient-to-r from-[#2A180E] via-[#361F13] to-[#2A180E] border-t border-[#DFC48E]/20">
                        <a
                            href="/Sadali-Spa-Treatment-Menu.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#3E271B] to-[#4D3223] text-[#F3E3C8] hover:text-white text-[11px] tracking-wider uppercase font-medium border border-[#DFC48E]/40 hover:border-[#DFC48E]/75 shadow-sm transition-all duration-200"
                        >
                            <svg className="w-3.5 h-3.5 text-[#DFC48E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download Full PDF Menu</span>
                        </a>
                    </div>
                </div>

                {/* ── 3-column layout: Left Photos | Center Menu Pages | Right Photos ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMenuTab}
                        id={`menu-panel-${activeMenuTab}`}
                        role="tabpanel"
                        aria-labelledby={`menu-tab-${activeMenuTab}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-row w-full items-start"
                    >
                        {/* ── LEFT photo column — flush to edge & sticky ── */}
                        <div className="hidden lg:flex flex-col w-[18vw] max-w-[240px] shrink-0 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-hidden">
                            {activeMenuTab === 'salon' ? (
                                <>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Hair-Treatment.jpg"
                                            alt="Hair treatment at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Manicure-Pedicure.jpeg"
                                            alt="Manicure pedicure at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Body-Massage.jpg"
                                            alt="Body massage at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Scrub-Mask.jpg"
                                            alt="Scrub and mask treatment at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── CENTER — seamless full-width continuous menu pages ── */}
                        <div className="flex-1 bg-[#FAF6EE] flex flex-col items-center p-0 m-0 min-w-0">
                            <div className="w-full flex flex-col p-0 m-0 gap-0">
                                {activeMenuTab === 'salon' ? (
                                    [
                                        { src: '/menus/salon/Salon-Menu-1.jpg', alt: 'Sadali Salon Menu - Cover' },
                                        { src: '/menus/salon/Salon-menu-2.jpg', alt: 'Sadali Salon Menu - Hair Services' },
                                        { src: '/menus/salon/Salon-menu-3.jpg', alt: 'Sadali Salon Menu - Page 3' },
                                        { src: '/menus/salon/Salon-menu-4.jpg', alt: 'Sadali Salon Menu - Page 4' },
                                        
                                    ].map((item, idx) => (
                                        <img
                                            key={`salon-${idx}`}
                                            src={item.src}
                                            alt={item.alt}
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                            decoding="async"
                                            className="w-full h-auto block m-0 p-0 border-0 rounded-none shadow-none align-top"
                                            style={{
                                                imageRendering: '-webkit-optimize-contrast',
                                                display: 'block',
                                            }}
                                            onError={(e) => {
                                                const el = e.currentTarget;
                                                if (el.src.includes('Salon-Menu-1')) {
                                                    el.src = '/menus/salon/Salon-menu-1.jpg';
                                                }
                                            }}
                                        />
                                    ))
                                ) : (
                                    [
                                        { src: '/menus/spa/Spa-Menu-1.jpg', alt: 'Sadali Spa Menu - Cover' },
                                        { src: '/menus/spa/Spa-Menu-2.jpg', alt: 'Sadali Spa Menu - Page 2' },
                                        { src: '/menus/spa/Spa-Menu-3.jpg', alt: 'Sadali Spa Menu - Page 3' },
                                        { src: '/menus/spa/Spa-Menu-4.jpg', alt: 'Sadali Spa Menu - Page 4' },
                                        { src: '/menus/spa/Spa-Menu-5.jpg', alt: 'Sadali Spa Menu - Page 5' },
                                    ].map((item, idx) => (
                                        <img
                                            key={`spa-${idx}`}
                                            src={item.src}
                                            alt={item.alt}
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                            decoding="async"
                                            className="w-full h-auto block m-0 p-0 border-0 rounded-none shadow-none align-top"
                                            style={{
                                                imageRendering: '-webkit-optimize-contrast',
                                                display: 'block',
                                            }}
                                            onError={(e) => {
                                                const el = e.currentTarget;
                                                if (el.src.includes('Spa-Menu-')) {
                                                    el.src = el.src.replace('Spa-Menu-', 'Menu-Spa-');
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Footer note directly under the last menu page */}
                            <div className="w-full py-5 px-4 bg-[#FAF6EE] text-center border-t border-[#E8DFC8]/60">
                                <p className="font-sans text-[#8C6A3F]/75 text-[11px] sm:text-xs tracking-wide">
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT photo column — flush to edge & sticky ── */}
                        <div className="hidden lg:flex flex-col w-[18vw] max-w-[240px] shrink-0 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-hidden">
                            {activeMenuTab === 'salon' ? (
                                <>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Scrub-Mask.jpg"
                                            alt="Scrub and mask at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.06, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Short-Treatment.JPG"
                                            alt="Short treatment at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.18, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Spa-room-1.jpg"
                                            alt="Sadali Spa room"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.06, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                    <div className="relative flex-1 h-1/2 overflow-hidden">
                                        <motion.img
                                            src="/images/Kids-Menu.JPG"
                                            alt="Kids menu at Sadali"
                                            className="w-full h-full object-cover object-center"
                                            initial={{ scale: 1.1 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.4, delay: 0.18, ease: [0.25, 1, 0.5, 1] }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C150E]/30 pointer-events-none" />
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </section>


            {/* ══════════════════════════════════════════════
                EXPANDED SERVICE OVERLAY (same as HomePage)
            ══════════════════════════════════════════════ */}
            <AnimatePresence>
                {expandedService && expandedData && (
                    <>
                        <motion.div
                            key="treatment-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm cursor-pointer"
                            onClick={() => setExpandedService(null)}
                        />

                        <motion.div
                            key={`expanded-${expandedService}`}
                            layoutId={`treatment-card-${expandedService}`}
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


            {/* ══════════════════════════════════════════════
                LUXURY RESERVATION CTA
            ══════════════════════════════════════════════ */}
            <section className="w-full bg-gradient-to-b from-[#DFC48E] via-[#FAF5EB] to-[#FAF5EB] py-16 sm:py-20 md:py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                        className="flex flex-col items-center"
                    >
                        <p className="font-sans text-xs sm:text-sm text-[#7E6652] mb-3 sm:mb-4 tracking-[0.18em] uppercase font-medium">
                            Plan Your Spa Day
                        </p>
                        <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] lg:text-[46px] font-bold text-[#4A3B32] leading-tight mb-7 max-w-3xl">
                            Book Your Favorite Massage Spa Near Me at Spa Bali Collection
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onOpenBooking('Body Massage')}
                            className="bg-[#DFC48E] hover:bg-[#d4b778] text-[#4A3B32] px-10 sm:px-12 py-3 sm:py-3.0 font-serif font-semibold text-sm tracking-wide transition-colors duration-200 shadow-md cursor-pointer"
                        >
                            Book Now
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
