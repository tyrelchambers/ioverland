import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

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
        "border border-border p-3 rounded-md hover:border-secondary text-secondary",
        ctx.active === step &&
          "bg-secondary/10 border-secondary text-secondary",
        step < ctx.active && "complete-step",
        className
      )}
      onClick={() => ctx.setActive(step)}
      data-step-trigger={step}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full px-2 bg-secondary mr-2 text-sm font-bold text-secondary-foreground",
          ctx.active === step && "bg-secondary text-secondary-foreground"
        )}
        data-step={step}
      >
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
        `items-center grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 my-3 gap-3 text-sm text-secondary-foreground `,
        className
      )}
    >
      {children}
    </div>
  );
};

const Stepper = ({
  children,
  activeStep,
}: {
  children: React.ReactNode;
  activeStep?: number;
}) => {
  const [active, setActive] = React.useState(1);

  useEffect(() => {
    if (activeStep) {
      setActive(activeStep);
    }
  }, [activeStep]);

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

  return (
    <div
      className={cn("w-full", ctx.active !== step && "!hidden", className)}
      data-step={step}
    >
      {children}
    </div>
  );
};

export { StepperTabs, Stepper, StepperPanel, StepperTab };
