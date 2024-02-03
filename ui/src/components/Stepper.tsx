import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface StepperContextProps {
  active: number;
  setActive: (active: number) => void;
  setTotalTabs: (totalTabs: number) => void;
  totalTabs: number;
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
        "border border-border p-3 rounded-md hover:border-zinc-800 text-foreground font-bold text-xs",
        ctx.active === step && "bg-zinc-800/10 border-zinc-800 text-foreground",
        step < ctx.active && "complete-step",
        className
      )}
      onClick={() => ctx.setActive(step)}
      data-step-trigger={step}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full px-2 bg-zinc-800 mr-2 text-sm font-bold text-background"
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
  const ctx = useStepper();

  useEffect(() => {
    ctx.setTotalTabs(React.Children.count(children));
  }, []);

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
  className,
}: {
  children: React.ReactNode;
  activeStep?: number;
  className?: string;
}) => {
  const [active, setActive] = React.useState(1);
  const [totalTabs, setTotalTabs] = React.useState(0);

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
        totalTabs,
        setTotalTabs,
      }}
    >
      <section className={className}>{children}</section>
    </StepperContext.Provider>
  );
};

interface IStepperPanel {
  children: React.ReactNode;
  className?: string;
  step: number;
  confirm?: JSX.Element;
}

const StepperPanel = ({
  children,
  className,
  step,
  confirm,
}: IStepperPanel) => {
  const ctx = useStepper();

  const nextHandler = () => ctx.setActive(ctx.active + 1);
  const prevHandler = () => ctx.setActive(ctx.active - 1);

  return (
    <div
      className={cn("w-full", ctx.active !== step && "!hidden", className)}
      data-step={step}
    >
      {children}
      <Separator className="my-6" />
      <footer className="flex justify-end gap-4">
        {ctx.active > 1 && (
          <Button variant="outline" type="button" onClick={prevHandler}>
            Back
          </Button>
        )}
        {ctx.totalTabs !== ctx.active ? (
          <Button type="button" variant="secondary" onClick={nextHandler}>
            Next
          </Button>
        ) : (
          confirm
        )}
      </footer>
    </div>
  );
};

export { StepperTabs, Stepper, StepperPanel, StepperTab };
