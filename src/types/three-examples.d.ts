declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import type { Loader } from 'three';
  import type { LoadingManager } from 'three';
  import type { Group, AnimationClip } from 'three';

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: {
        scene: Group;
        scenes: Group[];
        animations: AnimationClip[];
        [key: string]: unknown;
      }) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}