// Centralized Theme Configuration for All Dashboards
// Modern Indigo & Violet Premium Theme - Professional & Modern

export const THEME = {
  // Primary colors - Deep Indigo
  primary: {
    dark: '#312e81',      // indigo-900
    base: '#4f46e5',      // indigo-600
    light: '#a5b4fc',     // indigo-300
    lighter: '#e0e7ff',   // indigo-100
  },
  
  // Secondary colors - Vibrant Violet
  secondary: {
    dark: '#6b21a8',      // violet-900
    base: '#a855f7',      // violet-600
    light: '#d8b4fe',     // violet-300
  },
  
  // Status colors
  status: {
    success: '#10b981',   // emerald-500
    warning: '#f59e0b',   // amber-500
    error: '#ef4444',     // red-500
    info: '#06b6d4',      // cyan-500
  },
  
  // Neutral colors
  neutral: {
    900: '#0f172a',       // slate-900
    800: '#1e293b',       // slate-800
    700: '#334155',       // slate-700
    600: '#475569',       // slate-600
    500: '#64748b',       // slate-500
    400: '#94a3b8',       // slate-400
    300: '#cbd5e1',       // slate-300
    200: '#e2e8f0',       // slate-200
    100: '#f1f5f9',       // slate-100
    50:  '#f8fafc',       // slate-50
  },
  
  // Gradients - Indigo to Violet
  gradients: {
    sidebar: 'from-indigo-900 via-indigo-800 to-violet-900',
    topbar: 'from-indigo-600 via-indigo-500 to-violet-600',
    card: 'from-indigo-50 to-violet-50',
    button: 'from-indigo-600 to-violet-600',
    hover: 'from-violet-600 to-indigo-600',
  },
  
  // Typography
  typography: {
    heading: 'text-gray-900 font-bold',
    subheading: 'text-gray-700 font-semibold',
    body: 'text-gray-600',
    label: 'text-gray-700 font-medium',
    muted: 'text-gray-500 text-sm',
  },
  
  // Tailwind color classes
  tailwind: {
    // Sidebar gradient (desktop)
    sidebarGradient: 'bg-gradient-to-b from-indigo-900 via-indigo-800 to-violet-900',
    
    // Top bar gradient
    navbarGradient: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600',
    
    // Active nav item
    activeNav: 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg',
    
    // Hover nav item
    hoverNav: 'hover:bg-violet-400/30 transition-all duration-150',
    
    // Card background
    cardBg: 'bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1',
    
    // Input background
    inputBg: 'bg-indigo-50 border-2 border-indigo-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-300 rounded-xl transition-all',
    
    // Button primary
    buttonPrimary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105',
    
    // Button secondary
    buttonSecondary: 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 hover:from-indigo-200 hover:to-violet-200 transition-all',
    
    // Button danger
    buttonDanger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl',
  },
};

// Role-specific metadata (for reference, not changing colors)
export const ROLE_META = {
  admin: {
    displayName: 'Admin',
    subtitle: 'System Management',
    icon: 'ShieldCheckIcon',
    gradient: 'from-indigo-600 to-violet-600',
  },
  pg_owner: {
    displayName: 'PG Owner',
    subtitle: 'Management Portal',
    icon: 'BuildingStorefrontIcon',
    gradient: 'from-violet-600 to-indigo-600',
  },
  tenant: {
    displayName: 'Tenant',
    subtitle: 'Resident Dashboard',
    icon: 'UserIcon',
    gradient: 'from-blue-500 to-violet-600',
  },
};

export default THEME;
