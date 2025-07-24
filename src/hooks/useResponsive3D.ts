import { useState, useEffect } from 'react';

interface Responsive3DConfig {
  enableParticles: boolean;
  enableComplexShapes: boolean;
  particleCount: number;
  animationQuality: 'low' | 'medium' | 'high';
  enableInteraction: boolean;
}

const useResponsive3D = (): Responsive3DConfig => {
  const [config, setConfig] = useState<Responsive3DConfig>({
    enableParticles: true,
    enableComplexShapes: true,
    particleCount: 200,
    animationQuality: 'high',
    enableInteraction: true,
  });

  useEffect(() => {
    const detectDeviceCapabilities = () => {
      // Check if WebGL is supported
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        // No WebGL support - disable all 3D effects
        setConfig({
          enableParticles: false,
          enableComplexShapes: false,
          particleCount: 0,
          animationQuality: 'low',
          enableInteraction: false,
        });
        return;
      }

      // Device detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent) && window.innerWidth >= 768;
      
      // Performance detection
      const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
      const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Screen size detection
      const screenArea = window.innerWidth * window.innerHeight;
      const isLargeScreen = screenArea > 1920 * 1080;
      const isSmallScreen = screenArea < 1024 * 768;

      // Battery API (if available)
      const battery = (navigator as any).battery || (navigator as any).getBattery?.();
      const isLowBattery = battery?.level < 0.2 || false;

      // Connection speed detection
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';

      // Calculate performance score
      let performanceScore = 0;
      
      // Base score from hardware
      performanceScore += Math.min(memory * 10, 40); // Max 40 points for memory
      performanceScore += Math.min(cores * 5, 20);   // Max 20 points for cores
      
      // Screen adjustments
      if (isLargeScreen) performanceScore += 20;
      if (isSmallScreen) performanceScore -= 10;
      
      // Device type adjustments
      if (isMobile) performanceScore -= 30;
      if (isTablet) performanceScore -= 15;
      
      // Other factors
      if (pixelRatio > 2) performanceScore -= 10; // High DPI screens need more power
      if (isLowBattery) performanceScore -= 20;
      if (isSlowConnection) performanceScore -= 15;

      // Determine configuration based on performance score
      let newConfig: Responsive3DConfig;

      if (performanceScore >= 70) {
        // High performance - full effects
        newConfig = {
          enableParticles: true,
          enableComplexShapes: true,
          particleCount: isLargeScreen ? 300 : 200,
          animationQuality: 'high',
          enableInteraction: true,
        };
      } else if (performanceScore >= 40) {
        // Medium performance - reduced effects
        newConfig = {
          enableParticles: true,
          enableComplexShapes: true,
          particleCount: isMobile ? 50 : 100,
          animationQuality: 'medium',
          enableInteraction: !isMobile,
        };
      } else if (performanceScore >= 20) {
        // Low performance - minimal effects
        newConfig = {
          enableParticles: true,
          enableComplexShapes: false,
          particleCount: 30,
          animationQuality: 'low',
          enableInteraction: false,
        };
      } else {
        // Very low performance - disable most effects
        newConfig = {
          enableParticles: false,
          enableComplexShapes: false,
          particleCount: 0,
          animationQuality: 'low',
          enableInteraction: false,
        };
      }

      // Additional mobile-specific optimizations
      if (isMobile) {
        newConfig.particleCount = Math.min(newConfig.particleCount, 50);
        newConfig.enableInteraction = false;
        
        // Disable effects on very small screens
        if (window.innerWidth < 480) {
          newConfig.enableParticles = false;
          newConfig.enableComplexShapes = false;
        }
      }

      setConfig(newConfig);
    };

    // Initial detection
    detectDeviceCapabilities();

    // Re-detect on resize (orientation change, etc.)
    const handleResize = () => {
      setTimeout(detectDeviceCapabilities, 100); // Small delay to ensure accurate measurements
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Listen for battery changes if supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const handleBatteryChange = () => {
          if (battery.level < 0.2) {
            setConfig(prev => ({
              ...prev,
              particleCount: Math.min(prev.particleCount, 30),
              animationQuality: 'low',
              enableInteraction: false,
            }));
          }
        };
        
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return config;
};

export default useResponsive3D;