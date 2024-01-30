import { mapBoxStyles } from "@/constants";
import { useMapboxConfigStore } from "@/stores/useMapboxLayers";
import Image from "next/image";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Layers } from "lucide-react";

const LayerModal = () => {
  const [open, setOpen] = useState(false);
  const mapboxConfig = useMapboxConfigStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-full p-3 text-gray-700 hover:bg-gray-200"
          type="button"
        >
          <Layers />
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="mt-4 grid grid-cols-4 gap-10">
          {Object.values(mapBoxStyles).map((s) => (
            <button
              type="button"
              onClick={() => {
                mapboxConfig.setConfig({ style: s.style });
                setOpen(false);
              }}
              key={s.label}
            >
              <Image
                src={s.image}
                width={150}
                height={150}
                alt=""
                className="rounded-xl hover:shadow-lg"
              />
              <p className="mt-2 text-gray-700 dark:text-gray-300">{s.label}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayerModal;
