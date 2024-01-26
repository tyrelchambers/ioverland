import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Button } from "./ui/button";

interface StepperContextProps {
  active: number;
  setActive: (active: number) => void;
}

interface IStepperTabs {
  children?: React.ReactNode;
  className?: string;
}

const StepperContext = React.createContext<StepperContextProps | null>(null);
const useStepper = () => {
  const context = React.useContext(StepperContext);

  if (!context) {
    throw new Error("Stepper must be used within a <Stepper />");
  }

  return context;
};

const StepperTab = ({
  children,
  step,
  className,
}: {
  children: React.ReactNode;
  step: number;
  className?: string;
}) => {
  const ctx = useStepper();

  return (
    <button
      type="button"
      className={cn(
        "border border-border p-3 rounded-md hover:border-primary",
        ctx.active === step && "bg-primary/10 border-primary text-foreground",
        className
      )}
      onClick={() => ctx.setActive(step)}
    >
      <span className="h-4 w-4 rounded-full px-2 bg-primary mr-2 text-sm font-bold text-white">
        {step}
      </span>
      {children}
    </button>
  );
};

const StepperTabs = ({ className, children }: IStepperTabs) => {
  return (
    <div
      className={cn(
        `items-center grid grid-cols-6 my-3 gap-3 text-sm text-foreground`,
        className
      )}
    >
      {children}
    </div>
  );
};

const Stepper = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = React.useState(1);
  return (
    <StepperContext.Provider
      value={{
        active,
        setActive,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};

interface IStepperPanel {
  children: React.ReactNode;
  className?: string;
  step: number;
}

const StepperPanel = ({ children, className, step }: IStepperPanel) => {
  const ctx = useStepper();

  if (ctx.active !== step) {
    return null;
  }

  return <div className={cn("w-full", className)}>{children}</div>;
};

export { StepperTabs, Stepper, StepperPanel, StepperTab };
