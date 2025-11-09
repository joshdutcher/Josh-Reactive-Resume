import { defaultResumeData, idSchema, resumeDataSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema } from "../user";

export const resumeSchema = z.object({
  id: idSchema,
  title: z.string(),
  slug: z.string(),
  data: resumeDataSchema.default(defaultResumeData),
  visibility: z.enum(["private", "public"]).default("private"),
  locked: z.boolean().default(false),
  customDomains: z
    .array(z.string().min(3).max(255))
    .max(5)
    .default([])
    .transform((domains) =>
      // Strip protocol, trailing slashes, normalize
      domains
        .map((d) => d.replace(/^https?:\/\//, "").replace(/\/$/, "").trim())
        .filter((d) => d.length > 0),
    ),
  userId: idSchema,
  user: userSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export class ResumeDto extends createZodDto(resumeSchema) {}
