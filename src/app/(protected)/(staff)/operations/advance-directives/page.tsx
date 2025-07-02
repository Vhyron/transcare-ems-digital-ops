"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";

export default function AdvanceDirectivesForm() {
  const decisionMakerSignature = useRef<SignatureCanvas | null>(null);
  const physicianSignature = useRef<SignatureCanvas | null>(null);

  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });

  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    "decisionMaker" | "physician" | null
  >(null);
  const [sigData, setSigData] = useState<{
    [key: string]: { image: string; name: string };
  }>({});

  const getRefByType = (type: string | null) => {
    if (type === "decisionMaker") return decisionMakerSignature;
    if (type === "physician") return physicianSignature;
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

      setSigData((prev) => ({
        ...prev,
        [activeSig!]: {
          image: dataUrl,
          name: prev[activeSig!]?.name || "",
        },
      }));

      setActiveSig(null);
    }
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
      (ref.current as any).fromDataURL(dataUrl.image);
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
        ADVANCE DIRECTIVES ON LEVEL OF CARE
      </h1>

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h1 className="text-xl font-bold mb-6">
          Transcare Emergency Medical Services - Advance Directives on Level of
          Care
        </h1>
        <h3 className="font-bold text-lg mb-3p-1">
          PATIENT GENERAL INFORMATION
        </h3>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-4">
            <label className=" font-medium">First</label>

            <Input type="text" className="w-full" />
          </div>
          <div className="col-span-4">
            <label className=" font-medium">Middle</label>

            <Input type="text" className="w-full" />
          </div>
          <div className="col-span-4">
            <label className=" font-medium">Last</label>

            <Input type="text" className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-2">
            <label className=" font-medium">Age</label>
            <Input type="text" className="w-full" />
          </div>
          <div className="col-span-2">
            <label className=" font-medium">Sex</label>
            <Input type="text" className="w-full" />
          </div>
          <div className="col-span-4">
            <label className=" font-medium">Birthdate(mm/dd/yyyy):</label>
            <Input type="date" className="w-full" />
          </div>
          <div className="col-span-4">
            <label className=" font-medium">Citizenship</label>
            <Input type="text" className="w-full" />
          </div>{" "}
        </div>

        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="col-span-4">
            <label className=" font-medium">Address</label>
            <Input type="text" className="w-full" />
          </div>
          <div className="col-span-4">
            <label className=" font-medium">Contact No.</label>
            <Input type="text" className="w-full" />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm mb-3 p-1">
          NEXT OF KIN/LEGAL GUARDIAN INFORMATION
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Name</label>
              <Input type="text" className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Relation</label>
                <Input type="text" className="w-full" />
              </div>
              <div>
                <label className="font-medium">Contact No.</label>
                <Input type="text" className="w-full" />
              </div>
            </div>
            <div>
              <label className="font-medium">Address</label>
              <Input type="text" className="w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium">Medical Record #.</label>
              <Input type="text" className="w-full" />
            </div>
            <div>
              <label className="font-medium">Date Accomplished</label>
              <Input type="date" className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Medical Record #</label>
          <Input type="text" name="medicalRecord" className="w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Date Accomplished</label>
          <Input type="date" name="dateAccomplished" className="w-full" />
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-4">PREFERRED LEVEL OF CARE</h2>

        <div className="mb-4">
          <h3 className="font-bold">CARDIOPULMONARY RESUSCITATION</h3>
          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" name="attemptCPR" />
            ATTEMPT RESUSCITATION / CPR
          </label>
          <p className="text-sm mt-2">
            May be done if a person has no pulse and is not breathing to prolong
            the life of the patient...
          </p>
        </div>

        <div>
          <h3 className="font-bold">MEDICAL INTERVENTION</h3>
          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" name="comfortOnly" />
            COMFORT MEASURES ONLY
          </label>
          <p className="text-sm mt-1">Relieve pain and suffering...</p>

          <div className="mt-4">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                name="limitedIntervention"
              />
              LIMITED ADDITIONAL INTERVENTIONS
            </label>
            <p className="text-sm">In addition to Comfort Measures Only...</p>

            <div className="grid grid-cols-2 gap-2 mt-2 pl-4">
              {[
                "IV Fluid therapy",
                "Nasogastric tube feeding",
                "O2 therapy",
                "Use of CPAP/BiPAP",
                "Antibiotics therapy",
                "Diagnostics work up",
              ].map((text, idx) => (
                <label key={idx} className="flex items-center">
                  <input type="checkbox" className="mr-2" /> {text}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center mt-4">
            <input type="checkbox" className="mr-2" name="fullTreatment" />
            FULL TREATMENT
          </label>
          <p className="text-sm mt-1">
            Includes intubation, mechanical ventilation, etc.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">ADDITIONAL ORDERS</h2>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
          name="additionalOrders"
        ></textarea>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          INFORMATION DISCUSSED WITH:
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" name="withPatient" />
            Patient (has capacity for decision-making)
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" name="withKin" />
            Next of kin or legally recognized decision-maker
          </label>
        </div>
      </div>

  
      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          DECISION-MAKER VERIFICATION
        </h2>

        <div className="flex gap-6">
          <div className="w-1/2 space-y-2">
            <label className="block text-sm font-medium mb-2">
              Decision Maker Signature
            </label>
            <div
              className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[170px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveSig("decisionMaker")}
            >
              {sigData["decisionMaker"]?.image ? (
                <img
                  src={sigData["decisionMaker"].image}
                  alt="Decision Maker signature"
                  className="max-h-[100px]"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm mt-1">Click to add signature</span>
                </div>
              )}
            </div>
            <label className="text-xs text-gray-600">
              Signature over printed Name
            </label>
          </div>

          <div className="w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input type="text" name="decisionMakerName" className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Relation</label>
              <Input
                type="text"
                name="decisionMakerRelation"
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input type="date" name="decisionMakerDate" className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-2">PHYSICIAN VERIFICATION</h2>

        <div className="flex gap-6">
          <div className="w-1/2 space-y-2">
            <label className="block text-sm font-medium mb-2">
              Physician Signature
            </label>
            <div
              className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[170px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveSig("physician")}
            >
              {sigData["physician"]?.image ? (
                <img
                  src={sigData["physician"].image}
                  alt="Physician signature"
                  className="max-h-[100px]"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm mt-1">Click to add signature</span>
                </div>
              )}
            </div>
            <label className="text-xs text-gray-600">
              Signature over printed Name
            </label>
          </div>

          <div className="w-1/2 grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input type="text" name="physicianName" className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">
                PRC License Number
              </label>
              <Input type="text" name="physicianLicense" className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input type="date" name="physicianDate" className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root
        open={!!activeSig}
        onOpenChange={(open) => !open && setActiveSig(null)}
      >
        <Dialog.Portal>
          <Dialog.Title>
            <VisuallyHidden>
              {activeSig === "decisionMaker"
                ? "Decision Maker Signature"
                : "Physician Signature"}
            </VisuallyHidden>
          </Dialog.Title>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[1000px] h-[800px] flex flex-col relative">
              <Dialog.Close asChild>
                <button className="absolute right-6 text-gray-700 hover:text-black">
                  <X className="w-8 h-8" />
                </button>
              </Dialog.Close>

              <div ref={modalCanvasRef} className="flex-1 overflow-hidden">
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
                  <Button type="button" size="sm" variant="secondary">
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
  );
}
