'use client';

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
import {
  deleteFormSubmission,
  updateFormSubmission,
} from '../../actions/form_submissions.action';
import { FormSubmission } from '../../db/schema/form_submissions.schema';
import { capitalizeString } from '../../utils';
import { generatePdf } from '../../utils/pdf_util';
import EmailForm from '../forms/EmailForm';
import { useAuth } from '../provider/auth-provider';
import { Separator } from '../ui/separator';

interface Props {
  formSubmission: FormSubmission;
}

const PendingFormAction = ({ formSubmission }: Props) => {
  const { user } = useAuth();
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (
    status: 'approved' | 'rejected',
    formSubmission: FormSubmission
  ) => {
    const res = await updateFormSubmission(formSubmission.id, {
      status: status,
      reviewed_by: user?.id,
      updated_at: new Date(),
    });

    if (res?.error) {
      toast.error('Failed to approve form submission', {
        description: 'There was an error approving the form submission.',
        richColors: true,
      });
    }

    toast.success(
      `${capitalizeString(formSubmission.form_type, '_')} ${capitalizeString(
        status
      )}!`
    );
  };

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
      const pdfBuffer = await generatePdf(
        formSubmission,
        true
      );

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
          <Button variant="ghost" className="w-8 h-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => generatePdf(formSubmission)}
          >
            View Form Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEmailModal(true)}>
            Email
          </DropdownMenuItem>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Approve Form
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve this form?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to approve this form? This action will
                  mark the form as approved and notify the relevant parties.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleUpdateStatus('approved', formSubmission)}
                >
                  Approve Form
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Reject Form
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject this form?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject this form? This action will
                  mark the form as rejected and notify the relevant parties.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleUpdateStatus('rejected', formSubmission)}
                >
                  Reject Form
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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

export default PendingFormAction;
