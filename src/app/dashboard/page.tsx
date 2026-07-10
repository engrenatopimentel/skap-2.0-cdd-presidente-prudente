import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentEmployee } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { logoutAction } from "@/app/logout/actions";
import BrandLogo from "@/components/BrandLogo";
import ProficiencyBadge from "@/components/ProficiencyBadge";
import PillarScoreCard from "@/components/PillarScoreCard";
import ActionPlanSection from "@/components/ActionPlanSection";

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  const data = await getDashboardData(employee.id);
  const hasEvaluation = data.pillars.some((p) => p.ratio !== null);

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandLogo height={28} />
          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
            <div className="brand-title" style={{ fontSize: 16, marginBottom: 0 }}>
              Portal Skap 2.0 - CDD Presidente Prudente
            </div>
            <div className="muted">{employee.fullName}</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="btn btn-secondary" type="submit">
            Sair
          </button>
        </form>
      </div>

      <div className="card card-wide">
        <p className="subtitle" style={{ marginBottom: 8 }}>
          {[employee.cargo, employee.empresa, employee.operacao]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {hasEvaluation ? (
          <>
            <ProficiencyBadge
              proficiencia={data.proficiencia}
              nivel={data.nivel}
            />
            <div className="pillar-grid">
              {data.pillars.map((pillar) => (
                <PillarScoreCard pillar={pillar} key={pillar.label} />
              ))}
            </div>
            <ActionPlanSection comments={data.comments} />
          </>
        ) : (
          <div className="empty-state">
            Sua avaliação SKAP ainda não foi processada. Volte em breve.
          </div>
        )}

        <p style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/change-password" className="muted">
            Trocar minha senha
          </Link>
        </p>
      </div>
    </div>
  );
}
