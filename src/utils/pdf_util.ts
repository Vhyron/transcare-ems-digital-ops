import { PDFDocument, PDFForm } from 'pdf-lib';
import { toast } from 'sonner';
import { FormType } from '../db/schema/form_submissions.schema';
import {
  advanceDirectivesFormPdf,
  conductionRefusalFormPdf,
  hospitalTripTicketsPdf,
  refusalForTreatmentOrTransportFormPdf,
} from './pdf_forms';

export const generatePdf = async (form: FormType, data: any) => {
  switch (form) {
    case 'hospital_trip_tickets':
      await hospitalTripTicketsPdf(data);
      break;
    case 'dispatch_forms':
      console.log('Generate Dispatch Form');
      break;
    case 'advance_directives':
      await advanceDirectivesFormPdf(data);
      break;
    case 'refusal_forms':
      await refusalForTreatmentOrTransportFormPdf(data);
      break;
    case 'conduction_refusal_forms':
      await conductionRefusalFormPdf(data);
      break;
    default:
      toast.error('Invalid form type', {
        description: 'The form type is not recognized.',
        richColors: true,
      });
  }
};

export const fillPdfTextFields = (
  form: PDFForm,
  fieldMap: Record<string, any>
) => {
  Object.entries(fieldMap).forEach(([field, value]) => {
    form.getTextField(field).setText(value ? String(value) : '');
    form.getField(field).enableReadOnly();
  });
};

export const checkFormCheckbox = (
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
      form.getField(checkboxName).enableReadOnly();
    } catch (err) {
      console.warn(`Failed to check ${checkboxName} checkbox`, err);
    }
  } else {
    console.warn(`Unknown value for checkbox: ${key}`);
  }
};

export const setFieldsReadOnly = (form: PDFForm, fieldNames: string[]) => {
  fieldNames.forEach((name) => {
    const field = form.getField(name);
    if (field) field.enableReadOnly();
  });
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
