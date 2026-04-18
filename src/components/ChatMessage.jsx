import { Brain, User2 } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * ChatMessage — renders a single chat bubble.
 *
 * Props:
 *  message — { id, role: 'user'|'assistant', content, time }
 *  animate — whether to apply slide-up animation (default: true)
 */
export default function ChatMessage({ message, animate = true }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        animate && 'animate-slide-up'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-brand-500 to-brand-700'
            : 'bg-gradient-to-br from-violet-500 to-brand-600'
        )}
      >
        {isUser
          ? <User2 size={15} className="text-white" />
          : <Brain size={15} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-card',
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white text-slate-700 border border-surface-border rounded-tl-sm'
        )}
      >
        {message.content}
        <span
          className={cn(
            'block text-[10px] mt-1.5 text-right',
            isUser ? 'text-brand-200' : 'text-slate-400'
          )}
        >
          {message.time}
        </span>
      </div>
    </div>
  );
}
