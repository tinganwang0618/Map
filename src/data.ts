// ... existing imports ...
export type Phase = 'pre-conflict' | 'crisis-peak' | 'long-term';

export interface Point {
  id: string;
  name: string;
  coords: [number, number];
  type: 'chokepoint' | 'hub' | 'nation';
  category: 'energy' | 'economy' | 'politics';
  details: {
    [key in Phase]: {
      status: string;
      metrics: { label: string; value: string; color?: string; trend?: 'up' | 'down' }[];
      description: string;
    }
  };
}

export const POINTS: Point[] = [
  // ... existing points
  {
    id: 'strait-of-hormuz',
    name: 'Strait of Hormuz',
    coords: [26.56, 56.25],
    type: 'chokepoint',
    category: 'energy',
    details: {
      'pre-conflict': {
        status: 'Operational',
        metrics: [
          { label: 'Daily Flow', value: '21.4M bbl/d', color: '#10b981' },
          { label: 'Risk Level', value: 'LOW', color: '#3b82f6' }
        ],
        description: 'Global energy choke point. 25% of global maritime oil trade passes here.'
      },
      'crisis-peak': {
        status: 'TOTAL BLOCKADE',
        metrics: [
          { label: 'Daily Flow', value: '0.4M bbl/d', color: '#ef4444' },
          { label: 'Risk Level', value: 'ULTRA-CRITICAL', color: '#ef4444' }
        ],
        description: '21mi wide passage effectively closed by kinetic threats. Global oil supply -12%.'
      },
      'long-term': {
        status: 'Militarized',
        metrics: [
          { label: 'Daily Flow', value: '14.2M bbl/d', color: '#f59e0b' },
          { label: 'Patrols', value: 'MAX', color: '#10b981' }
        ],
        description: 'Heavily patrolled. Permanent naval task force presence established.'
      }
    }
  },
  {
    id: 'silicon-valley',
    name: 'Silicon Valley',
    coords: [37.38, -122.05],
    type: 'hub',
    category: 'economy',
    details: {
      'pre-conflict': {
        status: 'Growth',
        metrics: [
          { label: 'AI Capex', value: '$85B', color: '#10b981' },
          { label: 'Cloud Costs', value: 'Base', color: '#3b82f6' }
        ],
        description: 'Vibrant AI investment boom. High demand for HBM and DRAM chips.'
      },
      'crisis-peak': {
        status: 'Market Sell-off',
        metrics: [
          { label: 'Op Costs', value: '+22%', color: '#ef4444', trend: 'up' },
          { label: 'Nasdaq-100', value: '-12%', color: '#ef4444', trend: 'down' }
        ],
        description: 'NVIDIA/Intel supply chains threatened by helium shortage and energy spikes.'
      },
      'long-term': {
        status: 'Restructuring',
        metrics: [
          { label: 'Resilience', value: '88/100', color: '#10b981' },
          { label: 'Margins', value: 'Squeezed', color: '#f59e0b' }
        ],
        description: 'Shift from demand-driven to supply-constrained growth model.'
      }
    }
  },
  {
    id: 'hsinchu',
    name: 'Hsinchu / TSMC',
    coords: [24.77, 120.99],
    type: 'hub',
    category: 'economy',
    details: {
      'pre-conflict': {
        status: 'Nominal',
        metrics: [
          { label: 'Fab Load', value: '100%', color: '#10b981' },
          { label: 'Helium Stock', value: '45d', color: '#3b82f6' }
        ],
        description: 'Global advanced logic production hub for Apple, NVIDIA, and AMD.'
      },
      'crisis-peak': {
        status: 'EMERGENCY',
        metrics: [
          { label: 'Fab Load', value: '72%', color: '#ef4444', trend: 'down' },
          { label: 'Power Cost', value: '3.4x', color: '#ef4444', trend: 'up' }
        ],
        description: 'LNG intake blocked via Hormuz. Helium reserves exhausted in 3 weeks.'
      },
      'long-term': {
        status: 'De-centralized',
        metrics: [
          { label: 'External Cap', value: '+40%', color: '#10b981' },
          { label: 'Risk Premium', value: 'High', color: '#f59e0b' }
        ],
        description: 'Accelerated fab construction in Arizona and Saxony to mitigate choke points.'
      }
    }
  },
  {
    id: 'london-finance',
    name: 'London / Commodities',
    coords: [51.50, -0.12],
    type: 'hub',
    category: 'politics',
    details: {
      'pre-conflict': {
        status: 'Stable',
        metrics: [
          { label: 'Brent Crude', value: '$72', color: '#10b981' },
          { label: 'VIX Volatility', value: '14.2', color: '#3b82f6' }
        ],
        description: 'Pricing hub for North Sea and Global oil benchmarks.'
      },
      'crisis-peak': {
        status: 'Market Chaos',
        metrics: [
          { label: 'Brent Crude', value: '$148', color: '#ef4444' },
          { label: 'Insurance', value: '1200%', color: '#ef4444' }
        ],
        description: 'Unprecedented volatility. Maritime insurance effectively withdrawn from Persian Gulf.'
      },
      'long-term': {
        status: 'Correction',
        metrics: [
          { label: 'Brent Crude', value: '$92', color: '#f59e0b' },
          { label: 'New Contracts', value: 'CIPS Sync', color: '#3b82f6' }
        ],
        description: 'Market realigning with non-Western settlement systems (CIPS / Yuan).'
      }
    }
  }
];

export const FLOW_LINES = [
  { id: 'pg-china', from: [26.56, 56.25], to: [31.23, 121.47], label: 'Main Crude (East)', type: 'oil' },
  { id: 'pg-eu', from: [26.56, 56.25], to: [51.5, 3.4], label: 'Energy Export (West)', type: 'oil' },
  { id: 'pg-india', from: [26.56, 56.25], to: [18.97, 72.87], label: 'Reliance Flow', type: 'oil' },
  { id: 'us-tw', from: [37.38, -122.05], to: [24.77, 120.99], label: 'IP / Tech Corridor', type: 'data' },
  { id: 'he-sk', from: [25.9, 51.5], to: [37.56, 126.97], label: 'Helium: KR', type: 'helium' },
  { id: 'he-tw', from: [25.9, 51.5], to: [24.77, 120.99], label: 'Helium: TW', type: 'helium' },
  { id: 'he-us', from: [25.9, 51.5], to: [34.05, -118.24], label: 'Helium: US', type: 'helium' },
  { id: 'he-eu', from: [25.9, 51.5], to: [52.36, 4.89], label: 'Helium: EU', type: 'helium' }
];

export const HEATMAP_DATA = [
  { lat: 37.56, lng: 126.97, weight: 0.9, name: 'S. Korea' },
  { lat: 35.67, lng: 139.65, weight: 0.8, name: 'Japan' },
  { lat: 20.59, lng: 78.96, weight: 0.85, name: 'India' },
  { lat: 39.90, lng: 116.40, weight: 0.75, name: 'China' },
  { lat: 52.52, lng: 13.40, weight: 0.7, name: 'Germany' },
  { lat: 26.56, lng: 56.25, weight: 1.0, name: 'Iran' },
];

// ISO-A3 codes for polygon coloring
export const SENSITIVITY_RATINGS: Record<string, number> = {
  // Ultra-High Sensitivity (Asian Mfg & Energy Dependent)
  'KOR': 0.98, // South Korea (KOSPI -18%, semiconductor energy rely)
  'TWN': 0.95, // Taiwan (TSMC electricity demands, LNG reliance)
  'BGD': 0.92, // Bangladesh (LNG dependent power)
  'PAK': 0.90, // Pakistan (LNG dependent power)
  'IND': 0.88, // India (Massive manufacturing energy needs)
  'CHN': 0.85, // China (Manufacturing scale, energy import dependency)
  
  // High Sensitivity (EU Power Mix issues)
  'DEU': 0.82, // Germany (Industrial recovery fragility)
  'ITA': 0.78, // Italy (High gas power reliance)
  'GBR': 0.75, // UK (Gas power reliance)
  
  // Moderate Sensitivity 
  'FRA': 0.40, // France (Nuclear buffer)
  'ESP': 0.65, // Spain
  'JPN': 0.80, // Japan
  
  // Low Sensitivity / Exporters
  'USA': 0.15, // USA (Domestic supply safe)
  'CAN': 0.10, // Canada
  'RUS': 0.05, // Russia (Net exporter)
  'SAU': 0.05, // Saudi
  'ARE': 0.05, // UAE
  'IRN': 1.00, // Epicenter
};

export interface GlobalMetric {
  metric: string;
  phase1: string;
  phase2: string;
  phase3: string;
  peakChange: string;
}

export const GLOBAL_METRICS: GlobalMetric[] = [
  {
    metric: 'Brent Crude',
    phase1: '$61 - $72',
    phase2: '$115 - $118',
    phase3: '$92 - $95',
    peakChange: '+67.6%'
  },
  {
    metric: 'US Gasoline',
    phase1: '$2.80 - $2.98',
    phase2: '$4.02 - $4.08',
    phase3: '$3.89',
    peakChange: '+36.9%'
  },
  {
    metric: 'KOSPI Index',
    phase1: '6,347',
    phase2: '5,042',
    phase3: '6,388',
    peakChange: '-20.6%'
  },
  {
    metric: 'US CPI (CPI)',
    phase1: '2.4%',
    phase2: '3.3% - 4.2%',
    phase3: '3.1%',
    peakChange: '+1.7%'
  }
];
