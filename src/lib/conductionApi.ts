// lib/api/conductionApi.ts

import {
  ConductionRefusalFormData,
  ConductionRefusalFormResponse,
  ConductionRefusalFormListResponse,
} from "@/types/conduction-refusal-form";

const BASE_URL = "/api/conduction-form";

class ConductionRefusalFormAPI {
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

  // Create a new Conduction form
  async createForm(
    data: Partial<ConductionRefusalFormData>
  ): Promise<ConductionRefusalFormResponse> {
    return this.request<ConductionRefusalFormResponse>("", {
      method: "POST",
      body: JSON.stringify({ formData: data }),
    });
  }

  // Get a specific Conduction form by ID
  async getForm(id: string): Promise<ConductionRefusalFormResponse> {
    return this.request<ConductionRefusalFormResponse>(`/${id}`);
  }

  // Update a Conduction form
  async updateForm(
    id: string,
    data: Partial<ConductionRefusalFormData>
  ): Promise<ConductionRefusalFormResponse> {
    return this.request<ConductionRefusalFormResponse>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify({ formData: data }),
    });
  }

  // Delete a Conduction form
  async deleteForm(id: string): Promise<ConductionRefusalFormResponse> {
    return this.request<ConductionRefusalFormResponse>(`/${id}`, {
      method: "DELETE",
    });
  }

  // Get all forms (with optional pagination)
  async getForms(
    page: number = 1,
    limit: number = 10,
    status?: "draft" | "completed" | "archived"
  ): Promise<ConductionRefusalFormListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    return this.request<ConductionRefusalFormListResponse>(`?${params}`);
  }

  // Save form as draft
  async saveDraft(
    data: Partial<ConductionRefusalFormData>
  ): Promise<ConductionRefusalFormResponse> {
    const requestData = {
      ...data,
      form_status: "draft" as const,
    };

    if (data.id) {
      return this.updateForm(data.id, requestData);
    } else {
      return this.createForm(requestData);
    }
  }

  // Submit form as completed
  async submitForm(
    data: Partial<ConductionRefusalFormData>
  ): Promise<ConductionRefusalFormResponse> {
    const requestData = {
      ...data,
      form_status: "completed" as const,
    };

    if (data.id) {
      return this.updateForm(data.id, requestData);
    } else {
      return this.createForm(requestData);
    }
  }

  // Export form data (for PDF generation, etc.)
  async exportForm(id: string, format: "pdf" | "json" = "pdf"): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/${id}/export?format=${format}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  // Search forms
  async searchForms(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ConductionRefusalFormListResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request<ConductionRefusalFormListResponse>(`/search?${params}`);
  }
}

export const conductionRefusalFormAPI = new ConductionRefusalFormAPI();
