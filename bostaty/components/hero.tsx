'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hero } from "@/lib/static-store";

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      <h1 className="text-4xl font-bold text-center">{hero.title}</h1>
      <Link href={hero.ctaLink}>
        <Button size="lg" className="text-xl px-10 py-8 rounded-full shadow-lg hover:shadow-xl transition-all">
          {hero.ctaText}
        </Button>
      </Link>

    </div>
  );
}
