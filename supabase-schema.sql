-- MarketLab production classroom schema
-- Run this entire file once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role text not null default 'student' check (role in ('student','teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  period text,
  code text not null unique check (char_length(code) between 4 and 10),
  starting_cash numeric(16,4) not null default 100000 check (starting_cash > 0),
  trading_enabled boolean not null default true,
  public_holdings boolean not null default false,
  allow_fractional boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student','teacher')),
  joined_at timestamptz not null default now(),
  primary key (class_id,user_id)
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  starting_balance numeric(16,4) not null,
  cash_balance numeric(16,4) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id,user_id)
);

create table if not exists public.holdings (
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  shares numeric(20,8) not null check (shares > 0),
  avg_cost numeric(20,8) not null check (avg_cost >= 0),
  updated_at timestamptz not null default now(),
  primary key (portfolio_id,symbol)
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('BUY','SELL')),
  shares numeric(20,8) not null check (shares > 0),
  price numeric(20,8) not null check (price > 0),
  total numeric(20,8) not null check (total > 0),
  executed_at timestamptz not null default now()
);

create table if not exists public.watchlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now(),
  primary key (user_id,symbol)
);

create index if not exists class_members_user_idx on public.class_members(user_id);
create index if not exists portfolios_class_idx on public.portfolios(class_id);
create index if not exists trades_portfolio_time_idx on public.trades(portfolio_id,executed_at desc);
create index if not exists holdings_symbol_idx on public.holdings(symbol);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_role text;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'),''), split_part(coalesce(new.email,'student'),'@',1));
  v_role := case when new.raw_user_meta_data ->> 'role' = 'teacher' then 'teacher' else 'student' end;
  insert into public.profiles(id,display_name,role)
  values(new.id,left(v_name,80),v_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles(id,display_name,role)
select
  u.id,
  left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'),''),split_part(coalesce(u.email,'student'),'@',1)),80),
  case when u.raw_user_meta_data ->> 'role' = 'teacher' then 'teacher' else 'student' end
from auth.users u
on conflict (id) do nothing;

create or replace function public.execute_paper_trade(
  p_user_id uuid,
  p_class_id uuid,
  p_symbol text,
  p_side text,
  p_shares numeric,
  p_price numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_portfolio_id uuid;
  v_cash numeric;
  v_owned numeric;
  v_avg numeric;
  v_total numeric;
begin
  if p_shares <= 0 or p_price <= 0 then
    raise exception 'Invalid order quantity or price.';
  end if;

  if upper(p_side) not in ('BUY','SELL') then
    raise exception 'Invalid order side.';
  end if;

  if not exists (
    select 1 from public.class_members
    where class_id=p_class_id and user_id=p_user_id and role='student'
  ) then
    raise exception 'Student is not enrolled in this class.';
  end if;

  if not exists (
    select 1 from public.classes where id=p_class_id and trading_enabled=true
  ) then
    raise exception 'Trading is paused for this class.';
  end if;

  select id,cash_balance
    into v_portfolio_id,v_cash
  from public.portfolios
  where class_id=p_class_id and user_id=p_user_id
  for update;

  if v_portfolio_id is null then
    raise exception 'Portfolio not found.';
  end if;

  v_total := round(p_shares*p_price,8);

  select shares,avg_cost
    into v_owned,v_avg
  from public.holdings
  where portfolio_id=v_portfolio_id and symbol=upper(p_symbol)
  for update;

  if upper(p_side)='BUY' then
    if v_cash < v_total then
      raise exception 'Not enough buying power.';
    end if;

    update public.portfolios
      set cash_balance=cash_balance-v_total,updated_at=now()
      where id=v_portfolio_id;

    if v_owned is null then
      insert into public.holdings(portfolio_id,symbol,shares,avg_cost)
      values(v_portfolio_id,upper(p_symbol),p_shares,p_price);
    else
      update public.holdings
      set avg_cost=((v_owned*v_avg)+(p_shares*p_price))/(v_owned+p_shares),
          shares=v_owned+p_shares,
          updated_at=now()
      where portfolio_id=v_portfolio_id and symbol=upper(p_symbol);
    end if;
  else
    if v_owned is null or v_owned < p_shares then
      raise exception 'Not enough shares to sell.';
    end if;

    update public.portfolios
      set cash_balance=cash_balance+v_total,updated_at=now()
      where id=v_portfolio_id;

    if v_owned=p_shares then
      delete from public.holdings
      where portfolio_id=v_portfolio_id and symbol=upper(p_symbol);
    else
      update public.holdings
      set shares=v_owned-p_shares,updated_at=now()
      where portfolio_id=v_portfolio_id and symbol=upper(p_symbol);
    end if;
  end if;

  insert into public.trades(portfolio_id,symbol,side,shares,price,total)
  values(v_portfolio_id,upper(p_symbol),upper(p_side),p_shares,p_price,v_total);

  return jsonb_build_object(
    'portfolio_id',v_portfolio_id,
    'symbol',upper(p_symbol),
    'side',upper(p_side),
    'shares',p_shares,
    'price',p_price,
    'total',v_total
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.trades enable row level security;
alter table public.watchlists enable row level security;

revoke all on table public.profiles from anon,authenticated;
revoke all on table public.classes from anon,authenticated;
revoke all on table public.class_members from anon,authenticated;
revoke all on table public.portfolios from anon,authenticated;
revoke all on table public.holdings from anon,authenticated;
revoke all on table public.trades from anon,authenticated;
revoke all on table public.watchlists from anon,authenticated;

grant select on table public.profiles to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

revoke execute on function public.execute_paper_trade(uuid,uuid,text,text,numeric,numeric) from public,anon,authenticated;
grant execute on function public.execute_paper_trade(uuid,uuid,text,text,numeric,numeric) to service_role;
