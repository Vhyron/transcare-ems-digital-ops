"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";

export default function RefusalTreatmentTransportationForm() {
  const patientGuardianSignature = useRef<SignatureCanvas | null>(null);
  const eventsOrganizerSignature = useRef<SignatureCanvas | null>(null);
  const witnessSignature = useRef<SignatureCanvas | null>(null);
  const medicPersonnelSignature = useRef<SignatureCanvas | null>(null);

  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });

  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    "patientGuardian" | "eventsOrganizer" | "witness" | "medicPersonnel" | null
  >(null);
  const [sigData, setSigData] = useState<{
    [key: string]: { image: string; name: string };
  }>({});

  const getRefByType = (type: string | null) => {
    if (type === "patientGuardian") return patientGuardianSignature;
    if (type === "eventsOrganizer") return eventsOrganizerSignature;
    if (type === "witness") return witnessSignature;
    if (type === "medicPersonnel") return medicPersonnelSignature;
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
      (ref.current as any).loadFromDataURL(dataUrl.image);
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
        Transcare Emergency Medical Services - Refusal Form
      </h1>

      {/* Event Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            League /Event:
          </label>
          <Input
            type="text"
            name="leagueEvent"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TYPE:</label>
          <Input type="text" name="type" className="w-full h-10 text-base" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location:</label>
          <Input
            type="text"
            name="location"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Incident #:</label>
          <Input
            type="text"
            name="incident"
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Patient Name:
          </label>
          <Input
            type="text"
            name="patientName"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">DOB:</label>
          <Input type="text" name="dob" className="w-full h-10 text-base" />
        </div>
        <div className="">
          <label className="block text-sm font-medium mb-1">Age:</label>
          <Input type="text" name="age" className="w-full h-10 text-base" />
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Details - Landline:
          </label>
          <Input
            type="text"
            name="landline"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cell:</label>
          <Input type="text" name="cell" className="w-full h-10 text-base" />
        </div>
      </div>

      {/* Guardian Information */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">GUARDIAN:</label>
          <select
            name="guardian"
            className=" border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-gray-700" value="yes">
              YES
            </option>
            <option className="text-gray-700" value="no">
              NO
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Landline:</label>
            <Input
              type="text"
              name="guardianLandline"
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cell:</label>
            <Input
              type="text"
              name="guardianCell"
              className="w-full h-10 text-base"
            />
          </div>
        </div>
      </div>

      {/* Guardian Details */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name:</label>
          <Input
            type="text"
            name="guardianName"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age:</label>
          <Input
            type="text"
            name="guardianAge"
            className="w-full h-10 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Relationship:
          </label>
          <Input
            type="text"
            name="relationship"
            className="w-full h-10 text-base"
          />
        </div>
      </div>

      {/* Situation of Injury/Illness */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Situation of Injury/Illness:
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
          name="situation"
        ></textarea>
      </div>

      {/* Check Applicable Refusal */}
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Check Applicable Refusal</h3>

        <div className="space-y-3">
          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">
              Patient refuses treatment; transport is not necessary for the
              situation;
            </span>
          </label>

          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">
              Patient refuses treatment and transport to a hospital against EMS
              advice;
            </span>
          </label>

          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">
              Patient receives treatment does not desire transport to hospital
              by ambulance;
            </span>
          </label>

          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">
              Patient / Guardian believes alternative transportation plan is
              reasonable;
            </span>
          </label>

          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">
              Patient accepts transportation to hospital by EMS but refuses any
              or all treatment offered.
            </span>
          </label>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Specify treatment refused:
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
              name="treatmentRefused"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Legal Text */}
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <div className="text-sm space-y-4">
          <p>
            This form is being provided to me because I have refused assessment,
            treatment and/or transport by EMS personnel myself or on behalf of
            this patient. I understand that EMS personnel are not physicians and
            are not qualified or authorized to make a diagnosis and that their
            care is not a substitute for that of a physician.
          </p>

          <p>
            I recognize that there may be a serious injury or illness which
            could get worse without medical attention even though I (or the
            patient) may feel fine at the present time. I understand that I may
            change my mind and call 911 or nearest community EMS available. If
            treatment or assistance is needed later, I also understand that
            treatment is available at an emergency department 24 hours a day.
          </p>
        </div>
      </div>

      {/* Acknowledgment and Signature Section */}
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <div className="text-sm mb-6">
          <p>
            I acknowledge that this advice has been explained to me by the
            ambulance crew and upon affixing my signature for myself or on
            behalf of the patient signing this form, I am releasing Transcare
            Emergency Medical Services Management and employees and{" "}
            <input
              type="text"
              className="border-b border-white outline-none px-1 w-48 inline-block"
            />{" "}
            and its employees of any liability or medical claims resulting from
            my decision to refuse care against medical advice.
          </p>
        </div>

        {/* Signature Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Patient/Guardian Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Patient / Guardian
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig("patientGuardian")}
              >
                {sigData["patientGuardian"]?.image ? (
                  <img
                    src={sigData["patientGuardian"].image}
                    alt="Patient/Guardian signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                className="w-full"
                value={sigData["patientGuardian"]?.name || ""}
                onChange={(e) => {
                  setSigData((prev) => ({
                    ...prev,
                    patientGuardian: {
                      ...prev.patientGuardian,
                      name: e.target.value,
                      image: prev.patientGuardian?.image || "",
                    },
                  }));
                }}
              />
            </div>
          </div>

          {/* Events Organizer Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Events Organizer
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig("eventsOrganizer")}
              >
                {sigData["eventsOrganizer"]?.image ? (
                  <img
                    src={sigData["eventsOrganizer"].image}
                    alt="Events Organizer signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                className="w-full"
                value={sigData["eventsOrganizer"]?.name || ""}
                onChange={(e) => {
                  setSigData((prev) => ({
                    ...prev,
                    eventsOrganizer: {
                      ...prev.eventsOrganizer,
                      name: e.target.value,
                      image: prev.eventsOrganizer?.image || "",
                    },
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Witness Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Witness</label>
              <div
                className=" bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig("witness")}
              >
                {sigData["witness"]?.image ? (
                  <img
                    src={sigData["witness"].image}
                    alt="Witness signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                className="w-full"
                value={sigData["witness"]?.name || ""}
                onChange={(e) => {
                  setSigData((prev) => ({
                    ...prev,
                    witness: {
                      ...prev.witness,
                      name: e.target.value,
                      image: prev.witness?.image || "",
                    },
                  }));
                }}
              />
            </div>
          </div>

          {/* Medic Personnel Signature */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Medic Personnel
              </label>
              <div
                className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveSig("medicPersonnel")}
              >
                {sigData["medicPersonnel"]?.image ? (
                  <img
                    src={sigData["medicPersonnel"].image}
                    alt="Medic Personnel signature"
                    className="max-h-[60px]"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <label className="text-xs text-gray-600">
                Signature over printed Name
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                className="w-full"
                value={sigData["medicPersonnel"]?.name || ""}
                onChange={(e) => {
                  setSigData((prev) => ({
                    ...prev,
                    medicPersonnel: {
                      ...prev.medicPersonnel,
                      name: e.target.value,
                      image: prev.medicPersonnel?.image || "",
                    },
                  }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PCR:</label>
            <Input type="text" name="pcr" className="w-full h-10 text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">DATE:</label>
            <Input type="date" name="date" className="w-full h-10 text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">TIME:</label>
            <Input type="time" name="time" className="w-full h-10 text-base" />
          </div>
        </div>
      </div>

      {/* Signature Modal */}
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
  );
}
