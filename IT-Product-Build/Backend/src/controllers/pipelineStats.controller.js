import prisma from "../config/prisma.js";

export async function getStatsBySection(req, res, next) {
  try {
    const { section } = req.params;
    const stats = await prisma.pipelineStatistic.findMany({
      where: { section },
      orderBy: { order: "asc" },
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getAllStats(req, res, next) {
  try {
    const stats = await prisma.pipelineStatistic.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
