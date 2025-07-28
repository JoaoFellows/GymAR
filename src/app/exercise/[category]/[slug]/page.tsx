"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desiredHeight = 1.75;

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    let mixer: THREE.AnimationMixer;
    let model: THREE.Group | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current?.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;

      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const scale = desiredHeight / modelHeight;

      model.scale.setScalar(scale);
      model.position.set(0, 0, -2); // posição inicial
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    });

    let isTouching = false;
    let previousTouchX = 0;
    let previousTouchY = 0;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1 && event.touches[0]) {
        isTouching = true;
        previousTouchX = event.touches[0].clientX;
        previousTouchY = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTouching || !model || event.touches.length !== 1) return;

      if(event.touches[0]) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - previousTouchX;
        const deltaY = touch.clientY - previousTouchY;

        // Sensibilidade ajustável
        const sensitivity = 0.005;

        model.position.x += deltaX * sensitivity;
        model.position.y -= deltaY * sensitivity; // Invertido porque o Y da tela cresce para baixo

        previousTouchX = touch.clientX;
        previousTouchY = touch.clientY;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("touchstart", onTouchStart);
    domElement.addEventListener("touchmove", onTouchMove);
    domElement.addEventListener("touchend", onTouchEnd);

    renderer.setAnimationLoop(() => {
      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.dispose();
      domElement.removeEventListener("touchstart", onTouchStart);
      domElement.removeEventListener("touchmove", onTouchMove);
      domElement.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}