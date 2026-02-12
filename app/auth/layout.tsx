import { Gap } from "@/cores/components/gap";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="w-full p-6">
        <img
          src="/assets/images/vaulttech-logo.png"
          alt="Vaulttech Logo"
          className="w-[150px]"
        />
      </div>
      <Gap value="pt-4" />
      {children}
    </div>
  );
}
