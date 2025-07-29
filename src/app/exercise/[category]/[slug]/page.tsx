"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desiredHeight = 1.75;
  const [modelPlaced, setModelPlaced] = useState(false);

  interface XRSessionWithHitTest extends XRSession {
    requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
  }

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    containerRef.current?.appendChild(renderer.domElement);
    document.body.appendChild(
      ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
    );

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      const scale = desiredHeight / height;
      model.scale.setScalar(scale);
      model.visible = false;

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer?.clipAction(clip).play();
      });

      scene.add(model);
    });

    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;
    let hitTestRequested = false;

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && !hitTestRequested) {
        const session = renderer.xr.getSession();
        if (
          session &&
          typeof (session as XRSessionWithHitTest).requestHitTestSource === "function"
        ) {
          session
            .requestReferenceSpace("viewer")
            .then((refSpace) => {
              return (session as XRSessionWithHitTest)
                .requestHitTestSource({ space: refSpace })
                .then((source: XRHitTestSource) => {
                  hitTestSource = source;
                  localSpace = renderer.xr.getReferenceSpace();
                  hitTestRequested = true;

                  session.addEventListener("end", () => {
                    hitTestSource = null;
                    hitTestRequested = false;
                    setModelPlaced(false);
                  });
                });
            })
            .catch((err) => console.error("Erro ao requisitar hit test:", err));
        }
      }

      if (frame && hitTestSource && localSpace && model && !modelPlaced) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0 && hitTestResults[0]) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(localSpace);
          if (pose) {
            model.visible = true;
            model.position.set(
              pose.transform.position.x,
              pose.transform.position.y,
              pose.transform.position.z
            );
            model.rotation.set(0, Math.PI, 0);
            setModelPlaced(true);
          }
        }
      }

      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    });

    // TOUCH CONTROLS - apenas movimentação x/y
    let isTouching = false;
    let previousX = 0;
    let previousY = 0;

    const domElement = renderer.domElement;

    const onTouchStart = (event: TouchEvent) => {
      if (!modelPlaced || event.touches.length !== 1) return;
      isTouching = true;
      if (event.touches[0]) {
        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!model || !isTouching || event.touches.length !== 1) return;
      if (event.touches[0]) {
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