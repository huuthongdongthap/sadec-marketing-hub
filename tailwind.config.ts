import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // M3 Design System Tokens - Adapted for Mekong Delta & Sa Đéc Heritage Aesthetic
        m3: {
          primary: '#1B4D3E', // Rừng tràm sâu thẳm (Râm xanh)
          onPrimary: '#FFFFFF', // Trắng tuyết
          primaryContainer: '#A7F3D8', // Ánh sáng bình minh trên lá sen
          onPrimaryContainer: '#062E23', // Xanh đêm tối
          secondary: '#5A7F71', // Lá sen già mộc mạc
          onSecondary: '#FFFFFF',
          secondaryContainer: '#DAEADF', // Hoa sen hồng phấn nhạt
          onSecondaryContainer: '#163C32',
          tertiary: '#9A6B4F', // Đất phù sa ấm áp
          onTertiary: '#FFFFFF',
          tertiaryContainer: '#FCDAC4', // Màu vàng hoa hoàng đầu ấn,
          onTertiaryContainer: '#3B2114',
          error: '#BA1A1A', // Đỏ cờ phướn
          onError: '#FFFFFF',
          background: '#FAFDF9', // Bề mặt trắng ngà
          surface: '#FAFDF9',
          surfaceVariant: '#DDE2DE', // Xám nhạt sương mai
          outline: '#6E7973', // Đường viền mực tàu,
          onSurface: '#1A1C1A', // Đen mực tàu truyền thống
          onSurfaceVariant: '#424745', // Xám đậm văn tự cổ,
          outlineVariant: '#C2C8C4', // Viền đồng nhẹ
          inverseOnSurface: '#F1F1EE',
          inverseSurface: '#2E302E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--md-sys-color-on-surface)',
            h1: { fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' },
            h2: { fontSize: 'clamp(2rem, 4vw, 2.5rem)' },
          },
        },
      },
      borderRadius: {
        'none': '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
        'm3-tiny': '4px',
        'm3-small': '8px',
        'm3-medium': '12px',
        'm3-large': '16px',
        'm3-full': '9999px',
      },
      boxShadow: {
        'm3-soft': '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        'm3-elevated': '0px 4px 8px 3px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.12)',
        'm3-floated': '0px 8px 16px 4px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.16)',
        'm3-shadow-2': '0px 12px 24px -4px rgba(0, 0, 0, 0.15), 0px 4px 12px rgba(0, 0, 0, 0.1)',
        'm3-shadow-4': '0px 20px 40px -6px rgba(0, 0, 0, 0.2), 0px 8px 16px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
