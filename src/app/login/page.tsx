import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const employee = await getCurrentEmployee();
  if (employee) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell">
      <div className="card" style={{ marginTop: "10vh" }}>
        <div className="brand-title">Portal SKAP</div>
        <p className="subtitle">
          Acompanhe sua avaliação de competências. Entre com seu CPF ou
          Matrícula.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
