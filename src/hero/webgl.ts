/** WebGL-támogatás ellenőrzése a Three.js betöltése előtt.
 *  `?nowebgl` paraméterrel a tartalék nézet kipróbálható. */
export function webglAvailable(): boolean {
  try {
    if (new URLSearchParams(location.search).has("nowebgl")) return false;
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
