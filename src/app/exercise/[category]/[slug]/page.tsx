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

    document.body.appendChild(
      ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
    );

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let hitTestSource: XRHitTestSource | null = null;
    let hitTestSourceRequested = false;
    let modelPlaced = false;
    const clock = new THREE.Clock();

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene;
      model.visible = false;

      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      const scale = 1.7 / height; // Altura real desejada em metros (1.70m)
      model.scale.setScalar(scale);

      const minY = box.min.y * scale;
      model.position.y = -minY;

      scene.add(model);

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          const action = mixer!.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play(); // Inicia a animação automaticamente
        });
      }
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (mixer) {
        mixer.update(clock.getDelta());
      }

      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested) {
          void session?.requestReferenceSpace("viewer").then((viewerSpace) => {
            void session?.requestHitTestSource?.({ space: viewerSpace })?.then((source) => {
              hitTestSource = source ?? null;
            });
          });
          hitTestSourceRequested = true;
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            if (hit) {
              const pose = hit.getPose(referenceSpace!);
              if (pose) {
                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    });

    let isTouching = false;
    let startX = 0;
    const rotateSensitivity = 0.005;

    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length !== 1) return;
      if (event.touches[0]) {
        isTouching = true;
        startX = event.touches[0].clientX;

        if (!modelPlaced && model && reticle.visible) {
          model.position.setFromMatrixPosition(reticle.matrix);
          model.visible = true;
          modelPlaced = true;
          reticle.visible = false;
        }
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (!model || !isTouching || !modelPlaced) return;
      if (event.touches[0]) {
        const deltaX = event.touches[0].clientX - startX;
        model.rotation.y += deltaX * rotateSensitivity;
        startX = event.touches[0].clientX;
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

  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh", position: "relative" }}>
    </div>
  );
}
