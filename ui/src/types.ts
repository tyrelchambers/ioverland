import { z } from "zod";

const trip = z.object({
  name: z.string().min(1, { message: "Trip name is required" }),
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

const historySchema = z.object({
  uuid: z.string().optional(),
  year: z.string(),
  event: z.string(),
  build_id: z.union([z.string(), z.number()]).optional(),
});

export type History = z.infer<typeof historySchema>;

export const newBuildSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.record(z.string(), trip),
  links: z
    .record(z.string(), z.string().min(1, { message: "Link is required" }))
    .optional(),
  vehicle: z.object({
    model: z.string().optional(),
    make: z.string().optional(),
    year: z.string().optional(),
  }),
  modifications: z.record(z.string(), modification).optional(),
  public: z.boolean(),
  history: z.record(z.string(), historySchema).optional(),
});

export type NewBuildSchema = z.infer<typeof newBuildSchema>;

export const media = z.object({
  id: z.string().optional(),
  url: z.string(),
  type: z.string(),
  mime_type: z.string(),
  name: z.string(),
});

export type Media = z.infer<typeof media>;

export const buildPayload = z.object({
  name: z.string(),
  description: z.string().optional(),
  budget: z.string().optional(),
  trips: z.array(trip),
  links: z.array(z.string()),
  vehicle: z.object({
    model: z.string().optional(),
    make: z.string().optional(),
    year: z.string().optional(),
  }),
  modifications: z.array(modification),
  public: z.boolean(),
  user_id: z.string(),
  banner: media.optional(),
  photos: z.array(media).optional(),
  uuid: z.string().optional(),
  id: z.string().optional(),
  history: z.array(historySchema).optional(),
});

export type BuildPayload = z.infer<typeof buildPayload>;

export const commentSchema = z.object({
  uuid: z.string(),
  text: z.string(),
  created_at: z.date(),
  deleted: z.boolean(),
  likes: z.array(z.string()),
  build_id: z.string(),
  reply_id: z.string().optional(),
});

commentSchema.extend({
  replies: z.array(commentSchema),
});

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
  public: z.boolean(),
  user_id: z.string(),
  photos: z.array(media).optional(),
  banner: media.optional(),
  id: z.string().optional(),
  uuid: z.string(),
  views: z.number(),
  likes: z.array(z.string()).nullable(),
  comments: z.array(commentSchema),
  history: z.array(historySchema),
});

commentSchema.extend({
  build: buildSchema,
});

export type Build = z.infer<typeof buildSchema>;

const userBase = z.object({
  uuid: z.string(),
  builds: z.array(buildSchema),
  bookmarks: z.array(buildSchema),
  customer_id: z.string(),
  deleted_at: z.date().nullable(),
  max_public_builds: z.number(),
  views: z.number(),
  created_at: z.date(),
  bio: z.string(),
  banner: media.optional(),
  username: z.string().optional(),
  image_url: z.string(),
});

const domainUser = z
  .object({
    followers: z.array(userBase),
    following: z.array(userBase),
  })
  .and(userBase);

export type DomainUser = {
  username: string;
  avatar: string;
  builds: Build[];
  created_at: Date;
  views: number;
  followers: DomainUser[];
  following: DomainUser[];
  bio: string;
  banner: Media | undefined;
  uuid: string;
  image_url: string;
  bookmarks: Build[];
};

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
    max_files: z.number(),
    max_builds: z.number(),
    video_support: z.boolean(),
    can_create_adventures: z.boolean(),
    adventure_num_photos: z.number(),
  }),
  user: z.object({
    banner: media.optional(),
    bio: z.string().optional(),
    username: z.string().optional(),
  }),
});

commentSchema.extend({
  author: account,
});

export type Account = z.infer<typeof account>;

const explore = z.object({
  featured: z.array(buildSchema),
  top_10: z.array(buildSchema),
  goal_remaining: z.number(),
  build_count: z.number(),
});

export type Explore = z.infer<typeof explore>;

const publicProfile = z.object({
  username: z.string(),
  avatar: z.string(),
  builds: z.array(buildSchema),
  created_at: z.date(),
  views: z.number(),
  followers: z.array(domainUser),
  following: z.array(domainUser),
  bio: z.string(),
  banner: media.optional(),
  uuid: z.string(),
  plan: z.string().optional(),
});

export type PublicProfile = z.infer<typeof publicProfile>;

export const updateProfile = z.object({
  bio: z.string().max(255).optional(),
  username: z.string().min(1),
});

export type UpdateProfile = z.infer<typeof updateProfile>;

export interface UpdateProfileWithBanner extends UpdateProfile {
  banner?: Omit<Media, "uuid">;
}

export const newComment = z.object({
  comment: z.string().min(1),
});

export type NewComment = z.infer<typeof newComment>;
export interface EditBuildResponse {
  build: Build;
  can_be_public: boolean;
}

export interface Route {
  href: string;
  icon: JSX.Element;
  label: string;
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

export const isBuild = (obj: any): obj is Build => {
  if ("name" in obj) {
    return true;
  }

  return false;
};

export interface ClerkUser {
  image_url: string;
  username: string;
}
export const isUser = (obj: any): obj is ClerkUser => {
  if ("username" in obj) {
    return true;
  }

  return false;
};

export interface IComment {
  uuid: string;
  text: string;
  author: DomainUser;
  replies: IComment[] | null;
  created_at: Date;
  deleted: boolean;
  likes: string[];
  build_id: string;
  build: Build;
  reply_id?: string;
}

const waypoint = z.object({
  uuid: z.string(),
  name: z.string(),
  adventure_id: z.string(),
});

export type Waypoint = z.infer<typeof waypoint>;

const day = z.object({
  uuid: z.string(),
  name: z.string(),
  notes: z.string(),
  weather: z.string(),
});

export type Day = z.infer<typeof day>;

const location = z.object({
  uuid: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export type Location = z.infer<typeof location>;

const adventure = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  summary: z.string(),
  builds: z.array(buildSchema),
  media: z.array(media).optional(),
  created_at: z.date(),
  deleted_at: z.date().nullable(),
  comments: z.array(commentSchema),
  likes: z.array(userBase),
  waypoints: z.array(waypoint),
  user: userBase,
  days: z.array(day),
  locations: z.array(location),
  youtube_links: z.array(z.string()),
});

waypoint.extend({
  adventure: adventure,
  location: location,
});

export type Adventure = z.infer<typeof adventure>;

export const newTripSchema = z.object({
  name: z.string().min(1, { message: "Trip name is required" }),
  year: z.string(),
  builds: z.array(buildSchema),
});
