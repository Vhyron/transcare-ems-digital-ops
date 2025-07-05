"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useAddStaff } from "@/hooks/use-user";

const formSchema = z
  .object({
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    email: z.string().email().trim(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type NewStaffFormData = z.infer<typeof formSchema>;

export default function NewStaffForm() {
  const router = useRouter();

  const addStaff = useAddStaff();

  const form = useForm<NewStaffFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: NewStaffFormData) => {
    addStaff.mutate(data, {
      onSuccess: (res) => {
        if (res.error) {
          toast.error('Staff Registration Failed!', {
            description: res.error,
            richColors: true
          });
          return;
        }

        toast.success('Staff Registered Successfully!', {
          description: 'New staff has been added, let them know!'
        });
        form.reset();
      },
      onError: (error) => {
        toast.error('Staff Registration Failed!', {
          description: error.message || 'An unexpected error occurred',
          richColors: true
        });
      },
    });
  };

  const handleCancel = () => {
    form.reset();

    router.back();
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name
                        <span className="text-sm text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter first name"
                          disabled={addStaff.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name
                        <span className="text-sm text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter last name"
                          disabled={addStaff.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        disabled={addStaff.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          disabled={addStaff.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter confirm password"
                          disabled={addStaff.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-4 md:flex-row flex-col-reverse">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={addStaff.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-8" disabled={addStaff.isPending}>
                {addStaff.isPending && <Loader className="size-4 animate-spin" />}
                {addStaff.isPending ? "Registering..." : " Register New Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
