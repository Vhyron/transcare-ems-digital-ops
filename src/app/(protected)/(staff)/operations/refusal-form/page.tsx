"use client";

import { Input } from "@/components/ui/input";

export default function RefusalTreatmentTransportationForm() {
  return (
    <div className="p-10 w-full">
  <h1 className="text-xl font-bold mb-6">
          Transcare Emergency Medical Services - Refusal Form
        </h1>
      {/* Event Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">League /Event:</label>
          <Input type="text" name="leagueEvent" className="w-full h-10 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TYPE:</label>
          <Input type="text" name="type" className="w-full h-10 text-base" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location:</label>
          <Input type="text" name="location" className="w-full h-10 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Incident #:</label>
          <Input type="text" name="incident" className="w-full h-10 text-base" />
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Patient Name:</label>
          <Input type="text" name="patientName" className="w-full h-10 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">DOB:</label>
          <Input type="text" name="dob" className="w-full h-10 text-base" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Age:</label>
        <Input type="text" name="age" className="w-full h-10 text-base" />
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Details - Landline:</label>
          <Input type="text" name="landline" className="w-full h-10 text-base" />
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
          <label className="flex items-center">
            <input type="checkbox" className="mr-1" name="guardianYes" />
            <span className="text-sm">YES</span>
          </label>
          <label className="flex items-center ml-4">
            <input type="checkbox" className="mr-1" name="guardianNo" />
            <span className="text-sm">NO</span>
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Landline:</label>
            <Input type="text" name="guardianLandline" className="w-full h-10 text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cell:</label>
            <Input type="text" name="guardianCell" className="w-full h-10 text-base" />
          </div>
        </div>
      </div>

      {/* Guardian Details */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name:</label>
          <Input type="text" name="guardianName" className="w-full h-10 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age:</label>
          <Input type="text" name="guardianAge" className="w-full h-10 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship:</label>
          <Input type="text" name="relationship" className="w-full h-10 text-base" />
        </div>
      </div>

      {/* Situation of Injury/Illness */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Situation of Injury/Illness:</label>
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
            <span className="text-sm">Patient refuses treatment; transport is not necessary for the situation;</span>
          </label>
          
          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">Patient refuses treatment and transport to a hospital against EMS advice;</span>
          </label>
          
          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">Patient receives treatment does not desire transport to hospital by ambulance;</span>
          </label>
          
          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">Patient / Guardian believes alternative transportation plan is reasonable;</span>
          </label>
          
          <label className="flex items-start">
            <input type="checkbox" className="mr-3 mt-1" />
            <span className="text-sm">Patient accepts transportation to hospital by EMS but refuses any or all treatment offered.</span>
          </label>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Specify treatment refused:</label>
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
            This form is being provided to me because I have refused assessment, treatment and/or transport by EMS 
            personnel myself or on behalf of this patient. I understand that EMS personnel are not physicians and are not 
            qualified or authorized to make a diagnosis and that their care is not a substitute for that of a physician.
          </p>
          
          <p>
            I recognize that there may be a serious injury or illness which could get worse without medical attention even 
            though I (or the patient) may feel fine at the present time. I understand that I may change my mind and call 911 
            or nearest community EMS available. If treatment or assistance is needed later, I also understand that treatment 
            is available at an emergency department 24 hours a day.
          </p>
        </div>
        
      </div>

      {/* Acknowledgment and Signature Section */}
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <div className="text-sm mb-6">
          <p>
            I acknowledge that this advice has been explained to me by the ambulance crew and upon affixing my signature 
            for myself or on behalf of the patient signing this form, I am releasing Transcare Emergency Medical Services 
            Management and employees and ________________________(Organizer) and 
            its employees of any liability or medical claims resulting from my decision to refuse care against medical advice
          </p>
        </div>

        {/* Signature Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Patient / Guardian</label>
              <div className="border-b-2 border-gray-400 h-12 mb-2"></div>
              <label className="text-xs text-gray-600">Signature over printed Name</label>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Events Organizer</label>
              <div className="border-b-2 border-gray-400 h-12 mb-2"></div>
              <label className="text-xs text-gray-600">Signature over printed Name</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Witness</label>
              <div className="border-b-2 border-gray-400 h-12 mb-2"></div>
              <label className="text-xs text-gray-600">Signature over printed Name</label>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Assign Medic Personnel</label>
              <div className="border-b-2 border-gray-400 h-12 mb-2"></div>
              <label className="text-xs text-gray-600">Signature over printed Name</label>
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
    </div>
  );
}