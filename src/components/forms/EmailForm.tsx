import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Loader } from 'lucide-react';
import { FormType } from '../../db/schema/form_submissions.schema';
import { capitalizeString } from '../../utils';
import { generatePdf } from '../../utils/pdf_util';

interface EmailFormProps {
  open: boolean;
  loading: boolean;
  onSubmit: (emailOptions: {
    to: string;
    subject: string;
    text: string;
  }) => void;
  onOpenChange: (open: boolean) => void;
  formType: FormType;
  formData?: any;
}

const formSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  text: z.string().min(1, 'Message is required'),
});
type EmailFormData = z.infer<typeof formSchema>;

const EmailForm = ({
  open,
  loading,
  onSubmit,
  onOpenChange,
  formType,
  formData,
}: EmailFormProps) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      text: '',
    },
  });

  const handleSubmit = (data: EmailFormData) => {
    onSubmit({ to: data.to, subject: data.subject, text: data.text });
    form.reset();
  };

  const handleOpenChange = () => {
    onOpenChange(!open);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-disabled={loading}>
        <DialogHeader>
          <DialogTitle>
            Send Email with PDF Attachment - {capitalizeString(formType, '_')}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter recipient email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter subject"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter email body..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-start gap-2 border rounded-md p-2 w-full"
                onClick={() => generatePdf(formType, formData)}
                disabled={loading}
              >
                <div className="flex items-center text-gray-500">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="text-sm">
                    PDF Attached - {capitalizeString(formType, '_')}
                  </span>
                </div>
              </Button>
            </div>

            <DialogFooter>
              <Button disabled={loading}>
                {loading ? <Loader className="size-4 animate-spin" /> : ''}
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailForm;
