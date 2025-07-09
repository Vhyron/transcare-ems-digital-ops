import {
  RefusalFormResponse,
  RefusalFormListResponse,
  CreateRefusalFormRequest,
  UpdateRefusalFormRequest,
  RefusalFormFilters,
} from "@/types/refusal-form";

const BASE_URL = "/api/refusal-form";

class RefusalFormAPI {
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

  async createForm(
    data: CreateRefusalFormRequest
  ): Promise<RefusalFormResponse> {
    return this.request<RefusalFormResponse>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getForms(
    filters: RefusalFormFilters = {}
  ): Promise<RefusalFormListResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/refusal-forms${queryString ? `?${queryString}` : ""}`;

    return this.request<RefusalFormListResponse>(endpoint);
  }

  async getForm(id: string): Promise<RefusalFormResponse> {
    return this.request<RefusalFormResponse>(`/refusal-forms/${id}`);
  }

  async updateForm(
    data: UpdateRefusalFormRequest
  ): Promise<RefusalFormResponse> {
    return this.request<RefusalFormResponse>(`/refusal-forms/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteForm(id: string): Promise<RefusalFormResponse> {
    return this.request<RefusalFormResponse>(`/refusal-forms/${id}`, {
      method: "DELETE",
    });
  }

  async saveDraft(data: any): Promise<RefusalFormResponse> {
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

  async submitForm(data: any): Promise<RefusalFormResponse> {
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

  async exportForm(id: string, format: "pdf" | "json" = "pdf"): Promise<Blob> {
    const response = await fetch(
      `${BASE_URL}/refusal-forms/${id}/export?format=${format}`,
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

export const refusalFormAPI = new RefusalFormAPI();
