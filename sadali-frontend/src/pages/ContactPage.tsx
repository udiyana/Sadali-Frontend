import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

interface ContactPageProps {
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

export default function ContactPage({ onNavigate, onOpenBooking }: ContactPageProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        treatment: 'Body Massage',
        visitDate: '',
        message: '',
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate quick submission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    treatment: 'Body Massage',
                    visitDate: '',
                    message: '',
                });
            }, 4000);
        }, 600);
    };

    const handleOpenGoogleMaps = () => {
        window.open(
            'https://maps.google.com/?q=Sadali+Spa+%26+Salon+Bali+Collection+Nusa+Dua',
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <main className="bg-[#FDFBF7] min-h-screen text-[#4A3B32]">
            {/* ── 2. HERO SECTION (ANIMATED) ── */}
            <section
                className="relative w-full h-[440px] md:h-[500px] lg:h-[540px] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col justify-center items-center text-center px-4 pt-20"
                style={{ backgroundImage: "url('/images/Model.JPG')" }}
            >
                {/* Dark gradient overlay for luxury mood & text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75 pointer-events-none" />

                {/* Animated Hero Content */}
                <div className="relative z-10 max-w-3xl mx-auto px-4 mt-6">
                    <div className="flex items-center justify-center gap-2 mb-4 text-xs uppercase tracking-[0.25em] text-white/70 font-sans animate-fade-in-up">
                        <button
                            onClick={() => onNavigate('home')}
                            className="hover:text-[#E5C989] transition-colors cursor-pointer focus:outline-none"
                        >
                            Home
                        </button>
                        <span>/</span>
                        <span className="text-[#E5C989]">Contact</span>
                    </div>
                    <h1 className="font-serif text-[#E5C989] text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide animate-fade-in-up">
                        Contact
                    </h1>
                    <p className="font-sans text-white/95 text-base md:text-lg lg:text-[19px] font-light leading-relaxed max-w-2xl mx-auto mt-5 animate-fade-in-up [animation-delay:250ms] [animation-fill-mode:both]">
                        Get in touch with Sadali Spa &amp; Salon to plan your ultimate wellness Nusa Dua retreat or schedule your beauty appointments.
                    </p>
                </div>
            </section>

            {/* ── 3. THE CONTACT FORM (THE FLOATING CARD) ── */}
            <section className="relative px-4 sm:px-6 -mt-24 md:-mt-32 z-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-4xl bg-[#F8F5F0] rounded-sm p-8 md:p-12 shadow-2xl z-10 relative mx-auto border border-[#EAE4DD]/60"
                >
                    <AnimatePresence>
                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-8 p-5 bg-[#EAE4DD] border-l-4 border-[#E5C989] text-[#4A3B32] rounded-sm text-sm md:text-base flex items-center justify-between shadow-sm"
                            >
                                <div>
                                    <p className="font-serif font-bold text-base md:text-lg mb-1">
                                        Message Sent Successfully
                                    </p>
                                    <p className="font-sans text-[#4A3B32]/90 font-light">
                                        Your inquiry has been received. Our concierge will contact you via WhatsApp or Email shortly.
                                    </p>
                                </div>
                                <span className="text-2xl text-[#E5C989] ml-4 font-serif">✓</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1: Two columns (First Name, Last Name) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                                >
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all placeholder-[#4A3B32]/40"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                                >
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all placeholder-[#4A3B32]/40"
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        {/* Row 2: Email (Full width) */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all placeholder-[#4A3B32]/40"
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Row 3: Phone / Whatsapp (Full width) */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                            >
                                Phone / Whatsapp
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all placeholder-[#4A3B32]/40"
                                placeholder="+62 8xx xxxx xxxx"
                            />
                        </div>

                        {/* Row 4: Treatment (Full width) */}
                        <div>
                            <label
                                htmlFor="treatment"
                                className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                            >
                                Treatment
                            </label>
                            <select
                                id="treatment"
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all cursor-pointer"
                            >
                                <option value="Body Massage">Body Massage (Balinese / Aromatherapy / Deep Tissue)</option>
                                <option value="Scrub & Mask">Scrub &amp; Mask (Traditional Lulur / Herbal Glow)</option>
                                <option value="Short Treatment">Short Treatment (Back, Head &amp; Foot Reflexology)</option>
                                <option value="Hair Treatment">Hair Treatment (Botanical Cream Bath &amp; Scalp Ritual)</option>
                                <option value="Manicure & Pedicure">Manicure &amp; Pedicure (Organic Nail Artistry)</option>
                                <option value="Kids Menu">Kids Menu (Gentle Care for Little Royalty)</option>
                                <option value="Custom Sanctuary Package">Custom Sanctuary Package</option>
                            </select>
                        </div>

                        {/* Row 5: Tanggal Kunjungan (Full width) */}
                        <div>
                            <label
                                htmlFor="visitDate"
                                className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                            >
                                Tanggal Kunjungan
                            </label>
                            <input
                                id="visitDate"
                                type="date"
                                required
                                value={formData.visitDate}
                                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all"
                            />
                        </div>

                        {/* Row 6: Pesan Pertanyaan (Textarea, Full width) */}
                        <div>
                            <label
                                htmlFor="message"
                                className="block font-sans text-xs md:text-sm font-medium text-[#4A3B32] mb-2 tracking-wide"
                            >
                                Pesan Pertanyaan
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="bg-[#EAE4DD] text-[#4A3B32] p-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E5C989] rounded-sm border-0 font-sans transition-all placeholder-[#4A3B32]/40 resize-none"
                                placeholder="Tell us about your preferences or any inquiries you have..."
                            />
                        </div>

                        {/* Submit Button: Center-aligned at bottom */}
                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#E5C989] text-[#4A3B32] px-12 py-3.5 font-serif text-lg font-medium rounded-sm shadow-md hover:brightness-95 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </section>

            {/* ── 4. CONTACT INFO ICONS SECTION ── */}
            <section className="bg-[#FDFBF7] py-16 md:py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-serif text-[#4A3B32] text-3xl md:text-4xl lg:text-[40px] font-normal text-center mb-14 tracking-wide">
                        Contact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-10 md:gap-8 items-start">
                        {/* Col 1: Email */}
                        <div className="flex flex-col items-center group">
                            <div className="w-14 h-14 rounded-full bg-[#F8F5F0] flex items-center justify-center text-[#4A3B32] mb-5 shadow-xs border border-[#EAE4DD] group-hover:bg-[#E5C989]/20 transition-all">
                                <svg
                                    className="w-6 h-6 text-[#4A3B32]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                                </svg>
                            </div>
                            <a
                                href="mailto:sadalispaa@gmail.com"
                                className="font-sans text-sm md:text-base text-[#4A3B32] hover:text-[#E5C989] transition-colors leading-relaxed tracking-wide font-normal"
                            >
                                sadalispaa@gmail.com
                            </a>
                        </div>

                        {/* Col 2: Location/Pin */}
                        <div className="flex flex-col items-center group">
                            <div className="w-14 h-14 rounded-full bg-[#F8F5F0] flex items-center justify-center text-[#4A3B32] mb-5 shadow-xs border border-[#EAE4DD] group-hover:bg-[#E5C989]/20 transition-all">
                                <svg
                                    className="w-6 h-6 text-[#4A3B32]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <a
                                href="https://maps.google.com/?q=Sadali+Spa+%26+Salon+Bali+Collection+Nusa+Dua"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-sm md:text-base text-[#4A3B32] hover:text-[#E5C989] transition-colors leading-relaxed max-w-xs font-normal"
                            >
                                Jl. Kw. Nusa Dua Resort, Benoa, Kec. Kuta Sel., Kabupaten Badung, Bali 80361
                            </a>
                        </div>

                        {/* Col 3: Phone */}
                        <div className="flex flex-col items-center group">
                            <div className="w-14 h-14 rounded-full bg-[#F8F5F0] flex items-center justify-center text-[#4A3B32] mb-5 shadow-xs border border-[#EAE4DD] group-hover:bg-[#E5C989]/20 transition-all">
                                <svg
                                    className="w-6 h-6 text-[#4A3B32]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <a
                                href="tel:+6287777371188"
                                className="font-sans text-sm md:text-base text-[#4A3B32] hover:text-[#E5C989] transition-colors leading-relaxed tracking-wide font-normal"
                            >
                                +62 877 7737 1188
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. MAP SECTION ── */}
            <section className="w-full">
                {/* Full-width Map Container */}
                <div className="w-full h-[400px] bg-[#EAE4DD] relative overflow-hidden border-y border-[#4A3B32]/10">
                    <iframe
                        title="Sadali Spa &amp; Salon Nusa Dua Location Map"
                        src="https://maps.google.com/maps?q=Sadali%20Spa%20%26%20Salon%20Nusa%20Dua%20Bali&t=&z=16&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Banner below the map */}
                <div className="bg-[#FDFBF7] py-12 px-6 sm:px-8 border-b border-[#4A3B32]/10">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="font-serif text-[#4A3B32] text-2xl md:text-3xl lg:text-[32px] font-normal text-center md:text-left leading-tight">
                            Visit Our Spa Bali Collection Sanctuary
                        </h2>
                        <button
                            onClick={handleOpenGoogleMaps}
                            className="bg-[#E5C989] text-[#4A3B32] px-8 py-3.5 font-medium rounded-sm hover:brightness-95 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                            Open Maps
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 6. CTA SECTION (BEFORE GLOBAL FOOTER) ── */}
            <section className="bg-[#FDFBF7] py-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <p className="font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[#4A3B32]/70 mb-3">
                        Convenient Vacation Pampering
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] text-[#4A3B32] font-normal leading-[1.25] mb-8 max-w-2xl mx-auto">
                        Looking for the Most Rejuvenating Massage Spa Near Me?
                    </h2>
                    <button
                        onClick={() => onOpenBooking('Body Massage')}
                        className="bg-[#E5C989] text-[#4A3B32] px-10 py-3.5 font-medium text-base rounded-sm hover:brightness-95 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        Book Now
                    </button>
                </div>
            </section>
        </main>
    );
}
