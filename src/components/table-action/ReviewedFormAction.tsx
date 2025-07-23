import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { sendEmailWithPdf } from '../../actions/email.action';
import { deleteFormSubmission } from '../../actions/form_submissions.action';
import { FormSubmission } from '../../db/schema/form_submissions.schema';
import { generatePdf } from '../../utils/pdf_util';
import EmailForm from '../forms/EmailForm';
import { Separator } from '../ui/separator';

interface Props {
  formSubmission: FormSubmission;
}

const ReviewedFormAction = ({ formSubmission }: Props) => {
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (formSubmission: FormSubmission) => {
    const res = await deleteFormSubmission(formSubmission.id);

    if (!res) {
      toast.error('Failed to delete form submission', {
        description: 'There was an error deleting the form submission.',
        richColors: true,
      });
    }

    toast.success('Deleted form submission successfully!');
  };

  const handleSendEmail = async (emailOptions: {
    to: string;
    subject: string;
    text: string;
  }) => {
    setLoading(true);
    try {
      const pdfBuffer = await generatePdf(formSubmission, true);

      await sendEmailWithPdf(pdfBuffer!, {
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: `<b>${emailOptions.text}</b>`,
      });

      toast.success('Email sent successfully with PDF attachment!');
      setOpenEmailModal(false);
    } catch (error) {
      console.error('Error sending email with PDF:', error);
      toast.error('Failed to send email', {
        description: 'There was an error sending the email with the PDF.',
      });
    }
    setLoading(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => generatePdf(formSubmission)}>
            View Form Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEmailModal(true)}>
            Email
          </DropdownMenuItem>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  user and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/80 active:bg-destructive/90"
                  onClick={() => handleDelete(formSubmission)}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <EmailForm
        open={openEmailModal}
        loading={loading}
        onSubmit={handleSendEmail}
        onOpenChange={setOpenEmailModal}
        formSubmission={formSubmission}
      />
    </>
  );
};

export default ReviewedFormAction;
