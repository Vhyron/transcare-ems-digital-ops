"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { X } from "lucide-react";

export default function OperationCensusForm() {
  const preparedBySigRef = useRef<SignatureCanvas | null>(null);
  const conformedBySigRef = useRef<SignatureCanvas | null>(null);
  const [sigData, setSigData] = useState<{ prepared?: string; conformed?: string }>({});
  const [openSigModal, setOpenSigModal] = useState<"prepared" | "conformed" | null>(null);

  const handleSigSave = () => {
    if (openSigModal === "prepared" && preparedBySigRef.current && !preparedBySigRef.current.isEmpty()) {
      const dataUrl = preparedBySigRef.current.getTrimmedCanvas().toDataURL("image/png");
      setSigData((prev) => ({ ...prev, prepared: dataUrl }));
    }
    if (openSigModal === "conformed" && conformedBySigRef.current && !conformedBySigRef.current.isEmpty()) {
      const dataUrl = conformedBySigRef.current.getTrimmedCanvas().toDataURL("image/png");
      setSigData((prev) => ({ ...prev, conformed: dataUrl }));
    }
    setOpenSigModal(null);
  };

  const rows = Array.from({ length: 10 });

  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6 text-center">
        TRANSCare Emergency Medical Service - Operation Census Record Form
      </h1>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input placeholder="Date" type="date"/>
          <Input placeholder="Event Owner" />
          <Input placeholder="Time In" />
          <Input placeholder="Time Out" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Activity" />
          <Input placeholder="Location" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className=" text-sm">
              <th className="border p-2">No.</th>
              <th className="border p-2">Name of Injured/Ill Person</th>
              <th className="border p-2">Age/Sex</th>
              <th className="border p-2">Chief Complaint</th>
              <th className="border p-2">Vital Signs</th>
              <th className="border p-2">Management</th>
              <th className="border p-2">Signature of PT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
                <td className="border p-2">
                  <td className="h-8 text-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
        <div>
          <label className="block font-medium mb-2">Prepared by:</label>
          <div
            className="border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => setOpenSigModal("prepared")}
          >
            {sigData.prepared ? (
              <img src={sigData.prepared} alt="Prepared Signature" className="max-h-24" />
            ) : (
              <span className="text-gray-400">Click to sign</span>
            )}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2">Conformed by:</label>
          <div
            className="border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => setOpenSigModal("conformed")}
          >
            {sigData.conformed ? (
              <img src={sigData.conformed} alt="Conformed Signature" className="max-h-24" />
            ) : (
              <span className="text-gray-400">Click to sign</span>
            )}
          </div>
        </div>
      </div>

      <Dialog.Root open={openSigModal !== null} onOpenChange={() => setOpenSigModal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-[800px] h-[500px] flex flex-col">
              <button
                className="absolute right-6 text-gray-700 hover:text-black"
                onClick={() => setOpenSigModal(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1">
                {openSigModal === "prepared" && (
                  <SignatureCanvas
                    ref={preparedBySigRef}
                    penColor="black"
                    canvasProps={{
                      width: 750,
                      height: 300,
                      className: "bg-gray-100 rounded w-full",
                    }}
                  />
                )}
                {openSigModal === "conformed" && (
                  <SignatureCanvas
                    ref={conformedBySigRef}
                    penColor="black"
                    canvasProps={{
                      width: 750,
                      height: 300,
                      className: "bg-gray-100 rounded w-full",
                    }}
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (openSigModal === "prepared") preparedBySigRef.current?.clear();
                    if (openSigModal === "conformed") conformedBySigRef.current?.clear();
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSigSave}>Save</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
