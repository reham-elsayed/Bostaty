import Link from "next/link";
import { AuthButton } from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import { Suspense } from "react";

export default function Navbar() {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-7xl flex justify-between items-center p-3 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>Bostaty</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Suspense fallback={<div>Loading...</div>}>
                        <AuthButton />
                    </Suspense>
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    );
}
