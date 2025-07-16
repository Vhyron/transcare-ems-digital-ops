import { FORM_TYPE_TABLES } from '@/db/schema/form_submissions.schema';

export const allFormStatus = [
  {
    value: 'approved',
    label: 'Approved',
    icon: 'Check',
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: 'ClockFading',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: 'CircleX',
  },
];

export const reviewedFormStatus = [
  {
    value: 'approved',
    label: 'Approved',
    icon: 'Check',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: 'CircleX',
  },
];

export const formTypes = FORM_TYPE_TABLES.map((formType) => {
  const label = formType.split('_').join(' ');
  return {
    value: formType,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    icon: 'FileText',
  };
});
