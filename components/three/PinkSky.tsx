// FIX: Add a triple-slash directive to include TypeScript definitions for @react-three/fiber.
// This allows TypeScript to recognize custom JSX elements from the library, such as <mesh> and <color>.
/// <reference types="@react-three/fiber" />
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const SkyBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#2e0b2a']} />
        <ambientLight intensity={0.1} />
        <Stars radius={150} depth={60} count={8000} factor={4} saturation={0} fade speed={1} />
        <PinkSpaceNebula />
      </Canvas>
    </div>
  );
};

const PinkSpaceNebula: React.FC = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh>
            <sphereGeometry args={[7, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={{
                    time: { value: 0 },
                    color1: { value: new THREE.Color("#FF7E5F") }, // Warm orange
                    color2: { value: new THREE.Color("#6A11CB") }, // Soft violet sky
                }}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform float time;
                    uniform vec3 color1;
                    uniform vec3 color2;
                    varying vec2 vUv;

                    float random (in vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                    }

                    float noise (in vec2 st) {
                        vec2 i = floor(st);
                        vec2 f = fract(st);

                        float a = random(i);
                        float b = random(i + vec2(1.0, 0.0));
                        float c = random(i + vec2(0.0, 1.0));
                        float d = random(i + vec2(1.0, 1.0));

                        vec2 u = f * f * (3.0 - 2.0 * f);
                        return mix(a, b, u.x) +
                                (c - a)* u.y * (1.0 - u.x) +
                                (d - b) * u.x * u.y;
                    }

                    #define OCTAVES 6
                    float fbm (in vec2 st) {
                        float value = 0.0;
                        float amplitude = .5;
                        for (int i = 0; i < OCTAVES; i++) {
                            value += amplitude * noise(st);
                            st *= 2.;
                            amplitude *= .5;
                        }
                        return value;
                    }

                    void main() {
                        vec2 st = vUv * 3.0;
                        st.x += time * 0.02;
                        
                        float f = fbm(st + time * 0.1);
                        float q = fbm(st - time * 0.05);
                        
                        float n = fbm(st + f) + fbm(st + q);

                        // Gradient 느낌 강화
                        float gradient = smoothstep(0.2, 0.8, vUv.y);
                        vec3 baseColor = mix(color1, color2, gradient);

                        vec3 color = mix(baseColor, color2, smoothstep(0.3, 0.7, n));
                        gl_FragColor = vec4(color, 0.6);
                    }
                `}
                transparent={true}
                blending={THREE.AdditiveBlending}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

export default SkyBackground;