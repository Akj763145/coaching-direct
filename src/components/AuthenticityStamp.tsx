import React, { useMemo } from 'react';

interface AuthenticityStampProps {
  paymentId: string;
  date: string;
  className?: string;
}

export function AuthenticityStamp({ paymentId, date, className = '' }: AuthenticityStampProps) {
  // A unique ID for the path to prevent conflicts if multiple stamps are rendered
  const pathId = `stamp-path-${paymentId}`;
  const shortId = paymentId.length > 12 ? `${paymentId.substring(0, 10)}..` : paymentId;

  const svgContent = useMemo(() => {
    return `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" stroke="#4338ca" stroke-width="2" opacity="0.9" />
      <circle cx="60" cy="60" r="54" stroke="#4338ca" stroke-width="0.5" opacity="0.5" />
      <circle cx="60" cy="60" r="38" stroke="#4338ca" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" />
      <path id="${pathId}" d="M 60, 60 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" fill="transparent" />
      <text fill="#4338ca" font-size="10px" font-weight="900" letter-spacing="0.1em" font-family="sans-serif">
        <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">★ VIDYA NATION ★ VERIFIED STUDENT</textPath>
      </text>
      <text x="60" y="55" text-anchor="middle" fill="#4338ca" font-size="10px" font-family="monospace" font-weight="900" letter-spacing="0.05em">${shortId}</text>
      <text x="60" y="68" text-anchor="middle" fill="#4338ca" font-size="8px" font-weight="bold" letter-spacing="0.1em" font-family="sans-serif" opacity="0.8">${date}</text>
      <circle cx="45" cy="65" r="1" fill="#4338ca" opacity="0.6" />
      <circle cx="75" cy="65" r="1" fill="#4338ca" opacity="0.6" />
    </svg>`;
  }, [date, shortId, pathId]);

  const b64 = btoa(unescape(encodeURIComponent(svgContent)));
  const dataUrl = `data:image/svg+xml;base64,${b64}`;

  return (
    <div className={`relative ${className}`}>
      <img src={dataUrl} alt="Authenticity Stamp" className="w-full h-full transform -rotate-12 opacity-80" />
    </div>
  );
}
