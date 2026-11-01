import prisma from "../src/config/prisma.js";

async function main() {
  const stats = [
    {
      key: "stem_qualification_hero",
      section: "hero",
      label: "STEM qualification holders who are women",
      value: 17.4,
      displaySuffix: "%",
      order: 1,
    },
    {
      key: "stem_ceo_hero",
      section: "hero",
      label: "STEM CEO roles held by women",
      value: 16.3,
      displaySuffix: "%",
      order: 2,
    },

    // StatStrip cards
    {
      key: "stem_qualification_strip",
      section: "stat_strip",
      label: "of Australians holding a STEM qualification are women",
      value: 17.4,
      displaySuffix: "%",
      sourceLabel: "ABS Census 2021",
      order: 1,
    },
    {
      key: "stem_ceo_strip",
      section: "stat_strip",
      label: "of STEM CEO roles are held by women",
      value: 16.3,
      displaySuffix: "%",
      sourceLabel: "WGEA, 2024-25",
      order: 2,
    },
    {
      key: "role_models_strip",
      section: "stat_strip",
      label:
        "of women in underrepresented STEM fields cite limited visible role models as a major barrier",
      value: 80,
      displaySuffix: "%+",
      sourceLabel: "Professionals Australia survey",
      order: 3,
    },

    // Advocacy summary
    {
      key: "advice_availability",
      section: "advocacy_summary",
      label: "Widely available",
      value: 68,
      displaySuffix: "%",
      order: 1,
    },
    {
      key: "advocacy_availability",
      section: "advocacy_summary",
      label: "Rarely offered",
      value: 14,
      displaySuffix: "%",
      order: 2,
    },

    // Why Us hero
    {
      key: "stem_qualification_whyus",
      section: "why_us_hero",
      label: "STEM qualification holders who are women",
      value: 17.4,
      displaySuffix: "%",
      order: 1,
    },
    {
      key: "stem_ceo_whyus",
      section: "why_us_hero",
      label: "STEM CEOs who are women",
      value: 16.3,
      displaySuffix: "%",
      order: 2,
    },

    // Orbital graph nodes
    {
      key: "orbital_stem_qualification",
      section: "orbital_graph",
      label: "STEM qualification",
      value: 17.4,
      displaySuffix: "%",
      order: 1,
    },
    {
      key: "orbital_stem_ceo",
      section: "orbital_graph",
      label: "STEM CEO roles",
      value: 16.3,
      displaySuffix: "%",
      order: 2,
    },
    {
      key: "orbital_resignations",
      section: "orbital_graph",
      label: "Resignations",
      value: 39.5,
      displaySuffix: "%",
      detail: "Against a 36.5 percent workforce share.",
      order: 3,
    },
    {
      key: "orbital_missing_role_models",
      section: "orbital_graph",
      label: "Missing role models",
      value: 82,
      displaySuffix: "%",
      order: 4,
    },
    {
      key: "orbital_mentor_ratio",
      section: "orbital_graph",
      label: "Mentor ratio",
      value: 14,
      displaySuffix: ":14",
      order: 5,
    },
    {
      key: "orbital_mid_career_exit",
      section: "orbital_graph",
      label: "Mid-career exit",
      value: 2,
      displaySuffix: "x",
      order: 6,
    },

    // Pipeline funnel stages
    {
      key: "funnel_stage_1",
      section: "pipeline_funnel",
      label: "Stage 1",
      value: 100,
      order: 1,
    },
    {
      key: "funnel_stage_2",
      section: "pipeline_funnel",
      label: "Stage 2",
      value: 74,
      order: 2,
    },
    {
      key: "funnel_stage_3",
      section: "pipeline_funnel",
      label: "Stage 3",
      value: 31,
      order: 3,
    },
    {
      key: "funnel_stage_4",
      section: "pipeline_funnel",
      label: "Stage 4",
      value: 19,
      order: 4,
    },
    {
      key: "funnel_stage_5",
      section: "pipeline_funnel",
      label: "Stage 5",
      value: 8,
      order: 5,
    },

    // Mentor gap chart, per field
    {
      key: "gap_field_1",
      section: "mentor_gap",
      label: "Field 1",
      value: 14,
      displaySuffix: ":1",
      order: 1,
    },
    {
      key: "gap_field_2",
      section: "mentor_gap",
      label: "Field 2",
      value: 11,
      displaySuffix: ":1",
      order: 2,
    },
    {
      key: "gap_field_3",
      section: "mentor_gap",
      label: "Field 3",
      value: 9,
      displaySuffix: ":1",
      order: 3,
    },
    {
      key: "gap_field_4",
      section: "mentor_gap",
      label: "Field 4",
      value: 7,
      displaySuffix: ":1",
      order: 4,
    },
    {
      key: "gap_field_5",
      section: "mentor_gap",
      label: "Field 5",
      value: 4,
      displaySuffix: ":1",
      order: 5,
    },
  ];

  const sectionFlagIndex = process.argv.indexOf("--section");
  const section =
    sectionFlagIndex === -1 ? null : process.argv[sectionFlagIndex + 1];

  if (sectionFlagIndex !== -1 && (!section || section.startsWith("--"))) {
    throw new Error("Usage: node prisma/seed.js [--section <section>]");
  }

  const rows = section
    ? stats.filter((stat) => stat.section === section)
    : stats;

  if (section && rows.length === 0) {
    throw new Error(`No seed rows for section "${section}".`);
  }

  const pruneSection = section ?? "stat_strip";
  const keepKeys = stats
    .filter((stat) => stat.section === pruneSection)
    .map((stat) => stat.key);

  await prisma.pipelineStatistic.deleteMany({
    where: { section: pruneSection, key: { notIn: keepKeys } },
  });

  for (const stat of rows) {
    await prisma.pipelineStatistic.upsert({
      where: { key: stat.key },
      update: stat,
      create: stat,
    });
  }

  console.log(`Seeded ${rows.length} pipeline statistics.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
