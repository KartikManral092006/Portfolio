import { site, manifesto, marquee, skills, offline, stats, projects, stack, shelf, training, goals } from './data.js'

const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const letters = (word, cls = 'ch') =>
  [...word].map(c => `<span class="${cls}" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')

const byslug = slug => projects.find(p => p.slug === slug)

const odometer = value =>
  [...value]
    .map(c =>
      /\d/.test(c)
        ? `<span class="odo__col" data-digit="${c}"><span class="odo__reel">${'01234567890123456789'
            .split('')
            .map(d => `<span>${d}</span>`)
            .join('')}</span></span>`
        : `<span class="odo__sep">${esc(c)}</span>`
    )
    .join('')

const item = o => `<li${o.todo ? ' class="todo"' : ''}>${esc(o.text)}</li>`

const shelfBook = b =>
  b.closed
    ? `
        <div class="spine spine--${b.style} spine--closed" aria-hidden="true" style="--h: ${b.h}; --w: ${b.w}px">
          <span class="spine__title">${esc(b.title)}</span>
        </div>`
    : `
        <button class="spine spine--${b.style}" type="button" data-book="${b.id}" data-style="${b.style}" data-title="${esc(b.title)}" data-cursor="Open" aria-haspopup="dialog" style="--h: ${b.h}; --w: ${b.w}px">
          <span class="spine__title">${esc(b.title)}</span>
        </button>`

function shelfView() {
  const half = Math.ceil(shelf.length / 2)
  return `
      <div class="shelf" aria-label="Bookshelf. Three of the books open into a chapter about me.">
        <div class="shelf__side">${shelf.slice(0, half).map(shelfBook).join('')}</div>
        <div class="shelf__side">${shelf.slice(half).map(shelfBook).join('')}</div>
      </div>`
}

function bookPages(id) {
  if (id === 'build') {
    return {
      lead: `<h2>What I build</h2><p>${esc(site.lede)}</p>`,
      body: `<ul class="tome__list">${projects
        .map(p => `<li><a href="#/work/${p.slug}"><strong>${esc(p.title)}</strong> <span>${esc(p.kind)}</span></a><p>${esc(p.line)}</p></li>`)
        .join('')}</ul>`
    }
  }
  if (id === 'train') {
    const cal = offline.find(o => o.word === 'Calisthenics')
    return {
      lead: `<h2>Calisthenics</h2><p>${esc(cal.text)}</p>`,
      body: `<h3>What I can do now</h3><ul class="tome__list tome__list--plain">${training.now.map(item).join('')}</ul>
        <h3>Working towards</h3><ul class="tome__list tome__list--plain">${item(training.next)}</ul>`
    }
  }
  if (id === 'unwritten') {
    return {
      lead: `<h2>Unwritten</h2><p>The book I’m still writing. These are its next chapters.</p>`,
      body: `<ul class="tome__goals">${goals.map(item).join('')}</ul>`
    }
  }
}

function tomeView() {
  const templates = shelf
    .filter(b => !b.closed)
    .map(b => {
      const pg = bookPages(b.id)
      return `<template id="tome-${b.id}"><div data-lead>${pg.lead}</div><div data-body>${pg.body}</div></template>`
    })
    .join('')
  return `
  <div class="tome" role="dialog" aria-modal="true" hidden>
    <div class="tome__backdrop"></div>
    <div class="tome__book">
      <div class="tome__page tome__page--r" data-lenis-prevent></div>
      <div class="tome__cover">
        <div class="tome__front"><span class="tome__front-title"></span></div>
        <div class="tome__inside" data-lenis-prevent></div>
      </div>
    </div>
    <button class="tome__close pill" type="button" data-magnetic><span class="pill__text">Close book</span></button>
  </div>
  ${templates}`
}

const reel = p => `
  <a class="reel" href="#/work/${p.slug}" data-cursor="Open case">
    <div class="reel__visual"><canvas data-visual="${p.visual}" aria-hidden="true"></canvas></div>
    <div class="reel__info">
      <p class="reel__kind">${esc(p.kind)}</p>
      <h3 class="reel__title">${esc(p.title)}</h3>
      <p class="reel__line">${esc(p.line)}</p>
      <ul class="reel__stack">${p.stack.slice(0, 4).map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>
  </a>`

export function homeView() {
  const words = manifesto.split(' ').map(w => `<span class="w">${esc(w)}</span>`).join(' ')
  const strip = [...marquee, ...marquee].map(m => `<span>${esc(m)}</span><i></i>`).join('')
  return `
  <section class="hero" aria-labelledby="hero-name">
    <div class="hero__ambient" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
    <canvas class="hero__pages" aria-hidden="true"></canvas>
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="hero__inner">
      <h1 class="hero__name" id="hero-name" aria-label="${esc(site.first)} ${esc(site.last)}">
        <span class="hero__line">${letters(site.first)}</span>
        <span class="hero__line hero__line--r">${letters(site.last)}</span>
      </h1>
      ${shelfView()}
      <div class="hero__foot">
        <p class="hero__lede">${esc(site.lede)}</p>
        <div class="hero__aside">
          <p class="hero__hint">Pick a book off the shelf to read a chapter about me.</p>
          <p class="hero__clock"><span data-clock>--:--</span> in India</p>
        </div>
      </div>
    </div>
    <canvas class="hero__portrait" role="img" aria-label="Portrait of ${esc(site.first)} ${esc(site.last)}"></canvas>
  </section>

  ${tomeView()}

  <section class="manifesto" aria-label="How I work">
    <p class="manifesto__text">${words}</p>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee__track">${strip}${strip}</div></div>

  <section class="about" id="skills" aria-labelledby="skills-title">
    <div class="about__head">
      <h2 class="display" id="skills-title">Skills</h2>
      <p>The languages, frameworks and tools I work with.</p>
    </div>
    <div class="about__grid">
      ${skills
        .map(
          g => `
        <article class="disc">
          <h3 class="disc__name">${esc(g.group)}</h3>
          <ul class="chips chips--skills">${g.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        </article>`
        )
        .join('')}
    </div>
  </section>

  <section class="stats" aria-label="Numbers from my projects">
    ${stats
      .map(
        s => `
      <div class="stat">
        <p class="stat__num" aria-label="${esc(s.value + (s.suffix || ''))}"><span class="odo" aria-hidden="true">${odometer(
          s.value
        )}</span>${s.suffix ? `<span class="stat__suffix" aria-hidden="true">${esc(s.suffix)}</span>` : ''}</p>
        <p class="stat__label">${esc(s.label)}</p>
      </div>`
      )
      .join('')}
  </section>

  <section class="work" id="work" aria-labelledby="work-title">
    <div class="work__head">
      <h2 class="display" id="work-title">Selected work</h2>
      <p class="work__intro">Four projects across AI agents, retrieval, smart contracts and developer tools. Open one for the problem, the hard part and the numbers.</p>
    </div>
    <div class="work__pin">
      <div class="work__track">
        ${projects.map(reel).join('')}
        <div class="work__end">
          <p>More on</p>
          <a href="${esc(site.github)}" target="_blank" rel="noopener" data-magnetic data-cursor="GitHub">GitHub</a>
        </div>
      </div>
    </div>
  </section>

  <section class="stack" id="stack" aria-labelledby="stack-title">
    <div class="stack__head">
      <h2 class="display" id="stack-title">What I build with</h2>
      <p>Every tool here shipped in a project you can open. Expand a row to see where.</p>
    </div>
    <div class="stack__rows">
      ${stack
        .map(
          (g, i) => `
        <div class="srow">
          <button class="srow__btn" type="button" aria-expanded="false" aria-controls="srow-${i}" data-cursor="${'Expand'}">
            <span class="srow__name">${esc(g.name)}</span>
            <span class="srow__count">${g.items.length} tools</span>
            <span class="srow__icon" aria-hidden="true"></span>
          </button>
          <div class="srow__panel" id="srow-${i}" role="region">
            <div class="srow__inner">
              <ul class="chips">${g.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
              <p class="srow__proof">Shipped in ${g.proof
                .map(s => `<a href="#/work/${s}">${esc(byslug(s).title)}</a>`)
                .join(', ')}</p>
            </div>
          </div>
        </div>`
        )
        .join('')}
    </div>
  </section>

<section class="offline" id="offline" aria-labelledby="offline-title">
    <h2 class="offline__title" id="offline-title">Off the keyboard</h2>
    <div class="offline__grid">
      ${offline
        .map(
          o => `
        <div class="hobby">
          <p class="hobby__word" aria-label="${esc(o.word)}">${letters(o.word, 'hb')}</p>
          <div class="hobby__body">
            <p class="hobby__text">${esc(o.text)}</p>
            <ul class="chips chips--ink">${o.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
        </div>`
        )
        .join('')}
    </div>
  </section>

  ${contactView()}`
}

function contactView() {
  const link = (href, label) =>
    `<a class="pill" href="${esc(href)}" target="_blank" rel="noopener" data-magnetic><span class="pill__text">${label}</span></a>`
  const handle = site.twitter
    .trim()
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
  const twitter = handle ? link(`https://x.com/${encodeURIComponent(handle)}`, 'X (Twitter)') : ''
  const discord = site.discord
    ? `<button class="pill" type="button" data-copy="${esc(site.discord)}" data-label="Copy Discord" data-magnetic><span class="pill__text">Copy Discord</span></button>`
    : ''
  const linkedin = site.linkedin ? link(site.linkedin, 'LinkedIn') : ''
  const resume = site.resume ? link(site.resume, 'Résumé') : ''
  return `
  <section class="contact" id="contact" aria-labelledby="contact-title">
    <p class="contact__pre">Have a hard problem worth building?</p>
    <h2 class="contact__title" id="contact-title">
      <a class="contact__big" href="mailto:${esc(site.email)}" data-cursor="Write to me" aria-label="Email Kartik">
        <span class="contact__line">${letters('Let’s build', 'cl')}</span>
        <span class="contact__line">${letters('it together', 'cl')}</span>
      </a>
    </h2>
    <div class="contact__row">
      <button class="pill pill--accent" type="button" data-copy="${esc(site.email)}" data-label="Copy email" data-magnetic>
        <span class="pill__text">Copy email</span>
      </button>
      <a class="pill" href="${esc(site.github)}" target="_blank" rel="noopener" data-magnetic><span class="pill__text">GitHub</span></a>
      ${twitter}${discord}${linkedin}${resume}
    </div>
    <footer class="foot">
      <p>© 2026 ${esc(site.first)} ${esc(site.last)}. ${esc(site.role)}, ${esc(site.school)}.</p>
    </footer>
  </section>`
}

export function projectView(slug) {
  const i = projects.findIndex(p => p.slug === slug)
  const p = projects[i]
  const next = projects[(i + 1) % projects.length]
  const links = p.links.length
    ? `<div class="case__links">${p.links
        .map(
          l =>
            `<a class="pill" href="${esc(l.href)}" target="_blank" rel="noopener" data-magnetic><span class="pill__text">${esc(
              l.label
            )}</span></a>`
        )
        .join('')}</div>`
    : `<p class="case__nolink">Not public yet. Ask me for a walkthrough.</p>`
  return `
  <article class="case" aria-labelledby="case-title">
    <header class="case__hero">
      <p class="case__kind">${esc(p.kind)}</p>
      <h1 class="case__title" id="case-title" aria-label="${esc(p.title)}">${letters(p.title)}</h1>
      <p class="case__line">${esc(p.line)}</p>
      <dl class="case__meta">
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
        <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
      </dl>
    </header>

    <div class="case__visual"><canvas data-visual="${p.visual}" data-large aria-hidden="true"></canvas></div>

    <div class="case__body">
      <section class="case__block">
        <h2>The problem</h2>
        <p class="case__problem">${esc(p.problem)}</p>
      </section>
      <section class="case__block">
        <h2>What I built</h2>
        <ul class="case__list">${p.built.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      </section>
      <section class="case__block">
        <h2>The hard part</h2>
        <ul class="case__list">${p.hard.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      </section>
      <section class="case__block">
        <h2>Stack</h2>
        <ul class="chips chips--dark">${p.stack.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </section>
    </div>

    <section class="case__results" aria-labelledby="results-title">
      <h2 id="results-title">Results</h2>
      <div class="case__grid">
        ${p.results
          .map(r => `<div class="res"><p class="res__value">${esc(r.value)}</p><p class="res__label">${esc(r.label)}</p></div>`)
          .join('')}
      </div>
      ${links}
    </section>

    <a class="case__next" href="#/work/${next.slug}" data-cursor="Next case">
      <span class="case__next-label">Next project</span>
      <span class="case__next-title">${letters(next.title, 'nx')}</span>
      <span class="case__next-kind">${esc(next.kind)}</span>
    </a>
  </article>`
}

export function notFoundView() {
  return `
  <section class="lost">
    <h1 class="display">Nothing here</h1>
    <p>That project doesn’t exist. Head back to the work.</p>
    <a class="pill pill--accent" href="#/" data-magnetic><span class="pill__text">Back to home</span></a>
  </section>`
}

export { byslug }
