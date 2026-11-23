export function mountShelf(hero, tome, { reduce = false, stopScroll = () => {}, startScroll = () => {} } = {}) {
  const spines = [...hero.querySelectorAll('button.spine')]
  const book = tome.querySelector('.tome__book')
  const cover = tome.querySelector('.tome__cover')
  const front = tome.querySelector('.tome__front')
  const frontTitle = tome.querySelector('.tome__front-title')
  const inside = tome.querySelector('.tome__inside')
  const right = tome.querySelector('.tome__page--r')
  const closeBtn = tome.querySelector('.tome__close')
  const backdrop = tome.querySelector('.tome__backdrop')
  let current = null
  let busy = false
  let tl = null

  const single = () => window.innerWidth <= 760

  const coverRect = () => {
    const b = book.getBoundingClientRect()
    return single() ? b : { left: b.left + b.width / 2, top: b.top, width: b.width / 2, height: b.height }
  }

  const fromSpine = spine => {
    const s = spine.getBoundingClientRect()
    const c = coverRect()
    return {
      x: s.left + s.width / 2 - (c.left + c.width / 2),
      y: s.top + s.height / 2 - (c.top + c.height / 2),
      scaleX: s.width / c.width,
      scaleY: s.height / c.height
    }
  }

  const fill = spine => {
    const tpl = document.getElementById(`tome-${spine.dataset.book}`)
    const lead = tpl.content.querySelector('[data-lead]').innerHTML
    const body = tpl.content.querySelector('[data-body]').innerHTML
    inside.innerHTML = lead
    right.innerHTML = `<div class="tome__lead">${lead}</div>${body}`
    right.scrollTop = 0
    inside.scrollTop = 0
    front.className = `tome__front tome__front--${spine.dataset.style}`
    frontTitle.textContent = spine.dataset.title
    tome.setAttribute('aria-label', spine.dataset.title)
  }

  function open(spine) {
    if (busy || current) return
    busy = true
    current = spine
    fill(spine)
    tome.hidden = false
    stopScroll()
    gsap.set(book, { clearProps: 'transform' })
    gsap.set(cover, { rotationY: 0, opacity: 1 })
    const b = book.getBoundingClientRect()
    const c = coverRect()
    gsap.set(book, { transformOrigin: `${c.left + c.width / 2 - b.left}px ${c.top + c.height / 2 - b.top}px` })
    const f = fromSpine(spine)
    spine.classList.add('is-out')
    const done = () => {
      busy = false
      closeBtn.focus({ preventScroll: true })
    }
    if (reduce) {
      gsap.set(cover, { rotationY: -180, opacity: single() ? 0 : 1 })
      gsap.fromTo(tome, { opacity: 0 }, { opacity: 1, duration: 0.25, onComplete: done })
      return
    }
    gsap.set(tome, { opacity: 1 })
    tl = gsap
      .timeline({ onComplete: done })
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      .fromTo(book, f, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.75, ease: 'expo.inOut' }, 0)
      .to(cover, { rotationY: -180, duration: 0.95, ease: 'power3.inOut' }, 0.6)
      .fromTo(closeBtn, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.9)
    if (single()) tl.to(cover, { opacity: 0, duration: 0.3 }, 1.25)
  }

  function finish() {
    const spine = current
    tl?.kill()
    tl = null
    tome.hidden = true
    current = null
    busy = false
    startScroll()
    if (spine) {
      spine.classList.remove('is-out')
      spine.focus({ preventScroll: true })
    }
  }

  function close(instant = false) {
    if (!current) return
    if (instant || reduce) return finish()
    if (busy) return
    busy = true
    gsap.set(book, { x: 0, y: 0, scaleX: 1, scaleY: 1 })
    const f = fromSpine(current)
    tl = gsap
      .timeline({ onComplete: finish })
      .set(cover, { opacity: 1 })
      .to(closeBtn, { opacity: 0, duration: 0.2 }, 0)
      .to(cover, { rotationY: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
      .to(book, { ...f, duration: 0.55, ease: 'expo.inOut' }, 0.5)
      .to(backdrop, { opacity: 0, duration: 0.45 }, 0.55)
  }

  const onSpine = e => open(e.currentTarget)
  const onKey = e => {
    if (e.key === 'Escape' && current) {
      e.stopPropagation()
      close()
    }
  }
  const onTomeClick = e => {
    if (e.target.closest('a[href^="#/"]')) close(true)
  }
  const onClose = () => close()

  spines.forEach(s => s.addEventListener('click', onSpine))
  closeBtn.addEventListener('click', onClose)
  backdrop.addEventListener('click', onClose)
  tome.addEventListener('click', onTomeClick)
  document.addEventListener('keydown', onKey, true)

  return {
    destroy() {
      if (current) finish()
      spines.forEach(s => s.removeEventListener('click', onSpine))
      closeBtn.removeEventListener('click', onClose)
      backdrop.removeEventListener('click', onClose)
      tome.removeEventListener('click', onTomeClick)
      document.removeEventListener('keydown', onKey, true)
    }
  }
}
