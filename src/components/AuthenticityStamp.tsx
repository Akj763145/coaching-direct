import React from 'react';

interface AuthenticityStampProps {
  paymentId: string;
  date: string;
  className?: string;
}

export function AuthenticityStamp({ paymentId, date, className = '' }: AuthenticityStampProps) {
  // A unique ID for the path to prevent conflicts if multiple stamps are rendered
  const pathId = `stamp-path-${paymentId}`;

  return (
    <div className={`relative ${className}`}>
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform -rotate-12 opacity-80 mix-blend-multiply drop-shadow-sm"
      >
        {/* Outer Ring */}
        <circle cx="60" cy="60" r="56" stroke="#4338ca" strokeWidth="2" opacity="0.9" />
        <circle cx="60" cy="60" r="54" stroke="#4338ca" strokeWidth="0.5" opacity="0.5" />
        
        {/* Inner Ring */}
        <circle cx="60" cy="60" r="38" stroke="#4338ca" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        
        {/* Text Path (Radius ~ 47) */}
        <path 
          id={pathId} 
          d="M 60, 60 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" 
          fill="transparent" 
        />
        <text fill="#4338ca" className="text-[10px] font-black tracking-widest uppercase">
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            ★ VIDYA NATION ★ VERIFIED STUDENT
          </textPath>
        </text>

        {/* Dynamic Center Data */}
        <text x="60" y="55" textAnchor="middle" fill="#4338ca" className="text-[10px] font-mono font-black" letterSpacing="0.05em">
          {paymentId.length > 12 ? `${paymentId.substring(0, 10)}..` : paymentId}
        </text>
        <text x="60" y="68" textAnchor="middle" fill="#4338ca" className="text-[8px] font-bold tracking-widest uppercase opacity-80">
          {date}
        </text>
        
        {/* Center decorative dots */}
        <circle cx="45" cy="65" r="1" fill="#4338ca" opacity="0.6" />
        <circle cx="75" cy="65" r="1" fill="#4338ca" opacity="0.6" />
      </svg>
    </div>
  );
}
