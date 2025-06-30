"use client";

import { Input } from "@/components/ui/input";

export default function AdvanceDirectivesForm() {
  return (
    <form className=" p-10 w-full">
      
      {/* Title */}
      <h1 className="text-xl font-bold mb-6">
        ADVANCE DIRECTIVES ON LEVEL OF CARE
      </h1>

      {/* Patient's General Information */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-4">
          PATIENT’S GENERAL INFORMATION
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Last Name</label>
            <Input
              type="text"
              name="lastName"
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">First Name</label>
            <Input
              type="text"
              name="firstName"
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Middlename</label>
            <Input
              type="text"
              name="middleName"
              className="w-full h-10 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">AGE</label>
            <Input name="age" type="text" className="w-full h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">SEX</label>
            <Input name="sex" type="text" className="w-full h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">
              BIRTHDAY (mm/dd/yyyy)
            </label>
            <Input
              name="birthday"
              type="text"
              className="w-full h-10 text-base"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">CITIZENSHIP</label>
            <Input
              name="citizenship"
              type="text"
              className="w-full h-10 text-base"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Address</label>
          <Input type="text" name="address" className="w-full" />
        </div>
        <div className="mt-4">
          <label className="block font-medium mb-1">Contact No.</label>
          <Input type="text" name="contactNo" className="w-full" />
        </div>
      </div>

      {/* Next of Kin / Legal Guardian */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-4">
          NEXT OF KIN / LEGAL GUARDIAN INFORMATION
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <Input type="text" name="kinName" className="w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Relation</label>
            <Input type="text" name="kinRelation" className="w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Contact No.</label>
            <Input type="text" name="kinContact" className="w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <Input type="text" name="kinAddress" className="w-full" />
          </div>
        </div>
      </div>

      {/* Medical Record and Date */}
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

      {/* Preferred Level of Care */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-4">PREFERRED LEVEL OF CARE</h2>

        {/* CPR */}
        <div className="mb-4">
          <h3 className="font-bold">CARDIOPULMONARY RESUSCITATION</h3>
          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" name="attemptCPR" />
            ATTEMPT RESUSCITATION / CPR
          </label>
          <p className="text-sm mt-2 ">
            May be done if a person has no pulse and is not breathing to prolong
            the life of the patient...
          </p>
        </div>

        {/* Medical Interventions */}
        <div>
          <h3 className="font-bold">MEDICAL INTERVENTION</h3>
          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" name="comfortOnly" />
            COMFORT MEASURES ONLY
          </label>
          <p className="text-sm  mt-1">
            Relieve pain and suffering...
          </p>

          <div className="mt-4">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                name="limitedIntervention"
              />
              LIMITED ADDITIONAL INTERVENTIONS
            </label>
            <p className="text-sm ">
              In addition to Comfort Measures Only...
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2 pl-4">
              {[
                "IV Fluid therapy",
                "Nasogastric tube feeding",
                "O2 therapy",
                "Use of CPAP/BiPAP",
                "Antibiotics therapy",
                "Diagnostics work up",
              ].map((text, idx) => (
                <label key={idx}>
                  <input type="checkbox" className="mr-2" /> {text}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center mt-4">
            <input type="checkbox" className="mr-2" name="fullTreatment" />
            FULL TREATMENT
          </label>
          <p className="text-sm  mt-1">
            Includes intubation, mechanical ventilation, etc.
          </p>
        </div>
      </div>

      {/* Additional Orders */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">ADDITIONAL ORDERS</h2>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
          name="additionalOrders"
        ></textarea>
      </div>

      {/* Information Discussed With */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-2">
          INFORMATION DISCUSSED WITH:
        </h2>
        <div className="flex flex-col gap-2">
          <label>
            <input type="checkbox" className="mr-2" name="withPatient" />
            Patient (has capacity for decision-making)
          </label>
          <label>
            <input type="checkbox" className="mr-2" name="withKin" />
            Next of kin or legally recognized decision-maker
          </label>
        </div>
      </div>

      {/* Decision-Maker Verification */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-2">
          DECISION-MAKER VERIFICATION
        </h2>
        <div className="grid grid-cols-3 gap-4">
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

      {/* Physician Verification */}
      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <h2 className="text-lg font-semibold mb-2">PHYSICIAN VERIFICATION</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <Input type="text" name="physicianName" className="w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">PRC License Number</label>
            <Input type="text" name="physicianLicense" className="w-full" />
          </div>
        </div>
      </div>
    </form>
  );
}
