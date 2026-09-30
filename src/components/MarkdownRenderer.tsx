import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950/80 text-cyan-300 font-mono text-[12px] border border-slate-800"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-mono uppercase font-semibold text-slate-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[12px] font-mono text-slate-200 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isStreaming = false,
}) => {
  return (
    <div className={`prose prose-invert max-w-none text-xs sm:text-[13px] leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock as unknown as React.ComponentType<React.ComponentProps<'code'>>,
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white mt-3 mb-2 pb-1 border-b border-slate-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-slate-100 mt-2.5 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-cyan-300 mt-2 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-200 mt-1.5 mb-1">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 pl-4 list-disc marker:text-cyan-400 text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-cyan-400 text-slate-200 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3 border-l-2 border-cyan-500 bg-slate-950/40 py-1 pr-2 rounded-r-lg italic text-slate-300">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-[11px] sm:text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-950/80 text-slate-300 font-semibold">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-slate-850/50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-slate-300 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-slate-300 leading-normal">{children}</td>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
          hr: () => <hr className="my-3 border-slate-800" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle rounded-xs"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
