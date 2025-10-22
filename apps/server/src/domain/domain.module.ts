import { Module } from "@nestjs/common";

import { DomainController } from "./domain.controller";
import { DomainService } from "./domain.service";
import { CustomDomainMiddleware } from "./middleware/custom-domain.middleware";

@Module({
  controllers: [DomainController],
  providers: [DomainService, CustomDomainMiddleware],
  exports: [CustomDomainMiddleware],
})
export class DomainModule {}
