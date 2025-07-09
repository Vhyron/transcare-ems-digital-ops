// hooks/useDispatchForm.ts
import { useState, useEffect } from 'react';

export interface DispatchFormData {
  id?: string;
  // Page 1 Fields
  event_title?: string;
  event_type?: string;
  event_owner?: string;
  event_owner_contact?: string;
  event_organizer?: string;
  event_organizer_contact?: string;
  event_date_time?: string;
  event_duration?: string;
  event_call_time?: string;
  estimated_crowd?: string;
  event_venue?: string;
  type_of_events?: string;
  venue_type?: string;
  brief_concept_description?: string;
  expected_vip_guest?: string;
  crowd_access?: string;
  crowd_security?: string;
  crowd_risk?: string;
  crowd_others?: string;
  economic_class?: string;
  crowd_type?: string;
  venue_safety_equipment?: string;

  // Page 2 Fields
  type_of_service?: string;
  type_of_service_other?: string;
  crew_credential?: string;
  crew_credential_other?: string;
  number_of_crew?: string;
  ambulance_models?: Array<{
    model: string;
    plate_number: string;
    type: string;
  }>;
  md_names?: string[];
  point_of_destinations?: string[];
  special_consideration?: string;

  // Patient Census
  treated_trauma?: number;
  treated_medical?: number;
  treated_rate_1?: string;
  treated_rate_2?: string;
  treated_waiver?: string;
  transported_trauma?: number;
  transported_medical?: number;
  transported_rate_1?: string;
  transported_rate_2?: string;
  transported_insurance?: string;
  refused_trauma?: number;
  refused_medical?: number;
  refused_rate_1?: string;
  refused_rate_2?: string;
  refused_pre_med_check?: string;

  // Time Tracking
  dispatch_hrs?: string;
  dispatch_min?: string;
  dispatch_reading?: string;
  on_scene_hrs?: string;
  on_scene_min?: string;
  on_scene_reading?: string;
  departure_hrs?: string;
  departure_min?: string;
  departure_reading?: string;
  arrival_hrs?: string;
  arrival_min?: string;
  arrival_reading?: string;
  working_time_hrs?: string;
  working_time_min?: string;
  travel_time_hrs?: string;
  travel_time_min?: string;
  overall_hrs?: string;
  overall_min?: string;

  // Signatures
  team_leader_signature?: string;
  client_representative_signature?: string;
  ems_supervisor_signature?: string;

  // Page 3 Fields
  page3_event_title?: string;
  page3_total_crew?: number;
  crew_data?: Array<{
    name: string;
    title: string;
    position: string;
    time_in: string;
    time_out: string;
    signature: string;
  }>;
  page3_team_leader_signature?: string;
  page3_client_representative_signature?: string;
  page3_ems_supervisor_signature?: string;

  // Form Status
  form_status?: 'draft' | 'completed' | 'submitted';
  current_page?: number;
}

export const useDispatchForm = () => {
  const [formData, setFormData] = useState<DispatchFormData>({
    form_status: 'draft',
    current_page: 1,
    ambulance_models: Array(4).fill({ model: '', plate_number: '', type: '' }),
    md_names: Array(4).fill(''),
    point_of_destinations: Array(4).fill(''),
    crew_data: Array(10).fill({
      name: '',
      title: '',
      position: '',
      time_in: '',
      time_out: '',
      signature: ''
    })
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const updateFormData = (updates: Partial<DispatchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      if (formId) {
        saveForm();
      }
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const saveForm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = formId ? `/api/dispatch-forms/${formId}` : '/api/dispatch-forms';
      const method = formId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!formId && result.data?.id) {
        setFormId(result.data.id);
      }
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadForm = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dispatch-forms/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFormData(result.data);
      setFormId(id);
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = async () => {
    const updatedData = {
      ...formData,
      form_status: 'submitted' as const,
    };
    
    setFormData(updatedData);
    return await saveForm();
  };

  const deleteForm = async () => {
    if (!formId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dispatch-forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form data
      setFormData({
        form_status: 'draft',
        current_page: 1,
        ambulance_models: Array(4).fill({ model: '', plate_number: '', type: '' }),
        md_names: Array(4).fill(''),
        point_of_destinations: Array(4).fill(''),
        crew_data: Array(10).fill({
          name: '',
          title: '',
          position: '',
          time_in: '',
          time_out: '',
          signature: ''
        })
      });
      setFormId(null);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
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
  };
};