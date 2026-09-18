type Props = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconeBusca({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconeSacola({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M5 7h14l-1 13H6L5 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}

export function IconeUsuario({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.3-3.6 4-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconeCoracao({ className, preenchido }: Props & { preenchido?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...base}
      fill={preenchido ? "currentColor" : "none"}
    >
      <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function IconeMenu({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconeFechar({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconeSeta({ className, direcao = "direita" }: Props & { direcao?: "esquerda" | "direita" | "cima" | "baixo" }) {
  const rotacao = { direita: 0, baixo: 90, esquerda: 180, cima: 270 }[direcao];
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base} style={{ transform: `rotate(${rotacao}deg)` }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconeEstrela({ className, preenchida }: Props & { preenchida?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill={preenchida ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
      <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" />
    </svg>
  );
}

export function IconeWhatsapp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.8-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.2.3.7 2.6-2.7-.7-.3.2A8.2 8.2 0 1 1 12 3.8Zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s1 2.4 1.1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.2-.5s0-.4-.1-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.6Z" />
    </svg>
  );
}

export function IconeCaminhao({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  );
}

export function IconeEscudo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 8.9 4.1-1.5 7-4.7 7-8.9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export function IconeTroca({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M4 9h12l-3-3M20 15H8l3 3" />
    </svg>
  );
}

export function IconeInstagram({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconeLupaMais({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6M20 20l-3.5-3.5" />
    </svg>
  );
}
