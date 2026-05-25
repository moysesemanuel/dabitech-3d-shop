import logoUrl from "../../assets/dabi-tech-3d-logo.svg";
import contrastLogoUrl from "../../assets/dabi-tech-3d-logo-contrast.svg";

interface DabiLogoProps {
  className?: string;
}

export function DabiLogo({ className }: DabiLogoProps) {
  return (
    <span className={["dabi-logo", className].filter(Boolean).join(" ")} role="img" aria-label="DaBi Tech 3D">
      <img className="dabi-logo-default" src={logoUrl} alt="" aria-hidden="true" />
      <img className="dabi-logo-contrast" src={contrastLogoUrl} alt="" aria-hidden="true" />
    </span>
  );
}
