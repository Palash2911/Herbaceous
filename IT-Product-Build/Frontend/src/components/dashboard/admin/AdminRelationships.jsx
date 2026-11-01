import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { adminRelationships } from "@/content/dashboard/admin-data";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import { DashboardLabel, StatusPill } from "@/components/dashboard/shared/primitives";
import { toneForLevel } from "@/components/dashboard/shared/ToleranceMeter";
import { pageMotion } from "@/lib/motion";

const filters = ["All", "Active", "Paused", "Ended"];

export function AdminRelationships() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const rows = useMemo(
    () =>
      adminRelationships.filter(
        (r) =>
          (filter === "All" || r.status === filter.toLowerCase()) &&
          (r.mentor + r.mentee).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, filter],
  );

  const columns = [
    { key: "mentor", header: "Mentor", render: (r) => <span className="font-medium">{r.mentor}</span> },
    { key: "mentee", header: "Mentee", render: (r) => r.mentee },
    { key: "score", header: "Match", render: (r) => <span className="text-accent">{r.matchScore}</span> },
    { key: "start", header: "Started", render: (r) => r.startDate },
    { key: "weeks", header: "Weeks", render: (r) => r.weeksLogged },
    {
      key: "advocacy",
      header: "Advocacy",
      render: (r) => (
        <StatusPill tone={r.advocacy === "Enabled" ? "positive" : "neutral"}>{r.advocacy}</StatusPill>
      ),
    },
    {
      key: "tolerance",
      header: "Tolerance",
      render: (r) => <StatusPill tone={toneForLevel(r.tolerance)}>{r.tolerance}</StatusPill>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusPill
          tone={r.status === "active" ? "positive" : r.status === "paused" ? "caution" : "negative"}
        >
          {r.status}
        </StatusPill>
      ),
    },
  ];

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Directory</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">Relationships</h1>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        query={query}
        onQuery={setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        emptyTitle="No relationships match"
        emptyBody="Try a different search term or clear the filter."
      />
    </motion.div>
  );
}
