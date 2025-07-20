import { PDFDocument } from 'pdf-lib';
import { AdvanceDirectiveForm } from '../db/schema/advance_directive.schema';
import { ConductionRefusalForm } from '../db/schema/conduction_refusal_form.schema';
import { HospitalTripTicket } from '../db/schema/hospital-trip-ticket.schema';
import { RefusalForm } from '../db/schema/refusal_form.schema';
import {
  checkFormCheckbox,
  embedSignatureImage,
  fillPdfTextFields,
  setFieldsReadOnly,
} from './pdf_util';
import { OperationCensusRecord } from '@/db/schema/census_record.schema';
import { DispatchForm } from '../db/schema/dispatch_form.schema';

export const hospitalTripTicketsPdf = async (
  data: HospitalTripTicket,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/hospital_trip_ticket_fill.pdf');
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldMap = {
    date: data.date,
    time: data.time,
    room: data.room,
    vehicle: data.vehicle,
    plate: data.plate,
    pt_name: data.patient_name,
    age_sex: data.age_sex,
    purpose: data.purpose,
    pick_up: data.pickup,
    destination: data.destination,
    gross: data.gross,
    vat: data.vat,
    vatables: data.vatables,
    discount: data.discount,
    zero_vat: data.zero_vat,
    witholding: data.withholding,
    payables: data.payables,
    remarks: data.remarks,
  };
  fillPdfTextFields(form, fieldMap);

  if (data.trip_type) {
    checkFormCheckbox(form, data.trip_type, {
      BLS: 'bls',
      'BLS-ER': 'bls_er',
      ALS: 'als',
      ALS1: 'als1',
    });
  }
  if (data.tare) {
    checkFormCheckbox(form, data.tare, {
      REG: 'tare_reg',
      SCD: 'scd',
      PWD: 'pwd',
      CR: 'cr',
    });
  }
  if (data.billing_type) {
    checkFormCheckbox(form, data.billing_type, {
      REG: 'type_reg',
      HMO: 'hmo',
      'P/N': 'type_p/n',
      InHOUSE: 'in_house',
    });
  }
  if (data.billing_class) {
    checkFormCheckbox(form, data.billing_class, {
      DRP: 'drp',
      'P/N': 'billing_p/n',
      BILLED: 'billed',
      'CSR/P': 'csr/p',
      'CSR/WP': 'csr/wp',
    });
  }

  await embedSignatureImage(pdfDoc, 'signature1', data.sig_nurse || '');
  await embedSignatureImage(pdfDoc, 'signature2', data.sig_billing || '');
  await embedSignatureImage(pdfDoc, 'signature3', data.sig_ambulance || '');

  const fieldNames = [
    'bls',
    'bls_er',
    'als',
    'als1',
    'tare_reg',
    'scd',
    'pwd',
    'cr',
    'type_reg',
    'hmo',
    'type_p/n',
    'in_house',
    'drp',
    'billing_p/n',
    'billed',
    'csr/p',
    'csr/wp',
  ];
  setFieldsReadOnly(form, fieldNames);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const conductionRefusalFormPdf = async (
  data: ConductionRefusalForm,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/conduction_refusal_form_fill.pdf');
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldMap = {
    patient_first_name: data.patient_first_name,
    patient_middle_name: data.patient_middle_name,
    patient_last_name: data.patient_last_name,
    age: data.patient_age,
    sex: data.patient_sex,
    birthday: data.patient_birthdate,
    patient_address: data.patient_address,
    citizenship: data.patient_citizenship,
    patient_contact_no: data.patient_contact_no,
    guardian_name: data.kin_name,
    relation: data.kin_relation,
    guardian_contact_no: data.kin_contact_no,
    guardian_address: data.kin_address,
    medical_record: data.medical_record,
    date_accomplished: data.date_accomplished,
    bp: data.vital_bp,
    pulse: data.vital_pulse,
    resp: data.vital_resp,
    skin: data.vital_skin,
    pupils: data.vital_pupils,
    loc: data.vital_loc,
    narrative: data.narrative_description,
    date: data.witness_date,
    witness_name: data.witness_name,
  };
  fillPdfTextFields(form, fieldMap);

  checkFormCheckbox(form, data.oriented_person_place_time ? 'yes' : 'no', {
    yes: '1_yes',
    no: '1_no',
  });
  checkFormCheckbox(form, data.coherent_speech ? 'yes' : 'no', {
    yes: '2_yes',
    no: '2_no',
  });
  checkFormCheckbox(form, data.hallucinations ? 'yes' : 'no', {
    yes: '3_yes',
    no: '3_no',
  });
  checkFormCheckbox(form, data.suicidal_homicidal_ideation ? 'yes' : 'no', {
    yes: '4_yes',
    no: '4_no',
  });
  checkFormCheckbox(
    form,
    data.understands_refusal_consequences ? 'yes' : 'no',
    { yes: '5_yes', no: '5_no' }
  );
  checkFormCheckbox(form, data.refused_treatment_and_transport ? 'yes' : 'no', {
    yes: '1_following',
  });
  checkFormCheckbox(
    form,
    data.refused_treatment_willing_transport ? 'yes' : 'no',
    { yes: '2_following' }
  );
  checkFormCheckbox(
    form,
    data.wants_treatment_refused_transport ? 'yes' : 'no',
    { yes: '3_following' }
  );

  await embedSignatureImage(
    pdfDoc,
    'witness_signature',
    data.witness_signature_image || ''
  );

  const fieldNames = [
    '1_yes',
    '1_no',
    '2_yes',
    '2_no',
    '3_yes',
    '3_no',
    '4_yes',
    '4_no',
    '5_yes',
    '5_no',
    '1_following',
    '2_following',
    '3_following',
  ];
  setFieldsReadOnly(form, fieldNames);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const advanceDirectivesFormPdf = async (
  data: AdvanceDirectiveForm,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/advance_directives_fill.pdf');
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldMap = {
    patient_first_name: data.patient_first_name,
    patient_middle_name: data.patient_middle_name,
    patient_last_name: data.patient_last_name,
    age: data.patient_age,
    sex: data.patient_sex,
    birthday: data.patient_birthdate,
    patient_address: data.patient_address,
    citizenship: data.patient_citizenship,
    patient_contact_no: data.patient_contact_no,
    guardian_name: data.next_of_kin_name,
    relation: data.next_of_kin_relation,
    guardian_contact_no: data.next_of_kin_contact_no,
    guardian_address: data.next_of_kin_address,
    medical_record: data.medical_record_number,
    date_accomplished: data.medical_record_date_accomplished,
    '1_yes/no': data.attempt_cpr ? 'yes' : 'no',
    '2_yes/no': data.comfort_only ? 'yes' : 'no',
    '3_yes/no': data.limited_intervention ? 'yes' : 'no',
    '4_yes/no': data.full_treatment ? 'yes' : 'no',
    additional_orders: data.additional_orders,
    decision_maker_name: data.decision_maker_name,
    decision_maker_relation: data.decision_maker_relation,
    decision_maker_date_signed: data.decision_maker_date_signed,
    physician_name: data.physician_name,
    prc_license_number: data.physician_prc_license_number,
    physician_date_signed: data.physician_date_signed,
  };
  fillPdfTextFields(form, fieldMap);

  checkFormCheckbox(form, data.iv_fluid ? 'yes' : 'no', {
    yes: '1_intervention',
  });
  checkFormCheckbox(form, data.ng_tube ? 'yes' : 'no', {
    yes: '2_intervention',
  });
  checkFormCheckbox(form, data.ng_tube ? 'yes' : 'no', {
    yes: '3_intervention',
  });
  checkFormCheckbox(form, data.cpap_bipap ? 'yes' : 'no', {
    yes: '4_intervention',
  });
  checkFormCheckbox(form, data.antibiotics ? 'yes' : 'no', {
    yes: '5_intervention',
  });
  checkFormCheckbox(form, data.diagnostics ? 'yes' : 'no', {
    yes: '6_intervention',
  });
  checkFormCheckbox(form, data.diagnostics ? 'yes' : 'no', {
    yes: '7_intervention',
  });
  checkFormCheckbox(form, data.discussed_with_patient ? 'yes' : 'no', {
    yes: 'discuss_with_patient',
  });
  checkFormCheckbox(form, data.discussed_with_kin ? 'yes' : 'no', {
    yes: 'discuss_with_kin',
  });

  await embedSignatureImage(
    pdfDoc,
    'signature1',
    data.decision_maker_signature || ''
  );
  await embedSignatureImage(
    pdfDoc,
    'signature2',
    data.physician_signature || ''
  );

  const fieldNames = [
    '1_yes/no',
    '2_yes/no',
    '3_yes/no',
    '4_yes/no',
    '1_intervention',
    '2_intervention',
    '3_intervention',
    '4_intervention',
    '5_intervention',
    '6_intervention',
    '7_intervention',
    'discuss_with_patient',
    'discuss_with_kin',
  ];
  setFieldsReadOnly(form, fieldNames);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const refusalForTreatmentOrTransportFormPdf = async (
  data: RefusalForm,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch(
    '/pdf/refusal_for_treatment_or_transportation_fill.pdf'
  );
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldMap = {
    'league/event': data.league_event,
    type: data.type,
    location: data.location,
    incident: data.incident,
    patient_name: data.patient_name,
    dob: data.dob,
    patient_age: data.age,
    patient_landline: data.landline,
    patient_cell: data.cell,
    guardian_landline: data.guardian_landline,
    guardian_cell: data.guardian_cell,
    guardian_name: data.guardian_name,
    guardian_age: data.guardian_age,
    relationship: data.relationship,
    situation: data.situation,
    specify: data.situation,
    organizer: data.company,
    'patient/guardian_printed_name': data.patient_guardian_signature_name,
    organizer_printed_name: data.events_organizer_signature_name,
    witness_printed_name: data.witness_signature_name,
    personnel_printed_name: data.medic_personnel_signature_name,
    pcr: data.pcr,
    date: data.form_date,
    time: data.form_time,
  };
  fillPdfTextFields(form, fieldMap);

  await embedSignatureImage(
    pdfDoc,
    'parent/guardian_signature',
    data.patient_guardian_signature_image || ''
  );
  await embedSignatureImage(
    pdfDoc,
    'organizer_signature',
    data.events_organizer_signature_image || ''
  );
  await embedSignatureImage(
    pdfDoc,
    'witness_signature',
    data.witness_signature_image || ''
  );
  await embedSignatureImage(
    pdfDoc,
    'personnel_signature',
    data.medic_personnel_signature_image || ''
  );

  checkFormCheckbox(form, data.guardian ? 'yes' : 'no', {
    yes: 'yes',
    no: 'no',
  });
  checkFormCheckbox(form, data.treatment_not_necessary ? 'yes' : 'no', {
    yes: '1_applicable',
  });
  checkFormCheckbox(
    form,
    data.refuses_transport_against_advice ? 'yes' : 'no',
    {
      yes: '2_applicable',
    }
  );
  checkFormCheckbox(form, data.treatment_received_no_transport ? 'yes' : 'no', {
    yes: '3_applicable',
  });
  checkFormCheckbox(form, data.alternative_transportation ? 'yes' : 'no', {
    yes: '4_applicable',
  });
  checkFormCheckbox(
    form,
    data.accepts_transport_refuses_treatment ? 'yes' : 'no',
    {
      yes: '5_applicable',
    }
  );

  const fieldNames = [
    'yes',
    'no',
    '1_applicable',
    '2_applicable',
    '3_applicable',
    '4_applicable',
    '5_applicable',
  ];
  setFieldsReadOnly(form, fieldNames);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const operationCensusRecordsFormPdf = async (
  data: OperationCensusRecord,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/census_record_fill.pdf');
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldMap = {
    date: data.date,
    event_owner: data.event_owner,
    time_in: data.time_in,
    time_out: data.time_out,
    activity: data.activity,
    location: data.location,
  };
  fillPdfTextFields(form, fieldMap);

  if (data.form_data && typeof data.form_data === 'object') {
    const formData = Array.isArray(data.form_data) ? data.form_data : [];

    formData.forEach(async (item, index) => {
      const no = `no${index + 1}`;
      const name = `name${index + 1}`;
      const age_sex = `age_sex${index + 1}`;
      const chief_complain = `chief_complain${index + 1}`;
      const vital_signs = `vital_signs${index + 1}`;
      const management = `management${index + 1}`;
      const signature = `signature${index + 1}`;

      form.getTextField(no).setText(item ? String(`${index + 1}.`) : '');
      form.getTextField(name).setText(item ? String(item.name) : '');
      form.getTextField(age_sex).setText(item ? String(item.age_sex) : '');
      form
        .getTextField(chief_complain)
        .setText(item ? String(item.chief_complain) : '');
      form
        .getTextField(vital_signs)
        .setText(item ? String(item.vital_signs) : '');
      form
        .getTextField(management)
        .setText(item ? String(item.management) : '');

      await embedSignatureImage(pdfDoc, signature, item.signature || '');
    });
  }

  await embedSignatureImage(
    pdfDoc,
    'signature11',
    data.prepared_by_signature || ''
  );
  await embedSignatureImage(
    pdfDoc,
    'signature12',
    data.conformed_by_signature || ''
  );

  const fieldNames = [
    ...Array.from({ length: 10 }, (_, i) => `no${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `name${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `age_sex${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `chief_complain${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `vital_signs${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `management${i + 1}`),
    ...Array.from({ length: 12 }, (_, i) => `signature${i + 1}`),
  ];
  setFieldsReadOnly(form, fieldNames);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const dispatchFormPdf = async (
  data: DispatchForm,
  returnBuffer: boolean = false
) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/dispatch_form_fill.pdf');
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  const fieldNames = [
    'paid',
    'charity',
    'biling',
    'discounted',

    'indoor',
    'outdoor',

    'religious_gathering',
    'party',
    'audition',
    'show_taping',
    'exhibition/trade_event',
    'outbound',
    'festival',
    'premier_night',
    'sport/games_event',
    'types_of_events_others',
    'concert',

    'free_ticket',
    'open',
    'invitation',
    'paid_ticket',
    'access_combination',
    'internal',
    'external',
    'security_combination',
    'low',
    'medium',
    'high',
    'crowd_management_others',
    'a',
    'b',
    'c',
    'd',
    'e',
    'mixed',
    'others',
    'economic_class_specify',
    '3-7',
    '7-12',
    '12-18',
    '18-45',
    '45-60',
    '60-above',
    'all_ages',
    'Extinguisher',
    'first_aid_kit',
    'fire_hose',
    'scba',
    'aed',
    'manpower',
    'ambulance',
    'type_of_service_combination',
    'support_unit',
    'type_of_service_specify',

    'ambulance_model1',
    'ambulance_model2',
    'ambulance_model3',
    'ambulance_model4',
    'ambulance_model5',
    'ambulance_model6',
    'ambulance_model7',
    'ambulance_model8',
    'plate_number1',
    'plate_number2',
    'plate_number3',
    'plate_number4',
    'plate_number5',
    'plate_number6',
    'plate_number7',
    'plate_number8',
    'type1',
    'type2',
    'type3',
    'type4',
    'type5',
    'type6',
    'type7',
    'type8',

    'emt',
    'rn',
    'emr',
    'crew_credentials_combination',

    'y1',
    'y2',
    'y3',
    'n1',
    'n2',
    'n3',
    'n/a1',
    'n/a2',
    'n/a3',
    'signature1',
    'signature2',
    'signature3',
    'signature4',
    'signature5',
    'signature6',

    ...Array.from({ length: 21 }, (_, i) => `name${i + 1}`),
    ...Array.from({ length: 21 }, (_, i) => `title${i + 1}`),
    ...Array.from({ length: 21 }, (_, i) => `position${i + 1}`),
    ...Array.from({ length: 21 }, (_, i) => `in${i + 1}`),
    ...Array.from({ length: 21 }, (_, i) => `out${i + 1}`),
    ...Array.from({ length: 21 }, (_, i) => `${i + 1}signature`),
  ];
  setFieldsReadOnly(form, fieldNames);

  const fieldMap = {
    // 1st Page
    even_title: data.event_title,
    event_owner: data.event_owner,
    owner_contact_details: data.event_owner_contact,
    event_organizer: data.event_organizer_contact,
    date_and_time: data.event_date_time,
    event_duration: data.event_duration,
    events_call_time: data.event_call_time,
    estimated_crowd: data.estimated_crowd,
    events_venue: data.event_venue,
    types_of_events_specify: data.type_of_events,
    brief_concept_description: data.brief_concept_description,
    'expected_vip/guest': data.expected_vip_guest,
    crowd_management_others: data.crowd_others,
    economic_class_specify: data.economic_class,

    // 2nd Page
  };
  fillPdfTextFields(form, fieldMap);

  // 1st page
  if (data.event_type) {
    checkFormCheckbox(form, data.event_type, {
      paid: 'paid',
      charity: 'charity',
      billing: 'billing',
      discounted: 'discounted',
    });
  }
  if (data.venue_type) {
    checkFormCheckbox(form, data.venue_type, {
      indoor: 'indoor',
      outdoor: 'outdoor',
    });
  }
  if (data.crowd_access) {
    checkFormCheckbox(form, data.crowd_access, {
      free_ticket: 'free_ticket',
      paid_ticket: 'paid_ticket',
      open: 'open',
      access_combination: 'combination',
      invitation: 'invitation',
    });
  }
  if (data.crowd_security) {
    checkFormCheckbox(form, data.crowd_security, {
      internal: 'internal',
      external: 'external',
      security_combination: 'combination',
    });
  }
  if (data.crowd_risk) {
    checkFormCheckbox(form, data.crowd_risk, {
      low: 'low',
      medium: 'medium',
      high: 'high',
    });
  }
  if (data.economic_class) {
    checkFormCheckbox(form, data.economic_class, {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
      mixed: 'mixed',
      others: 'others',
    });
  }
  if (data.crowd_type) {
    checkFormCheckbox(form, data.crowd_type, {
      '3-7': '3-7',
      '7-12': '7-12',
      '12-18': '12-18',
      '18-45': '18-45',
      '45-60': '45-60',
      '60-above': '60-above',
      all_ages: 'all ages',
    });
  }
  if (data.venue_safety_equipment) {
    checkFormCheckbox(form, data.venue_safety_equipment, {
      Extinguisher: 'extinguisher',
      fire_hose: 'fire_hose',
      first_aid_kit: 'first_aid_kit',
      scba: 'scba',
      aed: 'aed',
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });

  if (returnBuffer) {
    return pdfBlob;
  }

  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
