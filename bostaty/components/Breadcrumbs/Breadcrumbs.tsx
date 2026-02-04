"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BreadcrumbComponent() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter((item) => item !== "");

    // Helper function to capitalize and format segment names
    const formatSegment = (segment: string) => {
        return segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Helper function to build path up to a specific segment
    const buildPath = (index: number) => {
        return "/" + segments.slice(0, index + 1).join("/");
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* Home/Root */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.length > 0 && <BreadcrumbSeparator />}

                {/* Dynamic segments */}
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const path = buildPath(index);

                    return (
                        <div key={path} className="contents">
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={path}>{formatSegment(segment)}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}