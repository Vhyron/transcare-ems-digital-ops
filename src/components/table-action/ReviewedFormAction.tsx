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
import { toast } from 'sonner';
import { deleteFormSubmission } from '../../actions/form_submissions.action';
import {
  FormSubmission,
  FormType,
} from '../../db/schema/form_submissions.schema';
import { Separator } from '../ui/separator';
import { hospitalTripTicketsPdf } from '../../utils/pdf';

interface Props {
  formSubmission: FormSubmission;
  formData: any;
}

const ReviewedFormAction = ({ formSubmission, formData }: Props) => {
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

  const generatePdf = async (form: FormType) => {
    switch (form) {
      case 'hospital_trip_tickets':
        hospitalTripTicketsPdf(formData);
        break;
      case 'dispatch_forms':
        console.log('Generate Dispatch Form');
        break;
      case 'advance_directives':
        console.log('Generate Advance Directives');
        break;
      case 'refusal_forms':
        console.log('Generate Refusal Forms');
        break;
      case 'conduction_refusal_forms':
        console.log('Generate Conduction Refusal Forms');
        break;
      default:
        toast.error('Invalid form type', {
          description: 'The form type is not recognized.',
          richColors: true,
        });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generatePdf(formSubmission.form_type)}>
          View Form Details
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
  );
};

export default ReviewedFormAction;
