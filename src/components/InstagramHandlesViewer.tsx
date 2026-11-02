import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface InstagramHandle {
  name: string;
  desc: string;
  url: string;
}

interface InstagramHandlesViewerProps {
  handles: InstagramHandle[];
  title: string;
  onBack: () => void;
}

export function InstagramHandlesViewer({ handles, title, onBack }: InstagramHandlesViewerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-sage hover:bg-sage-pale/50 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-sm font-semibold text-ink truncate">{title}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="space-y-3 max-w-xl mx-auto">
          {handles.map((handle, index) => (
            <a
              key={handle.name}
              href={handle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-4 bg-white/60 border border-border rounded-xl hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-sage-pale/50">
                <span className="text-lg font-bold text-sage">@{handle.name.slice(1).substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ink font-mono text-base">{handle.name}</span>
                  <ExternalLink className="text-ink-soft/40 group-hover:text-sage transition-colors shrink-0" size={14} />
                </div>
                <p className="text-sm text-ink-soft/70 line-clamp-2">{handle.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}