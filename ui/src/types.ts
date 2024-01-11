import { z } from "zod";

const trip = z.object({
  name: z.string().optional(),
  year: z.string().optional(),
  build_id: z.union([z.string(), z.number()]).optional(),
  uuid: z.string().optional(),
  id: z.number().optional(),
});

export type Trip = z.infer<typeof trip>;

const modification = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  name: z.string().optional(),
  price: z.string().optional(),
  build_id: z.union([z.string(), z.number()]).optional(),
  uuid: z.string().optional(),
  id: z.number().optional(),
});
export type Modification = z.infer<typeof modification>;

export const newBuildSchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.record(z.string(), trip).optional(),
  links: z.record(z.string(), z.string().optional()).optional(),
  vehicle: z.object({
    model: z.string().optional(),
    make: z.string().optional(),
    year: z.string().optional(),
  }),
  modifications: z.record(z.string(), modification).optional(),
  private: z.boolean(),
  views: z.number().optional(),
  likes: z.array(z.string()).optional().nullable(),
});

export type NewBuildSchema = z.infer<typeof newBuildSchema>;

export type NewBuildSchemaWithoutUserId = Omit<NewBuildSchema, "user_id">;

const media = z.object({
  id: z.string().optional(),
  url: z.string(),
  type: z.string(),
  uuid: z.string(),
  mime_type: z.string(),
  name: z.string(),
});

export type Media = z.infer<typeof media>;

export const buildSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.array(trip).optional(),
  links: z.array(z.string().optional()).optional(),
  vehicle: z.object({
    model: z.string().optional(),
    make: z.string().optional(),
    year: z.string().optional(),
  }),
  modifications: z.array(modification).optional(),
  private: z.boolean(),
  user_id: z.string(),
  photos: z.array(media).optional(),
  banner: media.optional(),
  id: z.string().optional(),
  uuid: z.string().optional(),
  views: z.number().optional(),
  likes: z.array(z.string()).optional().nullable(),
});

export type Build = z.infer<typeof buildSchema>;

const domainUser = z.object({
  uuid: z.string(),
  builds: z.array(buildSchema),
  bookmarks: z.array(buildSchema),
  deleted_on: z.date(),
});

export type DomainUser = z.infer<typeof domainUser>;

const account = z.object({
  has_subscription: z.boolean(),
  subscription: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    next_invoice_date: z.date(),
    deleted_at: z.date().optional(),
  }),
  deleted_at: z.date().nullable(),
  total_builds: z.number(),
  builds_remaining: z.number(),
  plan_limits: z.object({
    max_file_size: z.string(),
    max_file_uploads: z.number(),
  }),
});

export type Account = z.infer<typeof account>;

const explore = z.object({
  featured: z.array(buildSchema),
  top_10: z.array(buildSchema),
  goal_remaining: z.number(),
  build_count: z.number(),
});

export type Explore = z.infer<typeof explore>;

export interface EditBuildResponse {
  build: Build;
  can_be_public: boolean;
}

export interface Route {
  href: string;
  icon: JSX.Element;
  label: string;
}

export interface BuildPayload extends Omit<Build, "banner" | "photos"> {
  banner?: Omit<Media, "uuid">;
  photos?: Omit<Media, "uuid">[];
}

export interface Plan {
  name: string;
  tagline: string;
  price: number;
  plan_name: string;
  features: string[];
  featured?: boolean;
  plan_id?: string;
  redirect_link: string;
}
