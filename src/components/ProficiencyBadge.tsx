export default function ProficiencyBadge({
  proficiencia,
  nivel,
}: {
  proficiencia: number | null;
  nivel: string | null;
}) {
  if (proficiencia === null && !nivel) {
    return null;
  }

  return (
    <div className="proficiency-badge">
      <span className="muted">Proficiência geral</span>
      <span className="level">
        {proficiencia !== null ? `${Math.round(proficiencia * 100)}%` : "—"}
        {nivel ? ` · ${nivel}` : ""}
      </span>
    </div>
  );
}
