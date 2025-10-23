import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class CustomDomainMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request & { customDomain?: { hostname: string; userId: string; resumeId: string } }, res: Response, next: NextFunction) {
    const host = req.hostname;
    const publicUrl = this.configService.get<string>("PUBLIC_URL");

    // Extract the main domain from PUBLIC_URL (e.g., "reactive-resume.com" from "https://reactive-resume.com")
    const mainDomain = publicUrl ? new URL(publicUrl).hostname : "";

    // If the request is to the main domain, proceed normally
    if (host === mainDomain || host === "localhost" || host.includes("127.0.0.1")) {
      return next();
    }

    // Check if this is a custom domain
    try {
      const user = await this.prisma.user.findUnique({
        where: { customDomain: host },
      });

      if (!user || !user.customDomainResumeId) {
        return next();
      }

      // Store the custom domain info in the request for the controller to use
      req.customDomain = {
        hostname: host,
        userId: user.id,
        resumeId: user.customDomainResumeId,
      };

      return next();
    } catch (error) {
      // If there's an error, just continue with the normal flow
      return next();
    }
  }
}
