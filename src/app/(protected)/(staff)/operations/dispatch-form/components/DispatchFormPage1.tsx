"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function DispatchFormPage1() {
  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        Transcare Emergency Medical Services - Operation Dispatch Form 1
      </h1>

      <div className="border rounded-lg p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Event Title</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Event Type</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["PAID", "CHARITY", "BILLING", "DISCOUNTED"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Event Owner</label>
            <Input type="text" className="h-10 text-base" />
            <label className="block mt-2 mb-1 font-medium">
              Contact Details
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Event Organizer</label>
            <Input type="text" className="h-10 text-base" />
            <label className="block mt-2 mb-1 font-medium">
              Contact Details
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Date and Time</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Event Duration</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Events Call Time</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Estimated Crowd</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-1 font-medium">Event Venue</label>
            <Input type="text" className="h-10 text-base" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Type of Events</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {[
                "Religious Gathering",
                "Exhibition/Trade Event",
                "Sport/Games Event",
                "Party",
                "Outbound",
                "Audition",
                "Festival",
                "Concert",
                "Show Taping",
                "Premier Night",
                "Others",
              ].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-center gap-10 align-center">
            <div className="flex items-center gap-4">
              <Checkbox id="indoor" className="w-8 h-8" />
              <label htmlFor="indoor" className="text-base font-medium">
                Indoor
              </label>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox id="outdoor" className="w-8 h-8" />
              <label htmlFor="outdoor" className="text-base font-medium">
                Outdoor
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">
              Brief Concept Description
            </label>
            <Textarea rows={4} className="text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Expected VIP / Guest
            </label>
            <Textarea rows={4} className="text-base" />
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Crowd Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Access", "Security", "Risk", "Others"].map((category) => (
            <div key={category}>
              <label className="block mb-1 font-medium">{category}</label>
              <select className="w-full h-10 text-base border rounded px-2">
                {getCrowdOptions(category).map((option) => (
                  <option key={option} className="text-gray-700">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
<h2 className="text-lg font-semibold mb-2">Crowd Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Economic Class</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["A", "B", "C", "D", "E", "MIXED", "OTHERS"].map((option) => (
                <option key={option} className="text-gray-700">
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Crowd Type</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {[
                "3-7",
                "7-12",
                "12-18",
                "18-45",
                "45-60",
                "60-Above",
                "ALL AGES",
              ].map((option) => (
                <option key={option} className="text-gray-700">
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">
              Venue Safety Equipment
            </label>
            <select className="w-full h-10 text-base border rounded px-2">
              {[
                "Extinguisher",
                "First Aid Kit",
                "Fire Hose",
                "SCBA",
                "AED",
              ].map((item) => (
                <option key={item} className="text-gray-700">
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCrowdOptions(category: string): string[] {
  const options: Record<string, string[]> = {
    Access: ["Free Ticket", "Paid Ticket", "Open", "Invitation", "Combination"],
    Security: ["Internal", "External", "Combination"],
    Risk: ["Low", "Medium", "High"],
    Others: ["Specify"],
  };
  return options[category] || [];
}
