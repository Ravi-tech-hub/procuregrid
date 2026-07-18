-- =========================================================
-- ProcureGrid: Product Attribute Templates
-- Run AFTER rfq-foundation.sql in Supabase SQL Editor
-- =========================================================
begin;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'attr_field_type') then
    create type public.attr_field_type as enum ('single_select','text_input','number_input');
  end if;
end $$;

create table if not exists public.product_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  display_name  text not null,
  category_slug text not null,
  search_terms  text[] not null default '{}',
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.product_attribute_definitions (
  id                  uuid primary key default gen_random_uuid(),
  product_template_id uuid not null references public.product_templates(id) on delete cascade,
  attr_key            text not null,
  label               text not null,
  field_type          public.attr_field_type not null default 'single_select',
  options             text[],
  allow_other         boolean not null default true,
  is_required         boolean not null default false,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  unique (product_template_id, attr_key)
);

create index if not exists attr_defs_template_sort_idx
  on public.product_attribute_definitions (product_template_id, sort_order);

alter table public.rfqs
  add column if not exists product_template_id uuid references public.product_templates(id) on delete set null,
  add column if not exists spec_attributes jsonb not null default '{}',
  add column if not exists delivery_timeline text check (delivery_timeline in ('same_day','within_15_days','within_1_month','flexible')),
  add column if not exists payment_terms text check (payment_terms in ('full_advance','loan_finance','credit_post_delivery','cod'));

create index if not exists rfqs_spec_gin_idx on public.rfqs using gin (spec_attributes);

alter table public.product_templates enable row level security;
alter table public.product_templates force row level security;
drop policy if exists product_templates_select_all on public.product_templates;
create policy product_templates_select_all on public.product_templates for select to authenticated using (is_active = true);

alter table public.product_attribute_definitions enable row level security;
alter table public.product_attribute_definitions force row level security;
drop policy if exists attr_defs_select_all on public.product_attribute_definitions;
create policy attr_defs_select_all on public.product_attribute_definitions for select to authenticated using (true);

grant select on public.product_templates to authenticated;
grant select on public.product_attribute_definitions to authenticated;

-- Seed 20 products
insert into public.product_templates (slug,display_name,category_slug,search_terms,sort_order) values
  ('pipe','Pipe','comp-pipes-fittings',array['pipe','tube','tubing','pipeline'],10),
  ('ms-sheet','MS / Steel Sheet','raw-metals-ferrous',array['ms sheet','steel sheet','mild steel','gi sheet'],20),
  ('bearing','Bearing','comp-bearings',array['bearing','ball bearing','roller bearing'],30),
  ('bolt-nut','Bolt & Nut','comp-fasteners',array['bolt','nut','fastener','hex bolt'],40),
  ('electric-motor','Electric Motor','elec-motors-drives',array['motor','electric motor','ac motor'],50),
  ('pump','Pump','mach-pumps-compressors',array['pump','centrifugal','submersible','water pump'],60),
  ('cable-wire','Cable & Wire','elec-cables-wires',array['cable','wire','electrical cable','copper wire'],70),
  ('conveyor-belt','Conveyor Belt','mach-conveyors',array['conveyor belt','belt conveyor','rubber belt'],80),
  ('safety-helmet','Safety Helmet / PPE','mro-safety',array['safety helmet','hard hat','ppe','helmet'],90),
  ('corrugated-box','Corrugated Box','pack-corrugated',array['corrugated box','carton','packaging box'],100),
  ('valve','Valve','comp-valves',array['valve','gate valve','ball valve','butterfly valve'],110),
  ('hydraulic-hose','Hydraulic Hose','comp-hydraulic-pneumatic',array['hydraulic hose','rubber hose','flexible hose'],120),
  ('welding-rod','Welding Electrode / Rod','mach-welding',array['welding rod','electrode','welding wire'],130),
  ('solar-panel','Solar Panel','energy-solar',array['solar panel','solar module','pv panel'],140),
  ('office-chair','Office Chair','mro-office-stationery',array['office chair','desk chair','ergonomic chair'],150),
  ('pp-bag','PP / HDPE Bag','pack-flexible',array['pp bag','hdpe bag','woven bag','jumbo bag'],160),
  ('gear-motor','Gearbox / Gear Motor','comp-gears-transmission',array['gearbox','gear motor','worm gear'],170),
  ('uv-sheet','Polycarbonate / UV Sheet','raw-plastics',array['pc sheet','polycarbonate sheet','roofing sheet'],180),
  ('inverter','Inverter / UPS','elec-batteries',array['inverter','ups','solar inverter','power backup'],190),
  ('paint-coating','Industrial Paint / Coating','const-paints-coatings',array['paint','coating','primer','epoxy'],200)
on conflict (slug) do update set display_name=excluded.display_name, search_terms=excluded.search_terms;

-- Seed attributes (part 1: pipe, ms-sheet, bearing, bolt-nut, electric-motor)
with t as (select id,slug from public.product_templates)
insert into public.product_attribute_definitions(product_template_id,attr_key,label,options,sort_order)
select t.id,a.attr_key,a.label,a.options,a.sort_order from t
join (values
  ('pipe','inner_diameter','Inner Diameter',array['1/4 inch','3/8 inch','1/2 inch','3/4 inch','1 inch','1.5 inch','2 inch','3 inch','4 inch','6 inch'],10),
  ('pipe','application','Application',array['Hydraulic','Industrial','Agriculture','Water','Air','Construction','Chemical','Steam','Food Grade','HVAC'],20),
  ('pipe','material','Material',array['SS304','SS316','MS','GI','CPVC','UPVC','HDPE','PP','Copper','Aluminium'],30),
  ('pipe','working_pressure','Working Pressure',array['Up to 10 bar','10-50 bar','50-100 bar','100-200 bar','200+ bar'],40),
  ('pipe','end_connection','End Connection',array['Threaded','Flanged','Socket Weld','Butt Weld','Plain End','Compression'],50),
  ('pipe','length','Length',array['1 ft','2 ft','3 ft','6 ft','12 ft','Custom'],60),
  ('pipe','temperature_range','Temperature Range',array['-20 to 60°C','0 to 100°C','0 to 200°C','200 to 400°C','400°C+'],70),
  ('ms-sheet','thickness','Thickness',array['0.5 mm','1 mm','1.5 mm','2 mm','3 mm','4 mm','5 mm','6 mm','8 mm','10 mm'],10),
  ('ms-sheet','grade','Grade / Standard',array['IS 2062','ASTM A36','SS400','S235','S275','S355'],20),
  ('ms-sheet','surface','Surface Finish',array['Hot Rolled','Cold Rolled','Galvanised','Pre-Painted','Checkered'],30),
  ('ms-sheet','size','Sheet Size',array['4x8 ft','5x10 ft','6x12 ft','Custom'],40),
  ('bearing','type','Bearing Type',array['Deep Groove Ball','Angular Contact','Cylindrical Roller','Tapered Roller','Thrust Ball','Needle Roller','Spherical Roller'],10),
  ('bearing','bore_dia','Bore Diameter',array['10 mm','15 mm','20 mm','25 mm','30 mm','40 mm','50 mm','60 mm','80 mm','100 mm'],20),
  ('bearing','brand','Brand',array['SKF','FAG','NSK','NTN','TIMKEN','NBC','Nachi'],30),
  ('bearing','seal_type','Seal / Shield',array['Open','Single Seal (Z)','Double Seal (ZZ)','Single Rubber (RS)','Double Rubber (2RS)'],40),
  ('bolt-nut','type','Type',array['Hex Bolt','Anchor Bolt','Stud Bolt','Eye Bolt','U-Bolt','Hex Nut','Lock Nut','Wing Nut'],10),
  ('bolt-nut','size','Size / Dia',array['M6','M8','M10','M12','M16','M20','M24','M30'],20),
  ('bolt-nut','material','Material',array['MS','SS304','SS316','Brass','Nylon','High Tensile 8.8','High Tensile 10.9'],30),
  ('bolt-nut','finish','Finish',array['Plain','Zinc Plated','Hot-Dip Galvanised','Black Oxide','Phosphate'],40),
  ('electric-motor','power','Power (HP)',array['0.5 HP','1 HP','2 HP','3 HP','5 HP','7.5 HP','10 HP','15 HP','20 HP','50 HP'],10),
  ('electric-motor','phase','Phase',array['Single Phase','Three Phase'],20),
  ('electric-motor','rpm','Speed (RPM)',array['960 RPM','1440 RPM','2880 RPM'],30),
  ('electric-motor','frame','Frame Size',array['71','80','90L','100L','112M','132M','160M','180L'],40),
  ('electric-motor','protection','IP Protection',array['IP44','IP54','IP55','IP65'],50)
) as a(slug,attr_key,label,options,sort_order) on (t.slug=a.slug)
on conflict (product_template_id,attr_key) do update set label=excluded.label,options=excluded.options,sort_order=excluded.sort_order;

-- Seed attributes part 2
with t as (select id,slug from public.product_templates)
insert into public.product_attribute_definitions(product_template_id,attr_key,label,options,sort_order)
select t.id,a.attr_key,a.label,a.options,a.sort_order from t
join (values
  ('pump','pump_type','Pump Type',array['Centrifugal','Submersible','Self-Priming','Mono Block','Gear Pump','Diaphragm','Dosing','Jet Pump'],10),
  ('pump','flow_rate','Flow Rate',array['Up to 100 LPH','100-500 LPH','500-2000 LPH','2-10 m³/hr','10-50 m³/hr','50+ m³/hr'],20),
  ('pump','head','Head / Pressure',array['Up to 10 m','10-30 m','30-60 m','60-100 m','100+ m'],30),
  ('pump','fluid','Fluid Handled',array['Water','Chemicals','Slurry','Oil','Sewage','Food Grade'],40),
  ('pump','material','Material (Casing)',array['CI','SS304','SS316','Plastic','Bronze'],50),
  ('cable-wire','cable_type','Cable Type',array['Armoured (SWA)','Unarmoured','Flexible','House Wire','Control Cable','Fire Resistant','Solar DC'],10),
  ('cable-wire','size','Size (sq mm)',array['1 sq mm','1.5 sq mm','2.5 sq mm','4 sq mm','6 sq mm','10 sq mm','16 sq mm','25 sq mm','50 sq mm'],20),
  ('cable-wire','cores','No. of Cores',array['1 Core','2 Core','3 Core','3.5 Core','4 Core','5 Core'],30),
  ('cable-wire','material','Conductor',array['Copper','Aluminium'],40),
  ('cable-wire','insulation','Insulation',array['PVC','XLPE','FRLS','ZHFR'],50),
  ('conveyor-belt','belt_type','Belt Type',array['Flat Belt','V-Belt','Timing Belt','Modular Plastic','Steel Cord','Chevron'],10),
  ('conveyor-belt','width','Belt Width',array['300 mm','400 mm','500 mm','600 mm','800 mm','1000 mm','1200 mm'],20),
  ('conveyor-belt','ply','Ply Rating',array['2 Ply','3 Ply','4 Ply','5 Ply','6 Ply'],30),
  ('conveyor-belt','cover_grade','Cover Grade',array['General Purpose','Oil Resistant','Heat Resistant','Fire Resistant','Food Grade'],40),
  ('safety-helmet','product_type','Product Type',array['Safety Helmet','Safety Shoes','Safety Gloves','Safety Goggles','Safety Vest','Ear Muffs','Dust Mask','Full Body Harness'],10),
  ('safety-helmet','standard','Standard',array['IS 2925','EN 397','ANSI Z89.1','CE Marked'],20),
  ('safety-helmet','material','Material',array['HDPE','ABS','Polycarbonate','Fibreglass'],30),
  ('corrugated-box','ply','Ply',array['3 Ply','5 Ply','7 Ply'],10),
  ('corrugated-box','size','Size (approx)',array['Small (12x8x6 in)','Medium (12x10x8 in)','Large (18x12x12 in)','Custom'],20),
  ('corrugated-box','gsm','Bursting Strength',array['Up to 150 GSM','150-200 GSM','200-250 GSM','250+ GSM'],30),
  ('corrugated-box','printing','Printing',array['Plain / Unprinted','1 Colour','2 Colour','4 Colour Full'],40),
  ('valve','valve_type','Valve Type',array['Gate Valve','Ball Valve','Butterfly Valve','Globe Valve','Check Valve','Needle Valve','Solenoid Valve'],10),
  ('valve','size','Size (Inch)',array['1/2 inch','3/4 inch','1 inch','1.5 inch','2 inch','3 inch','4 inch','6 inch','8 inch'],20),
  ('valve','material','Body Material',array['Cast Iron','Ductile Iron','SS304','SS316','Bronze','UPVC','MS'],30),
  ('valve','end_conn','End Connection',array['Threaded (BSP)','Flanged','Wafer','Butt Weld','Socket Weld'],40),
  ('valve','pressure_rating','Pressure Rating',array['PN10','PN16','PN25','PN40','Class 150','Class 300'],50)
) as a(slug,attr_key,label,options,sort_order) on (t.slug=a.slug)
on conflict (product_template_id,attr_key) do update set label=excluded.label,options=excluded.options,sort_order=excluded.sort_order;

-- Seed attributes part 3
with t as (select id,slug from public.product_templates)
insert into public.product_attribute_definitions(product_template_id,attr_key,label,options,sort_order)
select t.id,a.attr_key,a.label,a.options,a.sort_order from t
join (values
  ('hydraulic-hose','type','Hose Type',array['1 Wire Braid (R1)','2 Wire Braid (R2)','4 Spiral (R9)','6 Spiral (R12)','Thermoplastic'],10),
  ('hydraulic-hose','id','Inner Diameter',array['1/4 inch','3/8 inch','1/2 inch','5/8 inch','3/4 inch','1 inch'],20),
  ('hydraulic-hose','pressure','Working Pressure',array['Up to 100 bar','100-200 bar','200-350 bar','350-500 bar'],30),
  ('hydraulic-hose','fitting','Fitting Type',array['BSP','NPT','JIC (37°)','ORFS','Metric'],40),
  ('welding-rod','process','Welding Process',array['SMAW (Stick)','MIG/MAG','TIG','Flux Cored (FCAW)'],10),
  ('welding-rod','grade','Grade / AWS Class',array['E6013','E7018','E7016','ER70S-6','ER308L','ER316L'],20),
  ('welding-rod','diameter','Diameter',array['1.6 mm','2 mm','2.5 mm','3.15 mm','4 mm','5 mm'],30),
  ('welding-rod','brand','Brand',array['ESAB','Lincoln Electric','D&H Sécheron','Ador Welding'],40),
  ('solar-panel','wattage','Wattage',array['100 W','150 W','200 W','250 W','300 W','350 W','400 W','450 W','500 W','550 W'],10),
  ('solar-panel','cell_type','Cell Type',array['Monocrystalline PERC','Monocrystalline TOPCon','Polycrystalline','Bifacial','Thin Film'],20),
  ('solar-panel','brand','Brand',array['Adani Solar','Waaree','Vikram Solar','Tata Power Solar','Longi','JA Solar','Canadian Solar'],30),
  ('solar-panel','application','Application',array['Rooftop Residential','Rooftop Commercial','Ground Mount','Off-Grid','EV Charging'],40),
  ('office-chair','type','Chair Type',array['Ergonomic Executive','Mid Back Mesh','High Back Leather','Task Chair','Conference Chair','Visitor Chair'],10),
  ('office-chair','back_support','Back Support',array['High Back','Mid Back','Low Back'],20),
  ('office-chair','material','Seat Material',array['Fabric','Mesh','PU Leather','Genuine Leather'],30),
  ('office-chair','armrest','Armrest',array['Fixed','Adjustable 2D','Adjustable 3D','No Armrest'],40),
  ('pp-bag','bag_type','Bag Type',array['PP Woven Bag','HDPE Bag','FIBC / Jumbo Bag','Laminated PP Bag','Non-woven Bag'],10),
  ('pp-bag','capacity','Capacity',array['Up to 10 kg','10-25 kg','25-50 kg','50-100 kg','500 kg FIBC','1000 kg FIBC','1500 kg FIBC'],20),
  ('pp-bag','printing','Printing',array['Plain / Unprinted','1 Colour','2 Colour','Multi Colour'],30),
  ('pp-bag','liner','Inner Liner',array['Without Liner','With PE Liner','With Aluminium Liner'],40),
  ('gear-motor','type','Gearbox Type',array['Worm Gear Reducer','Helical','Bevel Helical','Planetary','Cycloidal'],10),
  ('gear-motor','ratio','Gear Ratio',array['1:5','1:10','1:15','1:20','1:30','1:40','1:50','1:60','1:80','1:100'],20),
  ('gear-motor','output_torque','Output Torque',array['Up to 50 Nm','50-200 Nm','200-500 Nm','500-1000 Nm','1000+ Nm'],30),
  ('gear-motor','mounting','Mounting',array['Foot Mounted','Flange Mounted','Shaft Mounted','Hollow Bore'],40),
  ('uv-sheet','sheet_type','Sheet Type',array['Solid PC Sheet','Multiwall PC Sheet','Corrugated PC Sheet','Acrylic Sheet','FRP Sheet'],10),
  ('uv-sheet','thickness','Thickness',array['2 mm','3 mm','4 mm','5 mm','6 mm','8 mm','10 mm','12 mm'],20),
  ('uv-sheet','color','Colour',array['Clear / Transparent','Opal / White','Bronze / Tinted','Green','Blue','Grey'],30),
  ('uv-sheet','uv_protection','UV Protection',array['One Side UV','Both Side UV','Without UV'],40),
  ('inverter','capacity','Capacity',array['600 VA','800 VA','1 kVA','1.5 kVA','2 kVA','3 kVA','5 kVA','7.5 kVA','10 kVA'],10),
  ('inverter','inverter_type','Type',array['Solar On-Grid','Solar Off-Grid','Solar Hybrid','UPS Offline','UPS Online','UPS Line Interactive'],20),
  ('inverter','phase','Phase',array['Single Phase','Three Phase'],30),
  ('inverter','battery_voltage','Battery Voltage',array['12V','24V','48V','96V','No Battery'],40),
  ('paint-coating','paint_type','Paint Type',array['Epoxy','Polyurethane (PU)','Alkyd / Enamel','Acrylic','Zinc Rich Primer','Intumescent','Anti-Corrosion'],10),
  ('paint-coating','finish','Finish',array['Gloss','Semi-Gloss','Matte / Flat','Satin'],20),
  ('paint-coating','application','Application',array['Structural Steel','Pipes & Tanks','Marine','Concrete / Floor','Machinery','Automotive'],30),
  ('paint-coating','packaging','Pack Size',array['1 Litre','4 Litre','5 Litre','10 Litre','20 Litre','200 Litre Drum'],40)
) as a(slug,attr_key,label,options,sort_order) on (t.slug=a.slug)
on conflict (product_template_id,attr_key) do update set label=excluded.label,options=excluded.options,sort_order=excluded.sort_order;

commit;
