"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function HospitalTripForm() {
  // const containerRef = useRef<HTMLDivElement | null>(null);
  const nurseSigRef = useRef<SignatureCanvas | null>(null);
  const billingSigRef = useRef<SignatureCanvas | null>(null);
  const ambulanceSigRef = useRef<SignatureCanvas | null>(null);
  // const [canvasWidth, setCanvasWidth] = useState(300);
  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });
  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    "nurse" | "billing" | "ambulance" | null
  >(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});

  // const openModal = (type: "nurse" | "billing" | "ambulance") => {
  //   setActiveSig(type);
  // };

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
  }, [activeSig]); // Trigger when modal opens
  // useEffect(() => {
  //   const updateWidth = () => {
  //     if (containerRef.current) {
  //       setCanvasWidth(containerRef.current.offsetWidth);
  //     }
  //   };

  //   updateWidth();
  //   window.addEventListener("resize", updateWidth);
  //   return () => window.removeEventListener("resize", updateWidth);
  // }, []);

  // const clearSignature = (ref: React.RefObject<SignatureCanvas | null>) => {
  //   ref.current?.clear();
  // };

  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        Transcare Emergency Medical Services - Operation Dispatch Form
      </h1>

      <div className="mb-10 border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Event Title</label>
            <Input type="text" className="h-10 text-base" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Event Type</label>
            <select className="w-full h-10 text-base border rounded px-2 ">
              {["PAID", "CHARITY", "BILLING", "DISCOUNTED"].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">
              Event Owner (Contact Person)
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Details</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">
              Event Organizer (Third Party)
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Details</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

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
      </div>
    </div>
  );
}
