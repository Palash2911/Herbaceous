import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Chip, EmptyState, inputClass } from "./primitives";

export function DataTable({
  rows,
  columns,
  query,
  onQuery,
  filters,
  activeFilter,
  onFilter,
  onRowClick,
  emptyTitle,
  emptyBody,
}) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {filters?.length ? (
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Chip key={f} active={activeFilter === f} onClick={() => onFilter?.(f)}>
                {f}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} />
      ) : (
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="label-caps px-3 py-2 text-left font-normal">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  className={
                    "border-t border-[var(--hairline)] " +
                    (onRowClick ? "cursor-pointer hover:bg-[var(--surface-soft)]" : "")
                  }
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-3 align-middle">
                      {c.render(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { inputClass };
