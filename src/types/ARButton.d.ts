declare module 'three/examples/jsm/webxr/ARButton' {
  import { WebGLRenderer } from 'three';
  export class ARButton {
    static createButton(
      renderer: WebGLRenderer,
      options?: any
    ): HTMLButtonElement;
  }
}