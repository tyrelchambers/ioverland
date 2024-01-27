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
import { FormField, FormItem, FormLabel } from "../ui/form";
import { History } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { generateYears } from "@/lib/utils";

interface Props {
  form: any;
  buildId: string | undefined;
}

const AddHistory = ({ form, buildId }: Props) => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<History>({
    year: "",
    event: "",
    build_id: buildId,
  });
  const id = createId();

  const addHistory = () => {
    const h = {
      ...item,
    };

    form.setValue(`history.${id}`, h);

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
          <DialogTitle>Add History</DialogTitle>
        </DialogHeader>

        <FormItem>
          <FormLabel>Event</FormLabel>
          <Input
            placeholder="eg: Repaired transmission"
            onChange={(e) => setItem({ ...item, event: e.target.value })}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Subcategory</FormLabel>
          <Select
            onValueChange={(value) => {
              setItem({
                ...item,
                year: value,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {generateYears()?.map((year) => (
                <SelectItem key={year} className="w-full" value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <DialogFooter>
          <Button onClick={addHistory}>Add modification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddHistory;
