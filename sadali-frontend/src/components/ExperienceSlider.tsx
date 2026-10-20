import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface SlideItem {
    id: number | string;
    image: string;
    title?: string;
    text1?: string;
    text2?: string;
    text3?: string;
}

interface ExperienceSliderProps {
    slides?: SlideItem[];
}

const defaultExperienceSlides: SlideItem[] = [
    {
        id: 1,
        image: '/images/Spa-room.jpg',
        title: 'Tranquil Sauna & Steam Sanctuary',
        text1: 'Experience world-class rejuvenation and tranquil ambiance.',
        text2: 'Curated wellness treatments nestled in Bali Collection',
        text3: 'designed for your ultimate peace.'
    },
    {
        id: 2,
        image: '/images/Spa-room-1.jpg',
        title: 'Serene Couple Relaxation Lounge',
        text1: 'Authentic botanical healing and warm herbal aromatherapy.',
        text2: 'Restoring mind, body, and soul through timeless rituals',
        text3: 'at Sadali Spa & Salon.'
    },
    {
        id: 3,
        image: '/images/Spa-room-2.jpg',
        title: 'Botanical Herbal Bath & Jacuzzi',
        text1: 'Nourish your body with organic botanicals.',
        text2: 'Our signature scrub and mask treatments rejuvenate',
        text3: 'and leave your skin glowing.'
    },
    {
        id: 4,
        image: '/images/Body-Massage.jpg',
        title: 'Signature Full Body Healing',
        text1: 'Melt away tension with warm Balinese herbal oils.',
        text2: 'Traditional techniques tailored to your body',
        text3: 'for complete muscular restoration.'
    },
    {
        id: 5,
        image: '/images/About-bg.jpg',
        title: 'Bali Collection Sanctuary Garden',
        text1: 'Escape into our serene outdoor pavilion in Nusa Dua.',
        text2: 'Surrounded by lush frangipani blossoms and cooling shade',
        text3: 'steps away from Bali Collection shopping.'
    }
];

export default function ExperienceSlider({ slides = defaultExperienceSlides }: ExperienceSliderProps) {
    return (
        <section id="experience" className="w-full bg-[#FDFBF7] py-16 md:py-24 overflow-hidden scroll-mt-20 select-none">
            {/* Embedded Custom Swiper Pagination Styles */}
            <style>{`
                .experience-swiper {
                    overflow: visible !important;
                    padding-bottom: 56px !important;
                }
                .experience-swiper .swiper-pagination {
                    bottom: 0px !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }
                .experience-swiper .swiper-pagination-bullet {
                    background-color: #d1c5b8;
                    opacity: 1;
                    width: 8px;
                    height: 8px;
                    margin: 0 !important;
                    border-radius: 9999px;
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .experience-swiper .swiper-pagination-bullet-active {
                    background-color: #4A3B32;
                    width: 32px;
                    border-radius: 8px;
                }
            `}</style>

            {/* Heading */}
            <div className="max-w-4xl mx-auto px-4 text-center mb-12">
                <h2 className="font-serif text-4xl sm:text-5xl text-[#4A3B32] font-normal tracking-wide">
                    Experience
                </h2>
            </div>

            {/* Swiper Coverflow Slider */}
            <div className="w-full max-w-[1400px] mx-auto px-4">
                <Swiper
                    modules={[EffectCoverflow, Pagination, Autoplay]}
                    effect="coverflow"
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
                    slidesPerView="auto"
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 150,
                        modifier: 2.5,
                        slideShadows: false,
                    }}
                    autoplay={{
                        delay: 4500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    className="experience-swiper"
                >
                    {slides.map((slide) => (
                        <SwiperSlide
                            key={slide.id}
                            className="max-w-[800px] w-[85%] md:w-[60%] h-[360px] sm:h-[420px] md:h-[500px]"
                        >
                            {({ isActive }) => (
                                <div
                                    className={`relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 ease-out ${
                                        isActive
                                            ? 'scale-100 opacity-100 shadow-[0_25px_60px_rgba(74,59,50,0.25)] z-20'
                                            : 'scale-90 opacity-40 z-10'
                                    }`}
                                >
                                    {/* Main Image */}
                                    <img
                                        src={slide.image}
                                        alt={slide.title || 'Sadali Spa Experience'}
                                        className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
                                        loading="lazy"
                                    />

                                    {/* Muted overlay for inactive adjacent slides */}
                                    {!isActive && (
                                        <div className="absolute inset-0 bg-[#EBE3D5]/40 mix-blend-multiply rounded-2xl md:rounded-3xl pointer-events-none" />
                                    )}
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
