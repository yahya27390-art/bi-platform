import React, { useState } from 'react';
import {
  BarChart3,
  Table,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Layers,
  Zap,
  Video,
  ShoppingCart,
  Search,
  Share2,
  PieChart,
  LayoutGrid
} from 'lucide-react';

// Extract the first numeric value from a string (e.g. "~2,800 ر.س" -> 2800, "4,660.27" -> 4660.27)
function extractFirstNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/,/g, '');
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// Format inline bold, italic, code, br tags, and growth percentage chips
function formatInlineText(text) {
  if (!text) return null;

  // Split by line breaks if string contains <br> or <br/>
  const brSegments = text.split(/<br\s*\/?>/gi);

  return brSegments.map((segment, segIdx) => {
    // Matches: **bold**, *italic*, `code`, and percentages like +169% or -33%
    const parts = [];
    let remaining = segment;
    let keyCounter = 0;

    const regex = /(\*\*[^*]+\*\*|`[^`]+`|[-+]?\d+(?:\.\d+)?%)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      const val = match[0];
      if (val.startsWith('**') && val.endsWith('**')) {
        parts.push(
          <strong key={keyCounter++} className="font-black text-white tracking-wide">
            {val.slice(2, -2)}
          </strong>
        );
      } else if (val.startsWith('`') && val.endsWith('`')) {
        parts.push(
          <code
            key={keyCounter++}
            className="font-mono text-[11px] bg-slate-900 border border-slate-700/80 text-teal-300 px-1.5 py-0.5 rounded mx-0.5"
          >
            {val.slice(1, -1)}
          </code>
        );
      } else if (val.includes('%')) {
        const isPos = !val.startsWith('-');
        parts.push(
          <span
            key={keyCounter++}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold mx-1 ${
              isPos
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isPos ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-400 inline" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-400 inline" />
            )}
            <span>{val}</span>
          </span>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return (
      <React.Fragment key={segIdx}>
        {parts}
        {segIdx < brSegments.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// Interactive Table Block with Chart View Mode & Dual Mode
function MarkdownTableBlock({ headers, rows }) {
  // Check if comparison table (e.g. 2025 vs 2026 or Platforms)
  const isComparison =
    headers.some(
      (h) =>
        h.includes('2025') ||
        h.includes('السابق') ||
        h.includes('المنصة') ||
        h.includes('أغسطس') ||
        h.includes('النمو') ||
        h.includes('الحالي')
    ) || rows.length > 0;

  // Default to 'both' so the user immediately sees both the table AND the visual model
  const [viewMode, setViewMode] = useState(isComparison ? 'both' : 'table'); // 'both' | 'table' | 'visual'
  const [copied, setCopied] = useState(false);

  const handleCopyTable = () => {
    try {
      const headerLine = headers.join('\t');
      const rowLines = rows.map((r) => r.join('\t')).join('\n');
      navigator.clipboard.writeText(`${headerLine}\n${rowLines}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="my-5 rounded-3xl border border-slate-700/80 bg-[#0a1122]/90 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Table Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-[#0d182e] to-slate-900 border-b border-slate-800/90 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-200">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm">
            بيانات التحليل والمقارنة الاستراتيجية
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
            {rows.length} قنوات / بنود
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-[11px] shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-medium ${
                viewMode === 'table'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض كجدول بيانات منظم"
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول أنيق</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-medium ${
                viewMode === 'visual'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض كنموذج بياني مرسوم"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
              <span>نموذج بياني مرسوم 📊</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-medium ${
                viewMode === 'both'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض كلاهما معاً"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كلاهما معاً 🌟</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyTable}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 text-[11px]"
            title="نسخ الجدول"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">تم</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نسخ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: VISUAL DRAWN MODELS (النماذج البيانية المرسومة) */}
      {(viewMode === 'visual' || viewMode === 'both') && (
        <div className="p-4 md:p-6 space-y-4 bg-gradient-to-b from-[#0b1325] via-[#091020] to-[#0d162d] border-b border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300 font-bold">
                النموذج البياني المرئي والمقارنة التفاعلية:
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span>أغسطس 2025 (السابق)</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse inline-block shadow-sm shadow-teal-400/50" />
                <span>أغسطس 2026 (الحالي)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row, rIdx) => {
              const rawPlatform = row[0] || `قناة #${rIdx + 1}`;
              const platformName = rawPlatform
                .replace(/\*\*/g, '')
                .replace(/<[^>]*>/g, ' ')
                .trim();
              const metricName = row[1]
                ? row[1].replace(/<[^>]*>/g, ' · ')
                : 'الأداء العام';
              const prevVal = row[2] || '';
              const currVal = row[3] || '';
              const growthText = row[4] || '';

              // Dynamic width calculation from numeric values
              const prevNum = extractFirstNumber(prevVal);
              const currNum = extractFirstNumber(currVal);

              let prevWidth = 45;
              let currWidth = 85;

              if (prevNum && currNum && Math.max(prevNum, currNum) > 0) {
                const max = Math.max(prevNum, currNum);
                prevWidth = Math.max(18, Math.min(95, Math.round((prevNum / max) * 92)));
                currWidth = Math.max(18, Math.min(95, Math.round((currNum / max) * 92)));
              }

              // Channel branding config
              let borderAccent = 'border-teal-500/40 hover:border-teal-400/70';
              let badgeColor = 'from-teal-500/20 to-blue-500/20 text-teal-300 border-teal-500/30';
              let ChannelIcon = Zap;
              let iconColor = 'text-teal-400';
              let activeText = 'متصل بنجاح 🟢';

              if (platformName.includes('Google')) {
                borderAccent = 'border-amber-500/40 hover:border-amber-400/70';
                badgeColor = 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30';
                ChannelIcon = Search;
                iconColor = 'text-amber-400';
                activeText = 'Google Ads 676-161-2192';
              } else if (platformName.includes('Meta') || platformName.includes('فيسبوك') || platformName.includes('انستقرام')) {
                borderAccent = 'border-blue-500/40 hover:border-blue-400/70';
                badgeColor = 'from-blue-600/20 to-indigo-600/20 text-blue-300 border-blue-500/30';
                ChannelIcon = Share2;
                iconColor = 'text-blue-400';
                activeText = 'Meta Ads 1820338072104640';
              } else if (platformName.includes('TikTok') || platformName.includes('تيك')) {
                borderAccent = 'border-rose-500/40 hover:border-rose-400/70';
                badgeColor = 'from-rose-500/20 to-purple-500/20 text-rose-300 border-rose-500/30';
                ChannelIcon = Video;
                iconColor = 'text-rose-400';
                activeText = 'TikTok 7344310111864799234';
              } else if (platformName.includes('سلة') || platformName.includes('Salla') || platformName.includes('متجر')) {
                borderAccent = 'border-purple-500/40 hover:border-purple-400/70';
                badgeColor = 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30';
                ChannelIcon = ShoppingCart;
                iconColor = 'text-purple-400';
                activeText = 'متجر سلة 849020134';
              }

              return (
                <div
                  key={rIdx}
                  className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0c1424] border ${borderAccent} space-y-3.5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    {/* Header with channel badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center ${iconColor}`}>
                          <ChannelIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                            <span>{platformName}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {activeText}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${badgeColor} border font-mono shrink-0`}
                      >
                        نشط 🟢
                      </span>
                    </div>

                    {/* Metric summary */}
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-800/70 leading-relaxed">
                      <span className="text-slate-400">البنود: </span>
                      {metricName}
                    </div>

                    {/* Comparative Visual Bars */}
                    <div className="space-y-2.5 pt-1.5">
                      {/* 2025 Previous bar */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            <span>أغسطس 2025:</span>
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-[170px]">
                            {prevVal.replace(/<[^>]*>/g, ' · ')}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
                          <div
                            className="h-full bg-slate-500/80 rounded-full transition-all duration-700"
                            style={{ width: `${prevWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* 2026 Current bar */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[11px] text-white font-bold">
                          <span className="flex items-center gap-1 text-teal-300">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                            <span>أغسطس 2026:</span>
                          </span>
                          <span className="font-mono text-teal-300 truncate max-w-[170px]">
                            {currVal.replace(/<[^>]*>/g, ' · ')}
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-md shadow-teal-500/40 animate-pulse"
                            style={{ width: `${currWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Pill */}
                  {growthText && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] leading-relaxed text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-xl">
                        {formatInlineText(growthText)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: RICH LUXURY HTML TABLE */}
      {(viewMode === 'table' || viewMode === 'both') && (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/95 border-b border-slate-800 text-slate-300">
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="py-3 px-4 font-bold text-slate-200 whitespace-nowrap bg-gradient-to-b from-slate-800/60 to-slate-900/80 border-l border-slate-800/60 last:border-l-0"
                  >
                    {formatInlineText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-teal-500/5 transition-colors group odd:bg-slate-950/40 even:bg-slate-900/30"
                >
                  {row.map((cell, cIdx) => {
                    const isFirst = cIdx === 0;
                    const isLast = cIdx === row.length - 1;
                    return (
                      <td
                        key={cIdx}
                        className={`py-3.5 px-4 align-top leading-relaxed text-slate-300 border-l border-slate-800/40 last:border-l-0 ${
                          isFirst
                            ? 'font-black text-white bg-slate-900/50'
                            : ''
                        } ${isLast ? 'text-slate-200' : ''}`}
                      >
                        {formatInlineText(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Master Message Renderer Component
export default function ChatMessageRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentTable = null; // { headers: [], rows: [] }
  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a table line (contains |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      // If it's a separator line like |---|---|
      const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));

      if (isSeparator) {
        // Just separator, ignore
        continue;
      }

      if (!currentTable) {
        // First line is headers
        currentTable = {
          headers: cells,
          rows: [],
        };
      } else {
        // Subsequent lines are rows
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      // If we were building a table and current line is not table, flush table
      if (currentTable) {
        elements.push(
          <MarkdownTableBlock
            key={elementKey++}
            headers={currentTable.headers}
            rows={currentTable.rows}
          />
        );
        currentTable = null;
      }
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={elementKey++} className="h-2" />);
      continue;
    }

    // Divider: ---
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <div
          key={elementKey++}
          className="my-4 border-t border-slate-800/80 relative flex items-center justify-center"
        >
          <span className="px-3 bg-[#0d1527] text-[10px] text-slate-400 font-mono">
            درة للسيارات · منصة ذكاء الأعمال الموحدة
          </span>
        </div>
      );
      continue;
    }

    // Headings: ### or ## or #
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3
          key={elementKey++}
          className="text-sm md:text-base font-black text-white mt-4 mb-2 flex items-center gap-2 border-r-4 border-teal-400 pr-2.5 bg-slate-900/40 py-1.5 rounded-l-xl"
        >
          <span>{formatInlineText(headingText)}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2
          key={elementKey++}
          className="text-base md:text-lg font-black text-white mt-5 mb-2.5 flex items-center gap-2 border-r-4 border-indigo-500 pr-3 bg-slate-900/50 py-2 rounded-l-xl"
        >
          <span>{formatInlineText(headingText)}</span>
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h1
          key={elementKey++}
          className="text-lg md:text-xl font-black text-white mt-6 mb-3 flex items-center gap-2 border-r-4 border-amber-500 pr-3.5 bg-slate-900/60 py-2 rounded-l-xl"
        >
          <span>{formatInlineText(headingText)}</span>
        </h1>
      );
      continue;
    }

    // Bullet list: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div
          key={elementKey++}
          className="flex items-start gap-2.5 my-1.5 text-xs text-slate-200 leading-relaxed pr-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0 shadow-sm shadow-teal-400/50" />
          <div className="flex-1">{formatInlineText(bulletText)}</div>
        </div>
      );
      continue;
    }

    // Numbered list: 1. 2. 3.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = numMatch[2];
      elements.push(
        <div
          key={elementKey++}
          className="flex items-start gap-2.5 my-2 text-xs text-slate-200 leading-relaxed pr-1"
        >
          <span className="w-5 h-5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1">{formatInlineText(rest)}</div>
        </div>
      );
      continue;
    }

    // Blockquote: >
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s+/, '');
      elements.push(
        <div
          key={elementKey++}
          className="my-2.5 p-3 rounded-xl bg-slate-900/80 border-r-4 border-teal-500 text-xs text-slate-300 italic"
        >
          {formatInlineText(quoteText)}
        </div>
      );
      continue;
    }

    // Normal Paragraph
    elements.push(
      <p key={elementKey++} className="my-1.5 text-xs text-slate-200 leading-relaxed">
        {formatInlineText(rawLine)}
      </p>
    );
  }

  // Flush any remaining table at the end
  if (currentTable) {
    elements.push(
      <MarkdownTableBlock
        key={elementKey++}
        headers={currentTable.headers}
        rows={currentTable.rows}
      />
    );
  }

  return <div className="space-y-1 text-right text-xs leading-relaxed">{elements}</div>;
}
