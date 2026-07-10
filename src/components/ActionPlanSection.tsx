export default function ActionPlanSection({
  comments,
}: {
  comments: {
    tecnica: string | null;
    especifica: string | null;
    empoderamento: string | null;
  } | null;
}) {
  if (
    !comments ||
    (!comments.tecnica && !comments.especifica && !comments.empoderamento)
  ) {
    return null;
  }

  const blocks = [
    { label: "Habilidade Técnica", text: comments.tecnica },
    { label: "Habilidade Específica", text: comments.especifica },
    { label: "Habilidade Empoderamento", text: comments.empoderamento },
  ].filter((b) => b.text);

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Plano de ação e comentários</h2>
      {blocks.map((b) => (
        <div className="action-plan-block" key={b.label}>
          <h3>{b.label}</h3>
          <p>{b.text}</p>
        </div>
      ))}
    </div>
  );
}
