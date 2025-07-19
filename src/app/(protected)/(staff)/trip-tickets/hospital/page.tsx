'use client';

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/provider/auth-provider";
import SignatureForm, { SignatureData } from "@/components/forms/SignatureForm";
import { uploadFile } from "@/lib/supabase/storage";
import { toast } from "sonner";
import * as React from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HospitalTripForm() {
  const [activeSig, setActiveSig] = useState<
    'nurse' | 'billing' | 'ambulance' | null
  >(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { user, loading } = useAuth();

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    room: '',
    trip_type: 'BLS',
    vehicle: '',
    plate: '',
    age_sex: '',
    patient_name: '',
    purpose: 'THOC',
    pickup: '',
    destination: '',
    billing_class: 'REG',
    tare: 'REG',
    billing_type: 'DRP',
    gross: '',
    discount: '',
    payables: '',
    vat: '',
    vatables: '',
    zero_vat: '',
    withholding: '',
    remarks: '',
  });

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
        setSigData(prev => ({ ...prev, [activeSig]: base64String }));
        setSigPaths(prev => ({ ...prev, [activeSig]: upload.path }));
        
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

  const handleSubmit = async () => {
    if (!user) {
      alert("Please log in to submit the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        // Store signature data as base64 text in the database
        sig_nurse: sigData.nurse || null,
        sig_billing: sigData.billing || null,
        sig_ambulance: sigData.ambulance || null,
        // Also store the file paths for accessing images later
        sig_nurse_path: sigPaths.nurse || null,
        sig_billing_path: sigPaths.billing || null,
        sig_ambulance_path: sigPaths.ambulance || null,
      };

      // Use window.location.origin for both development and production
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw new Error("Authentication error");
      }

      console.log("Submitting form with user:", user.id);
      console.log("Session token available:", !!session?.access_token);

      const response = await fetch(`${baseUrl}/api/trip-ticket`, {
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

      console.log("Form submitted successfully, ID:", formId);

      if (formId) {
        try {
          console.log("Creating form submission tracking...");
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }
          
          const submissionResponse = await fetch(`${baseUrl}/api/form-submissions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              form_type: "hospital_trip_tickets",
              reference_id: formId,
              status: "pending",
              submitted_by: user.id,
              reviewed_by: null,
            }),
          });

          if (!submissionResponse.ok) {
            const errorData = await submissionResponse.json().catch(() => ({}));
            console.error("Form submission tracking failed:", errorData);
            throw new Error(`Failed to create submission tracking: ${errorData.error}`);
          }

          const submissionResult = await submissionResponse.json();
          console.log("Form submission tracking created:", submissionResult);
          
        } catch (submissionError) {
          console.error("Failed to create submission tracking:", submissionError);
        }
      }

      toast.success('Trip ticket saved successfully!');

      // Reset form
      setFormData({
        date: '',
        time: '',
        room: '',
        trip_type: 'BLS',
        vehicle: '',
        plate: '',
        age_sex: '',
        patient_name: '',
        purpose: 'THOC',
        pickup: '',
        destination: '',
        billing_class: 'REG',
        tare: 'REG',
        billing_type: 'DRP',
        gross: '',
        discount: '',
        payables: '',
        vat: '',
        vatables: '',
        zero_vat: '',
        withholding: '',
        remarks: '',
      });
      setSigData({});
      setSigPaths({});
    } catch (error) {
      console.error("Error saving:", error);
      toast.error('Failed to save trip ticket', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSignatureTitle = (key: string) => {
    const titles = {
      nurse: 'Nurse',
      billing: 'Admitting/Billing',
      ambulance: 'Ambulance Staff'
    };
    return titles[key as keyof typeof titles] || key;
  };

  // Don't render until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        Transcare Emergency Medical Services - Hospital Trip Ticket
      </h1>

      <div className="mb-10 border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Trip Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <Input
              type="date"
              className="h-10 text-base"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Time</label>
            <Input
              type="time"
              className="h-10 text-base"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Room</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select
              className="w-full h-10 text-base border rounded px-2"
              value={formData.trip_type}
              onChange={(e) =>
                setFormData({ ...formData, trip_type: e.target.value })
              }
            >
              {['BLS', 'ALS', 'BLS-ER', 'ALS1'].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Vehicle</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.vehicle}
              onChange={(e) =>
                setFormData({ ...formData, vehicle: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Plate</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.plate}
              onChange={(e) =>
                setFormData({ ...formData, plate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Age/Sex</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.age_sex}
              onChange={(e) =>
                setFormData({ ...formData, age_sex: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Patient Name</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.patient_name}
              onChange={(e) =>
                setFormData({ ...formData, patient_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Purpose</label>
            <select
              className="w-full h-10 text-base border rounded px-2"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
            >
              {[
                'THOC',
                'MGH',
                'Procedural Run',
                'NON Emergency Patient Transfer',
                'NON Emergency Commercial Transfer',
                'Long Distance Conduction',
              ].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Pick up</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.pickup}
              onChange={(e) =>
                setFormData({ ...formData, pickup: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block mb-1 font-medium">Destination</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Billing and Signatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select
              className="w-full h-10 text-base border rounded px-2"
              value={formData.billing_type}
              onChange={(e) =>
                setFormData({ ...formData, billing_type: e.target.value })
              }
            >
              {['REG', 'HMO', 'P/N', 'InHOUSE'].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">TARE</label>
            <select
              className="w-full h-10 text-base border rounded px-2"
              value={formData.tare}
              onChange={(e) =>
                setFormData({ ...formData, tare: e.target.value })
              }
            >
              {['REG', 'SCD', 'PWD', 'CR'].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Billing</label>
            <select
              className="w-full h-10 text-base border rounded px-2"
              value={formData.billing_class}
              onChange={(e) =>
                setFormData({ ...formData, billing_class: e.target.value })
              }
            >
              {['DRP', 'P/N', 'BILLED', 'CSR/P', 'CSR/WP'].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Gross</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.gross}
              onChange={(e) =>
                setFormData({ ...formData, gross: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Discount</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Payables</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.payables}
              onChange={(e) =>
                setFormData({ ...formData, payables: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">VAT</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.vat}
              onChange={(e) =>
                setFormData({ ...formData, vat: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Vatables</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.vatables}
              onChange={(e) =>
                setFormData({ ...formData, vatables: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">ZeroVAT</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.zero_vat}
              onChange={(e) =>
                setFormData({ ...formData, zero_vat: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Withholding</label>
            <Input
              type="number"
              step="0.01"
              className="h-10 text-base"
              value={formData.withholding}
              onChange={(e) =>
                setFormData({ ...formData, withholding: e.target.value })
              }
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <label className="block mb-1 font-medium">Remarks</label>
            <Textarea
              className="w-full h-24 text-base"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            { label: 'Nurse', key: 'nurse' },
            { label: 'Admitting/Billing', key: 'billing' },
            { label: 'Ambulance Staff', key: 'ambulance' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block mb-1 font-medium">
                Signature Over Printed Name ({label})
              </label>
              <div
                className="border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig(key as typeof activeSig)}
              >
                {sigData[key] ? (
                  <img
                    src={sigData[key]}
                    alt={`${label} signature`}
                    className="max-h-[100px] max-w-full object-contain"
                  />
                ) : (
                  <Plus className="h-8 w-8 text-gray-500" />
                )}
              </div>
            </div>
          ))}

          <Dialog.Root
            open={!!activeSig}
            onOpenChange={(open) => !open && setActiveSig(null)}
          >
            <Dialog.Portal>
              <Dialog.Title>
                <VisuallyHidden>
                  {activeSig ? `${getSignatureTitle(activeSig)} Signature` : 'Signature Dialog'}
                </VisuallyHidden>
              </Dialog.Title>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                      {activeSig ? `${getSignatureTitle(activeSig)} E-Signature` : 'E-Signature'}
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
        </div>
      </div>
      
      <Button 
        className="mt-6" 
        onClick={handleSubmit} 
        disabled={isSubmitting || loading || !user}
      >
        {isSubmitting ? "Submitting..." : "Submit "}
      </Button>
      
      {!user && !loading && (
        <p className="text-red-500 mt-2">Please log in to submit the form</p>
      )}
    </div>
  );
}