/**
 * Utility functions for form type transformations
 */

/**
 * Convert database form type (snake_case) to display format (Title Case)
 * Example: "dispatch_form" -> "Dispatch Form"
 */
export function formatFormTypeForDisplay(formType: string): string {
  return formType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert display format (with spaces) to database format (snake_case)
 * Example: "Dispatch Form" -> "dispatch_form"
 */
export function formatFormTypeForDatabase(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/\s+/g, '_');
}

/**
 * Check if a search term matches either the database format or display format of a form type
 * This allows users to search using either "dispatch_form" or "Dispatch Form"
 */
export function formTypeMatchesSearch(formType: string, searchTerm: string): boolean {
  const dbFormat = formType.toLowerCase();
  const displayFormat = formatFormTypeForDisplay(formType).toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  return dbFormat.includes(searchLower) || displayFormat.includes(searchLower);
}

/**
 * Get all possible search variations for a form type
 * Returns both database format and display format variations
 */
export function getFormTypeSearchVariations(formType: string): string[] {
  const dbFormat = formType.toLowerCase();
  const displayFormat = formatFormTypeForDisplay(formType).toLowerCase();
  
  // Return unique variations
  return Array.from(new Set([dbFormat, displayFormat]));
}
