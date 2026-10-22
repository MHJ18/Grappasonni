import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);
CustomEase.create("smoothOut", ".22,1,.36,1");
CustomEase.create("snap", ".65,0,.35,1");
export const motionTokens = {
  smooth: "smoothOut",
  snap: "snap",
  stagger: 0.06,
  ui: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
