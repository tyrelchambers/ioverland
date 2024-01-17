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

const AddLink = ({
  form,
  buildId,
}: {
  form: any;
  buildId?: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<string>("");
  const id = createId();

  const addLink = () => {
    form.setValue(`links.${id}`, item);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <PlusCircle className="ml-2" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add link</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <FormLabel>Link</FormLabel>
          <Input
            placeholder="eg: Valley of the Gods Road, The Alpine Loop"
            onChange={(e) => setItem(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={addLink}>Add trip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLink;
