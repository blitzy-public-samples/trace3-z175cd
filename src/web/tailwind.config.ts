// tailwindcss v3.x
// autoprefixer v10.x

/*
Human Tasks:
1. Verify font imports are properly configured in the Next.js application
2. Ensure color contrast ratios meet WCAG AAA standards for accessibility
3. Test responsive breakpoints across different device sizes
4. Validate custom spacing values match design system specifications
*/

import type { Config } from 'tailwindcss'

/*
Requirement Addressed: User Interface Design
Location: Technical Specification/User Interface Design/Design System Specifications
Description: Implements the design system specifications, including typography, color system, and layout grid, using TailwindCSS.
*/
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette
        primary: '#1a73e8',
        secondary: '#fbbc05',
        background: '#f9f9f9',
        text: '#333',
        // Extended color variations for accessibility
        'primary-dark': '#1557b0',
        'primary-light': '#4a90e2',
        'secondary-dark': '#d6a003',
        'secondary-light': '#fcd050',
        // Semantic colors
        success: '#34a853',
        error: '#ea4335',
        warning: '#fbbc05',
        info: '#4285f4',
      },
      fontFamily: {
        // Typography system
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      spacing: {
        // Extended spacing scale
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontSize: {
        // Typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      screens: {
        // Responsive breakpoints
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      container: {
        // Container settings
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      borderRadius: {
        // Border radius scale
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        // Shadow system
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
  // Safelist essential utility classes
  safelist: [
    'bg-primary',
    'bg-secondary',
    'text-primary',
    'text-secondary',
    'border-primary',
    'border-secondary',
  ],
  // Enable dark mode based on class
  darkMode: 'class',
}

export default config