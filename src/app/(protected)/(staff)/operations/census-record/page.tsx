'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/provider/auth-provider';
import SignatureForm, { SignatureData } from '@/components/forms/SignatureForm';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PatientRecord {
  id: string;
  name: string;
  age_sex: string;
  chief_complaint: string;
  vital_signs: string;
  management: string;
  signature: string; // base64 signature data
}

export default function OperationCensusForm() {
  const [activeSig, setActiveSig] = useState<string | null>(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Patient records state
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);

  const { user, loading } = useAuth();

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    date: '',
    event_owner: '',
    time_in: '',
    time_out: '',
    activity: '',
    location: '',
  });

  // Add new patient record
  const addPatientRecord = () => {
    const newRecord: PatientRecord = {
      id: `patient_${Date.now()}`,
      name: '',
      age_sex: '',
      chief_complaint: '',
      vital_signs: '',
      management: '',
      signature: '',
    };
    setPatientRecords([...patientRecords, newRecord]);
  };

  // Remove patient record
  const removePatientRecord = (id: string) => {
    setPatientRecords(patientRecords.filter((record) => record.id !== id));
  };

  // Update patient record
  const updatePatientRecord = (
    id: string,
    field: keyof PatientRecord,
    value: string
  ) => {
    setPatientRecords(
      patientRecords.map((record) =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!activeSig) return;

    setIsSigLoading(true);

    try {
      // Generate unique filename for each signature
      const timestamp = new Date().getTime();
      const filename = `census_records/${activeSig}_signature_${timestamp}.png`;

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

        // Check if it's a patient signature or form signature
        if (activeSig.startsWith('patient_')) {
          // Update patient record signature
          const patientId = activeSig;
          updatePatientRecord(patientId, 'signature', base64String);
        } else {
          // Update form signature (preparedBy/conformedBy)
          setSigData((prev) => ({ ...prev, [activeSig]: base64String }));
        }

        setSigPaths((prev) => ({ ...prev, [activeSig]: upload.path }));

        toast.success('Signature saved successfully');
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

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit the form');
      return;
    }

    // Validate required fields
    if (!formData.date || !formData.event_owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        date: formData.date,
        event_owner: formData.event_owner,
        time_in: formData.time_in || null,
        time_out: formData.time_out || null,
        activity: formData.activity || null,
        location: formData.location || null,
        form_data: patientRecords, // JSONB array of patient records
        prepared_by_signature: sigData.preparedBy || null,
        conformed_by_signature: sigData.conformedBy || null,
        created_by: user.id,
      };

      // Use window.location.origin for both development and production
      const baseUrl =
        typeof window !== 'undefined' ? window.location.origin : '';

      // Get the current session token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      console.log('Submitting form with user:', user.id);
      console.log('Form data:', submitData);

      const response = await fetch(`${baseUrl}/api/census-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: submitData }),
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

          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }

          const submissionResponse = await fetch(
            `${baseUrl}/api/form-submissions`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                form_type: 'operation_census_records',
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

      toast.success('Operation census record saved successfully!');

      // Reset form
      setFormData({
        date: '',
        event_owner: '',
        time_in: '',
        time_out: '',
        activity: '',
        location: '',
      });
      setPatientRecords([]);
      setSigData({});
      setSigPaths({});
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save operation census record', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSignatureTitle = (key: string) => {
    if (key.startsWith('patient_')) {
      return 'Patient Signature';
    }
    const titles = {
      preparedBy: 'Prepared By',
      conformedBy: 'Conformed By',
    };
    return titles[key as keyof typeof titles] || key;
  };

  // Don't render until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 w-full">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">
        Transcare Emergency Medical Service - Operation Census Record Form
      </h1>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Input
            placeholder="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            placeholder="Event Owner"
            value={formData.event_owner}
            onChange={(e) =>
              setFormData({ ...formData, event_owner: e.target.value })
            }
          />
          <Input
            placeholder="Time In"
            type="time"
            value={formData.time_in}
            onChange={(e) =>
              setFormData({ ...formData, time_in: e.target.value })
            }
          />
          <Input
            placeholder="Time Out"
            type="time"
            value={formData.time_out}
            onChange={(e) =>
              setFormData({ ...formData, time_out: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
          <Input
            placeholder="Activity"
            value={formData.activity}
            onChange={(e) =>
              setFormData({ ...formData, activity: e.target.value })
            }
          />
          <Input
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mb-4">
        <Button
          onClick={addPatientRecord}
          className="flex items-center gap-2"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Patient Record
        </Button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[800px] sm:min-w-0">
          <table className="w-full border">
            <thead>
              <tr className="text-xs sm:text-sm">
                <th className="border p-2 sm:p-2">No.</th>
                <th className="border p-2 sm:p-2">
                  Name of Injured/Ill Person
                </th>
                <th className="border p-2 sm:p-2">Age/Sex</th>
                <th className="border p-2 sm:p-2">Chief Complaint</th>
                <th className="border p-2 sm:p-2">Vital Signs</th>
                <th className="border p-2 sm:p-2">Management</th>
                <th className="border p-2 sm:p-2">Signature of PT</th>
                <th className="border p-2 sm:p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patientRecords.map((record, idx) => (
                <tr key={record.id}>
                  <td className="border p-1 sm:p-2 text-center text-xs sm:text-sm">
                    {idx + 1}
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Input
                      value={record.name}
                      onChange={(e) =>
                        updatePatientRecord(record.id, 'name', e.target.value)
                      }
                      placeholder="Enter name"
                      className="border-none p-0 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Input
                      value={record.age_sex}
                      onChange={(e) =>
                        updatePatientRecord(
                          record.id,
                          'age_sex',
                          e.target.value
                        )
                      }
                      placeholder="e.g., 25/M"
                      className="border-none p-0 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Input
                      value={record.chief_complaint}
                      onChange={(e) =>
                        updatePatientRecord(
                          record.id,
                          'chief_complaint',
                          e.target.value
                        )
                      }
                      placeholder="Chief complaint"
                      className="border-none p-0 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Input
                      value={record.vital_signs}
                      onChange={(e) =>
                        updatePatientRecord(
                          record.id,
                          'vital_signs',
                          e.target.value
                        )
                      }
                      placeholder="Vital signs"
                      className="border-none p-0 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Input
                      value={record.management}
                      onChange={(e) =>
                        updatePatientRecord(
                          record.id,
                          'management',
                          e.target.value
                        )
                      }
                      placeholder="Management"
                      className="border-none p-0 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <div className="flex items-center justify-center">
                      {record.signature ? (
                        <img
                          src={record.signature}
                          alt="Patient Signature"
                          className="max-h-8 max-w-16 cursor-pointer"
                          onClick={() => setActiveSig(record.id)}
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSig(record.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="border p-1 sm:p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePatientRecord(record.id)}
                      className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {patientRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="border p-4 text-center text-gray-500"
                  >
                    No patient records added. Click Add Patient Record to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 mt-6 sm:mt-8">
        <div>
          <label className="block font-medium mb-2 text-sm sm:text-base">
            Prepared by:
          </label>
          <div
            className="border border-dashed border-gray-400 p-3 sm:p-4 rounded-md flex items-center justify-center min-h-[80px] sm:min-h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => setActiveSig('preparedBy')}
          >
            {sigData.preparedBy ? (
              <img
                src={sigData.preparedBy}
                alt="Prepared Signature"
                className="max-h-16 sm:max-h-24"
              />
            ) : (
              <span className="text-gray-400 text-sm sm:text-base">
                Click to sign
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2 text-sm sm:text-base">
            Conformed by:
          </label>
          <div
            className="border border-dashed border-gray-400 p-3 sm:p-4 rounded-md flex items-center justify-center min-h-[80px] sm:min-h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => setActiveSig('conformedBy')}
          >
            {sigData.conformedBy ? (
              <img
                src={sigData.conformedBy}
                alt="Conformed Signature"
                className="max-h-16 sm:max-h-24"
              />
            ) : (
              <span className="text-gray-400 text-sm sm:text-base">
                Click to sign
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !user}
          className="px-4 sm:px-6 lg:px-8 py-2 text-sm sm:text-base w-full sm:w-auto"
        >
          {isSubmitting ? 'Submitting...' : 'Submit '}
        </Button>
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
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-lg relative w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold">
                  {activeSig
                    ? `${getSignatureTitle(activeSig)} E-Signature`
                    : 'E-Signature'}
                </h2>
                <Dialog.Close asChild>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setActiveSig(null)}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
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
  );
}
