import {
  Compass, DollarSign, Search, Megaphone, Workflow, Database, Target,
} from 'lucide-react'

export const T = {
  bg: '#0E1013',
  surface: '#15181C',
  surfaceRaised: '#1B1F24',
  border: '#262B31',
  borderSoft: '#1F2328',
  text: '#E7E9EC',
  textDim: '#9AA1AB',
  textFaint: '#5F6670',
  accent: '#6C8CFF',
  accentDim: '#3B4A80',
  green: '#4ADE80',
  amber: '#F5B94D',
  red: '#F2685C',
}

export const AGENTS = [
  { id: 'chief-of-staff', name: 'Chief of Staff', title: 'General coordination & planning', icon: Compass, status: 'idle' },
  { id: 'finance', name: 'Finance', title: 'Financial analysis, accounting & budgeting', icon: DollarSign, status: 'idle' },
  { id: 'research', name: 'Research', title: 'Research & Intelligence', icon: Search, status: 'idle' },
  { id: 'marketing', name: 'Marketing', title: 'Marketing strategy & campaign analysis', icon: Megaphone, status: 'idle' },
  { id: 'operations', name: 'Operations', title: 'Processes, automation & operational work', icon: Workflow, status: 'idle' },
  { id: 'data', name: 'Data', title: 'Scraping, datasets & data analysis', icon: Database, status: 'idle' },
]

export const WARROOM_AGENT = {
  id: 'warroom',
  name: 'War Room',
  title: 'Think out loud, decide, and turn it into work',
  icon: Target,
  status: 'idle',
}

export const STATUS_META = {
  working: { label: 'Working', color: T.accent },
  waiting: { label: 'Needs approval', color: T.amber },
  idle: { label: 'Idle', color: T.textFaint },
  done: { label: 'Done', color: T.green },
}

export const INITIAL_PROJECTS = [
  { id: 'p1', name: 'Malaysian Advertising Intelligence', agent: 'research', tasks: 5, done: 2 },
  { id: 'p2', name: 'Beef Business', agent: 'operations', tasks: 8, done: 3 },
  { id: 'p3', name: 'AI Office', agent: 'chief-of-staff', tasks: 4, done: 4 },
  { id: 'p4', name: 'Social Enterprise', agent: 'marketing', tasks: 6, done: 1 },
  { id: 'p5', name: 'Scraping Business', agent: 'data', tasks: 3, done: 0 },
]

export const INITIAL_TASKS = [
  { id: 't1', title: 'Analyse TikTok ad landscape', project: 'Malaysian Advertising Intelligence', agent: 'research', status: 'Done', priority: 'High', due: 'Aug 12' },
  { id: 't2', title: 'Analyse Google Maps business listings', project: 'Malaysian Advertising Intelligence', agent: 'research', status: 'Done', priority: 'High', due: 'Aug 13' },
  { id: 't3', title: 'Compare platform CPMs', project: 'Malaysian Advertising Intelligence', agent: 'research', status: 'In Progress', priority: 'High', due: 'Aug 16' },
  { id: 't4', title: 'Produce research report', project: 'Malaysian Advertising Intelligence', agent: 'research', status: 'Todo', priority: 'Medium', due: 'Aug 18' },
  { id: 't5', title: 'Reconcile July invoices', project: 'Beef Business', agent: 'finance', status: 'Waiting', priority: 'High', due: 'Aug 17' },
  { id: 't6', title: 'Draft Q3 budget', project: 'Beef Business', agent: 'finance', status: 'Todo', priority: 'Medium', due: 'Aug 22' },
  { id: 't7', title: 'Set up n8n invoice pipeline', project: 'AI Office', agent: 'operations', status: 'Done', priority: 'Medium', due: 'Aug 10' },
  { id: 't8', title: 'Draft launch campaign brief', project: 'Social Enterprise', agent: 'marketing', status: 'In Progress', priority: 'Low', due: 'Aug 20' },
]

export const TOOLS = ['Apify', 'Web Search', 'Database', 'n8n']

export const AGENT_WELCOME = (name) =>
  `You're talking with **${name}**. Ask a question, hand off a task, or @mention another employee to loop them in.`

export const WARROOM_WELCOME =
  "This is your sparring space — not tied to any department. Bounce ideas around, argue it out, and once something's decided, hover a reply and turn it straight into a task or project. Type **@** to loop in an employee directly instead."

export function buildInitialMessages() {
  const initial = { warroom: [{ role: 'assistant', text: WARROOM_WELCOME }] }
  AGENTS.forEach((a) => {
    initial[a.id] = [{ role: 'assistant', text: AGENT_WELCOME(a.name) }]
  })
  return initial
}
