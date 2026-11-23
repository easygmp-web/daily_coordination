import React from 'react';
import { OutfitStyleId } from '../data/onboardingOptions';

interface IllustrationProps {
  selected?: boolean;
}

export function BrandSkyMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="36" height="36" rx="10" fill="#E0F2FE" />
      <circle cx="24.5" cy="11.5" r="4.5" fill="#FBBF24" />
      <path
        d="M11.5 24.5H23.5C25.433 24.5 27 22.933 27 21C27 19.205 25.649 17.726 23.908 17.523C23.36 14.94 21.067 13 18.32 13C15.161 13 12.6 15.561 12.6 18.72C12.6 18.88 12.607 19.038 12.62 19.194C10.584 19.51 9 21.27 9 23.4C9 24.008 9.492 24.5 10.1 24.5H11.5Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CasualIllustration({ selected = false }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Soft sky circle backdrop */}
      <circle
        cx="40"
        cy="40"
        r="34"
        fill={selected ? '#BAE6FD' : '#E0F2FE'}
      />
      {/* Cozy knit cardigan / sweatshirt */}
      <path
        d="M25 26L33 21C35.5 23.5 44.5 23.5 47 21L55 26L61 39L53 42L50 33V54H30V33L27 42L19 39L25 26Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Neckline */}
      <path
        d="M33.5 21.5C35.5 25 44.5 25 46.5 21.5"
        stroke="#0284C7"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Soft sky pocket & hem stripe */}
      <rect
        x="34"
        y="36"
        width="12"
        height="9"
        rx="2.5"
        fill="#BAE6FD"
        stroke="#0284C7"
        strokeWidth="1.8"
      />
      <path
        d="M30 50H50"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Comfy relaxed pants peeking below */}
      <path
        d="M32 54V64H38.5V57.5H41.5V64H48V54"
        fill="#7DD3FC"
        stroke="#0284C7"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NeatIllustration({ selected = false }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      <circle
        cx="40"
        cy="40"
        r="34"
        fill={selected ? '#BAE6FD' : '#E0F2FE'}
      />
      {/* Crisp collared shirt */}
      <path
        d="M27 25L35 20H45L53 25L58 40L51 42L48 33V56H32V33L29 42L22 40L27 25Z"
        fill="#FFFFFF"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Neat collar points */}
      <path
        d="M35 20L40 28L45 20"
        fill="#E0F2FE"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* V-neck vest overlay */}
      <path
        d="M32 24L40 35L48 24V56H32V24Z"
        fill="#7DD3FC"
        fillOpacity="0.45"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Tidy buttons */}
      <circle cx="40" cy="40" r="1.6" fill="#0369A1" />
      <circle cx="40" cy="46.5" r="1.6" fill="#0369A1" />
      <circle cx="40" cy="53" r="1.6" fill="#0369A1" />
      {/* Small clean handbag */}
      <rect
        x="50"
        y="48"
        width="13"
        height="11"
        rx="2.5"
        fill="#FFFFFF"
        stroke="#0369A1"
        strokeWidth="2"
      />
      <path
        d="M53.5 48V45.5C53.5 44.1 54.6 43 56 43H57C58.4 43 59.5 44.1 59.5 45.5V48"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ActiveIllustration({ selected = false }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      <circle
        cx="40"
        cy="40"
        r="34"
        fill={selected ? '#BAE6FD' : '#E0F2FE'}
      />
      {/* Sporty cap */}
      <path
        d="M30 22C30 17.5 34.5 14 40 14C45.5 14 50 17.5 50 22H30Z"
        fill="#38BDF8"
        stroke="#0284C7"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M28 22H54"
        stroke="#0284C7"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Lightweight zip-up windbreaker */}
      <path
        d="M25 30L34 26H46L55 30L61 43L54 46L50 37V55H30V37L26 46L19 43L25 30Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Center zipper & sporty stripe */}
      <path
        d="M40 26V55"
        stroke="#0284C7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 39H50"
        stroke="#38BDF8"
        strokeWidth="3"
      />
      {/* Cushioned walking sneaker */}
      <path
        d="M25 60H49C51.5 60 53 61.8 53 63.5C53 65 51.8 66 50 66H25C23.5 66 22.5 65 22.5 63.5V61.5C22.5 60.5 23.5 60 25 60Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <path
        d="M30 60L34 55.5H41L44.5 60"
        fill="#7DD3FC"
        stroke="#0284C7"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClassicIllustration({ selected = false }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      <circle
        cx="40"
        cy="40"
        r="34"
        fill={selected ? '#BAE6FD' : '#E0F2FE'}
      />
      {/* Tailored classic coat / blazer */}
      <path
        d="M25 25L34 20H46L55 25L60 44L53 46L50 35V61H30V35L27 46L20 44L25 25Z"
        fill="#FFFFFF"
        stroke="#075985"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Structured lapels */}
      <path
        d="M34 20L37 36L40 38L43 36L46 20"
        fill="#E0F2FE"
        stroke="#075985"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner scarf / ascot accent */}
      <path
        d="M36.5 21.5L40 31L43.5 21.5"
        fill="#38BDF8"
        stroke="#075985"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Coat closure line & pockets */}
      <path
        d="M40 38V61"
        stroke="#075985"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="36.5" cy="45" r="1.7" fill="#075985" />
      <circle cx="36.5" cy="52" r="1.7" fill="#075985" />
      <path
        d="M44 47H50"
        stroke="#075985"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 47H34"
        stroke="#075985"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StyleIllustration({
  styleId,
  selected = false,
}: {
  styleId: OutfitStyleId;
  selected?: boolean;
}) {
  switch (styleId) {
    case 'casual':
      return <CasualIllustration selected={selected} />;
    case 'neat':
      return <NeatIllustration selected={selected} />;
    case 'active':
      return <ActiveIllustration selected={selected} />;
    case 'classic':
      return <ClassicIllustration selected={selected} />;
  }
}
