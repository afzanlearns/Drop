/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-base':        'var(--bg-base)',
        'bg-surface':     'var(--bg-surface)',
        'bg-elevated':    'var(--bg-elevated)',
        'bg-inverse':     'var(--bg-inverse)',
        'border-subtle':  'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong':  'var(--border-strong)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'text-inverse':   'var(--text-inverse)',
        'accent':         'var(--accent)',
        'accent-dim':     'var(--accent-dim)',
        'accent-hover':   'var(--accent-hover)',
        success:          'var(--success)',
        warning:          'var(--warning)',
        error:            'var(--error)',
        info:             'var(--info)',
      },
      fontFamily: {
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'label': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        'data':  ['0.75rem',   { lineHeight: '1.4' }],
        'body':  ['0.875rem',  { lineHeight: '1.6' }],
        'ui':    ['0.9375rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        DEFAULT: '0',
        sm: '2px',
      },
    },
  },
  plugins: [],
};
