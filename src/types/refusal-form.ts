// types/refusal-form.ts

export interface RefusalFormData {
  id?: string;
  
  // Event Information
  leagueEvent: string;
  type: string;
  location: string;
  incident: string;
  
  // Patient Information
  patientName: string;
  dob: string;
  age: string;
  
  // Contact Details
  landline: string;
  cell: string;
  
  // Guardian Information
  guardian: 'yes' | 'no';
  guardianLandline: string;
  guardianCell: string;
  guardianName: string;
  guardianAge: string;
  relationship: string;
  
  // Situation
  situation: string;
  
  // Refusal Options
  refusalOptions: {
    treatmentNotNecessary: boolean;
    refuseTreatmentAndTransport: boolean;
    treatmentButNoTransport: boolean;
    alternativeTransportation: boolean;
    transportButRefuseTreatment: boolean;
  };
  
  treatmentRefused: string;
  
  // Legal acknowledgment field
  acknowledgmentField: string;
  
  // Signatures
  signatures: {
    patientGuardian: {
      image: string;
      name: string;
    };
    eventsOrganizer: {
      image: string;
      name: string;
    };
    witness: {
      image: string;
      name: string;
    };
    medicPersonnel: {
      image: string;
      name: string;
    };
  };
  
  // Additional Information
  pcr: string;
  date: string;
  time: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'completed' | 'submitted';
}

export interface RefusalFormResponse {
  success: boolean;
  data?: RefusalFormData;
  message?: string;
  error?: string;
}

export interface RefusalFormListResponse {
  success: boolean;
  data?: RefusalFormData[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface CreateRefusalFormRequest {
  formData: Omit<RefusalFormData, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateRefusalFormRequest {
  id: string;
  formData: Partial<RefusalFormData>;
}

export interface RefusalFormFilters {
  patientName?: string;
  leagueEvent?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'draft' | 'completed' | 'submitted';
  page?: number;
  limit?: number;
}