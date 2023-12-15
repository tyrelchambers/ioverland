import { z } from "zod";

const trip = z.object({
  name: z.string().optional(),
  year: z.string().optional(),
});

export type Trip = z.infer<typeof trip>;

const modification = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  name: z.string().optional(),
  price: z.string().optional(),
});
export type Modification = z.infer<typeof modification>;

export const newBuildSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.record(z.string(), trip).optional(),
  links: z.record(z.string(), z.string().optional()).optional(),
  vehicle: z
    .object({
      model: z.string(),
      make: z.string(),
      year: z.string(),
    })
    .optional(),
  modifications: z.record(z.string(), modification).optional(),
  private: z.boolean(),
  user_id: z.string(),
});

type NewBuildSchema = z.infer<typeof newBuildSchema>;

export type NewBuildSchemaWithoutUserId = Omit<NewBuildSchema, "user_id">;

const newBuild = z.object({
  name: z.string(),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.array(trip).optional(),
  links: z.array(z.string().optional()).optional(),
  vehicle: z
    .object({
      model: z.string(),
      make: z.string(),
      year: z.string(),
    })
    .optional(),
  modifications: z.array(modification).optional(),
  private: z.boolean(),
  user_id: z.string(),
});

export type NewBuild = z.infer<typeof newBuild>;
