export function initCursor() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  const el = document.querySelector('.cursor')
  if (!fine) {
    el.remove()
    return
  }
  document.documentElement.classList.add('has-cursor')
  const ring = el.querySelector('.cursor__ring')
  const dot = el.querySelector('.cursor__dot')
  const label = el.querySelector('.cursor__label')
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })

  let mag = null

  const release = node => {
    gsap.to(node, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
    const inner = node.querySelector('.pill__text, .nav__name, .nav__mark')
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
  }

  window.addEventListener(
    'pointermove',
    e => {
      ringX(e.clientX)
      ringY(e.clientY)
      dotX(e.clientX)
      dotY(e.clientY)
      el.classList.add('is-visible')
      const target = e.target.closest ? e.target.closest('[data-magnetic]') : null
      if (mag && mag !== target) {
        release(mag)
        mag = null
      }
      if (target) {
        mag = target
        const r = target.getBoundingClientRect()
        const mx = e.clientX - (r.left + r.width / 2)
        const my = e.clientY - (r.top + r.height / 2)
        gsap.to(target, { x: mx * 0.35, y: my * 0.45, duration: 0.5, ease: 'power3' })
        const inner = target.querySelector('.pill__text, .nav__name, .nav__mark')
        if (inner) gsap.to(inner, { x: mx * 0.15, y: my * 0.2, duration: 0.5, ease: 'power3' })
      }
    },
    { passive: true }
  )

  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor], a, button')
    if (!t) return
    const text = t.dataset.cursor
    el.classList.toggle('is-label', !!text)
    el.classList.toggle('is-hover', !text)
    label.textContent = text || ''
  })
  document.addEventListener('pointerout', e => {
    const t = e.target.closest('[data-cursor], a, button')
    if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return
    el.classList.remove('is-label', 'is-hover')
  })
  document.addEventListener('pointerdown', () => el.classList.add('is-down'))
  document.addEventListener('pointerup', () => el.classList.remove('is-down'))
  document.addEventListener('pointerleave', () => el.classList.remove('is-visible'))

  return {
    reset() {
      el.classList.remove('is-label', 'is-hover')
      if (mag) release(mag)
      mag = null
    }
  }
}
