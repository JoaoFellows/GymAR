"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  interface XRSessionWithHitTest extends XRSession {
    requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
  }

  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    let mixer: THREE.AnimationMixer;
    let model: THREE.Group | null = null;
    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;
    let hitTestRequested = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

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
      model.visible = false; // só aparece quando a superfície for detectada
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && !hitTestRequested) {
        const session = renderer.xr.getSession();
        if (session && typeof (session as XRSessionWithHitTest).requestHitTestSource === "function") {
          session.requestReferenceSpace("viewer").then((refSpace) => {
          (session as XRSessionWithHitTest).requestHitTestSource({ space: refSpace }).then((source: XRHitTestSource) => {
          hitTestSource = source;
          localSpace = renderer.xr.getReferenceSpace();
          });
          });

          session.addEventListener("end", () => {
          hitTestSource = null;
          hitTestRequested = false;
        });

          hitTestRequested = true;
        }
      }

      if (frame && hitTestSource && localSpace && model) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          if (hit) {
            const pose = hit.getPose(localSpace);
            if (pose) {
              model.visible = true;
              model.position.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
              );
              model.rotation.set(0, Math.PI, 0); // opcional: vira o modelo
            }
          }
        }
      }

      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}