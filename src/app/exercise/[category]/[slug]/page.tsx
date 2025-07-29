"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function ARModel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");
    containerRef.current?.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;
      model.visible = true;

      model.position.set(0, 0, -3); // Coloca na frente do usuário
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      const scale = 1.7 / height;
      model.scale.setScalar(scale);

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer!.clipAction(clip).play();
        });
      }
    });

    // Animação de renderização
    renderer.setAnimationLoop(() => {
      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    });

    // TOQUE: mover modelo apenas no plano X e Y
    let isTouching = false;
    let startX = 0;
    let startY = 0;

    const sensitivity = 0.005;

    const onTouchStart = (event: TouchEvent) => {
      if (!model || event.touches.length !== 1) return;
      isTouching = true;
      if(event.touches[0]) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }
      
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!model || !isTouching) return;
      if(event.touches[0]) {
        const deltaX = event.touches[0].clientX - startX;
        const deltaY = event.touches[0].clientY - startY;

        model.position.x += deltaX * sensitivity;
        model.position.y -= deltaY * sensitivity; 

        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }
    };

    const onTouchEnd = () => (isTouching = false);

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
