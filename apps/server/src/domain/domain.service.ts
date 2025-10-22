import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByDomain(domain: string) {
    const user = await this.prisma.user.findUnique({
      where: { customDomain: domain },
      include: { resumes: true },
    });

    if (!user || !user.customDomainResumeId) {
      return null;
    }

    const resume = user.resumes.find((resume) => resume.id === user.customDomainResumeId);

    return resume;
  }
}
