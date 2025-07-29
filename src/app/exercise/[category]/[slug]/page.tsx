"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function ARModel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");
    containerRef.current?.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Modelo
    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let modelPlaced = false;
    let modelMinY = 0;

    const loader = new GLTFLoader();
    loader.load(
      "/models/Sumo_high_pull.glb",
      (gltf) => {
        console.log("Modelo carregado");

        model = gltf.scene;
        scene.add(model);

        // Ajuste de escala
        const box = new THREE.Box3().setFromObject(model);
        const height = box.max.y - box.min.y;
        modelMinY = box.min.y;
        const desiredHeight = 1.7;
        const scale = desiredHeight / height;
        model.scale.setScalar(scale);

        // Animação
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
        }

        // Fallback: posiciona à frente da câmera
        model.position.set(0, 0, -1);
        model.visible = true;
      },
      undefined,
      (error) => {
        console.error("Erro ao carregar o modelo:", error);
      }
    );

    // Detecção de plano
    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;

    renderer.xr.addEventListener("sessionstart", () => {
  void (async () => {
    const session = renderer.xr.getSession();
    if (!session) return;

    const viewerSpace = await session.requestReferenceSpace("viewer");
    const hitTestSourceMaybe = await session.requestHitTestSource?.({ space: viewerSpace });
    hitTestSource = hitTestSourceMaybe ?? null;

    if (!hitTestSource) {
      console.warn("Hit test source não disponível.");
    }

    localSpace = await session.requestReferenceSpace("local-floor");
  })();
});



    renderer.setAnimationLoop((timestamp, frame) => {
      if (model && frame && !modelPlaced && hitTestSource && localSpace) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults[0]) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(localSpace);
          if (pose) {
            model.position.set(pose.transform.position.x, modelMinY, pose.transform.position.z);
            model.quaternion.set(
              pose.transform.orientation.x,
              pose.transform.orientation.y,
              pose.transform.orientation.z,
              pose.transform.orientation.w
            );
            modelPlaced = true;
          }
        }
      }

      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    });

    // TOQUE: mover em X e Z
    let isTouching = false;
    let startX = 0;
    let startY = 0;
    const sensitivity = 0.005;

    const onTouchStart = (event: TouchEvent) => {
      if (!model || !model.visible || event.touches.length !== 1) return;
      isTouching = true;
      if(event.touches[0]) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }
      
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTouching || !model || event.touches.length !== 1) return;
      if(event.touches[0]) {
        const deltaX = event.touches[0].clientX - startX;
        const deltaY = event.touches[0].clientY - startY;
        model.position.x += deltaX * sensitivity;
        model.position.z += deltaY * sensitivity;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      } 
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("touchstart", onTouchStart);
    dom.addEventListener("touchmove", onTouchMove);
    dom.addEventListener("touchend", onTouchEnd);
    dom.addEventListener("touchcancel", onTouchEnd);

    return () => {
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      dom.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
