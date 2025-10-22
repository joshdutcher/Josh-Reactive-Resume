import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const updateDomainSchema = z.object({
  domain: z.string().optional(),
  resumeId: z.string().optional(),
});

export class UpdateDomainDto extends createZodDto(updateDomainSchema) {}
