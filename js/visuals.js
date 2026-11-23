const ACCENT = '#8FB3A0'
const WHITE = '#ECEBE6'
const DIM = 'rgba(236,235,230,0.16)'
const MUTED = 'rgba(236,235,230,0.5)'
const FONT = '"Instrument Sans", system-ui, sans-serif'

const rand = seed => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function flux() {
  const rnd = rand(7)
  const pts = []
  let drift = 0
  let driftLeft = 0
  const next = () => {
    if (driftLeft <= 0 && rnd() < 0.035) driftLeft = 9 + Math.floor(rnd() * 6)
    if (driftLeft > 0) {
      drift = Math.min(drift + 0.55, 3.8)
      driftLeft--
    } else drift *= 0.7
    return (rnd() + rnd() + rnd() - 1.5) * 1.15 + drift
  }
  for (let i = 0; i < 80; i++) pts.push(next())
  let offset = 0
  const flashes = []
  return (ctx, w, h, t, dt, m) => {
    const pad = Math.max(24, w * 0.06)
    const step = (w - pad * 2) / 60
    offset += dt * 7
    while (offset >= 1) {
      offset -= 1
      pts.shift()
      const v = next()
      pts.push(v)
      if (v > 3) flashes.push({ age: 0, v })
    }
    const mid = h * 0.52
    const unit = (h * 0.62) / 9
    const y = v => mid - v * unit
    ctx.font = `500 ${Math.max(10, w * 0.014)}px ${FONT}`
    ctx.lineWidth = 1
    ctx.setLineDash([4, 6])
    ctx.strokeStyle = 'rgba(143,179,160,0.55)'
    ;[3, -3].forEach(l => {
      ctx.beginPath()
      ctx.moveTo(pad, y(l))
      ctx.lineTo(w - pad, y(l))
      ctx.stroke()
    })
    ctx.setLineDash([])
    ctx.strokeStyle = DIM
    ctx.beginPath()
    ctx.moveTo(pad, mid)
    ctx.lineTo(w - pad, mid)
    ctx.stroke()
    ctx.fillStyle = MUTED
    ctx.fillText('Upper control limit, +3σ', pad, y(3) - 8)
    ctx.fillText('Lower control limit, −3σ', pad, y(-3) + 18)
    ctx.beginPath()
    const visible = pts.slice(-62)
    visible.forEach((v, i) => {
      const x = pad + (i - offset) * step
      if (x < pad - 1) return
      i ? ctx.lineTo(x, y(v)) : ctx.moveTo(x, y(v))
    })
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 1.6
    ctx.stroke()
    visible.forEach((v, i) => {
      const x = pad + (i - offset) * step
      if (x < pad) return
      const out = v > 3
      ctx.fillStyle = out ? ACCENT : WHITE
      ctx.beginPath()
      ctx.arc(x, y(v), out ? 4.5 : 2.2, 0, Math.PI * 2)
      ctx.fill()
      if (out) {
        const k = (t * 2 + i * 0.3) % 1
        ctx.strokeStyle = `rgba(143,179,160,${1 - k})`
        ctx.beginPath()
        ctx.arc(x, y(v), 4.5 + k * 16, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
    const last = visible.length - 1
    let peak = -1
    for (let i = last; i > 0; i--) if (visible[i] > 3) { peak = i; break }
    if (peak > 0) {
      const x = pad + (peak - offset) * step
      if (x > pad) {
        const z = visible[peak].toFixed(1)
        ctx.fillStyle = ACCENT
        ctx.fillText(`Alert: z = ${z}`, Math.min(x + 10, w - pad - 80), y(visible[peak]) - 12)
      }
    }
    if (m.inside) {
      const i = Math.round((m.x - pad) / step + offset)
      if (i >= 0 && i < visible.length) {
        const x = pad + (i - offset) * step
        ctx.strokeStyle = 'rgba(236,235,230,0.35)'
        ctx.beginPath()
        ctx.moveTo(x, pad * 0.5)
        ctx.lineTo(x, h - pad * 0.5)
        ctx.stroke()
        ctx.fillStyle = WHITE
        ctx.fillText(`z = ${visible[i].toFixed(2)}`, x + 8, h - pad * 0.5)
      }
    }
  }
}

function lien() {
  const parts = Array.from({ length: 70 }, (_, i) => ({ a: (i / 70) * Math.PI * 2, r: 0.3 + Math.random() * 0.7, s: 0.1 + Math.random() * 0.25 }))
  let price = 2000
  return (ctx, w, h, t, dt, m) => {
    const s = Math.min(w, h)
    const cx = w / 2
    const cy = h * 0.54
    const R = s * 0.34
    const nodes = [
      { name: 'Base', sub: 'Collateral', x: cx - R * 1.15, y: cy + R * 0.62 },
      { name: 'Reactive Lasna', sub: 'Ledger', x: cx, y: cy - R * 0.78 },
      { name: 'Unichain', sub: 'Credit', x: cx + R * 1.15, y: cy + R * 0.62 }
    ]
    ctx.font = `500 ${Math.max(10, s * 0.032)}px ${FONT}`
    parts.forEach(p => {
      const a = p.a + t * p.s
      ctx.fillStyle = 'rgba(236,235,230,0.18)'
      ctx.fillRect(cx + Math.cos(a) * R * 1.7 * p.r, cy + Math.sin(a) * R * 0.9 * p.r, 1.5, 1.5)
    })
    ctx.strokeStyle = DIM
    ctx.lineWidth = 1
    ;[[0, 1], [1, 2], [0, 2]].forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(nodes[a].x, nodes[a].y)
      ctx.lineTo(nodes[b].x, nodes[b].y)
      ctx.stroke()
    })
    const cycle = 3.2
    const k = (t % cycle) / cycle
    const loop = Math.floor(t / cycle)
    price = 2000 - ((loop % 5) + 1) * 40
    const seg = (from, to, a, b) => {
      if (k < a || k > b) return null
      const e = ease((k - a) / (b - a))
      return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
    }
    const pulses = [seg(nodes[0], nodes[1], 0.08, 0.38), seg(nodes[1], nodes[2], 0.45, 0.75)]
    pulses.forEach((p, i) => {
      if (!p) return
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18)
      g.addColorStop(0, i ? 'rgba(236,235,230,0.9)' : 'rgba(143,179,160,0.95)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2)
      ctx.fill()
    })
    const lit = [k > 0 && k < 0.12, k > 0.36 && k < 0.5, k > 0.74 && k < 0.95]
    nodes.forEach((n, i) => {
      const near = m.inside && Math.hypot(m.x - n.x, m.y - n.y) < s * 0.12
      const r = s * (i === 1 ? 0.075 : 0.055) * (near ? 1.12 : 1)
      ctx.fillStyle = '#0d1210'
      ctx.strokeStyle = lit[i] || near ? ACCENT : 'rgba(236,235,230,0.6)'
      ctx.lineWidth = lit[i] ? 2.5 : 1.25
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      if (lit[i]) {
        const q = (k * 8) % 1
        ctx.strokeStyle = `rgba(143,179,160,${1 - q})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r + q * 22, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = WHITE
      ctx.textAlign = 'center'
      ctx.fillText(n.name, n.x, n.y + r + s * 0.06)
      ctx.fillStyle = MUTED
      ctx.fillText(n.sub, n.x, n.y + r + s * 0.105)
    })
    ctx.textAlign = 'left'
    ctx.fillStyle = k < 0.4 ? ACCENT : MUTED
    ctx.fillText(`WETH $${price.toLocaleString('en-US')}`, nodes[0].x - s * 0.08, nodes[0].y - s * 0.1)
    if (k > 0.74) {
      ctx.fillStyle = ACCENT
      ctx.textAlign = 'center'
      ctx.fillText('Shield repaid. Not liquidatable.', nodes[2].x - s * 0.05, nodes[2].y - s * 0.11)
      ctx.textAlign = 'left'
    }
  }
}

function planner() {
  const N = [
    { id: 'Planner', c: 0, r: 0 },
    { id: 'Transport', c: 1, r: -1 },
    { id: 'Stays', c: 1, r: 0 },
    { id: 'Activities', c: 1, r: 1 },
    { id: 'Budget', c: 2, r: 0, code: true },
    { id: 'Synthesis', c: 3, r: 0 },
    { id: 'Checks', c: 4, r: 0, code: true },
    { id: 'You', c: 5, r: 0, human: true }
  ]
  const E = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [5, 6], [6, 7]]
  const stage = [0, 1, 1, 1, 2, 3, 4, 5]
  return (ctx, w, h, t, dt, m) => {
    const padX = w * 0.09
    const colW = (w - padX * 2) / 5
    const rowH = Math.min(h * 0.24, 110)
    const cy = h * 0.5
    const pos = n => ({ x: padX + n.c * colW, y: cy + n.r * rowH })
    const cycle = 6
    const k = (t % cycle) / cycle
    const active = Math.floor(k * 7.5)
    const rejectLoop = Math.floor(t / cycle) % 2 === 1
    const sz = Math.max(10, Math.min(w, h * 1.6) * 0.022)
    ctx.font = `500 ${sz}px ${FONT}`
    ctx.lineWidth = 1
    E.forEach(([a, b]) => {
      const p = pos(N[a])
      const q = pos(N[b])
      const on = stage[b] <= active && stage[a] < active
      ctx.strokeStyle = on ? 'rgba(236,235,230,0.75)' : DIM
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      const mx = (p.x + q.x) / 2
      ctx.bezierCurveTo(mx, p.y, mx, q.y, q.x, q.y)
      ctx.stroke()
      if (stage[b] === active && stage[a] === active - 1) {
        const f = (k * 7.5) % 1
        const e = ease(f)
        const bx = (1 - e) ** 3 * p.x + 3 * (1 - e) ** 2 * e * mx + 3 * (1 - e) * e * e * mx + e ** 3 * q.x
        const by = (1 - e) ** 3 * p.y + 3 * (1 - e) ** 2 * e * p.y + 3 * (1 - e) * e * e * q.y + e ** 3 * q.y
        ctx.fillStyle = ACCENT
        ctx.beginPath()
        ctx.arc(bx, by, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    if (rejectLoop && active >= 5) {
      const a = pos(N[6])
      const b = pos(N[5])
      ctx.strokeStyle = ACCENT
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(a.x, a.y - 14)
      ctx.bezierCurveTo(a.x, a.y - rowH * 0.9, b.x, b.y - rowH * 0.9, b.x, b.y - 14)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = ACCENT
      ctx.textAlign = 'center'
      ctx.fillText('Over budget, revise', (a.x + b.x) / 2, a.y - rowH * 0.75)
      ctx.textAlign = 'left'
    }
    N.forEach((n, i) => {
      const p = pos(n)
      const on = stage[i] <= active
      const now = stage[i] === active
      const near = m.inside && Math.hypot(m.x - p.x, m.y - p.y) < 40
      const label = n.id
      const tw = ctx.measureText(label).width + sz * 1.6
      const th = sz * 2.3
      ctx.fillStyle = now ? ACCENT : '#0d1210'
      ctx.strokeStyle = on || near ? (now ? ACCENT : WHITE) : 'rgba(236,235,230,0.3)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      if (n.code) ctx.rect(p.x - tw / 2, p.y - th / 2, tw, th)
      else ctx.roundRect(p.x - tw / 2, p.y - th / 2, tw, th, th / 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = now ? '#0d1210' : on ? WHITE : MUTED
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, p.x, p.y + 1)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    })
    ctx.fillStyle = MUTED
    ctx.font = `400 ${sz * 0.9}px ${FONT}`
    ctx.fillText('Rounded: LLM agent    Square: plain Python', padX - sz, h - sz * 1.5)
  }
}

function tollgate() {
  const cycles = [
    { cmd: '$ vercel --prod', ok: true, after: 'Deployed to production' },
    { cmd: '$ prisma migrate deploy', ok: false, reason: 'Denied: back up the table first', after: '$ pg_dump prod > backup.sql' }
  ]
  return (ctx, w, h, t, dt, m) => {
    const cycle = 7
    const c = cycles[Math.floor(t / cycle) % 2]
    const k = (t % cycle) / cycle
    const sz = Math.max(10, Math.min(w, h * 1.5) * 0.024)
    const mono = `500 ${sz}px ui-monospace, Menlo, monospace`
    const sans = `500 ${sz}px ${FONT}`
    const cy = h * 0.56
    const tx = w * 0.07
    const tw = w * 0.34
    const th = sz * 6.4
    const gx = w * 0.58
    const gh = h * 0.26
    const px = w * 0.74
    const pw = w * 0.2

    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(236,235,230,0.35)'
    ctx.strokeRect(tx, cy - th / 2, tw, th)
    ctx.fillStyle = MUTED
    ctx.font = sans
    ctx.fillText('Coding agent', tx, cy - th / 2 - sz * 0.8)
    ctx.font = mono
    const typed = Math.floor(c.cmd.length * Math.min(1, k / 0.14))
    ctx.fillStyle = WHITE
    ctx.fillText(c.cmd.slice(0, typed), tx + sz, cy - th / 2 + sz * 2)
    if (k < 0.14 && Math.floor(t * 3) % 2) ctx.fillRect(tx + sz + ctx.measureText(c.cmd.slice(0, typed)).width + 2, cy - th / 2 + sz * 1.1, sz * 0.5, sz * 1.1)
    if (!c.ok && k > 0.8) {
      const t2 = Math.floor(c.after.length * Math.min(1, (k - 0.8) / 0.14))
      ctx.fillStyle = ACCENT
      ctx.fillText('↳ revised plan', tx + sz, cy - th / 2 + sz * 3.7)
      ctx.fillStyle = WHITE
      ctx.fillText(c.after.slice(0, t2), tx + sz, cy - th / 2 + sz * 5.2)
    }

    const near = m.inside && Math.abs(m.x - gx) < w * 0.08
    ctx.strokeStyle = near ? ACCENT : WHITE
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(gx - w * 0.04, cy + gh / 2)
    ctx.lineTo(gx - w * 0.04, cy - gh / 2)
    ctx.moveTo(gx + w * 0.04, cy + gh / 2)
    ctx.lineTo(gx + w * 0.04, cy - gh / 2 + sz)
    ctx.stroke()
    let lift = 0
    if (c.ok) lift = k < 0.6 ? 0 : k < 0.7 ? ease((k - 0.6) / 0.1) : k < 0.92 ? 1 : 1 - ease((k - 0.92) / 0.08)
    ctx.save()
    ctx.translate(gx - w * 0.04, cy)
    ctx.rotate(-lift * Math.PI * 0.45)
    ctx.fillStyle = ACCENT
    ctx.fillRect(0, -3, w * 0.085, 6)
    ctx.restore()

    if (k > 0.3) {
      const cw = Math.max(sz * 13, w * 0.24)
      const cx = Math.min(w - cw - 8, gx - cw / 2)
      const top = cy - gh / 2 - sz * 6.2
      const decided = k > 0.55
      ctx.fillStyle = '#0d1210'
      ctx.strokeStyle = decided ? (c.ok ? WHITE : ACCENT) : 'rgba(236,235,230,0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cx, top, cw, sz * 4.4, 6)
      ctx.fill()
      ctx.stroke()
      ctx.font = sans
      ctx.fillStyle = WHITE
      ctx.fillText(decided ? (c.ok ? 'TG-42 approved' : 'TG-43 denied') : 'TG-42 waiting for the team', cx + sz, top + sz * 1.7)
      const votes = c.ok ? (k > 0.5 ? 2 : k > 0.4 ? 1 : 0) : 0
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        ctx.arc(cx + sz * 1.4 + i * sz * 1.6, top + sz * 3.1, sz * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = i < votes ? ACCENT : 'rgba(236,235,230,0.15)'
        ctx.fill()
      }
      ctx.fillStyle = !c.ok && decided ? ACCENT : MUTED
      ctx.fillText(!c.ok && decided ? c.reason : `${votes} of 2 approvals`, cx + sz * 4.6, top + sz * 3.45)
    }

    ctx.strokeStyle = c.ok && k > 0.82 ? ACCENT : 'rgba(236,235,230,0.35)'
    ctx.lineWidth = c.ok && k > 0.82 ? 2 : 1
    ctx.strokeRect(px, cy - th / 2, pw, th)
    ctx.font = sans
    ctx.fillStyle = MUTED
    ctx.fillText('Production', px, cy - th / 2 - sz * 0.8)
    if (c.ok && k > 0.82) {
      ctx.fillStyle = WHITE
      ctx.fillText('Deployed', px + sz, cy + sz * 0.4)
    }

    let bx = null
    const start = tx + tw
    const stop = gx - w * 0.06
    if (k > 0.15 && k < 0.3) bx = start + (stop - start) * ease((k - 0.15) / 0.15)
    else if (k >= 0.3 && k < 0.6) bx = stop
    else if (c.ok && k >= 0.68 && k < 0.84) bx = stop + (px + pw / 2 - stop) * ease((k - 0.68) / 0.16)
    else if (!c.ok && k >= 0.6 && k < 0.8) bx = stop - (stop - start) * ease((k - 0.6) / 0.2)
    if (bx !== null) {
      const g = ctx.createRadialGradient(bx, cy, 0, bx, cy, sz * 1.6)
      g.addColorStop(0, !c.ok && k >= 0.6 ? 'rgba(143,179,160,0.95)' : 'rgba(236,235,230,0.95)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(bx, cy, sz * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const makers = { flux, lien, planner, tollgate }

export function mountVisual(canvas, reduce = false) {
  const draw = makers[canvas.dataset.visual]()
  const ctx = canvas.getContext('2d')
  const mouse = { x: 0, y: 0, inside: false }
  let w = 0
  let h = 0
  let raf = 0
  let running = false
  let last = performance.now()
  let clock = Math.random() * 4

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (reduce) paint(0)
  }
  const paint = dt => {
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h, clock, dt, mouse)
  }
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock += dt
    paint(dt)
    if (running) raf = requestAnimationFrame(loop)
  }
  const move = e => {
    const r = canvas.getBoundingClientRect()
    mouse.x = e.clientX - r.left
    mouse.y = e.clientY - r.top
    mouse.inside = true
    if (reduce) paint(0)
  }
  const leave = () => {
    mouse.inside = false
  }
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  const io = new IntersectionObserver(([en]) => {
    if (reduce) return paint(0)
    if (en.isIntersecting && !running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    } else if (!en.isIntersecting) {
      running = false
      cancelAnimationFrame(raf)
    }
  })
  io.observe(canvas)
  if (reduce) {
    clock = 2.2
    paint(0)
  }
  return () => {
    running = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    canvas.removeEventListener('pointermove', move)
    canvas.removeEventListener('pointerleave', leave)
  }
}
