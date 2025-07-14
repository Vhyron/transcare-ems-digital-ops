'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/provider/auth-provider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdvanceDirectivesForm() {
  const decisionMakerSignature = useRef<SignatureCanvas | null>(null);
  const physicianSignature = useRef<SignatureCanvas | null>(null);
  const { user, loading } = useAuth();

  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });

  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    'decisionMaker' | 'physician' | null
  >(null);

  const [sigData, setSigData] = useState<{
    [key: string]: { image: string; name: string };
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clearSig = () => {
    const ref = getRefByType(activeSig);
    ref?.current?.clear();
  };

  const uploadSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current && !ref.current.isEmpty()) {
      const dataUrl = ref.current.getTrimmedCanvas().toDataURL('image/png');

      setFormData((prev) => ({
        ...prev,
        [activeSig!]: {
          ...((prev[activeSig! as keyof typeof prev] || {}) as object),
          signature: dataUrl,
        },
      }));

      setSigData((prev) => ({
        ...prev,
        [activeSig!]: {
          image: dataUrl,
          name: prev[activeSig!]?.name || '',
        },
      }));

      setActiveSig(null);
    }
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
    },
    physician: {
      name: '',
      prcLicenseNumber: '',
      dateSigned: '',
      signature: null as string | null,
    },
  });

  const getRefByType = (type: string | null) => {
    if (type === 'decisionMaker') return decisionMakerSignature;
    if (type === 'physician') return physicianSignature;
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      const ref = getRefByType(activeSig);
      if (ref?.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = ref.current!.getCanvas().getContext('2d');
          ctx?.clearRect(
            0,
            0,
            ref.current!.getCanvas().width,
            ref.current!.getCanvas().height
          );
          ctx?.drawImage(
            img,
            0,
            0,
            ref.current!.getCanvas().width,
            ref.current!.getCanvas().height
          );
        };
        img.src = imageData;
      }
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    const ref = getRefByType(activeSig);
    const dataUrl = sigData[activeSig || ''];
    if (ref?.current && dataUrl) {
      ref.current.clear();
      (ref.current as any).loadFromDataURL(dataUrl);
    }
  }, [activeSig, sigData]);

  useEffect(() => {
    if (modalCanvasRef.current) {
      const width = modalCanvasRef.current.offsetWidth;
      const height = 750;
      setSigCanvasSize({ width, height });
    }
  }, [activeSig]);

  // Fixed type definition
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
      },
      physician: {
        name: '',
        prcLicenseNumber: '',
        dateSigned: '',
        signature: null,
      },
    });
    setSigData({});
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

      const response = await fetch('/api/advance-directives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

      alert('Saved successfully!');

      resetForm();
      setSigData({});
    } catch (error) {
      console.error('Error saving:', error);
      alert(
        `Failed to save: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">First</label>
            <Input
              type="text"
              name="patient.firstName"
              className="w-full"
              value={formData.patient.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Middle</label>
            <Input
              type="text"
              name="patient.middleName"
              className="w-full"
              value={formData.patient.middleName}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Last</label>
            <Input
              type="text"
              name="patient.lastName"
              className="w-full"
              value={formData.patient.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-2">
            <label className="font-medium">Age</label>
            <Input
              type="text"
              name="patient.age"
              className="w-full"
              value={formData.patient.age}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2">
            <label className="font-medium">Sex</label>
            <Input
              type="text"
              name="patient.sex"
              className="w-full"
              value={formData.patient.sex}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Birthdate(mm/dd/yyyy):</label>
            <Input
              type="date"
              name="patient.birthdate"
              className="w-full"
              value={formData.patient.birthdate}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Citizenship</label>
            <Input
              type="text"
              name="patient.citizenship"
              className="w-full"
              value={formData.patient.citizenship}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">Address</label>
            <Input
              type="text"
              name="patient.address"
              className="w-full"
              value={formData.patient.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Contact No.</label>
            <Input
              type="text"
              name="patient.contactNo"
              className="w-full"
              value={formData.patient.contactNo}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm mb-3 p-1">
          NEXT OF KIN/LEGAL GUARDIAN INFORMATION
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Name</label>
              <Input
                type="text"
                name="nextOfKin.name"
                className="w-full"
                value={formData.nextOfKin.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Relation</label>
                <Input
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

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">
          PREFERRED LEVEL OF CARE
        </h2>

        {/* CPR Section */}
        <div className="border p-4 rounded-lg space-y-2">
          <h3 className="font-bold">CARDIOPULMONARY RESUSCITATION</h3>
          <div className="grid grid-cols-6 gap-4 items-start">
            <div className="col-span-1">
              <select
                name="carePreferences.attemptCPR"
                value={formData.carePreferences.attemptCPR ? 'yes' : 'no'}
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
          <div className="grid grid-cols-6 gap-4 items-start">
            <div className="col-span-1">
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
          <div className="grid grid-cols-6 gap-4 items-start">
            <div className="col-span-1">
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
              <div className="grid grid-cols-2 gap-2">
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
          <div className="grid grid-cols-6 gap-4 items-start">
            <div className="col-span-1">
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

        <div className="flex gap-6">
          <div className="w-1/2 space-y-2">
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

          <div className="w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input
                type="text"
                name="decisionMaker.name"
                className="w-full"
                value={formData.decisionMaker.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Relation</label>
              <Input
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

        <div className="flex gap-6">
          <div className="w-1/2 space-y-2">
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

          <div className="w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input
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
              {activeSig === 'decisionMaker'
                ? 'Decision Maker Signature'
                : 'Physician Signature'}
            </VisuallyHidden>
          </Dialog.Title>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[1000px] h-[800px] flex flex-col relative">
              <Dialog.Close asChild>
                <button className="absolute right-6 text-gray-700 hover:text-black">
                  <X className="w-8 h-8" />
                </button>
              </Dialog.Close>

              <div ref={modalCanvasRef} className="flex-1 overflow-hidden">
                <SignatureCanvas
                  ref={getRefByType(activeSig)}
                  penColor="black"
                  canvasProps={{
                    width: sigCanvasSize.width,
                    height: sigCanvasSize.height,
                    className: 'bg-gray-100 rounded shadow',
                  }}
                />
              </div>

              <div className="absolute left-6 flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="sig-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="sig-upload">
                  <Button type="button" size="sm" variant="secondary">
                    Upload
                  </Button>
                </label>
                <Button size="sm" variant="secondary" onClick={clearSig}>
                  Clear
                </Button>
                <Button size="sm" onClick={uploadSig}>
                  Save
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex gap-4 mt-6">
        <Button
          className="mt-6"
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !user}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {!user && !loading && (
          <p className="text-red-500 mt-2">Please log in to submit the form</p>
        )}
      </div>
    </div>
  );
}
