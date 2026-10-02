"use client";

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#efe8dc", "#6a5c4a", 0.62]} />
      <directionalLight
        castShadow
        position={[2.8, 3.6, 4.2]}
        intensity={1.15}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight
        position={[-2.4, 0.8, 1.6]}
        intensity={0.22}
        color="#c4b49a"
      />
    </>
  );
}
