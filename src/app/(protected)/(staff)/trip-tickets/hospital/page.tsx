'use client';

import { useRef, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/provider/auth-provider";
import * as React from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple signature canvas interface
interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  getDataURL: () => string;
  loadFromDataURL: (dataURL: string) => void;
}

// Simple signature canvas component
const SimpleSignatureCanvas: React.ForwardRefExoticComponent<
  {
    width: number;
    height: number;
    className?: string;
  } & React.RefAttributes<SignatureCanvasRef>
> = React.forwardRef<SignatureCanvasRef, {
  width: number;
  height: number;
  className?: string;
}>(({ width, height, className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hasDrawn.current = false;
  }, [width, height]);

  // Get coordinates from event
  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return { x: 0, y: 0 };
      clientX = touch.clientX;
      clientY = touch.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Start drawing
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    lastPoint.current = { x, y };
  };

  // Draw line
  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPoint.current = { x, y };
    hasDrawn.current = true;
  };

  // Stop drawing
  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // Prevent scrolling
  const preventScroll = (e: TouchEvent) => {
    if (isDrawing.current) {
      e.preventDefault();
    }
  };

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Prevent scrolling
    canvas.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      hasDrawn.current = false;
    },

    isEmpty: () => {
      return !hasDrawn.current;
    },

    getDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas) return '';
      return canvas.toDataURL('image/png');
    },

    loadFromDataURL: (dataURL: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        hasDrawn.current = true;
      };
      img.onerror = () => {
        console.error('Failed to load image from data URL');
      };
      img.src = dataURL;
    }
  }), []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        cursor: 'crosshair',
        touchAction: 'none',
        userSelect: 'none',
        display: 'block',
        border: '1px solid #ccc'
      }}
    />
  );
});

SimpleSignatureCanvas.displayName = 'SimpleSignatureCanvas';

export default function HospitalTripForm() {
  const nurseSigRef = useRef<SignatureCanvasRef | null>(null);
  const billingSigRef = useRef<SignatureCanvasRef | null>(null);
  const ambulanceSigRef = useRef<SignatureCanvasRef | null>(null);
  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });
  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    'nurse' | 'billing' | 'ambulance' | null
  >(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { user, loading } = useAuth();

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const getRefByType = (type: string | null) => {
    if (type === 'nurse') return nurseSigRef;
    if (type === 'billing') return billingSigRef;
    if (type === 'ambulance') return ambulanceSigRef;
    return null;
  };

  const clearSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current) {
      try {
        ref.current.clear();
      } catch (error) {
        console.error('Error clearing signature:', error);
      }
    }
  };

  const uploadSig = () => {
    const ref = getRefByType(activeSig);
    if (!ref?.current) {
      console.error('No signature canvas reference found');
      return;
    }

    try {
      // Check if the signature canvas is empty
      if (ref.current.isEmpty()) {
        console.log('Signature canvas is empty');
        setActiveSig(null);
        return;
      }

      // Get the data URL directly
      const dataUrl = ref.current.getDataURL();

      if (dataUrl) {
        setSigData((prev) => ({ ...prev, [activeSig!]: dataUrl }));
        console.log('Signature saved successfully');
      } else {
        console.error('Could not generate signature data URL');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Error saving signature. Please try again.');
    }
    
    setActiveSig(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      const ref = getRefByType(activeSig);
      if (ref?.current) {
        try {
          ref.current.loadFromDataURL(imageData);
        } catch (error) {
          console.error('Error loading image:', error);
          alert('Error loading image. Please try again.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!mounted) return;
    
    const ref = getRefByType(activeSig);
    const dataUrl = sigData[activeSig || ''];
    if (ref?.current && dataUrl) {
      try {
        ref.current.clear();
        ref.current.loadFromDataURL(dataUrl);
      } catch (error) {
        console.error('Error loading signature from data URL:', error);
      }
    }
  }, [activeSig, sigData, mounted]);

  useEffect(() => {
    if (modalCanvasRef.current) {
      const width = modalCanvasRef.current.offsetWidth;
      const height = 750;
      setSigCanvasSize({ width, height });
    }
  }, [activeSig]);

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

  const handleSubmit = async () => {
    if (!user) {
      alert("Please log in to submit the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        sig_nurse: sigData.nurse || null,
        sig_billing: sigData.billing || null,
        sig_ambulance: sigData.ambulance || null,
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

      alert('Saved successfully!');

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
    } catch (error) {
      console.error("Error saving:", error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to safely create signature canvas with error handling
  const createSignatureCanvas = (ref: React.RefObject<SignatureCanvasRef | null> | null) => {
    if (!mounted || !ref) return null;
    
    try {
      return (
        <SimpleSignatureCanvas
          ref={ref}
          width={sigCanvasSize.width}
          height={sigCanvasSize.height}
          className="bg-gray-100 rounded shadow"
        />
      );
    } catch (error) {
      console.error('Error creating signature canvas:', error);
      return (
        <div className="bg-red-100 rounded shadow flex items-center justify-center h-[750px]">
          <p className="text-red-600">Error loading signature pad. Please refresh the page.</p>
        </div>
      );
    }
  };

  // Don't render signature components until mounted
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
                    className="max-h-[100px]"
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
                <VisuallyHidden>Signature Dialog</VisuallyHidden>
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
                    {createSignatureCanvas(getRefByType(activeSig))}
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
        </div>
      </div>
      <Button 
        className="mt-6" 
        onClick={handleSubmit} 
        disabled={isSubmitting || loading || !user}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
      
      {!user && !loading && (
        <p className="text-red-500 mt-2">Please log in to submit the form</p>
      )}
    </div>
  );
}