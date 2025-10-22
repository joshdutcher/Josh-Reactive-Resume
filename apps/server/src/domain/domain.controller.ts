import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { DomainService } from "./domain.service";

@ApiTags("Domain")
@Controller("domain")
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get(":domain")
  async findOneByDomain(@Param("domain") domain: string) {
    const resume = await this.domainService.findOneByDomain(domain);

    if (!resume) {
      throw new NotFoundException("The requested domain is not linked to any resume.");
    }

    return resume;
  }
}
