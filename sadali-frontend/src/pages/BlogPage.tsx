import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

interface BlogPageProps {
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking?: (service?: string) => void;
}

interface BlogPost {
    id: number;
    category: 'massage' | 'scrubs' | 'hair' | 'nails';
    categoryLabel: string;
    author: string;
    date: string;
    title: string;
    excerpt: string;
    image: string;
    readTime?: string;
    fullContent?: string;
}

const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        category: 'massage',
        categoryLabel: 'Body Massage',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '4 min read',
        fullContent:
            'Experience the timeless tradition of Balinese bodywork. From aromatic floral foot cleanses to rhythmic palm pressures and warm herbal compress rituals, every treatment at Sadali Spa inside Bali Collection is calibrated to ease muscular tension and awaken mental clarity.'
    },
    {
        id: 2,
        category: 'scrubs',
        categoryLabel: 'Scrubs & Masks',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '5 min read',
        fullContent:
            'Reveal silky, radiant skin with our handcrafted botanical body scrubs. Infused with indigenous Balinese turmeric, sandalwood, and tropical floral extracts, our exfoliating rituals sweep away dryness while nourishing the skin barrier.'
    },
    {
        id: 3,
        category: 'hair',
        categoryLabel: 'Hair Treatments',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '3 min read',
        fullContent:
            'Deep conditioning cream baths and specialized scalp therapy restore moisture, volume, and shine to sun-kissed hair. Relax as nutrient-rich botanical oils are massaged through each strand, paired with gentle neck and shoulder acupressure.'
    },
    {
        id: 4,
        category: 'nails',
        categoryLabel: 'Manicure & Pedicure',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '4 min read',
        fullContent:
            'Immerse your senses in warm botanical foot baths floating with fresh marigolds and frangipani petals. Our nail artisans combine gentle scrub exfoliation, cuticle care, and precision massage for deeply nourished hands and feet.'
    },
    {
        id: 5,
        category: 'massage',
        categoryLabel: 'Body Massage',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '5 min read',
        fullContent:
            'Discover the deep restorative benefits of traditional herbal oil massage. Formulated with native ginger, lemongrass, and virgin coconut oil, this therapy increases circulation and releases deep-seated stress.'
    },
    {
        id: 6,
        category: 'scrubs',
        categoryLabel: 'Scrubs & Masks',
        author: 'Sadali Spa',
        date: '12 Sep 2026',
        title: 'Lorem ipsum dolor',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two , Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incidiu lore a one ,lore a two ,',
        image: '/images/Manicure-Pedicure.jpeg',
        readTime: '4 min read',
        fullContent:
            'Complete your Bali holiday with our signature body mask experience. Natural clay and soothing botanical infusions envelop the body, sealing in vital hydration and leaving your skin luminous and refreshed.'
    }
];

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'massage', label: 'Body Massage' },
    { id: 'scrubs', label: 'Scrubs & Masks' },
    { id: 'hair', label: 'Hair Tratments' },
    { id: 'nails', label: 'Manicure & Pedicure' }
];

export default function BlogPage({ onOpenBooking }: BlogPageProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

    const filteredPosts =
        selectedCategory === 'all'
            ? BLOG_POSTS
            : BLOG_POSTS.filter((post) => post.category === selectedCategory);

    return (
        <main className="relative min-h-screen text-[#382012] overflow-hidden bg-gradient-to-b from-[#FBF5EC] via-[#F4E3BA] via-[#ECCF8D] via-[#E6C67E] to-[#DCB665]">
            {/* Subtle brand watermark logo on side */}
            <div className="fixed -right-20 top-1/3 z-0 pointer-events-none opacity-[0.03] select-none">
                <img src="/images/Logo-Sadali.png" alt="" className="w-[520px] h-[520px] object-contain filter invert" />
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════
                SECTION 1: HERO & INTRO WITH SADALI LOGO (Image 1 Exact 1:1)
                - Full-width edge-to-edge hero with About-bg.jpg
                - Hanging plants, red brick wall, and illuminated Sadali entrance
                - Real illuminated arch sign: Sadali lotus flower and SADALI text
                - Title: "Spa & Wellness Journal" in warm gold serif with soft shadow
                - Subtitle: "Insights, beauty guides, and expert tips..."
                - Smooth golden mist transition into:
                  "Customized Pampering" & "Total Relaxation at the Best Spa in Nusa Dua"
            ═════════════════════════════════════════════════════════════════════════ */}
            {/* Hero Banner matching user design — full illuminated SADALI sign & solid text */}
            <section className="relative w-full h-[540px] sm:h-[600px] md:h-[660px] lg:h-[700px] overflow-hidden flex flex-col items-center justify-start text-center">
                {/* Background Image Container with exact crop and seamless mist fade */}
                <div className="absolute inset-0 w-full h-full">
                    <motion.div
                        initial={{ scale: 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 2.2, ease: 'easeOut' }}
                        className="w-full h-full"
                    >
                        <img
                            src="/images/about-hero-cropped.jpg"
                            alt="Sadali Spa & Wellness Journal Nusa Dua"
                            className="w-full h-full object-cover object-[center_95%] sm:object-[center_92%]"
                            style={{
                                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 90%, rgba(0,0,0,0.4) 96%, rgba(0,0,0,0) 100%)',
                                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 90%, rgba(0,0,0,0.4) 96%, rgba(0,0,0,0) 100%)',
                            }}
                        />
                    </motion.div>

                    {/* Atmospheric Dark Tint for Text Contrast & Solid Look */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 75%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 75%)'
                    }} />

                    {/* Soft Mist fade at bottom blending seamlessly into page background */}
                    <div className="absolute bottom-0 inset-x-0 h-20 sm:h-24 bg-gradient-to-t from-[#F9F4EB] via-[#F9F4EB]/50 to-transparent pointer-events-none" />
                </div>

                {/* Hero Text Content matching user design — lowered position, warm gold, smooth animation */}
                <div className="relative z-10 max-w-4xl px-4 flex flex-col items-center justify-center pt-39 sm:pt-49 md:pt-55 lg:pt-60">
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
                        className="text-4xl sm:text-5xl md:text-[56px] font-serif text-[#E8CDA2] mb-3 leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] tracking-wide font-normal"
                    >
                        Spa &amp; Wellness Journal
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        className="text-[#F3E5D0] text-sm sm:text-base md:text-[16px] font-normal max-w-lg mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] leading-relaxed"
                    >
                        Insights, beauty guides, and expert tips for experiencing the ultimate relaxation at the best spa in Nusa Dua.
                    </motion.p>
                </div>
            </section>

            {/* Headline Section: Directly underneath the glowing Sadali sign */}
            <section className="relative z-10 max-w-3xl mx-auto px-6 pt-6 sm:pt-10 pb-12 sm:pb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="font-serif text-sm sm:text-base text-[#785C42] mb-2 sm:mb-3 tracking-wide font-normal">
                        Customized Pampering
                    </p>

                    <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] text-[#382012] font-normal leading-[1.2] tracking-tight">
                        Total Relaxation at the Best Spa in<br className="hidden sm:inline" /> Nusa Dua
                    </h2>
                </motion.div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════════════
                SECTION 2: CATEGORY FILTER TABS (Image 2 Top)
                - Centered pills: "All", "Body Massage", "Scrubs & Masks", "Hair Tratments", "Manicure & Pedicure"
                - Active tab: dark espresso brown #382012 with white text
                - Inactive tabs: cream pill with gold border #C6A875
            ═════════════════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 w-full pb-8 sm:pb-12 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                        className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4"
                    >
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <motion.button
                                    key={cat.id}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`relative px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-sans tracking-wide transition-all duration-300 cursor-pointer shadow-sm ${
                                        isActive
                                            ? 'bg-[#382012] text-white shadow-md font-medium'
                                            : 'bg-[#FDF7EC]/85 hover:bg-[#FDF7EC] text-[#382012] border border-[#C6A875]/80 hover:border-[#382012]'
                                    }`}
                                >
                                    {cat.label}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════════════
                SECTION 3: BLOG POST CARDS GRID (Image 2 & 3)
                - 3 columns layout
                - Card: cream background #FAF5EB, rounded-[26px], shadow-sm
                - Image: Manicure-Pedicure.jpeg with rounded corners
                - Meta info: "Sadali Spa" (left) and "12 Sep 2026" (right)
                - Title: "Lorem ipsum dolor"
                - Excerpt: Lorem ipsum dolor sit amet...
                - Bottom right: circular gold button with right arrow icon
            ═════════════════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 w-full pb-20 sm:pb-28 px-4 sm:px-8 md:px-12">
                <div className="max-w-[1180px] mx-auto">
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredPosts.map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    layout
                                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{
                                        duration: 0.55,
                                        delay: index * 0.08,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    whileHover={{ y: -6 }}
                                    className="group bg-[#FAF5EB] rounded-[26px] p-3.5 sm:p-4 pb-5 sm:pb-6 shadow-[0_8px_24px_rgba(56,32,18,0.07)] hover:shadow-[0_16px_36px_rgba(56,32,18,0.13)] transition-all duration-300 flex flex-col justify-between border border-[#E8D9BD]/60 backdrop-blur-xs"
                                >
                                    {/* Top Content */}
                                    <div>
                                        {/* Card Top Image with Rounded Corners */}
                                        <div className="relative aspect-[16/11] rounded-[20px] overflow-hidden mb-4 shadow-sm bg-stone-200">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                                            />
                                            {/* Soft hover vignette */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        {/* Metadata Row: Sadali Spa & Date */}
                                        <div className="flex items-center justify-between text-xs sm:text-[13px] text-[#735843] font-sans font-medium px-1 mb-2.5">
                                            <span>{post.author}</span>
                                            <span>{post.date}</span>
                                        </div>

                                        {/* Post Title */}
                                        <h3 className="font-serif text-xl sm:text-[22px] font-bold text-[#382012] leading-snug px-1 mb-2.5 group-hover:text-[#9E732E] transition-colors duration-200">
                                            {post.title}
                                        </h3>

                                        {/* Post Excerpt */}
                                        <p className="font-sans text-xs sm:text-[13px] text-[#554133] leading-[1.65] px-1 line-clamp-6">
                                            {post.excerpt}
                                        </p>
                                    </div>

                                    {/* Bottom Action: Circular Gold Arrow Button */}
                                    <div className="flex justify-end pt-5 px-1">
                                        <motion.button
                                            whileHover={{ scale: 1.12, rotate: -4 }}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={() => setActiveArticle(post)}
                                            aria-label={`Read more about ${post.title}`}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DFC48E] hover:bg-[#D4B574] text-[#382012] flex items-center justify-center shadow-sm cursor-pointer transition-colors duration-200"
                                        >
                                            <svg
                                                className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.4"
                                                viewBox="0 0 24 24"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════════════
                SECTION 4: WELLNESS JOURNEY CTA (Image 4 Top)
                - Subheading: "Begin Your Wellness Journey"
                - Heading: "Ready to Relax at the Most Trusted Massage Spa Near Me?"
                - Button: "Book Now" (golden button matching design)
            ═════════════════════════════════════════════════════════════════════════ */}
            <section className="relative z-10 w-full pb-20 sm:pb-24 md:pb-28 px-6 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center"
                    >
                        <p className="font-sans text-xs sm:text-sm text-[#735843] mb-3 sm:mb-4 tracking-wide font-medium">
                            Begin Your Wellness Journey
                        </p>

                        <h2 className="font-serif text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] text-[#382012] font-normal leading-[1.2] mb-7 sm:mb-8 max-w-3xl">
                            Ready to Relax at the Most Trusted<br className="hidden sm:inline" /> Massage Spa Near Me?
                        </h2>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onOpenBooking?.('Body Massage')}
                            className="bg-[#DFC48E] hover:bg-[#D4B574] text-[#382012] px-10 sm:px-12 py-3.5 font-serif font-semibold text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Book Now
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════════════
                ARTICLE DETAILS MODAL (Interactive Reader)
            ═════════════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {activeArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
                        onClick={() => setActiveArticle(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-[#FAF5EB] rounded-[28px] overflow-hidden shadow-2xl border border-[#E4D1B2] flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setActiveArticle(null)}
                                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Close article"
                            >
                                ✕
                            </button>

                            {/* Modal Header Image */}
                            <div className="relative w-full h-56 sm:h-72">
                                <img
                                    src={activeArticle.image}
                                    alt={activeArticle.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF5EB] via-transparent to-black/30" />
                                <div className="absolute bottom-4 left-6 right-6">
                                    <span className="inline-block px-3 py-1 bg-[#382012] text-white text-xs rounded-full font-medium mb-2">
                                        {activeArticle.categoryLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                                <div className="flex items-center justify-between text-xs sm:text-sm text-[#735843] font-medium mb-3">
                                    <span>{activeArticle.author}</span>
                                    <span>{activeArticle.date} • {activeArticle.readTime}</span>
                                </div>

                                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#382012] mb-4">
                                    {activeArticle.title}
                                </h3>

                                <div className="space-y-4 text-sm sm:text-base text-[#554133] leading-relaxed">
                                    <p>{activeArticle.excerpt}</p>
                                    <p>{activeArticle.fullContent}</p>
                                </div>

                                {/* Modal CTA */}
                                <div className="mt-8 pt-6 border-t border-[#E8DAC0] flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className="font-serif text-sm font-semibold text-[#382012]">
                                            Ready to experience this treatment?
                                        </p>
                                        <p className="text-xs text-[#735843]">
                                            Book your session today at Sadali Spa &amp; Salon.
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            const serviceName = activeArticle.categoryLabel;
                                            setActiveArticle(null);
                                            onOpenBooking?.(serviceName);
                                        }}
                                        className="bg-[#DFC48E] hover:bg-[#D4B574] text-[#382012] px-6 py-2.5 font-serif font-semibold text-xs tracking-wide shadow transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        Book This Treatment
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
