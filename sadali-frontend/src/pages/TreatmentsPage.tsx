import { motion } from 'framer-motion';

interface TreatmentRowProps {
    title: string;
    subtitle?: string;
    description: string;
    imageSrc: string;
    isReversed: boolean;
    onBook: (service: string) => void;
    buttonLabel?: string;
}

function TreatmentRow({ title, subtitle, description, imageSrc, isReversed, onBook, buttonLabel = 'View Menu' }: TreatmentRowProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} w-full min-h-[420px] md:min-h-[500px]`}
        >
            {/* Image — always on top on mobile */}
            <div className="w-full md:w-1/2 h-[280px] md:h-auto overflow-hidden relative group flex-shrink-0">
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
            </div>

            {/* Text block */}
            <div className="w-full md:w-1/2 bg-[#EBE3D5] flex flex-col justify-center items-center text-center px-8 py-16 md:px-16 lg:px-24 flex-shrink-0">
                {subtitle && (
                    <p className="text-xs font-sans uppercase tracking-[0.22em] text-[#8c7155] mb-4 font-medium">
                        {subtitle}
                    </p>
                )}
                <h3 className="font-serif text-[28px] md:text-[36px] lg:text-[42px] text-[#4A3B32] leading-tight mb-5 font-bold">
                    {title}
                </h3>
                <div className="w-10 h-[2px] bg-[#E5C989] mb-6" />
                <p className="font-sans text-[#6B5A4D] text-base md:text-[17px] leading-relaxed mb-10 max-w-xs">
                    {description}
                </p>
                <button
                    onClick={() => onBook(title)}
                    className="bg-[#E5C989] text-[#4A3B32] px-10 py-3.5 font-sans font-semibold tracking-wide text-sm hover:bg-[#d6b77c] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                    {buttonLabel}
                </button>
            </div>
        </motion.div>
    );
}

interface TreatmentsPageProps {
    onNavigate: (page: 'home' | 'about' | 'treatments', sectionId?: string) => void;
    onOpenBooking: (service?: string) => void;
}

const treatmentsData = [
    {
        title: 'Body Massage',
        subtitle: 'Signature Treatment',
        description: 'Indulge in a deeply restorative full-body massage that melts away tension with warm Balinese herbal oils and time-honored pressure techniques.',
        imageSrc: '/images/Body-Massage.jpg',
        isReversed: false,
    },
    {
        title: 'Exfoliating Body Scrubs & Masks',
        subtitle: 'Skin Renewal',
        description: 'Revitalize sun-kissed skin with organic body scrubs and traditional Balinese herbal wraps. Restore luminosity and deep nourishment.',
        imageSrc: '/images/Scrub-Mask.jpg',
        isReversed: true,
    },
    {
        title: 'Hair Treatments & Styling',
        subtitle: 'Hair Care',
        description: 'Restore your hair\'s shine after a sunny day at the beach. As a premier Bali Collection salon and top salon near me, we offer luxurious botanical cream baths.',
        imageSrc: '/images/Hair-Treatment.jpg',
        isReversed: false,
    },
    {
        title: 'Manicure & Pedicure Care',
        subtitle: 'Nail Artistry',
        description: 'Treat your hands and feet to luxury care at the leading nail salon near me. Premium organic products, impeccable finishing that lasts.',
        imageSrc: '/images/Manicure-Pedicure.jpeg',
        isReversed: true,
    },
    {
        title: 'Kids & Family Spa Menu',
        subtitle: 'Family Wellness',
        description: 'Spa day is for everyone! As a dedicated family spa near me, we feature fun, safe, and gentle treatments specially designed for young guests.',
        imageSrc: '/images/Kids-Menu.JPG',
        isReversed: false,
    },
    {
        title: 'Express & Short Treatments',
        subtitle: 'Quick Escape',
        description: 'Short on time while exploring Bali Collection? Experience targeted neck, shoulder, or foot refreshes from a recommended spa near me.',
        imageSrc: '/images/Short-Treatment.JPG',
        isReversed: true,
    },
];

export default function TreatmentsPage({ onOpenBooking }: TreatmentsPageProps) {
    return (
        <main className="bg-[#FDFBF7] min-h-screen text-[#4A3B32]">
            {/* Hero Header */}
            <section className="relative w-full pt-32 pb-20 px-6 text-center bg-[#FDFBF7] overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#4A3B32 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <p className="text-xs font-sans uppercase tracking-[0.28em] text-[#8c7155] mb-5 font-semibold">
                        Our Treatments
                    </p>
                    <h1 className="font-serif text-[42px] md:text-[62px] text-[#4A3B32] leading-[1.12] mb-6 font-bold">
                        Discover Your Path<br />to Wellness
                    </h1>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-[1px] bg-[#E5C989]" />
                        <div className="w-2 h-2 rounded-full bg-[#E5C989]" />
                        <div className="w-12 h-[1px] bg-[#E5C989]" />
                    </div>
                    <p className="font-sans text-[#6B5A4D] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                        From restorative Balinese massages to luxury nail care, every treatment at Sadali Spa &amp; Salon is crafted to leave you renewed.
                    </p>
                </motion.div>
            </section>

            {/* Thin gold divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E5C989]/60 to-transparent" />

            {/* Z-Pattern Treatment Rows */}
            <section className="w-full flex flex-col">
                {treatmentsData.map((treatment, idx) => (
                    <TreatmentRow
                        key={treatment.title}
                        title={treatment.title}
                        subtitle={treatment.subtitle}
                        description={treatment.description}
                        imageSrc={treatment.imageSrc}
                        isReversed={treatment.isReversed}
                        onBook={onOpenBooking}
                        buttonLabel={idx === 0 ? 'Book Now' : 'View Menu'}
                    />
                ))}
            </section>

            {/* CTA Section */}
            <section className="w-full flex flex-col items-center justify-center py-24 md:py-32 bg-[#FDFBF7] px-6 border-t border-[#E5C989]/30">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col items-center text-center max-w-2xl"
                >
                    <p className="text-xs font-sans uppercase tracking-[0.28em] text-[#8c7155] mb-5 font-semibold">
                        Experience Pure Bliss
                    </p>
                    <h2 className="font-serif text-[32px] md:text-[46px] text-[#4A3B32] leading-[1.18] mb-5 font-bold">
                        Reserve Your Treatment at Sadali Spa &amp; Salon Today
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-[1px] bg-[#E5C989]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E5C989]" />
                        <div className="w-10 h-[1px] bg-[#E5C989]" />
                    </div>
                    <p className="font-sans text-[#6B5A4D] text-base md:text-[17px] leading-relaxed mb-10 max-w-lg">
                        Book your appointment online to secure your preferred time. Looking for a recommended spa near me or a top-rated salon near me in Nusa Dua? We are here for you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <button
                            onClick={() => onOpenBooking('Body Massage')}
                            className="bg-[#E5C989] text-[#4A3B32] px-12 py-4 font-sans font-semibold tracking-wide text-sm hover:bg-[#d6b77c] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                        >
                            Book Now
                        </button>
                        <a
                            href="https://wa.me/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-[#4A3B32]/25 text-[#4A3B32] px-10 py-4 font-sans font-medium text-sm hover:border-[#4A3B32]/60 hover:bg-[#4A3B32]/5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
