"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
    {
        title: "Create Your Workspace",
        description: "Start by giving your workspace a name and a unique slug. This creates your dedicated environment.",
        imagePlaceholder: "bg-blue-100 dark:bg-blue-900/20",
        imageText: "Tenant Creation Form",
        side: "left"
    },
    {
        title: "Select Modules",
        description: "Choose the modules you need: HR, CRM, E-commerce, and more. Pay only for what you use.",
        imagePlaceholder: "bg-purple-100 dark:bg-purple-900/20",
        imageText: "Module Selection",
        side: "right"
    },
    {
        title: "Invite Your Team",
        description: "Add team members and assign granular permissions. Collaboration made easy.",
        imagePlaceholder: "bg-pink-100 dark:bg-pink-900/20",
        imageText: "Team Management",
        side: "left"
    },
];

export function OnboardingFlow() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        How it works
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Get up and running in minutes with our streamlined onboarding process.
                    </p>
                </div>

                <div className="space-y-24">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7 }}
                            className={`flex flex-col md:flex-row gap-12 items-center ${step.side === "right" ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            <div className="flex-1 space-y-4">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold mb-4">
                                    {index + 1}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                            <div className="flex-1 w-full relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className={`relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl ${step.imagePlaceholder} flex items-center justify-center`}>
                                    {/* Placeholder for Screenshot */}
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm">
                                            <span className="text-2xl">📸</span>
                                        </div>
                                        <p className="font-medium text-gray-500 dark:text-gray-400">
                                            {step.imageText} Screenshot
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                            1920 x 1080
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
