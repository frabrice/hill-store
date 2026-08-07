import type { ColorKey } from '@/lib/services/types';

/**
 * Product illustrations.
 *
 * Bespoke flat-vector art rather than stock photography, for three reasons:
 * it cannot look wrong (a mismatched stock photo on "Preemie Bodysuit" reads
 * as a mistake), it carries the brand palette so a populated grid still looks
 * composed, and it has no external dependency or licence attached.
 *
 * These are placeholders for the client's real photography. When a Cloudinary
 * public ID lands on a product, <ProductImage> uses the photo instead and none
 * of this renders.
 */

interface Palette {
  deep: string;
  mid: string;
  pale: string;
}

const PALETTES: Record<ColorKey, Palette> = {
  pink: { deep: 'hsl(336 70% 58%)', mid: 'hsl(339 79% 74%)', pale: 'hsl(339 80% 90%)' },
  mint: { deep: 'hsl(168 55% 40%)', mid: 'hsl(165 53% 60%)', pale: 'hsl(165 55% 85%)' },
  sky: { deep: 'hsl(208 65% 50%)', mid: 'hsl(204 76% 68%)', pale: 'hsl(204 80% 88%)' },
  sunny: { deep: 'hsl(38 85% 48%)', mid: 'hsl(45 95% 63%)', pale: 'hsl(45 100% 86%)' },
  lavender: { deep: 'hsl(262 45% 58%)', mid: 'hsl(262 44% 76%)', pale: 'hsl(262 50% 90%)' },
  coral: { deep: 'hsl(10 70% 48%)', mid: 'hsl(14 82% 66%)', pale: 'hsl(14 85% 88%)' },
  teal: { deep: 'hsl(186 70% 30%)', mid: 'hsl(184 60% 46%)', pale: 'hsl(184 55% 85%)' },
  indigo: { deep: 'hsl(231 60% 50%)', mid: 'hsl(230 70% 70%)', pale: 'hsl(230 75% 90%)' },
  orchid: { deep: 'hsl(300 55% 45%)', mid: 'hsl(300 60% 68%)', pale: 'hsl(300 60% 90%)' },
  moss: { deep: 'hsl(95 55% 28%)', mid: 'hsl(95 45% 44%)', pale: 'hsl(95 45% 85%)' },
};

type Art = (p: Palette) => React.ReactNode;

const W = 'rgba(255,255,255,0.85)';

const ARTS: Record<string, Art> = {
  /* ------------------------------------------------------------ feeding */
  bottle: (p) => (
    <>
      <rect x="88" y="32" width="24" height="18" rx="11" fill={p.deep} />
      <rect x="80" y="48" width="40" height="14" rx="7" fill={p.mid} />
      <rect x="74" y="62" width="52" height="140" rx="24" fill={p.pale} />
      <rect x="74" y="132" width="52" height="70" rx="24" fill={p.mid} />
      <rect x="86" y="80" width="16" height="4" rx="2" fill={W} />
      <rect x="86" y="96" width="24" height="4" rx="2" fill={W} />
      <rect x="86" y="112" width="16" height="4" rx="2" fill={W} />
    </>
  ),
  pump: (p) => (
    <>
      <rect x="52" y="96" width="96" height="76" rx="20" fill={p.pale} />
      <rect x="66" y="112" width="68" height="34" rx="10" fill={p.deep} />
      <rect x="76" y="122" width="18" height="5" rx="2.5" fill={W} />
      <rect x="76" y="132" width="32" height="5" rx="2.5" fill={W} />
      <circle cx="100" cy="160" r="7" fill={p.mid} />
      <path d="M100 96V74" stroke={p.mid} strokeWidth="7" strokeLinecap="round" />
      <path d="M78 74h44l-10 -22H88z" fill={p.mid} />
      <circle cx="100" cy="44" r="14" fill={p.deep} />
    </>
  ),
  steriliser: (p) => (
    <>
      <rect x="46" y="88" width="108" height="96" rx="22" fill={p.pale} />
      <rect x="40" y="72" width="120" height="22" rx="11" fill={p.deep} />
      <rect x="66" y="112" width="16" height="52" rx="8" fill={p.mid} />
      <rect x="92" y="112" width="16" height="52" rx="8" fill={p.mid} />
      <rect x="118" y="112" width="16" height="52" rx="8" fill={p.mid} />
      <circle cx="100" cy="62" r="6" fill={p.mid} />
      <circle cx="76" cy="58" r="4" fill={p.mid} opacity="0.7" />
      <circle cx="124" cy="56" r="5" fill={p.mid} opacity="0.7" />
    </>
  ),
  pillow: (p) => (
    <>
      <path
        d="M100 68c40 0 66 26 66 62s-26 54-66 54-66-18-66-54 26-62 66-62z"
        fill={p.pale}
      />
      <path
        d="M100 92c26 0 42 16 42 38s-16 34-42 34-42-12-42-34 16-38 42-38z"
        fill={p.mid}
      />
      <circle cx="100" cy="130" r="20" fill={p.pale} />
      <circle cx="93" cy="126" r="3" fill={p.deep} />
      <circle cx="107" cy="126" r="3" fill={p.deep} />
      <path d="M94 138q6 6 12 0" stroke={p.deep} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  warmer: (p) => (
    <>
      <rect x="54" y="86" width="92" height="98" rx="20" fill={p.pale} />
      <rect x="74" y="60" width="52" height="44" rx="18" fill={p.mid} />
      <rect x="70" y="146" width="60" height="20" rx="10" fill={p.deep} />
      <circle cx="86" cy="156" r="4" fill={W} />
      <circle cx="100" cy="156" r="4" fill={W} />
      <circle cx="114" cy="156" r="4" fill={W} />
      <path d="M92 48q8-10 16 0" stroke={p.deep} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  bib: (p) => (
    <>
      <path
        d="M70 66h60a8 8 0 0 1 8 8c0 40-10 74-38 74s-38-34-38-74a8 8 0 0 1 8-8z"
        fill={p.pale}
      />
      <path d="M84 66h32a16 16 0 0 1-32 0z" fill={p.deep} />
      <rect x="76" y="148" width="48" height="34" rx="17" fill={p.mid} />
      <circle cx="100" cy="112" r="16" fill={p.mid} opacity="0.6" />
    </>
  ),
  bowl: (p) => (
    <>
      <path d="M50 112h100c0 34-22 58-50 58s-50-24-50-58z" fill={p.pale} />
      <rect x="44" y="100" width="112" height="16" rx="8" fill={p.deep} />
      <path d="M66 124h68c-2 20-16 32-34 32s-32-12-34-32z" fill={p.mid} />
      <rect x="118" y="52" width="10" height="46" rx="5" fill={p.mid} transform="rotate(18 123 75)" />
      <ellipse cx="136" cy="50" rx="16" ry="10" fill={p.deep} transform="rotate(18 136 50)" />
    </>
  ),
  pacifier: (p) => (
    <>
      <circle cx="100" cy="130" r="42" fill={p.pale} />
      <circle cx="100" cy="130" r="22" fill={p.mid} />
      <circle cx="100" cy="130" r="10" fill={p.deep} />
      <path d="M100 88c0-18 14-26 14-26" stroke={p.mid} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="118" cy="58" r="12" fill={p.deep} />
      <ellipse cx="100" cy="180" rx="20" ry="14" fill={p.mid} />
    </>
  ),

  /* -------------------------------------------------------------- sleep */
  wrap: (p) => (
    <>
      <path d="M56 70q44 30 88 0v34q-44 30-88 0z" fill={p.mid} />
      <path d="M56 116q44 30 88 0v34q-44 30-88 0z" fill={p.pale} />
      <circle cx="100" cy="104" r="22" fill={p.pale} />
      <circle cx="93" cy="100" r="3" fill={p.deep} />
      <circle cx="107" cy="100" r="3" fill={p.deep} />
      <path d="M94 112q6 6 12 0" stroke={p.deep} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M62 160q38 24 76 0v16q-38 24-76 0z" fill={p.deep} opacity="0.55" />
    </>
  ),
  swaddle: (p) => (
    <>
      <path d="M60 78h80a10 10 0 0 1 10 10v70a44 44 0 0 1-44 44h-12a44 44 0 0 1-44-44V88a10 10 0 0 1 10-10z" fill={p.pale} />
      <path d="M70 78h60v22q-30 16-60 0z" fill={p.mid} />
      <circle cx="100" cy="120" r="20" fill={p.mid} opacity="0.55" />
      <path d="M76 160h48" stroke={W} strokeWidth="5" strokeLinecap="round" />
      <path d="M82 176h36" stroke={W} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  sleepsack: (p) => (
    <>
      <path d="M74 70h52l14 26v88a20 20 0 0 1-20 20H80a20 20 0 0 1-20-20V96z" fill={p.pale} />
      <path d="M74 70h52l-8 18H82z" fill={p.mid} />
      <rect x="96" y="92" width="8" height="94" rx="4" fill={p.deep} opacity="0.6" />
      <circle cx="100" cy="88" r="7" fill={p.deep} />
      <circle cx="72" cy="120" r="10" fill={p.mid} />
      <circle cx="128" cy="120" r="10" fill={p.mid} />
    </>
  ),
  mobile: (p) => (
    <>
      <rect x="40" y="56" width="120" height="10" rx="5" fill={p.deep} />
      <path d="M70 66v26M100 66v40M130 66v26" stroke={p.mid} strokeWidth="4" strokeLinecap="round" />
      <circle cx="70" cy="106" r="18" fill={p.pale} />
      <path d="M100 106l8 16h-16z" fill={p.mid} transform="translate(0 6)" />
      <circle cx="100" cy="126" r="18" fill={p.mid} />
      <circle cx="130" cy="106" r="18" fill={p.deep} />
      <path d="M64 100q6 8 12 0" stroke={p.deep} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="168" r="14" fill={p.pale} />
      <circle cx="70" cy="176" r="9" fill={p.mid} opacity="0.6" />
      <circle cx="132" cy="172" r="11" fill={p.pale} opacity="0.8" />
    </>
  ),
  nightlight: (p) => (
    <>
      <circle cx="100" cy="118" r="46" fill={p.pale} />
      <circle cx="100" cy="118" r="30" fill={p.mid} />
      <path d="M112 104a18 18 0 1 0 0 28 22 22 0 0 1 0-28z" fill={W} />
      <rect x="72" y="164" width="56" height="24" rx="12" fill={p.deep} />
      <circle cx="150" cy="72" r="5" fill={p.mid} />
      <circle cx="56" cy="86" r="4" fill={p.mid} />
    </>
  ),
  blanket: (p) => (
    <>
      <path d="M50 86h100a6 6 0 0 1 6 6v76a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6V92a6 6 0 0 1 6-6z" fill={p.pale} />
      <path d="M44 108h112M44 130h112M44 152h112" stroke={p.mid} strokeWidth="6" />
      <path d="M72 86v88M100 86v88M128 86v88" stroke={p.mid} strokeWidth="6" opacity="0.5" />
      <path d="M44 174q28 14 56 0t56 0v10a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6z" fill={p.deep} opacity="0.5" />
    </>
  ),

  /* ------------------------------------------------------------ bathing */
  bathtub: (p) => (
    <>
      <path d="M40 108h120v34a40 40 0 0 1-40 40H80a40 40 0 0 1-40-40z" fill={p.pale} />
      <rect x="32" y="96" width="136" height="18" rx="9" fill={p.deep} />
      <path d="M60 132q40 18 80 0v10a30 30 0 0 1-30 30H90a30 30 0 0 1-30-30z" fill={p.mid} />
      <circle cx="100" cy="78" r="16" fill={p.mid} />
      <circle cx="94" cy="75" r="2.5" fill={p.deep} />
      <circle cx="106" cy="75" r="2.5" fill={p.deep} />
      <circle cx="66" cy="66" r="7" fill={p.pale} />
      <circle cx="136" cy="58" r="5" fill={p.pale} />
    </>
  ),
  lotion: (p) => (
    <>
      <rect x="88" y="34" width="24" height="20" rx="6" fill={p.deep} />
      <path d="M84 54h32l10 20v104a16 16 0 0 1-16 16H90a16 16 0 0 1-16-16V74z" fill={p.pale} />
      <rect x="80" y="104" width="40" height="48" rx="8" fill={p.mid} />
      <rect x="88" y="118" width="24" height="4" rx="2" fill={W} />
      <rect x="88" y="130" width="16" height="4" rx="2" fill={W} />
    </>
  ),
  towel: (p) => (
    <>
      <path d="M62 74q38-22 76 0v96a30 30 0 0 1-30 30H92a30 30 0 0 1-30-30z" fill={p.pale} />
      <path d="M62 74q38-22 76 0-8 26-38 26T62 74z" fill={p.mid} />
      <circle cx="100" cy="118" r="20" fill={p.mid} opacity="0.5" />
      <path d="M74 158h52" stroke={W} strokeWidth="6" strokeLinecap="round" />
      <path d="M74 176h52" stroke={W} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  nappies: (p) => (
    <>
      <rect x="46" y="86" width="108" height="92" rx="18" fill={p.pale} />
      <path d="M74 108h52c0 26-10 44-26 44s-26-18-26-44z" fill={p.mid} />
      <rect x="46" y="86" width="108" height="20" rx="10" fill={p.deep} />
      <circle cx="100" cy="166" r="6" fill={p.mid} />
      <circle cx="80" cy="166" r="6" fill={p.mid} opacity="0.6" />
      <circle cx="120" cy="166" r="6" fill={p.mid} opacity="0.6" />
    </>
  ),
  wipes: (p) => (
    <>
      <rect x="44" y="98" width="112" height="72" rx="18" fill={p.pale} />
      <rect x="72" y="88" width="56" height="26" rx="13" fill={p.deep} />
      <path d="M88 88q12-16 24 0z" fill={W} />
      <rect x="60" y="132" width="80" height="6" rx="3" fill={p.mid} />
      <rect x="60" y="148" width="54" height="6" rx="3" fill={p.mid} opacity="0.7" />
    </>
  ),

  /* ----------------------------------------------------------- clothing */
  bodysuit: (p) => (
    <>
      <path d="M78 62h44l30 20-14 26-16-8v44H78v-44l-16 8-14-26z" fill={p.pale} />
      <path d="M86 62h28a14 14 0 0 1-28 0z" fill={p.mid} />
      <path d="M78 144h44v28a20 20 0 0 1-20 20h-4a20 20 0 0 1-20-20z" fill={p.pale} />
      <path d="M84 170h32" stroke={p.mid} strokeWidth="5" strokeLinecap="round" />
      <circle cx="92" cy="186" r="4" fill={p.deep} />
      <circle cx="108" cy="186" r="4" fill={p.deep} />
    </>
  ),
  hatmittens: (p) => (
    <>
      <path d="M62 108a38 38 0 0 1 76 0z" fill={p.pale} />
      <rect x="56" y="106" width="88" height="18" rx="9" fill={p.deep} />
      <circle cx="100" cy="62" r="10" fill={p.mid} />
      <path d="M100 72v8" stroke={p.mid} strokeWidth="4" strokeLinecap="round" />
      <path d="M56 148h32a10 10 0 0 1 10 10v20a14 14 0 0 1-14 14H60a14 14 0 0 1-14-14v-20a10 10 0 0 1 10-10z" fill={p.pale} />
      <path d="M112 148h32a10 10 0 0 1 10 10v20a14 14 0 0 1-14 14h-24a14 14 0 0 1-14-14v-20a10 10 0 0 1 10-10z" fill={p.mid} />
    </>
  ),
  sleepsuit: (p) => (
    <>
      <path d="M78 58h44l28 18-12 26-14-8v40H76v-40l-14 8-12-26z" fill={p.pale} />
      <path d="M76 134h48v34l-8 40H84l-8-40z" fill={p.pale} />
      <path d="M100 134v74" stroke={p.mid} strokeWidth="5" />
      <path d="M76 200h20v12H76zM104 200h20v12h-20z" fill={p.deep} />
      <path d="M88 58h24a12 12 0 0 1-24 0z" fill={p.mid} />
    </>
  ),
  socks: (p) => (
    <>
      <path d="M62 70h30v56a30 30 0 0 0 30 30h6v28h-14a52 52 0 0 1-52-52V70z" fill={p.pale} />
      <rect x="58" y="62" width="38" height="18" rx="9" fill={p.deep} />
      <path d="M116 70h30v56a30 30 0 0 0 22 29v29h-8a52 52 0 0 1-44-52V70z" fill={p.mid} opacity="0.75" />
      <rect x="112" y="62" width="38" height="18" rx="9" fill={p.deep} opacity="0.75" />
    </>
  ),
  cardigan: (p) => (
    <>
      <path d="M80 62h40l32 20-14 28-14-8v76H76v-76l-14 8-14-28z" fill={p.pale} />
      <path d="M96 62h8v116h-8z" fill={p.mid} />
      <circle cx="100" cy="92" r="4" fill={p.deep} />
      <circle cx="100" cy="118" r="4" fill={p.deep} />
      <circle cx="100" cy="144" r="4" fill={p.deep} />
      <path d="M80 62l20 22 20-22" stroke={p.mid} strokeWidth="5" fill="none" />
    </>
  ),

  /* ------------------------------------------------------------- health */
  thermometer: (p) => (
    <>
      <rect x="84" y="42" width="32" height="150" rx="16" fill={p.pale} />
      <rect x="92" y="56" width="16" height="104" rx="8" fill={p.mid} />
      <rect x="92" y="112" width="16" height="48" rx="8" fill={p.deep} />
      <circle cx="100" cy="172" r="20" fill={p.deep} />
      <path d="M124 76h14M124 96h20M124 116h14" stroke={p.mid} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  scale: (p) => (
    <>
      <rect x="34" y="120" width="132" height="52" rx="18" fill={p.pale} />
      <path d="M52 120q48-34 96 0z" fill={p.mid} />
      <rect x="70" y="138" width="60" height="22" rx="8" fill={p.deep} />
      <rect x="80" y="146" width="10" height="6" rx="2" fill={W} />
      <rect x="95" y="146" width="10" height="6" rx="2" fill={W} />
      <rect x="110" y="146" width="10" height="6" rx="2" fill={W} />
      <circle cx="100" cy="82" r="20" fill={p.mid} />
      <circle cx="93" cy="78" r="2.5" fill={p.deep} />
      <circle cx="107" cy="78" r="2.5" fill={p.deep} />
    </>
  ),
  aspirator: (p) => (
    <>
      <path d="M92 44h16a10 10 0 0 1 10 10v40H82V54a10 10 0 0 1 10-10z" fill={p.mid} />
      <rect x="74" y="94" width="52" height="72" rx="20" fill={p.pale} />
      <rect x="86" y="112" width="28" height="36" rx="12" fill={p.mid} opacity="0.6" />
      <path d="M126 130q26 6 26 30" stroke={p.deep} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="152" cy="168" r="10" fill={p.deep} />
    </>
  ),
  monitor: (p) => (
    <>
      <rect x="40" y="76" width="120" height="86" rx="16" fill={p.pale} />
      <rect x="54" y="90" width="92" height="58" rx="8" fill={p.deep} />
      <circle cx="100" cy="119" r="16" fill={p.mid} />
      <circle cx="100" cy="119" r="6" fill={W} />
      <rect x="82" y="162" width="36" height="22" rx="6" fill={p.mid} />
      <path d="M100 76V56M100 56q-14 0-14-10M100 56q14 0 14-10" stroke={p.mid} strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),
  firstaid: (p) => (
    <>
      <rect x="42" y="90" width="116" height="88" rx="18" fill={p.pale} />
      <rect x="80" y="72" width="40" height="22" rx="8" fill={p.deep} />
      <rect x="42" y="120" width="116" height="14" fill={p.mid} opacity="0.5" />
      <rect x="90" y="112" width="20" height="52" rx="6" fill={p.deep} />
      <rect x="74" y="128" width="52" height="20" rx="6" fill={p.deep} />
    </>
  ),
  humidifier: (p) => (
    <>
      <path d="M62 110h76v52a24 24 0 0 1-24 24H86a24 24 0 0 1-24-24z" fill={p.pale} />
      <rect x="70" y="94" width="60" height="22" rx="11" fill={p.deep} />
      <path d="M86 84q0-14 14-14t14 14" stroke={p.mid} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M78 62q0-16 10-22M122 62q0-16-10-22" stroke={p.mid} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="100" cy="150" r="12" fill={p.mid} />
    </>
  ),

  /* ----------------------------------------------------------- diapering */
  bag: (p) => (
    <>
      <path
        d="M64 96h72a10 10 0 0 1 10 10v70a20 20 0 0 1-20 20H74a20 20 0 0 1-20-20v-70a10 10 0 0 1 10-10z"
        fill={p.pale}
      />
      <path d="M78 96V78a22 22 0 0 1 44 0v18" stroke={p.mid} strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="70" y="120" width="60" height="10" rx="5" fill={p.mid} />
      <circle cx="100" cy="150" r="14" fill={p.deep} opacity="0.5" />
    </>
  ),
  pail: (p) => (
    <>
      <path d="M58 96h84l-10 92a14 14 0 0 1-14 12H82a14 14 0 0 1-14-12z" fill={p.pale} />
      <rect x="50" y="82" width="100" height="20" rx="10" fill={p.deep} />
      <rect x="86" y="66" width="28" height="16" rx="8" fill={p.mid} />
      <path d="M70 116h60M66 140h68M64 164h72" stroke={p.mid} strokeWidth="5" opacity="0.6" />
    </>
  ),

  /* --------------------------------------------------------- travel & outdoor */
  stroller: (p) => (
    <>
      <path d="M54 100h96a14 14 0 0 1 14 16l-6 18a14 14 0 0 1-13 10H66a14 14 0 0 1-13-9l-9-24a10 10 0 0 1 10-11z" fill={p.pale} />
      <path d="M60 100q4-30 40-38" stroke={p.deep} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="176" r="18" fill={p.mid} />
      <circle cx="150" cy="176" r="18" fill={p.mid} />
      <circle cx="76" cy="176" r="6" fill={p.deep} />
      <circle cx="150" cy="176" r="6" fill={p.deep} />
      <path d="M144 100l14 6" stroke={p.deep} strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  carseat: (p) => (
    <>
      <path
        d="M64 60h72a14 14 0 0 1 14 14v50q0 46-50 62-50-16-50-62V74a14 14 0 0 1 14-14z"
        fill={p.pale}
      />
      <path
        d="M78 74h44a10 10 0 0 1 10 10v38q0 32-32 44-32-12-32-44V84a10 10 0 0 1 10-10z"
        fill={p.mid}
      />
      <path d="M80 108h40M80 126h40" stroke={W} strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="150" r="9" fill={p.deep} />
    </>
  ),
  carrier: (p) => (
    <>
      <path
        d="M70 70q30-18 60 0l6 20-8 84a14 14 0 0 1-14 12H86a14 14 0 0 1-14-12l-8-84z"
        fill={p.pale}
      />
      <path d="M70 70q30 20 60 0" stroke={p.mid} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="112" r="20" fill={p.mid} opacity="0.6" />
      <path
        d="M60 76q-14 40 4 74M140 76q14 40-4 74"
        stroke={p.deep}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  travelcot: (p) => (
    <>
      <rect x="46" y="120" width="108" height="54" rx="14" fill={p.pale} />
      <path
        d="M52 120v-30M76 120v-38M100 120v-42M124 120v-38M148 120v-30"
        stroke={p.mid}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="46" y="146" width="108" height="8" fill={p.deep} opacity="0.4" />
    </>
  ),
  sunshade: (p) => (
    <>
      <path d="M40 110a60 60 0 0 1 120 0z" fill={p.mid} />
      <path d="M40 110h120" stroke={p.deep} strokeWidth="6" />
      <path d="M100 110v70" stroke={p.deep} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 180q-16 10 -16 20M100 180q16 10 16 20" stroke={p.mid} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M64 110q6-30 36-38M136 110q-6-30-36-38" stroke={p.pale} strokeWidth="5" fill="none" opacity="0.7" />
    </>
  ),
  backpack: (p) => (
    <>
      <path d="M58 90a42 42 0 0 1 84 0v76a18 18 0 0 1-18 18H76a18 18 0 0 1-18-18z" fill={p.pale} />
      <rect x="80" y="66" width="40" height="20" rx="10" fill={p.deep} />
      <rect x="70" y="110" width="60" height="34" rx="10" fill={p.mid} />
      <path d="M100 110v34" stroke={p.deep} strokeWidth="3" opacity="0.5" />
    </>
  ),

  /* --------------------------------------------------------- toys & learning */
  rattle: (p) => (
    <>
      <circle cx="100" cy="90" r="40" fill={p.pale} />
      <circle cx="100" cy="90" r="24" fill={p.mid} />
      <circle cx="88" cy="82" r="5" fill={p.deep} />
      <circle cx="112" cy="82" r="5" fill={p.deep} />
      <circle cx="100" cy="102" r="5" fill={p.deep} />
      <rect x="92" y="126" width="16" height="70" rx="8" fill={p.deep} />
    </>
  ),
  teether: (p) => (
    <>
      <circle cx="70" cy="100" r="30" fill={p.pale} />
      <circle cx="130" cy="100" r="30" fill={p.mid} />
      <circle cx="100" cy="140" r="30" fill={p.deep} opacity="0.85" />
      <circle cx="70" cy="100" r="10" fill={W} />
      <circle cx="130" cy="100" r="10" fill={W} />
      <circle cx="100" cy="140" r="10" fill={W} />
    </>
  ),
  softtoy: (p) => (
    <>
      <circle cx="70" cy="66" r="16" fill={p.mid} />
      <circle cx="130" cy="66" r="16" fill={p.mid} />
      <circle cx="100" cy="100" r="44" fill={p.pale} />
      <circle cx="86" cy="94" r="5" fill={p.deep} />
      <circle cx="114" cy="94" r="5" fill={p.deep} />
      <circle cx="100" cy="108" r="8" fill={p.mid} />
      <ellipse cx="100" cy="176" rx="46" ry="38" fill={p.mid} />
    </>
  ),
  gym: (p) => (
    <>
      <path d="M46 180q54-120 108 0" stroke={p.deep} strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="30" y="176" width="30" height="10" rx="5" fill={p.mid} />
      <rect x="140" y="176" width="30" height="10" rx="5" fill={p.mid} />
      <circle cx="76" cy="90" r="14" fill={p.mid} />
      <circle cx="100" cy="76" r="14" fill={p.pale} />
      <circle cx="124" cy="90" r="14" fill={p.mid} />
      <path d="M76 76v14M100 62v14M124 76v14" stroke={p.deep} strokeWidth="3" />
    </>
  ),
  musictoy: (p) => (
    <>
      <rect x="50" y="120" width="100" height="50" rx="12" fill={p.pale} />
      <rect x="60" y="90" width="14" height="46" rx="6" fill={p.deep} />
      <rect x="82" y="90" width="14" height="46" rx="6" fill={p.mid} />
      <rect x="104" y="90" width="14" height="46" rx="6" fill={p.deep} />
      <rect x="126" y="90" width="14" height="46" rx="6" fill={p.mid} />
    </>
  ),
  book: (p) => (
    <>
      <path d="M46 66h50a10 10 0 0 1 10 10v104H56a10 10 0 0 1-10-10z" fill={p.mid} />
      <path d="M154 66h-50a10 10 0 0 0-10 10v104h54a10 10 0 0 0 10-10z" fill={p.pale} />
      <rect x="96" y="66" width="8" height="114" fill={p.deep} />
      <path d="M62 90h20M62 106h20M118 90h20M118 106h20" stroke={W} strokeWidth="4" strokeLinecap="round" />
    </>
  ),

  /* ------------------------------------------------ weaning & toddler feeding */
  container: (p) => (
    <>
      <rect x="56" y="90" width="88" height="94" rx="16" fill={p.pale} />
      <rect x="48" y="72" width="104" height="26" rx="13" fill={p.deep} />
      <rect x="70" y="112" width="60" height="10" rx="5" fill={p.mid} />
      <rect x="70" y="132" width="60" height="10" rx="5" fill={p.mid} opacity="0.7" />
    </>
  ),
  cup: (p) => (
    <>
      <path d="M70 84h60l-8 90a14 14 0 0 1-14 12H92a14 14 0 0 1-14-12z" fill={p.pale} />
      <rect x="64" y="72" width="72" height="20" rx="10" fill={p.deep} />
      <path d="M130 100q22 0 22 20t-22 18" stroke={p.mid} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="60" r="8" fill={p.mid} />
    </>
  ),
  lunchbox: (p) => (
    <>
      <rect x="48" y="98" width="104" height="76" rx="14" fill={p.pale} />
      <path d="M80 98V80a20 20 0 0 1 40 0v18" stroke={p.deep} strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="48" y="128" width="104" height="10" fill={p.mid} opacity="0.6" />
      <circle cx="100" cy="150" r="8" fill={p.deep} />
    </>
  ),

  /* ------------------------------------------------------- mom & maternity */
  maternitywear: (p) => (
    <>
      <path
        d="M76 58h48l26 24-16 22-10-6v8q18 14 18 46 0 40-36 52-36-12-36-52 0-32 18-46v-8l-10 6-16-22z"
        fill={p.pale}
      />
      <path d="M86 58h28a14 14 0 0 1-28 0z" fill={p.mid} />
      <circle cx="100" cy="150" r="30" fill={p.mid} opacity="0.5" />
    </>
  ),
  bra: (p) => (
    <>
      <circle cx="76" cy="106" r="34" fill={p.pale} />
      <circle cx="124" cy="106" r="34" fill={p.pale} />
      <path d="M50 96q50-30 100 0" stroke={p.deep} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M60 132q40 20 80 0" stroke={p.mid} strokeWidth="6" fill="none" strokeLinecap="round" />
    </>
  ),
};

export const ART_KEYS = Object.keys(ARTS);

export function ProductArt({
  art,
  colorKey,
  className,
}: {
  art: string;
  colorKey: ColorKey;
  className?: string;
}) {
  const palette = PALETTES[colorKey];
  const draw = ARTS[art] ?? ARTS.bottle;

  return (
    <svg
      viewBox="0 0 200 250"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Soft light bloom behind the object, so it sits in a space. */}
      <circle cx="60" cy="60" r="70" fill="rgba(255,255,255,0.55)" />
      <circle cx="160" cy="200" r="70" fill="rgba(255,255,255,0.32)" />
      {draw(palette)}
    </svg>
  );
}
