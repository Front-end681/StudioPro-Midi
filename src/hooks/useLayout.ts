import { useState, useEffect } from 'react';

export function useLayout() {
  const calculate = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isLandscape = vw > vh;
    const minDim = Math.min(vw, vh);
    const isPhone = minDim < 480;
    const isTablet = minDim >= 480 && minDim < 900;
    const isDesktop = minDim >= 900;
    
    // Heights
    const headerH = Math.round(vh * (isPhone ? 0.07 : 0.055));
    const controlsH = (isPhone && !isLandscape)
      ? Math.round(vh * 0.15)
      : Math.round(vh * 0.085);
    const bottomH = Math.round(vh * (isPhone ? 0.12 : 0.095));
    const keyboardH = vh - headerH - controlsH - bottomH;
    
    // Bend strip
    const bendW = (!isLandscape && isPhone)
      ? 0
      : Math.round(vw * 0.042);
    
    // Key dimensions
    const octaves = isPhone ? 2 : 3;
    const whiteCount = octaves * 7;
    const availableW = vw - bendW;
    const autoW = Math.floor(availableW / whiteCount);
    const minW = isPhone ? 26 : 34;
    const whiteKeyW = Math.max(autoW, minW);
    const blackKeyW = Math.round(whiteKeyW * 0.6);
    
    // Font sizes
    const base = Math.min(Math.round(minDim * 0.022), 16);
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--header-h', headerH + 'px');
    root.style.setProperty('--controls-h', controlsH + 'px');
    root.style.setProperty('--bottom-h', bottomH + 'px');
    root.style.setProperty('--keyboard-h', keyboardH + 'px');
    root.style.setProperty('--bend-w', bendW + 'px');
    root.style.setProperty('--white-key-w', whiteKeyW + 'px');
    root.style.setProperty('--black-key-w', blackKeyW + 'px');
    root.style.setProperty('--font-xs', (base * 0.7) + 'px');
    root.style.setProperty('--font-sm', (base * 0.85) + 'px');
    root.style.setProperty('--font-md', base + 'px');
    root.style.setProperty('--font-lg', (base * 1.2) + 'px');
    root.style.setProperty('--font-xl', (base * 1.5) + 'px');
    
    return {
      vw, vh, isLandscape, isPhone, isTablet, isDesktop,
      headerH, controlsH, bottomH, keyboardH,
      bendW, whiteKeyW, blackKeyW, octaves,
      showBendStrip: bendW > 0,
      showBendHorizontal: !isLandscape && isPhone,
      controlsRows: (isPhone && !isLandscape) ? 2 : 1,
      bottomRows: (isPhone && !isLandscape) ? 2 : 1,
      logoText: isPhone ? 'SP MIDI' : 'StudioPro MIDI',
      showRangeInHeader: isDesktop || isTablet,
      fontBase: base,
    };
  };
  
  const [layout, setLayout] = useState(calculate);
  
  useEffect(() => {
    const update = () => setLayout(calculate());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    // screen.orientation is not supported in all browsers, fallback to orientationchange
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', update);
    }
    
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', update);
      }
    };
  }, []);
  
  return layout;
}
