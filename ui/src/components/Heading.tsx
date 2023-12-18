import { cn } from "@/lib/utils";

export const H1 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h1 className={cn("text-5xl font-black font-serif mb-1", className)}>
    {children}
  </h1>
);

export const H2 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2 className={cn("text-3xl font-black font-serif mb-1", className)}>
    {children}
  </h2>
);
