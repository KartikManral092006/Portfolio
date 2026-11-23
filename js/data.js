export const site = {
  first: 'Kartik',
  last: 'Manral',
  role: 'Final-year B.Tech student',
  school: 'Graphic Era Hill University',
  lede: 'Final-year B.Tech student. I build backends, generative AI and workflow automations, and ship them fast with AI as my pair-programmer.',
  email: 'kartikmanral.work@gmail.com',
  github: 'https://github.com/KartikManral092006',
  linkedin: '',
  resume: '',
  twitter: '@manralkartik09',
  discord: 'kartikmanral2175'
}

export const manifesto =
  'I build backend systems, generative AI applications and workflow automations, from the data model to deployment. My focus is reliability: models measured against baselines, secure data, tested code and human approval where it matters.'

export const marquee = ['Backend', 'Generative AI', 'Workflow automation', 'Vibe coding']

export const skills = [
  { group: 'Languages', items: ['C', 'C++', 'JavaScript', 'TypeScript', 'Python', 'SQL'] },
  { group: 'Web development', items: ['MERN stack', 'FastAPI', 'WordPress development', 'Docker'] },
  { group: 'AI and agents', items: ['LangChain', 'LangGraph', 'MCPs', 'Claude Skills'] },
  { group: 'Automation', items: ['n8n', 'Zapier', 'Business workflow automation'] }
]

export const offline = [
  {
    word: 'Reading',
    text: 'Books on self-improvement, business and philosophy.',
    tags: ['Self-improvement', 'Business', 'Philosophy']
  },
  {
    word: 'Calisthenics',
    text: 'Bodyweight strength training, built one rep at a time.',
    tags: ['Bodyweight strength']
  }
]

export const stats = [
  { value: '0.95', label: 'Held-out AUC of Flux’s vendor-risk model. A classic scorecard scored 0.43.' },
  { value: '97', suffix: '%', label: 'Line coverage across the 75 smart-contract tests in Lien.' },
  { value: '30', label: 'Live race attacks run against Lien’s contracts. None left it insolvent.' }
]

export const projects = [
  {
    slug: 'lien',
    title: 'Lien',
    kind: 'Cross-chain lending protocol',
    year: '2026',
    role: 'Solo: contracts, bots, dashboard',
    status: 'Live on testnet.',
    line: 'Collateral on Base. Credit on Unichain. One ledger on Reactive.',
    visual: 'lien',
    stack: ['Solidity', 'Foundry', 'Reactive Network', 'Base Sepolia', 'Unichain Sepolia', 'TypeScript'],
    problem:
      'Borrowing against collateral that lives on another chain usually means a bridge and a wrapped token. And every second between a price move on one chain and the reaction on the other is a second in which a borrower can fall further under water.',
    built: [
      'A reactive ClearingHouse contract on Reactive Lasna that holds the only cross-chain ledger. Credit limits, withdrawals, liquidations and protection are all decided there.',
      'Two-phase withdrawals, so withdrawing on Base and borrowing on Unichain at the same instant cannot leave the protocol short.',
      'An optional shield that repays part of a loan in the same callback that would have flagged it for liquidation.',
      'A hosted dashboard where anyone can connect a wallet, borrow, add a shield and crash the test price, plus a replay of a recorded rescue for people without a wallet.'
    ],
    hard: [
      'Two chains that never talk to each other must agree on one number per user. I fuzzed the contracts with randomly ordered cross-chain delivery to prove the ledger stays consistent.',
      'Measuring latency honestly: block timestamps on-chain, and wall-clock from the bots, reported as medians rather than best cases.'
    ],
    results: [
      { value: '2–3 s', label: 'Median block-to-block loop across three chains' },
      { value: '75', label: 'Tests, including fuzzing, with 97% line coverage' },
      { value: '0 / 30', label: 'Live race attacks where both sides succeeded' }
    ],
    links: [
      { label: 'Open the dashboard', href: 'https://kartikmanral092006.github.io/Lien/' },
      { label: 'Watch the demo', href: 'https://youtu.be/J5_mckbzYFo' },
      { label: 'Read the code', href: 'https://github.com/KartikManral092006/Lien' }
    ]
  },
  {
    slug: 'flux',
    title: 'Flux',
    kind: 'AI vendor-risk platform',
    year: '2026',
    role: 'Solo: data model, API, ML, frontend',
    status: 'Built and evaluated locally on seeded data.',
    line: 'Spots failing suppliers before the scorecard does.',
    visual: 'flux',
    stack: ['Express 5', 'PostgreSQL 17', 'pgvector', 'Row-Level Security', 'React 19', 'MUI X', 'Groq', 'Ollama'],
    problem:
      'Procurement teams rate vendors on static scorecards that lag reality. By the time a supplier’s delivery or quality slips far enough to show up, the damage is already on the shop floor.',
    built: [
      'A multi-tenant SaaS where Postgres row-level security isolates every company’s data at the database, not just in the API.',
      'A risk score with z-score alerts measured against peer medians, so one bad week at a small vendor doesn’t drown out a real decline.',
      'An assistant that routes each question to a vendor lookup, guarded text-to-SQL on a read-only role, or retrieval over vendor notes.',
      'Hybrid retrieval: pgvector similarity and full-text search fused with reciprocal rank fusion.',
      'Roles, invites, an audit log, CSV import and rate-limited login.'
    ],
    hard: [
      'Vector search and row-level security fight each other: filtered HNSW scans return too few rows. Iterative index scans fixed recall under tenant isolation.',
      'Letting an LLM write SQL safely: a read-only database role, a revoked set_config, and a SQL guard with its own test suite.'
    ],
    results: [
      { value: '0.95', label: 'Held-out AUC, against 0.43 for a scorecard (seeded synthetic data)' },
      { value: '7 / 8', label: 'Planted degradations caught, at about 1.1 false alarms a month' },
      { value: '242', label: 'Automated checks across five suites' }
    ],
    links: []
  },
  {
    slug: 'planner',
    title: 'Planner',
    kind: 'Multi-agent AI system',
    year: '2026',
    role: 'Re-architecture of an open-source LangGraph planner',
    status: 'Live. Evaluation against the baseline is in progress.',
    line: 'Agents do the research. Code does the maths. You approve.',
    visual: 'planner',
    stack: ['Python', 'LangGraph', 'Groq', 'Tavily', 'FastAPI', 'React 19', 'TypeScript'],
    problem:
      'The open-source planner I started from let the LLM do budget arithmetic, quoted prices with no source, graded its own work, ignored rejections and blocked the API while it thought.',
    built: [
      'Three researcher agents for transport, stays and activities that run in parallel with web search and return cost items with sources.',
      'A Python budget calculator, so totals are computed, not generated.',
      'Rule checks before an LLM evaluator, with a reviser loop when either one fails.',
      'Human approval with a feedback router that re-runs only the researcher your feedback is about.',
      'FastAPI background runs with retries, and a React and TypeScript frontend.'
    ],
    hard: [
      'Fitting a 20 to 30 call graph into a free tier of 8k tokens a minute: a rate limiter, retries with backoff and trimmed search results.',
      'Routing free-text feedback like “cheaper hotel, same flights” to exactly the agents that need to run again.'
    ],
    results: [
      { value: '55', label: 'Tests, 45 backend and 10 frontend, none needing API keys' },
      { value: '3×', label: 'Researchers running in parallel instead of in sequence' },
      { value: '10', label: 'Trip eval set against a single-prompt baseline' }
    ],
    links: [{ label: 'Plan a trip', href: 'https://trip-planner-orcin-two.vercel.app' }]
  },
  {
    slug: 'tollgate',
    title: 'Tollgate',
    kind: 'Team approvals for AI coding agents',
    year: '2026',
    role: 'Solo: CLI, web app, realtime room',
    status: 'Live, with the CLI published on npm.',
    line: 'Your coding agent moves fast. Production waits for your team.',
    visual: 'tollgate',
    stack: ['Next.js 16', 'React 19', 'Prisma 7', 'PostgreSQL', 'Redis', 'Nexconn SDK', 'Node CLI', 'Vitest'],
    problem:
      'Coding agents now run real commands: vercel --prod, prisma migrate deploy, npm publish. Claude Code’s permission prompt asks one person at one laptop, right now, and a plain “no” stops the agent without telling it what to do instead.',
    built: [
      'A Claude Code hook in a zero-dependency CLI that pauses only risky commands (deploys, migrations, publishes and deletes) and raises a gate for the team.',
      'A live team room on the Nexconn Chat SDK, where gate cards update their votes and outcome on every device, phones included.',
      'Deny with a reason, and the agent receives it as its next instruction and revises its plan.',
      'Context before the decision: the commit a deploy ships, the exact version a publish releases, pending migrations, and how the team decided the same command before.',
      'Quorum per preset, hold-to-approve for production, no approving your own agent, and an audit log with decision metrics.'
    ],
    hard: [
      'One rule engine, three runtimes: preset matching, secret redaction and quorum rules are written once and run in the browser, on the server and inside the CLI bundle.',
      'Seeing through wrappers: pnpm db:deploy is resolved to prisma migrate deploy and shown with its migration SQL, so a script name can’t hide a risky command.',
      'Failing safe: Postgres is the source of truth, so gates and votes keep working if the realtime service is down, and unanswered gates park instead of blocking the agent.'
    ],
    results: [
      { value: '400+', label: 'Unit and real-Postgres integration tests' },
      { value: 'v0.3', label: 'tollgate-cli on npm, with zero runtime dependencies' },
      { value: '2', label: 'Approvals required before a production deploy runs' }
    ],
    links: [
      { label: 'Open the app', href: 'https://toll-gate-mo7d.vercel.app' },
      { label: 'Try the demo', href: 'https://toll-gate-mo7d.vercel.app/#demo' },
      { label: 'Read the code', href: 'https://github.com/KartikManral092006/TollGate' }
    ]
  }
]

export const stack = [
  {
    name: 'AI and agents',
    items: ['LangGraph', 'LangChain', 'RAG', 'Hybrid retrieval', 'Text-to-SQL', 'Groq', 'Ollama', 'LLM evaluation'],
    proof: ['flux', 'planner']
  },
  {
    name: 'Backend and data',
    items: ['Python', 'FastAPI', 'Node.js', 'Express', 'PostgreSQL', 'pgvector', 'Row-level security', 'Prisma', 'Redis', 'Docker'],
    proof: ['flux', 'planner', 'tollgate']
  },
  {
    name: 'Frontend',
    items: ['TypeScript', 'React 19', 'Next.js', 'Tailwind CSS', 'Vite', 'MUI', 'Three.js', 'GSAP'],
    proof: ['flux', 'planner', 'tollgate']
  },
  {
    name: 'Smart contracts',
    items: ['Solidity', 'Foundry', 'Reactive Network', 'Fuzz testing', 'Cross-chain callbacks'],
    proof: ['lien']
  }
]

export const shelf = [
  { id: 'build', title: 'What I build', style: 'accent', h: 0.96, w: 64 },
  { id: 'train', title: 'Calisthenics', style: 'paper', h: 0.86, w: 58 },
  { id: 'self', title: 'Self-improvement', style: 'grey', h: 1, w: 52, closed: true },
  { id: 'business', title: 'Business', style: 'outline', h: 0.8, w: 60, closed: true },
  { id: 'philosophy', title: 'Philosophy', style: 'paper', h: 0.92, w: 54, closed: true },
  { id: 'unwritten', title: 'Unwritten', style: 'dashed', h: 0.88, w: 60 }
]

export const training = {
  now: [{ todo: true, text: 'Add the skills you can do now, for example your max pull-ups' }],
  next: { todo: true, text: 'Add the skill you are working towards' }
}

export const goals = [
  { todo: true, text: 'Add your first goal' },
  { todo: true, text: 'Add your second goal' },
  { todo: true, text: 'Add your third goal' }
]
