import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const employee = await getCurrentEmployee();
  if (employee) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell">
      <div className="card" style={{ marginTop: "8vh" }}>
        <div className="brand-header">
          <BrandLogo height={44} />
        </div>
        <div className="brand-title">Portal Skap 2.0 - CDD Presidente Prudente</div>
        <p className="subtitle">
          Acompanhe sua avaliação de competências. Entre com seu CPF ou
          Matrícula.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
