"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type ARjsSource = {
  ready: boolean;
  domElement: HTMLVideoElement;
};

type ARjsContext = {
  init: (callback: () => void) => void;
  update: (video: HTMLVideoElement) => void;
  getProjectionMatrix: () => THREE.Matrix4;
};

type ARjs = {
  Source: new (params: any) => ARjsSource;
  Context: new (params: any) => ARjsContext;
};

declare global {
  interface Window {
    ARjs: ARjs;
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/build/ar-threex.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const ARjs = window.ARjs;
      if (!ARjs) {
        console.error("ARjs não carregado");
        return;
      }

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      const container = containerRef.current;
      if (!container) return;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      scene.add(camera);

      const arSource = new ARjs.Source({ renderer, camera });
      const arContext = new ARjs.Context({
        cameraParametersUrl:
          "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat",
        detectionMode: "mono",
      });

      arContext.init(() => {
        camera.projectionMatrix.copy(arContext.getProjectionMatrix());
      });

      let model: THREE.Group | null = null;
      const loader = new GLTFLoader();
      loader.load("/models/Sumo_high_pull.glb", (gltf) => {
        model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);
        scene.add(model);
      });

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

    return () => {
      script.remove();
      const container = containerRef.current;
      if (container) container.innerHTML = "";
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
