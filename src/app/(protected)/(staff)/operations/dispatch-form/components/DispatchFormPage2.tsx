"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function DispatchFormPage2() {
  const teamLeaderSigRef = useRef<SignatureCanvas | null>(null);
  const clientRepresentativeSigRef = useRef<SignatureCanvas | null>(null);
  const emsSupervisorSigRef = useRef<SignatureCanvas | null>(null);
  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });
  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    "nurse" | "billing" | "ambulance" | null
  >(null);
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});

  const getRefByType = (type: string | null) => {
    if (type === "nurse") return teamLeaderSigRef;
    if (type === "billing") return clientRepresentativeSigRef;
    if (type === "ambulance") return emsSupervisorSigRef;
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
  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        Transcare Emergency Medical Services - Operation Dispatch Form 2
      </h1>

      <div className="border rounded-lg p-6 shadow-sm space-y-6">
        <div>
          <label className="block mb-2 font-medium">Type of Service</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Manpower", "Ambulance", "Combination", "Support Unit"].map(
              (service) => (
                <div key={service} className="flex items-center gap-2">
                  <Checkbox id={service} />
                  <label htmlFor={service} className="text-base font-medium">
                    {service}
                  </label>
                </div>
              )
            )}
            <div className="col-span-2 md:col-span-1">
              <Input placeholder="Specify" className="h-10 text-base" />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Ambulance Model</label>
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <Input placeholder="Ambulance Model" className="h-10 text-base" />
              <Input placeholder="Plate Number" className="h-10 text-base" />
              <Input placeholder="Type" className="h-10 text-base" />
            </div>
          ))}
        </div>

        <div>
          <label className="block mb-2 font-medium">Crew Credentials</label>
          <div className="flex flex-wrap gap-6">
            {["EMT", "RN", "EMR", "COMBINATION"].map((role) => (
              <div key={role} className="flex items-center gap-2">
                <Checkbox id={role} />
                <label htmlFor={role} className="text-base font-medium">
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Number of Crew</label>
            <Input className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Full Name and Signature of MD
            </label>
            {[1, 2, 3, 4].map((_, i) => (
              <Input
                key={i}
                placeholder={`Line ${i + 1}`}
                className="h-10 text-base mb-2"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Point of Destination</label>
          {[1, 2, 3, 4].map((i) => (
            <Input
              key={i}
              placeholder={`${i})`}
              className="h-10 text-base mb-2"
            />
          ))}
        </div>
        <div>
          <label className="block mb-2 font-medium">Special Consideration</label>
          <Textarea className="h-10 text-base mb-2"></Textarea>
        </div>
        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Patient Census
          </h2>
          {[
            { label: "Treated", field: "WAIVER" },
            { label: "Transported", field: "INSURANCE" },
            { label: "Refused", field: "PRE-MED CHECK" },
          ].map(({ label, field }) => (
            <div
              key={field}
              className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center"
            >
              <span className="font-medium">{label}</span>

              <div className="flex items-center gap-2">
                <label className="text-base">Trauma</label>
                <Input placeholder="#" className="h-10 text-base w-20" />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-base">Medical</label>
                <Input placeholder="#" className="h-10 text-base w-20" />
              </div>

              <div className="flex items-center gap-2">
                <Input placeholder="Rate" className="h-10 text-base w-20" />
                <span className="text-base">/</span>
                <Input placeholder="Rate" className="h-10 text-base w-20" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base">{field}</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id={`${field}-Y`} className="w-6 h-6" />
                <label htmlFor={`${field}-Y`} className="text-base">
                  Y
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id={`${field}-N`} className="w-6 h-6" />
                <label htmlFor={`${field}-N`} className="text-base">
                  N
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id={`${field}-NA`} className="w-6 h-6" />
                <label htmlFor={`${field}-NA`} className="text-base">
                  N/A
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {["Dispatch", "On Scene", "Departure", "Arrival"].map((stage) => (
            <div
              key={stage}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
            >
              <label className="font-medium">{stage}</label>
              <Input placeholder="HRS" className="h-10 text-base" />
              <Input placeholder="MIN" className="h-10 text-base" />
              <Input placeholder="READING" className="h-10 text-base" />
            </div>
          ))}

          {["Working Time", "Travel Time", "Over-all"].map((label) => (
            <div
              key={label}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
            >
              <label className="font-medium">{label}</label>
              <Input placeholder="HRS" className="h-10 text-base" />
              <Input placeholder="MIN" className="h-10 text-base" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            {
              label: "Team Leader",
              signatureLabel: "Prepared and Filled by",
              ref: teamLeaderSigRef,
              key: "team leader",
            },
            {
              label: "Client Representative",
              signatureLabel: "Conformed by",
              ref: clientRepresentativeSigRef,
              key: "client",
            },
            {
              label: "EMS Supervisor",
              signatureLabel: "Noted by",
              ref: emsSupervisorSigRef,
              key: "ems",
            },
          ].map(({ label, signatureLabel, key }) => (
            <div key={key}>
              <label className="block mb-1 font-medium">
                {signatureLabel} ({label})
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
                      className="absolute  right-6 text-gray-700 hover:text-black"
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
    </div>
  );
}
