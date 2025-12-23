import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface SettingsLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function SettingsLayout({ 
  children, 
  className,
  title,
  description 
}: SettingsLayoutProps) {
  return (
    <div className={cn(
      "min-h-full bg-transparent p-10 md:p-12 pb-24 max-w-4xl mx-auto animate-in fade-in duration-500",
      className
    )}>
      {(title || description) && (
        <div className="mb-12">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-12">
        {children}
      </div>
    </div>
  );
}
