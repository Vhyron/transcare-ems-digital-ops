'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/provider/auth-provider';
import SignatureForm, { SignatureData } from '@/components/forms/SignatureForm';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
function SelectWithOthers({
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-2 w-full">
      <select
        className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ backgroundColor: '#0a0a0a', color: 'white' }}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Others">Others</option>
      </select>
      {value === 'Others' && (
        <input
          className="mt-2 border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Please specify"
          value={otherValue || ''}
          onChange={(e) => onOtherChange?.(e.target.value)}
        />
      )}
    </div>
  );
}

function getCrowdOptions(category: string): string[] {
  const options: Record<string, string[]> = {
    Access: ['Free Ticket', 'Paid Ticket', 'Open', 'Invitation', 'Combination'],
    Security: ['Internal', 'External', 'Combination'],
    Risk: ['Low', 'Medium', 'High'],
  };
  return options[category] || [];
}

export default function ConsolidatedDispatchForm() {
  const [destinationRows, setDestinationRows] = useState(1);
  const maxDestinationRows = 4;
  const [ambulanceRows, setAmbulanceRows] = useState(1);
  const maxAmbulanceRows = 8;
  const [typeOfEventsOther, setTypeOfEventsOther] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>(
    'success'
  );
  const { user, loading } = useAuth();

  const [typeOfServiceOther, setTypeOfServiceOther] = useState('');
  const [crewCredentialOther, setCrewCredentialOther] = useState('');

  const [numberOfRows, setNumberOfRows] = useState(10);
  const maxRows = 20;
  const [sigData, setSigData] = useState<{ [key: string]: string }>({});
  const [sigPaths, setSigPaths] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigLoading, setIsSigLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [activeSig, setActiveSig] = useState<
    | 'teamLeader'
    | 'clientRepresentative'
    | 'EMSSupervisor'
    | 'md_signature'
    | null
  >(null);

  const addDestinationRow = () => {
    if (destinationRows < maxDestinationRows) {
      setDestinationRows((prev) => prev + 1);
    }
  };

  const removeDestinationRow = (indexToRemove: number) => {
    if (destinationRows > 1) {
      setDestinationRows((prev) => prev - 1);
      // Remove the specific destination from the data
      const lines = formData.point_of_destinations.split('\n');
      lines.splice(indexToRemove, 1);
      setFormData((prev) => ({
        ...prev,
        point_of_destinations: lines.join('\n'),
      }));
    }
  };

  const addAmbulanceRow = () => {
    if (ambulanceRows < maxAmbulanceRows) {
      setAmbulanceRows((prev) => prev + 1);
      // Extend the ambulance_models array to accommodate new row
      setFormData((prev) => ({
        ...prev,
        ambulance_models: [
          ...prev.ambulance_models,
          { model: '', plate_number: '', type: '' },
        ],
      }));
    }
  };

  const removeAmbulanceRow = (indexToRemove: number) => {
    if (ambulanceRows > 1) {
      setAmbulanceRows((prev) => prev - 1);
      // Remove the specific ambulance model from the array
      setFormData((prev) => ({
        ...prev,
        ambulance_models: prev.ambulance_models.filter(
          (_, index) => index !== indexToRemove
        ),
      }));
    }
  };

  const showNotificationMessage = (
    message: string,
    type: 'success' | 'error'
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!activeSig) return;

    setIsSigLoading(true);

    try {
      // Generate unique filename for each signature
      const timestamp = new Date().getTime();
      const filename = `trip_tickets/${activeSig}_signature_${timestamp}.png`;

      // Upload signature to storage
      const upload = await uploadFile({
        storage: 'signatures',
        path: filename,
        file: data.signature,
      });

      if (upload instanceof Error || !upload) {
        toast.error('Failed to upload signature', {
          description: 'An error occurred while uploading the signature.',
        });
        return;
      }

      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Update state with both display data and storage path
        setSigData((prev) => ({ ...prev, [activeSig]: base64String }));
        setSigPaths((prev) => ({ ...prev, [activeSig]: upload.path }));

        toast.success(`${activeSig} signature saved successfully`);
        setActiveSig(null);
      };
      reader.readAsDataURL(data.signature);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSigLoading(false);
    }
  };

  const getSignatureTitle = (key: string) => {
    const titles = {
      nurse: 'Nurse',
      billing: 'Admitting/Billing',
      ambulance: 'Ambulance Staff',
    };
    return titles[key as keyof typeof titles] || key;
  };

  const [formData, setFormData] = useState({
    // Remove the id field from here - let the database generate it
    // id: '', // Remove this line

    // Page 1 Fields
    event_title: '',
    event_type: 'PAID',
    event_owner: '',
    event_owner_contact: '',
    event_organizer: '',
    event_organizer_contact: '',
    event_date_time: '',
    event_duration: '',
    event_call_time: '',
    estimated_crowd: '',
    event_venue: '',
    type_of_events: 'Religious Gathering',
    venue_type: '',
    brief_concept_description: '',
    expected_vip_guest: '',
    crowd_access: 'Free Ticket',
    crowd_security: 'Internal',
    crowd_risk: 'Low',
    crowd_others: '',
    economic_class: 'A',
    crowd_type: '18-45',
    venue_safety_equipment: 'Extinguisher',

    // Page 2 Fields
    type_of_service: 'Manpower',
    type_of_service_other: '',
    crew_credential: 'EMT',
    crew_credential_other: '',
    number_of_crew: '',
    ambulance_models: [{ model: '', plate_number: '', type: '' }],
    md_names: '', // Single field instead of multi-line
    md_signature: '',
    point_of_destinations: '', // Will be managed by dynamic inputs
    special_consideration: '',

    // Patient Census
    treated_trauma: '',
    treated_medical: '',
    treated_rate_1: '',
    treated_rate_2: '',
    treated_waiver: '',
    transported_trauma: '',
    transported_medical: '',
    transported_rate_1: '',
    transported_rate_2: '',
    transported_insurance: '',
    refused_trauma: '',
    refused_medical: '',
    refused_rate_1: '',
    refused_rate_2: '',
    refused_pre_med_check: '',

    // Time Tracking
    dispatch_hrs: '',
    dispatch_min: '',
    dispatch_reading: '',
    on_scene_hrs: '',
    on_scene_min: '',
    on_scene_reading: '',
    departure_hrs: '',
    departure_min: '',
    departure_reading: '',
    arrival_hrs: '',
    arrival_min: '',
    arrival_reading: '',
    working_time_hrs: '',
    working_time_min: '',
    travel_time_hrs: '',
    travel_time_min: '',
    overall_hrs: '',
    overall_min: '',

    // Signatures
    team_leader_signature: '',
    client_representative_signature: '',
    ems_supervisor_signature: '',

    // Page 3 Fields
    page3_event_title: '',
    page3_total_crew: '',
    crew_data: Array(10)
      .fill(null)
      .map(() => ({
        name: '',
        title: '',
        position: '',
        time_in: '',
        time_out: '',
        signature: '',
      })),
    page3_team_leader_signature: '',
    page3_client_representative_signature: '',
    page3_ems_supervisor_signature: '',

    form_status: 'draft',
    current_page: '',
  });

  const addRow = () => {
    if (numberOfRows < maxRows) {
      setNumberOfRows((prev) => prev + 1);
    }
  };

  const handleCrewDataChange = (
    rowIndex: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      crew_data: prev.crew_data.map((crew, index) =>
        index === rowIndex ? { ...crew, [field]: value } : crew
      ),
    }));
  };

  const handleNumberOfCrewChange = (value: string) => {
    const numCrew = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      number_of_crew: value,
      crew_data: Array(numCrew)
        .fill(null)
        .map(
          (_, i) =>
            prev.crew_data[i] || {
              name: '',
              title: '',
              position: '',
              time_in: '',
              time_out: '',
              signature: '',
            }
        ),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      // Remove id: '', from here too

      // Page 1 Fields
      event_title: '',
      event_type: 'PAID',
      event_owner: '',
      event_owner_contact: '',
      event_organizer: '',
      event_organizer_contact: '',
      event_date_time: '',
      event_duration: '',
      event_call_time: '',
      estimated_crowd: '',
      event_venue: '',
      type_of_events: 'Religious Gathering',
      venue_type: '',
      brief_concept_description: '',
      expected_vip_guest: '',
      crowd_access: 'Free Ticket',
      crowd_security: 'Internal',
      crowd_risk: 'Low',
      crowd_others: '',
      economic_class: 'A',
      crowd_type: '18-45',
      venue_safety_equipment: 'Extinguisher',

      // Page 2 Fields
      type_of_service: 'Manpower',
      type_of_service_other: '',
      crew_credential: 'EMT',
      crew_credential_other: '',
      number_of_crew: '',
      ambulance_models: [{ model: '', plate_number: '', type: '' }],

      md_names: '',
      md_signature: '',
      point_of_destinations: '',
      special_consideration: '',

      // Patient Census
      treated_trauma: '',
      treated_medical: '',
      treated_rate_1: '',
      treated_rate_2: '',
      treated_waiver: '',
      transported_trauma: '',
      transported_medical: '',
      transported_rate_1: '',
      transported_rate_2: '',
      transported_insurance: '',
      refused_trauma: '',
      refused_medical: '',
      refused_rate_1: '',
      refused_rate_2: '',
      refused_pre_med_check: '',

      // Time Tracking
      dispatch_hrs: '',
      dispatch_min: '',
      dispatch_reading: '',
      on_scene_hrs: '',
      on_scene_min: '',
      on_scene_reading: '',
      departure_hrs: '',
      departure_min: '',
      departure_reading: '',
      arrival_hrs: '',
      arrival_min: '',
      arrival_reading: '',
      working_time_hrs: '',
      working_time_min: '',
      travel_time_hrs: '',
      travel_time_min: '',
      overall_hrs: '',
      overall_min: '',

      // Signatures
      team_leader_signature: '',
      client_representative_signature: '',
      ems_supervisor_signature: '',

      // Page 3 Fields
      page3_event_title: '',
      page3_total_crew: '',
      crew_data: Array(10)
        .fill(null)
        .map(() => ({
          name: '',
          title: '',
          position: '',
          time_in: '',
          time_out: '',
          signature: '',
        })),
      page3_team_leader_signature: '',
      page3_client_representative_signature: '',
      page3_ems_supervisor_signature: '',

      // Form Status
      form_status: 'draft',
      current_page: '',
    });
    setSigData({});
    setTypeOfEventsOther('');
    setTypeOfServiceOther('');
    setCrewCredentialOther('');
    setCurrentPage(1);
    setDestinationRows(1);
    setAmbulanceRows(1);
  };

  interface AmbulanceModel {
    model: string;
    plate_number: string;
    type: string;
  }

  type AmbulanceModelField = keyof AmbulanceModel;

  const handleAmbulanceModelChange = (
    index: number,
    field: AmbulanceModelField,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      ambulance_models: prev.ambulance_models.map((model, i) =>
        i === index ? { ...model, [field]: value } : model
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        form_status: 'draft',
        current_page: currentPage.toString(),
        md_signature: sigData.md_signature || '', // Remove .image
        team_leader_signature: sigData.teamLeader || '', // Remove .image
        client_representative_signature: sigData.clientRepresentative || '', // Remove .image
        ems_supervisor_signature: sigData.EMSSupervisor || '', // Remove .image
        type_of_service_other:
          formData.type_of_service === 'Others' ? typeOfServiceOther : '',
        crew_credential_other:
          formData.crew_credential === 'Others' ? crewCredentialOther : '',
        type_of_events:
          formData.type_of_events === 'Others'
            ? typeOfEventsOther
            : formData.type_of_events,
      };

      // Remove id field if it exists and is empty
      if ('id' in submitData && (!submitData.id || submitData.id === '')) {
        delete submitData.id;
      }

      const baseUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : window.location.origin;

      // Get the current session token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is logged in
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      console.log('Submitting form with user:', user.id);
      console.log('Session token available:', !!session?.access_token);

      const response = await fetch('/api/dispatch-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${
            errorData.error || 'Failed to submit form'
          }`
        );
      }

      const result = await response.json();
      const formId = result.id || result.data?.id;

      console.log('Form submitted successfully, ID:', formId);

      if (formId) {
        try {
          console.log('Creating form submission tracking...');

          const submissionResponse = await fetch(
            `${baseUrl}/api/form-submissions`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                form_type: 'dispatch_forms',
                reference_id: formId,
                status: 'pending',
                submitted_by: user.id,
                reviewed_by: null,
              }),
            }
          );

          if (!submissionResponse.ok) {
            const errorData = await submissionResponse.json().catch(() => ({}));
            console.error('Form submission tracking failed:', errorData);
            throw new Error(
              `Failed to create submission tracking: ${errorData.error}`
            );
          }

          const submissionResult = await submissionResponse.json();
          console.log('Form submission tracking created:', submissionResult);
        } catch (submissionError) {
          console.error(
            'Failed to create submission tracking:',
            submissionError
          );
        }
      }
      toast.success('Dispatch Form saved successfully!');

      resetForm();
      setSigData({});
      showNotificationMessage('Form submitted successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save dispatch form', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Don't render until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  const renderPage1 = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-bold border-b pb-4">
        Page 1: Event Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Event Title</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_title"
            value={formData.event_title}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Event Type</label>
          <select
            value={formData.event_type}
            name="event_type"
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
            onChange={handleInputChange}
            style={{ backgroundColor: '#0a0a0a', color: 'white' }}
          >
            {['PAID', 'CHARITY', 'BILLING', 'DISCOUNTED'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Event Owner</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_owner"
            value={formData.event_owner}
          />
          <label className="block font-medium mt-4 mb-2">Contact Details</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_owner_contact"
            value={formData.event_owner_contact}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Event Organizer</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_organizer"
            value={formData.event_organizer}
          />
          <label className="block font-medium mt-4 mb-2">Contact Details</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_organizer_contact"
            value={formData.event_organizer_contact}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Date and Time</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_date_time"
            value={formData.event_date_time}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Event Duration</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_duration"
            value={formData.event_duration}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Events Call Time</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_call_time"
            value={formData.event_call_time}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Estimated Crowd</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="estimated_crowd"
            value={formData.estimated_crowd}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block font-medium mb-2">Event Venue</label>
          <Input
            required
            type="text"
            className="w-full"
            onChange={handleInputChange}
            name="event_venue"
            value={formData.event_venue}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Type of Events</label>
          <select
            value={formData.type_of_events}
            name="type_of_events"
            onChange={handleInputChange}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
            style={{ backgroundColor: '#0a0a0a', color: 'white' }}
          >
            {[
              'Religious Gathering',
              'Exhibition/Trade Event',
              'Sport/Games Event',
              'Party',
              'Outbound',
              'Audition',
              'Festival',
              'Concert',
              'Show Taping',
              'Premier Night',
              'Others',
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Conditional input field for "Others" */}
          {formData.type_of_events === 'Others' && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Please specify the type of event"
                value={typeOfEventsOther}
                onChange={(e) => setTypeOfEventsOther(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
                style={{ backgroundColor: '#0a0a0a', color: 'white' }}
              />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-2">Venue Type</label>
          <select
            value={formData.venue_type}
            name="venue_type"
            onChange={handleInputChange}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
            style={{ backgroundColor: '#0a0a0a', color: 'white' }}
          >
            {['Indoor', 'Outdoor'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">
            Brief Concept Description
          </label>
          <Textarea
            rows={4}
            className="text-base"
            onChange={handleInputChange}
            name="brief_concept_description"
            value={formData.brief_concept_description}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Expected VIP / Guest</label>
          <Textarea
            rows={4}
            className="text-base"
            onChange={handleInputChange}
            name="expected_vip_guest"
            value={formData.expected_vip_guest}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold  border-b pb-2">
          Crowd Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Access', 'Security', 'Risk'].map((category) => (
            <div key={category}>
              <label className="block font-medium mb-2">{category}</label>
              <select
                name={`crowd_${category.toLowerCase()}`}
                value={
                  formData[
                    `crowd_${category.toLowerCase()}` as keyof typeof formData
                  ] as string
                }
                onChange={handleInputChange}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
                style={{ backgroundColor: '#0a0a0a', color: 'white' }}
              >
                {getCrowdOptions(category).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          Crowd Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Economic Class</label>
            <select
              value={formData.economic_class}
              name="economic_class"
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              onChange={handleInputChange}
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              {['A', 'B', 'C', 'D', 'E', 'MIXED', 'OTHERS'].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">Crowd Type</label>
            <select
              value={formData.crowd_type}
              name="crowd_type"
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              onChange={handleInputChange}
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              {[
                '3-7',
                '7-12',
                '12-18',
                '18-45',
                '45-60',
                '60-Above',
                'ALL AGES',
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Venue Safety Equipment</label>
        <select
          value={formData.venue_safety_equipment}
          name="venue_safety_equipment"
          className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
          onChange={handleInputChange}
          style={{ backgroundColor: '#0a0a0a', color: 'white' }}
        >
          {['Extinguisher', 'First Aid Kit', 'Fire Hose', 'SCBA', 'AED'].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-bold  border-b pb-4">
        Page 2: Service Details & Patient Census
      </h2>

      <div>
        <label className="block mb-2 font-medium">Type of Service</label>
        <SelectWithOthers
          options={['Manpower', 'Ambulance', 'Combination', 'Support Unit']}
          value={formData.type_of_service}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, type_of_service: val }))
          }
          otherValue={typeOfServiceOther}
          onOtherChange={setTypeOfServiceOther}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block font-medium">Ambulance Model</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {ambulanceRows} / {maxAmbulanceRows}
            </span>
            <Button
              type="button"
              onClick={addAmbulanceRow}
              disabled={ambulanceRows >= maxAmbulanceRows}
              size="sm"
              variant="outline"
              className="h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {formData.ambulance_models
            .slice(0, ambulanceRows)
            .map((model, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <Input
                    required
                    placeholder="Ambulance Model"
                    className="w-full"
                    value={model.model}
                    onChange={(e) =>
                      handleAmbulanceModelChange(index, 'model', e.target.value)
                    }
                  />
                  <Input
                    required
                    placeholder="Plate Number"
                    className="w-full"
                    value={model.plate_number}
                    onChange={(e) =>
                      handleAmbulanceModelChange(
                        index,
                        'plate_number',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    required
                    placeholder="Type"
                    className="w-full"
                    value={model.type}
                    onChange={(e) =>
                      handleAmbulanceModelChange(index, 'type', e.target.value)
                    }
                  />
                </div>
                {ambulanceRows > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeAmbulanceRow(index)}
                    size="sm"
                    variant="outline"
                    className=" px-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Crew Credentials</label>
        <SelectWithOthers
          options={['EMT', 'RN', 'EMR', 'COMBINATION']}
          value={formData.crew_credential}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, crew_credential: val }))
          }
          otherValue={crewCredentialOther}
          onOtherChange={setCrewCredentialOther}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-medium">Number of Crew</label>
          <Input
            required
            type="number"
            min="0"
            max="50"
            className="w-full"
            onChange={(e) => handleNumberOfCrewChange(e.target.value)}
            name="number_of_crew"
            value={formData.number_of_crew}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              MD Signature
            </label>
            <div
              className="bg-gray-50 border border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[80px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveSig('md_signature')}
            >
              {sigData['md_signature'] ? (
                <img
                  src={sigData['md_signature']}
                  alt="MD Signature"
                  className="max-h-[60px] md:max-h-[100px]"
                />
              ) : (
                <Plus className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <label className="text-xs text-gray-600">
              Signature over printed Name
            </label>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Full Name and Signature of MD
            </label>
            <Input
              required
              placeholder="MD Name"
              className="w-full"
              name="md_names"
              value={formData.md_names}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block font-medium">Point of Destination</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {destinationRows} / {maxDestinationRows}
            </span>
            <Button
              type="button"
              onClick={addDestinationRow}
              disabled={destinationRows >= maxDestinationRows}
              size="sm"
              variant="outline"
              className="h-8 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: destinationRows }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                required
                placeholder={`${i + 1})`}
                className="w-full flex-1"
                name={`destination_${i}`}
                value={formData.point_of_destinations.split('\n')[i] || ''}
                onChange={(e) => {
                  const lines = formData.point_of_destinations.split('\n');
                  lines[i] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    point_of_destinations: lines.join('\n'),
                  }));
                }}
              />
              {destinationRows > 1 && (
                <Button
                  type="button"
                  onClick={() => removeDestinationRow(i)}
                  size="sm"
                  variant="outline"
                  className="h-10 px-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Special Consideration</label>
        <Textarea
          className="text-base"
          onChange={handleInputChange}
          name="special_consideration"
          value={formData.special_consideration}
        />
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Patient Census</h3>

        {/* Treated Row */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
          <span className="font-medium">Treated</span>
          <div className="flex items-center gap-2">
            <label className="text-sm">Trauma</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="treated_trauma"
              value={formData.treated_trauma}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Medical</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="treated_medical"
              value={formData.treated_medical}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="treated_rate_1"
              value={formData.treated_rate_1}
            />
            <span className="text-sm">/</span>
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="treated_rate_2"
              value={formData.treated_rate_2}
            />
          </div>
          <span className="text-sm">WAIVER</span>
          <div className="col-span-3">
            <select
              name="treated_waiver"
              value={formData.treated_waiver}
              onChange={handleInputChange}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
              <option value="NA">N/A</option>
            </select>
          </div>
        </div>

        {/* Transported Row */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
          <span className="font-medium">Transported</span>
          <div className="flex items-center gap-2">
            <label className="text-sm">Trauma</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="transported_trauma"
              value={formData.transported_trauma}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Medical</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="transported_medical"
              value={formData.transported_medical}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="transported_rate_1"
              value={formData.transported_rate_1}
            />
            <span className="text-sm">/</span>
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="transported_rate_2"
              value={formData.transported_rate_2}
            />
          </div>
          <span className="text-sm">INSURANCE</span>
          <div className="col-span-3">
            <select
              name="transported_insurance"
              value={formData.transported_insurance}
              onChange={handleInputChange}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
              <option value="NA">N/A</option>
            </select>
          </div>
        </div>

        {/* Refused Row */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
          <span className="font-medium">Refused</span>
          <div className="flex items-center gap-2">
            <label className="text-sm">Trauma</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="refused_trauma"
              value={formData.refused_trauma}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Medical</label>
            <Input
              placeholder="#"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="refused_medical"
              value={formData.refused_medical}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="refused_rate_1"
              value={formData.refused_rate_1}
            />
            <span className="text-sm">/</span>
            <Input
              placeholder="Rate"
              className="h-8 text-sm w-20"
              onChange={handleInputChange}
              name="refused_rate_2"
              value={formData.refused_rate_2}
            />
          </div>
          <span className="text-sm">PRE-MED CHECK</span>
          <div className="col-span-3">
            <select
              name="refused_pre_med_check"
              value={formData.refused_pre_med_check}
              onChange={handleInputChange}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto md:w-full"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
              <option value="NA">N/A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Time Records</h3>
        {['Dispatch', 'On Scene', 'Departure', 'Arrival'].map((stage) => (
          <div
            key={stage}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
          >
            <label className="font-medium">{stage}</label>
            <Input
              placeholder="HRS"
              name={`${stage.toLowerCase().replace(' ', '_')}_hrs`}
              value={
                formData[
                  `${stage
                    .toLowerCase()
                    .replace(' ', '_')}_hrs` as keyof typeof formData
                ] as string
              }
              className="h-10 text-base"
              onChange={handleInputChange}
            />
            <Input
              placeholder="MIN"
              name={`${stage.toLowerCase().replace(' ', '_')}_min`}
              value={
                formData[
                  `${stage
                    .toLowerCase()
                    .replace(' ', '_')}_min` as keyof typeof formData
                ] as string
              }
              className="h-10 text-base"
              onChange={handleInputChange}
            />
            <Input
              placeholder="READING"
              name={`${stage.toLowerCase().replace(' ', '_')}_reading`}
              value={
                formData[
                  `${stage
                    .toLowerCase()
                    .replace(' ', '_')}_reading` as keyof typeof formData
                ] as string
              }
              className="h-10 text-base"
              onChange={handleInputChange}
            />
          </div>
        ))}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Time Records</h3>

          {/* Working Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium">Working Time</label>
            <Input
              placeholder="HRS"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="working_time_hrs"
              value={formData.working_time_hrs}
            />
            <Input
              placeholder="MIN"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="working_time_min"
              value={formData.working_time_min}
            />
          </div>

          {/* Travel Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium">Travel Time</label>
            <Input
              placeholder="HRS"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="travel_time_hrs"
              value={formData.travel_time_hrs}
            />
            <Input
              placeholder="MIN"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="travel_time_min"
              value={formData.travel_time_min}
            />
          </div>

          {/* Overall Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium">Over-all</label>
            <Input
              placeholder="HRS"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="overall_hrs"
              value={formData.overall_hrs}
            />
            <Input
              placeholder="MIN"
              className="h-10 text-base"
              onChange={handleInputChange}
              name="overall_min"
              value={formData.overall_min}
            />
          </div>
        </div>
      </div>

      {/* Signatures section - also appears on Page 2 */}
      <div className="space-y-6 mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold border-b pb-2">Signatures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Team Leader',
              signatureLabel: 'Prepared and Filled by',
              key: 'teamLeader',
            },
            {
              label: 'Client Representative',
              signatureLabel: 'Conformed by',
              key: 'clientRepresentative',
            },
            {
              label: 'EMS Supervisor',
              signatureLabel: 'Noted by',
              key: 'EMSSupervisor',
            },
          ].map(({ label, signatureLabel, key }) => (
            <div key={key}>
              <label className="block mb-2 font-medium">
                {signatureLabel} ({label})
              </label>
              <div
                className="border bg-gray-50 border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setActiveSig(key as typeof activeSig)}
              >
                {sigData[key] ? (
                  <img
                    src={sigData[key]}
                    alt={`${label} signature`}
                    className="max-h-[100px]"
                  />
                ) : (
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to add signature
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPage3 = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-bold border-b pb-4">
        Page 3: Crew Attendance & Signatures
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="font-medium block mb-2">Event Title</label>
          <Input
            required
            type="text"
            className="w-full text-base"
            onChange={handleInputChange}
            name="page3_event_title"
            value={formData.page3_event_title}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Total Crew</label>
          <Input
            required
            type="number"
            className="w-full text-base"
            onChange={handleInputChange}
            name="page3_total_crew"
            value={formData.page3_total_crew}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Crew Attendance</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Rows: {numberOfRows} / {maxRows}
            </div>
            <Button
              onClick={addRow}
              disabled={numberOfRows >= maxRows}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Row
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="text-left">
                  {[
                    'No.',
                    'Name',
                    'Title',
                    'Position',
                    'IN',
                    'OUT',
                    'Signature',
                  ].map((head, idx) => (
                    <th key={idx} className="p-3 border-b font-medium">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numberOfRows }, (_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-center">{i + 1}</td>
                    {(
                      [
                        'name',
                        'title',
                        'position',
                        'time_in',
                        'time_out',
                        'signature',
                      ] as (keyof (typeof formData.crew_data)[number])[]
                    ).map((field, j) => (
                      <td key={j} className="p-2">
                        <Input
                          className="h-8 text-sm"
                          value={formData.crew_data[i]?.[field] || ''}
                          onChange={(e) =>
                            handleCrewDataChange(i, field, e.target.value)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Signatures section - only appears on Page 3 */}
      <div className="space-y-6 mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold border-b pb-2">Signatures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Team Leader',
              signatureLabel: 'Prepared and Filled by',
              key: 'teamLeader',
            },
            {
              label: 'Client Representative',
              signatureLabel: 'Conformed by',
              key: 'clientRepresentative',
            },
            {
              label: 'EMS Supervisor',
              signatureLabel: 'Noted by',
              key: 'EMSSupervisor',
            },
          ].map(({ label, signatureLabel, key }) => (
            <div key={key}>
              <label className="block mb-2 font-medium">
                {signatureLabel} ({label})
              </label>
              <div
                className="border bg-gray-50 border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setActiveSig(key as typeof activeSig)}
              >
                {sigData[key] ? (
                  <img
                    src={sigData[key]}
                    alt={`${label} signature`}
                    className="max-h-[100px]"
                  />
                ) : (
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to add signature
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // const renderSignatures = () => (
  //   <div className="space-y-6">
  //     <h3 className="text-lg font-semibold  border-b pb-2">Signatures</h3>
  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //       {[
  //         {
  //           label: 'Team Leader',
  //           signatureLabel: 'Prepared and Filled by',
  //           key: 'teamLeader',
  //         },
  //         {
  //           label: 'Client Representative',
  //           signatureLabel: 'Conformed by',
  //           key: 'clientRepresentative',
  //         },
  //         {
  //           label: 'EMS Supervisor',
  //           signatureLabel: 'Noted by',
  //           key: 'EMSSupervisor',
  //         },
  //       ].map(({ label, signatureLabel, key }) => (
  //         <div key={key}>
  //           <label className="block mb-2 font-medium">
  //             {signatureLabel} ({label})
  //           </label>
  //           <div
  //             className="border bg-gray-50 border-dashed border-gray-400 p-4 rounded-md flex items-center justify-center min-h-[120px] hover:bg-gray-100 cursor-pointer transition-colors"
  //             onClick={() => setActiveSig(key as typeof activeSig)}
  //           >
  //             {sigData[key] ? (
  //               <img
  //                 src={sigData[key]}
  //                 alt={`${label} signature`}
  //                 className="max-h-[100px]"
  //               />
  //             ) : (
  //               <div className="text-center">
  //                 <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
  //                 <span className="text-sm text-gray-500">
  //                   Click to add signature
  //                 </span>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen">
      <div className="max-full p-6">
        {/* Notification */}
        {showNotification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              notificationType === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {notificationType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notificationMessage}
          </div>
        )}

        {/* Header */}
        <div className=" rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                Transcare Emergency Medical Services
              </h1>
              <p className="">Operation Dispatch Form</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className=" rounded-lg shadow-sm p-8">
          {currentPage === 1 && renderPage1()}
          {currentPage === 2 && renderPage2()}
          {currentPage === 3 && renderPage3()}

          {/* Signatures section appears on all pages */}
          {/* <div className="mt-12 pt-8 border-t">{renderSignatures()}</div> */}
        </div>
        {/* Action Buttons */}
        <div className=" rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCurrentPage(1)}
                variant={currentPage === 1 ? 'default' : 'outline'}
                size="sm"
              >
                Page 1
              </Button>
              <Button
                onClick={() => setCurrentPage(2)}
                variant={currentPage === 2 ? 'default' : 'outline'}
                size="sm"
              >
                Page 2
              </Button>
              <Button
                onClick={() => setCurrentPage(3)}
                variant={currentPage === 3 ? 'default' : 'outline'}
                size="sm"
              >
                Page 3
              </Button>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                className="mt-6"
                onClick={handleSubmit}
                disabled={isSubmitting || loading || !user}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>

              {!user && !loading && (
                <p className="text-red-500 mt-2">
                  Please log in to submit the form
                </p>
              )}
            </div>
          </div>
        </div>
        <Dialog.Root
          open={!!activeSig}
          onOpenChange={(open) => !open && setActiveSig(null)}
        >
          <Dialog.Portal>
            <Dialog.Title>
              <VisuallyHidden>
                {activeSig
                  ? `${getSignatureTitle(activeSig)} Signature`
                  : 'Signature Dialog'}
              </VisuallyHidden>
            </Dialog.Title>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    {activeSig
                      ? `${getSignatureTitle(activeSig)} E-Signature`
                      : 'E-Signature'}
                  </h2>
                  <Dialog.Close asChild>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveSig(null)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <SignatureForm
                    onSubmit={handleSignatureSubmit}
                    defaultSignature={sigPaths[activeSig || '']}
                    loading={isSigLoading}
                  />
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
