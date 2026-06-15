import React from 'react';
import '../../styles/whatsapp.css';

const WhatsAppButton = () => {
  const phoneNumber = "393475092264";
  const message = "Ciao Kyō-To Sushi, vorrei richiedere una prenotazione per un tavolo...";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Contattaci su WhatsApp per una prenotazione"
    >
      <div className="whatsapp-icon-bg">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          className="whatsapp-svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.502 5.355 1.503 5.489 0 9.954-4.431 9.957-9.874.002-2.637-1.025-5.115-2.893-6.987C17.202 1.92 14.736 1.89 12.006 1.89c-5.49 0-9.957 4.43-9.96 9.873-.001 2.074.546 4.1 1.584 5.849l-1.04 3.799 3.966-1.017zM17.43 14.42c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </div>
      <span className="whatsapp-tooltip">Prenota con WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
