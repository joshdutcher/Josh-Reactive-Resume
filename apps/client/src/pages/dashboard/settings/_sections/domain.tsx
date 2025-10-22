import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUpdateUserDomain } from "@/client/services/user";
import { useUser } from "@/client/services/user";
import { useResumes } from "@/client/services/resume";
import { useEffect } from "react";

const formSchema = z.object({
  domain: z.string().optional(),
  resumeId: z.string().optional(),
});

export const DomainSettings = () => {
  const { user } = useUser();
  const { resumes } = useResumes();
  const { updateUserDomain, loading } = useUpdateUserDomain();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
      resumeId: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        domain: user.customDomain || "",
        resumeId: user.customDomainResumeId || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await updateUserDomain(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{t`Custom Domain`}</h3>
        <p className="leading-relaxed opacity-75">
          {t`You can map a custom domain to one of your resumes. This feature is only available for self-hosted instances.`}
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-6 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="domain"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Domain`}</FormLabel>
                <FormControl>
                  <Input placeholder="www.johndoe.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="resumeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Target Resume`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select a resume`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resumes && resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2 self-center sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {t`Save Changes`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
