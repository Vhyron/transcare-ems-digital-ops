// lib/api/AdvanceDirective-form.ts

import {
  AdvanceDirectiveFormData,
  CreateAdvanceDirectiveFormRequest,
  AdvanceDirectiveFormResponse,
  UpdateAdvanceDirectiveFormRequest,
} from "@/types/advance-directive";

const BASE_URL = "/api/AdvanceDirective-form";

class AdvanceDirectiveFormAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Create a new AdvanceDirective form
  async createForm(
    data: CreateAdvanceDirectiveFormRequest
  ): Promise<AdvanceDirectiveFormResponse> {
    return this.request<AdvanceDirectiveFormResponse>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }


  // Update a AdvanceDirective form
  async updateForm(
    data: UpdateAdvanceDirectiveFormRequest
  ): Promise<AdvanceDirectiveFormResponse> {
    return this.request<AdvanceDirectiveFormResponse>(`/AdvanceDirective-forms/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete a AdvanceDirective form
  async deleteForm(id: string): Promise<AdvanceDirectiveFormResponse> {
    return this.request<AdvanceDirectiveFormResponse>(`/AdvanceDirective-forms/${id}`, {
      method: "DELETE",
    });
  }

  // Save form as draft
  async saveDraft(data: any): Promise<AdvanceDirectiveFormResponse> {
    const requestData = {
      formData: {
        ...data,
        status: "draft" as const,
      },
    };

    if ("id" in data) {
      return this.updateForm({ id: data.id, ...requestData });
    } else {
      return this.createForm(requestData);
    }
  }

  async submitForm(data: any): Promise<AdvanceDirectiveFormResponse> {
    const requestData = {
      formData: {
        ...data,
        status: "completed" as const,
      },
    };

    if ("id" in data) {
      return this.updateForm({ id: data.id, ...requestData });
    } else {
      return this.createForm(requestData);
    }
  }

  // Export form data (for PDF generation, etc.)
  async exportForm(id: string, format: "pdf" | "json" = "pdf"): Promise<Blob> {
    const response = await fetch(
      `${BASE_URL}/AdvanceDirective-forms/${id}/export?format=${format}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }
}

export const advanceDirectiveFormAPI = new AdvanceDirectiveFormAPI();
