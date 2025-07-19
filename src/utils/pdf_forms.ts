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

  const fieldNames = [
    'date',
    'time',
    'room',
    'vehicle',
    'plate',
    'bls',
    'bls_er',
    'als',
    'als1',
    'pt_name',
    'age_sex',
    'purpose',
    'pick_up',
    'destination',
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
    'gross',
    'vat',
    'vatables',
    'discount',
    'zero_vat',
    'witholding',
    'payables',
    'remarks',
  ];
  setFieldsReadOnly(form, fieldNames);

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

  await embedSignatureImage(pdfDoc, 'signature1', data.sig_nurse || '');
  await embedSignatureImage(pdfDoc, 'signature2', data.sig_billing || '');
  await embedSignatureImage(pdfDoc, 'signature3', data.sig_ambulance || '');

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

  const fieldNames = [
    'patient_first_name',
    'patient_middle_name',
    'patient_last_name',
    'age',
    'sex',
    'birthday',
    'patient_address',
    'citizenship',
    'patient_contact_no',
    'guardian_name',
    'relation',
    'guardian_contact_no',
    'guardian_address',
    'medical_record',
    'date_accomplished',
    'bp',
    'pulse',
    'resp',
    'skin',
    'pupils',
    'loc',
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
    'narrative',
    '1_following',
    '2_following',
    '3_following',
    'date',
    'witness_name',
  ];
  setFieldsReadOnly(form, fieldNames);

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

  const fieldNames = [
    'patient_first_name',
    'patient_middle_name',
    'patient_last_name',
    'age',
    'sex',
    'birthday',
    'patient_address',
    'citizenship',
    'patient_contact_no',
    'guardian_name',
    'relation',
    'guardian_contact_no',
    'guardian_address',
    'medical_record',
    'date_accomplished',
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
    'additional_orders',
    'discuss_with_patient',
    'discuss_with_kin',
    'decision_maker_name',
    'decision_maker_relation',
    'decision_maker_date_signed',
    'physician_name',
    'prc_license_number',
    'physician_date_signed',
  ];
  setFieldsReadOnly(form, fieldNames);

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

  const fieldNames = [
    'league/event',
    'type',
    'location',
    'incident',
    'patient_name',
    'dob',
    'patient_age',
    'patient_landline',
    'patient_cell',
    'yes',
    'no',
    'guardian_landline',
    'guardian_cell',
    'guardian_name',
    'guardian_age',
    'relationship',
    'situation',
    '1_applicable',
    '2_applicable',
    '3_applicable',
    '4_applicable',
    '5_applicable',
    'specify',
    'organizer',
    'patient/guardian_printed_name',
    'organizer_printed_name',
    'witness_printed_name',
    'personnel_printed_name',
    'pcr',
    'date',
    'time',
  ];
  setFieldsReadOnly(form, fieldNames);

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

// export const censusRecordFormPdf = (data: CensusData, returnBuffer: boolean = false) => {

// }
