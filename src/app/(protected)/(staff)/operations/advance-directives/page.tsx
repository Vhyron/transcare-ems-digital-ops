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

export default function AdvanceDirectivesForm() {
  const { user, loading } = useAuth();
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});

  const [activeSig, setActiveSig] = useState<
    'decisionMaker' | 'physician' | null
  >(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!activeSig) return;

    setIsSigLoading(true);

    try {
      // Generate unique filename for each signature
      const timestamp = new Date().getTime();
      const filename = `trip_tickets/${activeSig}_signature_${timestamp}.png`;

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

        // Update state with both display data and storage path
        setSigData((prev) => ({ ...prev, [activeSig]: base64String }));
        setSigPaths((prev) => ({ ...prev, [activeSig]: upload.path }));

        // Update formData to display the signature in the form
        setFormData((prev) => ({
          ...prev,
          [activeSig]: {
            signature: base64String,
            signatureBlob: data.signature,
            signaturePath: upload.path,
          },
        }));

        toast.success(`${activeSig} signature saved successfully`);
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

  const getSignatureTitle = (key: string) => {
    const titles = {
      decisionMaker: 'decisionMaker',
      physicianSignature: 'physicianSignature',
    };
    return titles[key as keyof typeof titles] || key;
  };

  const [formData, setFormData] = useState({
    patient: {
      firstName: '',
      middleName: '',
      lastName: '',
      age: '',
      sex: '',
      birthdate: '',
      citizenship: '',
      address: '',
      contactNo: '',
    },
    nextOfKin: {
      name: '',
      relation: '',
      contactNo: '',
      address: '',
    },
    medicalRecord: {
      recordNumber: '',
      dateAccomplished: '',
    },
    carePreferences: {
      attemptCPR: false,
      comfortOnly: false,
      limitedIntervention: false,
      limitedInterventionOptions: {
        ivFluid: false,
        ngTube: false,
        gtTube: false,
        o2Therapy: false,
        cpapBipap: false,
        antibiotics: false,
        laboratory: false,
        diagnostics: false,
      },
      fullTreatment: false,
    },
    additionalOrders: '',
    discussedWith: {
      withPatient: false,
      withKin: false,
    },
    decisionMaker: {
      name: '',
      relation: '',
      dateSigned: '',
      signature: null as string | null,
      signatureBlob: null as Blob | null,
      signaturePath: null as string | null,
    },
    physician: {
      name: '',
      prcLicenseNumber: '',
      dateSigned: '',
      signature: null as string | null,
      signatureBlob: null as Blob | null,
      signaturePath: null as string | null,
    },
  });

  type LimitedInterventionKey =
    keyof typeof formData.carePreferences.limitedInterventionOptions;

  const limitedOptions: { key: LimitedInterventionKey; label: string }[] = [
    { key: 'ivFluid', label: 'IV Fluid therapy' },
    { key: 'ngTube', label: 'Nasogastric tube feeding' },
    { key: 'gtTube', label: 'Gastrostomy tube feeding' },
    { key: 'cpapBipap', label: 'Use of CPAP/BiPAP' },
    { key: 'antibiotics', label: 'Antibiotics therapy' },
    { key: 'laboratory', label: 'Laboratory work up' },
    { key: 'diagnostics', label: 'Diagnostics work up' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | boolean = value;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      processedValue = checkbox.checked;
    }

    if (value === 'yes') processedValue = true;
    else if (value === 'no') processedValue = false;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = processedValue;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      patient: {
        firstName: '',
        middleName: '',
        lastName: '',
        age: '',
        sex: '',
        birthdate: '',
        citizenship: '',
        address: '',
        contactNo: '',
      },
      nextOfKin: {
        name: '',
        relation: '',
        contactNo: '',
        address: '',
      },
      medicalRecord: {
        recordNumber: '',
        dateAccomplished: '',
      },
      carePreferences: {
        attemptCPR: false,
        comfortOnly: false,
        limitedIntervention: false,
        limitedInterventionOptions: {
          ivFluid: false,
          ngTube: false,
          gtTube: false,
          o2Therapy: false,
          cpapBipap: false,
          antibiotics: false,
          laboratory: false,
          diagnostics: false,
        },
        fullTreatment: false,
      },
      additionalOrders: '',
      discussedWith: {
        withPatient: false,
        withKin: false,
      },
      decisionMaker: {
        name: '',
        relation: '',
        dateSigned: '',
        signature: null,
        signatureBlob: null,
        signaturePath: null,
      },
      physician: {
        name: '',
        prcLicenseNumber: '',
        dateSigned: '',
        signature: null,
        signatureBlob: null,
        signaturePath: null,
      },
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
    try {
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

      console.log('Submitting form with user:', user.id);
      console.log('Session token available:', !!session?.access_token);
      console.log('Form data with signatures:', {
        ...formData,
        decision_maker_signatuer: sigData.decisionMaker || null,
        physician_signature: sigData.physicianSignature || null,
      });

      const response = await fetch('/api/advance-directives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Include signature paths for database storage
          decisionMaker: {
            ...formData.decisionMaker,
            signatureImagePath: formData.decisionMaker.signaturePath,
          },
          physician: {
            ...formData.physician,
            signatureImagePath: formData.physician.signaturePath,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${
            errorData.error || 'Failed to submit form'
          }`
        );
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
                form_type: 'advance_directives',
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

      toast.success('Advance Directives saved successfully!');

      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Advance Directives not saved!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        ADVANCE DIRECTIVES ON LEVEL OF CARE
      </h1>

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h1 className="text-xl font-bold mb-6">
          Transcare Emergency Medical Services - Advance Directives on Level of
          Care
        </h1>
        <h3 className="font-bold text-lg mb-3 p-1">
          PATIENT GENERAL INFORMATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
          <div className="md:col-span-4">
            <label className="font-medium">First</label>
            <Input
              required
              type="text"
              name="patient.firstName"
              className="w-full"
              value={formData.patient.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-4">
            <label className="font-medium">Middle</label>
            <Input
              required
              type="text"
              name="patient.middleName"
              className="w-full"
              value={formData.patient.middleName}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-4">
            <label className="font-medium">Last</label>
            <Input
              required
              type="text"
              name="patient.lastName"
              className="w-full"
              value={formData.patient.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 mb-2">
          <div className="md:col-span-2">
            <label className="font-medium">Age</label>
            <Input
              required
              type="number"
              name="patient.age"
              className="w-full"
              value={formData.patient.age}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Sex</label>
            <Input
              required
              type="text"
              name="patient.sex"
              className="w-full"
              value={formData.patient.sex}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-4">
            <label className="font-medium">Birthdate</label>
            <Input
              required
              type="date"
              name="patient.birthdate"
              className="w-full"
              value={formData.patient.birthdate}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-4">
            <label className="font-medium">Citizenship</label>
            <Input
              required
              type="text"
              name="patient.citizenship"
              className="w-full"
              value={formData.patient.citizenship}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-2">
          <div className="md:col-span-4">
            <label className="font-medium">Address</label>
            <Input
              required
              type="text"
              name="patient.address"
              className="w-full"
              value={formData.patient.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-4">
            <label className="font-medium">Contact No.</label>
            <Input
              required
              type="text"
              name="patient.contactNo"
              className="w-full"
              value={formData.patient.contactNo}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-4 mt-6">
        <h3 className="font-bold text-sm mb-3 p-1">
          NEXT OF KIN/LEGAL GUARDIAN INFORMATION
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Name</label>
              <Input
                required
                type="text"
                name="nextOfKin.name"
                className="w-full"
                value={formData.nextOfKin.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Relation</label>
                <Input
                  required
                  type="text"
                  name="nextOfKin.relation"
                  className="w-full"
                  value={formData.nextOfKin.relation}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="font-medium">Contact No.</label>
                <Input
                  required
                  type="text"
                  name="nextOfKin.contactNo"
                  className="w-full"
                  value={formData.nextOfKin.contactNo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="font-medium">Address</label>
              <Input
                required
                type="text"
                name="nextOfKin.address"
                className="w-full"
                value={formData.nextOfKin.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium">Medical Record</label>
              <Input
                required
                type="text"
                name="medicalRecord.recordNumber"
                className="w-full"
                value={formData.medicalRecord.recordNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="font-medium">Date Accomplished</label>
              <Input
                required
                type="date"
                name="medicalRecord.dateAccomplished"
                className="w-full"
                value={formData.medicalRecord.dateAccomplished}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6 mt-6">
        <h2 className="text-xl font-bold border-b pb-2">
          PREFERRED LEVEL OF CARE
        </h2>

        {/* CPR Section */}
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">CARDIOPULMONARY RESUSCITATION</h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
            <div className="lg:col-span-1">
              <select
                name="carePreferences.attemptCPR"
                value={formData.carePreferences.attemptCPR ? 'yes' : 'no'}
                onChange={handleInputChange}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm ">
                May be done if a person has no pulse and is not breathing to
                prolong the life of the patient. This procedure entails pushing
                on the chest with great force and use of IV medications in
                attempt to restart the heart.
              </p>
            </div>
          </div>
        </div>

        {/* Comfort Measures */}
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">COMFORT MEASURES ONLY</h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
            <div className="lg:col-span-1">
              <select
                name="carePreferences.comfortOnly"
                value={formData.carePreferences.comfortOnly ? 'yes' : 'no'}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="yes" className="text-gray-700">
                  yes
                </option>
                <option value="no" className="text-gray-700">
                  no
                </option>
              </select>
            </div>
            <div className="col-span-5">
              <p className="text-sm ">
                Relieve pain and suffering through the use of medication by
                non-invasive route, positioning, wound care and other
                conservative treatment. No hospitalization unless revoked.
              </p>
            </div>
          </div>
        </div>

        {/* Limited Additional Interventions */}
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">LIMITED ADDITIONAL INTERVENTIONS</h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
            <div className="lg:col-span-1">
              <select
                name="carePreferences.limitedIntervention"
                value={
                  formData.carePreferences.limitedIntervention ? 'yes' : 'no'
                }
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="yes" className="text-gray-700">
                  yes
                </option>
                <option value="no" className="text-gray-700">
                  no
                </option>
              </select>
            </div>
            <div className="col-span-5">
              <p className="text-sm mb-2">
                In addition to care described in Comfort Measures Only, use
                medical treatment as indicated. DO NOT intubate. May transfer to
                hospital ONLY if care is not met in current location.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {limitedOptions.map(({ key, label }) => (
                  <label key={key} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      name={`carePreferences.limitedInterventionOptions.${key}`}
                      className="mr-2"
                      checked={
                        formData.carePreferences.limitedInterventionOptions[key]
                      }
                      onChange={handleInputChange}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full Treatment */}
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">FULL TREATMENT</h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
            <div className="lg:col-span-1">
              <select
                name="carePreferences.fullTreatment"
                value={formData.carePreferences.fullTreatment ? 'yes' : 'no'}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="yes" className="text-gray-700">
                  yes
                </option>
                <option value="no" className="text-gray-700">
                  no
                </option>
              </select>
            </div>
            <div className="col-span-5">
              <p className="text-sm ">
                In addition to above mentioned care, use of intubation, advanced
                airway intervention, mechanical ventilation,
                defibrillation/cardioversion as indicated. TRANSFER TO HOSPITAL
                if indicated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">ADDITIONAL ORDERS</h2>
        <textarea
          required
          name="additionalOrders"
          className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
          value={formData.additionalOrders}
          onChange={handleInputChange}
        />
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          INFORMATION DISCUSSED WITH:
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="discussedWith.withPatient"
              className="mr-2"
              checked={formData.discussedWith.withPatient}
              onChange={handleInputChange}
            />
            Patient (has capacity for decision-making)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="discussedWith.withKin"
              className="mr-2"
              checked={formData.discussedWith.withKin}
              onChange={handleInputChange}
            />
            Next of kin or legally recognized decision-maker
          </label>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          DECISION-MAKER VERIFICATION
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 space-y-2">
            <label className="block text-sm font-medium mb-2">
              Decision Maker Signature
            </label>
            <div
              className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[170px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveSig('decisionMaker')}
            >
              {formData.decisionMaker.signature ? (
                <img
                  src={formData.decisionMaker.signature}
                  alt="Decision Maker signature"
                  className="max-h-[100px]"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm mt-1">Click to add signature</span>
                </div>
              )}
            </div>
            <label className="text-xs text-gray-600">
              Signature over printed Name
            </label>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input
                required
                type="text"
                name="decisionMaker.name"
                placeholder="write 'self' if patient"
                className="w-full"
                value={formData.decisionMaker.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Relation</label>
              <Input
                required
                type="text"
                name="decisionMaker.relation"
                className="w-full"
                value={formData.decisionMaker.relation}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input
                required
                type="date"
                name="decisionMaker.dateSigned"
                className="w-full"
                value={formData.decisionMaker.dateSigned}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-2">PHYSICIAN VERIFICATION</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 space-y-2">
            <label className="block text-sm font-medium mb-2">
              Physician Signature
            </label>
            <div
              className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[170px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveSig('physician')}
            >
              {formData.physician.signature ? (
                <img
                  src={formData.physician.signature}
                  alt="Physician signature"
                  className="max-h-[100px]"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm mt-1">Click to add signature</span>
                </div>
              )}
            </div>
            <label className="text-xs text-gray-600">
              Signature over printed Name
            </label>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input
                required
                type="text"
                name="physician.name"
                className="w-full"
                value={formData.physician.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                PRC License Number
              </label>
              <Input
                required
                type="text"
                name="physician.prcLicenseNumber"
                className="w-full"
                value={formData.physician.prcLicenseNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input
                required
                type="date"
                name="physician.dateSigned"
                className="w-full"
                value={formData.physician.dateSigned}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root
        open={!!activeSig}
        onOpenChange={(open) => !open && setActiveSig(null)}
      >
        <Dialog.Portal>
          <Dialog.Title>
            <VisuallyHidden>
              {activeSig
                ? `${getSignatureTitle(activeSig)} Signature`
                : 'Signature Dialog'}
            </VisuallyHidden>
          </Dialog.Title>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-base md:text-lg font-semibold">
                  {activeSig
                    ? `${getSignatureTitle(activeSig)} E-Signature`
                    : 'E-Signature'}
                </h2>
                <Dialog.Close asChild>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setActiveSig(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
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

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !user}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {!user && !loading && (
          <p className="text-red-500 mt-2 text-sm">
            Please log in to submit the form
          </p>
        )}
      </div>
    </div>
  );
}
