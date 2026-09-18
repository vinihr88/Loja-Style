"use client";

import Image from "next/image";
import { useState } from "react";
import { IconeFechar, IconeLupaMais, IconeSeta } from "@/components/ui/icones";

type Imagem = { url: string; alt: string };

export function Galeria({ imagens, nome }: { imagens: Imagem[]; nome: string }) {
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const [origem, setOrigem] = useState({ x: 50, y: 50 });

  if (imagens.length === 0) {
    return <div className="aspect-3/4 bg-ardosia-100" aria-label={`${nome} sem imagem`} />;
  }

  const imagem = imagens[Math.min(atual, imagens.length - 1)];

  function mover(evento: React.MouseEvent<HTMLDivElement>) {
    const area = evento.currentTarget.getBoundingClientRect();
    setOrigem({
      x: ((evento.clientX - area.left) / area.width) * 100,
      y: ((evento.clientY - area.top) / area.height) * 100,
    });
  }

  return (
    <div>
      <div className="relative">
        <div
          className="group relative aspect-3/4 cursor-zoom-in overflow-hidden bg-ardosia-100"
          onClick={() => setAmpliada(true)}
          onMouseMove={mover}
          role="button"
          tabIndex={0}
          aria-label="Ampliar imagem"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setAmpliada(true);
            }
          }}
        >
          <Image
            src={imagem.url}
            alt={imagem.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-125"
            style={{ transformOrigin: `${origem.x}% ${origem.y}%` }}
          />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-areia-50/90 text-ardosia-700">
            <IconeLupaMais className="h-4.5 w-4.5" />
          </span>
        </div>

        {imagens.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setAtual((i) => (i - 1 + imagens.length) % imagens.length)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-areia-50/90 text-ardosia-800 hover:bg-areia-50"
              aria-label="Imagem anterior"
            >
              <IconeSeta className="h-4.5 w-4.5" direcao="esquerda" />
            </button>
            <button
              type="button"
              onClick={() => setAtual((i) => (i + 1) % imagens.length)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-areia-50/90 text-ardosia-800 hover:bg-areia-50"
              aria-label="Próxima imagem"
            >
              <IconeSeta className="h-4.5 w-4.5" />
            </button>
          </>
        )}
      </div>

      {imagens.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {imagens.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setAtual(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === atual}
              className={`relative aspect-3/4 w-20 overflow-hidden border-2 transition-colors ${
                i === atual ? "border-ardosia-900" : "border-transparent hover:border-ardosia-300"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {ampliada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ardosia-900/95 p-4">
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            className="absolute right-5 top-5 text-areia-50"
            aria-label="Fechar imagem ampliada"
          >
            <IconeFechar className="h-7 w-7" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl">
            <Image src={imagem.url} alt={imagem.alt} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
