import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { ease } from "@/lib/motion";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text) {
  const parts = [];
  const pattern = new RegExp(LINK_PATTERN.source, "g");
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = `${match.index}-${match[0]}`;

    if (match[2].startsWith("/")) {
      parts.push(
        <Link
          key={key}
          to={match[2]}
          className="text-accent underline underline-offset-4"
        >
          {match[1]}
        </Link>,
      );
    } else if (match[2].startsWith("mailto:")) {
      parts.push(
        <a
          key={key}
          href={match[2]}
          className="text-accent underline underline-offset-4"
        >
          {match[1]}
        </a>,
      );
    } else {
      parts.push(
        <a
          key={key}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline underline-offset-4"
        >
          {match[1]}
        </a>,
      );
    }

    last = pattern.lastIndex;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ block }) {
  if (block.type === "h3") {
    return (
      <h3 className="mt-8 font-display text-lg font-semibold text-text">
        {block.text}
      </h3>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-accent">
        {block.items.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--hairline)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]">
              {block.head.map((cell) => (
                <th
                  key={cell}
                  scope="col"
                  className="px-4 py-3 font-semibold text-text"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr
                key={row[0]}
                className="border-t border-[var(--hairline)] align-top"
              >
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th
                      key={cell}
                      scope="row"
                      className="px-4 py-3 font-medium text-text"
                    >
                      {renderInline(cell)}
                    </th>
                  ) : (
                    <td key={`${row[0]}-${index}`} className="px-4 py-3">
                      {renderInline(cell)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className="mt-4">{renderInline(block.text)}</p>;
}

function scrollToSection(event, id) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

function TableOfContents({ sections }) {
  return (
    <nav aria-label="On this page">
      <p className="label-mono text-muted">On this page</p>
      <ol className="mt-4 space-y-2 text-sm">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => scrollToSection(event, section.id)}
              className="flex gap-2 text-muted transition-colors hover:text-text"
            >
              <span className="w-5 shrink-0 font-mono text-xs leading-5 text-accent">
                {index + 1}.
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalPage({ meta, sections, summary }) {
  return (
    <SectionShell className="pt-32 sm:pt-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Eyebrow>{meta.eyebrow}</Eyebrow>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease }}
        className="max-w-3xl"
      >
        <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-6 leading-relaxed text-muted">
          {renderInline(meta.intro)}
        </p>
        <p className="mt-4 text-sm text-muted">
          Last updated{" "}
          <time className="font-medium text-text">{meta.lastUpdated}</time>
        </p>
      </motion.div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:order-1">
          <div className="rounded-2xl border border-[var(--hairline)] p-5 lg:sticky lg:top-28 lg:border-0 lg:p-0">
            <TableOfContents sections={sections} />
          </div>
        </aside>

        <article className="min-w-0 max-w-[52rem] lg:order-2">
          {summary ? (
            <GlassCard className="mb-12 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-text">
                {summary.title}
              </h2>
              <dl className="mt-6 space-y-5">
                {summary.items.map((item) => (
                  <div key={item.label}>
                    <dt className="label-mono text-accent">{item.label}</dt>
                    <dd className="mt-1.5 text-text">
                      {renderInline(item.text)}
                    </dd>
                  </div>
                ))}
              </dl>
            </GlassCard>
          ) : null}

          <div className="rounded-[28px] border border-[var(--hairline)] bg-[var(--card)] p-6 text-[15px] leading-7 text-text shadow-[0_18px_50px_rgba(36,26,71,0.08)] sm:p-12 dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            {sections.map((section, index) => (
              <section
                key={section.id}
                aria-labelledby={section.id}
                className="border-t border-[var(--hairline)] pt-10 pb-10 first:border-t-0 first:pt-0 last:pb-0"
              >
                <h2
                  id={section.id}
                  className="scroll-mt-28 font-display text-2xl font-semibold text-text"
                >
                  <span className="mr-2 text-accent">{index + 1}.</span>
                  {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) => (
                  <Block key={`${section.id}-${blockIndex}`} block={block} />
                ))}
              </section>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
