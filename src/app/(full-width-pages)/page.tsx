import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="flex h-[100vh] items-center justify-center">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <h1 className="mb-4 text-2xl font-semibold">
          Welcome to NoQBot Admin Dashboard
        </h1>
        <p className="mb-2">
          This is your central hub for managing all aspects of NoQBot.
        </p>
        <p className="mb-2">
          Use the sidebar to navigate through different sections.
        </p>
        <p className="mb-2">Stay tuned for more features and updates!</p>
      </div>
    </div>
  );
}
