import { Controller, Get, NotFoundException, Param, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { DomainService } from "./domain.service";

@ApiTags("Domain")
@Controller("domain")
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get("current")
  async findResumeForCurrentDomain(@Req() req: Request & { customDomain?: { hostname: string; userId: string; resumeId: string } }) {
    // Check if this request has custom domain info attached by middleware
    const customDomain = req.customDomain;

    if (!customDomain) {
      throw new NotFoundException("This is not a custom domain.");
    }

    const resume = await this.domainService.findOneByDomain(customDomain.hostname);

    if (!resume) {
      throw new NotFoundException("The requested domain is not linked to any resume.");
    }

    return resume;
  }

  @Get(":domain")
  async findOneByDomain(@Param("domain") domain: string) {
    const resume = await this.domainService.findOneByDomain(domain);

    if (!resume) {
      throw new NotFoundException("The requested domain is not linked to any resume.");
    }

    return resume;
  }
}
