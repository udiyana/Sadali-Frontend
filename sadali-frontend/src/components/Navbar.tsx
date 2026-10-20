import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

interface NavbarProps {
    currentPage: PageType;
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function Navbar({ currentPage, onNavigate, onOpenBooking }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <nav
            className={`fixed top-0 w-full z-50 px-6 md:px-12 py-4 md:py-4.5 flex items-center justify-between transition-all duration-300 ${
                scrolled
                    ? 'bg-[#FAF5EB]/95 backdrop-blur-md shadow-sm text-[#3d3b38] border-b border-[#E8D7B8]/50'
                    : 'bg-[#FAF5EB]/90 md:bg-[#FAF5EB]/85 backdrop-blur-md text-[#3d3b38] border-b border-[#E8D7B8]/30'
            }`}
        >
            {/* Logo */}
            <button
                onClick={() => onNavigate('home')}
                className="flex items-center ml-2 group cursor-pointer focus:outline-none"
            >
                <img
                    src="/images/Logo-Sadali.png"
                    alt="SADALI"
                    className="h-9 md:h-11 object-contain transition-all duration-300"
                />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-9 text-[15px] font-medium items-center">
                {/* Home */}
                <button
                    onClick={() => onNavigate('home')}
                    className="flex flex-col items-center group transition cursor-pointer focus:outline-none"
                >
                    <span className={`mb-1 transition ${
                        currentPage === 'home'
                            ? 'text-[#2b2927] font-semibold'
                            : 'hover:text-gold text-[#5a4033]'
                    }`}>Home</span>
                    {currentPage === 'home' && (
                        <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                </button>

                {/* About Us */}
                <button
                    onClick={() => onNavigate('about')}
                    className="flex flex-col items-center group transition cursor-pointer focus:outline-none"
                >
                    <span className={`mb-1 transition ${
                        currentPage === 'about' ? 'text-[#2b2927] font-semibold' : 'hover:text-gold'
                    }`}>About Us</span>
                    {currentPage === 'about' && (
                        <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                </button>

                {/* Treatments */}
                <button
                    onClick={() => onNavigate('treatments')}
                    className="flex flex-col items-center group transition cursor-pointer focus:outline-none"
                >
                    <span className={`mb-1 transition ${
                        currentPage === 'treatments' ? 'text-[#2b2927] font-semibold' : 'hover:text-gold'
                    }`}>Treatments</span>
                    {currentPage === 'treatments' && (
                        <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                </button>


                {/* Blog */}
                <button
                    onClick={() => onNavigate('blog')}
                    className="flex flex-col items-center group transition cursor-pointer focus:outline-none"
                >
                    <span className={`mb-1 transition ${
                        currentPage === 'blog' ? 'text-[#2b2927] font-semibold' : 'hover:text-gold'
                    }`}>Blog</span>
                    {currentPage === 'blog' && (
                        <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                </button>

                {/* Contact */}
                <button
                    onClick={() => onNavigate('contact')}
                    className="flex flex-col items-center group transition cursor-pointer focus:outline-none"
                >
                    <span className={`mb-1 transition ${
                        currentPage === 'contact' ? 'text-[#2b2927] font-semibold' : 'hover:text-gold'
                    }`}>Contact</span>
                    {currentPage === 'contact' && (
                        <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                </button>

                {/* Book Now Button */}
                <button
                    onClick={() => onOpenBooking('Body Massage')}
                    className="bg-gold text-[#3d3b38] px-7 py-2.5 font-medium transition hover:bg-[#d6b77c] shadow-lg hover:shadow-gold/30 hover:scale-105 active:scale-95 duration-200 ml-3 cursor-pointer"
                >
                    Book Now
                </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex md:hidden items-center gap-3">
                <button
                    onClick={() => onOpenBooking('Body Massage')}
                    className="bg-gold text-[#3d3b38] px-4 py-1.5 text-xs font-medium rounded-xs shadow cursor-pointer"
                >
                    Book Now
                </button>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-2xl focus:outline-none cursor-pointer"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? '\u2715' : '\u2630'}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-[#fcfcfa] text-[#3d3b38] shadow-2xl border-t border-gray-200 py-6 px-8 flex flex-col gap-4 md:hidden"
                    >
                        <button onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                            className={`text-left text-base font-medium py-1 ${currentPage === 'home' ? 'text-gold font-bold' : ''}`}>
                            Home
                        </button>
                        <button onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                            className={`text-left text-base font-medium py-1 ${currentPage === 'about' ? 'text-gold font-bold' : ''}`}>
                            About Us
                        </button>
                        <button onClick={() => { onNavigate('treatments'); setMobileMenuOpen(false); }}
                            className={`text-left text-base font-medium py-1 ${currentPage === 'treatments' ? 'text-gold font-bold' : ''}`}>
                            Treatments
                        </button>

                        <button onClick={() => { onNavigate('blog'); setMobileMenuOpen(false); }}
                            className={`text-left text-base font-medium py-1 ${currentPage === 'blog' ? 'text-gold font-bold' : 'hover:text-gold'}`}>
                            Blog
                        </button>
                        <button onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
                            className={`text-left text-base font-medium py-1 ${currentPage === 'contact' ? 'text-gold font-bold' : 'hover:text-gold'}`}>
                            Contact
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
