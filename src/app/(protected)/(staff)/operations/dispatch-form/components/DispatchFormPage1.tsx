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

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Title</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Type</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
              {["PAID", "CHARITY", "BILLING", "DISCOUNTED"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Owner</label>
            <Input type="text" className="h-10 text-base" />
            <label className="block font-medium mt-2 mb-1">
              Contact Details
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Organizer</label>
            <Input type="text" className="h-10 text-base" />
            <label className="block font-medium mt-2 mb-1">
              Contact Details
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        {/* Event Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Date and Time</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Duration</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Events Call Time</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">Estimated Crowd</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        {/* Event Venue and Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Venue</label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">Type of Events</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
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
                <option key={type} className="bg-gray-950">
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Venue Type</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
              {["Indoor", "Outdoor"].map((type) => (
                <option key={type} className="bg-gray-950">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">
              Brief Concept Description
            </label>
            <Textarea rows={4} className="text-base" />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Expected VIP / Guest
            </label>
            <Textarea rows={4} className="text-base" />
          </div>
        </div>

        <h2 className="text-lg font-semibold">Crowd Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Access", "Security", "Risk"].map((category) => (
            <div key={category}>
              <label className="block font-medium mb-1">{category}</label>
              <select
                className="w-full h-10 border rounded px-2 text-base"
                style={{ backgroundColor: "#0a0a0a", color: "white" }}
              >
                {getCrowdOptions(category).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="block font-medium mb-1">Others</label>
            <Input
              type="text"
              placeholder="Specify"
              className="h-10 text-base"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold">Crowd Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Economic Class</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
              {["A", "B", "C", "D", "E", "MIXED", "OTHERS"].map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Crowd Type</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
              {[
                "3-7",
                "7-12",
                "12-18",
                "18-45",
                "45-60",
                "60-Above",
                "ALL AGES",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Venue Safety Equipment
          </label>
          <select
            className="w-full h-10 border rounded px-2 text-base"
            style={{ backgroundColor: "#0a0a0a", color: "white" }}
          >
            {["Extinguisher", "First Aid Kit", "Fire Hose", "SCBA", "AED"].map(
              (item) => (
                <option key={item}>{item}</option>
              )
            )}
          </select>
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
  };
  return options[category] || [];
}
