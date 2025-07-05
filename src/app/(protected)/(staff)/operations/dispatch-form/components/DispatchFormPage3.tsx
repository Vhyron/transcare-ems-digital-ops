"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DispatchFormData } from "@/hooks/dispatch-form";
import { dispatchApi } from "@/lib/dispatchApi";
interface DispatchFormPage3Props {
  formId?: string;
  onFormSaved?: (formId: string) => void;
  onDataChange?: (data: Partial<DispatchFormData>) => void;
  formData: DispatchFormData;
  updateFormData: (updates: Partial<DispatchFormData>) => void;
  isLoading: boolean;
}

export default function DispatchFormPage3({
  formId,
  onFormSaved,
  onDataChange,
}: DispatchFormPage3Props) {
  const [formData, setFormData] = useState<Partial<DispatchFormData>>({});
  const [isSaving, setIsSaving] = useState(false);
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

  // New state for managing rows
  const [numberOfRows, setNumberOfRows] = useState(10);
  const maxRows = 20;

  const addRow = () => {
    if (numberOfRows < maxRows) {
      setNumberOfRows((prev) => prev + 1);
    }
  };

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
    <div>
      <h2 className="text-xl font-bold mb-4">
        Transcare Emergency Medical Services - Operation Dispatch Form 3
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-medium block mb-1">Event Title</label>
          <input type="text" className="border w-full h-10 rounded px-3" />
        </div>
        <div>
          <label className="font-medium block mb-1">Total Crew</label>
          <input type="number" className="border w-full h-10 rounded px-3" />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Rows: {numberOfRows} / {maxRows}
        </div>
        <Button
          onClick={addRow}
          disabled={numberOfRows >= maxRows}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
      </div>

      <div
        className={`w-full border ${
          numberOfRows > 20 ? "max-h-96 overflow-y-auto" : ""
        }`}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0">
            <tr className="text-left">
              {[
                "No.",
                "Name",
                "Title",
                "Position",
                "IN",
                "OUT",
                "Signature",
              ].map((head, idx) => (
                <th key={idx} className="p-2 border">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numberOfRows }, (_, i) => (
              <tr key={i}>
                <td className="border p-1">{i + 1}</td>
                {[..."     "].map((_, j) => (
                  <td key={j} className="border p-1">
                    <input
                      type="text"
                      className="w-full p-1 text-sm border rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
              className="border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px]  hover:bg-gray-100 cursor-pointer"
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
  );
}
