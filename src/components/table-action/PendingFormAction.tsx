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
import { FormSubmission } from '../../db/schema/form_submissions.schema';
import { Separator } from '../ui/separator';
import { updateFormSubmission } from '../../actions/form_submissions.action';
import { toast } from 'sonner';
import { capitalizeString } from '../../utils';
import { useAuth } from '../provider/auth-provider';

interface Props {
  formSubmission: FormSubmission;
}

const PendingFormAction = ({ formSubmission }: Props) => {
  const { user } = useAuth();

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
    console.log(formSubmission);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View Form Details</DropdownMenuItem>

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
                Are you sure you want to reject this form? This action will mark
                the form as rejected and notify the relevant parties.
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
  );
};

export default PendingFormAction;
