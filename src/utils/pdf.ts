import { PDFDocument, PDFForm } from 'pdf-lib';
import { HospitalTripTicket } from '../db/schema/hospital-trip-ticket.schema';
// import { saveAs } from 'file-saver';

export const hospitalTripTicketsPdf = async (data: HospitalTripTicket) => {
  if (!data || !data.id) {
    throw new Error('Invalid data provided for PDF generation');
  }

  const response = await fetch('/pdf/hospital_trip_tickets_fill.pdf');
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

  form.getTextField('date').setText(data.date || '');
  form.getTextField('time').setText(data.time || '');
  form.getTextField('room').setText(data.room || '');
  form.getTextField('vehicle').setText(data.vehicle || '');
  form.getTextField('plate').setText(data.plate || '');
  form.getTextField('pt_name').setText(data.patient_name || '');
  form.getTextField('age_sex').setText(data.age_sex || '');
  form.getTextField('purpose').setText(data.purpose || '');
  form.getTextField('pick_up').setText(data.pickup || '');
  form.getTextField('destination').setText(data.destination || '');
  form.getTextField('gross').setText(data.gross || '');
  form.getTextField('vat').setText(data.vat || '');
  form.getTextField('vatables').setText(data.vatables || '');
  form.getTextField('discount').setText(data.discount || '');
  form.getTextField('zero_vat').setText(data.zero_vat || '');
  form.getTextField('witholding').setText(data.withholding || '');
  form.getTextField('payables').setText(data.payables || '');
  form.getTextField('remarks').setText(data.remarks || '');

  await embedSignatureImage(pdfDoc, 'signature1', data.sig_nurse || '');
  await embedSignatureImage(pdfDoc, 'signature2', data.sig_billing || '');
  await embedSignatureImage(pdfDoc, 'signature3', data.sig_ambulance || '');

  if (data.trip_type) {
    checkFormCheckbox(form, data.trip_type, {
      BLS: 'bls',
      'BLS-ER': 'bls-er',
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
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

const checkFormCheckbox = (
  form: PDFForm,
  value: string | undefined,
  mapping: Record<string, string>
) => {
  if (!value) return;
  const key = value.trim();
  const checkboxName = mapping[key];
  if (checkboxName) {
    try {
      form.getCheckBox(checkboxName).check();
      console.log(`Checked ${checkboxName} checkbox`);
    } catch (err) {
      console.warn(`Failed to check ${checkboxName} checkbox`, err);
    }
  } else {
    console.warn(`Unknown value for checkbox: ${key}`);
  }
};

const setFieldsReadOnly = (form: PDFForm, fieldNames: string[]) => {
  fieldNames.forEach((name) => {
    const field = form.getField(name);
    if (field) field.enableReadOnly();
  });
};

const embedSignatureImage = async (
  pdfDoc: PDFDocument,
  fieldName: string,
  imageBase64?: string
) => {
  if (!imageBase64) return;

  try {
    const form = pdfDoc.getForm();
    const field = form.getField(fieldName) as any;
    const widget = field.acroField.getWidgets()[0];
    const { x, y, width, height } = widget.getRectangle();
    const ref = widget.dict.get('P');
    const pages = pdfDoc.getPages();
    let page = pages.find((p) => p.ref === ref);
    if (!page) {
      page = pages[0];
    }

    const imageData = imageBase64.split(',')[1];
    const img = await pdfDoc.embedPng(imageData);

    page.drawImage(img, { x, y, width, height });
  } catch (err) {
    console.warn(`Failed to draw signature for field "${fieldName}"`, err);
  }
};
