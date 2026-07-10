import { prisma } from "@/lib/db";

export type PillarScore = {
  label: string;
  ratio: number | null;
  numerador: number | null;
  denominador: number | null;
};

export type DashboardData = {
  proficiencia: number | null;
  nivel: string | null;
  pillars: PillarScore[];
  comments: {
    tecnica: string | null;
    especifica: string | null;
    empoderamento: string | null;
  } | null;
};

export async function getDashboardData(
  employeeId: number
): Promise<DashboardData> {
  const [evaluation, comment] = await Promise.all([
    prisma.evaluationResult.findUnique({ where: { employeeId } }),
    prisma.actionPlanComment.findUnique({ where: { employeeId } }),
  ]);

  const pillars: PillarScore[] = [
    {
      label: "Habilidades Técnicas",
      ratio: evaluation?.tecnicaRatio ?? null,
      numerador: evaluation?.tecnicaNumerador ?? null,
      denominador: evaluation?.tecnicaDenominador ?? null,
    },
    {
      label: "Habilidades Específicas",
      ratio: evaluation?.especificaRatio ?? null,
      numerador: evaluation?.especificaNumerador ?? null,
      denominador: evaluation?.especificaDenominador ?? null,
    },
    {
      label: "Habilidades de Empoderamento",
      ratio: evaluation?.empoderamentoRatio ?? null,
      numerador: evaluation?.empoderamentoNumerador ?? null,
      denominador: evaluation?.empoderamentoDenominador ?? null,
    },
  ];

  return {
    proficiencia: evaluation?.proficiencia ?? null,
    nivel: evaluation?.nivel ?? null,
    pillars,
    comments: comment
      ? {
          tecnica: comment.tecnicaComment,
          especifica: comment.especificaComment,
          empoderamento: comment.empoderamentoComment,
        }
      : null,
  };
}
