import { create } from 'twrnc';

export const tw = create({
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        'primary-container': '#ffedd5',
        'on-primary': '#ffffff',
        'on-primary-container': '#ea580c',
        secondary: '#475569',
        'secondary-container': '#f1f5f9',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#0f172a',
        tertiary: '#14b8a6',
        'tertiary-container': '#ccfbf1',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#115e59',
        surface: '#ffffff',
        background: '#fff7ed',
        'on-background': '#0f172a',
        'surface-container': '#ffedd5',
        'surface-container-low': '#fffaf5',
        'surface-container-high': '#ffebdb',
        'surface-container-highest': '#fed7aa',
        'outline-variant': '#ffecd2',
        'on-surface': '#0f172a',
      },
    },
  },
});
