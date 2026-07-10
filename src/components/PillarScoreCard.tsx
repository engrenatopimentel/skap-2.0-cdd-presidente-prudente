import type { PillarScore } from "@/lib/dashboard";

export default function PillarScoreCard({ pillar }: { pillar: PillarScore }) {
  const hasData = pillar.ratio !== null;
  const percent = hasData ? Math.round((pillar.ratio ?? 0) * 100) : 0;

  return (
    <div className="pillar-card">
      <h3>{pillar.label}</h3>
      {hasData ? (
        <>
          <div className="pillar-score">{percent}%</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${percent}%` }} />
          </div>
          {pillar.numerador !== null && pillar.denominador !== null && (
            <div className="muted">
              {pillar.numerador}/{pillar.denominador}
            </div>
          )}
        </>
      ) : (
        <div className="muted">Sem dados ainda</div>
      )}
    </div>
  );
}
