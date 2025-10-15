import React from "react";
import { useTranslation } from "react-i18next";

function AvailableReport() {
  const { t } = useTranslation();

  return (
    <div className="grid-blocks">
      <div className="g-block">
        <div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4.16634H4.5C3.39543 4.16634 2.5 5.06177 2.5 6.16634V11.6663M17.5 2.49967L13.3333 7.49967M12.5 2.49967L12.5 3.33301M18.3333 6.66634L18.3333 7.49967M2.5 11.6663V13.833C2.5 14.9376 3.39543 15.833 4.5 15.833H15.5C16.6046 15.833 17.5 14.9376 17.5 13.833V11.6663H2.5Z" stroke="#2D85EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>{t("home.available")}</p>
          <div className="tooltip">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="quest-i">
              <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="black" strokeOpacity="0.15" />
              <path d="M16 20.1667H16.0083M16 17.6667C16.7422 16.0781 18.5 16.1953 18.5 14.3333C18.5 13.0833 17.6667 11.8333 16 11.8333C14.7101 11.8333 13.9194 12.582 13.6278 13.5M16 23.5C20.1421 23.5 23.5 20.1421 23.5 16C23.5 11.8579 20.1421 8.5 16 8.5C11.8579 8.5 8.5 11.8579 8.5 16C8.5 20.1421 11.8579 23.5 16 23.5Z" stroke="black" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("home.tooltip")}</span>
          </div>
        </div>
        <p className="g-block-num">8.672,20 ТМТ</p>
      </div>

      <div className="g-block">
        <div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8333 6.66634V5.33301C15.8333 4.22844 14.9379 3.33301 13.8333 3.33301H5.5C3.84315 3.33301 2.5 4.67615 2.5 6.33301V13.6663C2.5 15.3232 3.84315 16.6663 5.5 16.6663H15.5C16.6046 16.6663 17.5 15.7709 17.5 14.6663V8.33301C17.5 7.41253 16.7538 6.66634 15.8333 6.66634ZM15.8333 6.66634H5.83333M14.1667 11.6663H13.3333" stroke="#2D85EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>{t("reports.nextPayout")}</p>
        </div>
        <p className="g-block-num">03.11.2025</p>
      </div>
    </div>
  );
}

export default AvailableReport;