"use client";

import {
  Component,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type VisualNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let webglAvailable: boolean | undefined;

function supportsWebGL() {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    webglAvailable = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglAvailable = false;
  }
  return webglAvailable;
}

export function useVisualCapability() {
  const [capability, setCapability] = useState({
    enabled: false,
    highBudget: false,
  });
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(pointer: fine)");
    const nav = navigator as VisualNavigator;
    const update = () => {
      const constrained =
        nav.connection?.saveData ||
        /^(slow-2g|2g)$/.test(nav.connection?.effectiveType ?? "") ||
        (nav.hardwareConcurrency !== undefined &&
          nav.hardwareConcurrency < 4) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory < 4);
      const enabled =
        desktop.matches &&
        pointer.matches &&
        !motion.matches &&
        !constrained &&
        supportsWebGL();
      setCapability({
        enabled,
        highBudget:
          enabled &&
          nav.hardwareConcurrency >= 8 &&
          (nav.deviceMemory ?? 8) >= 8,
      });
    };
    update();
    desktop.addEventListener("change", update);
    motion.addEventListener("change", update);
    pointer.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
    };
  }, []);
  return capability;
}

export function useElementActive(ref: RefObject<HTMLElement | null>) {
  const [intersecting, setIntersecting] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );
    observer.observe(element);
    const visibility = () => setVisible(document.visibilityState === "visible");
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ref]);
  return intersecting && visible;
}

export class VisualBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
