import { PDFDocument, PDFForm } from 'pdf-lib';
import { toast } from 'sonner';
import { FormType } from '../db/schema/form_submissions.schema';
import {
  advanceDirectivesFormPdf,
  conductionRefusalFormPdf,
  dispatchFormPdf,
  hospitalTripTicketsPdf,
  operationCensusRecordsFormPdf,
  refusalForTreatmentOrTransportFormPdf,
} from './pdf_forms';

export const generatePdf = async (
  form: FormType,
  data: any,
  returnBuffer: boolean = false
) => {
  switch (form) {
    case 'hospital_trip_tickets':
      return await hospitalTripTicketsPdf(data, returnBuffer);
    case 'dispatch_forms':
      return await dispatchFormPdf(data, returnBuffer);
    case 'advance_directives':
      return await advanceDirectivesFormPdf(data, returnBuffer);
    case 'refusal_forms':
      return await refusalForTreatmentOrTransportFormPdf(data, returnBuffer);
    case 'conduction_refusal_forms':
      return await conductionRefusalFormPdf(data, returnBuffer);
    case 'operation_census_records':
      return await operationCensusRecordsFormPdf(data, returnBuffer);
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
    const textField = form.getFieldMaybe(field);

    if (!textField) {
      console.error(`Error field not found: ${field}`);
      return;
    }

    form.getTextField(field).setText(value ? String(value) : '');
    textField.enableReadOnly();
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
    const field = form.getFieldMaybe(name);
    if (!field) {
      console.error(`Error field not found: ${name}`);
      return;
    }
    field.enableReadOnly();
  });
};

export const embedSignatureImage = async (
  pdfDoc: PDFDocument,
  fieldName: string,
  imageBase64?: string,
  pageNumber: number = 1
) => {
  if (!imageBase64) return;

  try {
    const form = pdfDoc.getForm();
    const field = form.getField(fieldName) as any;
    const widget = field.acroField.getWidgets()[0];
    const { x, y, width, height } = widget.getRectangle();

    const page = pdfDoc.getPage(pageNumber - 1);

    const imageData = imageBase64.split(',')[1];
    const img = await pdfDoc.embedPng(imageData);

    page.drawImage(img, { x, y, width, height });
  } catch (err) {
    console.warn(`Failed to draw signature for field "${fieldName}"`, err);
  }
};
