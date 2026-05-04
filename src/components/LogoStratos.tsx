import { useState, useEffect } from 'react';

interface LogoStratosProps {
  height?: number;
  soloIcone?: boolean; // Se true, diminui o tamanho para caber no menu
  className?: string;
}

export default function LogoStratos({ height = 40, soloIcone = false, className = '' }: LogoStratosProps) {
  
  // Se for 'soloIcone' (menu superior), reduz o tamanho para não estourar o layout
  // Se sua logo tem texto, isso pode deixar o texto pequeno. 
  // O ideal para o menu é usar uma imagem só com o símbolo (globo).
  const finalHeight = soloIcone ? Math.max(height * 0.6, 24) : height;

  return (
    <img
      src="/logo-stratos.png" // <--- O nome deve ser igual ao do arquivo que você subiu
      alt="Logo Stratos"
      height={finalHeight}
      className={`object-contain ${className}`}
      style={{ maxHeight: finalHeight, display: 'block' }}
    />
  );
}
