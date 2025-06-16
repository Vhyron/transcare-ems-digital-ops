import Link from "next/link";
import { ModeToggle } from "../../components/ModeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="border-b bg-background absolute top-0 left-0 right-0">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Transcare</span>
          </Link>

          <ModeToggle />
        </div>
      </header>
      <main>{children}</main>
      <footer className="py-6 border-t  absolute left-0 right-0 bottom-0">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 mx-auto text-center sm:px-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Transcare. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
