import { motion } from 'framer-motion';

type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

interface BlogPageProps {
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking?: (service?: string) => void;
}

export default function BlogPage({ onOpenBooking }: BlogPageProps) {
    return (
        <main className="min-h-screen text-[#4A3B32] overflow-hidden bg-gradient-to-b from-[#FAF4E6] via-[#EED8A1] via-[#E4C57C] to-[#D8B35D]">
            {/* =========================================================================
                SECTION 1: HERO BANNER (Matching Photo 1)
                - Background image: monks walking up stairs before Buddha + Balinese girl with frangipani
                - Title: "Our Treatment Menu" in gold serif font
                - Subtitle: "Explore our full range of therapeutic bodywork, luxury salon care, and holistic wellness Nusa Dua packages at Sadali Spa & Salon."
                - Mist fade transition at the bottom directly into the creamy golden gradient
            ========================================================================= */}
            <section className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] flex items-center justify-center text-center overflow-hidden pt-36 sm:pt-44 md:pt-52 pb-28 sm:pb-36 md:pb-44 px-6">
                {/* Background Image with Slow Subtle Zoom */}
                <motion.div
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/images/blog-menu-hero.jpg"
                        alt="Our Treatment Menu - Sadali Spa & Salon"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Warm dark vignette overlay for legibility and luxury depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65 backdrop-blur-[0.2px]" />
                </motion.div>

                {/* Hero Title & Description */}
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
                        className="font-serif text-[34px] sm:text-[46px] md:text-[56px] lg:text-[62px] text-[#F3E3C8] font-bold leading-[1.16] mb-4 sm:mb-5 tracking-tight drop-shadow-lg"
                    >
                        Our Treatment Menu
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        className="font-sans text-[#F5EDE3] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow"
                    >
                        Explore our full range of therapeutic bodywork, luxury salon care, and holistic wellness Nusa Dua packages at Sadali Spa &amp; Salon.
                    </motion.p>
                </div>

                {/* Bottom Mist Fade into the warm golden background below */}
                <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 bg-gradient-to-t from-[#FAF4E6] via-[#FAF4E6]/85 to-transparent pointer-events-none z-10" />
            </section>

            {/* =========================================================================
                SECTION 2: INTRO (Matching Photo 1 Bottom Half)
                - "Customized Pampering"
                - "Total Relaxation at the Best Spa in Nusa Dua"
                - Description paragraph
            ========================================================================= */}
            <section className="relative w-full pt-8 sm:pt-12 md:pt-16 pb-14 sm:pb-18 md:pb-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                    className="max-w-3xl mx-auto"
                >
                    <p className="font-serif text-sm sm:text-base text-[#7E6652] mb-3 sm:mb-4">
                        Customized Pampering
                    </p>

                    <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[44px] lg:text-[46px] text-[#4A3B32] font-bold leading-[1.22] mb-5 sm:mb-6">
                        Total Relaxation at the Best Spa in<br className="hidden sm:inline" /> Nusa Dua
                    </h2>

                    <p className="font-sans text-[#6B5A4D] text-sm sm:text-base md:text-[15px] leading-relaxed max-w-2xl mx-auto">
                        Step into a world of tranquility located inside Bali Collection. Whether you are looking for an authentic Balinese massage near me, restorative hair treatments at a top salon near me, or flawless care at a premier nail salon near me, filter our full menu below to find your ideal treatment.
                    </p>
                </motion.div>
            </section>

            {/* =========================================================================
                SECTION 3: PHOTO 2 CONTENT & ENLARGED SERVICE MENU FRAME
                - Large Child manicure photo matching framed box width
                - Extra wide and tall dark-brown framed container for listing services
                - "Plan Your Spa Day" CTA with "Book Now" button
            ========================================================================= */}
            <section className="relative w-full pb-20 sm:pb-24 md:pb-28 px-4 sm:px-8 md:px-12">
                <div className="max-w-4xl lg:max-w-5xl xl:max-w-5xl mx-auto flex flex-col items-center w-full">
                    
                    {/* Centered Child Image with Rounded Corners - Enlarged to match frame width */}
                    <motion.div
                        initial={{ opacity: 0, y: 25, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                        className="w-full aspect-[16/11] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg mb-10 sm:mb-14 group"
                    >
                        <img
                            src="/images/Kids-Menu.JPG"
                            alt="Kids & Family Spa Menu"
                            className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    </motion.div>

                    {/* Extra Wide & Large Framed Menu Container ("Bingkai kotak yg nantinya akan di pakai untuk menampilkan list menu service nya") */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
                        className="w-full min-h-[580px] sm:min-h-[680px] md:min-h-[780px] lg:min-h-[860px] bg-[#FAF5EB] border-[12px] sm:border-[16px] md:border-[20px] border-[#4A3222] shadow-2xl relative"
                    >
                        {/* Clean interior ready for listing multiple menu services */}
                    </motion.div>

                    {/* Bottom CTA Section (Matching Photo 2 bottom) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
                        className="w-full text-center mt-14 sm:mt-20 pt-10 border-t border-[#4A3B32]/20 flex flex-col items-center"
                    >
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#7E6652] mb-3 font-medium">
                            Plan Your Spa Day
                        </p>

                        <h3 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-[#4A3B32] font-bold leading-snug mb-6 max-w-xl">
                            Book Your Favorite Massage Spa Near Me at Spa Bali Collection
                        </h3>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onOpenBooking?.('Kids & Family Spa Menu')}
                            className="bg-[#DFC48E] hover:bg-[#d4b778] text-[#4A3B32] px-10 py-3 font-serif text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                        >
                            Book Now
                        </motion.button>
                    </motion.div>

                </div>
            </section>
        </main>
    );
}
