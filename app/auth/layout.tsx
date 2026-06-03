import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,108,255,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(86,143,255,0.14),_transparent_30%),linear-gradient(180deg,_#0b1220_0%,_#08111f_100%)]" />
      <div className="absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-blue1/15 blur-3xl" />
      <div className="absolute bottom-[-7rem] left-[-6rem] h-80 w-80 rounded-full bg-blue2/10 blur-3xl" />
      <div className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8">
        <Image
          src="/assets/images/vaulttech-logo.png"
          alt="VaultTech"
          width={150}
          height={40}
          priority
          className="h-auto w-[150px]"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
