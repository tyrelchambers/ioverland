import { Modification } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import React, { useState } from "react";
import { FormDescription, FormItem, FormLabel } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { modificationCategories } from "@/constants";
import { findCategorySubcategories, formatPrice } from "@/lib/utils";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Input } from "../ui/input";

interface Props {
  form: any;
  build_id?: string | undefined;
}
const AddMod = ({ form, build_id }: Props) => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Modification>({
    name: "",
    price: "0",
    category: "",
    subcategory: "",
    build_id,
  });
  const id = createId();

  const subcategories = findCategorySubcategories(item?.category) ?? [];

  const addModification = () => {
    const mod = {
      ...item,
    };

    form.setValue(`modifications.${id}`, mod);
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
          <DialogTitle>Add Modification</DialogTitle>
        </DialogHeader>
        <FormItem>
          <FormLabel>Category</FormLabel>

          <Select
            onValueChange={(value) => {
              setItem({
                ...item,
                category: value,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {modificationCategories.map((category) => (
                <SelectItem
                  key={category.label}
                  className="w-full"
                  value={category.value}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <FormItem>
          <FormLabel>Subcategory</FormLabel>
          <Select
            onValueChange={(value) => {
              setItem({
                ...item,
                subcategory: value,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories?.map((category) => (
                <SelectItem
                  key={category.label}
                  className="w-full"
                  value={category.value}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <FormItem>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Name"
            onChange={(e) => {
              setItem({
                ...item,
                name: e.target.value,
              });
            }}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Price</FormLabel>
          <FormDescription>
            Input your price in cents (eg: 1000 = $10)
          </FormDescription>
          <Input
            type="number"
            onChange={(e) => {
              setItem({
                ...item,
                price: e.target.value,
              });
            }}
          />
          <FormDescription>{formatPrice(Number(item.price))}</FormDescription>
        </FormItem>
        <DialogFooter>
          <Button onClick={addModification}>Add modification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMod;
