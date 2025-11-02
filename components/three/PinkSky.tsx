// FIX: All errors in this file are due to TypeScript not recognizing @react-three/fiber's custom JSX elements.
// The triple-slash directive below explicitly loads the type definitions for @react-three/fiber,
// which augments the JSX namespace and makes the compiler aware of elements like <mesh>, <color>, etc.
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
                    color1: { value: new THREE.Color("#ff69b4") }, // HotPink
                    color2: { value: new THREE.Color("#9400d3") }, // DarkViolet
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

                    // 2D Random
                    float random (in vec2 st) {
                        return fract(sin(dot(st.xy,
                                             vec2(12.9898,78.233)))
                                     * 43758.5453123);
                    }

                    // 2D Noise
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
                        float frequency = 0.;
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
                        
                        float noise = fbm(st + f) + fbm(st + q);

                        vec3 color = mix(color1, color2, smoothstep(0.3, 0.7, noise));
                        
                        gl_FragColor = vec4(color, noise * 0.4);
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