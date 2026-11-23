const PAPER = [236, 235, 230]
const BACK = [196, 211, 202]
const INK = '13, 18, 16'

export function createPages(canvas, { reduce = false } = {}) {
  const host = canvas.parentElement
  const ctx = canvas.getContext('2d')
  let W = 0
  let H = 0
  let pages = []
  let raf = 0
  let running = false
  let visible = true
  let last = 0
  const born = performance.now()
  const wind = { x: 0 }
  const ptr = { x: -1e4, y: -1e4, t: 0 }
  const rand = (a, b) => a + Math.random() * (b - a)

  const make = y => {
    const z = rand(0.35, 1)
    const scale = Math.max(0.7, Math.min(W, H) / 900)
    const lines = Math.round(rand(6, 10))
    return {
      x: rand(-0.05, 1.05) * W,
      y: y ?? rand(-0.15, 1.05) * H,
      z,
      w: rand(48, 92) * z * scale,
      vx: rand(-5, 5),
      vy: rand(12, 24) * z,
      rot: rand(-0.7, 0.7),
      vr: rand(-0.22, 0.22),
      phase: rand(0, Math.PI * 2),
      vp: rand(0.45, 1.1) * (Math.random() < 0.5 ? -1 : 1),
      sway: rand(0.4, 1),
      swayP: rand(0, Math.PI * 2),
      widths: Array.from({ length: lines }, (_, i) => (i === lines - 1 ? rand(0.25, 0.55) : rand(0.75, 1)))
    }
  }

  const resize = () => {
    W = host.clientWidth
    H = host.clientHeight
    if (!W || !H) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = W < 760 ? 7 : 13
    if (pages.length !== count) {
      pages = Array.from({ length: count }, () => make())
      pages.sort((a, b) => a.z - b.z)
    }
    if (reduce || !running) draw(0, performance.now())
  }

  const step = (p, dt) => {
    p.swayP += dt * 0.8
    const sway = Math.sin(p.swayP) * p.sway * 20 * p.z
    p.x += (p.vx + wind.x * p.z + sway) * dt
    p.y += p.vy * dt
    const dx = p.x - ptr.x
    const dy = p.y - ptr.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < 170) {
      const f = (1 - d / 170) * 90 * dt * p.z
      p.x += (dx / (d + 1)) * f
      p.y += (dy / (d + 1)) * f * 0.5
      p.vr += (Math.random() - 0.5) * 0.02
    }
    p.vr = Math.max(-0.5, Math.min(0.5, p.vr))
    p.rot += p.vr * dt
    p.phase += p.vp * dt * (1 + Math.abs(wind.x) * 0.01)
    if (p.y - p.w > H + 20) {
      const fresh = make(-p.w * 1.6 - rand(0, H * 0.25))
      fresh.z = p.z
      Object.assign(p, fresh)
    }
    if (p.x < -p.w * 2) p.x = W + p.w
    if (p.x > W + p.w * 2) p.x = -p.w
  }

  const render = (p, fade) => {
    const w = p.w
    const h = w * 1.36
    const c = Math.cos(p.phase)
    const front = c >= 0
    const light = 0.68 + 0.32 * Math.max(0, Math.abs(c) * Math.cos(p.rot - 0.5))
    const base = front ? PAPER : BACK
    const col = base.map(v => Math.round(v * light)).join(',')
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.scale(Math.max(0.04, Math.abs(c)), 1)
    ctx.globalAlpha = (0.14 + 0.46 * p.z) * fade
    ctx.fillStyle = `rgb(${col})`
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, Math.max(1.5, w * 0.03))
    else ctx.rect(-w / 2, -h / 2, w, h)
    ctx.fill()
    const ear = w * 0.16
    ctx.fillStyle = `rgba(${INK}, ${front ? 0.16 : 0.1})`
    ctx.beginPath()
    ctx.moveTo(w / 2 - ear, -h / 2)
    ctx.lineTo(w / 2, -h / 2 + ear)
    ctx.lineTo(w / 2 - ear, -h / 2 + ear)
    ctx.closePath()
    ctx.fill()
    if (front) {
      ctx.fillStyle = `rgba(${INK}, 0.42)`
      const top = -h / 2 + h * 0.16
      const gap = (h * 0.7) / p.widths.length
      const lh = Math.max(1, h * 0.018)
      p.widths.forEach((k, i) => ctx.fillRect(-w * 0.34, top + i * gap, w * 0.66 * k, lh))
    }
    ctx.restore()
  }

  function draw(dt, now) {
    ctx.clearRect(0, 0, W, H)
    const fade = reduce ? 1 : Math.min(1, (now - born) / 1800)
    for (const p of pages) {
      if (dt) step(p, dt)
      render(p, fade)
    }
    wind.x *= Math.pow(0.35, dt)
  }

  const frame = now => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    draw(dt, now)
    if (running && visible) raf = requestAnimationFrame(frame)
    else running = false
  }

  function start() {
    if (running || reduce) return
    running = true
    last = 0
    raf = requestAnimationFrame(frame)
  }

  const onMove = e => {
    if (e.pointerType === 'touch') return
    const r = host.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (y < 0 || y > H) return
    const now = performance.now()
    const dt = Math.max(16, now - ptr.t) / 1000
    if (ptr.t && now - ptr.t < 200) wind.x = Math.max(-60, Math.min(60, wind.x + ((x - ptr.x) / dt) * 0.015))
    ptr.x = x
    ptr.y = y
    ptr.t = now
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting
    if (visible) start()
  })
  io.observe(host)
  start()

  return {
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
    }
  }
}
