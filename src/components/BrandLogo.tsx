import Image from "next/image";

export default function BrandLogo({
  height = 40,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const width = Math.round(height * 3.21);

  return (
    <>
      <Image
        src="/brand/logo.png"
        alt="Imediato Nexway"
        width={width}
        height={height}
        className={`brand-logo brand-logo-light ${className ?? ""}`}
        style={{ height, width: "auto" }}
        priority
      />
      <Image
        src="/brand/logo-white.png"
        alt="Imediato Nexway"
        width={width}
        height={height}
        className={`brand-logo brand-logo-dark ${className ?? ""}`}
        style={{ height, width: "auto" }}
        priority
      />
    </>
  );
}
