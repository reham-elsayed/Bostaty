export function SeparatorComponent() {
    const data = ["Isolation", "Security", "Collaboration", "Analytics", "Scalability", "Modularity"]
    return (
        <div className="px-5 w-full">
            <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-2 border-border divide-x-2 divide-y-2 divide-border bg-muted/10 backdrop-blur-sm">
                {data.map((item, index) => (
                    <span
                        key={index}
                        className="py-4 md:py-6 lg:py-10 px-4 flex justify-center items-center text-[10px] sm:text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest text-center"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    )
}