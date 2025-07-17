"use client";

import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type { Matrix4, Group } from "three"; // ✅ import de tipo

type ARjsSource = {
  ready: boolean;
  domElement: HTMLVideoElement;
};

type ARjsContext = {
  init: (callback: () => void) => void;
  update: (video: HTMLVideoElement) => void;
  getProjectionMatrix: () => Matrix4; // ✅ uso do tipo correto
};

type ARjs = {
  Source: new (params: Record<string, unknown>) => ARjsSource;
  Context: new (params: Record<string, unknown>) => ARjsContext;
};

declare global {
  interface Window {
    ARjs: ARjs;
    THREE: typeof import("three");
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Carrega THREE.js primeiro
    const threeScript = document.createElement("script");
    threeScript.src = "https://cdn.jsdelivr.net/npm/three@0.110.0/build/three.min.js";
    threeScript.onload = () => {
      // Depois carrega AR.js
      const arScript = document.createElement("script");
      arScript.src = "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/build/ar-threex.js";
      arScript.onload = () => {
        const ARjs = window.ARjs;
        const THREE = window.THREE;

        if (!ARjs || !THREE) {
          console.error("❌ ARjs ou THREE não carregados corretamente.");
          return;
        }

        console.log("✅ AR.js e THREE carregados.");

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        scene.add(camera);

        const arSource = new ARjs.Source({ renderer, camera });
        const arContext = new ARjs.Context({
          cameraParametersUrl: "/camera_para.dat", // coloque em /public
          detectionMode: "mono",
        });

        arContext.init(() => {
          camera.projectionMatrix.copy(arContext.getProjectionMatrix());
        });

        let model: Group | null = null;
        const loader = new GLTFLoader();
        loader.load("/models/Sumo_high_pull.glb",
          (gltf) => {
            model = gltf.scene;
            model.scale.set(0.2, 0.2, 0.2);
            scene.add(model);
            console.log("✅ Modelo GLB carregado");
          },
          undefined,
          (error) => {
            console.error("Erro ao carregar modelo:", error);
          }
        );

        const animate = () => {
          requestAnimationFrame(animate);
          if (arSource.ready) {
            arContext.update(arSource.domElement);
          }

          if (model) {
            model.position.set(0, 0, -1);
            model.quaternion.copy(camera.quaternion);
          }

          renderer.render(scene, camera);
        };

        animate();
      };

      document.body.appendChild(arScript);
    };

    document.body.appendChild(threeScript);

    // Cleanup
    return () => {
      container.innerHTML = "";
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
        backgroundColor: "black",
      }}
    />
  );
}
