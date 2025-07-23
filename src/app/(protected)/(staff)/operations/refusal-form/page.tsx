'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/provider/auth-provider';
import SignatureForm, { SignatureData } from '@/components/forms/SignatureForm';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';
import * as React from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RefusalTreatmentTransportationForm() {
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  const [activeSig, setActiveSig] = useState<
    'patientGuardian' | 'eventsOrganizer' | 'witness' | 'medicPersonnel' | null
  >(null);

  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!activeSig) return;

    console.log('handleSignatureSubmit called with:', { activeSig, data });

    setIsSigLoading(true);

    try {
      // Generate unique filename for each signature
      const timestamp = new Date().getTime();
      const filename = `conduction_refusal_form/${activeSig}_signature_${timestamp}.png`;

      console.log('Uploading file:', { filename, activeSig });

      // Upload signature to storage
      const upload = await uploadFile({
        storage: 'signatures',
        path: filename,
        file: data.signature,
      });

      console.log('Upload result:', upload);

      if (upload instanceof Error || !upload) {
        console.error('Upload failed:', upload);
        toast.error('Failed to upload signature', {
          description: 'An error occurred while uploading the signature.',
        });
        return;
      }

      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        console.log('FileReader completed:', {
          activeSig,
          uploadPath: upload.path,
          base64Length: base64String.length,
        });

        // Update signature display data
        setSigData((prev) => ({ ...prev, [activeSig]: base64String }));
        setSigPaths((prev) => ({ ...prev, [activeSig]: upload.path }));

        // IMPROVED: More explicit and type-safe approach with better error handling
        setFormData((prev) => {
          const updatedFormData = { ...prev };

          console.log('Before updating formData:', {
            activeSig,
            currentFormData: prev[activeSig as keyof typeof prev],
            uploadPath: upload.path,
          });

          // Type-safe property updates with preservation of existing data
          if (activeSig === 'patientGuardian') {
            updatedFormData.patientGuardian = {
              ...updatedFormData.patientGuardian, // Preserve existing name
              patient_guardian_signature_image: upload.path,
            };
          } else if (activeSig === 'eventsOrganizer') {
            updatedFormData.eventsOrganizer = {
              ...updatedFormData.eventsOrganizer, // Preserve existing name
              events_organizer_signature_image: upload.path,
            };
          } else if (activeSig === 'witness') {
            updatedFormData.witness = {
              ...updatedFormData.witness, // Preserve existing name
              witness_signature_image: upload.path,
            };
          } else if (activeSig === 'medicPersonnel') {
            updatedFormData.medicPersonnel = {
              ...updatedFormData.medicPersonnel, // Preserve existing name
              medic_personnel_signature_image: upload.path,
            };
          }

          console.log('After updating formData:', {
            activeSig,
            updatedSection:
              updatedFormData[activeSig as keyof typeof updatedFormData],
            fullFormData: updatedFormData,
          });

          return updatedFormData;
        });

        toast.success(`${activeSig} signature saved successfully`);
        setActiveSig(null);
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Failed to process signature image');
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

  const [formData, setFormData] = useState({
    leagueEvent: '',
    type: '',
    location: '',
    incident: '',
    patientName: '',
    dob: '',
    age: '',
    landline: '',
    cell: '',
    guardian: 'yes',
    guardianLandline: '',
    guardianCell: '',
    guardianName: '',
    guardianAge: '',
    relationship: '',
    situation: '',
    treatmentRefused: '',
    pcr: '',
    date: '',
    time: '',
    patientGuardian: {
      patient_guardian_signature_image: '',
      patient_guardian_signature_name: '',
    },
    eventsOrganizer: {
      events_organizer_signature_image: '',
      events_organizer_signature_name: '',
    },
    witness: {
      witness_signature_image: '',
      witness_signature_name: '',
    },
    medicPersonnel: {
      medic_personnel_signature_image: '',
      medic_personnel_signature_name: '',
    },
    refusalReasons: {
      treatmentNotNecessary: false,
      refusesTransportAgainstAdvice: false,
      treatmentReceivedNoTransport: false,
      alternativeTransportation: false,
      acceptsTransportRefusesTreatment: false,
    },
    company: '',
  });
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        refusalReasons: {
          ...prev.refusalReasons,
          [name]: checkbox.checked,
        },
      }));
    } else {
      // Handle nested names like 'witness.witness_signature_name'
      const keys = name.split('.'); // e.g. ['witness', 'witness_signature_name']
      if (keys.length === 2) {
        const [section, field] = keys;
        setFormData((prev) => ({
          ...prev,
          [section]: {
            // FIXED: Preserve existing properties in the nested object
            ...(prev as any)[section],
            [field]: value,
          },
        }));
      } else {
        // Fallback for top-level fields
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const getSignatureTitle = (key: string) => {
    const titles = {
      patientGuardian: 'patientGuardian',
      eventsOrganizer: 'eventsOrganizer',
      witness: 'witness',
      medicPersonnel: 'medicPersonnel',
    };
    return titles[key as keyof typeof titles] || key;
  };
  const resetForm = () => {
    setFormData({
      leagueEvent: '',
      type: '',
      location: '',
      incident: '',
      patientName: '',
      dob: '',
      age: '',
      landline: '',
      cell: '',
      guardian: 'yes',
      guardianLandline: '',
      guardianCell: '',
      guardianName: '',
      guardianAge: '',
      relationship: '',
      situation: '',
      treatmentRefused: '',
      pcr: '',
      date: '',
      time: '',
      patientGuardian: {
        patient_guardian_signature_image: '',
        patient_guardian_signature_name: '',
      },
      eventsOrganizer: {
        events_organizer_signature_image: '',
        events_organizer_signature_name: '',
      },
      witness: {
        witness_signature_image: '',
        witness_signature_name: '',
      },
      medicPersonnel: {
        medic_personnel_signature_image: '',
        medic_personnel_signature_name: '',
      },
      refusalReasons: {
        treatmentNotNecessary: false,
        refusesTransportAgainstAdvice: false,
        treatmentReceivedNoTransport: false,
        alternativeTransportation: false,
        acceptsTransportRefusesTreatment: false,
      },
      company: '',
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
      const submitData = { ...formData };

      // ENHANCED DEBUG LOGGING
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Full formData:', submitData);
      console.log('Signature paths state:', sigPaths);
      console.log('Signature data state:', sigData);

      // Debug each signature section
      console.log('Individual signature sections:');
      console.log('patientGuardian:', {
        image: submitData.patientGuardian?.patient_guardian_signature_image,
        name: submitData.patientGuardian?.patient_guardian_signature_name,
        sigPath: sigPaths.patientGuardian,
      });
      console.log('eventsOrganizer:', {
        image: submitData.eventsOrganizer?.events_organizer_signature_image,
        name: submitData.eventsOrganizer?.events_organizer_signature_name,
        sigPath: sigPaths.eventsOrganizer,
      });
      console.log('witness:', {
        image: submitData.witness?.witness_signature_image,
        name: submitData.witness?.witness_signature_name,
        sigPath: sigPaths.witness,
      });
      console.log('medicPersonnel:', {
        image: submitData.medicPersonnel?.medic_personnel_signature_image,
        name: submitData.medicPersonnel?.medic_personnel_signature_name,
        sigPath: sigPaths.medicPersonnel,
      });

      // Check for missing signature paths
      const missingSignatures = [];
      if (!submitData.patientGuardian?.patient_guardian_signature_image) {
        missingSignatures.push('patientGuardian');
      }
      if (!submitData.eventsOrganizer?.events_organizer_signature_image) {
        missingSignatures.push('eventsOrganizer');
      }
      if (!submitData.witness?.witness_signature_image) {
        missingSignatures.push('witness');
      }
      if (!submitData.medicPersonnel?.medic_personnel_signature_image) {
        missingSignatures.push('medicPersonnel');
      }

      if (missingSignatures.length > 0) {
        console.warn('Missing signature images for:', missingSignatures);
        // You can choose to show a warning or continue with submission
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

      console.log('Submitting form with user:', user.id);
      console.log('Session token available:', !!session?.access_token);
      console.log(
        'Final submit data structure:',
        JSON.stringify(submitData, null, 2)
      );

      const response = await fetch(`${baseUrl}/api/refusal-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: submitData }),
      });

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse server response:', e);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${result.error || 'Failed to submit form'}`
        );
      }

      console.log('Server response:', result);

      const formId = result.id || result.data?.id;

      if (formId) {
        try {
          console.log('Creating form submission tracking...');

          const submissionResponse = await fetch(
            `${baseUrl}/api/form-submissions`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                form_type: 'refusal_forms',
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

      alert('Form saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving form:', error);
      alert(
        `Failed to save form: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Don't render until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    // Main container
    <div className="p-4 md:p-6 lg:p-10 w-full">
      <h1 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
        Transcare Emergency Medical Services - Refusal Form
      </h1>

      {/* Event Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            League /Event:
          </label>
          <Input
            type="text"
            name="leagueEvent"
            value={formData.leagueEvent}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TYPE:</label>
          <Input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location:</label>
          <Input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Incident:</label>
          <Input
            type="text"
            name="incident"
            value={formData.incident}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Patient Name:
          </label>
          <Input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">DOB:</label>
          <Input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age:</label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Details - Landline:
          </label>
          <Input
            type="tel"
            name="landline"
            value={formData.landline}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cell:</label>
          <Input
            type="tel"
            name="cell"
            value={formData.cell}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Guardian Information */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <label className="text-sm font-medium text-foreground">
            GUARDIAN:
          </label>
          <select
            name="guardian"
            value={formData.guardian}
            onChange={handleInputChange}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto"
          >
            <option value="yes">YES</option>
            <option value="no">NO</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Landline:</label>
            <Input
              type="tel"
              name="guardianLandline"
              value={formData.guardianLandline}
              onChange={handleInputChange}
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cell:</label>
            <Input
              type="tel"
              name="guardianCell"
              value={formData.guardianCell}
              onChange={handleInputChange}
              className="w-full h-10 text-base"
            />
          </div>
        </div>
      </div>

      {/* Guardian Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name:</label>
          <Input
            type="text"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age:</label>
          <Input
            type="number"
            name="guardianAge"
            value={formData.guardianAge}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Relationship:
          </label>
          <Input
            type="text"
            name="relationship"
            value={formData.relationship}
            onChange={handleInputChange}
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Situation of Injury/Illness */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Situation of Injury/Illness:
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 min-h-[80px] text-sm md:text-base"
          name="situation"
          value={formData.situation}
          onChange={handleInputChange}
        />
      </div>

      {/* Check Applicable Refusal */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm mb-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">
          Check Applicable Refusal
        </h3>

        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="treatmentNotNecessary"
              checked={formData.refusalReasons.treatmentNotNecessary}
              onChange={handleInputChange}
              className="mr-3 mt-1 flex-shrink-0"
            />
            <span className="text-sm">
              Patient refuses treatment; transport is not necessary for the
              situation;
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="refusesTransportAgainstAdvice"
              checked={formData.refusalReasons.refusesTransportAgainstAdvice}
              onChange={handleInputChange}
              className="mr-3 mt-1 flex-shrink-0"
            />
            <span className="text-sm">
              Patient refuses treatment and transport to a hospital against EMS
              advice;
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="treatmentReceivedNoTransport"
              checked={formData.refusalReasons.treatmentReceivedNoTransport}
              onChange={handleInputChange}
              className="mr-3 mt-1 flex-shrink-0"
            />
            <span className="text-sm">
              Patient receives treatment does not desire transport to hospital
              by ambulance;
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="alternativeTransportation"
              checked={formData.refusalReasons.alternativeTransportation}
              onChange={handleInputChange}
              className="mr-3 mt-1 flex-shrink-0"
            />
            <span className="text-sm">
              Patient / Guardian believes alternative transportation plan is
              reasonable;
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="acceptsTransportRefusesTreatment"
              checked={formData.refusalReasons.acceptsTransportRefusesTreatment}
              onChange={handleInputChange}
              className="mr-3 mt-1 flex-shrink-0"
            />
            <span className="text-sm">
              Patient accepts transportation to hospital by EMS but refuses any
              or all treatment offered.
            </span>
          </label>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Specify treatment refused:
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[60px] text-sm md:text-base"
              name="treatmentRefused"
              value={formData.treatmentRefused}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Legal Text */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm mb-6">
        <div className="text-xs md:text-sm space-y-4">
          <p>
            This form is being provided to me because I have refused assessment,
            treatment and/or transport by EMS personnel myself or on behalf of
            this patient. I understand that EMS personnel are not physicians and
            are not qualified or authorized to make a diagnosis and that their
            care is not a substitute for that of a physician.
          </p>

          <p>
            I recognize that there may be a serious injury or illness which
            could get worse without medical attention even though I (or the
            patient) may feel fine at the present time. I understand that I may
            change my mind and call 911 or nearest community EMS available. If
            treatment or assistance is needed later, I also understand that
            treatment is available at an emergency department 24 hours a day.
          </p>
        </div>
      </div>

      {/* Acknowledgment and Signature Section */}
      <div className="border rounded-lg p-4 md:p-6 shadow-sm mb-6">
        <div className="text-xs md:text-sm mb-6">
          <p className="leading-relaxed">
            I acknowledge that this advice has been explained to me by the
            ambulance crew and upon affixing my signature for myself or on
            behalf of the patient signing this form, I am releasing Transcare
            Emergency Medical Services Management and employees and{' '}
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="border-b border-gray-400 outline-none px-1 w-32 sm:w-48 inline-block text-xs md:text-sm"
              placeholder="Organizer"
            />{' '}
            and its employees of any liability or medical claims resulting from
            my decision to refuse care against medical advice.
          </p>
        </div>

        {/* Signature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6">
          {/* Patient/Guardian Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Patient / Guardian
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('patientGuardian')}
              >
                {sigData['patientGuardian'] ? (
                  <img
                    src={sigData['patientGuardian']}
                    alt="Patient/Guardian signature"
                    className="max-h-[60px] md:max-h-[100px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="patientGuardian.patient_guardian_signature_name"
                type="text"
                className="w-full"
                value={
                  formData.patientGuardian?.patient_guardian_signature_name ||
                  ''
                }
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Events Organizer Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Events Organizer
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('eventsOrganizer')}
              >
                {sigData['eventsOrganizer'] ? (
                  <img
                    src={sigData['eventsOrganizer']}
                    alt="Events Organizer signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="eventsOrganizer.events_organizer_signature_name"
                type="text"
                className="w-full"
                value={
                  formData.eventsOrganizer?.events_organizer_signature_name ||
                  ''
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6">
          {/* Witness Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Witness</label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('witness')}
              >
                {sigData['witness'] ? (
                  <img
                    src={sigData['witness']}
                    alt="Witness signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="witness.witness_signature_name"
                type="text"
                className="w-full"
                value={formData.witness?.witness_signature_name || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Medic Personnel Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Medic Personnel
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig('medicPersonnel')}
              >
                {sigData['medicPersonnel'] ? (
                  <img
                    src={sigData['medicPersonnel']}
                    alt="Medic Personnel signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="medicPersonnel.medic_personnel_signature_name"
                type="text"
                className="w-full"
                value={
                  formData.medicPersonnel?.medic_personnel_signature_name || ''
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PCR:</label>
            <Input
              type="text"
              name="pcr"
              value={formData.pcr}
              onChange={handleInputChange}
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">DATE:</label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">TIME:</label>
            <Input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full h-10 text-base"
            />
          </div>
        </div>
      </div>

      {/* Dialog for signatures - responsive modal */}
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
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-lg shadow-lg relative w-full max-w-sm md:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-3 md:p-4 border-b">
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          className="mt-0 sm:mt-6 w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !user}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {!user && !loading && (
          <p className="text-red-500 text-sm mt-2">
            Please log in to submit the form
          </p>
        )}
      </div>
    </div>
  );
}
