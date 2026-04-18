import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const perks = [
  'Upload unlimited PDFs',
  'AI-powered summaries',
  'Document Q&A chat',
  'Keyword extraction',
];

export default function SignUpPage() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to backend auth endpoint
    alert('Sign-up submitted — connect to your FastAPI /auth/register endpoint.');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left — pitch */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-md">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Docu<span className="text-brand-600">Mind</span><span className="text-slate-400 font-light"> AI</span>
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 leading-snug">
              Start understanding your<br />
              <span className="text-brand-600">documents smarter.</span>
            </h2>
            <p className="text-slate-500 mt-3 text-sm leading-relaxed">
              Join thousands of researchers, students, and professionals who use DocuMind AI to save hours of reading every week.
            </p>
          </div>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div className="w-full max-w-sm mx-auto md:mx-0">
          <div className="md:hidden flex flex-col items-center mb-8 gap-2">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-md">
              <Brain size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500">Free forever, no credit card needed</p>
          </div>

          <div className="glass-card p-8 space-y-5">
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-900">Create your account</h1>
              <p className="text-xs text-slate-500 mt-1">Free forever · No credit card needed</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide" htmlFor="signup-email">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm hover:shadow-md transition-all duration-200 mt-2"
              >
                Create account <ArrowRight size={15} />
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
