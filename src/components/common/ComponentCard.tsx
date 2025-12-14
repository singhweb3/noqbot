import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  action?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc,
  action,
}) => {
  const hasDesc = Boolean(desc);

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div
        className={`flex justify-between gap-4 px-5 py-4 ${
          hasDesc ? "items-start" : "items-center"
        }`}
      >
        <div>
          <h3
            className={`text-base text-gray-800 dark:text-white/90 ${
              hasDesc ? "font-medium" : "font-semibold"
            }`}
          >
            {title}
          </h3>

          {hasDesc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>

        {/* Action Area */}
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Card Body */}
      <div className="border-t border-gray-100 p-4 sm:px-6 dark:border-gray-800">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
