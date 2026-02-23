import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NeuroPitch - AI Tactical Brain",
    description: "Next-gen AI cricket simulator and analytics dashboard",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen antialiased bg-blackBg text-white`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <AnimatedBackground />
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex-1 flex flex-col relative overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                                {children}
                            </main>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
