import { listPendingForms } from '@/actions/form_submissions.action';

const PendingFormsPage = async () => {
  const pendingForms = await listPendingForms();
  console.log('Pending Forms:', pendingForms);

  return <div>PendingFormsPage</div>;
};

export default PendingFormsPage;
