"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function HospitalTripForm() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nurseSigRef = useRef<SignatureCanvas | null>(null);
  const billingSigRef = useRef<SignatureCanvas | null>(null);
  const ambulanceSigRef = useRef<SignatureCanvas | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(300);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const clearSignature = (ref: React.RefObject<SignatureCanvas | null>) => {
    ref.current?.clear();
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
            <Input type="date" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Time</label>
            <Input type="time" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Room</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["BLS", "ALS", "BLS-ER", "ALS1"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Vehicle</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Plate</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Age/Sex</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Patient Name</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Purpose</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Pick up</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block mb-1 font-medium">Destination</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Billing and Signatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["REG", "HMO", "P/N", "InHOUSE"].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">TARE</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["REG", "SCD", "PWD", "CR"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Billing</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["DRP", "P/N", "BILLED", "CSR/P", "CSR/WP"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {[
            "Gross",
            "Discount",
            "Payables",
            "VAT",
            "Vatables",
            "ZeroVAT",
            "Withholding",
          ].map((field, i) => (
            <div key={i}>
              <label className="block mb-1 font-medium">{field}</label>
              <Input type="text" className="h-10 text-base" />
            </div>
          ))}

          <div className="col-span-1 md:col-span-3">
            <label className="block mb-1 font-medium">Remarks</label>
            <Textarea className="w-full h-24 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            { label: "Nurse", ref: nurseSigRef },
            { label: "Admitting/Billing", ref: billingSigRef },
            { label: "Ambulance Staff", ref: ambulanceSigRef },
          ].map(({ label, ref }, index) => (
            <div key={index}>
              <label className="block mb-1 font-medium">
                Signature Over Printed Name ({label})
              </label>
              <div
                className="border border-gray-300 p-3 rounded-md"
                ref={containerRef}
              >
                <SignatureCanvas
                  ref={ref}
                  penColor="black"
                  canvasProps={{
                    width: canvasWidth,
                    height: 200,
                    className: "bg-white shadow-md rounded w-full",
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSignature(ref)}
                    type="button"
                  >
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" type="button">
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
