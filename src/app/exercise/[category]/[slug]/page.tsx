"use client";

import { useEffect, useRef } from "react";
import type { Matrix4, Group, AnimationClip } from "three";
import type * as THREEType from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


type ARjsSource = {
  ready: boolean;
  domElement: HTMLVideoElement;
};

type GLTFResult = {
  scene: Group;
  scenes: Group[];
  animations: AnimationClip[];
  [key: string]: unknown;
};

type ARjsContext = {
  init: (callback: () => void) => void;
  update: (video: HTMLVideoElement) => void;
  getProjectionMatrix: () => Matrix4;
};

type ARjs = {
  Source: new (params: Record<string, unknown>) => ARjsSource;
  Context: new (params: Record<string, unknown>) => ARjsContext;
};

declare global {
  interface Window {
    ARjs: ARjs;
    THREE: typeof THREEType;
    AR?: ARjs;
    ARJS?: ARjs;
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Carrega THREE.js
    const threeScript = document.createElement("script");
    threeScript.src = "https://cdn.jsdelivr.net/npm/three@0.110.0/build/three.min.js";

    threeScript.onload = () => {
      window.THREE = window.THREE || (window as unknown as { THREE: typeof THREEType }).THREE;

      // Carrega AR.js (Three.js + marker tracking)
      const arScript = document.createElement("script");
      arScript.src = "https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar.js";

      arScript.onload = () => {
        // Carrega GLTFLoader
        const gltfLoaderScript = document.createElement("script");
        gltfLoaderScript.src = "https://cdn.jsdelivr.net/npm/three@0.110.0/examples/js/loaders/GLTFLoader.js";

        gltfLoaderScript.onload = () => {
          const THREE = window.THREE;
          const ARjs = window.ARjs || window.AR || window.ARJS || null;

          console.log("🔧 Scripts carregados:", { THREE, ARjs, AR: window.AR, ARJS: window.ARJS });

          if (!THREE) {
            console.error("❌ THREE não carregado.");
            return;
          }
          // Tipagem segura para GLTFLoader
          const GLTFLoaderCtor = (window.THREE as typeof THREEType & { GLTFLoader: new () => GLTFLoader }).GLTFLoader;
          if (!GLTFLoaderCtor) {
            console.error("❌ GLTFLoader não carregado.");
            return;
          }
          if (!ARjs) {
            console.error("❌ ARjs não carregado. Teste window.AR e window.ARJS no console.");
            return;
          }

          // Setup básico da cena
          const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setClearColor(0x000000, 0);
          container.appendChild(renderer.domElement);

          const scene = new THREE.Scene();
          const camera = new THREE.Camera();
          scene.add(camera);

          let arVideoTries = 0;
          const arVideoMaxTries = 300; // 300 tentativas x 100ms = 30s
          // Fonte e contexto AR.js
          const arSource: ARjsSource = new ARjs.Source({ renderer, camera });
          //container.appendChild(arSource.domElement);
          const appendARVideo = () => {
          if (arSource.domElement instanceof Node) {
            container.appendChild(arSource.domElement);
            console.warn("arSource.domElement BOA:", arSource.domElement);
          } else if (arVideoTries < arVideoMaxTries) {
            arVideoTries++;
            setTimeout(appendARVideo, 100);
          } else {
            console.error("❌ Falha ao obter acesso à câmera: arSource.domElement não foi criado após 10s.");
          }
        };
        appendARVideo();
          const arContext: ARjsContext = new ARjs.Context({
            cameraParametersUrl: "/data/camera_para.dat",
            detectionMode: "mono",
          });

          arContext.init(() => {
            camera.projectionMatrix.copy(arContext.getProjectionMatrix());
          });

          // Carrega modelo GLB usando o loader global
          let model: Group | null = null;
          const loader = new GLTFLoaderCtor();
          loader.load(
            "/models/Sumo_high_pull.glb",
            (gltf: GLTFResult) => {
              model = gltf.scene;
              model.scale.set(0.2, 0.2, 0.2);
              scene.add(model);
              console.log("✅ Modelo carregado");
            },
            undefined,
            (err: ErrorEvent) => console.error("❌ Erro ao carregar GLB:", err)
          );

          // Loop de renderização
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

        gltfLoaderScript.onerror = () => {
          console.error("❌ Falha ao carregar GLTFLoader");
        };
        document.body.appendChild(gltfLoaderScript);
      };

      arScript.onerror = () => {
        console.error("❌ Falha ao carregar AR.js");
      };
      document.body.appendChild(arScript);
    };

    threeScript.onerror = () => {
      console.error("❌ Falha ao carregar THREE.js");
    };
    document.body.appendChild(threeScript);

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
        backgroundColor: "white",
      }}
    />
  );
}