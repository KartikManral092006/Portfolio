import * as THREE from 'three'

export const PORTRAIT_ASPECT = 1400 / 1260

export function createPortrait(canvas, { reduce = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)

  const uniforms = {
    map: { value: null },
    uOpacity: { value: 1 },
    uDir: { value: new THREE.Vector2(0, 0.45) },
    uLight: { value: new THREE.Vector2(0.5, 0.3) },
    uTexel: { value: new THREE.Vector2(1 / 1400, 1 / 1260) },
    uAccent: { value: new THREE.Vector3(0.275, 0.451, 0.351) }
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D map;
      uniform float uOpacity;
      uniform vec2 uDir;
      uniform vec2 uLight;
      uniform vec2 uTexel;
      uniform vec3 uAccent;
      varying vec2 vUv;
      void main() {
        vec4 t = texture2D(map, vUv);
        if (t.a < 0.004) discard;
        vec3 base = t.rgb;
        float spill = smoothstep(0.0, 0.05, max(base.g, base.b) - base.r);
        base = mix(base, vec3(dot(base, vec3(0.2126, 0.7152, 0.0722))), spill);
        base.b = min(base.b, max(base.r, base.g));
        float edge = 0.0;
        float wsum = 0.0;
        for (int i = 1; i <= 7; i++) {
          float w = 1.0 - float(i) / 8.0;
          edge += (1.0 - texture2D(map, vUv + uDir * uTexel * float(i) * 7.0).a) * w;
          wsum += w;
        }
        edge = smoothstep(0.04, 0.85, edge / wsum) * t.a * 0.9;
        float side = smoothstep(0.8, 0.0, distance(vUv, uLight));
        vec3 col = base * mix(0.84, 1.04, side);
        col += uAccent * side * 0.035;
        col += uAccent * edge * 1.3;
        float fade = smoothstep(0.0, 0.26, vUv.y) * smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
        gl_FragColor = vec4(col, t.a * fade * uOpacity);
        #include <colorspace_fragment>
      }`
  })
  const geometry = new THREE.PlaneGeometry(1, 1)
  scene.add(new THREE.Mesh(geometry, material))

  let texture = null
  let target = { x: 0.5, y: 0.3 }
  const render = () => texture && renderer.render(scene, camera)

  new THREE.TextureLoader().load('assets/portrait.webp', tex => {
    tex.colorSpace = THREE.SRGBColorSpace
    texture = tex
    uniforms.map.value = tex
    render()
  })

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    render()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  return {
    light(u, v) {
      target = { x: u, y: v }
      const L = uniforms.uLight.value
      const k = reduce ? 1 : 0.08
      L.x += (target.x - L.x) * k
      L.y += (target.y - L.y) * k
      const D = uniforms.uDir.value
      D.x += (THREE.MathUtils.clamp((L.x - 0.5) * 2.2, -1, 1) - D.x) * k
      D.y = 0.45
      render()
    },
    destroy() {
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      texture?.dispose()
      renderer.dispose()
    }
  }
}
