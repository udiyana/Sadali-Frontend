import type { FormEvent } from 'react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedService: string;
    onServiceChange: (service: string) => void;
    bookingSuccess: boolean;
    onSubmit: (e: FormEvent) => void;
}

export default function BookingModal({
    isOpen,
    onClose,
    selectedService,
    onServiceChange,
    bookingSuccess,
    onSubmit
}: BookingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fcfcfa] text-[#3d3b38] w-full max-w-lg p-8 md:p-10 shadow-2xl border border-gray-200 relative animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-black text-2xl leading-none cursor-pointer"
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="text-center mb-6 flex flex-col items-center">
                    <img src="/images/Logo-Sadali.png" alt="SADALI" className="h-10 md:h-12 object-contain mb-2" />
                    <h3 className="text-3xl font-serif text-[#3d3b38] mt-1">Reserve Your Session</h3>
                    <p className="text-sm text-gray-500 mt-1">Sadali Spa &amp; Salon • Nusa Dua</p>
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
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Select Treatment</label>
                            <select
                                value={selectedService}
                                onChange={(e) => onServiceChange(e.target.value)}
                                className="w-full border border-gray-300 p-2.5 bg-white text-sm focus:outline-none focus:border-gold"
                            >
                                <option value="Body Massage">Body Massage (60/90 mins)</option>
                                <option value="Scrub & Mask">Balinese Scrub &amp; Herbal Mask</option>
                                <option value="Hair Treatment">Hair Spa &amp; Cream Bath</option>
                                <option value="Manicure & Pedicure">Luxury Manicure &amp; Pedicure</option>
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
    );
}
