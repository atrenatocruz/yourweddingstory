-- Migration 003: make the contact form's fields editable from the admin,
-- the same way page content already is.
--
-- Safe to run once on the live project. Idempotent: the seed only runs if
-- the table is empty, so re-running this script is a no-op after the first
-- run.

create table if not exists contact_form_fields (
  id uuid primary key default gen_random_uuid(),
  position integer not null,
  label text not null,
  type text not null check (type in ('text', 'email', 'tel', 'date', 'number', 'textarea')),
  required boolean not null default false,
  placeholder text,
  created_at timestamptz not null default now()
);

alter table contact_form_fields enable row level security;

create policy "Public read contact_form_fields" on contact_form_fields
  for select using (true);

create policy "Authenticated write contact_form_fields" on contact_form_fields
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into contact_form_fields (position, label, type, required, placeholder)
select * from (values
  (0, 'Your Full Name', 'text', true, null),
  (1, 'Your Fiancé''s Full Name', 'text', true, null),
  (2, 'Email Address', 'email', true, null),
  (3, 'Mobile Phone Number', 'tel', false, null),
  (4, 'Wedding Date', 'date', true, null),
  (5, 'Venue Name', 'text', true, null),
  (6, 'Estimate Guest Count', 'number', false, null),
  (7, 'What is your vision for your wedding?', 'textarea', false, 'Please provide some details about your special day!'),
  (8, 'What type of content would you like me to create?', 'textarea', false, 'Tell me everything you would like me to know!')
) as seed(position, label, type, required, placeholder)
where not exists (select 1 from contact_form_fields);
