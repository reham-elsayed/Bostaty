"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CallToAction() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-6">
                        Ready to start your journey?
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 mb-10">
                        Join thousands of developers building the next generation of SaaS applications.
                        Get started for free today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/workspace">
                            <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
                                Create Free Workspace
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
