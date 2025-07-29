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
    let modelMinY = 0; // para ajuste da base
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;
      scene.add(model);
      model.visible = false;

      // Ajustar escala para altura desejada
      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      modelMinY = box.min.y;
      const desiredHeight = 1.7;
      const scale = desiredHeight / height;
      model.scale.setScalar(scale);

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
      }
    });

    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;
    let modelPlaced = false;

    renderer.xr.addEventListener("sessionstart", () => {
      void (async () => {
        const session = renderer.xr.getSession();
        if (!session) return;

        const viewerSpace = await session.requestReferenceSpace("viewer");

        if (typeof session.requestHitTestSource === "function") {
          hitTestSource = (await session.requestHitTestSource({ space: viewerSpace })) ?? null;
        } else {
          console.warn("requestHitTestSource is not supported in this session.");
          hitTestSource = null;
        }

        localSpace = await session.requestReferenceSpace("local-floor");
      })();
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (model && !modelPlaced && frame && hitTestSource && localSpace) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          if(hitTestResults[0]) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(localSpace);
            if (pose) {
              model.position.set(pose.transform.position.x, modelMinY, pose.transform.position.z);
              model.quaternion.set(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
              model.visible = true;
              modelPlaced = true; 
            }
          }
         
        }
      }
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    });

    // TOQUE: mover modelo apenas em X e Z (não altera Y)
    let isTouching = false;
    let startX = 0;
    let startY = 0;
    const sensitivity = 0.005;

    const onTouchStart = (event: TouchEvent) => {
      if (!model || !modelPlaced || event.touches.length !== 1) return;
      isTouching = true;
      if (event.touches[0]) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!model || !isTouching || event.touches.length !== 1) return;
      if (event.touches[0]) {
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
