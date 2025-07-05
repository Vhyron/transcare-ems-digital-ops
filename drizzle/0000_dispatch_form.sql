-- Create dispatch_forms table
CREATE TABLE dispatch_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Page 1 Fields
    event_title TEXT,
    event_type TEXT,
    event_owner TEXT,
    event_owner_contact TEXT,
    event_organizer TEXT,
    event_organizer_contact TEXT,
    event_date_time TEXT,
    event_duration TEXT,
    event_call_time TEXT,
    estimated_crowd TEXT,
    event_venue TEXT,
    type_of_events TEXT,
    venue_type TEXT,
    brief_concept_description TEXT,
    expected_vip_guest TEXT,
    
    -- Crowd Management
    crowd_access TEXT,
    crowd_security TEXT,
    crowd_risk TEXT,
    crowd_others TEXT,
    
    -- Crowd Information
    economic_class TEXT,
    crowd_type TEXT,
    venue_safety_equipment TEXT,
    
    -- Page 2 Fields
    type_of_service TEXT,
    type_of_service_other TEXT,
    crew_credential TEXT,
    crew_credential_other TEXT,
    number_of_crew TEXT,
    
    -- Ambulance Models (JSON array)
    ambulance_models JSONB DEFAULT '[]',
    
    -- MD Names (JSON array)
    md_names JSONB DEFAULT '[]',
    
    -- Point of Destinations (JSON array)
    point_of_destinations JSONB DEFAULT '[]',
    
    special_consideration TEXT,
    
    -- Patient Census
    treated_trauma INTEGER DEFAULT 0,
    treated_medical INTEGER DEFAULT 0,
    treated_rate_1 TEXT,
    treated_rate_2 TEXT,
    treated_waiver TEXT,
    
    transported_trauma INTEGER DEFAULT 0,
    transported_medical INTEGER DEFAULT 0,
    transported_rate_1 TEXT,
    transported_rate_2 TEXT,
    transported_insurance TEXT,
    
    refused_trauma INTEGER DEFAULT 0,
    refused_medical INTEGER DEFAULT 0,
    refused_rate_1 TEXT,
    refused_rate_2 TEXT,
    refused_pre_med_check TEXT,
    
    -- Time Tracking
    dispatch_hrs TEXT,
    dispatch_min TEXT,
    dispatch_reading TEXT,
    
    on_scene_hrs TEXT,
    on_scene_min TEXT,
    on_scene_reading TEXT,
    
    departure_hrs TEXT,
    departure_min TEXT,
    departure_reading TEXT,
    
    arrival_hrs TEXT,
    arrival_min TEXT,
    arrival_reading TEXT,
    
    working_time_hrs TEXT,
    working_time_min TEXT,
    
    travel_time_hrs TEXT,
    travel_time_min TEXT,
    
    overall_hrs TEXT,
    overall_min TEXT,
    
    -- Signatures (Base64 encoded images)
    team_leader_signature TEXT,
    client_representative_signature TEXT,
    ems_supervisor_signature TEXT,
    
    -- Page 3 Fields
    page3_event_title TEXT,
    page3_total_crew INTEGER,
    
    -- Crew Data (JSON array)
    crew_data JSONB DEFAULT '[]',
    
    -- Page 3 Signatures
    page3_team_leader_signature TEXT,
    page3_client_representative_signature TEXT,
    page3_ems_supervisor_signature TEXT,
    
    -- Form Status
    form_status TEXT DEFAULT 'draft', -- draft, completed, submitted
    current_page INTEGER DEFAULT 1
);

-- Create indexes for better performance
CREATE INDEX idx_dispatch_forms_created_at ON dispatch_forms(created_at);
CREATE INDEX idx_dispatch_forms_event_title ON dispatch_forms(event_title);
CREATE INDEX idx_dispatch_forms_form_status ON dispatch_forms(form_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dispatch_forms_updated_at 
    BEFORE UPDATE ON dispatch_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();