import { createId } from "@paralleldrive/cuid2";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { FormLabel } from "../ui/form";
import { Input } from "../ui/input";

const AddWaypoint = ({
  form,
  adventure_id,
}: {
  form: any;
  adventure_id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({
    name: "",
    year: "0",
  });
  const id = createId();

  const addHandler = () => {
    const t = {
      ...item,
      build_id: adventure_id,
    };

    form.setValue(`waypoints.${id}`, t);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <PlusCircle />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add waypoint</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Name this waypoint"
            onChange={(e) => setItem({ ...item, name: e.target.value })}
          />

          <FormLabel>Geo-coordinates</FormLabel>
        </div>
        <DialogFooter>
          <Button onClick={addHandler}>Add waypoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWaypoint;
