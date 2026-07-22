-- Migration 002: unify fixed site_settings fields into the draggable blocks
-- list, and add appearance (color) settings.
--
-- Safe to run once on the live project. Idempotent: re-running it is a no-op
-- if the migration already happened (checked via the presence of the new
-- block types). Does not drop any existing columns -- eyebrow/headline/body/
-- cta_1_*/cta_2_*/email_href/instagram_href stay in site_settings, unused by
-- the app going forward, so nothing is destroyed if anything needs a rollback.

alter table site_settings add column if not exists bg_color text not null default '#F1ECE6';
alter table site_settings add column if not exists card_color text not null default '#FFFFFF';
alter table site_settings add column if not exists text_color text not null default '#222222';

alter table blocks drop constraint if exists blocks_type_check;
alter table blocks add constraint blocks_type_check
  check (type in ('eyebrow', 'headline', 'bodytext', 'text', 'image', 'button', 'gallery', 'social-icons'));

do $$
declare
  s record;
  already_migrated boolean;
begin
  select exists(
    select 1 from blocks where type in ('eyebrow', 'headline', 'bodytext', 'social-icons')
  ) into already_migrated;

  if already_migrated then
    return;
  end if;

  select * into s from site_settings limit 1;
  if s is null then
    return;
  end if;

  update blocks set position = position + 6;

  insert into blocks (type, position, data) values
    ('eyebrow', 0, jsonb_build_object('text', s.eyebrow)),
    ('headline', 1, jsonb_build_object('text', s.headline)),
    ('bodytext', 2, jsonb_build_object('text', s.body)),
    ('button', 3, jsonb_build_object('label', s.cta_1_label, 'href', s.cta_1_href, 'external', s.cta_1_external)),
    ('button', 4, jsonb_build_object('label', s.cta_2_label, 'href', s.cta_2_href, 'external', false)),
    (
      'social-icons',
      5,
      jsonb_build_object(
        'icons',
        jsonb_build_array(
          jsonb_build_object('platform', 'email', 'href', s.email_href),
          jsonb_build_object('platform', 'instagram', 'href', s.instagram_href)
        )
      )
    );
end $$;
