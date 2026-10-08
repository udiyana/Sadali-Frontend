import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome() {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('Body Massage');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const videoSources = [
        {
            src: '/videos/spa-hero.mp4',
            fallback: 'https://assets.mixkit.co/videos/41708/41708-720.mp4',
            title: 'Candles & Flowers Ritual'
        },
        {
            src: '/videos/spa-massage.mp4',
            fallback: 'https://assets.mixkit.co/videos/41710/41710-720.mp4',
            title: 'Authentic Balinese Massage'
        }
    ];

    const nextVideo = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoSources.length);
    };

    const prevVideo = () => {
        setCurrentVideoIndex((prev) => (prev - 1 + videoSources.length) % videoSources.length);
    };

    const experienceSlides = [
        {
            image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1470&auto=format&fit=crop',
            text1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            text2: 'Sed do eiusmod tempor incididunt ut labore et dolore',
            text3: 'magna aliqua.'
        },
        {
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop',
            text1: 'Experience world-class rejuvenation and tranquil ambiance.',
            text2: 'Curated wellness treatments nestled in Bali Collection',
            text3: 'designed for your ultimate peace.'
        },
        {
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
            text1: 'Authentic botanical healing and warm herbal aromatherapy.',
            text2: 'Restoring mind, body, and soul through timeless rituals',
            text3: 'at Sadali Spa & Salon.'
        }
    ];

    const [experienceIndex, setExperienceIndex] = useState(0);

    const nextExperience = () => {
        setExperienceIndex((prev) => (prev + 1) % experienceSlides.length);
    };

    const prevExperience = () => {
        setExperienceIndex((prev) => (prev - 1 + experienceSlides.length) % experienceSlides.length);
    };

    const handleOpenBooking = (service = 'Body Massage') => {
        setSelectedService(service);
        setBookingSuccess(false);
        setIsBookingOpen(true);
    };

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBookingSuccess(true);
        setTimeout(() => {
            setIsBookingOpen(false);
            setBookingSuccess(false);
        }, 2500);
    };

    return (
        <>
            <Head>
                <title>SADALI | Best Spa in Nusa Dua</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
            </Head>
            <style dangerouslySetInnerHTML={{
                __html: `
                html { scroll-behavior: smooth; }
                .font-serif { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                body { background-color: #f6f6f4; color: #3d3b38; }
                .text-gold { color: #d6b77c; }
                .bg-gold { background-color: #e5c98c; }
                .bg-gold:hover { background-color: #d6b77c; }
            `}} />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex items-center justify-between bg-black/25 backdrop-blur-md transition-all duration-300">
                <a href="#home" className="flex items-center gap-2 text-2xl md:text-3xl tracking-widest font-sans font-light text-white ml-2 group">
                    <span className="text-gold text-3xl group-hover:rotate-45 transition-transform duration-500">❀</span> SADALI
                </a>
                <div className="hidden md:flex gap-10 text-white text-[15px] font-medium items-center">
                    <a href="#home" className="flex flex-col items-center group transition">
                        <span className="mb-1 text-white group-hover:text-gold transition">Home</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    </a>
                    <a href="#about" className="hover:text-gold transition">About Us</a>
                    <a href="#treatments" className="hover:text-gold transition">Treatments</a>
                    <a href="#experience" className="hover:text-gold transition">Experience</a>
                    <a href="#blog" className="hover:text-gold transition">Blog</a>
                    <a href="#contact" className="hover:text-gold transition">Contact</a>
                    <button
                        onClick={() => handleOpenBooking('Body Massage')}
                        className="bg-gold text-[#3d3b38] px-7 py-2.5 font-medium transition hover:bg-[#d6b77c] shadow-lg hover:shadow-gold/30 hover:scale-105 active:scale-95 duration-200 ml-4 cursor-pointer"
                    >
                        Book Now
                    </button>
                </div>
            </nav>

            {/* Hero Section with Video Background */}
            <section id="home" className="relative h-screen min-h-[720px] flex items-center justify-center text-center overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        key={videoSources[currentVideoIndex].src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    >
                        <source src={videoSources[currentVideoIndex].src} type="video/mp4" />
                        <source src={videoSources[currentVideoIndex].fallback} type="video/mp4" />
                    </video>
                    {/* Atmospheric Dark & Warm Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/45 bg-gradient-to-t from-[#f6f6f4] via-black/30 to-black/50 pointer-events-none"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl px-4 flex flex-col items-center mt-16">
                    <h1 className="text-5xl md:text-[64px] font-serif text-white mb-6 leading-tight drop-shadow-lg">
                        <span className="text-gold italic font-normal">Rejuvenate</span> at the Best Spa in<br />Nusa Dua
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-3xl drop-shadow leading-relaxed">
                        Experience authentic Balinese massage spa treatments, luxury nail<br className="hidden md:inline" /> care, and holistic wellness Nusa Dua rituals at Sadali Spa & Salon
                    </p>
                    <button
                        onClick={() => handleOpenBooking('Body Massage')}
                        className="bg-gold text-[#3d3b38] px-12 py-3.5 text-lg font-medium transition hover:bg-[#d6b77c] shadow-2xl hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                    >
                        Book Now
                    </button>

                    {/* Video Navigation Controls */}
                    <div className="flex items-center gap-6 mt-10 opacity-80">
                        <button
                            onClick={prevVideo}
                            title="Previous ambiance"
                            className="w-11 h-11 border border-white/60 rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:border-gold hover:text-gold transition cursor-pointer"
                        >
                            &lt;
                        </button>
                        <span className="text-white/70 text-xs tracking-widest uppercase font-medium">
                            {videoSources[currentVideoIndex].title}
                        </span>
                        <button
                            onClick={nextVideo}
                            title="Next ambiance"
                            className="w-11 h-11 border border-white/60 rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:border-gold hover:text-gold transition cursor-pointer"
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="absolute -bottom-16 w-full max-w-5xl mx-auto px-4 left-0 right-0 z-20">
                    <div className="bg-[#fcfcfa] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-10 px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[#3d3b38] rounded-xs">
                        <div className="border-r border-gray-300/50 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">3+</div>
                            <div className="text-[14px] text-gray-600">Years of Excellence</div>
                        </div>
                        <div className="border-r border-gray-300/50 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">15k+</div>
                            <div className="text-[14px] text-gray-600">Happy Guests</div>
                        </div>
                        <div className="border-r border-gray-300/50 last:border-0 relative">
                            <div className="text-3xl font-sans font-medium mb-1">100%</div>
                            <div className="text-[14px] text-gray-600">Organic Products</div>
                        </div>
                        <div className="relative">
                            <div className="text-3xl font-sans font-medium mb-1 text-gold">4.9★</div>
                            <div className="text-[14px] text-gray-600">Google Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro Header */}
            <section className="pt-44 pb-20 px-4 text-center max-w-3xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="text-4xl text-gold mb-2">❀</div>
                    <div className="text-3xl tracking-[0.25em] font-light">SADALI</div>
                </div>
                <div className="text-xs tracking-widest font-bold uppercase mb-8 text-[#3d3b38]">Escape • Indulge • Renew</div>
                <h2 className="text-4xl md:text-[44px] font-serif mb-8 text-[#3d3b38] leading-tight">
                    Premier Family Spa Near Me<br />inside Bali Collection
                </h2>
                <p className="text-gray-500 leading-relaxed mx-auto text-lg">
                    Experience the harmony of luxury and tranquility at Sadali<br />Spa & Salon, where every detail in Nusa Dua Bali Collection is<br />crafted to rejuvenate your body and soul.
                </p>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 px-4 border-t border-[#3d3b38]/10 w-full bg-[#f6f6f4] scroll-mt-20">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative flex justify-center group">
                        <div className="aspect-square w-[380px] md:w-[450px] rounded-full overflow-hidden shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-105">
                            <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1470&auto=format&fit=crop" alt="Spa Experience" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="absolute -bottom-4 right-10 bg-gold text-[#3d3b38] px-5 py-2 font-serif text-sm shadow-md rounded-full">
                            Authentic Bali
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="w-full border-t border-[#3d3b38]/20 mb-8"></div>
                        <p className="text-gray-600 leading-relaxed text-lg max-w-md">
                            Escape the island sun and unwind at our premier family spa near me, conveniently located inside Bali Collection. Whether you are searching for an authentic Balinese massage near me after a day on the beach or seeking a tranquil spa in Nusa Dua, our sanctuary blends traditional healing rituals with modern pampering.
                        </p>
                        <a
                            href="#treatments"
                            className="bg-gold text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] inline-block mt-4 hover:scale-105 duration-200 cursor-pointer shadow-md"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <section id="treatments" className="pt-24 pb-20 px-4 text-center bg-[#f6f6f4] scroll-mt-20">
                <div className="text-[17px] md:text-[18px] font-sans font-normal text-[#3d3b38] mb-3 tracking-wide">
                    Our Service
                </div>
                <h2 className="text-4xl md:text-[54px] font-serif font-bold text-[#2b2927] leading-[1.14] mb-16 md:mb-20 tracking-tight">
                    Discover your Path to<br />Wellness
                </h2>

                {/* Staggered Cards Layout Matching Exact Design */}
                <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row justify-center items-start gap-2.5 md:gap-3.5 mb-24 px-2">

                    {/* 1. Body Massage */}
                    <div
                        onClick={() => handleOpenBooking('Body Massage')}
                        className="relative w-full md:w-[16.6%] h-[320px] md:h-[370px] md:mt-[80px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1470&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Body Massage"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight">
                                Body<br />Massage
                            </span>
                        </div>
                    </div>

                    {/* 2. Scrub & Mask */}
                    <div
                        onClick={() => handleOpenBooking('Scrub & Mask')}
                        className="relative w-full md:w-[16.6%] h-[340px] md:h-[440px] md:mt-[140px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1470&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Scrub & Mask"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight">
                                Scrub<br />& Mask
                            </span>
                        </div>
                    </div>

                    {/* 3. Hair Treatment */}
                    <div
                        onClick={() => handleOpenBooking('Hair Treatment')}
                        className="relative w-full md:w-[16.6%] h-[340px] md:h-[430px] md:mt-[180px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1469&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Hair Treatment"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight">
                                Hair<br />Treatment
                            </span>
                        </div>
                    </div>

                    {/* 4. Manicure & Pedicure (Peaks at top) */}
                    <div
                        onClick={() => handleOpenBooking('Manicure & Pedicure')}
                        className="relative w-full md:w-[16.6%] h-[360px] md:h-[470px] md:mt-[0px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1469&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Manicure & Pedicure"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight">
                                Manicure<br />& Pedicure
                            </span>
                        </div>
                    </div>

                    {/* 5. Kids Menu (Extends lowest to bottom) */}
                    <div
                        onClick={() => handleOpenBooking('Kids Menu')}
                        className="relative w-full md:w-[16.6%] h-[380px] md:h-[530px] md:mt-[130px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=1471&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Kids Menu"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight flex flex-col items-start">
                                <span className="text-gold/90 text-2xl leading-none mb-1">❀</span>
                                Kids Menu
                            </span>
                        </div>
                    </div>

                    {/* 6. Short Treatment */}
                    <div
                        onClick={() => handleOpenBooking('Short Treatment')}
                        className="relative w-full md:w-[16.6%] h-[340px] md:h-[460px] md:mt-[70px] group overflow-hidden cursor-pointer rounded-xs shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1608283088514-63390cc69eb4?q=80&w=1470&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            alt="Short Treatment"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#48301d]/95 via-[#48301d]/30 to-transparent opacity-65 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-end p-5 transition-transform duration-500 group-hover:-translate-y-2 pointer-events-none">
                            <span className="text-white font-serif text-2xl font-medium drop-shadow-md text-left leading-tight">
                                Short<br />Treatment
                            </span>
                        </div>
                    </div>
                </div>

                <p className="max-w-3xl mx-auto text-gray-500 mb-10 text-lg leading-relaxed">
                    Explore our curated selection of spa and salon treatments, each<br className="hidden md:inline" /> designed to provide you with the ultimate relaxation and beauty experience
                </p>
                <button
                    onClick={() => handleOpenBooking('Full Body Massage')}
                    className="bg-gold text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-md"
                >
                    Book Now
                </button>
            </section>

            {/* Experience Carousel - Pure Photos Only */}
            <section id="experience" className="py-24 bg-[#f6f6f4] overflow-hidden scroll-mt-20 select-none">
                <div className="text-center mb-12">
                    <h2 className="text-[32px] md:text-[38px] font-serif text-[#5a4033]">Experience</h2>
                </div>

                {/* Sliding Carousel Showcase - Pure Photos Only */}
                <div className="relative max-w-6xl mx-auto flex justify-center items-center h-[340px] md:h-[480px] px-4">
                    {/* Left Previous Peek (Clickable to Slide) */}
                    {(() => {
                        const prevIdx = (experienceIndex - 1 + experienceSlides.length) % experienceSlides.length;
                        return (
                            <div
                                onClick={prevExperience}
                                className="absolute left-[-15%] md:left-[-5%] w-[45%] md:w-[48%] h-[75%] md:h-[80%] z-10 cursor-pointer overflow-hidden rounded-xs shadow-md opacity-40 hover:opacity-70 transition-all duration-700 ease-in-out"
                            >
                                <img
                                    src={experienceSlides[prevIdx].image}
                                    className="w-full h-full object-cover transition-all duration-700 filter brightness-90"
                                    alt="Previous Experience"
                                />
                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                            </div>
                        );
                    })()}

                    {/* Center Active Main Image (Clickable to Slide) */}
                    <div
                        onClick={nextExperience}
                        className="relative w-full max-w-[760px] md:max-w-[820px] h-[340px] md:h-[480px] z-20 cursor-pointer overflow-hidden rounded-xs shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-700 ease-in-out hover:scale-[1.01]"
                    >
                        <img
                            key={experienceSlides[experienceIndex].image}
                            src={experienceSlides[experienceIndex].image}
                            className="w-full h-full object-cover transition-all duration-700"
                            alt="Experience Main"
                        />
                    </div>

                    {/* Right Next Peek (Clickable to Slide) */}
                    {(() => {
                        const nextIdx = (experienceIndex + 1) % experienceSlides.length;
                        return (
                            <div
                                onClick={nextExperience}
                                className="absolute right-[-15%] md:right-[-5%] w-[45%] md:w-[48%] h-[75%] md:h-[80%] z-10 cursor-pointer overflow-hidden rounded-xs shadow-md opacity-40 hover:opacity-70 transition-all duration-700 ease-in-out"
                            >
                                <img
                                    src={experienceSlides[nextIdx].image}
                                    className="w-full h-full object-cover transition-all duration-700 filter brightness-90"
                                    alt="Next Experience"
                                />
                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                            </div>
                        );
                    })()}
                </div>

                {/* Pagination Dots Indicator */}
                <div className="flex justify-center items-center gap-3 mb-8 mt-10">
                    {experienceSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setExperienceIndex(idx)}
                            className={`transition-all duration-500 cursor-pointer ${idx === experienceIndex
                                    ? 'w-10 h-2 bg-[#5a4033] rounded-full'
                                    : 'w-2 h-2 bg-[#8c6753]/60 hover:bg-[#8c6753] rounded-full'
                                }`}
                            title={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Text Description */}
                <div className="text-center max-w-lg mx-auto px-4 min-h-[60px] text-gray-500 text-sm md:text-[15px] leading-relaxed transition-all duration-500">
                    <p>{experienceSlides[experienceIndex].text1}</p>
                    <p>{experienceSlides[experienceIndex].text2}</p>
                    <p>{experienceSlides[experienceIndex].text3}</p>
                </div>
            </section>

            {/* Google Review Section */}
            <section id="reviews" className="py-20 md:py-24 border-t border-b border-[#3d3b38]/15 bg-[#f6f6f4] scroll-mt-20">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
                    {/* Left: Google Logo + Reviews + Stars */}
                    <div className="flex flex-col items-center md:items-start shrink-0">
                        {/* Google Logo */}
                        <div className="text-5xl font-bold font-sans tracking-tight mb-2 select-none flex items-center">
                            <span className="text-[#4285F4]">G</span>
                            <span className="text-[#EA4335]">o</span>
                            <span className="text-[#FBBC05]">o</span>
                            <span className="text-[#4285F4]">g</span>
                            <span className="text-[#34A853]">l</span>
                            <span className="text-[#EA4335]">e</span>
                        </div>
                        {/* Reviews text and stars on one single line */}
                        <div className="flex items-center gap-3">
                            <span className="text-[#4a4a4a] text-xl font-bold tracking-tight">Reviews</span>
                            <span className="text-[#FBBC05] text-xl tracking-widest leading-none">★★★★★</span>
                        </div>
                    </div>

                    {/* Middle: Clean Vertical Divider */}
                    <div className="hidden md:block w-[1.5px] h-28 bg-[#3d3b38]/20 shrink-0"></div>

                    {/* Right: Reviewer Name & Testimonial */}
                    <div className="max-w-xl text-center md:text-left">
                        <h3 className="text-3xl font-serif text-[#5a4033] font-bold mb-3 tracking-wide">
                            John Doe
                        </h3>
                        <p className="text-gray-600 text-base md:text-[17px] leading-relaxed font-light">
                            The absolute best massage spa near me during our trip to Bali! We visited Sadali as a family after shopping around Bali Collection. The massages were deeply relaxing and the nail service was top tier.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 text-center bg-[#f6f6f4]">
                <div className="text-gray-600 mb-6 text-[15px] font-medium tracking-wide">Ready for Total Relaxation?</div>
                <h2 className="text-4xl md:text-[50px] font-serif text-[#3d3b38] mb-8 leading-tight">
                    Reserve Your Session at Sadali Spa<br />& Salon
                </h2>
                <p className="max-w-2xl mx-auto text-gray-500 mb-12 text-lg leading-relaxed">
                    Looking for a recommended spa near me or a top-rated salon near me in Nusa Dua? Book your appointment online to secure your preferred time.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    <button
                        onClick={() => handleOpenBooking('Signature Ritual')}
                        className="bg-gold text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#d6b77c] hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-md"
                    >
                        Book Now
                    </button>
                    <a
                        href="#treatments"
                        className="bg-transparent border border-[#3d3b38]/40 text-[#3d3b38] px-10 py-3.5 font-medium transition hover:bg-[#3d3b38] hover:text-white hover:scale-105 active:scale-95 duration-200 inline-block"
                    >
                        View Menu
                    </a>
                </div>
            </section>

            {/* Blog Section */}
            <section id="blog" className="py-24 px-4 bg-[#f6f6f4] scroll-mt-20">
                <h2 className="text-4xl md:text-[44px] font-serif text-[#3d3b38] mb-16 text-center font-medium">
                    Wellness Insights & Stories
                </h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="border border-[#3d3b38]/20 bg-[#fcfcfa] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <div className="overflow-hidden h-[220px]">
                            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Blog 1" />
                        </div>
                        <div className="p-8">
                            <span className="text-xs uppercase tracking-widest text-gold font-bold mb-2 block">Traditions</span>
                            <h3 className="text-[24px] font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-gold transition">The Secrets of Balinese Healing</h3>
                            <p className="text-[#3d3b38]/80 text-[14px] leading-relaxed">
                                Discover ancient herbs and time-honored pressure point techniques used for centuries in Bali to restore bodily equilibrium.
                            </p>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="border border-[#3d3b38]/20 bg-[#fcfcfa] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <div className="overflow-hidden h-[220px]">
                            <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Blog 2" />
                        </div>
                        <div className="p-8">
                            <span className="text-xs uppercase tracking-widest text-gold font-bold mb-2 block">Beauty & Nails</span>
                            <h3 className="text-[24px] font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-gold transition">Holistic Luxury Nail Care</h3>
                            <p className="text-[#3d3b38]/80 text-[14px] leading-relaxed">
                                Nourish your nails with organic botanicals and premium essential oils during your blissful holiday in Nusa Dua.
                            </p>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div className="border border-[#3d3b38]/20 bg-[#fcfcfa] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <div className="overflow-hidden h-[220px]">
                            <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Blog 3" />
                        </div>
                        <div className="p-8">
                            <span className="text-xs uppercase tracking-widest text-gold font-bold mb-2 block">Aromatherapy</span>
                            <h3 className="text-[24px] font-serif mb-3 text-[#3d3b38] font-bold group-hover:text-gold transition">Calming Scents for Island Living</h3>
                            <p className="text-[#3d3b38]/80 text-[14px] leading-relaxed">
                                How pure frangipani and lemongrass extracts awaken the senses and reduce fatigue after traveling across Bali.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / Contact */}
            <footer id="contact" className="bg-[#48301d] text-white/90 py-16 px-8 border-t border-black/20 scroll-mt-20">
                <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-[15px] leading-relaxed">
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2 text-3xl tracking-widest font-sans font-light text-white mb-6">
                            <span className="text-white text-4xl">❀</span> SADALI
                        </div>
                        <p className="text-white/70 text-sm max-w-xs leading-relaxed">
                            A serene sanctuary of wellness nestled in the heart of Bali Collection, Nusa Dua.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Navigation</h4>
                        <ul className="space-y-2 text-white/80">
                            <li><a href="#home" className="hover:text-gold border-b border-white/20 pb-[1px] transition">Home</a></li>
                            <li><a href="#about" className="hover:text-gold border-b border-white/20 pb-[1px] transition">About Us</a></li>
                            <li><a href="#treatments" className="hover:text-gold border-b border-white/20 pb-[1px] transition">Treatments</a></li>
                            <li><a href="#experience" className="hover:text-gold border-b border-white/20 pb-[1px] transition">Experience</a></li>
                            <li><a href="#blog" className="hover:text-gold border-b border-white/20 pb-[1px] transition">Blog</a></li>
                            <li><a href="#contact" className="hover:text-gold border-b border-white/20 pb-[1px] transition">Contact</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Treatments</h4>
                        <ul className="space-y-2 text-white/80">
                            <li><button onClick={() => handleOpenBooking('Body Massage')} className="hover:text-gold transition text-left cursor-pointer">Body Massage</button></li>
                            <li><button onClick={() => handleOpenBooking('Scrub & Mask')} className="hover:text-gold transition text-left cursor-pointer">Scrub & Mask</button></li>
                            <li><button onClick={() => handleOpenBooking('Short Treatment')} className="hover:text-gold transition text-left cursor-pointer">Short Treatment</button></li>
                            <li><button onClick={() => handleOpenBooking('Hair Treatment')} className="hover:text-gold transition text-left cursor-pointer">Hair Treatment</button></li>
                            <li><button onClick={() => handleOpenBooking('Manicure & Pedicure')} className="hover:text-gold transition text-left cursor-pointer">Manicure & Pedicure</button></li>
                            <li><button onClick={() => handleOpenBooking('Kids Menu')} className="hover:text-gold transition text-left cursor-pointer">Kids Menu</button></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white mb-6 text-[15px] font-semibold tracking-wide">Contact Us</h4>
                        <div className="text-white/80 space-y-2">
                            <p className="mb-2 leading-snug">Jl. Kw. Nusa Dua Resort, Benoa, Kec.<br />Kuta Sel., Kabupaten Badung, Bali 80361</p>
                            <p><a href="tel:+6287777371188" className="hover:text-gold transition">+62 877 7737 1188</a></p>
                            <p><a href="mailto:sadalispaa@gmail.com" className="hover:text-gold transition">sadalispaa@gmail.com</a></p>
                            <p className="text-gold font-medium">Buka : 9AM - 10PM</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Interactive Luxury Reservation Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#fcfcfa] text-[#3d3b38] w-full max-w-lg p-8 md:p-10 shadow-2xl border border-gray-200 relative animate-scale-up">
                        <button
                            onClick={() => setIsBookingOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-black text-2xl leading-none cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <span className="text-gold text-3xl">❀</span>
                            <h3 className="text-3xl font-serif text-[#3d3b38] mt-1">Reserve Your Session</h3>
                            <p className="text-sm text-gray-500 mt-1">Sadali Spa & Salon • Nusa Dua</p>
                        </div>

                        {bookingSuccess ? (
                            <div className="py-10 text-center space-y-3">
                                <div className="text-4xl text-green-600">✓</div>
                                <h4 className="text-2xl font-serif font-bold text-[#3d3b38]">Reservation Confirmed!</h4>
                                <p className="text-gray-600 text-sm">
                                    Thank you! Our concierge will contact you via WhatsApp shortly to confirm your booking for <strong>{selectedService}</strong>.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Select Treatment</label>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold"
                                    >
                                        <option value="Body Massage">Body Massage (60/90 mins)</option>
                                        <option value="Scrub & Mask">Balinese Scrub & Herbal Mask</option>
                                        <option value="Hair Treatment">Hair Spa & Cream Bath</option>
                                        <option value="Manicure & Pedicure">Luxury Manicure & Pedicure</option>
                                        <option value="Kids Menu">Kids Pampering Menu</option>
                                        <option value="Short Treatment">Express Relaxation Treatment</option>
                                        <option value="Signature Ritual">Sadali Signature Full Ritual</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Preferred Date</label>
                                        <input type="date" required className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Preferred Time</label>
                                        <input type="time" required defaultValue="10:00" className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Your Name</label>
                                    <input type="text" required placeholder="e.g. Sarah Jenkins" className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold" />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">WhatsApp / Phone Number</label>
                                    <input type="tel" required placeholder="+62 812 3456 7890" className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold" />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gold text-[#3d3b38] py-3.5 font-medium transition hover:bg-[#d6b77c] cursor-pointer mt-4 shadow-lg hover:scale-[1.02] duration-200"
                                >
                                    Confirm Reservation
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
