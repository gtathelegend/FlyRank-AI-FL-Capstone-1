"use client";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text) {
  // Bold+italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  return text;
}

function parseMarkdown(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") { i++; continue; }

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // consume closing ```
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      blocks.push({ type: "heading", level: hMatch[1].length, content: parseInline(hMatch[2]) });
      i++; continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "blockquote", content: parseInline(quoteLines.join(" ")) });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*+]\s/, "")));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s/, "")));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\|?[\s:-]+\|/)) {
      const headerCells = line.split("|").map(c => c.trim()).filter(Boolean);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean));
        i++;
      }
      blocks.push({ type: "table", headers: headerCells, rows });
      continue;
    }

    // Paragraph - collect until blank line
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !lines[i].startsWith("```") && !/^[-*+]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: "paragraph", content: parseInline(paraLines.join(" ")) });
    }
  }

  return blocks;
}

export default function MarkdownRenderer({ children }) {
  if (!children) return null;
  const blocks = parseMarkdown(children);

  return (
    <div className="md-content">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}`;
            return <Tag key={idx} dangerouslySetInnerHTML={{ __html: block.content }} />;
          }
          case "paragraph":
            return <p key={idx} dangerouslySetInnerHTML={{ __html: block.content }} />;
          case "code":
            return (
              <pre key={idx}>
                <code dangerouslySetInnerHTML={{ __html: block.content }} />
              </pre>
            );
          case "blockquote":
            return <blockquote key={idx} dangerouslySetInnerHTML={{ __html: block.content }} />;
          case "hr":
            return <hr key={idx} />;
          case "ul":
            return (
              <ul key={idx}>
                {block.items.map((item, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx}>
                {block.items.map((item, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>
            );
          case "table":
            return (
              <table key={idx}>
                <thead>
                  <tr>
                    {block.headers.map((h, j) => (
                      <th key={j} dangerouslySetInnerHTML={{ __html: parseInline(h) }} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
