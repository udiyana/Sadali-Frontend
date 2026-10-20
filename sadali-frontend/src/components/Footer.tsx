import { useState, type FormEvent } from 'react';

type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

interface FooterProps {
    currentPage: PageType;
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function Footer({ currentPage, onNavigate, onOpenBooking }: FooterProps) {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSuccess, setNewsletterSuccess] = useState(false);

    const handleNewsletterSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setNewsletterSuccess(true);
            setTimeout(() => {
                setNewsletterSuccess(false);
                setNewsletterEmail('');
            }, 3000);
        }
    };

    return (
        <footer id="contact" className="bg-gradient-to-b from-[#4A3222] via-[#3E281A] to-[#2E1C12] text-white/90 pt-16 pb-12 px-6 sm:px-8 border-t border-black/20 scroll-mt-20">
            <div className="max-w-[1100px] mx-auto">
                {/* ── TOP SECTION: Map Satellite Preview & Sanctuary Banner ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-12 border-b border-white/15">
                    {/* Map Preview / Satellite Card */}
                    <div className="md:col-span-5 h-[180px] sm:h-[210px] md:h-[230px] rounded-sm overflow-hidden relative shadow-lg border border-white/10 group">
                        <a
                            href="https://maps.google.com/?q=Sadali+Spa+%26+Salon+Nusa+Dua+Bali"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-full cursor-pointer"
                        >
                            <img
                                src="/images/map-satellite.jpg"
                                alt="Sadali Spa Satellite View in Bali Collection"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </a>
                    </div>

                    {/* Sanctuary Title & Newsletter Input */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-white font-normal leading-tight mb-5">
                            Visit Our Spa Bali Collection Sanctuary
                        </h3>
                        <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-xl shadow-md">
                            <input
                                type="text"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Lorem ipsum dolor sit amet"
                                className="bg-white text-gray-800 px-4 py-3 sm:py-3.5 text-sm flex-1 focus:outline-none rounded-none placeholder-gray-400 font-sans"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="bg-[#DFC48E] hover:bg-[#d4b778] text-[#4A3B32] w-20 sm:w-28 transition-colors flex items-center justify-center cursor-pointer rounded-none"
                            >
                                {newsletterSuccess ? (
                                    <span className="text-xs font-semibold">Done</span>
                                ) : (
                                    <span className="sr-only">Submit</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── MIDDLE SECTION: 4 Columns (Logo, Navigation, Treatments, Contact Us) ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-[15px] leading-relaxed py-12">
                    {/* Column 1: SADALI Logo */}
                    <div className="md:col-span-4 flex items-start">
                        <button
                            onClick={() => onNavigate('home')}
                            className="cursor-pointer text-left focus:outline-none"
                        >
                            <img
                                src="/images/Logo-Sadali.png"
                                alt="SADALI"
                                className="h-12 md:h-14 object-contain brightness-0 invert"
                            />
                        </button>
                    </div>

                    {/* Column 2: Navigation Column */}
                    <div className="md:col-span-2">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide font-sans">
                            Navigation
                        </h4>
                        <ul className="space-y-2 text-white/80 font-sans text-sm">
                            <li>
                                <button
                                    onClick={() => onNavigate('home')}
                                    className={`transition hover:text-[#DFC48E] cursor-pointer text-left ${
                                        currentPage === 'home' ? 'text-[#DFC48E]' : ''
                                    }`}
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('about')}
                                    className={`transition hover:text-[#DFC48E] cursor-pointer text-left ${
                                        currentPage === 'about' ? 'text-[#DFC48E]' : ''
                                    }`}
                                >
                                    About
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('treatments')}
                                    className="transition hover:text-[#DFC48E] cursor-pointer text-left underline underline-offset-4 decoration-white/70"
                                >
                                    Treatments
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('blog')}
                                    className={`transition hover:text-[#DFC48E] cursor-pointer text-left ${
                                        currentPage === 'blog' ? 'text-[#DFC48E]' : ''
                                    }`}
                                >
                                    Blog
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('contact')}
                                    className={`transition hover:text-[#DFC48E] cursor-pointer text-left ${
                                        currentPage === 'contact' ? 'text-[#DFC48E]' : ''
                                    }`}
                                >
                                    Contact
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Treatments Column */}
                    <div className="md:col-span-3">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide font-sans">
                            Treatments
                        </h4>
                        <ul className="space-y-2 text-white/80 font-sans text-sm">
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Body Massage')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Body Massage
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Scrub & Mask')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Scrub &amp; Mask
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Short Treatment')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Short Treatment
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Hair Treatment')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Hair Treatment
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Manicure & Pedicure')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Manicure &amp; Pedicure
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Kids Menu')}
                                    className="hover:text-[#DFC48E] transition text-left cursor-pointer"
                                >
                                    Kids Menu
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Us Column */}
                    <div className="md:col-span-3">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide font-sans">
                            Contact Us
                        </h4>
                        <div className="text-white/80 space-y-2 font-sans text-sm">
                            <p className="mb-2 leading-snug">
                                Jl. Kw. Nusa Dua Resort, Benoa, Kec.<br />Kuta Sel., Kabupaten Badung, Bali 80361
                            </p>
                            <p>
                                <a href="tel:+6287777371188" className="hover:text-[#DFC48E] transition">
                                    +62 877 7737 1188
                                </a>
                            </p>
                            <p>
                                <a href="mailto:sadalispaa@gmail.com" className="hover:text-[#DFC48E] transition">
                                    sadalispaa@gmail.com
                                </a>
                            </p>
                            <p className="text-[#DFC48E] font-medium pt-1">Buka : 9AM - 10PM</p>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM SECTION: Copyright / Footer Note ── */}
                <div className="border-t border-white/15 pt-8 text-center">
                    <p className="text-white/70 text-xs md:text-sm font-sans tracking-wide">
                        Lorem ipsum dolor sit amet
                    </p>
                </div>
            </div>
        </footer>
    );
}
