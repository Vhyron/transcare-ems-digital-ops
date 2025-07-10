import { PDFDocument } from 'pdf-lib';
import { HospitalTripTicket } from '../db/schema/hospital-trip-ticket.schema';
// import { saveAs } from 'file-saver';

export const hospitalTripTicketsPdf = async (
  data: HospitalTripTicket,
  signatureBase64: string
) => {
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
    'gross',
    'vat',
    'vatables',
    'discount',
    'zero_vat',
    'witholding',
    'payables',
    'remarks',
  ];
  fieldNames.forEach((name) => {
    const field = form.getField(name);
    if (field) field.enableReadOnly();
  });

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

  await embedSignatureImage(pdfDoc, 'signature1', signatureBase64);
  await embedSignatureImage(pdfDoc, 'signature2', signatureBase64);
  await embedSignatureImage(pdfDoc, 'signature3', signatureBase64);

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: 'application/pdf',
  });
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

export const embedSignatureImage = async (
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

// export const hospitalTripTicketsPdf = async (data: HospitalTripTicket) => {
//   if (!data || !data.id) {
//     throw new Error('Invalid data provided for PDF generation');
//   }

//   // Fetch the PDF as binary data
//   const response = await fetch('/pdf/hospital_trip_tickets_fill.pdf');
//   if (!response.ok) {
//     throw new Error('Failed to fetch PDF file');
//   }
//   const arrayBuffer = await response.arrayBuffer();
//   const pdfDoc = await PDFDocument.load(arrayBuffer);

//   const form = pdfDoc.getForm();

//   form.getField('date').enableReadOnly();
//   form.getField('time').enableReadOnly();
//   form.getField('room').enableReadOnly();
//   form.getField('vehicle').enableReadOnly();
//   form.getField('plate').enableReadOnly();
//   form.getField('pt_name').enableReadOnly();
//   form.getField('age_sex').enableReadOnly();
//   form.getField('purpose').enableReadOnly();
//   form.getField('pick_up').enableReadOnly();
//   form.getField('destination').enableReadOnly();
//   form.getField('gross').enableReadOnly();
//   form.getField('vat').enableReadOnly();
//   form.getField('vatables').enableReadOnly();
//   form.getField('discount').enableReadOnly();
//   form.getField('zero_vat').enableReadOnly();
//   form.getField('witholding').enableReadOnly();
//   form.getField('payables').enableReadOnly();
//   form.getField('remarks').enableReadOnly();

//   form.getTextField('date').setText(data.date || '');
//   form.getTextField('time').setText(data.time || '');
//   form.getTextField('room').setText(data.room || '');
//   form.getTextField('vehicle').setText(data.vehicle || '');
//   form.getTextField('plate').setText(data.plate || '');
//   form.getTextField('pt_name').setText(data.patient_name || '');
//   form.getTextField('age_sex').setText(data.age_sex || '');
//   form.getTextField('purpose').setText(data.purpose || '');
//   form.getTextField('pick_up').setText(data.pickup || '');
//   form.getTextField('destination').setText(data.destination || '');
//   form.getTextField('gross').setText(data.gross || '');
//   form.getTextField('vat').setText(data.vat || '');
//   form.getTextField('vatables').setText(data.vatables || '');
//   form.getTextField('discount').setText(data.discount || '');
//   form.getTextField('zero_vat').setText(data.zero_vat || '');
//   form.getTextField('witholding').setText(data.withholding || '');
//   form.getTextField('payables').setText(data.payables || '');
//   form.getTextField('remarks').setText(data.remarks || '');

//   const pdfBytes = await pdfDoc.save();
//   const arrayBufferForBlob = new Uint8Array(pdfBytes).slice().buffer;
//   const pdfBlob = new Blob([arrayBufferForBlob], { type: 'application/pdf' });

//   const url = URL.createObjectURL(pdfBlob);
//   window.open(url, '_blank');

//   // saveAs(pdfBlob, `hospital_trip_tickets_${data.id}.pdf`);
// };
