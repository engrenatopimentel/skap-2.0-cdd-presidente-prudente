import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";

export default async function Home() {
  const employee = await getCurrentEmployee();
  if (employee) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell">
      <div className="card" style={{ marginTop: "8vh", textAlign: "center" }}>
        <div className="brand-header" style={{ alignItems: "center" }}>
          <BrandLogo height={44} />
        </div>
        <div className="brand-title">Portal Skap 2.0 - CDD Presidente Prudente</div>
        <p className="subtitle">
          Acompanhe sua avaliação de competências.
        </p>
        <Link href="/login" className="btn" style={{ display: "inline-flex" }}>
          Entrar
        </Link>
      </div>
    </div>
  );
}
