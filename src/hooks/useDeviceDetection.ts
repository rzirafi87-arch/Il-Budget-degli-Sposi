/**
 * Hook per rilevare il tipo di dispositivo e sistema operativo
 * Supporta: Desktop (Windows, Mac, Linux), Mobile (iOS, Android)
 */

import { useEffect, useState } from "react";

export type DeviceType = "desktop" | "tablet" | "mobile";
export type OSType = "windows" | "macos" | "linux" | "ios" | "android" | "unknown";
export type ViewportSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface DeviceInfo {
  deviceType: DeviceType;
  os: OSType;
  viewportSize: ViewportSize;
  isTouchDevice: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

const detectDevice = (): DeviceInfo => {
  if (typeof window === "undefined") {
    return {
      deviceType: "desktop",
      os: "unknown",
      viewportSize: "lg",
      isTouchDevice: false,
      isPortrait: false,
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Rileva OS
  let os: OSType = "unknown";
  if (/iphone|ipad|ipod/.test(ua)) {
    os = "ios";
  } else if (/android/.test(ua)) {
    os = "android";
  } else if (/mac/.test(ua)) {
    os = "macos";
  } else if (/win/.test(ua)) {
    os = "windows";
  } else if (/linux/.test(ua)) {
    os = "linux";
  }

  // Rileva tipo dispositivo
  let deviceType: DeviceType = "desktop";
  if (width < 768) {
    deviceType = "mobile";
  } else if (width < 1024) {
    deviceType = "tablet";
  }

  // Rileva viewport size (Tailwind breakpoints)
  let viewportSize: ViewportSize = "lg";
  if (width < 640) {
    viewportSize = "xs";
  } else if (width < 768) {
    viewportSize = "sm";
  } else if (width < 1024) {
    viewportSize = "md";
  } else if (width < 1280) {
    viewportSize = "lg";
  } else if (width < 1536) {
    viewportSize = "xl";
  } else {
    viewportSize = "2xl";
  }

  // Rileva touch support
  const isTouchDevice = 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;

  // Orientamento
  const isPortrait = height > width;

  return {
    deviceType,
    os,
    viewportSize,
    isTouchDevice,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    pixelRatio,
  };
};

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());

  useEffect(() => {
    // Update on resize and orientation change
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook semplificato per controlli rapidi
 */
export function useIsMobile(): boolean {
  const { deviceType } = useDeviceDetection();
  return deviceType === "mobile";
}

export function useIsTablet(): boolean {
  const { deviceType } = useDeviceDetection();
  return deviceType === "tablet";
}

export function useIsDesktop(): boolean {
  const { deviceType } = useDeviceDetection();
  return deviceType === "desktop";
}

export function useIsIOS(): boolean {
  const { os } = useDeviceDetection();
  return os === "ios";
}

export function useIsAndroid(): boolean {
  const { os } = useDeviceDetection();
  return os === "android";
}
