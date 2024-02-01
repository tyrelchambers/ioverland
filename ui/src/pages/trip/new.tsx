import { H1 } from "@/components/Heading";
import Map from "@/components/trip/Map";
import DayForm from "@/components/trip/forms/Day";
import General from "@/components/trip/forms/General";
import { useDomainUser } from "@/hooks/useDomainUser";
import { Day, daySchema, newTripSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { FilePondFile } from "filepond";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const NewTrip = () => {
  const { account, user } = useDomainUser();
  const [photos, setPhotos] = useState<FilePondFile[]>([]);
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [addingPoint, setAddingPoint] = useState(false);
  const addPointRef = useRef(addingPoint);
  const map = useRef<mapboxgl.Map | null>(null);

  const builds = user.data?.builds;

  const form = useForm({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      name: "",
      summary: "",
      year: "",
      builds: {},
      days: {},
    },
  });

  const addPointHandler = () => {
    setAddingPoint(!addingPoint);
    addPointRef.current = !addingPoint;
  };

  const addDayHandler = (data: z.infer<typeof daySchema>) => {
    const newDay: Record<string, Day> = {
      [createId()]: data,
    };
    form.setValue("days", { ...form.getValues("days"), ...newDay });
    setShowAddDayForm(false);
  };

  return (
    <section className="h-screen w-full flex overflow-hidden">
      <header className="w-[500px] h-full p-4 z-10 relative bg-white overflow-y-auto">
        <div>
          <H1 className="text-xl">Create a trip</H1>
          <p className="text-muted-foreground">
            Fill out some details for your trip and then you can attach it to a
            build if you would like.
          </p>
        </div>

        {!showAddDayForm ? (
          <General
            account={account.data}
            builds={builds}
            form={form}
            setPhotos={setPhotos}
            setShowAddDayForm={setShowAddDayForm}
          />
        ) : (
          <DayForm
            setShow={setShowAddDayForm}
            addingPoint={addingPoint}
            addPointHandler={addPointHandler}
            map={map}
            addDayHandler={addDayHandler}
          />
        )}
      </header>
      <Map
        addPointRef={addPointRef}
        map={map}
        setAddingPoint={setAddingPoint}
      />
    </section>
  );
};

export default NewTrip;
