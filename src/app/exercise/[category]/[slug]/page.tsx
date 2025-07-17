"use client";

import { useEffect, useRef } from "react";
import type { Matrix4, Group, AnimationClip, AnimationMixer } from "three";
import type * as THREEType from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


type ARjsSource = {
  ready: boolean;
  domElement: HTMLVideoElement;
  init: (callback: () => void) => void; // Adicione isto
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

          const clock = new THREE.Clock();
          let mixer: AnimationMixer | null = null;
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
           renderer.domElement.style.position = "absolute";
          renderer.domElement.style.top = "0";
          renderer.domElement.style.left = "0";
          renderer.domElement.style.zIndex = "1";
          container.appendChild(renderer.domElement);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
          scene.add(camera);

          window.addEventListener("resize", () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
          });

          // Luz ambiente fraca (suaviza sombras)
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);

          // Luz direcional (simula o sol)
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(1, 1, 1); // direção da luz
          scene.add(directionalLight);

          // Fonte e contexto AR.js
          const arSource: ARjsSource = new ARjs.Source({ sourceType: "webcam" });
          arSource.init(() => {
            const video = arSource.domElement;
            if (video instanceof HTMLVideoElement) {
              video.style.position = "absolute";
              video.style.top = "0";
              video.style.left = "0";
              video.style.width = "100%";
              video.style.height = "100%";
              video.style.objectFit = "cover";
              video.style.zIndex = "0";
              container.appendChild(video);
              console.log("🎥 Câmera ativada.");
            }
          });
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
              mixer = new THREE.AnimationMixer(model);
              const clip = gltf.animations[0];
              if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
              }
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

            const delta = clock.getDelta();
            if (mixer) {
              mixer.update(delta);
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