// ClinicCopilot Configuration
// Replace with your actual Mistral API key for production
// This file is loaded as a regular script (not ES module) for static hosting compatibility

window.CLINIC_CONFIG = {
    MISTRAL_API_KEY: 'YOUR_MISTRAL_API_KEY_HERE',
    MISTRAL_API_URL: 'https://api.mistral.ai/v1/chat/completions',
    CLINIC_INFO: {
        name: 'Ikeja Medical Center',
        openingHours: 'Monday to Saturday from 8AM to 6PM',
        address: 'Ikeja, Lagos',
        phone: '+234-123-456-7890',
        services: [
            'General Consultation',
            'Pediatrics',
            'Dermatology',
            'Cardiology',
            'Dental Care',
            'Laboratory Tests',
            'Vaccinations',
            'Minor Surgery'
        ],
        appointmentProcess: 'Book appointments by calling our phone number, visiting our website, or clicking the Book Appointment button below.',
        emergencyNote: 'For emergencies or personal medical concerns, please contact a healthcare professional immediately.'
    }
};

window.SYSTEM_PROMPT = `You are a friendly AI receptionist for ${window.CLINIC_CONFIG.CLINIC_INFO.name}. 
Answer only clinic-related questions about appointments, services, opening hours, location, and similar inquiries.
Be polite, concise, and helpful. If you don't know an answer, recommend contacting the clinic directly.
Important: Never invent medical advice. Tell users to contact a healthcare professional for emergencies or personal medical concerns.
Keep responses short and conversational.

Clinic Information:
- Opening Hours: ${window.CLINIC_CONFIG.CLINIC_INFO.openingHours}
- Address: ${window.CLINIC_CONFIG.CLINIC_INFO.address}
- Phone: ${window.CLINIC_CONFIG.CLINIC_INFO.phone}
- Services: ${window.CLINIC_CONFIG.CLINIC_INFO.services.join(', ')}
- Booking: ${window.CLINIC_CONFIG.CLINIC_INFO.appointmentProcess}`;