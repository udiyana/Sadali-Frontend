
type PageType = 'home' | 'about' | 'treatments' | 'blog';

interface FooterProps {
    currentPage: PageType;
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function Footer({ currentPage, onNavigate, onOpenBooking }: FooterProps) {
    return (
        <footer id="contact" className="bg-[#48301d] text-white/90 py-16 px-8 border-t border-black/20 scroll-mt-20">
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-[15px] leading-relaxed">
                {/* Logo & Description */}
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
                    <p className="text-white/70 text-sm max-w-xs leading-relaxed">
                        A serene sanctuary of wellness nestled in the heart of Bali Collection, Nusa Dua.
                    </p>
                </div>

                {/* Navigation Column */}
                <div className="md:col-span-2">
                    <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Navigation</h4>
                    <ul className="space-y-2 text-white/80">
                        <li>
                            <button
                                onClick={() => onNavigate('home')}
                                className={`transition hover:text-gold cursor-pointer text-left ${
                                    currentPage === 'home' ? 'text-gold border-b border-gold pb-[1px]' : ''
                                }`}
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => onNavigate('about')}
                                className={`transition hover:text-gold cursor-pointer text-left ${
                                    currentPage === 'about' ? 'text-gold border-b border-gold pb-[1px]' : ''
                                }`}
                            >
                                About
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => onNavigate('treatments')}
                                className={`transition hover:text-gold cursor-pointer text-left ${
                                    currentPage === 'treatments' ? 'text-gold border-b border-gold pb-[1px]' : ''
                                }`}
                            >
                                Treatments
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => onNavigate('blog')}
                                className={`transition hover:text-gold cursor-pointer text-left ${
                                    currentPage === 'blog' ? 'text-gold border-b border-gold pb-[1px]' : ''
                                }`}
                            >
                                Blog
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => onNavigate('home', 'contact')}
                                className="transition hover:text-gold cursor-pointer text-left"
                            >
                                Contact
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Treatments Column */}
                <div className="md:col-span-3">
                    <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Treatments</h4>
                    <ul className="space-y-2 text-white/80">
                        <li>
                            <button onClick={() => onOpenBooking('Body Massage')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Body Massage
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenBooking('Scrub & Mask')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Scrub &amp; Mask
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenBooking('Short Treatment')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Short Treatment
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenBooking('Hair Treatment')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Hair Treatment
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenBooking('Manicure & Pedicure')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Manicure &amp; Pedicure
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenBooking('Kids Menu')}
                                className="hover:text-gold transition text-left cursor-pointer">
                                Kids Menu
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Contact Us Column */}
                <div className="md:col-span-3">
                    <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Contact Us</h4>
                    <div className="text-white/80 space-y-2">
                        <p className="mb-2 leading-snug">
                            Jl. Kw. Nusa Dua Resort, Benoa, Kec.<br />Kuta Sel., Kabupaten Badung, Bali 80361
                        </p>
                        <p>
                            <a href="tel:+6287777371188" className="hover:text-gold transition">
                                +62 877 7737 1188
                            </a>
                        </p>
                        <p>
                            <a href="mailto:sadalispaa@gmail.com" className="hover:text-gold transition">
                                sadalispaa@gmail.com
                            </a>
                        </p>
                        <p className="text-gold font-medium">Buka : 9AM - 10PM</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
