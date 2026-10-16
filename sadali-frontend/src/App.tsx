import { useState, useEffect, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TreatmentsPage from './pages/TreatmentsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

type PageType = 'home' | 'about' | 'treatments' | 'blog' | 'contact';

export default function App() {
    const [currentPage, setCurrentPage] = useState<PageType>('home');
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('Body Massage');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Synchronize page state with URL hash
    useEffect(() => {
        const updateFromHash = () => {
            const hash = window.location.hash.toLowerCase();
            if (hash === '#about') {
                setCurrentPage('about');
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else if (hash === '#treatments') {
                setCurrentPage('treatments');
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else if (hash === '#blog') {
                setCurrentPage('blog');
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else if (hash === '#contact') {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                setCurrentPage('home');
                if (hash && hash !== '#home') {
                    const el = document.querySelector(hash);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        updateFromHash();
        window.addEventListener('hashchange', updateFromHash);
        return () => window.removeEventListener('hashchange', updateFromHash);
    }, []);

    const handleNavigate = (page: PageType, sectionId?: string) => {
        setCurrentPage(page);
        if (sectionId) {
            window.location.hash = `#${sectionId}`;
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.location.hash = `#${page}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleOpenBooking = (service = 'Body Massage') => {
        setSelectedService(service);
        setBookingSuccess(false);
        setIsBookingOpen(true);
    };

    const handleBookingSubmit = (e: FormEvent) => {
        e.preventDefault();
        setBookingSuccess(true);
        setTimeout(() => {
            setIsBookingOpen(false);
            setBookingSuccess(false);
        }, 2500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f6f4] text-[#3d3b38]">
            {/* Navigation Bar */}
            <Navbar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenBooking}
            />

            {/* Page Content with smooth fade transition */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {currentPage === 'home' && (
                        <motion.div
                            key="page-home"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <HomePage
                                onNavigate={handleNavigate}
                                onOpenBooking={handleOpenBooking}
                            />
                        </motion.div>
                    )}
                    {currentPage === 'about' && (
                        <motion.div
                            key="page-about"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AboutPage
                                onNavigate={handleNavigate}
                                onOpenBooking={handleOpenBooking}
                            />
                        </motion.div>
                    )}
                    {currentPage === 'treatments' && (
                        <motion.div
                            key="page-treatments"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TreatmentsPage
                                onNavigate={handleNavigate}
                                onOpenBooking={handleOpenBooking}
                            />
                        </motion.div>
                    )}
                    {currentPage === 'blog' && (
                        <motion.div
                            key="page-blog"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BlogPage onNavigate={handleNavigate} onOpenBooking={handleOpenBooking} />
                        </motion.div>
                    )}
                    {currentPage === 'contact' && (
                        <motion.div
                            key="page-contact"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ContactPage
                                onNavigate={handleNavigate}
                                onOpenBooking={handleOpenBooking}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Footer */}
            <Footer
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onOpenBooking={handleOpenBooking}
            />

            {/* Reservation Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                selectedService={selectedService}
                onServiceChange={setSelectedService}
                bookingSuccess={bookingSuccess}
                onSubmit={handleBookingSubmit}
            />
        </div>
    );
}
