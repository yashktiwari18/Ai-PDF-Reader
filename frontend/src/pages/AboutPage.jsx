import { Brain, Target, Users, Lightbulb, Github, Linkedin } from 'lucide-react';

const team = [
  { name: 'Aria Sharma', role: 'AI / ML Engineer', avatar: 'AS', color: 'from-brand-400 to-brand-600' },
  { name: 'Rohan Mehta', role: 'Full-Stack Developer', avatar: 'RM', color: 'from-violet-400 to-purple-600' },
  { name: 'Priya Nair', role: 'UX / Product Designer', avatar: 'PN', color: 'from-emerald-400 to-teal-600' },
];

const values = [
  { icon: <Brain size={20} />, title: 'AI-First', body: 'We build every feature around what AI can do best — grounding answers in real document context.' },
  { icon: <Target size={20} />, title: 'Accuracy', body: 'Every response is backed by retrieval, not hallucination. Source-grounded answers only.' },
  { icon: <Users size={20} />, title: 'For Everyone', body: 'No ML background needed. Upload a PDF and start getting insights in under 10 seconds.' },
  { icon: <Lightbulb size={20} />, title: 'Open Research', body: 'Built as a capstone research project, leveraging the latest advances in RAG and LLMs.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 rounded-full mb-5">
          <Brain size={13} /> About DocuMind AI
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Turning Dense Documents Into<br />
          <span className="text-brand-600">Clear Conversations</span>
        </h1>
        <p className="mt-5 text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
          DocuMind AI is a capstone research project that combines Retrieval-Augmented Generation (RAG),
          vector embeddings, and large language models to make any PDF document interactive, searchable,
          and instantly understandable.
        </p>
      </div>

      {/* Mission */}
      <div className="glass-card p-8 md:p-12 text-center">
        <p className="text-xl font-medium text-slate-700 leading-relaxed max-w-3xl mx-auto">
          "Our mission is to eliminate the time wasted reading through hundreds of pages — and replace it
          with a conversation that gives you exactly what you need, instantly."
        </p>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {values.map(({ icon, title, body }) => (
            <div key={title} className="glass-card p-5 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">The Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {team.map(({ name, role, avatar, color }) => (
            <div key={name} className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:shadow-lifted transition-shadow duration-300">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                {avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <div className="flex gap-2 mt-1">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                  <Github size={15} />
                </button>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition">
                  <Linkedin size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {['React', 'TailwindCSS', 'FastAPI', 'Python', 'LangChain', 'FAISS', 'OpenAI / Gemini', 'PyMuPDF', 'Vite'].map((t) => (
            <span key={t} className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full border border-slate-200">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
