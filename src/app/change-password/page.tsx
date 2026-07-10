import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentEmployee } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect("/login");
  }

  return (
    <div className="page-shell">
      <div className="card" style={{ marginTop: "10vh" }}>
        <div className="brand-title">Trocar senha</div>
        <p className="subtitle">
          Opcional — você pode continuar usando sua senha atual se preferir.
        </p>
        <ChangePasswordForm />
        <p style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/dashboard" className="muted">
            Voltar ao painel
          </Link>
        </p>
      </div>
    </div>
  );
}
