// lib/dispatchApi.ts
import { DispatchFormData } from '@/hooks/dispatch-form';

const BASE_URL = "/api/dispatch-forms";

export const dispatchApi = {
  async getDispatchForm(id: string) {
    try {
      const res = await fetch(`${BASE_URL}?id=${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error };
      }
      const json = await res.json();
      return { success: true, data: json.data[0] || json.data }; // Handle array response
    } catch  {
      return { success: false, error: 'Network error' };
    }
  },

  async createDispatchForm(data: Partial<DispatchFormData>) {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return res.ok ? { success: true, data: json.data } : { success: false, error: json.error };
    } catch  {
      return { success: false, error: 'Network error' };
    }
  },

  async updateDispatchForm(id: string, data: Partial<DispatchFormData>) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return res.ok ? { success: true, data: json.data } : { success: false, error: json.error };
    } catch  {
      return { success: false, error: 'Network error' };
    }
  },

  async deleteDispatchForm(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      return res.ok ? { success: true, data: json } : { success: false, error: json.error };
    } catch  {
      return { success: false, error: 'Network error' };
    }
  },

  async getAllDispatchForms() {
    try {
      const res = await fetch(BASE_URL);
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error };
      }
      const json = await res.json();
      return { success: true, data: json.data };
    } catch  {
      return { success: false, error: 'Network error' };
    }
  }
};