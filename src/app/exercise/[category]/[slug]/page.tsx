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
    let previousTouches: TouchList | null = null;

    const onTouchStart = (event: TouchEvent) => {
      isTouching = true;
      previousTouches = event.touches;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTouching || !model || !previousTouches) return;

      const sensitivityXY = 0.005;
      const sensitivityZ = 0.01;

      if (event.touches[0] && previousTouches[0]) {
        const deltaX = event.touches[0].clientX - previousTouches[0].clientX;
        const deltaY = event.touches[0].clientY - previousTouches[0].clientY;

        model.position.x += deltaX * sensitivityXY;
        model.position.y -= deltaY * sensitivityXY;
      }

      if (event.touches.length === 2 && previousTouches.length === 2) {
        const dist = (touches: TouchList) => {
          if (touches[0] && touches[1]) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
          }
        };

        const prevDist = dist(previousTouches);
        const currDist = dist(event.touches);
        let deltaZ = 0;
        if(currDist && prevDist) {
          deltaZ = (currDist - prevDist) * sensitivityZ;
        }
        

        model.position.z += deltaZ;
      }

      previousTouches = event.touches;
    };

    const onTouchEnd = () => {
      isTouching = false;
      previousTouches = null;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("touchstart", onTouchStart);
    domElement.addEventListener("touchmove", onTouchMove);
    domElement.addEventListener("touchend", onTouchEnd);
    domElement.addEventListener("touchcancel", onTouchEnd);

    renderer.setAnimationLoop(() => {
      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.dispose();
      domElement.removeEventListener("touchstart", onTouchStart);
      domElement.removeEventListener("touchmove", onTouchMove);
      domElement.removeEventListener("touchend", onTouchEnd);
      domElement.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
