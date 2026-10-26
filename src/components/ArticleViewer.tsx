import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface ArticleViewerProps {
  filePath: string;
  title: string;
  onBack: () => void;
}

function ArticleContent({ html, rawHtml, useIframe, title }: { html: string | null; rawHtml: string | null; useIframe: boolean; title: string }) {
  // Separate component to isolate dangerouslySetInnerHTML errors
  if (useIframe && rawHtml) {
    return (
      <iframe
        srcDoc={rawHtml}
        sandbox="allow-same-origin allow-scripts"
        className="w-full h-full border-none"
        title={title}
      />
    );
  }
  
  if (!html) return null;
  
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function ArticleViewer({ filePath, title, onBack }: ArticleViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [rawHtml, setRawHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useIframe, setUseIframe] = useState(true); // Default to iframe for safety
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setHtml(null);
    setRawHtml(null);

    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.text();
      })
      .then(text => {
        setRawHtml(text);

        try {
          const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const content = bodyMatch ? bodyMatch[1] : text;
          const styles: string[] = [];
          const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
          let m;
          while ((m = styleRegex.exec(text)) !== null) {
            styles.push(m[1]);
          }
          const fontRegex = /<link[^>]+href=['"]([^'"]+)['"][^>]*>/gi;
          const fontLinks: string[] = [];
          let fm;
          while ((fm = fontRegex.exec(text)) !== null) {
            if (fm[1].includes('fonts.googleapis') || fm[1].includes('fonts.gstatic')) {
              fontLinks.push(`<link rel="stylesheet" href="${fm[1]}">`);
            }
          }
          const baseUrl = filePath.substring(0, filePath.lastIndexOf('/') + 1);
          const wrapped = `
            <base href="${baseUrl}">
            ${fontLinks.join('\n')}
            <style>${styles.join('\n')}</style>
            <div class="article-content">${content}</div>
          `;
          setHtml(wrapped);
          setLoading(false);
        } catch (parseError) {
          console.warn('Failed to parse HTML, falling back to iframe:', parseError);
          setUseIframe(true);
          setLoading(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filePath, retryKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-sage" />
        <span className="ml-3 text-sage font-serif italic">Loading article...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <AlertCircle size={32} className="text-coral mb-3" />
        <p className="text-ink-soft font-serif italic mb-4">Could not load article.</p>
        <div className="flex gap-3">
          <button onClick={() => setRetryKey(k => k + 1)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sage text-white rounded-xl text-sm font-bold hover:bg-sage-light transition-colors cursor-pointer">
            <RefreshCw size={14} /> Retry
          </button>
          <button onClick={onBack}
            className="px-4 py-2 bg-white border border-border text-ink-soft rounded-xl text-sm font-bold hover:bg-sage-pale/50 transition-colors cursor-pointer">
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-sage hover:bg-sage-pale/50 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-sm font-semibold text-ink truncate">{title}</span>
          <div className="ml-auto">
            <button onClick={() => setUseIframe(!useIframe)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-sage hover:bg-sage-pale/50 rounded-xl transition-colors cursor-pointer">
              {useIframe ? (
                <> <Minimize2 size={16} /> Simple View </ >
              ) : (
                <> <Maximize2 size={16} /> Full-Page View </ >
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ArticleContent 
          html={html} 
          rawHtml={rawHtml} 
          useIframe={useIframe} 
          title={title} 
        />
      </div>
    </div>
  );
}
