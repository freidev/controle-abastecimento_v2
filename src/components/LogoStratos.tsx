// Logo Stratos — SVG vetorial baseado na imagem original
interface LogoStratosProps {
  height?: number;
  className?: string;
  soloIcone?: boolean; // só o globo, sem o texto
}

export default function LogoStratos({ height = 40, className = '', soloIcone = false }: LogoStratosProps) {

  if (soloIcone) {
    // Só o globo para espaços pequenos
    return (
      <svg
        viewBox="0 0 200 200"
        height={height}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="circle-clip-icon">
            <circle cx="100" cy="100" r="97" />
          </clipPath>
        </defs>
        {/* Fundo do globo */}
        <circle cx="100" cy="100" r="97" fill="#7A1F2E" />
        {/* Segmento topo — curva superior */}
        <path
          d="M 30 55 Q 100 15 170 55 Q 160 72 100 68 Q 40 72 30 55 Z"
          fill="white" opacity="1"
          clipPath="url(#circle-clip-icon)"
        />
        {/* Faixa branca 1 */}
        <path
          d="M 10 80 Q 100 60 190 80 L 190 92 Q 100 72 10 92 Z"
          fill="white"
          clipPath="url(#circle-clip-icon)"
        />
        {/* Faixa branca 2 */}
        <path
          d="M 5 108 Q 100 88 195 108 L 195 120 Q 100 100 5 120 Z"
          fill="white"
          clipPath="url(#circle-clip-icon)"
        />
        {/* Faixa branca 3 */}
        <path
          d="M 10 135 Q 100 115 190 135 L 190 147 Q 100 127 10 147 Z"
          fill="white"
          clipPath="url(#circle-clip-icon)"
        />
        {/* Segmento base */}
        <path
          d="M 28 155 Q 100 140 172 155 Q 150 185 100 197 Q 50 185 28 155 Z"
          fill="white" opacity="1"
          clipPath="url(#circle-clip-icon)"
        />
        {/* Reaplica a cor para as áreas bordô entre as faixas */}
        <path
          d="M 10 92 Q 100 72 190 92 L 190 108 Q 100 88 10 108 Z"
          fill="#7A1F2E"
          clipPath="url(#circle-clip-icon)"
        />
        <path
          d="M 5 120 Q 100 100 195 120 L 195 135 Q 100 115 5 135 Z"
          fill="#7A1F2E"
          clipPath="url(#circle-clip-icon)"
        />
        <path
          d="M 10 147 Q 100 127 190 147 L 190 155 Q 100 140 10 155 Z"
          fill="#7A1F2E"
          clipPath="url(#circle-clip-icon)"
        />
      </svg>
    );
  }

  // Logo completa: globo + texto "Stratos"
  const ratio = 500 / 160; // proporção original
  const w = height * ratio;

  return (
    <svg
      viewBox="0 0 500 160"
      height={height}
      width={w}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="circle-clip-full">
          <circle cx="80" cy="80" r="78" />
        </clipPath>
      </defs>

      {/* ── GLOBO ── */}
      <circle cx="80" cy="80" r="78" fill="#7A1F2E" />

      {/* Segmento superior arredondado */}
      <path
        d="M 18 42 Q 80 8 142 42 Q 130 60 80 56 Q 30 60 18 42 Z"
        fill="white"
        clipPath="url(#circle-clip-full)"
      />

      {/* Faixa branca superior */}
      <path d="M 4 66 Q 80 48 156 66 L 156 78 Q 80 60 4 78 Z"
        fill="white" clipPath="url(#circle-clip-full)" />

      {/* Área bordô entre faixas */}
      <path d="M 4 78 Q 80 60 156 78 L 156 90 Q 80 72 4 90 Z"
        fill="#7A1F2E" clipPath="url(#circle-clip-full)" />

      {/* Faixa branca meio */}
      <path d="M 2 90 Q 80 72 158 90 L 158 102 Q 80 84 2 102 Z"
        fill="white" clipPath="url(#circle-clip-full)" />

      {/* Área bordô */}
      <path d="M 2 102 Q 80 84 158 102 L 158 114 Q 80 96 2 114 Z"
        fill="#7A1F2E" clipPath="url(#circle-clip-full)" />

      {/* Faixa branca inferior */}
      <path d="M 4 114 Q 80 96 156 114 L 156 126 Q 80 108 4 126 Z"
        fill="white" clipPath="url(#circle-clip-full)" />

      {/* Área bordô */}
      <path d="M 4 126 Q 80 108 156 126 L 156 132 Q 80 118 4 132 Z"
        fill="#7A1F2E" clipPath="url(#circle-clip-full)" />

      {/* Segmento base */}
      <path
        d="M 14 134 Q 80 118 146 134 Q 125 155 80 160 Q 35 155 14 134 Z"
        fill="white"
        clipPath="url(#circle-clip-full)"
      />

      {/* ── TEXTO "Stratos" ── */}
      {/* S */}
      <text
        x="178"
        y="118"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="92"
        fill="#1B2447"
        letterSpacing="-2"
      >
        Stratos
      </text>
    </svg>
  );
}
