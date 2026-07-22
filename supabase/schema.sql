create extension if not exists "pgcrypto";

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null,
  headline text not null,
  body text not null,
  hero_image_url text not null,
  hero_image_alt text not null,
  cta_1_label text not null,
  cta_1_href text not null,
  cta_1_external boolean not null default false,
  cta_2_label text not null,
  cta_2_href text not null,
  email_href text not null,
  instagram_href text not null,
  updated_at timestamptz not null default now()
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text', 'image', 'button', 'gallery')),
  position integer not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table blocks enable row level security;

create policy "Public read site_settings" on site_settings
  for select using (true);

create policy "Public read blocks" on blocks
  for select using (true);

create policy "Authenticated write site_settings" on site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated write blocks" on blocks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into site_settings (
  eyebrow, headline, body, hero_image_url, hero_image_alt,
  cta_1_label, cta_1_href, cta_1_external,
  cta_2_label, cta_2_href,
  email_href, instagram_href
)
select
  'Your Wedding Story',
  'Wedding Content Creation & Storymaking',
  'Keep the memories of your big day alive through authentic content that captures every meaningful moment, allowing you to relive your wedding story from a whole new perspective.',
  'https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13',
  'Bridal bouquet resting on a veil',
  'Enquire About Your Wedding Day',
  'https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e',
  true,
  'Send Me An Email',
  'mailto:geral@melaniefernandes.com',
  'mailto:geral@melaniefernandes.com',
  'https://www.instagram.com/yourweddingstory_/'
where not exists (select 1 from site_settings);
