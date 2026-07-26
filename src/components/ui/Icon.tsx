type IconName =
  | "sweden"
  | "science"
  | "leaf"
  | "truck"
  | "beaker"
  | "shield"
  | "shieldLeaf"
  | "shieldCheck"
  | "lock"
  | "care"
  | "return"
  | "search"
  | "user"
  | "bag"
  | "filter"
  | "crown"
  | "chevron"
  | "chevronDown"
  | "star"
  | "plus"
  | "heart"
  | "formula"
  | "promise"
  | "verified"
  | "goalSkin"
  | "goalMuscle"
  | "goalJoints"
  | "goalHeart"
  | "goalSleep"
  | "goalPregnancy"
  | "goalKids";

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "sweden":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 12h10M12 7v10" />
        </svg>
      );
    case "science":
      return (
        <svg {...common}>
          <path d="M9 3v6l-4 8a3 3 0 0 0 2.7 4.5h8.6A3 3 0 0 0 19 17l-4-8V3" />
          <path d="M9 3h6" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" />
          <path d="M5 19c2-4 6-8 12-10" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7V10z" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
        </svg>
      );
    case "beaker":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v5.5L6.5 18a2.5 2.5 0 0 0 2.3 3.5h6.4a2.5 2.5 0 0 0 2.3-3.5L14 8.5V3" />
          <path d="M8 14h8" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "shieldLeaf":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
          <path d="M10 14c3-1 5-3.5 5.5-7-3.5.5-6 2.5-7 5.5Z" />
          <path d="M10 14c1-1.5 2.5-2.5 4-3" />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "care":
      return (
        <svg {...common}>
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 14v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Z" />
          <path d="M20 14v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
          <path d="M14 19h-2a2 2 0 0 0 0 4h.5" />
        </svg>
      );
    case "return":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 5v5h5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12H7L6 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle cx="8" cy="7" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="14" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="10" cy="17" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="m3 16 3-9 3 5 3-7 3 7 3-5 3 9H3Z" />
          <path d="M4 18h16" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "star":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 6v12M6 12h12" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M19.5 12.6 12 20l-7.5-7.4a4.5 4.5 0 0 1 6.4-6.3L12 7l1.1-.7a4.5 4.5 0 0 1 6.4 6.3Z" />
        </svg>
      );
    case "formula":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v5.5L6.5 18a2.5 2.5 0 0 0 2.3 3.5h6.4a2.5 2.5 0 0 0 2.3-3.5L14 8.5V3" />
        </svg>
      );
    case "promise":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
        </svg>
      );
    case "verified":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      );
    case "goalSkin":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M7 20c1.2-3 3-4.5 5-4.5S15.8 17 17 20" />
          <path d="M16.5 6.5 18 5M18.5 9.5h1.5M16.5 12.5 18 14" />
        </svg>
      );
    case "goalMuscle":
      return (
        <svg {...common}>
          <path d="M8 14c0-2 1.2-3.5 2.8-4.2.6-2 2-3.3 3.7-3.3 1.5 0 2.5 1 2.5 2.4 0 .7-.2 1.3-.6 1.8 1.4.6 2.3 1.8 2.3 3.3v1.5c0 1.2-.7 2.2-1.8 2.7L14 19.5H9.5L8 17.2V14Z" />
          <path d="M8 15.5c-1.5.3-2.8 1.4-3.2 2.8" />
        </svg>
      );
    case "goalJoints":
      return (
        <svg {...common}>
          <path d="M10 4v5.5c0 1.2-.5 2.3-1.4 3.1L6 15.2" />
          <path d="M14 4v5.5c0 1.2.5 2.3 1.4 3.1L18 15.2" />
          <circle cx="12" cy="11" r="2.2" />
          <path d="M9.5 18.5h5" />
        </svg>
      );
    case "goalHeart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      );
    case "goalSleep":
      return (
        <svg {...common}>
          <path d="M14.5 4.5A6.5 6.5 0 1 0 19 14.2 5.2 5.2 0 0 1 14.5 4.5Z" />
          <path d="m17 3.5.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1Z" />
        </svg>
      );
    case "goalPregnancy":
      return (
        <svg {...common}>
          <circle cx="12" cy="5.5" r="2" />
          <path d="M12 8v2.5" />
          <path d="M9 21v-4.5c0-1.5.7-2.8 1.8-3.5.4-.3.8-.4 1.2-.4s.8.1 1.2.4c1.1.7 1.8 2 1.8 3.5V21" />
          <path d="M9.2 13.2c-1.6.6-2.7 2.1-2.7 3.8V19" />
        </svg>
      );
    case "goalKids":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.2" />
          <path d="M7.5 19.5c.8-2.8 2.5-4.2 4.5-4.2s3.7 1.4 4.5 4.2" />
          <path d="M8.5 6.5 7 5M15.5 6.5 17 5" />
        </svg>
      );
    default:
      return null;
  }
}
