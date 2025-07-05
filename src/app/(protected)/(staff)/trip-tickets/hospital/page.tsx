"use client";
import { createClient } from "@supabase/supabase-js";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HospitalTripForm() {
  const nurseSigRef = useRef<SignatureCanvas | null>(null);
  const billingSigRef = useRef<SignatureCanvas | null>(null);
  const ambulanceSigRef = useRef<SignatureCanvas | null>(null);
  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });
  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    "nurse" | "billing" | "ambulance" | null
  >(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRefByType = (type: string | null) => {
    if (type === "nurse") return nurseSigRef;
    if (type === "billing") return billingSigRef;
    if (type === "ambulance") return ambulanceSigRef;
    return null;
  };

  const clearSig = () => {
    const ref = getRefByType(activeSig);
    ref?.current?.clear();
  };

  const uploadSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current && !ref.current.isEmpty()) {
      const dataUrl = ref.current.getTrimmedCanvas().toDataURL("image/png");
      setSigData((prev) => ({ ...prev, [activeSig!]: dataUrl }));
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
        const img = new Image();
        img.onload = () => {
          const ctx = ref.current!.getCanvas().getContext("2d");
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
    const dataUrl = sigData[activeSig || ""];
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

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    room: "",
    trip_type: "BLS",
    vehicle: "",
    plate: "",
    age_sex: "",
    patient_name: "",
    purpose: "THOC",
    pickup: "",
    destination: "",
    billing_class: "REG",
    tare: "REG",
    billing_type: "DRP",
    gross: "",
    discount: "",
    payables: "",
    vat: "",
    vatables: "",
    zero_vat: "",
    withholding: "",
    remarks: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        sig_nurse: sigData.nurse || null,
        sig_billing: sigData.billing || null,
        sig_ambulance: sigData.ambulance || null,
      };

      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : window.location.origin;

      const response = await fetch(`${baseUrl}/api/trip-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData: submitData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${
            errorData.error || "Failed to submit form"
          }`
        );
      }

      const result = await response.json();
      alert("Saved successfully!");

      setFormData({
        date: "",
        time: "",
        room: "",
        trip_type: "BLS",
        vehicle: "",
        plate: "",
        age_sex: "",
        patient_name: "",
        purpose: "THOC",
        pickup: "",
        destination: "",
        billing_class: "REG",
        tare: "REG",
        billing_type: "DRP",
        gross: "",
        discount: "",
        payables: "",
        vat: "",
        vatables: "",
        zero_vat: "",
        withholding: "",
        remarks: "",
      });
      setSigData({});
    } catch (error) {
      console.error("Error saving:", error);
      alert(`Failed to save`);
    } finally {
      setIsSubmitting(false);
    }
  };
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
              {["BLS", "ALS", "BLS-ER", "ALS1"].map((type) => (
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
                "THOC",
                "MGH",
                "Procedural Run",
                "NON Emergency Patient Transfer",
                "NON Emergency Commercial Transfer",
                "Long Distance Conduction",
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
              {["REG", "HMO", "P/N", "InHOUSE"].map((type) => (
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
              {["REG", "SCD", "PWD", "CR"].map((opt) => (
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
              {["DRP", "P/N", "BILLED", "CSR/P", "CSR/WP"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Fixed billing fields with proper state connections */}
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
            { label: "Nurse", ref: nurseSigRef, key: "nurse" },
            { label: "Admitting/Billing", ref: billingSigRef, key: "billing" },
            {
              label: "Ambulance Staff",
              ref: ambulanceSigRef,
              key: "ambulance",
            },
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
                    <SignatureCanvas
                      ref={getRefByType(activeSig)}
                      penColor="black"
                      canvasProps={{
                        width: sigCanvasSize.width,
                        height: sigCanvasSize.height,
                        className: "bg-gray-100 rounded shadow ",
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
        </div>
      </div>
      <Button className="mt-6" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}
