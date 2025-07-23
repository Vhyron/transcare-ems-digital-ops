/**
 * Test file to verify form type utility functions work correctly
 * Run this manually to test the transformations
 */

import { formatFormTypeForDisplay, formTypeMatchesSearch } from './form-type-utils';

// Test the actual form types used in the system
const testFormTypes = [
  'dispatch_forms',
  'hospital_trip_tickets', 
  'advance_directives',
  'refusal_forms',
  'conduction_refusal_forms',
  'operation_census_records'
];

console.log('=== Form Type Display Transformations ===');
testFormTypes.forEach(formType => {
  const display = formatFormTypeForDisplay(formType);
  console.log(`${formType} -> ${display}`);
});

console.log('\n=== Search Matching Tests ===');
const searchTests = [
  { formType: 'dispatch_forms', searchTerm: 'dispatch', shouldMatch: true },
  { formType: 'dispatch_forms', searchTerm: 'Dispatch', shouldMatch: true },
  { formType: 'dispatch_forms', searchTerm: 'Dispatch Forms', shouldMatch: true },
  { formType: 'dispatch_forms', searchTerm: 'dispatch forms', shouldMatch: true },
  { formType: 'hospital_trip_tickets', searchTerm: 'hospital', shouldMatch: true },
  { formType: 'hospital_trip_tickets', searchTerm: 'Trip Ticket', shouldMatch: true },
  { formType: 'hospital_trip_tickets', searchTerm: 'Hospital Trip', shouldMatch: true },
  { formType: 'advance_directives', searchTerm: 'advance', shouldMatch: true },
  { formType: 'advance_directives', searchTerm: 'Advance Directives', shouldMatch: true },
  { formType: 'refusal_forms', searchTerm: 'refusal', shouldMatch: true },
  { formType: 'refusal_forms', searchTerm: 'Refusal Forms', shouldMatch: true },
  { formType: 'conduction_refusal_forms', searchTerm: 'conduction', shouldMatch: true },
  { formType: 'conduction_refusal_forms', searchTerm: 'Conduction Refusal', shouldMatch: true },
  { formType: 'operation_census_records', searchTerm: 'census', shouldMatch: true },
  { formType: 'operation_census_records', searchTerm: 'Operation Census', shouldMatch: true },
  { formType: 'dispatch_forms', searchTerm: 'random', shouldMatch: false },
];

searchTests.forEach(test => {
  const result = formTypeMatchesSearch(test.formType, test.searchTerm);
  const status = result === test.shouldMatch ? '✓' : '✗';
  console.log(`${status} "${test.formType}" matches "${test.searchTerm}": ${result}`);
});

export { }; // Make this a module
