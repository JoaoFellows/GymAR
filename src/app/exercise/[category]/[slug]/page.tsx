"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const desiredHeight = 1.75;
  const containerRef = useRef<HTMLDivElement>(null);

  interface XRSessionWithHitTest extends XRSession {
    requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
  }

  useEffect(() => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  let mixer: THREE.AnimationMixer;
  let model: THREE.Group | null = null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

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

    // Ajuste a escala para simular altura de ~1.75m
    const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
    const modelHeight = boundingBox.max.y - boundingBox.min.y;
    const scale = desiredHeight / modelHeight;

    model.scale.setScalar(scale);

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  });

  renderer.setAnimationLoop(() => {
    if (model) {
      const cameraMatrix = new THREE.Matrix4().copy(renderer.xr.getCamera().matrixWorld);
      const position = new THREE.Vector3(0, -desiredHeight / 2, -1); // 1 metro à frente da câmera
      position.applyMatrix4(cameraMatrix);

      model.position.copy(position);

      // Faz o modelo sempre olhar na mesma direção da câmera
      model.quaternion.copy(renderer.xr.getCamera().quaternion);
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