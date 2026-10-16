/* =========================================================================
   HeroScene — a DAEKON nyitójelenet WebGL-motorja.

   Rétegzés (Kingfisher-elv, eredeti DAEKON-jelenetre):
   - A DAEKON felirat valódi 3D-s, extrudált betűkből áll (a márkakönyv
     vektoraiból), a mélységpufferbe ír → a Split D embléma ténylegesen
     a betűk mögött halad, majd a felirat elé fordul. Nem CSS-trükk.
   - A betűk egy alsó vágósík alól emelkednek ki (3D-s maszkolt alapvonal).
   - Ködös tér: az embléma a sötétből érkezik, súllyal, lassulva.
   - Fénycsík fut végig a fémes felületen az érkezés alatt.
   - Ritka porszemcsék; a kurzor közelében finoman kitérnek (particle cloak).

   - Részecskefátyol (particle cloak) az embléma körül, a kurzor elől kitér.
   - Utófeldolgozás: visszafogott kromatikus fénytörés a kép szélein és
     gyors mozgásnál, vignetta, filmszemcse (asztalon).
   - Folytonosság: görgetésre a 3D embléma egy fordulattal pontosan a
     fejléc logójának helyére repül, ott átadja a helyét az SVG-logónak.

   A háttér CSS-ből jön (átlátszó renderer) → a betöltés előtt és után
   pontosan ugyanaz a színvilág, nincs lila→kék váltás.
   ========================================================================= */
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { MARK_BOWL, MARK_STEM, WORDMARK_PATHS } from "../brand/paths";

export type SceneFailReason = "unsupported" | "lost";

export interface HeroSceneOptions {
  canvas: HTMLCanvasElement;
  mobile: boolean;
  reducedMotion: boolean;
  shortIntro: boolean;
  onIntroCopy: () => void;
  onIntroDone: () => void;
  onFail: (reason: SceneFailReason) => void;
}

const BG = 0x0a0b12;
const FOV = 32;
const CAM_Z = 16;

interface Layout {
  w: number; // látható szélesség z=0-n (világegység)
  h: number;
  wordW: number;
  wordH: number;
  wordX: number; // a felirat közepe
  wordY: number;
  emSize: number; // az embléma magassága
  emFinal: THREE.Vector3;
  portrait: boolean;
}

function parseShapes(d: string, flipH: number): THREE.Shape[] {
  // A SVG y lefelé nő → tükrözzük már a pontokon (nem negatív skálával,
  // hogy a lapok iránya és a normálok helyesek maradjanak).
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1 0 0 -1 0 ${flipH})"><path d="${d}"/></g></svg>`;
  const data = new SVGLoader().parse(svg);
  return data.paths.flatMap((p) => SVGLoader.createShapes(p));
}

export class HeroScene {
  private o: HeroSceneOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private emblem = new THREE.Group();
  private emblemInner = new THREE.Group();
  private word = new THREE.Group();
  private letters: { mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; base: THREE.Vector3 }[] = [];
  private clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private sweep: THREE.SpotLight;
  private rim: THREE.DirectionalLight;
  private dust?: THREE.Points;
  private dustMat?: THREE.ShaderMaterial;
  private cloak?: THREE.Points;
  private cloakMat?: THREE.ShaderMaterial;
  private post?: { rt: THREE.WebGLRenderTarget; scene: THREE.Scene; cam: THREE.OrthographicCamera; mat: THREE.ShaderMaterial };
  private lastEm = new THREE.Vector3();
  private speed = 0;
  private landed = false;
  private markEl: HTMLElement | null = null;
  private pmrem?: THREE.WebGLRenderTarget;
  private layout!: Layout;
  private curve!: THREE.CatmullRomCurve3;

  private rig = {
    t: 0, // embléma útvonal 0..1
    rotY: -3.4,
    rotX: 0.7,
    rotZ: -0.35,
    sweepX: -1.2, // a fénycsík helyzete (-1.2 … 1.2 a szélesség arányában)
    envRot: -0.6,
    letters: [0, 0, 0, 0, 0, 0],
    dust: 0,
  };
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private pointerWorld = new THREE.Vector3(99, 99, 0);
  private scroll = 0;
  private scrollSmooth = 0;
  private visible = true;
  private raf = 0;
  private clock = new THREE.Clock();
  private tl?: gsap.core.Timeline;
  private introFinished = false;
  private frameSamples: number[] = [];
  private lowTier = false;
  private disposed = false;
  private started = false;

  constructor(o: HeroSceneOptions) {
    this.o = o;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: o.canvas,
        antialias: !o.mobile,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      throw new Error("webgl-unsupported");
    }
    this.renderer = renderer;
    renderer.setClearColor(BG, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.mobile ? 1.5 : 1.75));

    o.canvas.addEventListener("webglcontextlost", this.onContextLost, false);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
    this.camera.position.set(0, 0, CAM_Z);

    this.scene.fog = new THREE.Fog(BG, CAM_Z + 4, CAM_Z + 46);

    // Környezeti fény a fémes felületekhez — külső HDR nélkül.
    const pmremGen = new THREE.PMREMGenerator(renderer);
    this.pmrem = pmremGen.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.pmrem.texture;
    this.scene.environmentIntensity = 0.75;
    pmremGen.dispose();

    // Lila hátsó perem + hideg kitöltő + mozgó „fénycsík".
    this.rim = new THREE.DirectionalLight(0x8b6bff, 4.2);
    this.rim.position.set(-6, 4, -6);
    this.scene.add(this.rim);
    const rim2 = new THREE.DirectionalLight(0x6f5bff, 2.2);
    rim2.position.set(7, -3, -5);
    this.scene.add(rim2);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 6, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fb2ff, 0.5);
    fill.position.set(4, -2, 8);
    this.scene.add(fill);
    this.sweep = new THREE.SpotLight(0xffffff, 0, 40, 0.32, 0.6, 0.6);
    this.sweep.position.set(0, 3, 9);
    this.scene.add(this.sweep, this.sweep.target);

    this.buildEmblem();
    this.buildWord();
    if (!o.mobile || window.innerWidth > 420) this.buildDust(o.mobile ? 150 : 380);
    else this.buildDust(110);

    this.buildCloak(o.mobile ? 90 : 220);
    if (!o.mobile) this.buildPost();

    this.scene.add(this.word, this.emblem);
    this.markEl = document.querySelector<HTMLElement>(".brand__mark");
    this.resize();

    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);

    this.start();
  }

  /** A shaderek előfordítása az intro előtt → nincs akadás az első képkockáknál. */
  private async start() {
    try {
      await Promise.race([
        this.renderer.compileAsync(this.scene, this.camera),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    } catch {
      /* régebbi böngésző: szinkron fordítás az első rajzoláskor */
    }
    if (this.disposed) return;
    this.started = true;
    this.buildIntro();
    this.clock.getDelta();
    this.loop();
  }

  /* ------------------------------------------------------------ build */

  private buildEmblem() {
    const extrude: THREE.ExtrudeGeometryOptions = {
      depth: 30,
      bevelEnabled: true,
      bevelThickness: 5,
      bevelSize: 3.2,
      bevelSegments: 5,
      curveSegments: 40,
    };
    // A sötét változat színei: világos szár + DAEKON fénykék bowl.
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6f7fc,
      metalness: 0.9,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
    });
    const bowlMat = new THREE.MeshPhysicalMaterial({
      color: 0x2b50ff,
      emissive: 0x1636e7,
      emissiveIntensity: 0.22,
      metalness: 0.6,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.3,
      iridescence: 0.35,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [180, 420],
    });
    const make = (d: string, mat: THREE.Material) => {
      const geo = new THREE.ExtrudeGeometry(parseShapes(d, 200), extrude);
      geo.translate(-96, -100, -15); // optikai középpont
      geo.computeVertexNormals();
      return new THREE.Mesh(geo, mat);
    };
    this.emblemInner.add(make(MARK_STEM, stemMat), make(MARK_BOWL, bowlMat));
    this.emblemInner.scale.setScalar(1 / 180); // ~1,0 egység magas alapméret
    this.emblem.add(this.emblemInner);
  }

  private buildWord() {
    // viewBox: -8 -8 720.93 116 → a betűk 0..704 × 0..100 között.
    const extrude: THREE.ExtrudeGeometryOptions = {
      depth: 16,
      bevelEnabled: true,
      bevelThickness: 2.2,
      bevelSize: 1.4,
      bevelSegments: 3,
      curveSegments: 18,
    };
    WORDMARK_PATHS.forEach((d) => {
      const geo = new THREE.ExtrudeGeometry(parseShapes(d, 100), extrude);
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const cx = (bb.min.x + bb.max.x) / 2;
      geo.translate(-cx, -50, -8);
      // Csiszolt króm: a környezet és a lila perem tükröződik rajta.
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xe4e8f6,
        metalness: 1,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.6,
        clippingPlanes: [this.clip],
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const base = new THREE.Vector3(cx - 352, 0, 0);
      mesh.position.copy(base);
      this.word.add(mesh);
      this.letters.push({ mesh, mat, base });
    });
  }

  private buildDust(count: number) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const violet = new THREE.Color(0x8b6bff);
    const blue = new THREE.Color(0x5b78ff);
    const lime = new THREE.Color(0xc6ff3d);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = -22 + Math.random() * 28;
      const r = Math.random();
      const c = r < 0.04 ? lime : r < 0.55 ? violet : blue;
      col.set([c.r, c.g, c.b], i * 3);
      seed[i] = Math.random() * 100;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uAlpha: { value: 0 },
        uPx: { value: this.renderer.getPixelRatio() },
        uMotion: { value: this.o.reducedMotion ? 0 : 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aColor; attribute float aSeed;
        uniform float uTime, uPx, uMotion; uniform vec3 uMouse;
        varying vec3 vColor; varying float vFade;
        void main(){
          vec3 p = position;
          float t = uTime * 0.12 * uMotion;
          p.x += sin(t + aSeed) * 0.35;
          p.y += cos(t * 0.8 + aSeed * 1.7) * 0.28 + mod(t * 0.4 + aSeed, 1.0) * 0.0;
          // kurzor körüli kitérés (csak a közeli rétegekben)
          vec2 dlt = p.xy - uMouse.xy;
          float dist = length(dlt);
          float near = smoothstep(-6.0, 2.0, p.z);
          p.xy += normalize(dlt + 1e-4) * smoothstep(2.6, 0.0, dist) * 1.1 * near * uMotion;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float tw = 0.55 + 0.45 * sin(uTime * 0.9 + aSeed * 3.1);
          gl_PointSize = (2.2 + fract(aSeed) * 2.6) * uPx * (10.0 / -mv.z) * (0.7 + 0.3 * tw);
          vColor = aColor; vFade = tw;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha; varying vec3 vColor; varying float vFade;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a * a * uAlpha * (0.35 + 0.65 * vFade));
        }`,
    });
    this.dust = new THREE.Points(geo, this.dustMat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }


  /** Részecskefátyol: gömbhéjon az embléma körül, a kurzor elől kitér. */
  private buildCloak(count: number) {
    const off = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = 0.75 + Math.random() * 0.55;
      const q = Math.sqrt(1 - u * u);
      off.set([Math.cos(a) * q * r, u * r * 0.9, Math.sin(a) * q * r * 0.6], i * 3);
      seed[i] = Math.random() * 100;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(off, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    this.cloakMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCenter: { value: new THREE.Vector3() },
        uScale: { value: 1 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uAlpha: { value: 0 },
        uPx: { value: this.renderer.getPixelRatio() },
        uMotion: { value: this.o.reducedMotion ? 0 : 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime, uScale, uPx, uMotion; uniform vec3 uCenter, uMouse;
        varying float vTw; varying float vHue;
        void main(){
          float t = uTime * 0.25 * uMotion;
          float c = cos(t + aSeed * 0.02), s = sin(t + aSeed * 0.02);
          vec3 o = position;
          o.xz = mat2(c, -s, s, c) * o.xz;
          vec3 p = uCenter + o * uScale;
          vec2 d = p.xy - uMouse.xy;
          float k = smoothstep(uScale * 0.9, 0.0, length(d));
          p.xy += normalize(d + 1e-4) * k * uScale * 0.45 * uMotion;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vTw = 0.5 + 0.5 * sin(uTime * 1.3 + aSeed * 2.7);
          vHue = fract(aSeed * 0.37);
          gl_PointSize = (1.6 + vTw * 2.2) * uPx * (12.0 / -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAlpha; varying float vTw; varying float vHue;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 col = vHue < 0.06 ? vec3(0.78, 1.0, 0.24) : mix(vec3(0.55, 0.42, 1.0), vec3(0.42, 0.55, 1.0), vHue);
          gl_FragColor = vec4(col, a * a * uAlpha * (0.3 + 0.7 * vTw));
        }`,
    });
    this.cloak = new THREE.Points(geo, this.cloakMat);
    this.cloak.frustumCulled = false;
    this.scene.add(this.cloak);
  }

  /** Utófeldolgozás: kromatikus fénytörés + vignetta + szemcse, HDR-ből tónusleképezve. */
  private buildPost() {
    const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tScene: { value: rt.texture },
        uChroma: { value: 0.0015 },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene; uniform float uChroma, uTime; uniform vec2 uRes;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          vec2 dir = vUv - 0.5;
          float r2 = dot(dir, dir);
          vec2 off = dir * uChroma * (0.6 + r2 * 6.0);
          vec4 g = texture2D(tScene, vUv);
          vec4 cr = texture2D(tScene, vUv + off);
          vec4 cb = texture2D(tScene, vUv - off);
          vec4 col = vec4(cr.r, g.g, cb.b, max(g.a, max(cr.a, cb.a)));
          col.rgb += (hash(vUv * uRes + uTime) - 0.5) * 0.025 * col.a;
          gl_FragColor = col;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    this.post = { rt, scene, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat };
  }

  private draw() {
    const P = this.post;
    if (!P || this.lowTier) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.renderer.setRenderTarget(P.rt);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(P.scene, P.cam);
  }

  /* ----------------------------------------------------------- layout */

  private computeLayout(): Layout {
    const aspect = this.camera.aspect;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
    const w = h * aspect;
    const portrait = aspect < 0.95;
    // Álló logó (mark a felirat fölött) — a márkakönyv „stacked" elrendezése,
    // térben: az embléma a betűk teteje elé lóg, így valódi a takarás.
    const wordW = portrait ? w * 0.84 : Math.min(w * 0.4, h * 0.95);
    const wordH = wordW * (100 / 704);
    const wordX = portrait ? 0 : w * 0.09;
    const wordY = portrait ? h * 0.17 : h * 0.09;
    const emSize = wordH * (portrait ? 2.1 : 2.15);
    const emFinal = new THREE.Vector3(
      wordX + wordW * (portrait ? 0.02 : 0.04),
      wordY + wordH * (portrait ? 1.55 : 1.6),
      portrait ? 1.3 : 1.4,
    );
    return { w, h, wordW, wordH, wordX, wordY, emSize, emFinal, portrait };
  }

  private applyLayout() {
    const L = (this.layout = this.computeLayout());
    const s = L.wordW / 704;
    this.word.scale.setScalar(s);
    this.word.position.set(L.wordX, L.wordY, 0);
    this.emblem.scale.setScalar(L.emSize);
    // vágósík: a betűk alapvonala alatt (világkoordinátában)
    this.clip.constant = -(L.wordY - L.wordH * 0.5 - 0.02);
    // Útvonal: mélyről → a betűk MÖGÖTT balról jobbra → a felirat ELÉ fordul.
    const right = L.wordX + L.wordW / 2;
    const left = L.wordX - L.wordW / 2;
    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(left - L.w * 0.1, L.wordY + L.h * 0.22, -40),
        new THREE.Vector3(left + L.wordW * 0.12, L.wordY + L.wordH * 0.1, -9),
        new THREE.Vector3(L.wordX, L.wordY, -2.4),
        new THREE.Vector3(right + L.emSize * 0.25, L.wordY + L.wordH * 0.2, -1.8),
        new THREE.Vector3(right - L.wordW * 0.12, L.emFinal.y * 0.7 + L.wordY * 0.3, 0.7),
        L.emFinal.clone(),
      ],
      false,
      "centripetal",
      0.5,
    );
  }

  private resize = () => {
    const c = this.o.canvas;
    const wpx = c.clientWidth || window.innerWidth;
    const hpx = c.clientHeight || window.innerHeight;
    this.renderer.setSize(wpx, hpx, false);
    if (this.post) {
      const pr = this.renderer.getPixelRatio();
      this.post.rt.setSize(Math.round(wpx * pr), Math.round(hpx * pr));
      this.post.mat.uniforms.uRes.value.set(wpx * pr, hpx * pr);
    }
    this.camera.aspect = wpx / hpx;
    this.camera.updateProjectionMatrix();
    this.applyLayout();
    this.renderOnce();
  };

  /* ------------------------------------------------------------ intro */

  private buildIntro() {
    const r = this.rig;
    const done = () => {
      this.introFinished = true;
      this.sweep.intensity = 0;
      this.o.onIntroDone();
    };
    if (this.o.reducedMotion) {
      Object.assign(r, { t: 1, rotY: -0.42, rotX: 0.08, rotZ: 0, sweepX: 1.2, envRot: 0, dust: 0.8 });
      r.letters = r.letters.map(() => 1);
      this.o.onIntroCopy();
      done();
      return;
    }
    // Rövid változat: mobilon és ismételt látogatáskor (sessionen belül).
    const k = this.o.shortIntro ? 0.5 : this.o.mobile ? 0.62 : 1;
    // Valós időhöz kötött intro: lassú gépen sem nyúlik el (nincs lag-simítás).
    gsap.ticker.lagSmoothing(0);
    const tl = gsap.timeline({ onComplete: done });
    this.tl = tl;
    tl.to(r, { dust: 0.8, duration: 1.6 * k, ease: "sine.out" }, 0)
      // embléma érkezése: súly, tehetetlenség, természetes lassulás
      .to(r, { t: 1, duration: 3.1 * k, ease: "expo.out" }, 0.15 * k)
      .to(r, { rotY: -0.42, rotX: 0.08, rotZ: 0, duration: 3.3 * k, ease: "power4.out" }, 0.15 * k)
      // fénycsík végigfut a fémen
      .to(r, { sweepX: 1.25, duration: 2.0 * k, ease: "power1.inOut" }, 0.9 * k)
      .to(r, { envRot: 0, duration: 3.2 * k, ease: "power2.out" }, 0.2 * k);
    r.letters.forEach((_, i) => {
      tl.to(r.letters, { [i]: 1, duration: 1.15 * k, ease: "power3.out" }, (0.55 + i * 0.08) * k);
    });
    tl.call(() => this.o.onIntroCopy(), [], 1.85 * k);
  }

  skipIntro() {
    if (this.tl && this.tl.progress() < 1) this.tl.progress(1);
  }

  /* ------------------------------------------------------------ input */

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType === "touch") return; // érintésen stabil kép
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    // kurzor → világ (z = 0 sík)
    const v = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    const dist = -this.camera.position.z / dir.z;
    this.pointerWorld.copy(this.camera.position).addScaledVector(dir, dist);
  };

  setScroll(p: number) {
    this.scroll = Math.min(1, Math.max(0, p));
    if (!this.raf && this.visible) this.loop();
  }

  setVisible(v: boolean) {
    this.visible = v;
    if (!v) {
      // a hero elhagyta a nézetet → végállapot (logó a fejlécben)
      this.scroll = this.scrollSmooth = 1;
      this.renderOnce();
    }
    if (v && !this.raf) {
      this.clock.getDelta();
      this.loop();
    }
  }

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.tl?.pause();
    } else {
      this.tl?.resume();
      this.setVisible(this.visible);
    }
  };

  private onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.o.onFail("lost");
  };

  /* ------------------------------------------------------------- loop */

  private loop = () => {
    if (this.disposed || !this.started) return;
    if (!this.visible || document.hidden) {
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.draw();
    this.measure(dt);
  };

  private renderOnce() {
    if (this.disposed || !this.layout || !this.started) return;
    this.update(0);
    this.draw();
  }

  private measure(dt: number) {
    if (this.lowTier || dt === 0) return;
    this.frameSamples.push(dt);
    if (this.frameSamples.length === 120) {
      const avg = this.frameSamples.slice(20).reduce((a, b) => a + b, 0) / 100;
      this.frameSamples = [];
      if (avg > 1 / 40) {
        // Gyenge eszköz: automatikus egyszerűsítés.
        this.lowTier = true;
        this.renderer.setPixelRatio(1);
        if (this.dust) this.dust.visible = false;
        this.resize();
      }
    }
  }

  private update(dt: number) {
    const L = this.layout;
    const r = this.rig;
    const time = this.clock.elapsedTime;
    const motion = this.o.reducedMotion ? 0 : 1;

    const lerp = 1 - Math.pow(0.0015, dt || 1);
    this.pointerSmooth.lerp(this.pointer, motion ? lerp : 1);
    this.scrollSmooth += (this.scroll - this.scrollSmooth) * (dt ? Math.min(1, dt * 10) : 1);
    if (Math.abs(this.scroll - this.scrollSmooth) < 0.0005) this.scrollSmooth = this.scroll;
    const s = this.scrollSmooth;

    // Repülés a fejlécbe: s ∈ [0.18, 1] → fl ∈ [0, 1]
    const flight = motion ? THREE.MathUtils.smoothstep(s, 0.18, 1) : 0;
    const fe = flight < 0.5 ? 4 * flight ** 3 : 1 - (-2 * flight + 2) ** 3 / 2; // easeInOutCubic

    // Kamera: finom perspektívaváltás egérre; a repülés alatt semlegesre áll,
    // hogy a fejlécbeli célpont pixelpontos legyen.
    const calm = 1 - fe;
    const px = motion && !this.o.mobile ? this.pointerSmooth.x * calm : 0;
    const py = motion && !this.o.mobile ? this.pointerSmooth.y * calm : 0;
    this.camera.position.set(px * 0.55, py * 0.32, CAM_Z);
    this.camera.lookAt(0, 0, 0);

    // Embléma: intro-útvonal → (görgetés) → fejléc-logó helye
    const p = this.curve.getPoint(Math.min(1, Math.max(0, r.t)));
    const idle = this.introFinished ? motion * calm : 0;
    const hx = p.x;
    const hy = p.y + Math.sin(time * 0.7) * 0.035 * idle;
    const hz = p.z;
    let tx = hx, ty = hy, tz = hz, ts = L.emSize;
    if (flight > 0 && this.markEl) {
      const rc = this.markEl.getBoundingClientRect();
      const vw = this.o.canvas.clientWidth || window.innerWidth;
      const vh = this.o.canvas.clientHeight || window.innerHeight;
      if (rc.width > 0) {
        tx = ((rc.left + rc.width / 2) / vw - 0.5) * L.w;
        ty = (0.5 - (rc.top + rc.height / 2) / vh) * L.h;
        tz = 0;
        ts = ((rc.height * 180) / 200) * (L.h / vh); // a jel 10..190 sávja
      }
    }
    // ív: a pálya közepén kicsit előrébb jön (z), mint egy valódi tárgy
    const arc = Math.sin(fe * Math.PI) * 2.2;
    this.emblem.position.set(
      THREE.MathUtils.lerp(hx, tx, fe),
      THREE.MathUtils.lerp(hy, ty, fe),
      THREE.MathUtils.lerp(hz, tz, fe) + arc,
    );
    // a méret előbb zsugorodik, mint ahogy a pozíció odaér → nem lóg ki a képből
    const fs = 1 - (1 - flight) ** 2.4;
    this.emblem.scale.setScalar(THREE.MathUtils.lerp(L.emSize, ts, fs));
    this.emblem.rotation.set(
      (r.rotX + Math.sin(time * 0.5) * 0.02 * idle + py * 0.06) * calm,
      (r.rotY + Math.sin(time * 0.33) * 0.05 * idle + px * 0.1) * calm + fe * Math.PI * 2,
      r.rotZ * calm,
    );

    // Leszállás: az SVG-logó átveszi a helyét, a vászon elhalványul.
    if (motion) {
      const landed = flight > 0.995;
      if (landed !== this.landed || !document.documentElement.dataset.mark) {
        this.landed = landed;
        document.documentElement.dataset.mark = landed ? "landed" : "flying";
      }
      this.o.canvas.style.opacity = landed ? "0" : "1";
    } else {
      // csökkentett mozgás: nincs repülés, a vászon egyszerűen elhalványul
      this.o.canvas.style.opacity = String(Math.max(0, 1 - s * 1.4));
    }

    // Sebesség → kromatikus fénytörés (gyors mozgásnál erősebb)
    if (dt > 0) {
      const v = this.emblem.position.distanceTo(this.lastEm) / dt;
      this.speed += (v - this.speed) * Math.min(1, dt * 6);
    }
    this.lastEm.copy(this.emblem.position);
    if (this.post) {
      const near = (1 - fe) ** 2; // a fejléc közelében tiszta kép
      this.post.mat.uniforms.uChroma.value = (0.0014 + Math.min(0.0026, this.speed * 0.00012) * motion) * near;
      this.post.mat.uniforms.uTime.value = time % 10;
    }

    // Betűk: maszkolt alapvonalból emelkedés; görgetésre mélységben szétnyílnak.
    const sw = THREE.MathUtils.smoothstep(s, 0, 0.5);
    this.letters.forEach((l, i) => {
      const q = r.letters[i];
      const inv = 1 - q;
      l.mesh.position.set(
        l.base.x * (1 + sw * 0.25),
        l.base.y - inv * 118 + sw * (30 + Math.abs(i - 2.5) * 14),
        l.base.z + sw * (i - 2.5) * 46,
      );
      l.mesh.rotation.x = inv * 0.9 - sw * 0.35;
      l.mesh.rotation.y = sw * (i - 2.5) * 0.12;
      l.mat.opacity = Math.min(1, q * 1.6) * (1 - sw);
      l.mesh.visible = l.mat.opacity > 0.003;
      const solid = q >= 1 && sw < 0.001;
      if (l.mat.transparent === solid) {
        l.mat.transparent = !solid;
        l.mat.needsUpdate = true;
      }
    });
    this.clip.constant = -(L.wordY - L.wordH * 0.5 - 0.02) + (sw > 0 ? 50 : 0);

    // Fénycsík
    const sx = r.sweepX * L.w * 0.5;
    this.sweep.position.set(sx, L.wordY + 3, 9);
    this.sweep.target.position.set(sx * 0.6, L.wordY, 0);
    this.sweep.intensity = this.introFinished ? 0 : 260 * Math.max(0, 1 - Math.abs(r.sweepX) / 1.25);
    this.scene.environmentRotation.y = r.envRot + px * 0.15 + fe * 1.2;

    if (this.dustMat) {
      this.dustMat.uniforms.uTime.value = time;
      this.dustMat.uniforms.uAlpha.value = r.dust * (1 - sw * 0.7);
      (this.dustMat.uniforms.uMouse.value as THREE.Vector3).lerp(this.pointerWorld, 0.08);
    }
    if (this.cloakMat) {
      const u = this.cloakMat.uniforms;
      u.uTime.value = time;
      (u.uCenter.value as THREE.Vector3).copy(this.emblem.position);
      u.uScale.value = this.emblem.scale.x;
      u.uAlpha.value = r.dust * (1 - fe);
      (u.uMouse.value as THREE.Vector3).lerp(this.pointerWorld, 0.12);
    }
  }

  /** Igaz, ha a jelenetnek görgetés közben rajzolnia kell (repülés tart). */
  get isLanded() {
    return this.landed;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.tl?.kill();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.o.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.pmrem?.dispose();
    this.post?.rt.dispose();
    delete document.documentElement.dataset.mark;
    this.renderer.dispose();
  }
}
