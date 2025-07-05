// app/api/refusal-forms/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This would be your database in production
let refusalForms: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    
    const form = refusalForms.find(f => f.id === id);
    
    if (!form) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }
    
    if (format === 'json') {
      return NextResponse.json(form);
    }
    
    if (format === 'pdf') {
      // For PDF generation, you'd typically use a library like puppeteer or jsPDF
      // For now, we'll return a simple text response
      const textContent = `
        Refusal Form Export
        ==================
        
        Patient Name: ${form.patientName || 'N/A'}
        Date: ${form.date || 'N/A'}
        Time: ${form.time || 'N/A'}
        Location: ${form.location || 'N/A'}
        
        [This is a placeholder - implement actual PDF generation]
      `;
      
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="refusal-form-${id}.txt"`,
        },
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Unsupported format' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error exporting form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export form' },
      { status: 500 }
    );
  }
}