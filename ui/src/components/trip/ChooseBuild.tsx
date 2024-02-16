import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Build } from "@/types";
import Image from "next/image";
import RenderMedia from "../RenderMedia";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const ChooseBuild = ({
  builds,
  addBuildHandler,
  adventureBuilds,
  disabled,
}: {
  builds: Build[];
  addBuildHandler: (builds: Build[]) => void;
  adventureBuilds: Build[];
  disabled: boolean;
}) => {
  const [chosen, setChosen] = useState<Build[] | []>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setChosen(adventureBuilds);
  }, [adventureBuilds]);

  const addHandler = (build: Build) => {
    if (chosen.length === 0) {
      setChosen([build]);
    } else {
      setChosen([...chosen, build]);
    }
  };

  const removeHandler = (build: Build) => {
    const l = chosen.filter((b) => b.uuid !== build.uuid);
    setChosen(l);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button" disabled={disabled}>
          Add build
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add build</DialogTitle>
          <DialogDescription>Add a build to your adventure</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <div className=" flex flex-col gap-4">
            {builds.map((build) => (
              <div
                key={build.uuid}
                className="flex items-center gap-3 hover:bg-card"
              >
                <div className="w-[80px] rounded-lg overflow-hidden h-[80px] relative">
                  <RenderMedia media={build.banner} />
                </div>
                <p className="flex flex-1">{build.name}</p>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="mx-4"
                  onClick={() => {
                    addHandler(build);
                  }}
                >
                  Add
                </Button>
              </div>
            ))}

            <Separator />
            <p className="font-bold">Builds to add</p>

            {chosen.map((build) => (
              <div
                key={build.uuid}
                className="flex items-center gap-3 hover:bg-card"
              >
                <div className="w-[80px] rounded-lg overflow-hidden h-[80px] relative">
                  <RenderMedia media={build.banner} />
                </div>
                <p className="flex flex-1">{build.name}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mx-4"
                  onClick={() => removeHandler(build)}
                  type="button"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t border-border pt-4">
          <DialogClose>
            <Button variant="outline" type="button">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              addBuildHandler(chosen);
              setChosen([]);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseBuild;
