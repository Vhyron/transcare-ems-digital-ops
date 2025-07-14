'use server';

import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: EmailParams) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jabagatniel09@gmail.com',
      pass: 'ptfw ngmv unie ecty',
    },
  });

  await transporter.sendMail({
    from: '"Transcare EMS" jabagatniel09@gmail.com',
    to,
    subject,
    text,
    html,
    attachments,
  });
};

export const sendEmailWithPdf = async (
  pdfBlob: Blob,
  emailOptions?: { to: string; subject: string; text: string; html: string }
) => {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  await sendEmail({
    to: emailOptions?.to || 'onielangelo.g@gmail.com',
    subject: emailOptions?.subject || 'Form PDF Attachment',
    text: emailOptions?.text || 'Please see attached PDF.',
    html: emailOptions?.html || '<b>Please see attached PDF.</b>',
    attachments: [
      {
        filename: 'form.pdf',
        content: pdfBuffer,
      },
    ],
  });
};
