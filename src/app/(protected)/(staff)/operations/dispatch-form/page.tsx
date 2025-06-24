"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DispatchForm() {
  return (
    <div className="p-10 w-full">
      <h1 className="text-xl font-bold mb-6">
        Transcare Emergency Medical Services - Operation Dispatch Form
      </h1>

      <div className="mb-10 border rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">Event Title</label>
            <Input type="text" className="h-10 text-base" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Event Type</label>
            <select className="w-full h-10 text-base border rounded px-2 ">
              {["PAID", "CHARITY", "BILLING", "DISCOUNTED"].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">
              Event Owner (Contact Person)
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Details</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
          <div>
            <label className="block mb-1 font-medium">
              Event Organizer (Third Party)
            </label>
            <Input type="text" className="h-10 text-base" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Details</label>
            <Input type="text" className="h-10 text-base" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["REG", "HMO", "P/N", "InHOUSE"].map((type) => (
                <option key={type} value={type} className="text-gray-700">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">TARE</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["REG", "SCD", "PWD", "CR"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Billing</label>
            <select className="w-full h-10 text-base border rounded px-2">
              {["DRP", "P/N", "BILLED", "CSR/P", "CSR/WP"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-700">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {[
            "Gross",
            "Discount",
            "Payables",
            "VAT",
            "Vatables",
            "ZeroVAT",
            "Withholding",
          ].map((field, i) => (
            <div key={i}>
              <label className="block mb-1 font-medium">{field}</label>
              <Input type="text" className="h-10 text-base" />
            </div>
          ))}

          <div className="col-span-1 md:col-span-3">
            <label className="block mb-1 font-medium">Remarks</label>
            <Textarea className="w-full h-24 text-base" />
          </div>
        </div>
      </div>
    </div>
  );
}
