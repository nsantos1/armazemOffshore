import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#002E4A', 50:'#e6ebef', 100:'#bfcad4', 700:'#003E63', 800:'#002E4A', 900:'#001E33' },
        accent:  { DEFAULT: '#FFD000', 600:'#E6BB00', 700:'#B89500' },
        mint:    { DEFAULT: '#89D6C2', 50:'#f0faf6', 100:'#d8f1e9', 200:'#aee3d2' },
        'brand-gray': { DEFAULT: '#D7D7D7', 50:'#f6f6f6', 100:'#ededed', 200:'#dcdcdc' },
        bg:      '#FFFFFF',
        'bg-soft': '#F4F6F8',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans:    ['"Open Sans"','ui-sans-serif','system-ui','sans-serif'],
        display: ['"Montserrat"','ui-sans-serif','system-ui','sans-serif'],
        mono:    ['"JetBrains Mono"','ui-monospace','monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,46,74,.04), 0 8px 24px rgba(0,46,74,.06)',
        deep: '0 12px 40px rgba(0,46,74,.18)',
      },
      keyframes: {
        marquee: { '0%':{transform:'translateX(0)'}, '100%':{transform:'translateX(-50%)'} },
        fadein: { '0%':{opacity:'0', transform:'translateY(8px)'}, '100%':{opacity:'1', transform:'translateY(0)'} },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        fadein: 'fadein .35s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
