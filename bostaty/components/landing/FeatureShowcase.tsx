"use client";

import { motion } from "framer-motion";
import { Layers, Shield, Users, BarChart3, Zap, Globe } from "lucide-react";

const features = [
    {
        name: "Multi-Tenancy",
        description: "Built-in tenant isolation and data security. Create unlimited workspaces.",
        icon: Layers,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
    },
    {
        name: "Role-Based Access",
        description: "Granular permission system to control who can see and do what.",
        icon: Shield,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/10",
    },
    {
        name: "Team Collaboration",
        description: "Invite members via email and manage team structure effortlessly.",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/10",
    },
    {
        name: "Modular Architecture",
        description: "Enable or disable modules like HR, CRM, and Shop per tenant.",
        icon: Zap,
        color: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/10",
    },
    {
        name: "Analytics",
        description: "Beautiful dashboards and reporting tools for data-driven decisions.",
        icon: BarChart3,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/10",
    },
    {
        name: "Global Scale",
        description: "Ready for internationalization and deployed on edge networks.",
        icon: Globe,
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/10",
    },
];

export function FeatureShowcase() {
    return (
        <section id="features" className="py-24 sm:py-32">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Everything you need to ship faster
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        A complete toolkit for building modern SaaS applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`inline-flex p-3 rounded-lg mb-4 ${feature.bg} ${feature.color}`}>
                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                {feature.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
