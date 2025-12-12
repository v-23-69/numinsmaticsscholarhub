-- FIX: Update handle_new_user to use correct column name (display_name instead of full_name)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name', -- We map auth metadata 'full_name' to table column 'display_name'
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;
