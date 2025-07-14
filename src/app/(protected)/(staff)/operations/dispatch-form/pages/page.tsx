'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/provider/auth-provider';

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
        className="border border-gray-300 rounded-md px-3 py-2 w-full"
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

  const teamLeaderSigRef = useRef<SignatureCanvas | null>(null);
  const clientRepresentativeSigRef = useRef<SignatureCanvas | null>(null);
  const emsSupervisorSigRef = useRef<SignatureCanvas | null>(null);
  const [sigCanvasSize, setSigCanvasSize] = useState({
    width: 950,
    height: 750,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalCanvasRef = useRef<HTMLDivElement | null>(null);
  const [activeSig, setActiveSig] = useState<
    'teamLeader' | 'clientRepresentative' | 'EMSSupervisor' | null
  >(null);
  const [sigData, setSigData] = useState<{
    [key: string]: { image: string; name: string };
  }>({});

  const showNotificationMessage = (
    message: string,
    type: 'success' | 'error'
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
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
    ambulance_models: [
      { model: '', plate_number: '', type: '' },
      { model: '', plate_number: '', type: '' },
      { model: '', plate_number: '', type: '' },
      { model: '', plate_number: '', type: '' },
    ],
    md_names: '',
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

    form_status: 'draft',
    current_page: '',
  });

  const clearSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current) {
      ref.current.clear();
    }
  };

  const uploadSig = () => {
    const ref = getRefByType(activeSig);
    if (ref?.current && !ref.current.isEmpty() && activeSig) {
      const dataUrl = ref.current.getTrimmedCanvas().toDataURL('image/png');

      setSigData((prev) => ({
        ...prev,
        [activeSig]: {
          image: dataUrl,
          name: prev[activeSig]?.name || '',
        },
      }));

      setActiveSig(null);
    }
  };

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
  const getRefByType = (
    type: 'teamLeader' | 'clientRepresentative' | 'EMSSupervisor' | null
  ) => {
    if (type === 'teamLeader') return teamLeaderSigRef;
    if (type === 'clientRepresentative') return clientRepresentativeSigRef;
    if (type === 'EMSSupervisor') return emsSupervisorSigRef;
    return null;
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
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      const ref = getRefByType(activeSig);
      if (ref?.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = ref.current!.getCanvas().getContext('2d');
          ctx?.clearRect(
            0,
            0,
            ref.current!.getCanvas().width,
            ref.current!.getCanvas().height
          );
          ctx?.drawImage(
            img,
            0,
            0,
            ref.current!.getCanvas().width,
            ref.current!.getCanvas().height
          );
        };
        img.src = imageData;
      }
    };
    reader.readAsDataURL(file);
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
      ambulance_models: [
        { model: '', plate_number: '', type: '' },
        { model: '', plate_number: '', type: '' },
        { model: '', plate_number: '', type: '' },
        { model: '', plate_number: '', type: '' },
      ],
      md_names: '',
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
    setTypeOfServiceOther('');
    setCrewCredentialOther('');
    setCurrentPage(1);
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
        team_leader_signature: sigData.teamLeader?.image || '',
        client_representative_signature:
          sigData.clientRepresentative?.image || '',
        ems_supervisor_signature: sigData.EMSSupervisor?.image || '',
        type_of_service_other:
          formData.type_of_service === 'Others' ? typeOfServiceOther : '',
        crew_credential_other:
          formData.crew_credential === 'Others' ? crewCredentialOther : '',
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
      alert('Saved successfully!');

      resetForm();
      setSigData({});
      showNotificationMessage('Form submitted successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showNotificationMessage('Failed to submit form', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const ref = getRefByType(activeSig);
    const dataUrl = sigData[activeSig || ''];
    if (ref?.current && dataUrl) {
      ref.current.clear();
      (ref.current as any).loadFromDataURL(dataUrl);
    }
  }, [activeSig, sigData]);

  useEffect(() => {
    if (modalCanvasRef.current) {
      const width = modalCanvasRef.current.offsetWidth;
      const height = 750;
      setSigCanvasSize({ width, height });
    }
  }, [activeSig]);

  useEffect(() => {
    if (activeSig && sigData[activeSig]) {
      const ref = getRefByType(activeSig);
      if (ref?.current) {
        const img = new Image();
        img.onload = () => {
          const canvas = ref.current!.getCanvas();
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = sigData[activeSig].image;
      }
    }
  }, [activeSig]);

  const renderPage1 = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-bold border-b pb-4">
        Page 1: Event Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Event Title</label>
          <Input
            type="text"
            className="h-10 text-base"
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
            className="w-full h-10 border rounded px-3 text-base"
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
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="event_owner"
            value={formData.event_owner}
          />
          <label className="block font-medium mt-4 mb-2">Contact Details</label>
          <Input
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="event_owner_contact"
            value={formData.event_owner_contact}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Event Organizer</label>
          <Input
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="event_organizer"
            value={formData.event_organizer}
          />
          <label className="block font-medium mt-4 mb-2">Contact Details</label>
          <Input
            type="text"
            className="h-10 text-base"
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
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="event_date_time"
            value={formData.event_date_time}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Event Duration</label>
          <Input
            type="text"
            className="h-10 text-base"
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
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="event_call_time"
            value={formData.event_call_time}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Estimated Crowd</label>
          <Input
            type="text"
            className="h-10 text-base"
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
            type="text"
            className="h-10 text-base"
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
            className="w-full h-10 border rounded px-3 text-base"
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
        </div>
        <div>
          <label className="block font-medium mb-2">Venue Type</label>
          <select
            value={formData.venue_type}
            name="venue_type"
            className="w-full h-10 border rounded px-3 text-base"
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
                className="w-full h-10 border rounded px-3 text-base"
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
              className="w-full h-10 border rounded px-3 text-base"
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
              className="w-full h-10 border rounded px-3 text-base"
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
          className="w-full h-10 border rounded px-3 text-base"
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
        <label className="block mb-2 font-medium">Ambulance Model</label>
        <div className="space-y-2">
          {formData.ambulance_models.map((model, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Ambulance Model"
                className="h-10 text-base"
                value={model.model}
                onChange={(e) =>
                  handleAmbulanceModelChange(index, 'model', e.target.value)
                }
              />
              <Input
                placeholder="Plate Number"
                className="h-10 text-base"
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
                placeholder="Type"
                className="h-10 text-base"
                value={model.type}
                onChange={(e) =>
                  handleAmbulanceModelChange(index, 'type', e.target.value)
                }
              />
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
            type="number"
            min="0"
            max="50"
            className="h-10 text-base"
            onChange={(e) => handleNumberOfCrewChange(e.target.value)}
            name="number_of_crew"
            value={formData.number_of_crew}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">
            Full Name and Signature of MD
          </label>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((num, i) => (
              <Input
                key={i}
                placeholder={`MD ${num}`}
                className="h-10 text-base"
                name={`md_name_${i}`}
                value={formData.md_names.split('\n')[i] || ''}
                onChange={(e) => {
                  const lines = formData.md_names.split('\n');
                  lines[i] = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    md_names: lines.join('\n'),
                  }));
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Point of Destination</label>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((num, i) => (
            <Input
              key={i}
              placeholder={`${num})`}
              className="h-10 text-base"
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
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="">Select</option>
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
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="">Select</option>
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
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              style={{ backgroundColor: '#0a0a0a', color: 'white' }}
            >
              <option value="">Select</option>
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
            type="text"
            className="h-10 text-base"
            onChange={handleInputChange}
            name="page3_event_title"
            value={formData.page3_event_title}
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Total Crew</label>
          <Input
            type="number"
            className="h-10 text-base"
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
    </div>
  );

  const renderSignatures = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold  border-b pb-2">Signatures</h3>
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
                  src={sigData[key]?.image}
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
  );

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

        {/* Form Content */}
        <div className=" rounded-lg shadow-sm p-8">
          {currentPage === 1 && renderPage1()}
          {currentPage === 2 && renderPage2()}
          {currentPage === 3 && renderPage3()}

          {/* Signatures section appears on all pages */}
          <div className="mt-12 pt-8 border-t">{renderSignatures()}</div>
        </div>

        {/* Signature Modal */}
        <Dialog.Root
          open={!!activeSig}
          onOpenChange={(open) => !open && setActiveSig(null)}
        >
          <Dialog.Portal>
            <Dialog.Title>
              <VisuallyHidden>Signature Dialog</VisuallyHidden>
            </Dialog.Title>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className=" p-6 rounded-lg shadow-lg relative w-full max-w-[1000px] h-[800px] flex flex-col">
                <Dialog.Close asChild>
                  <button
                    className="absolute right-6 top-6 text-gray-700 hover:text-black"
                    onClick={() => setActiveSig(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Close>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Add Signature</h3>
                  <p className="text-gray-600">
                    Draw your signature or upload an image
                  </p>
                </div>

                <div ref={modalCanvasRef} className="flex-1 mb-4">
                  <SignatureCanvas
                    ref={getRefByType(activeSig)}
                    penColor="black"
                    canvasProps={{
                      width: sigCanvasSize.width,
                      height: sigCanvasSize.height,
                      className: 'bg-gray-100 rounded shadow ',
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="sig-upload"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="sig-upload">
                      <Button size="sm" variant="secondary" type="button">
                        Upload
                      </Button>
                    </label>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={clearSig}
                      type="button"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveSig(null)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={uploadSig} type="button">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
