import { cn } from "@/lib/utils";

export const H1 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h1
    className={cn(
      "text-4xl font-black font-serif mb-1 text-foreground",
      className
    )}
  >
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
  <h2
    className={cn(
      "text-3xl font-black font-serif mb-1 text-foreground",
      className
    )}
  >
    {children}
  </h2>
);

export const H3 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={cn(
      "text-xl font-black font-serif mb-1 text-foreground",
      className
    )}
  >
    {children}
  </h3>
);
