import { homeView, projectView, notFoundView, byslug, letters } from './views.js'
import { mountShelf } from './shelf.js'
import { createPages } from './pages.js'
import { createPortrait, PORTRAIT_ASPECT } from './portrait.js'
import { mountVisual } from './visuals.js'
import { initCursor } from './cursor.js'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
gsap.registerPlugin(ScrollTrigger)
history.scrollRestoration = 'manual'

const app = document.getElementById('app')
const nav = document.querySelector('.nav')
const menu = document.getElementById('menu')
const menuBtn = document.querySelector('.nav__menu')
const curtain = document.querySelector('.curtain')
const cAccent = curtain.querySelector('.curtain__accent')
const cBlack = curtain.querySelector('.curtain__black')
const cTitle = curtain.querySelector('.curtain__title')
const cursor = initCursor()

let lenis = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(t => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

let ctx = null
let portrait = null
let disposers = []
let pendingSection = null
let busy = false
let rendered = ''
let first = true

const route = () => {
  const m = location.hash.match(/^#\/work\/([\w-]+)/)
  return m ? { name: 'case', slug: m[1], key: location.hash } : { name: 'home', key: '#/' }
}

const scrollTop = () => (lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0))

function jump(id, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { immediate, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView()
}

function teardown() {
  ctx?.revert()
  ScrollTrigger.getAll().forEach(s => s.kill())
  portrait?.destroy()
  portrait = null
  disposers.forEach(d => d())
  disposers = []
  cursor?.reset()
}

function render(r) {
  teardown()
  const p = r.name === 'case' ? byslug(r.slug) : null
  if (r.name === 'case' && p) {
    app.innerHTML = projectView(r.slug)
    document.title = `${p.title}, a case study by Kartik Manral`
  } else if (r.name === 'case') {
    app.innerHTML = notFoundView()
    document.title = 'Not found, Kartik Manral'
  } else {
    app.innerHTML = homeView()
    document.title = 'Kartik Manral, AI and full-stack engineer'
  }
  document.body.dataset.view = r.name
  rendered = r.key
  scrollTop()
  app.querySelectorAll('canvas[data-visual]').forEach(c => disposers.push(mountVisual(c, reduce)))
  ctx = gsap.context(() => (r.name === 'home' ? setupHome() : setupCase()), app)
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

function stretch(scope, selector, { min = 78, max = 150, radius = 0.12 } = {}) {
  const chars = [...scope.querySelectorAll(selector)]
  if (!chars.length) return
  const setters = chars.map(c => gsap.quickTo(c, '--w', { duration: 0.6, ease: 'power3' }))
  gsap.set(chars, { '--w': min + 8 })
  if (!fine || reduce) return
  const move = e => {
    const R = window.innerWidth * radius
    chars.forEach((c, i) => {
      const b = c.getBoundingClientRect()
      const dx = e.clientX - (b.left + b.width / 2)
      const dy = (e.clientY - (b.top + b.height / 2)) * 0.6
      const k = Math.exp(-(dx * dx + dy * dy) / (2 * R * R))
      setters[i](min + (max - min) * k)
    })
  }
  const leave = () => setters.forEach(s => s(min + 8))
  scope.addEventListener('pointermove', move)
  scope.addEventListener('pointerleave', leave)
  disposers.push(() => {
    scope.removeEventListener('pointermove', move)
    scope.removeEventListener('pointerleave', leave)
  })
}

function autoHideNav() {
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: s => nav.classList.toggle('is-hidden', s.direction === 1 && s.scroll() > 320 && menu.hidden)
  })
  disposers.push(() => nav.classList.remove('is-hidden', 'is-inverted', 'is-accent'))
}

function setupHome() {
  autoHideNav()
  const heroEl = app.querySelector('.hero')
  let pCanvas = heroEl.querySelector('.hero__portrait')
  const nameEl = heroEl.querySelector('.hero__name')
  const footEl = heroEl.querySelector('.hero__foot')
  const shelfEl = heroEl.querySelector('.shelf')
  const box = { left: 0, top: 0, w: 1, h: 1 }
  try {
    portrait = createPortrait(pCanvas, { reduce })
  } catch {
    portrait = null
    const img = document.createElement('img')
    img.className = 'hero__portrait hero__portrait--img'
    img.src = 'assets/portrait.webp'
    img.alt = pCanvas.getAttribute('aria-label')
    pCanvas.replaceWith(img)
    pCanvas = img
  }
  const layout = () => {
    const W = heroEl.clientWidth
    const H = heroEl.clientHeight
    const footTop = footEl.offsetTop
    let ph
    let top
    if (W > 760) {
      ph = Math.min(H * 0.82, W * 0.5, footTop - 60)
      top = footTop - ph + 6
      nameEl.style.top = `${Math.round(top + ph * 0.4 - nameEl.offsetHeight / 2)}px`
      shelfEl.style.bottom = `${H - footTop}px`
    } else {
      nameEl.style.top = ''
      shelfEl.style.bottom = ''
      const nameTop = nameEl.offsetTop
      ph = Math.min(H * 0.6, W * 1.25, (nameTop - 60) / 0.92)
      top = nameTop - ph * 0.92
    }
    const pw = ph * PORTRAIT_ASPECT
    Object.assign(box, { left: (W - pw) / 2, top, w: pw, h: ph })
    Object.assign(pCanvas.style, { left: `${box.left}px`, top: `${top}px`, width: `${pw}px`, height: `${ph}px` })
  }
  layout()
  document.fonts?.ready.then(layout)
  const heroRo = new ResizeObserver(layout)
  heroRo.observe(heroEl)
  disposers.push(() => heroRo.disconnect())
  const light = { u: 0.8, v: 1.05 }
  let lightUntil = performance.now() + 4000
  const lightTick = () => {
    if (performance.now() < lightUntil) portrait?.light(light.u, light.v)
  }
  gsap.ticker.add(lightTick)
  const aim = e => {
    const r = heroEl.getBoundingClientRect()
    light.u = (e.clientX - r.left - box.left) / box.w
    light.v = 1 - (e.clientY - r.top - box.top) / box.h
    lightUntil = performance.now() + 2500
  }
  heroEl.addEventListener('pointermove', aim)
  disposers.push(() => {
    gsap.ticker.remove(lightTick)
    heroEl.removeEventListener('pointermove', aim)
  })
  const pages = createPages(heroEl.querySelector('.hero__pages'), { reduce })
  disposers.push(() => pages.destroy())
  const shelf = mountShelf(heroEl, app.querySelector('.tome'), {
    reduce,
    stopScroll: () => lenis?.stop(),
    startScroll: () => lenis?.start()
  })
  disposers.push(() => shelf.destroy())
  if (fine && !reduce) {
    const px = gsap.quickTo(pCanvas, 'x', { duration: 1.2, ease: 'power3' })
    const py = gsap.quickTo(pCanvas, 'y', { duration: 1.2, ease: 'power3' })
    const tilt = e => {
      px((e.clientX / window.innerWidth - 0.5) * -18)
      py((e.clientY / window.innerHeight - 0.5) * -10)
    }
    heroEl.addEventListener('pointermove', tilt)
    disposers.push(() => heroEl.removeEventListener('pointermove', tilt))
  }
  gsap.to(pCanvas, {
    yPercent: 10,
    opacity: 0.35,
    ease: 'none',
    scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
  })
  stretch(heroEl, '.hero__name .ch', { min: 72, max: 118, radius: 0.08 })

  gsap.to('.hero__inner', {
    yPercent: -18,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
  })

  const clock = app.querySelector('[data-clock]')
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
  const tick = () => (clock.textContent = fmt.format(new Date()))
  tick()
  const iv = setInterval(tick, 15000)
  disposers.push(() => clearInterval(iv))

  gsap.fromTo(
    '.manifesto .w',
    { opacity: 0.14 },
    {
      opacity: 1,
      stagger: 0.05,
      ease: 'none',
      scrollTrigger: { trigger: '.manifesto', start: 'top 78%', end: 'bottom 50%', scrub: true }
    }
  )

  const track = app.querySelector('.marquee__track')
  const loop = gsap.to(track, { xPercent: -50, repeat: -1, ease: 'none', duration: reduce ? 0 : 36 })
  if (reduce) loop.pause()
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' })
  ScrollTrigger.create({
    trigger: '.marquee',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: s => {
      if (reduce) return
      const v = s.getVelocity()
      gsap.to(loop, { timeScale: s.direction * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.3, overwrite: true })
      skew(gsap.utils.clamp(-12, 12, v / -250))
    },
    onLeave: () => skew(0),
    onLeaveBack: () => skew(0)
  })
  const settle = () => {
    gsap.to(loop, { timeScale: loop.timeScale() < 0 ? -1 : 1, duration: 0.8 })
    skew(0)
  }
  const off = lenis?.on('scroll', ({ velocity }) => Math.abs(velocity) < 0.2 && settle())
  if (typeof off === 'function') disposers.push(off)

  app.querySelectorAll('.stat').forEach((stat, si) => {
    const cols = stat.querySelectorAll('.odo__col')
    cols.forEach((col, ci) => {
      const d = +col.dataset.digit
      const reel = col.querySelector('.odo__reel')
      if (reduce) return gsap.set(reel, { yPercent: -(10 + d) * 5 })
      gsap.fromTo(
        reel,
        { yPercent: 0 },
        {
          yPercent: -(10 + d) * 5,
          duration: 2.2 + ci * 0.25,
          ease: 'expo.out',
          delay: si * 0.12,
          scrollTrigger: { trigger: stat, start: 'top 85%', once: true }
        }
      )
    })
  })

  const mm = gsap.matchMedia()
  mm.add('(min-width: 900px)', () => {
    const wtrack = app.querySelector('.work__track')
    const dist = () => wtrack.scrollWidth - window.innerWidth
    gsap.to(wtrack, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.work__pin',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: reduce ? true : 1,
        invalidateOnRefresh: true
      }
    })
  })
  disposers.push(() => mm.revert())

  ;[['.stack', 'is-inverted'], ['.offline', 'is-accent']].forEach(([sel, className]) =>
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 36px',
      end: 'bottom 36px',
      toggleClass: { targets: nav, className }
    })
  )
  app.querySelectorAll('.hobby').forEach(h => stretch(h, '.hb', { min: 72, max: 115, radius: 0.1 }))

  app.querySelectorAll('.srow__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      btn.dataset.cursor = open ? 'Expand' : 'Collapse'
      document.querySelector('.cursor__label') && (document.querySelector('.cursor__label').textContent = btn.dataset.cursor)
      btn.closest('.srow').classList.toggle('is-open', !open)
      setTimeout(() => ScrollTrigger.refresh(), 650)
    })
  })

  stretch(app.querySelector('.contact__big'), '.cl', { min: 70, max: 150, radius: 0.1 })
  bindCopy()
}

function bindCopy() {
  app.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.querySelector('.pill__text')
      try {
        await navigator.clipboard.writeText(btn.dataset.copy)
        text.textContent = 'Copied to clipboard'
      } catch {
        text.textContent = btn.dataset.copy
      }
      setTimeout(() => (text.textContent = btn.dataset.label || 'Copy'), 2000)
    })
  })
}

function setupCase() {
  autoHideNav()
  const title = app.querySelector('.case__title')
  if (title) {
    const fit = () => {
      title.style.fontSize = ''
      const k = title.clientWidth / title.scrollWidth
      if (k < 1) title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * k * 0.98}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    disposers.push(() => window.removeEventListener('resize', fit))
  }
  const vis = app.querySelector('.case__visual')
  if (vis && !reduce) {
    gsap.fromTo(
      vis,
      { clipPath: 'inset(14% 9% 14% 9%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: vis, start: 'top 95%', end: 'top 15%', scrub: true }
      }
    )
  }
  const next = app.querySelector('.case__next')
  if (next) stretch(next, '.nx', { min: 70, max: 150, radius: 0.14 })
}

function intro(r) {
  if (reduce) return
  if (r.name === 'home') {
    gsap.from('.spine', { y: -70, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 1, clearProps: 'transform,opacity' })
    gsap.from('.hero__name .ch', { yPercent: 150, duration: 1.3, ease: 'expo.out', stagger: 0.045 })
    gsap.from('.hero__foot', { opacity: 0, y: 24, duration: 1, delay: 0.5, ease: 'power3.out' })
    gsap.fromTo(
      '.hero__portrait',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, delay: 0.15, ease: 'expo.inOut', clearProps: 'clipPath' }
    )
  } else {
    gsap.from('.case__title .ch', { yPercent: 150, duration: 1.2, ease: 'expo.out', stagger: 0.05 })
    gsap.from(['.case__kind', '.case__line', '.case__meta'], {
      opacity: 0,
      y: 20,
      duration: 0.9,
      delay: 0.35,
      stagger: 0.08,
      ease: 'power3.out'
    })
  }
}

function loader() {
  const el = document.querySelector('.loader')
  const num = el.querySelector('.loader__num')
  const bar = el.querySelector('.loader__bar span')
  if (reduce) {
    el.remove()
    document.body.classList.remove('is-loading')
    return Promise.resolve()
  }
  const state = { v: 0 }
  return new Promise(resolve => {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
    const count = gsap.to(state, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        num.textContent = Math.round(state.v)
        bar.style.transform = `scaleX(${state.v / 100})`
      }
    })
    Promise.all([fonts, count.then()]).then(() => {
      gsap
        .timeline({
          onComplete: () => {
            el.remove()
            resolve()
          }
        })
        .to(num, { yPercent: -110, duration: 0.6, ease: 'power3.in' })
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.15')
        .add(() => document.body.classList.remove('is-loading'), '-=0.45')
    })
  })
}

function curtainIn(title) {
  cTitle.innerHTML = `<span class="curtain__clip">${letters(title, 'ct')}</span>`
  curtain.classList.add('is-active')
  if (reduce) {
    return gsap.fromTo(curtain, { opacity: 0 }, { opacity: 1, duration: 0.2 }).then()
  }
  gsap.set([cAccent, cBlack], { scaleY: 0, transformOrigin: '50% 100%' })
  return gsap
    .timeline()
    .to(cAccent, { scaleY: 1, duration: 0.65, ease: 'power4.inOut' })
    .to(cBlack, { scaleY: 1, duration: 0.65, ease: 'power4.inOut' }, 0.12)
    .from(cTitle.querySelectorAll('.ct'), { yPercent: 120, duration: 0.7, ease: 'expo.out', stagger: 0.035 }, 0.5)
    .then()
}

function curtainOut() {
  if (reduce) {
    return gsap
      .to(curtain, { opacity: 0, duration: 0.25 })
      .then(() => {
        curtain.classList.remove('is-active')
        gsap.set(curtain, { clearProps: 'opacity' })
      })
  }
  return gsap
    .timeline({ delay: 0.15 })
    .to(cTitle.querySelectorAll('.ct'), { yPercent: -120, duration: 0.5, ease: 'power3.in', stagger: 0.02 })
    .set([cAccent, cBlack], { transformOrigin: '50% 0%' })
    .to(cBlack, { scaleY: 0, duration: 0.7, ease: 'power4.inOut' }, '-=0.1')
    .to(cAccent, { scaleY: 0, duration: 0.7, ease: 'power4.inOut' }, '-=0.58')
    .then(() => curtain.classList.remove('is-active'))
}

async function go() {
  const r = route()
  if (first) {
    render(r)
    await loader()
    intro(r)
    first = false
    return
  }
  if (busy) return
  if (r.key === rendered) {
    if (pendingSection) jump(pendingSection)
    pendingSection = null
    return
  }
  busy = true
  lenis?.stop()
  const p = r.name === 'case' ? byslug(r.slug) : null
  await curtainIn(p ? p.title : 'Kartik Manral')
  closeMenu(true)
  render(r)
  lenis?.start()
  if (pendingSection) {
    await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)))
    jump(pendingSection, true)
    pendingSection = null
  }
  app.focus({ preventScroll: true })
  intro(r)
  await curtainOut()
  busy = false
  if (route().key !== rendered) go()
}

function openMenu() {
  menu.hidden = false
  menuBtn.setAttribute('aria-expanded', 'true')
  document.body.classList.add('menu-open')
  lenis?.stop()
  if (!reduce) {
    gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
    gsap.fromTo(
      menu.querySelectorAll('a'),
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.3 }
    )
  }
  menu.querySelector('a').focus({ preventScroll: true })
}

function closeMenu(instant = false) {
  if (menu.hidden) return
  menuBtn.setAttribute('aria-expanded', 'false')
  document.body.classList.remove('menu-open')
  lenis?.start()
  const done = () => (menu.hidden = true)
  if (instant || reduce) return done()
  gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: done })
}

menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()))
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !menu.hidden) {
    closeMenu()
    menuBtn.focus()
  }
})

document.addEventListener('click', e => {
  const sec = e.target.closest('[data-section]')
  const logo = e.target.closest('.nav__logo')
  if (sec) {
    e.preventDefault()
    const id = sec.dataset.section
    if (route().name === 'home' && rendered === '#/') {
      closeMenu()
      jump(id)
    } else {
      pendingSection = id
      location.hash = '#/'
    }
  } else if (logo && route().name === 'home' && rendered === '#/') {
    e.preventDefault()
    closeMenu()
    lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo(0, 0)
  }
})

window.addEventListener('hashchange', go)
go()
