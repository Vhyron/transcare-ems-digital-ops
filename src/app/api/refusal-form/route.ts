// app/api/refusal-forms/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This is a basic implementation - you'll need to integrate with your actual database
let refusalForms: any[] = []; // In production, use a proper database

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate a simple ID (in production, use proper UUID or database ID)
    const id = Date.now().toString();
    
    const newForm = {
      id,
      ...body.formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    refusalForms.push(newForm);
    
    return NextResponse.json({
      success: true,
      data: newForm,
      message: 'Form created successfully'
    });
    
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let filteredForms = refusalForms;
    
    if (status) {
      filteredForms = refusalForms.filter(form => form.status === status);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredForms,
      total: filteredForms.length
    });
    
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const formIndex = refusalForms.findIndex(form => form.id === id);
    
    if (formIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }
    
    refusalForms[formIndex] = {
      ...refusalForms[formIndex],
      ...updateData.formData,
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