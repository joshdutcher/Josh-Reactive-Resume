import { Injectable, Logger } from "@nestjs/common";
import { defaultMetadata } from "@reactive-resume/schema";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

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

    if (!resume) {
      return null;
    }

    // Ensure resume data has required structure by merging with defaults
    // This prevents crashes when database contains incomplete/malformed data
    const resumeData = resume.data as any;

    if (!resumeData?.metadata?.page) {
      this.logger.warn(
        `Resume ${resume.id} for domain ${domain} missing metadata.page structure. Merging with defaults.`,
      );

      // Deep merge to preserve existing data while filling in missing structure
      const mergedData = {
        ...resumeData,
        metadata: {
          ...(resumeData?.metadata || {}),
          ...defaultMetadata,
          // Preserve existing metadata fields if they exist
          ...(resumeData?.metadata ? resumeData.metadata : {}),
        },
      };

      return {
        ...resume,
        data: mergedData,
      };
    }

    return resume;
  }
}
