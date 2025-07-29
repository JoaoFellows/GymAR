"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelPlaced, setModelPlaced] = useState(false);

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    containerRef.current?.appendChild(renderer.domElement);
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const clock = new THREE.Clock();
    const desiredHeight = 1.75;

    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;

      // Escalar modelo para altura desejada
      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      const scale = desiredHeight / height;
      model.scale.setScalar(scale);

      model.visible = false;
      scene.add(model);

      // Verificar se há animações
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          const action = mixer!.clipAction(clip);
          action.play();
        });
      } else {
        console.warn("Nenhuma animação encontrada no GLB.");
      }
    });

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
              model.visible = true;
              model.position.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
              );
              setModelPlaced(true);
            }
          }
        }
      }

      if (mixer) mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    });

    // TOUCH MOVE
    let isTouching = false;
    let previousX = 0;
    let previousY = 0;

    const onTouchStart = (event: TouchEvent) => {
      if (!modelPlaced || event.touches.length !== 1) return;
      isTouching = true;
      if(event.touches[0]) {
        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
      }
     
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!model || !isTouching || event.touches.length !== 1) return;
      if(event.touches[0]) {
        const deltaX = event.touches[0].clientX - previousX;
        const deltaY = event.touches[0].clientY - previousY;

        const sensitivity = 0.005;
        model.position.x += deltaX * sensitivity;
        model.position.z += deltaY * sensitivity;

        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("touchstart", onTouchStart);
    domElement.addEventListener("touchmove", onTouchMove);
    domElement.addEventListener("touchend", onTouchEnd);
    domElement.addEventListener("touchcancel", onTouchEnd);

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