"use client";

import { useEffect, useRef } from "react";
import {
  type AnimationClip,
  AnimationMixer,
  type Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    let mixer: AnimationMixer;
    let model: Group | null = null;
    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;
    let hitTestRequested = false;

    const scene = new Scene();
    const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current?.appendChild(renderer.domElement);

    document.body.appendChild(
      ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
    );

    const light = new HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load("/models/Sumo_high_pull.glb", (gltf) => {
      model = gltf.scene as Group;
      model.scale.set(0.2, 0.2, 0.2);
      model.visible = false;
      scene.add(model);

      mixer = new AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        if (mixer && clip) {
          const animationClip = clip as AnimationClip;
          mixer.clipAction(animationClip).play();
        }
      });
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && !hitTestRequested) {
        const session = renderer.xr.getSession();
        if (session) {
          void session.requestReferenceSpace("viewer").then((refSpace) => {
            // Type assertion for WebXR session which has requestHitTestSource
            const xrSession = session as XRSession & {
              requestHitTestSource: (options: { space: XRReferenceSpace }) => Promise<XRHitTestSource>;
            };
            if (xrSession.requestHitTestSource && refSpace) {
              void xrSession.requestHitTestSource?.({ space: refSpace }).then((source: XRHitTestSource | undefined) => {
                if (source) {
                  hitTestSource = source;
                  localSpace = renderer.xr.getReferenceSpace();
                }
              }).catch((error: unknown) => {
                console.error("Failed to get hit test source:", error);
              });
            }
          }).catch((error: unknown) => {
            console.error("Failed to get reference space:", error);
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
              model.rotation.set(0, Math.PI, 0);
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
