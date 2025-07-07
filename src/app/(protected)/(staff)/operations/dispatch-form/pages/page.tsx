// pages/DispatchForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useDispatchForm } from "@/hooks/dispatch-form";
import DispatchFormPage1 from "../components/DispatchFormPage1";
import DispatchFormPage2 from "../components/DispatchFormPage2";
import DispatchFormPage3 from "../components/DispatchFormPage3";
import { Button } from "@/components/ui/button";
import { Save, Send, Trash2, AlertCircle, CheckCircle } from "lucide-react";

export default function DispatchForm() {
  const [page, setPage] = useState(1);
  const {
    formData,
    updateFormData,
    saveForm,
    loadForm,
    submitForm,
    deleteForm,
    isLoading,
    error,
    formId,
    setError,
  } = useDispatchForm();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  // Load form from URL params if ID is provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
      loadForm(id).catch(() => {
        showNotificationMessage("Failed to load form", "error");
      });
    }
  }, []);

  // Update current page in form data
  useEffect(() => {
    updateFormData({ current_page: page });
  }, [page]);

  const showNotificationMessage = (
    message: string,
    type: "success" | "error"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSave = async () => {
    try {
      await saveForm();
      showNotificationMessage("Form saved successfully!", "success");
    } catch {
      showNotificationMessage("Failed to save form", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      await submitForm();
      showNotificationMessage("Form submitted successfully!", "success");
    } catch  {
      showNotificationMessage("Failed to submit form", "error");
    }
  };

  const handleDelete = async () => {
    if (!formId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      try {
        await deleteForm();
        showNotificationMessage("Form deleted successfully!", "success");
      } catch {
        showNotificationMessage("Failed to delete form", "error");
      }
    }
  };

  const renderPage = () => {
    const pageProps = {
      formData,
      updateFormData,
      isLoading,
    };

    switch (page) {
      case 1:
        return <DispatchFormPage1 {...pageProps} />;
      case 2:
        return <DispatchFormPage2 {...pageProps} />;
      case 3:
        return <DispatchFormPage3 {...pageProps} />;
    }
  };

  return (
    <div className="p-6 w-full relative">
      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            notificationType === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {notificationType === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notificationMessage}
        </div>
      )}

      {/* Form Status Bar */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Form Status:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              formData.form_status === "submitted"
                ? "bg-green-100 text-green-800"
                : formData.form_status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {formData.form_status?.toUpperCase()}
          </span>
          {formId && (
            <span className="text-sm text-gray-600">
              ID: {formId.slice(0, 8)}...
            </span>
          )}
          {isLoading && (
            <span className="text-sm text-blue-600">Auto-saving...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || formData.form_status === "submitted"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>

          {formId && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <Button
            onClick={() => setError(null)}
            size="sm"
            variant="ghost"
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Form Content */}
      {renderPage()}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pr-6">
        <div className="text-sm text-gray-600">Page {page} of 3</div>

        <div className="flex items-center gap-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← Previous
          </Button>

          <span className="text-2xl font-semibold">{page}</span>

          <Button
            disabled={page === 3}
            onClick={() => setPage(page + 1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
