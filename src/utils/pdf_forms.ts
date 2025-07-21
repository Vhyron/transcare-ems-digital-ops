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
    data.patient_guardian_signature_image || '',
    2
  );
  await embedSignatureImage(
    pdfDoc,
    'organizer_signature',
    data.events_organizer_signature_image || '',
    2
  );
  await embedSignatureImage(
    pdfDoc,
    'witness_signature',
    data.witness_signature_image || '',
    2
  );
  await embedSignatureImage(
    pdfDoc,
    'personnel_signature',
    data.medic_personnel_signature_image || '',
    2
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
      form
        .getTextField(`no${index + 1}`)
        .setText(item ? String(`${index + 1}.`) : '');
      form
        .getTextField(`name${index + 1}`)
        .setText(item ? String(item.name) : '');
      form
        .getTextField(`age_sex${index + 1}`)
        .setText(item ? String(item.age_sex) : '');
      form
        .getTextField(`chief_complain${index + 1}`)
        .setText(item ? String(item.chief_complain) : '');
      form
        .getTextField(`vital_signs${index + 1}`)
        .setText(item ? String(item.vital_signs) : '');
      form
        .getTextField(`management${index + 1}`)
        .setText(item ? String(item.management) : '');

      await embedSignatureImage(
        pdfDoc,
        `signature${index + 1}`,
        item.signature || ''
      );
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
    'billing',
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
    event_organizer: data.event_organizer,
    organizer_contact_details: data.event_organizer_contact,
    date_and_time: data.event_date_time,
    event_duration: data.event_duration,
    events_call_time: data.event_call_time,
    estimated_crowd: data.estimated_crowd,
    events_venue: data.event_venue,
    types_of_events_specify: [
      'Religious Gathering',
      'Party',
      'Audition',
      'Show Taping',
      'Exhibition/Trade Event',
      'Outbound',
      'Festival',
      'Premier Night',
      'Sport/ Games Event',
      'Concert',
    ].includes(data.type_of_events || '')
      ? ''
      : data.type_of_events,
    brief_concept_description: data.brief_concept_description,
    'expected_vip/guest': data.expected_vip_guest,
    crowd_management_others: data.crowd_others,
    economic_class_specify: ['A', 'B', 'C', 'D', 'E'].includes(
      data.economic_class || ''
    )
      ? ''
      : data.economic_class,

    // 2nd Page
    type_of_service_specify: data.type_of_service_other,
    number_of_crew: data.number_of_crew,
    full_name_md: data.md_names![0],
    point_of_destination1: data.point_of_destinations![0],
    point_of_destination2: data.point_of_destinations![1],
    point_of_destination3: data.point_of_destinations![2],
    point_of_destination4: data.point_of_destinations![3],
    special_consideration: data.special_consideration,
    treated_trauma: data.treated_trauma,
    treated_medical: data.treated_medical,
    rate1: data.treated_rate_1,
    rate2: data.treated_rate_2,
    transported_trauma: data.transported_trauma,
    transported_medical: data.transported_medical,
    rate3: data.transported_rate_1,
    rate4: data.transported_rate_2,
    refused_trauma: data.refused_trauma,
    refused_medical: data.refused_medical,
    rate5: data.refused_rate_1,
    rate6: data.refused_rate_2,
    dispatch_hrs: data.dispatch_hrs,
    dispatch_min: data.dispatch_min,
    dispatch_reading: data.dispatch_reading,
    on_scene_hrs: data.on_scene_hrs,
    on_scene_min: data.on_scene_min,
    on_scene_reading: data.on_scene_reading,
    departure_hrs: data.departure_hrs,
    departure_min: data.departure_min,
    departure_reading: data.departure_reading,
    arrival_hrs: data.arrival_hrs,
    arrival_min: data.arrival_min,
    arrival_reading: data.arrival_reading,
    working_time_hrs: data.working_time_hrs,
    working_time_min: data.working_time_min,
    travel_time_hrs: data.travel_time_hrs,
    travel_time_min: data.travel_time_min,
    overall_hrs: data.overall_hrs,
    overall_min: data.overall_min,

    event_title2: data.page3_event_title,
    total_crew: data.page3_total_crew,
  };
  fillPdfTextFields(form, fieldMap);

  if (data.ambulance_models && typeof data.ambulance_models === 'object') {
    const formData = Array.isArray(data.ambulance_models)
      ? data.ambulance_models
      : [];

    formData.forEach(async (item, index) => {
      form
        .getTextField(`ambulance_model${index + 1}`)
        .setText(item ? String(item.model) : '');
      form
        .getTextField(`plate_number${index + 1}`)
        .setText(item ? String(item.plate_number) : '');
      form
        .getTextField(`type${index + 1}`)
        .setText(item ? String(item.type) : '');
    });
  }

  if (data.crew_data && typeof data.crew_data === 'object') {
    const formData = Array.isArray(data.crew_data) ? data.crew_data : [];

    formData.forEach(async (item, index) => {
      form
        .getTextField(`name${index + 1}`)
        .setText(item ? String(item.name) : '');

      form.getTextField(`title${index + 1}`).setText(item ? String(item.title) : '');
      form.getTextField(`position${index + 1}`).setText(item ? String(item.position) : '');
      form.getTextField(`in${index + 1}`).setText(item ? String(item.time_in) : '');
      form.getTextField(`out${index + 1}`).setText(item ? String(item.time_out) : '');

      await embedSignatureImage(
        pdfDoc,
        `${index + 1}signature`,
        item.signature || '',
        3
      )
    });
  }

  // 1st page checkboxes
  if (data.event_type) {
    checkFormCheckbox(form, data.event_type, {
      PAID: 'paid',
      CHARITY: 'charity',
      BILLING: 'billing',
      DISCOUNTED: 'discounted',
    });
  }
  if (data.venue_type) {
    checkFormCheckbox(form, data.venue_type, {
      Indoor: 'indoor',
      Outdoor: 'outdoor',
    });
  }
  if (data.type_of_events) {
    checkFormCheckbox(form, data.type_of_events, {
      'Religious Gathering': 'religious_gathering',
      Party: 'party',
      Audition: 'audition',
      'Show Taping': 'show_taping',
      'Exhibition/Trade Event': 'exhibition/trade_event',
      Outbound: 'outbound',
      Festival: 'festival',
      'Premier Night': 'premier_night',
      'Sport/ Games Event': 'sport/games_event',
      Others: 'types_of_events_others',
      Concert: 'concert',
    });
  }
  if (data.crowd_access) {
    checkFormCheckbox(form, data.crowd_access, {
      'Free Ticket': 'free_ticket',
      'Paid Ticket': 'paid_ticket',
      Open: 'open',
      Combination: 'combination',
      Invitation: 'invitation',
    });
  }
  if (data.crowd_security) {
    checkFormCheckbox(form, data.crowd_security, {
      Internal: 'internal',
      External: 'external',
      Combination: 'combination',
    });
  }
  if (data.crowd_risk) {
    checkFormCheckbox(form, data.crowd_risk, {
      Low: 'low',
      Medium: 'medium',
      High: 'high',
    });
  }
  if (data.economic_class) {
    checkFormCheckbox(form, data.economic_class, {
      A: 'a',
      B: 'b',
      C: 'c',
      D: 'd',
      E: 'e',
      Mixed: 'mixed',
      Others: 'others',
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
      'All Ages': 'all ages',
    });
  }
  if (data.venue_safety_equipment) {
    checkFormCheckbox(form, data.venue_safety_equipment, {
      Extinguisher: 'Extinguisher',
      'Fire Hose': 'fire_hose',
      'First Aid Kit': 'first_aid_kit',
      SCBA: 'scba',
      AED: 'aed',
    });
  }

  // 2nd page checkboxes
  if (data.type_of_service) {
    checkFormCheckbox(form, data.type_of_service, {
      Manpower: 'manpower',
      Ambulance: 'ambulance',
      Combination: 'type_of_service_combination',
      'Support Unit': 'support_unit',
    });
  }
  if (data.crew_credential) {
    checkFormCheckbox(form, data.crew_credential, {
      EMT: 'emt',
      RN: 'rn',
      EMR: 'emr',
      Combination: 'crew_credentials_combination',
    });
  }
  if (data.treated_waiver) {
    checkFormCheckbox(form, data.treated_waiver, {
      Y: 'y1',
      N: 'n1',
      'N/A': 'n/a1',
    });
  }
  if (data.transported_insurance) {
    checkFormCheckbox(form, data.transported_insurance, {
      Y: 'y2',
      N: 'n2',
      'N/A': 'n/a2',
    });
  }
  if (data.refused_pre_med_check) {
    checkFormCheckbox(form, data.refused_pre_med_check, {
      Y: 'y3',
      N: 'n3',
      'N/A': 'n/a3',
    });
  }

  // 2nd page signatures
  // await embedSignatureImage(
  //   pdfDoc,
  //   'signature_md',
  //   data.team_leader_signature || '',
  //   2
  // );
  await embedSignatureImage(
    pdfDoc,
    'signature1',
    data.team_leader_signature || '',
    2
  );
  await embedSignatureImage(
    pdfDoc,
    'signature2',
    data.client_representative_signature || '',
    2
  );
  await embedSignatureImage(
    pdfDoc,
    'signature3',
    data.ems_supervisor_signature || '',
    2
  );

  // 3rd page signatures
  await embedSignatureImage(
    pdfDoc,
    'signature4',
    data.page3_team_leader_signature || '',
    3
  );
  await embedSignatureImage(
    pdfDoc,
    'signature5',
    data.page3_client_representative_signature || '',
    3
  );
  await embedSignatureImage(
    pdfDoc,
    'signature6',
    data.page3_ems_supervisor_signature || '',
    3
  );

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
