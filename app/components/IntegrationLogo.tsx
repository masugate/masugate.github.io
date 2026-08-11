import Image from "next/image";

export function IntegrationLogo({
  name,
  src,
}: {
  name: string;
  src: string;
}) {
  return (
    <span className="integration-logo-wrap">
      <Image
        className="integration-logo"
        src={src}
        alt={`${name} logo`}
        width={156}
        height={52}
        unoptimized
      />
    </span>
  );
}

