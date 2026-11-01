import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { adminMentors } from "@/content/dashboard/admin-data";
import { DataTable } from "@/components/dashboard/shared/DataTable";
import {
  DashboardAvatar,
  DashboardButton,
  Field,
  DashboardLabel,
  StatusPill,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { Modal } from "@/components/dashboard/shared/Modal";
import { pageMotion } from "@/lib/motion";

const filters = ["All", "Verified", "Unverified"];

export function AdminMentors() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [verifying, setVerifying] = useState(null);
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState([]);

  const rows = useMemo(
    () =>
      adminMentors.filter((m) => {
        const isVerified = m.verified || verified.includes(m.id);
        return (
          (filter === "All" ||
            (filter === "Verified" && isVerified) ||
            (filter === "Unverified" && !isVerified)) &&
          (m.name + m.role + m.company).toLowerCase().includes(query.toLowerCase())
        );
      }),
    [query, filter, verified],
  );

  const columns = [
    {
      key: "name",
      header: "Mentor",
      render: (r) => (
        <div className="flex items-center gap-2">
          <DashboardAvatar initials={r.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")} size={30} />
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "role", header: "Role and company", render: (r) => `${r.role}, ${r.company}` },
    {
      key: "verified",
      header: "Verification",
      render: (r) =>
        r.verified || verified.includes(r.id) ? (
          <StatusPill tone="positive">Verified</StatusPill>
        ) : (
          <DashboardButton variant="outline" className="h-8 px-3 py-1 text-xs" onClick={() => setVerifying(r)}>
            Review credentials
          </DashboardButton>
        ),
    },
    { key: "mentees", header: "Active mentees", render: (r) => r.activeMentees },
    { key: "fulfilled", header: "Advocacy fulfilled", render: (r) => r.fulfilled },
    { key: "joined", header: "Joined", render: (r) => r.joined },
  ];

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Directory</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">All mentors</h1>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        query={query}
        onQuery={setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        emptyTitle="No mentors match"
        emptyBody="Try a different search term or clear the filter."
      />

      <Modal
        open={Boolean(verifying)}
        onClose={() => setVerifying(null)}
        title={`Verify ${verifying?.name ?? ""}`}
        consequence="On approve, this mentor is marked verified across the platform and a verified tick appears next to their name for every mentee. On reject, they stay unverified and receive your note."
        footer={
          <>
            <DashboardButton
              variant="danger"
              onClick={() => {
                setNote("");
                setVerifying(null);
              }}
            >
              Reject
            </DashboardButton>
            <DashboardButton
              onClick={() => {
                if (verifying) setVerified((v) => [...v, verifying.id]);
                setNote("");
                setVerifying(null);
              }}
            >
              <BadgeCheck size={15} /> Approve
            </DashboardButton>
          </>
        }
      >
        <div>
          <DashboardLabel>Submitted credentials</DashboardLabel>
          <ul className="mt-2 space-y-2">
            {verifying?.credentials?.map((c) => (
              <li key={c} className="rounded-[12px] border border-[var(--hairline)] p-3 text-sm">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Field label="Admin note">
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            placeholder="Recorded against this decision"
          />
        </Field>
      </Modal>
    </motion.div>
  );
}
