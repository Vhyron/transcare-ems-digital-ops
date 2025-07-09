'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { ConductionRefusalFormData } from '@/types/conduction-refusal-form';

export default function ConductionRefusalForm() {
  const witnessSignature = useRef<SignatureCanvas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sigData, setSigData] = useState<{
    [key: string]: { image: string; name: string };
  }>({});

  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });

  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<'witness' | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: '';
  } | null>(null);

  const [formData, setFormData] = useState<ConductionRefusalFormData>({
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checked = checkbox.checked;

      if (name.includes('.')) {
        const keys = name.split('.');
        setFormData((prev) => {
          const newData = { ...prev };
          let current: any = newData;

          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = checked;
          return newData;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
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
      if (name.includes('.')) {
        const keys = name.split('.');
        setFormData((prev) => {
          const newData = { ...prev };
          let current: any = newData;

          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = value;
          return newData;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
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
  };

  const getRefByType = (type: string | null) => {
    switch (type) {
      case 'witness':
        return witnessSignature;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log(JSON.stringify(formData, null, 2));

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

      const result = await response.json();
      const formId = result.id || result.data?.id;

      if (formId) {
        try {
          await fetch('/api/form-submissions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              form_type: 'condcuction_refusal_form',
              reference_id: formId,
              status: 'pending',
              submitted_by: 'current_user_id',
              reviewed_by: null,
            }),
          });
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
  const clearSig = () => {
    witnessSignature.current?.clear();
  };

  const uploadSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current && !ref.current.isEmpty()) {
      const dataUrl = ref.current.getTrimmedCanvas().toDataURL('image/png');

      setFormData((prev) => ({
        ...prev,
        [`${activeSig}_signature_image`]: dataUrl,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as '';
      if (witnessSignature.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = witnessSignature.current!.getCanvas().getContext('2d');
          ctx?.clearRect(
            0,
            0,
            witnessSignature.current!.getCanvas().width,
            witnessSignature.current!.getCanvas().height
          );
          ctx?.drawImage(
            img,
            0,
            0,
            witnessSignature.current!.getCanvas().width,
            witnessSignature.current!.getCanvas().height
          );
        };
        img.src = imageData;
      }
    };
    reader.readAsDataURL(file);
  };

  // const exportForm = async () => {
  //   if (!formData.id) {
  //     setMessage({
  //       type: "error",
  //       text: "Please save the form first before exporting.",
  //     });
  //     return;
  //   }

  //   try {
  //     const blob = await conductionRefusalFormAPI.exportForm(
  //       formData.id,
  //       "pdf"
  //     );
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `conduction-refusal-form-${formData.id}.pdf`;
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } catch (error) {
  //     setMessage({
  //       type: "error",
  //       text: "Failed to export form. Please try again.",
  //     });
  //     console.error("Export error:", error);
  //   }
  // };
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

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="p-10 w-full">
      {/* Message Display */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">CONDUCTION REFUSAL FORM (RF-01)</h1>
      </div>

      {/* Patient's General Information */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h1 className="text-xl font-bold mb-6">
          Transcare Emergency Medical Services - Conduction Refusal Form
        </h1>
        <h3 className="font-bold text-lg mb-3">PATIENT GENERAL INFORMATION</h3>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">First</label>
            <Input
              type="text"
              className="w-full"
              name="patient_first_name"
              value={formData.patient_first_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Middle</label>
            <Input
              type="text"
              className="w-full"
              name="patient_middle_name"
              value={formData.patient_middle_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Last</label>
            <Input
              type="text"
              className="w-full"
              name="patient_last_name"
              value={formData.patient_last_name || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-2">
            <label className="font-medium">Age</label>
            <Input
              type="number"
              className="w-full"
              name="patient_age"
              value={formData.patient_age || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2">
            <label className="font-medium">Sex</label>
            <Input
              type="text"
              className="w-full"
              name="patient_sex"
              value={formData.patient_sex || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Birthdate(mm/dd/yyyy):</label>
            <Input
              type="date"
              className="w-full"
              name="patient_birthdate"
              value={formData.patient_birthdate || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Citizenship</label>
            <Input
              type="text"
              className="w-full"
              name="patient_citizenship"
              value={formData.patient_citizenship || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">Address</label>
            <Input
              type="text"
              className="w-full"
              name="patient_address"
              value={formData.patient_address || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Contact No.</label>
            <Input
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
      <div className="border rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm mb-3">
          NEXT OF KIN/LEGAL GUARDIAN INFORMATION
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Name</label>
              <Input
                type="text"
                className="w-full"
                name="kin_name"
                value={formData.kin_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Relation</label>
                <Input
                  type="text"
                  className="w-full"
                  name="kin_relation"
                  value={formData.kin_relation || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="font-medium">Contact No.</label>
                <Input
                  type="text"
                  className="w-full"
                  name="kin_contact_no"
                  value={formData.kin_contact_no || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="font-medium">Address</label>
              <Input
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
              <label className="font-medium">Medical Record</label>
              <Input
                type="text"
                className="w-full"
                name="medical_record"
                value={formData.medical_record || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="font-medium">Date Accomplished</label>
              <Input
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
      <div className="border rounded-lg p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'BP', field: 'vital_bp' },
            { label: 'PULSE', field: 'vital_pulse' },
            { label: 'RESP.', field: 'vital_resp' },
            { label: 'SKIN', field: 'vital_skin' },
            { label: 'PUPILS', field: 'vital_pupils' },
            { label: 'LOC', field: 'vital_loc' },
          ].map((field, index) => (
            <div key={index} className="flex flex-col">
              <label className="font-semibold text-sm mb-1 text-left">
                {field.label}
              </label>
              <Input
                type="text"
                name={field.field} // <- THIS IS CRUCIAL
                className="w-full"
                value={
                  (formData[
                    field.field as keyof ConductionRefusalFormData
                  ] as string) || ''
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
            <div className="grid grid-cols-12 gap-4 items-center" key={index}>
              <div className="col-span-1 font-medium">{index + 1}.</div>
              <div className="col-span-8">{item.question}</div>
              <div className="col-span-3">
                <select
                  name={item.field} // <-- Add this!
                  className="w-full border rounded-md px-2 py-1"
                  value={
                    formData[item.field as keyof ConductionRefusalFormData]
                      ? 'yes'
                      : 'no'
                  }
                  onChange={handleInputChange}
                >
                  <option value="yes" className="text-gray-700">
                    Yes
                  </option>
                  <option value="no" className="text-gray-700">
                    No
                  </option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="font-bold mb-2">
            Narrative: Describe reasonable alternatives to treatment that were
            offered, the circumstances of the call, specific consequences of
            refusal:
          </div>
          <textarea
            className="w-full border rounded-md p-2 h-20 resize-none"
            name="narrative_description"
            value={formData.narrative_description || ''}
            onChange={handleInputChange}
            placeholder="Enter narrative description..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <div className="mb-4">
          <p className="mb-2">
            It is sometimes impossible to recognize actual or potential medical
            problems outside the hospital, that we strongly encourage you to be
            evaluated, treated as necessary, and transported to the nearest
            hospital by EMS personnel for a more complete examination by a
            physician.
          </p>

          <p className="mb-2">
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

        <div className="text-center font-bold text-sm mb-4">
          PLEASE CHECK THE FOLLOWING THAT APPLY:
        </div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              name="refused_treatment_and_transport"
              checked={formData.refused_treatment_and_transport || false}
              onChange={handleInputChange}
            />
            I refused to be treated and transported.
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              name="refused_treatment_willing_transport"
              checked={formData.refused_treatment_willing_transport || false}
              onChange={handleInputChange}
            />
            I refused to be treated but willing to be transported to a medical
            facility and/ or seen by a physician.
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              name="wants_treatment_refused_transport"
              checked={formData.wants_treatment_refused_transport || false}
              onChange={handleInputChange}
            />
            I would like to be treated and refused to be transported.
          </label>
        </div>

        <div className="text-center font-bold text-sm mb-4">
          WITNESSED TREATMENT:
        </div>

        <div className="mb-4">
          <p>
            I observed the above named person; review and signed the statement
            above. The person was alert and did not appear confused. The person
            appeared to understand the statement and did not state otherwise.
          </p>
        </div>

        <div className="grid grid-cols gap-8 items-start">
          <div className="flex gap-6 mb-6">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">
                Witness Signature
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[156px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('witness')}
              >
                {formData.witness_signature_image ? (
                  <img
                    src={formData.witness_signature_image}
                    alt="Witness signature"
                    className="max-h-[100px]"
                  />
                ) : (
                  <Plus className="h-8 w-8 text-gray-500" />
                )}
              </div>
            </div>

            <div className="w-1/2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Witness Name
                </label>
                <Input
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
                <VisuallyHidden> {activeSig === 'witness'}</VisuallyHidden>
              </Dialog.Title>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-[1000px] h-[800px] flex flex-col">
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-6 text-gray-700 hover:text-black"
                      onClick={() => setActiveSig(null)}
                    >
                      <X className="w-10 h-10" />
                    </button>
                  </Dialog.Close>

                  <div ref={modalCanvasRef} className="flex-1">
                    <SignatureCanvas
                      ref={witnessSignature}
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
                      <Button size="sm" variant="secondary">
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
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>
          </div>
        </div>
      
      </div>
    </div>
  );
}
