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
        <footer id="contact" className="bg-[#4A3B32] text-white/90 pt-16 pb-12 px-6 sm:px-8 border-t border-black/20 scroll-mt-20">
            <div className="max-w-[1100px] mx-auto">
                {/* ── TOP SECTION: Map Satellite Preview & Sanctuary Banner ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-12 border-b border-white/15">
                    {/* Map Preview / Satellite Card */}
                    <div className="md:col-span-5 h-[170px] sm:h-[190px] rounded-xs overflow-hidden relative shadow-lg border border-white/10 group">
                        <iframe
                            title="Sadali Spa Satellite View"
                            src="https://maps.google.com/maps?q=Sadali%20Spa%20%26%20Salon%20Nusa%20Dua%20Bali&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                            className="w-full h-full border-0 pointer-events-auto"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Sanctuary Title & Newsletter Input */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[32px] text-white font-normal leading-tight mb-5">
                            Visit Our Spa Bali Collection Sanctuary
                        </h3>
                        <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-xl">
                            <input
                                type="text"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Lorem ipsum dolor sit amet"
                                className="bg-white text-gray-800 px-4 py-3 text-sm flex-1 focus:outline-none rounded-none placeholder-gray-400 font-sans"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="bg-[#E5C989] text-[#4A3B32] px-6 sm:px-8 py-3 font-medium text-sm transition hover:brightness-95 flex items-center justify-center cursor-pointer whitespace-nowrap font-sans"
                            >
                                {newsletterSuccess ? 'Subscribed' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── MIDDLE SECTION: 4 Columns (Logo, Navigation, Treatments, Contact) ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-[15px] leading-relaxed py-12">
                    {/* Column 1: Logo & Description */}
                    <div className="md:col-span-4">
                        <button
                            onClick={() => onNavigate('home')}
                            className="flex items-center gap-2 mb-6 cursor-pointer text-left focus:outline-none"
                        >
                            <img
                                src="/images/Logo-Sadali.png"
                                alt="SADALI"
                                className="h-12 md:h-14 object-contain brightness-0 invert"
                            />
                        </button>
                        <p className="text-white/70 text-sm max-w-xs leading-relaxed font-sans">
                            A serene sanctuary of wellness nestled in the heart of Bali Collection, Nusa Dua.
                        </p>
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
                                    className={`transition hover:text-[#E5C989] cursor-pointer text-left ${
                                        currentPage === 'home' ? 'text-[#E5C989] border-b border-[#E5C989] pb-[1px]' : ''
                                    }`}
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('about')}
                                    className={`transition hover:text-[#E5C989] cursor-pointer text-left ${
                                        currentPage === 'about' ? 'text-[#E5C989] border-b border-[#E5C989] pb-[1px]' : ''
                                    }`}
                                >
                                    About Us
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('treatments')}
                                    className={`transition hover:text-[#E5C989] cursor-pointer text-left ${
                                        currentPage === 'treatments' ? 'text-[#E5C989] border-b border-[#E5C989] pb-[1px]' : ''
                                    }`}
                                >
                                    Treatments
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('blog')}
                                    className={`transition hover:text-[#E5C989] cursor-pointer text-left ${
                                        currentPage === 'blog' ? 'text-[#E5C989] border-b border-[#E5C989] pb-[1px]' : ''
                                    }`}
                                >
                                    Blog
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('contact')}
                                    className={`transition hover:text-[#E5C989] cursor-pointer text-left ${
                                        currentPage === 'contact' ? 'text-[#E5C989] border-b border-[#E5C989] pb-[1px]' : ''
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
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Body Massage
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Scrub & Mask')}
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Scrub &amp; Mask
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Short Treatment')}
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Short Treatment
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Hair Treatment')}
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Hair Treatment
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Manicure & Pedicure')}
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Manicure &amp; Pedicure
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenBooking('Kids Menu')}
                                    className="hover:text-[#E5C989] transition text-left cursor-pointer"
                                >
                                    Kids Menu
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Column */}
                    <div className="md:col-span-3">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide font-sans">
                            Contact
                        </h4>
                        <div className="text-white/80 space-y-2 font-sans text-sm">
                            <p className="mb-2 leading-snug">
                                Jl. Kw. Nusa Dua Resort, Benoa, Kec.<br />Kuta Sel., Kabupaten Badung, Bali 80361
                            </p>
                            <p>
                                <a href="tel:+6287777371188" className="hover:text-[#E5C989] transition">
                                    +62 877 7737 1188
                                </a>
                            </p>
                            <p>
                                <a href="mailto:sadalispaa@gmail.com" className="hover:text-[#E5C989] transition">
                                    sadalispaa@gmail.com
                                </a>
                            </p>
                            <p className="text-[#E5C989] font-medium pt-1">Buka : 9AM - 10PM</p>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM SECTION: Copyright / Footer Note ── */}
                <div className="border-t border-white/15 pt-8 text-center">
                    <p className="text-white/50 text-xs md:text-sm font-sans tracking-wider">
                        Lorem ipsum dolor sit amet
                    </p>
                </div>
            </div>
        </footer>
    );
}
