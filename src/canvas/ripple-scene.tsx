"use client";

import { Suspense, useEffect, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type RippleProps = {
  src: string;
  pointer: MutableRefObject<{ x: number; y: number }>;
  onReady: () => void;
};

const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uStrength;
  uniform float uImageAspect;
  uniform float uContainerAspect;
  void main() {
    vec2 uv = vUv;
    vec2 direction = uv - uPointer;
    vec2 aspectDirection = direction * vec2(uContainerAspect, 1.0);
    float distance = length(aspectDirection);
    float ripple = sin(distance * 38.0 - uTime * 3.4) * exp(-distance * 5.7) * .007 * uStrength;
    uv += normalize(direction + .0001) * ripple;
    if (uImageAspect > uContainerAspect) uv.x = (uv.x - .5) * uContainerAspect / uImageAspect + .5;
    else uv.y = (uv.y - .5) * uImageAspect / uContainerAspect + .5;
    gl_FragColor = texture2D(uImage, uv);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function RipplePlane({ src, pointer, onReady }: RippleProps) {
  const texture = useLoader(THREE.TextureLoader, src);
  const { viewport, size } = useThree();
  const uniforms = useMemo(
    () => ({
      uImage: { value: texture },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uImageAspect: { value: 1 },
      uContainerAspect: { value: 1 },
    }),
    [texture],
  );
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    const image = texture.image as { width: number; height: number };
    uniforms.uImageAspect.value = image.width / image.height;
    onReady();
  }, [texture, uniforms, onReady]);
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    uniforms.uTime.value += step;
    uniforms.uStrength.value = THREE.MathUtils.damp(
      uniforms.uStrength.value,
      1,
      3,
      step,
    );
    uniforms.uContainerAspect.value = size.width / size.height;
    uniforms.uPointer.value.x = THREE.MathUtils.damp(
      uniforms.uPointer.value.x,
      pointer.current.x,
      5,
      step,
    );
    uniforms.uPointer.value.y = THREE.MathUtils.damp(
      uniforms.uPointer.value.y,
      pointer.current.y,
      5,
      step,
    );
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function RippleCanvas(props: RippleProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 1 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <RipplePlane {...props} />
      </Suspense>
    </Canvas>
  );
}
