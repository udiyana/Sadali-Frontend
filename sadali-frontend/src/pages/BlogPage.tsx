import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';
type Category = 'ALL' | 'WELLNESS TIPS' | 'BEAUTY SECRETS' | 'SPA NEWS';

interface BlogPost {
    id: number;
    category: Exclude<Category, 'ALL'>;
    date: string;
    title: string;
    excerpt: string;
}

interface BlogPageProps {
    onNavigate: (page: PageType, sectionId?: string) => void;
    onOpenBooking?: (service?: string) => void;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        category: 'WELLNESS TIPS',
        date: 'October 10, 2026',
        title: 'The Ancient Art of Balinese Massage: What Your Body Really Needs',
        excerpt:
            "Drawing from centuries of Javanese and Balinese healing traditions, our therapists blend deep-tissue pressure with gentle acupressure to restore the body's natural energy flow.",
    },
    {
        id: 2,
        category: 'BEAUTY SECRETS',
        date: 'September 28, 2026',
        title: 'Gold & Jasmine: The Secret Ingredients Behind Our Signature Facial',
        excerpt:
            'Pure 24K gold colloidal and fresh jasmine extract work in harmony to brighten, firm, and deeply nourish even the most sensitive skin types. Discover the ritual.',
    },
    {
        id: 3,
        category: 'SPA NEWS',
        date: 'September 15, 2026',
        title: "Sadali Now Open at Bali Collection — Nusa Dua's Premier Wellness Sanctuary",
        excerpt:
            'We are thrilled to announce our flagship studio is now welcoming guests seven days a week inside Bali Collection Resort. Come experience total serenity steps from the sea.',
    },
    {
        id: 4,
        category: 'WELLNESS TIPS',
        date: 'August 30, 2026',
        title: 'Five Daily Rituals That Spa Therapists Actually Practice at Home',
        excerpt:
            'From dry-brushing before dawn to evening foot soaks infused with turmeric and lemongrass, our senior therapists share the private rituals that keep them glowing year-round.',
    },
    {
        id: 5,
        category: 'BEAUTY SECRETS',
        date: 'August 14, 2026',
        title: 'Why Volcanic Clay is the Skin Reset Your Pores Have Been Craving',
        excerpt:
            'Sourced from the slopes of Mount Agung, our signature volcanic clay mask draws out impurities, minimises pores, and leaves skin with an unrivalled, velvety finish.',
    },
    {
        id: 6,
        category: 'WELLNESS TIPS',
        date: 'July 22, 2026',
        title: 'How Regular Reflexology Can Transform Your Sleep Quality in 30 Days',
        excerpt:
            'Scientific research increasingly supports what traditional healers have known for millennia: targeted foot reflexology activates the parasympathetic nervous system, ushering in deeper, more restorative sleep.',
    },
    {
        id: 7,
        category: 'SPA NEWS',
        date: 'July 5, 2026',
        title: "Introducing the Royal Couple's Retreat — Our Most Indulgent Package Yet",
        excerpt:
            "Two hours of personalised therapy, champagne on arrival, a private garden soaking tub, and a curated take-home gift set. The Royal Couple's Retreat redefines togetherness.",
    },
    {
        id: 8,
        category: 'BEAUTY SECRETS',
        date: 'June 18, 2026',
        title: 'The Correct Order to Apply Skincare — A Sadali Therapist Explains',
        excerpt:
            'Toner before serum, serum before oil, oil before cream — the sequence matters more than the products themselves. Our lead esthetician breaks down the optimal layering logic.',
    },
    {
        id: 9,
        category: 'WELLNESS TIPS',
        date: 'May 30, 2026',
        title: 'Breathwork & Bodywork: A Holistic Approach to Deep Tension Release',
        excerpt:
            'Combining pranayama breathing exercises with targeted myofascial release, our holistic session helps clients dissolve chronic tension patterns that conventional massage alone cannot reach.',
    },
    {
        id: 10,
        category: 'SPA NEWS',
        date: 'May 12, 2026',
        title: "Sadali Earns Bali's Top Wellness Spa Award for the Second Consecutive Year",
        excerpt:
            "For the second year running, Sadali Spa & Salon has been recognised by the Bali Tourism Board as the island's leading boutique wellness spa, a testament to our dedicated team.",
    },
];

const CATEGORIES: Category[] = ['ALL', 'WELLNESS TIPS', 'BEAUTY SECRETS', 'SPA NEWS'];

// ─── Decorative Divider ───────────────────────────────────────────────────────
function DecorativeDivider() {
    return (
        <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-8 bg-[#E5C989]/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E5C989]/80" />
            <div className="h-px w-8 bg-[#E5C989]/60" />
        </div>
    );
}

// ─── Blog Post Item ───────────────────────────────────────────────────────────
interface BlogPostItemProps {
    post: BlogPost;
    index: number;
}

function BlogPostItem({ post, index }: BlogPostItemProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
            className="group flex flex-col gap-2 mb-8 pb-6 border-b border-[#4A3B32]/10 last:border-b-0 last:mb-0"
        >
            <div className="flex items-center gap-3">
                <span className="font-sans uppercase text-[10px] tracking-[0.14em] font-semibold text-[#E5C989]">
                    {post.category}
                </span>
                <span className="text-[#4A3B32]/30 text-xs">·</span>
                <span className="font-sans text-[11px] text-[#4A3B32]/50 tracking-wide">
                    {post.date}
                </span>
            </div>
            <h2 className="font-serif text-[1.1rem] leading-snug font-bold text-[#4A3B32] group-hover:text-[#3a2d25] transition-colors duration-200">
                {post.title}
            </h2>
            <p className="font-sans text-sm text-[#4A3B32]/65 leading-relaxed line-clamp-2">
                {post.excerpt}
            </p>
            <button
                className="flex items-center gap-1.5 mt-1 w-fit font-sans text-[11px] uppercase tracking-[0.12em] font-semibold text-[#4A3B32]/70 hover:text-[#E5C989] transition-colors duration-200 cursor-pointer focus:outline-none"
                aria-label={`Read more about ${post.title}`}
            >
                Read More
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                </span>
            </button>
        </motion.article>
    );
}

// ─── Main Blog Page ───────────────────────────────────────────────────────────
export default function BlogPage({ onNavigate }: BlogPageProps) {
    const [activeCategory, setActiveCategory] = useState<Category>('ALL');
    const scrollRef = useRef<HTMLDivElement>(null);

    const filtered =
        activeCategory === 'ALL'
            ? BLOG_POSTS
            : BLOG_POSTS.filter((p) => p.category === activeCategory);

    const handleTabClick = (cat: Category) => {
        setActiveCategory(cat);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };

    return (
        /*
         * SADALI FRAME
         * pt-[72px] clears the fixed navbar. The dark-brown padding on all other
         * sides creates the thick framing border around the inner cream canvas.
         */
        <div className="w-full min-h-screen bg-[#4A3B32] pt-[72px] px-4 pb-4 md:px-8 md:pb-8 lg:px-12 lg:pb-12">

            {/* ── Inner Canvas ── */}
            <div className="w-full bg-[#FDFBF7] relative flex flex-col shadow-2xl">

                {/* ── Page Header ── */}
                <header className="text-center pt-10 pb-5 px-6 border-b border-[#4A3B32]/10">
                    <p className="font-sans uppercase text-[11px] tracking-[0.22em] text-[#E5C989] mb-3">
                        Sadali Spa &amp; Salon
                    </p>
                    <DecorativeDivider />
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#4A3B32] mt-3 leading-tight">
                        Sadali Journal
                    </h1>
                    <p className="font-sans text-sm text-[#4A3B32]/55 mt-3 max-w-sm mx-auto leading-relaxed">
                        Wellness wisdom, beauty rituals, and stories from the heart of our sanctuary.
                    </p>
                </header>

                {/* ── Category Tab Bar — sticky inside the canvas ── */}
                <div className="sticky top-[72px] z-20 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#4A3B32]/10 shadow-sm">
                    <nav
                        className="flex items-center justify-center gap-1 md:gap-4 overflow-x-auto no-scrollbar"
                        aria-label="Blog categories"
                    >
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                id={`tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                                onClick={() => handleTabClick(cat)}
                                aria-pressed={activeCategory === cat}
                                className={`relative font-sans uppercase text-[10px] md:text-[11px] tracking-[0.18em] font-semibold py-4 px-3 md:px-4 whitespace-nowrap transition-colors duration-200 cursor-pointer focus:outline-none ${
                                    activeCategory === cat
                                        ? 'text-[#4A3B32]'
                                        : 'text-[#4A3B32]/45 hover:text-[#4A3B32]/75'
                                }`}
                            >
                                {cat}
                                {activeCategory === cat && (
                                    <motion.span
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5C989]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── 3-Column Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 px-6 pb-8 gap-6 xl:gap-8 flex-1 mt-6">

                    {/* LEFT SIDEBAR */}
                    <aside className="lg:col-span-1 hidden lg:flex flex-col gap-4 h-[70vh] sticky top-[120px]">
                        <div className="flex-1 overflow-hidden rounded-sm shadow-md">
                            <img
                                src="/images/blog-spa-left-top.jpg"
                                alt="Balinese spa interior with stone basin and frangipani flowers"
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden rounded-sm shadow-md">
                            <img
                                src="/images/blog-spa-left-bottom.jpg"
                                alt="Traditional Balinese facial massage treatment"
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                        </div>
                    </aside>

                    {/* CENTER COLUMN — independently scrollable */}
                    <main className="col-span-1 lg:col-span-2" aria-label="Blog articles">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-[#4A3B32]/10" />
                            <span className="font-sans uppercase text-[10px] tracking-[0.2em] text-[#4A3B32]/40">
                                {filtered.length}{' '}
                                {filtered.length === 1 ? 'article' : 'articles'}
                            </span>
                            <div className="h-px flex-1 bg-[#4A3B32]/10" />
                        </div>

                        <div
                            ref={scrollRef}
                            className="h-[65vh] overflow-y-auto pr-3 custom-scrollbar"
                        >
                            <AnimatePresence mode="wait">
                                {filtered.length > 0 ? (
                                    <motion.div
                                        key={activeCategory}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {filtered.map((post, i) => (
                                            <BlogPostItem key={post.id} post={post} index={i} />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-40 gap-2"
                                    >
                                        <p className="font-serif text-lg text-[#4A3B32]/40">
                                            No articles yet
                                        </p>
                                        <p className="font-sans text-sm text-[#4A3B32]/30">
                                            Check back soon.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>

                    {/* RIGHT SIDEBAR */}
                    <aside className="lg:col-span-1 hidden lg:flex flex-col gap-4 h-[70vh] sticky top-[120px]">
                        <div className="flex-1 overflow-hidden rounded-sm shadow-md">
                            <img
                                src="/images/blog-spa-right-top.jpg"
                                alt="Luxury spa essential oils and botanical skincare products"
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden rounded-sm shadow-md">
                            <img
                                src="/images/blog-spa-right-bottom.jpg"
                                alt="Tranquil outdoor Balinese spa pool at golden hour"
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                            />
                        </div>
                    </aside>
                </div>

                {/* ── Canvas Footer ── */}
                <div className="text-center pb-6 pt-2 border-t border-[#4A3B32]/10">
                    <DecorativeDivider />
                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#4A3B32]/35 mt-2">
                        Sadali Spa &amp; Salon · Nusa Dua, Bali
                    </p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="mt-3 font-sans text-[11px] uppercase tracking-[0.16em] text-[#4A3B32]/40 hover:text-[#E5C989] transition-colors duration-200 cursor-pointer focus:outline-none"
                    >
                        ← Back to Home
                    </button>
                </div>

            </div>
        </div>
    );
}

