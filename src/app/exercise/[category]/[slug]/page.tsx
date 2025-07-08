"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    let mixer: THREE.AnimationMixer;
    let model: THREE.Group | null = null;
    let isDragging = false;
    let previousX = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current?.appendChild(renderer.domElement);

    document.body.appendChild(
      ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
    );

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;
      model.scale.set(0.2, 0.2, 0.2);
      model.position.set(0, 0, -0.5);
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    });

    // Mouse event handlers
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { 
        isDragging = true;
        previousX = event.clientX;
      }

      else isDragging = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging && model) {
        const deltaX = event.clientX - previousX;
        model.rotation.y += deltaX * 0.01;
        previousX = event.clientX;
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      isDragging = false;
    };

    // Attach listeners after domElement is in the DOM
    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    domElement.addEventListener("mousemove", onMouseMove);
    domElement.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("mouseleave", onMouseUp);
    domElement.addEventListener("contextmenu", (e) => e.preventDefault());

    renderer.setAnimationLoop(() => {
      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.dispose();
      domElement.removeEventListener("mousedown", onMouseDown);
      domElement.removeEventListener("mousemove", onMouseMove);
      domElement.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("mouseleave", onMouseUp);
      domElement.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}