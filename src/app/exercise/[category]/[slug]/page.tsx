"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/build/ar-threex.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      const ARjs = window.ARjs;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current?.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      scene.add(camera);

      // Inicializa AR.js
      // @ts-ignore
      const arSource = new ARjs.Source({ renderer, camera });
      // @ts-ignore
      const arContext = new ARjs.Context({ cameraParametersUrl: "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat", detectionMode: "mono" });
      arContext.init(() => camera.projectionMatrix.copy(arContext.getProjectionMatrix()));

      // Modelo 3D
      let model: THREE.Group | null = null;
      const loader = new GLTFLoader();
      loader.load("/models/Sumo_high_pull.glb", (gltf) => {
        model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);
        scene.add(model);
      });

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (arSource.ready) arContext.update(arSource.domElement);

        // Posiciona o modelo sempre à frente da câmera
        if (model) {
          // Z positivo é para frente da câmera
          model.position.set(0, 0, -1); // 1 metro à frente
          model.quaternion.copy(camera.quaternion); // Segue a rotação da câmera
        }

        renderer.render(scene, camera);
      };
      animate();
    };

    return () => {
      script.remove();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}