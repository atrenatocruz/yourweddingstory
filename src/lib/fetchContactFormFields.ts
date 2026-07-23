import { supabase } from './supabase'
import type { ContactFormField } from '../types/content'

export async function fetchContactFormFields(): Promise<ContactFormField[]> {
  const { data, error } = await supabase
    .from('contact_form_fields')
    .select('id, position, label, type, required, placeholder')
    .order('position')

  if (error || !data) {
    return []
  }

  return data as unknown as ContactFormField[]
}
