import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const [state, setState] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isPortrait: false,
    isLandscape: false,
    breakpoint: 'desktop' as Breakpoint,
  });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h > w;
      
      const breakpoint: Breakpoint = w < 640 ? 'mobile' 
                  : w < 1024 ? 'tablet' 
                  : 'desktop';

      setState({
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        isPortrait,
        isLandscape: !isPortrait,
        breakpoint,
      });
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return state;
}
