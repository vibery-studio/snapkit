// Shared props interface for all Vue layout components
export interface LayoutProps {
  width: number
  height: number
  title?: string
  subtitle?: string
  bgColor?: string
  bgImage?: string
  titleColor?: string
  subtitleColor?: string
  logo?: string
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  featureImage?: string
  overlay?: 'none' | 'light' | 'medium' | 'dark'
  watermarkUrl?: string
  watermarkOpacity?: 'light' | 'medium' | 'dark'
  // Layout-specific extras
  accentColor?: string
  frameColor?: string
  barColor?: string
  gradientEnd?: string
  image1?: string
  image2?: string
}

// Helper: overlay gradient CSS value
export function getOverlayGradient(overlay?: string): string {
  switch (overlay) {
    case 'light': return 'linear-gradient(rgba(0,0,0,0.25),rgba(0,0,0,0.25))'
    case 'medium': return 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5))'
    case 'dark': return 'linear-gradient(rgba(0,0,0,0.72),rgba(0,0,0,0.72))'
    default: return 'none'
  }
}

// Helper: logo corner position style object
export function logoCornerStyle(pos?: string): Record<string, string> {
  switch (pos) {
    case 'top-left': return { top: '3%', left: '3%' }
    case 'top-right': return { top: '3%', right: '3%' }
    case 'bottom-left': return { bottom: '3%', left: '3%' }
    default: return { bottom: '3%', right: '3%' } // bottom-right
  }
}
