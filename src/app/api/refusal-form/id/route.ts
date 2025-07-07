// app/api/refusal-forms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This would be your database in production
const refusalForms: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const form = refusalForms.find(f => f.id === id);
    
    if (!form) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: form
    });
    
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const formIndex = refusalForms.findIndex(f => f.id === id);
    
    if (formIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }
    
    refusalForms[formIndex] = {
      ...refusalForms[formIndex],
      ...body.formData,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: refusalForms[formIndex],
      message: 'Form updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update form' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formIndex = refusalForms.findIndex(f => f.id === id);
    
    if (formIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }
    
    const deletedForm = refusalForms.splice(formIndex, 1)[0];
    
    return NextResponse.json({
      success: true,
      data: deletedForm,
      message: 'Form deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete form' },
      { status: 500 }
    );
  }
}