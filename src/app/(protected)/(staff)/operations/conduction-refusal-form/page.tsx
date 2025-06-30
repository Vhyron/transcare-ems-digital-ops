"use client";

import { Input } from "@/components/ui/input";

export default function ConductionRefusalForm() {
  return (
    <div className="p-10 w-full">
      {/* Header
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold ">TRANSCARE</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">TRANSCARE EMERGENCY MEDICAL SERVICES</h1>
            <h2 className="text-base font-semibold">CONDUCTION REFUSAL FORM (RF-01)</h2>
          </div>
          <div className="text-right text-sm">
            <div>Form: 100-4</div>
            <div>Rev: 1.0</div>
            <div>Series: June 2015</div>
          </div>
        </div>
      </div> */}

      {/* Patient's General Information */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h1 className="text-xl font-bold mb-6">
          Transcare Emergency Medical Services - Conduction Refusal Form
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

        <div className="mb-2">
          <label className=" font-medium">Address</label>
          <Input type="text" className="w-full" />
        </div>
      </div>

      {/* Next of Kin/Legal Guardian Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded-lg p-6 shadow-sm space-y-8">
          <h3 className="font-bold text-sm mb-3 p-1">
            NEXT OF KIN/LEGAL GUARDIAN INFORMATION
          </h3>

          <div className="mb-2">
            <label className=" font-medium">Name</label>
            <Input type="text" className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className=" font-medium">Relation</label>
              <Input type="text" className="w-full" />
            </div>
            <div>
              <label className=" font-medium">Contact No.</label>
              <Input type="text" className="w-full" />
            </div>
          </div>

          <div>
            <label className=" font-medium">Address</label>
            <Input type="text" className="w-full" />
          </div>
        </div>

        <div className="border-2 p-4">
          <h3 className="font-bold text-sm mb-3 p-1">MEDICAL RECORD #</h3>
          <Input type="text" className="w-full" />

          <h3 className="font-bold text-sm mb-3 p-1">DATE ACCOMPLISHED</h3>
          <Input type="text" className="w-full" />
        </div>
      </div>

      {/* Assessment Questions */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <div className="grid grid-cols-12 gap-1  mb-2">
          <div className="col-span-2 text-center font-bold">BP:</div>
          <div className="col-span-2 text-center font-bold">PULSE:</div>
          <div className="col-span-2 text-center font-bold">RESP:</div>
          <div className="col-span-2 text-center font-bold">SKIN:</div>
          <div className="col-span-2 text-center font-bold">PUPILS:</div>
          <div className="col-span-2 text-center font-bold">LOC:</div>
        </div>

        <div className="grid grid-cols-12 gap-1 mb-4">
          <div className="col-span-2 border-b h-6"></div>
          <div className="col-span-2 border-b h-6"></div>
          <div className="col-span-2 border-b h-6"></div>
          <div className="col-span-2 border-b h-6"></div>
          <div className="col-span-2 border-b h-6"></div>
          <div className="col-span-2 border-b h-6"></div>
        </div>

        <div className=" space-y-1">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">1.</div>
            <div className="col-span-7">
              Oriented to person, place and time?
            </div>
            <div className="col-span-2 text-center">
              <span className="inline-block w-8 border mr-2">YES</span>
              <span className="inline-block w-8 border">NO</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">2.</div>
            <div className="col-span-7">Coherent speech?</div>
            <div className="col-span-2 text-center">
              <span className="inline-block w-8 border mr-2">YES</span>
              <span className="inline-block w-8 border">NO</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">3.</div>
            <div className="col-span-7">
              Auditory and/or visual hallucinations?
            </div>
            <div className="col-span-2 text-center">
              <span className="inline-block w-8 border mr-2">YES</span>
              <span className="inline-block w-8 border">NO</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">4.</div>
            <div className="col-span-7">
              Suicidal and/or homicidal ideation?
            </div>
            <div className="col-span-2 text-center">
              <span className="inline-block w-8 border mr-2">YES</span>
              <span className="inline-block w-8 border">NO</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">5.</div>
            <div className="col-span-7">
              Able to repeat understanding of their condition and consequences
              of treatment refusal?
            </div>
            <div className="col-span-2 text-center">
              <span className="inline-block w-8 border mr-2">YES</span>
              <span className="inline-block w-8 border">NO</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className=" font-bold mb-2">
            Narrative: Describe reasonable alternatives to treatment that were
            offered, the circumstances of the call, specific consequences of
            refusal:
          </div>
          <div className="border h-20 p-2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <div className=" mb-4">
          <p className="mb-2">
            It is sometimes impossible to recognize actual or potential medical
            problems outside the hospital, that we strongly encourage you to be
            evaluated, treated as necessary, and transported to the nearest
            hospital by EMS personnel for a more complete examination by a
            physician.
          </p>

          <p className="mb-2">
            You have the right to choose not to be evaluated, treated or
            transported if desired; however, there is a possibility that you
            could suffer serious complications or even death from conditions
            that are not apparent at this time. By signing below, you are
            acknowledging that the EMS personnel have already advised you and
            that you understand the potential harm to your health that may
            result from your refusal of the recommended care, and you release
            TEMS from any liability.
          </p>
        </div>

        <div className="text-center font-bold text-sm mb-4 p-1">
          PLEASE CHECK THE FOLLOWING THAT APPLY:
        </div>

        <div className=" space-y-2 mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />I refused to be treated
            and transported.
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />I refused to be treated
            but willing to be transported to a medical facility and/ or seen by
            a physician.
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />I would like to be treated
            and refused to be transported.
          </label>
        </div>

        <div className="text-center font-bold text-sm mb-4">
          WITNESSED TREATMENT:
        </div>

        <div className=" mb-4">
          <p>
            I observed the above named person; review and signed the statement
            above. The person was alert and did not appear confused. The person
            appeared to understand the statement and did not state otherwise.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 ">
          <div>
            <div className="mb-2">
              <span>Witness Signature:</span>
              <div className="border-b h-6 inline-block w-48 ml-2"></div>
            </div>
            <div>
              <span>Date:</span>
              <div className="border-b h-6 inline-block w-32 ml-2"></div>
            </div>
          </div>
          <div>
            <div>
              <span>Print Name:</span>
              <div className="border-b h-6 inline-block w-48 ml-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
