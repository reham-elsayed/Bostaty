import { BreadcrumbComponent } from "@/components/Breadcrumbs/Breadcrumbs";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BreadcrumbComponent />
            {children}
        </>
    )
}