'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/provider/auth-provider';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';
import SignatureForm, { SignatureData } from '@/components/forms/SignatureForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FormData {
  id: string;
  created_at: string;
  updated_at: string;

  // Patient General Information
  patient_first_name: string;
  patient_middle_name: string;
  patient_last_name: string;
  patient_age: number;
  patient_sex: string;
  patient_birthdate: string;
  patient_citizenship: string;
  patient_address: string;
  patient_contact_no: string;

  // Next of Kin/Legal Guardian Information
  kin_name: string;
  kin_relation: string;
  kin_contact_no: string;
  kin_address: string;
  medical_record: string;
  date_accomplished: string;

  // Vital Signs
  vital_bp: string;
  vital_pulse: string;
  vital_resp: string;
  vital_skin: string;
  vital_pupils: string;
  vital_loc: string;

  // Narrative
  narrative_description: string;

  // Witness Information
  witness_name: string;
  witness_date: string;
  witness_signature_image: string;

  // Metadata
  completed_by: string;
  form_status: string;
  oriented_person_place_time: boolean;
  coherent_speech: boolean;
  hallucinations: boolean;
  suicidal_homicidal_ideation: boolean;
  understands_refusal_consequences: boolean;
  refused_treatment_and_transport: boolean;
  refused_treatment_willing_transport: boolean;
  wants_treatment_refused_transport: boolean;
}

export default function ConductionRefusalForm() {
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, loading } = useAuth();

  const [activeSig, setActiveSig] = useState<'witnessSignature' | null>(null);

  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!activeSig) return;

    setIsSigLoading(true);

    try {
      // Generate unique filename for each signature
      const timestamp = new Date().getTime();
      const filename = `conduction_refusal_form/witness_signature_${timestamp}.png`;

      // Upload signature to storage
      const upload = await uploadFile({
        storage: 'signatures',
        path: filename,
        file: data.signature,
      });

      if (upload instanceof Error || !upload) {
        toast.error('Failed to upload signature', {
          description: 'An error occurred while uploading the signature.',
        });
        return;
      }

      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Update signature display data
        setSigData((prev) => ({ ...prev, [activeSig]: base64String }));
        setSigPaths((prev) => ({ ...prev, [activeSig]: upload.path }));

        // FIXED: Update formData with the correct signature path
        setFormData((prev) => ({
          ...prev,
          witness_signature_image: upload.path, // Store the path directly
        }));

        toast.success('Witness signature saved successfully');
        setActiveSig(null);
      };
      reader.readAsDataURL(data.signature);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSigLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    id: '',
    created_at: '',
    updated_at: '',

    // Patient General Information
    patient_first_name: '',
    patient_middle_name: '',
    patient_last_name: '',
    patient_age: 0,
    patient_sex: '',
    patient_birthdate: '',
    patient_citizenship: '',
    patient_address: '',
    patient_contact_no: '',

    // Next of Kin/Legal Guardian Information
    kin_name: '',
    kin_relation: '',
    kin_contact_no: '',
    kin_address: '',
    medical_record: '',
    date_accomplished: '',

    // Vital Signs
    vital_bp: '',
    vital_pulse: '',
    vital_resp: '',
    vital_skin: '',
    vital_pupils: '',
    vital_loc: '',

    // Narrative
    narrative_description: '',

    // Witness Information - FIXED: Flattened structure
    witness_name: '',
    witness_date: '',
    witness_signature_image: '',

    // Metadata
    completed_by: '',
    form_status: 'draft',
    oriented_person_place_time: false,
    coherent_speech: false,
    hallucinations: false,
    suicidal_homicidal_ideation: false,
    understands_refusal_consequences: false,
    refused_treatment_and_transport: false,
    refused_treatment_willing_transport: false,
    wants_treatment_refused_transport: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checked = checkbox.checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'select-one') {
      const mentalStatusFields = [
        'oriented_person_place_time',
        'coherent_speech',
        'hallucinations',
        'suicidal_homicidal_ideation',
        'understands_refusal_consequences',
      ];

      if (mentalStatusFields.includes(name)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value === 'yes',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      created_at: '',
      updated_at: '',

      // Patient General Information
      patient_first_name: '',
      patient_middle_name: '',
      patient_last_name: '',
      patient_age: 0,
      patient_sex: '',
      patient_birthdate: '',
      patient_citizenship: '',
      patient_address: '',
      patient_contact_no: '',

      // Next of Kin/Legal Guardian Information
      kin_name: '',
      kin_relation: '',
      kin_contact_no: '',
      kin_address: '',
      medical_record: '',
      date_accomplished: '',

      // Vital Signs
      vital_bp: '',
      vital_pulse: '',
      vital_resp: '',
      vital_skin: '',
      vital_pupils: '',
      vital_loc: '',

      // Narrative
      narrative_description: '',

      // Witness Information
      witness_name: '',
      witness_date: '',
      witness_signature_image: '',

      // Metadata
      completed_by: '',
      form_status: 'draft',
      oriented_person_place_time: false,
      coherent_speech: false,
      hallucinations: false,
      suicidal_homicidal_ideation: false,
      understands_refusal_consequences: false,
      refused_treatment_and_transport: false,
      refused_treatment_willing_transport: false,
      wants_treatment_refused_transport: false,
    });
    setSigData({});
    setSigPaths({});
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit the form');
      return;
    }

    setIsSubmitting(true);

    // Add debugging to see what's being sent
    console.log(
      'Form data before submission:',
      JSON.stringify(formData, null, 2)
    );
    console.log('Signature data:', sigData);
    console.log('Signature paths:', sigPaths);

    try {
      // Step 1: Submit the conduction refusal form
      const response = await fetch('/api/conduction-refusal-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${
            errorData.error || 'Failed to submit form'
          }`
        );
      }

      const baseUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : window.location.origin;

      // Get the current session token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is logged in
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const result = await response.json();
      const formId = result.id || result.data?.id;

      console.log('Form submitted successfully, ID:', formId);

      if (formId) {
        try {
          console.log('Creating form submission tracking...');

          const submissionResponse = await fetch(
            `${baseUrl}/api/form-submissions`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                form_type: 'conduction_refusal_forms',
                reference_id: formId,
                status: 'pending',
                submitted_by: user.id,
                reviewed_by: null,
              }),
            }
          );

          if (!submissionResponse.ok) {
            const errorData = await submissionResponse.json().catch(() => ({}));
            console.error('Form submission tracking failed:', errorData);
            throw new Error(
              `Failed to create submission tracking: ${errorData.error}`
            );
          }

          const submissionResult = await submissionResponse.json();
          console.log('Form submission tracking created:', submissionResult);
        } catch (submissionError) {
          console.error(
            'Failed to create submission tracking:',
            submissionError
          );
        }
      }

      toast.success('Conduction Refusal saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save conduction refusal', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Don't render until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 w-full">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 leading-tight">
          Transcare Emergency Medical Services - Conduction Refusal Form
        </h1>
      </div>

      {/* Patient's General Information */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm space-y-4 md:space-y-6 lg:space-y-8">
        <h3 className="font-bold text-base md:text-lg mb-3">
          PATIENT GENERAL INFORMATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-2 mb-2">
          <div className="md:col-span-4">
            <label className="font-medium text-sm md:text-base">First</label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_first_name"
              value={formData.patient_first_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium text-sm md:text-base">Middle</label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_middle_name"
              value={formData.patient_middle_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium text-sm md:text-base">Last</label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_last_name"
              value={formData.patient_last_name || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-2 mb-2">
          <div className="md:col-span-2">
            <label className="font-medium text-sm md:text-base">Age</label>
            <Input
              required
              type="number"
              className="w-full"
              name="patient_age"
              value={formData.patient_age || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-sm md:text-base">Sex</label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_sex"
              value={formData.patient_sex || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="font-medium text-sm md:text-base">
              Birthdate
            </label>
            <Input
              required
              type="date"
              className="w-full"
              name="patient_birthdate"
              value={formData.patient_birthdate || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="font-medium text-sm md:text-base">
              Citizenship
            </label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_citizenship"
              value={formData.patient_citizenship || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-2">
          <div className="col-span-4">
            <label className="font-medium text-sm md:text-base">Address</label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_address"
              value={formData.patient_address || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium text-sm md:text-base">
              Contact No.
            </label>
            <Input
              required
              type="text"
              className="w-full"
              name="patient_contact_no"
              value={formData.patient_contact_no || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Next of Kin/Legal Guardian Information */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm space-y-4 mt-4 md:mt-6">
        <h3 className="font-bold text-sm md:text-base mb-3">
          NEXT OF KIN/LEGAL GUARDIAN INFORMATION
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm md:text-base">Name</label>
              <Input
                required
                type="text"
                className="w-full"
                name="kin_name"
                value={formData.kin_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-sm md:text-base">
                  Relation
                </label>
                <Input
                  required
                  type="text"
                  className="w-full"
                  name="kin_relation"
                  value={formData.kin_relation || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="font-medium text-sm md:text-base">
                  Contact No.
                </label>
                <Input
                  required
                  type="text"
                  className="w-full"
                  name="kin_contact_no"
                  value={formData.kin_contact_no || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="font-medium text-sm md:text-base">
                Address
              </label>
              <Input
                required
                type="text"
                className="w-full"
                name="kin_address"
                value={formData.kin_address || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm md:text-base">
                Medical Record
              </label>
              <Input
                required
                type="text"
                className="w-full"
                name="medical_record"
                value={formData.medical_record || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="font-medium text-sm md:text-base">
                Date Accomplished
              </label>
              <Input
                required
                type="date"
                className="w-full"
                name="date_accomplished"
                value={formData.date_accomplished || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm space-y-4 md:space-y-6 mt-4 md:mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {[
            { label: 'BP', field: 'vital_bp' },
            { label: 'PULSE', field: 'vital_pulse' },
            { label: 'RESP.', field: 'vital_resp' },
            { label: 'SKIN', field: 'vital_skin' },
            { label: 'PUPILS', field: 'vital_pupils' },
            { label: 'LOC', field: 'vital_loc' },
          ].map((field, index) => (
            <div key={index} className="flex flex-col">
              <label className="font-semibold text-xs sm:text-sm mb-1 text-left">
                {field.label}
              </label>
              <Input
                type="text"
                name={field.field}
                className="w-full"
                value={
                  (formData[field.field as keyof FormData] as string) || ''
                }
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[
            {
              question: 'Oriented to person, place and time?',
              field: 'oriented_person_place_time',
            },
            { question: 'Coherent speech?', field: 'coherent_speech' },
            {
              question: 'Auditory and/or visual hallucinations?',
              field: 'hallucinations',
            },
            {
              question: 'Suicidal and/or homicidal ideation?',
              field: 'suicidal_homicidal_ideation',
            },
            {
              question:
                'Able to repeat understanding of their condition and consequences of treatment refusal?',
              field: 'understands_refusal_consequences',
            },
          ].map((item, index) => (
            <div
              className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 items-start sm:items-center"
              key={index}
            >
              <div className="sm:col-span-1 font-medium text-sm md:text-base">
                {index + 1}.
              </div>
              <div className="sm:col-span-8 text-sm md:text-base">
                {item.question}
              </div>
              <div className="sm:col-span-3 w-full">
                <select
                  name={item.field}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
                  value={formData[item.field as keyof FormData] ? 'yes' : 'no'}
                  onChange={handleInputChange}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="font-bold mb-2 text-sm md:text-base">
            Narrative: Describe reasonable alternatives to treatment that were
            offered, the circumstances of the call, specific consequences of
            refusal:
          </div>
          <textarea
            className="w-full border rounded-md p-2 h-20 md:h-24 resize-none text-sm md:text-base"
            name="narrative_description"
            value={formData.narrative_description || ''}
            onChange={handleInputChange}
            placeholder="Enter narrative description..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm space-y-4 md:space-y-6 lg:space-y-8 mt-4 md:mt-6">
        <div className="mb-4">
          <p className="mb-2 text-sm md:text-base leading-relaxed">
            It is sometimes impossible to recognize actual or potential medical
            problems outside the hospital, that we strongly encourage you to be
            evaluated, treated as necessary, and transported to the nearest
            hospital by EMS personnel for a more complete examination by a
            physician.
          </p>

          <p className="mb-2 text-sm md:text-base leading-relaxed">
            You have the right to choose not to be evaluated, treated or
            transported if desired; however, there is a possibility that you
            could suffer serious complications or even death from conditions
            that are not apparent at this time. By signing below, you are
            acknowledging that the EMS personnel have already advised you and
            that you understand the potential harm to your health that may
            result from your refusal of the recommended care, and you release
            TEMS from any liability.
          </p>
        </div>

        <div className="text-center font-bold text-sm md:text-base mb-4">
          PLEASE CHECK THE FOLLOWING THAT APPLY:
        </div>

        <div className="space-y-3 md:space-y-2 mb-4">
          <label className="flex items-start md:items-center text-sm md:text-base">
            <input
              type="checkbox"
              className="mr-2 mt-1 md:mt-0 flex-shrink-0"
              name="refused_treatment_and_transport"
              checked={formData.refused_treatment_and_transport || false}
              onChange={handleInputChange}
            />
            I refused to be treated and transported.
          </label>
          <label className="flex items-start md:items-center text-sm md:text-base">
            <input
              type="checkbox"
              className="mr-2 mt-1 md:mt-0 flex-shrink-0"
              name="refused_treatment_willing_transport"
              checked={formData.refused_treatment_willing_transport || false}
              onChange={handleInputChange}
            />
            I refused to be treated but willing to be transported to a medical
            facility and/ or seen by a physician.
          </label>
          <label className="flex items-start md:items-center text-sm md:text-base">
            <input
              type="checkbox"
              className="mr-2 mt-1 md:mt-0 flex-shrink-0"
              name="wants_treatment_refused_transport"
              checked={formData.wants_treatment_refused_transport || false}
              onChange={handleInputChange}
            />
            I would like to be treated and refused to be transported.
          </label>
        </div>

        <div className="text-center font-bold text-sm md:text-base mb-4">
          WITNESSED TREATMENT:
        </div>

        <div className="mb-4">
          <p className="text-sm md:text-base leading-relaxed">
            I observed the above named person; review and signed the statement
            above. The person was alert and did not appear confused. The person
            appeared to understand the statement and did not state otherwise.
          </p>
        </div>

        <div className="grid grid-cols gap-4 md:gap-8 items-start">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-6">
            <div className="w-full lg:w-1/2">
              <label className="block mb-1 font-medium text-sm md:text-base">
                Witness Signature
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] md:min-h-[156px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('witnessSignature')}
              >
                {sigData['witnessSignature'] ? (
                  <img
                    src={sigData['witnessSignature']}
                    alt="Witness signature"
                    className="max-h-[80px] md:max-h-[100px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 md:h-8 md:w-8 text-gray-500" />
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Witness Name
                </label>
                <Input
                  required
                  type="text"
                  className="w-full"
                  name="witness_name"
                  value={formData.witness_name || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  required
                  type="date"
                  className="w-full"
                  name="witness_date"
                  value={formData.witness_date || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <Dialog.Root
            open={!!activeSig}
            onOpenChange={(open) => !open && setActiveSig(null)}
          >
            <Dialog.Portal>
              <Dialog.Title>
                <VisuallyHidden>Witness Signature</VisuallyHidden>
              </Dialog.Title>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
                <div className="bg-white rounded-lg shadow-lg relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between p-3 md:p-4 border-b">
                    <h2 className="text-base md:text-lg font-semibold">
                      Witness E-Signature
                    </h2>
                    <Dialog.Close asChild>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setActiveSig(null)}
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="p-3 md:p-4 overflow-y-auto max-h-[calc(95vh-60px)] md:max-h-[calc(90vh-80px)]">
                    <SignatureForm
                      onSubmit={handleSignatureSubmit}
                      defaultSignature={sigPaths[activeSig || '']}
                      loading={isSigLoading}
                    />
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-6">
        <Button
          className="w-full sm:w-auto px-6 py-2 text-sm md:text-base"
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !user}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {!user && !loading && (
          <p className="text-red-500 text-sm md:text-base">
            Please log in to submit the form
          </p>
        )}
      </div>
    </div>
  );
}
