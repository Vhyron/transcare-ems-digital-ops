"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";

// Updated form data structure to match the advance directive form
interface AdvanceDirectivesFormData {
  patient: {
    firstName: string;
    middleName: string;
    lastName: string;
    age: string;
    sex: string;
    birthdate: string;
    citizenship: string;
    address: string;
    contactNo: string;
  };
  nextOfKin: {
    name: string;
    relation: string;
    contactNo: string;
    address: string;
  };
  medicalRecord: {
    recordNumber: string;
    dateAccomplished: string;
  };
  carePreferences: {
    attemptCPR: boolean;
    comfortOnly: boolean;
    limitedIntervention: boolean;
    limitedInterventionOptions: {
      ivFluid: boolean;
      ngTube: boolean;
      o2Therapy: boolean;
      cpapBipap: boolean;
      antibiotics: boolean;
      diagnostics: boolean;
    };
    fullTreatment: boolean;
  };
  additionalOrders: string;
  discussedWith: {
    withPatient: boolean;
    withKin: boolean;
  };
  decisionMaker: {
    name: string;
    relation: string;
    dateSigned: string;
    signature: string | null;
  };
  physician: {
    name: string;
    prcLicenseNumber: string;
    dateSigned: string;
    signature: string | null;
  };
}

const initialFormState: AdvanceDirectivesFormData = {
  patient: {
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    sex: "",
    birthdate: "",
    citizenship: "",
    address: "",
    contactNo: "",
  },
  nextOfKin: {
    name: "",
    relation: "",
    contactNo: "",
    address: "",
  },
  medicalRecord: {
    recordNumber: "",
    dateAccomplished: "",
  },
  carePreferences: {
    attemptCPR: false,
    comfortOnly: false,
    limitedIntervention: false,
    limitedInterventionOptions: {
      ivFluid: false,
      ngTube: false,
      o2Therapy: false,
      cpapBipap: false,
      antibiotics: false,
      diagnostics: false,
    },
    fullTreatment: false,
  },
  additionalOrders: "",
  discussedWith: {
    withPatient: false,
    withKin: false,
  },
  decisionMaker: {
    name: "",
    relation: "",
    dateSigned: "",
    signature: null,
  },
  physician: {
    name: "",
    prcLicenseNumber: "",
    dateSigned: "",
    signature: null,
  },
};

const advanceDirectiveFormAPI = {
  async submitForm(formData: AdvanceDirectivesFormData) {
    try {
      console.log("Submitting form data:", formData);

      const response = await fetch("/api/advance-directives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("API Response Error:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });

        throw new Error(
          responseData.message || responseData.error || "Failed to submit form"
        );
      }

      console.log("Form submitted successfully:", responseData);
      return responseData;
    } catch (error) {
      console.error("API Error:", error);

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Form submission failed: ${error.message}`);
      } else {
        throw new Error("Form submission failed: Unknown error");
      }
    }
  },
};

export default function AdvanceDirectivesForm() {
  const [formData, setFormData] =
    useState<AdvanceDirectivesFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const updateFormData = (updates: Partial<AdvanceDirectivesFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateNestedFormData = <T extends keyof AdvanceDirectivesFormData>(
    section: T,
    updates: Partial<AdvanceDirectivesFormData[T]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(typeof prev[section] === "object" && prev[section] !== null
          ? prev[section]
          : {}),
        ...updates,
      },
    }));
  };

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

      if (activeSig === "decisionMaker") {
        updateNestedFormData("decisionMaker", { signature: dataUrl });
      } else if (activeSig === "physician") {
        updateNestedFormData("physician", { signature: dataUrl });
      }

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
    if (modalCanvasRef.current) {
      const width = modalCanvasRef.current.offsetWidth;
      const height = 750;
      setSigCanvasSize({ width, height });
    }
  }, [activeSig]);

  type LimitedInterventionKey =
    keyof AdvanceDirectivesFormData["carePreferences"]["limitedInterventionOptions"];

  const limitedOptions: { key: LimitedInterventionKey; label: string }[] = [
    { key: "ivFluid", label: "IV Fluid therapy" },
    { key: "ngTube", label: "Nasogastric tube feeding" },
    { key: "o2Therapy", label: "O2 therapy" },
    { key: "cpapBipap", label: "Use of CPAP/BiPAP" },
    { key: "antibiotics", label: "Antibiotics therapy" },
    { key: "diagnostics", label: "Diagnostics work up" },
  ];

  const resetForm = () => {
    setFormData(initialFormState);
  };

  // Updated handleSubmit function with better error handling
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Basic validation
      if (!formData.patient.firstName || !formData.patient.lastName) {
        throw new Error("Patient first name and last name are required");
      }

      console.log("Form data before submission:", formData);

      const result = await advanceDirectiveFormAPI.submitForm(formData);

      console.log("Submission result:", result);
      alert("Form submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);

      let errorMessage = "Failed to submit form";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h3 className="font-bold text-lg mb-3 p-1">
          PATIENT GENERAL INFORMATION
        </h3>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">First</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.firstName}
              onChange={(e) =>
                updateNestedFormData("patient", { firstName: e.target.value })
              }
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Middle</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.middleName}
              onChange={(e) =>
                updateNestedFormData("patient", { middleName: e.target.value })
              }
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Last</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.lastName}
              onChange={(e) =>
                updateNestedFormData("patient", { lastName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-2">
            <label className="font-medium">Age</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.age}
              onChange={(e) =>
                updateNestedFormData("patient", { age: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="font-medium">Sex</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.sex}
              onChange={(e) =>
                updateNestedFormData("patient", { sex: e.target.value })
              }
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Birthdate(mm/dd/yyyy):</label>
            <Input
              type="date"
              className="w-full"
              value={formData.patient.birthdate}
              onChange={(e) =>
                updateNestedFormData("patient", { birthdate: e.target.value })
              }
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Citizenship</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.citizenship}
              onChange={(e) =>
                updateNestedFormData("patient", { citizenship: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="col-span-4">
            <label className="font-medium">Address</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.address}
              onChange={(e) =>
                updateNestedFormData("patient", { address: e.target.value })
              }
            />
          </div>
          <div className="col-span-4">
            <label className="font-medium">Contact No.</label>
            <Input
              type="text"
              className="w-full"
              value={formData.patient.contactNo}
              onChange={(e) =>
                updateNestedFormData("patient", { contactNo: e.target.value })
              }
            />
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
              <Input
                type="text"
                className="w-full"
                value={formData.nextOfKin.name}
                onChange={(e) =>
                  updateNestedFormData("nextOfKin", { name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Relation</label>
                <Input
                  type="text"
                  className="w-full"
                  value={formData.nextOfKin.relation}
                  onChange={(e) =>
                    updateNestedFormData("nextOfKin", {
                      relation: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="font-medium">Contact No.</label>
                <Input
                  type="text"
                  className="w-full"
                  value={formData.nextOfKin.contactNo}
                  onChange={(e) =>
                    updateNestedFormData("nextOfKin", {
                      contactNo: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="font-medium">Address</label>
              <Input
                type="text"
                className="w-full"
                value={formData.nextOfKin.address}
                onChange={(e) =>
                  updateNestedFormData("nextOfKin", { address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium">Medical Record</label>
              <Input
                type="text"
                className="w-full"
                value={formData.medicalRecord.recordNumber}
                onChange={(e) =>
                  updateNestedFormData("medicalRecord", {
                    recordNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="font-medium">Date Accomplished</label>
              <Input
                type="date"
                className="w-full"
                value={formData.medicalRecord.dateAccomplished}
                onChange={(e) =>
                  updateNestedFormData("medicalRecord", {
                    dateAccomplished: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-4">PREFERRED LEVEL OF CARE</h2>

        {/* CPR */}
        <div className="mb-4">
          <h3 className="font-bold">CARDIOPULMONARY RESUSCITATION</h3>
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.carePreferences.attemptCPR}
              onChange={(e) =>
                updateNestedFormData("carePreferences", {
                  attemptCPR: e.target.checked,
                })
              }
            />
            ATTEMPT RESUSCITATION / CPR
          </label>
          <p className="text-sm mt-2">
            May be done if a person has no pulse and is not breathing...
          </p>
        </div>

        {/* Medical Intervention */}
        <div>
          <h3 className="font-bold">MEDICAL INTERVENTION</h3>

          {/* Comfort Measures */}
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.carePreferences.comfortOnly}
              onChange={(e) =>
                updateNestedFormData("carePreferences", {
                  comfortOnly: e.target.checked,
                })
              }
            />
            COMFORT MEASURES ONLY
          </label>
          <p className="text-sm mt-1">Relieve pain and suffering...</p>

          {/* Limited Interventions */}
          <div className="mt-4">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.carePreferences.limitedIntervention}
                onChange={(e) =>
                  updateNestedFormData("carePreferences", {
                    limitedIntervention: e.target.checked,
                  })
                }
              />
              LIMITED ADDITIONAL INTERVENTIONS
            </label>
            <p className="text-sm">In addition to Comfort Measures Only...</p>

            {/* Sub-options */}
            <div className="grid grid-cols-2 gap-2 mt-2 pl-4">
              {limitedOptions.map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={
                      formData.carePreferences.limitedInterventionOptions[key]
                    }
                    onChange={(e) =>
                      updateNestedFormData("carePreferences", {
                        limitedInterventionOptions: {
                          ...formData.carePreferences
                            .limitedInterventionOptions,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.carePreferences.fullTreatment}
              onChange={(e) =>
                updateNestedFormData("carePreferences", {
                  fullTreatment: e.target.checked,
                })
              }
            />
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
          value={formData.additionalOrders}
          onChange={(e) => updateFormData({ additionalOrders: e.target.value })}
        />
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          INFORMATION DISCUSSED WITH:
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.discussedWith.withPatient}
              onChange={(e) =>
                updateNestedFormData("discussedWith", {
                  withPatient: e.target.checked,
                })
              }
            />
            Patient (has capacity for decision-making)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.discussedWith.withKin}
              onChange={(e) =>
                updateNestedFormData("discussedWith", {
                  withKin: e.target.checked,
                })
              }
            />
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
              {formData.decisionMaker.signature ? (
                <img
                  src={formData.decisionMaker.signature}
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
              <Input
                type="text"
                className="w-full"
                value={formData.decisionMaker.name}
                onChange={(e) =>
                  updateNestedFormData("decisionMaker", {
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Relation</label>
              <Input
                type="text"
                className="w-full"
                value={formData.decisionMaker.relation}
                onChange={(e) =>
                  updateNestedFormData("decisionMaker", {
                    relation: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input
                type="date"
                className="w-full"
                value={formData.decisionMaker.dateSigned}
                onChange={(e) =>
                  updateNestedFormData("decisionMaker", {
                    dateSigned: e.target.value,
                  })
                }
              />
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
              {formData.physician.signature ? (
                <img
                  src={formData.physician.signature}
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
              <Input
                type="text"
                className="w-full"
                value={formData.physician.name}
                onChange={(e) =>
                  updateNestedFormData("physician", { name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                PRC License Number
              </label>
              <Input
                type="text"
                className="w-full"
                value={formData.physician.prcLicenseNumber}
                onChange={(e) =>
                  updateNestedFormData("physician", {
                    prcLicenseNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Signed</label>
              <Input
                type="date"
                className="w-full"
                value={formData.physician.dateSigned}
                onChange={(e) =>
                  updateNestedFormData("physician", {
                    dateSigned: e.target.value,
                  })
                }
              />
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
                    className: "bg-gray-100 rounded shadow",
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

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Form"}
      </Button>
    </div>
  );
}
