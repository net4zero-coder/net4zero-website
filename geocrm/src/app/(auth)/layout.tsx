import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Panel brandingowy (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-dark p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold">N4Z</div>
          <span className="text-lg font-semibold">GeoCRM</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Zarządzaj siecią recyklomatów
            <br />z jednej mapy.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Lokalizacje, inwestorzy, regiony i handlowcy — wszystko w jednym miejscu.
            Mapa Google jest centrum całego systemu.
          </p>
        </div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} NET4ZERO</p>
      </div>

      {/* Formularz */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              N4Z
            </div>
            <span className="text-lg font-semibold">GeoCRM</span>
          </div>
          {children}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/polityka-prywatnosci" className="hover:underline">
              Polityka prywatności
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
