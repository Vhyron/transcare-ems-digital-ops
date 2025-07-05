const BASE_URL = "@/api/dispatch-forms";

export const dispatchApi = {
  async getDispatchForm(id: string) {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    if (!res.ok) return { success: false };
    const json = await res.json();
    return { success: true, data: json.data };
  },

  async createDispatchForm(data: Partial<any>) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return res.ok ? { success: true, data: json.data } : { success: false, error: json.error };
  },

  async updateDispatchForm(id: string, data: Partial<any>) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return res.ok ? { success: true, data: json.data } : { success: false, error: json.error };
  },
};
