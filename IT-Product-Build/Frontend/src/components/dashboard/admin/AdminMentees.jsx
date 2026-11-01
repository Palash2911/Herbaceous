import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { adminMentees } from "@/content/dashboard/admin-data";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import { DashboardLabel, StatusPill, DashboardAvatar } from "@/components/dashboard/shared/primitives";
import { Modal } from "@/components/dashboard/shared/Modal";
import { toneForLevel } from "@/components/dashboard/shared/ToleranceMeter";
import { pageMotion } from "@/lib/motion";

const filters = ["All", "Active", "Paused", "Ended"];

export function AdminMentees() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const rows = useMemo(
    () =>
      adminMentees.filter(
        (m) =>
          (filter === "All" || m.journey === filter) &&
          (m.name + m.field + m.mentor).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, filter],
  );

  const columns = [
    {
      key: "name",
      header: "Mentee",
      render: (r) => (
        <div className="flex items-center gap-2">
          <DashboardAvatar initials={r.name.split(" ").map((n) => n[0]).join("")} size={30} />
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "field", header: "Field", render: (r) => r.field },
    { key: "mentor", header: "Mentor", render: (r) => r.mentor },
    { key: "weeks", header: "Weeks", render: (r) => r.weeksLogged },
    {
      key: "advocacy",
      header: "Advocacy",
      render: (r) => (
        <StatusPill tone={r.advocacy === "Enabled" ? "positive" : r.advocacy === "Pending admin" ? "caution" : "neutral"}>
          {r.advocacy}
        </StatusPill>
      ),
    },
    {
      key: "tolerance",
      header: "Tolerance",
      render: (r) => <StatusPill tone={toneForLevel(r.tolerance)}>{r.tolerance}</StatusPill>,
    },
    {
      key: "journey",
      header: "Journey",
      render: (r) => (
        <StatusPill tone={r.journey === "Active" ? "positive" : r.journey === "Paused" ? "caution" : "negative"}>
          {r.journey}
        </StatusPill>
      ),
    },
    { key: "joined", header: "Joined", render: (r) => r.joined },
  ];

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Directory</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">All mentees</h1>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        query={query}
        onQuery={setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        onRowClick={setSelected}
        emptyTitle="No mentees match"
        emptyBody="Try a different search term or clear the filter."
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        consequence="This is a read only view. Admin actions on advocacy and relationships live in the Approvals queue."
      >
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Field", selected?.field],
            ["Mentor", selected?.mentor],
            ["Weeks logged", String(selected?.weeksLogged ?? "")],
            ["Advocacy", selected?.advocacy],
            ["Tolerance", `${selected?.tolerance ?? 0} of 4`],
            ["Journey", selected?.journey],
            ["Joined", selected?.joined],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[12px] border border-[var(--hairline)] p-3">
              <span className="label-caps">{k}</span>
              <p className="mt-1">{v}</p>
            </div>
          ))}
        </dl>
      </Modal>
    </motion.div>
  );
}
