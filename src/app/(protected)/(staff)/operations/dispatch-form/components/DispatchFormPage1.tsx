"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DispatchFormData } from "@/hooks/dispatch-form";
import { dispatchApi } from "@/lib/dispatchApi";

interface DispatchFormPage1Props {
  formId?: string;
  onFormSaved?: (formId: string) => void;
  onDataChange?: (data: Partial<DispatchFormData>) => void;
  formData: DispatchFormData;
  updateFormData: (updates: Partial<DispatchFormData>) => void;
  isLoading: boolean;
}

export default function DispatchFormPage1({
  formId,
  onFormSaved,
  onDataChange,
}: DispatchFormPage1Props) {
  const initialFormData: Partial<DispatchFormData> = {
    crowd_access: "",
    crowd_security: "",
    crowd_risk: "",
    crowd_others: "",
  };
  const [formData, setFormData] =
    useState<Partial<DispatchFormData>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const loadFormData = async () => {
    if (!formId) return;

    setIsLoading(true);
    try {
      const result = await dispatchApi.getDispatchForm(formId);
      if (result.success) {
        setFormData(result.data);
      } else {
        toast.error("Failed to load form data");
      }
    } catch (error) {
      console.error("Error loading form:", error);
      toast.error("Error loading form data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DispatchFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let result;
      if (formId) {
        result = await dispatchApi.updateDispatchForm(formId, formData);
      } else {
        result = await dispatchApi.createDispatchForm(formData);
      }

      if (result.success) {
        toast.success("Form saved successfully!");
        onFormSaved?.(result.data.id);
      } else {
        toast.error("Failed to save form");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Error saving form");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 w-full flex justify-center items-center">
        <div className="text-lg">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="p-10 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          Transcare Emergency Medical Services - Operation Dispatch Form 1
        </h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Form"}
        </Button>
      </div>

      <div className="border rounded-lg p-6 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Title</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_title || ""}
              onChange={(e) => handleInputChange("event_title", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Type</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
              value={formData.event_type || ""}
              onChange={(e) => handleInputChange("event_type", e.target.value)}
            >
              <option value="">Select Event Type</option>
              {["PAID", "CHARITY", "BILLING", "DISCOUNTED"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Owner</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_owner || ""}
              onChange={(e) => handleInputChange("event_owner", e.target.value)}
            />
            <label className="block font-medium mt-2 mb-1">
              Contact Details
            </label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_owner_contact || ""}
              onChange={(e) =>
                handleInputChange("event_owner_contact", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Organizer</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_organizer || ""}
              onChange={(e) =>
                handleInputChange("event_organizer", e.target.value)
              }
            />
            <label className="block font-medium mt-2 mb-1">
              Contact Details
            </label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_organizer_contact || ""}
              onChange={(e) =>
                handleInputChange("event_organizer_contact", e.target.value)
              }
            />
          </div>
        </div>

        {/* Event Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Date and Time</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_date_time || ""}
              onChange={(e) =>
                handleInputChange("event_date_time", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Duration</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_duration || ""}
              onChange={(e) =>
                handleInputChange("event_duration", e.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Events Call Time</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_call_time || ""}
              onChange={(e) =>
                handleInputChange("event_call_time", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Estimated Crowd</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.estimated_crowd || ""}
              onChange={(e) =>
                handleInputChange("estimated_crowd", e.target.value)
              }
            />
          </div>
        </div>

        {/* Event Venue and Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-1">Event Venue</label>
            <Input
              type="text"
              className="h-10 text-base"
              value={formData.event_venue || ""}
              onChange={(e) => handleInputChange("event_venue", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Type of Events</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
              value={formData.type_of_events || ""}
              onChange={(e) =>
                handleInputChange("type_of_events", e.target.value)
              }
            >
              <option value="">Select Event Type</option>
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
                <option key={type} value={type} className="bg-gray-950">
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
              value={formData.venue_type || ""}
              onChange={(e) => handleInputChange("venue_type", e.target.value)}
            >
              <option value="">Select Venue Type</option>
              {["Indoor", "Outdoor"].map((type) => (
                <option key={type} value={type} className="bg-gray-950">
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
            <Textarea
              rows={4}
              className="text-base"
              value={formData.brief_concept_description || ""}
              onChange={(e) =>
                handleInputChange("brief_concept_description", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Expected VIP / Guest
            </label>
            <Textarea
              rows={4}
              className="text-base"
              value={formData.expected_vip_guest || ""}
              onChange={(e) =>
                handleInputChange("expected_vip_guest", e.target.value)
              }
            />
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
                value={
                  (formData[
                    `crowd_${category.toLowerCase()}` as keyof DispatchFormData
                  ] as string) || ""
                }
                onChange={(e) =>
                  handleInputChange(
                    `crowd_${category.toLowerCase()}` as keyof DispatchFormData,
                    e.target.value
                  )
                }
              >
                <option value="">Select {category}</option>
                {getCrowdOptions(category).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
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
              value={formData.crowd_others || ""}
              onChange={(e) =>
                handleInputChange("crowd_others", e.target.value)
              }
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
              value={formData.economic_class || ""}
              onChange={(e) =>
                handleInputChange("economic_class", e.target.value)
              }
            >
              <option value="">Select Economic Class</option>
              {["A", "B", "C", "D", "E", "MIXED", "OTHERS"].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Crowd Type</label>
            <select
              className="w-full h-10 border rounded px-2 text-base"
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
              value={formData.crowd_type || ""}
              onChange={(e) => handleInputChange("crowd_type", e.target.value)}
            >
              <option value="">Select Crowd Type</option>
              {[
                "3-7",
                "7-12",
                "12-18",
                "18-45",
                "45-60",
                "60-Above",
                "ALL AGES",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
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
            value={formData.venue_safety_equipment || ""}
            onChange={(e) =>
              handleInputChange("venue_safety_equipment", e.target.value)
            }
          >
            <option value="">Select Safety Equipment</option>
            {["Extinguisher", "First Aid Kit", "Fire Hose", "SCBA", "AED"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
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
