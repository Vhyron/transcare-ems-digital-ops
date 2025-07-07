
export interface AdvanceDirectivesFormData {
  id?: string;

  // Patient Info
  patient: {
    firstName: string;
    middleName: string;
    lastName: string;
    age: string;
    sex: string;
    birthdate: string;
    citizenship: string;
    address: string;
    contactNo: string;
  };

  // Next of Kin
  nextOfKin: {
    name: string;
    relation: string;
    contactNo: string;
    address: string;
  };

  // Medical Record
  medicalRecord: {
    recordNumber: string;
    dateAccomplished: string;
  };

  // Preferences
  carePreferences: {
    attemptCPR: boolean;
    comfortOnly: boolean;
    limitedIntervention: boolean;
    limitedInterventionOptions: {
      ivFluid: boolean;
      ngTube: boolean;
      o2Therapy: boolean;
      cpapBipap: boolean;
      antibiotics: boolean;
      diagnostics: boolean;
    };
    fullTreatment: boolean;
  };

  additionalOrders: string;

  discussedWith: {
    withPatient: boolean;
    withKin: boolean;
  };

  decisionMaker: {
    name: string;
    relation: string;
    dateSigned: string;
    signature: string; 
  };

  physician: {
    name: string;
    prcLicense: string;
    dateSigned: string;
    signature: string;
  };

  form_status?: "draft" | "completed" | "submitted";
  current_page?: number;
}

export const initialFormState: AdvanceDirectivesFormData = {
  patient: {
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    sex: "",
    birthdate: "",
    citizenship: "",
    address: "",
    contactNo: "",
  },
  nextOfKin: {
    name: "",
    relation: "",
    contactNo: "",
    address: "",
  },
  medicalRecord: {
    recordNumber: "",
    dateAccomplished: "",
  },
  carePreferences: {
    attemptCPR: false,
    comfortOnly: false,
    limitedIntervention: false,
    limitedInterventionOptions: {
      ivFluid: false,
      ngTube: false,
      o2Therapy: false,
      cpapBipap: false,
      antibiotics: false,
      diagnostics: false,
    },
    fullTreatment: false,
  },
  additionalOrders: "",
  discussedWith: {
    withPatient: false,
    withKin: false,
  },
  decisionMaker: {
    name: "",
    relation: "",
    dateSigned: "",
    signature: "",
  },
  physician: {
    name: "",
    prcLicense: "",
    dateSigned: "",
    signature: "",
  },
  form_status: "draft",
  current_page: 1,
};
