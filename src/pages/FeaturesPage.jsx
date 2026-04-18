import { Zap, FileSearch, MessageSquare, ShieldCheck, BarChart2, Layers } from 'lucide-react';

const features = [
  {
    icon: <FileSearch size={24} />,
    title: 'Smart PDF Parsing',
    description: 'Upload any PDF and instantly extract clean, structured text ready for AI analysis — no formatting lost.',
    color: 'from-blue-400 to-brand-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant AI Summaries',
    description: 'Get concise, accurate summaries of lengthy documents in seconds using state-of-the-art language models.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Document Chat (RAG)',
    description: 'Ask any question about your document and receive precise, context-aware answers backed by the source text.',
    color: 'from-violet-400 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Privacy First',
    description: 'Your documents are processed securely and never stored beyond your session. Your data stays yours.',
    color: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Keyword Extraction',
    description: 'Automatically surface the most important keywords and topics from any document for quick scanning.',
    color: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50',
  },
  {
    icon: <Layers size={24} />,
    title: 'Multi-Document Support',
    description: 'Upload and switch between multiple PDFs in a single session — manage your entire research library.',
    color: 'from-cyan-400 to-brand-500',
    bg: 'bg-cyan-50',
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 rounded-full mb-4">
          What DocuMind AI can do
        </span>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Powerful Features for<br />
          <span className="text-brand-600">Smarter Document Intelligence</span>
        </h1>
        <p className="mt-4 text-slate-500 max-w-xl mx-auto text-base">
          Everything you need to understand, summarize, and converse with your documents — powered by cutting-edge AI.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon, title, description, color, bg }) => (
          <div
            key={title}
            className="glass-card p-6 flex flex-col gap-4 hover:shadow-lifted transition-shadow duration-300 group"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
              <div className={`bg-gradient-to-br ${color} w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                {icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Try it now — it&apos;s free
        </a>
      </div>
    </div>
  );
}
