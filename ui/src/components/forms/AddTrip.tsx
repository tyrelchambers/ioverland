import React, { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { createId } from "@paralleldrive/cuid2";

interface Props {
  form: any;
  buildId?: string | undefined;
}

const AddTrip = ({ form, buildId }: Props) => {
  const [open, setOpen] = useState(false);
  const [trip, setTrip] = useState({
    name: "",
    year: "0",
  });
  const id = createId();

  const addTripHandler = () => {
    const t = {
      ...trip,
      build_id: buildId,
    };

    form.setValue(`trips.${id}`, t);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <PlusCircle className="ml-2" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add trip</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="eg: Valley of the Gods Road, The Alpine Loop"
            onChange={(e) => setTrip({ ...trip, name: e.target.value })}
          />

          <FormLabel>Year</FormLabel>
          <Input
            type="number"
            min={0}
            placeholder="eg: 2022"
            onChange={(e) => setTrip({ ...trip, year: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button onClick={addTripHandler}>Add trip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrip;
