/**
 * rfq-categories.ts
 * ─────────────────────────────────────────────────────────────
 * Master list of B2B procurement / supply-chain categories
 * used in the "Post a Requirement / RFQ" form.
 *
 * Each entry has:
 *   value  – machine-readable slug stored in form state
 *   label  – human-readable name shown in the dropdown
 *   group  – optional section header for grouping
 */

export interface RfqCategory {
  value: string;
  label: string;
  group: string;
}

export const rfqCategories: RfqCategory[] = [
  // ── Raw Materials ─────────────────────────────────────────
  { value: "raw-metals-ferrous",        label: "Ferrous Metals (Steel, Iron)",       group: "Raw Materials" },
  { value: "raw-metals-nonferrous",     label: "Non-Ferrous Metals (Aluminium, Copper, Brass)", group: "Raw Materials" },
  { value: "raw-plastics",              label: "Plastics & Polymers",                group: "Raw Materials" },
  { value: "raw-rubber",                label: "Rubber & Elastomers",                group: "Raw Materials" },
  { value: "raw-chemicals",             label: "Industrial Chemicals",               group: "Raw Materials" },
  { value: "raw-textiles",              label: "Textile Fibres & Yarn",              group: "Raw Materials" },
  { value: "raw-wood-timber",           label: "Wood & Timber",                      group: "Raw Materials" },
  { value: "raw-glass",                 label: "Glass & Ceramics",                   group: "Raw Materials" },
  { value: "raw-composites",            label: "Composites & Advanced Materials",    group: "Raw Materials" },
  { value: "raw-agricultural",          label: "Agricultural Commodities",           group: "Raw Materials" },

  // ── Industrial Components & Hardware ──────────────────────
  { value: "comp-fasteners",            label: "Fasteners (Bolts, Nuts, Screws)",    group: "Industrial Components" },
  { value: "comp-bearings",             label: "Bearings & Linear Motion",           group: "Industrial Components" },
  { value: "comp-seals-gaskets",        label: "Seals, O-Rings & Gaskets",           group: "Industrial Components" },
  { value: "comp-springs",              label: "Springs & Wire Forms",               group: "Industrial Components" },
  { value: "comp-gears-transmission",   label: "Gears & Power Transmission",         group: "Industrial Components" },
  { value: "comp-hydraulic-pneumatic",  label: "Hydraulic & Pneumatic Components",   group: "Industrial Components" },
  { value: "comp-pipes-fittings",       label: "Pipes, Tubes & Fittings",            group: "Industrial Components" },
  { value: "comp-valves",               label: "Valves & Flow Control",              group: "Industrial Components" },
  { value: "comp-castings-forgings",    label: "Castings & Forgings",                group: "Industrial Components" },
  { value: "comp-sheet-metal",          label: "Sheet Metal Fabrication",            group: "Industrial Components" },
  { value: "comp-machined-parts",       label: "Precision Machined Parts (CNC)",     group: "Industrial Components" },
  { value: "comp-injection-moulding",   label: "Injection Moulded Parts",            group: "Industrial Components" },

  // ── Machinery & Equipment ─────────────────────────────────
  { value: "mach-production",           label: "Production Machinery",               group: "Machinery & Equipment" },
  { value: "mach-material-handling",    label: "Material Handling Equipment",        group: "Machinery & Equipment" },
  { value: "mach-pumps-compressors",    label: "Pumps & Compressors",               group: "Machinery & Equipment" },
  { value: "mach-conveyors",            label: "Conveyors & Sorting Systems",        group: "Machinery & Equipment" },
  { value: "mach-welding",              label: "Welding Equipment & Consumables",    group: "Machinery & Equipment" },
  { value: "mach-cranes-hoists",        label: "Cranes, Hoists & Lifting",          group: "Machinery & Equipment" },
  { value: "mach-testing-measurement",  label: "Testing & Measurement Instruments", group: "Machinery & Equipment" },
  { value: "mach-generators",           label: "Generators & Power Equipment",       group: "Machinery & Equipment" },
  { value: "mach-hvac",                 label: "HVAC Systems",                       group: "Machinery & Equipment" },
  { value: "mach-lab-equipment",        label: "Laboratory Equipment",               group: "Machinery & Equipment" },

  // ── Electrical & Electronics ──────────────────────────────
  { value: "elec-cables-wires",         label: "Cables & Wires",                     group: "Electrical & Electronics" },
  { value: "elec-switchgear",           label: "Switchgear & Control Panels",        group: "Electrical & Electronics" },
  { value: "elec-motors-drives",        label: "Motors & Variable Frequency Drives", group: "Electrical & Electronics" },
  { value: "elec-sensors",              label: "Sensors & Transducers",              group: "Electrical & Electronics" },
  { value: "elec-pcb-assemblies",       label: "PCBs & Electronic Assemblies",       group: "Electrical & Electronics" },
  { value: "elec-lighting",             label: "Industrial Lighting",                group: "Electrical & Electronics" },
  { value: "elec-batteries",            label: "Batteries & Energy Storage",         group: "Electrical & Electronics" },
  { value: "elec-connectors",           label: "Connectors & Terminal Blocks",       group: "Electrical & Electronics" },

  // ── Packaging ─────────────────────────────────────────────
  { value: "pack-corrugated",           label: "Corrugated Boxes & Cartons",         group: "Packaging" },
  { value: "pack-flexible",             label: "Flexible Packaging (Pouches, Films)",group: "Packaging" },
  { value: "pack-rigid-plastic",        label: "Rigid Plastic Containers",           group: "Packaging" },
  { value: "pack-glass-bottles",        label: "Glass Bottles & Jars",               group: "Packaging" },
  { value: "pack-metal-cans",           label: "Metal Cans & Drums",                 group: "Packaging" },
  { value: "pack-labels-printing",      label: "Labels & Printed Packaging",         group: "Packaging" },
  { value: "pack-foam-cushioning",      label: "Foam & Cushioning Materials",        group: "Packaging" },
  { value: "pack-strapping-tapes",      label: "Strapping, Tapes & Adhesives",       group: "Packaging" },

  // ── IT & Technology ───────────────────────────────────────
  { value: "it-hardware",               label: "IT Hardware (Servers, Workstations)",group: "IT & Technology" },
  { value: "it-networking",             label: "Networking Equipment",               group: "IT & Technology" },
  { value: "it-software-licenses",      label: "Software Licenses & SaaS",          group: "IT & Technology" },
  { value: "it-security-systems",       label: "Security & Surveillance Systems",    group: "IT & Technology" },
  { value: "it-printers-peripherals",   label: "Printers & Office Peripherals",      group: "IT & Technology" },
  { value: "it-telecom",                label: "Telecom & Communication Equipment",  group: "IT & Technology" },

  // ── Office & MRO Supplies ─────────────────────────────────
  { value: "mro-safety",                label: "Safety Equipment & PPE",             group: "Office & MRO Supplies" },
  { value: "mro-cleaning",              label: "Cleaning & Hygiene Products",        group: "Office & MRO Supplies" },
  { value: "mro-tools-hand",            label: "Hand Tools & Power Tools",           group: "Office & MRO Supplies" },
  { value: "mro-lubricants",            label: "Lubricants & Coolants",              group: "Office & MRO Supplies" },
  { value: "mro-abrasives",             label: "Abrasives & Grinding Wheels",        group: "Office & MRO Supplies" },
  { value: "mro-office-stationery",     label: "Office & Stationery Supplies",       group: "Office & MRO Supplies" },
  { value: "mro-janitorial",            label: "Janitorial & Facility Supplies",     group: "Office & MRO Supplies" },

  // ── Construction & Infrastructure ────────────────────────
  { value: "const-cement-concrete",     label: "Cement, Concrete & Aggregates",      group: "Construction & Infrastructure" },
  { value: "const-steel-structures",    label: "Structural Steel & Fabrication",     group: "Construction & Infrastructure" },
  { value: "const-bricks-blocks",       label: "Bricks, Blocks & Masonry",           group: "Construction & Infrastructure" },
  { value: "const-roofing",             label: "Roofing & Waterproofing",            group: "Construction & Infrastructure" },
  { value: "const-paints-coatings",     label: "Paints, Coatings & Surface Prep",   group: "Construction & Infrastructure" },
  { value: "const-flooring",            label: "Flooring & Tiles",                   group: "Construction & Infrastructure" },
  { value: "const-plumbing",            label: "Plumbing & Sanitary Fittings",       group: "Construction & Infrastructure" },

  // ── Food & Beverages ──────────────────────────────────────
  { value: "food-ingredients",          label: "Food Ingredients & Additives",       group: "Food & Beverages" },
  { value: "food-grains-pulses",        label: "Grains, Pulses & Cereals",           group: "Food & Beverages" },
  { value: "food-spices",               label: "Spices & Condiments",                group: "Food & Beverages" },
  { value: "food-dairy",                label: "Dairy & Dairy Products",             group: "Food & Beverages" },
  { value: "food-beverages",            label: "Beverages (Tea, Coffee, Juices)",    group: "Food & Beverages" },
  { value: "food-frozen",               label: "Frozen & Processed Foods",           group: "Food & Beverages" },

  // ── Pharmaceuticals & Healthcare ──────────────────────────
  { value: "pharma-api",                label: "Active Pharmaceutical Ingredients",  group: "Pharmaceuticals & Healthcare" },
  { value: "pharma-excipients",         label: "Pharmaceutical Excipients",          group: "Pharmaceuticals & Healthcare" },
  { value: "pharma-medical-devices",    label: "Medical Devices & Equipment",        group: "Pharmaceuticals & Healthcare" },
  { value: "pharma-disposables",        label: "Medical Disposables & Consumables",  group: "Pharmaceuticals & Healthcare" },
  { value: "pharma-lab-reagents",       label: "Lab Reagents & Diagnostics",         group: "Pharmaceuticals & Healthcare" },

  // ── Automotive ────────────────────────────────────────────
  { value: "auto-oem-parts",            label: "OEM Auto Parts & Components",        group: "Automotive" },
  { value: "auto-tyres",                label: "Tyres, Wheels & Accessories",        group: "Automotive" },
  { value: "auto-fluids",               label: "Automotive Fluids & Lubricants",     group: "Automotive" },
  { value: "auto-body-parts",           label: "Body Parts & Panels",               group: "Automotive" },
  { value: "auto-electrical",           label: "Automotive Electrical & Electronics",group: "Automotive" },

  // ── Textiles & Apparel ────────────────────────────────────
  { value: "text-fabric",               label: "Fabrics & Woven Materials",          group: "Textiles & Apparel" },
  { value: "text-garments",             label: "Garments & Apparel",                 group: "Textiles & Apparel" },
  { value: "text-technical-textiles",   label: "Technical & Industrial Textiles",    group: "Textiles & Apparel" },
  { value: "text-trims",                label: "Trims, Zips & Accessories",          group: "Textiles & Apparel" },

  // ── Logistics & Warehousing ───────────────────────────────
  { value: "logi-freight",              label: "Freight & Transportation Services",  group: "Logistics & Warehousing" },
  { value: "logi-warehousing",          label: "Warehousing & Storage Services",     group: "Logistics & Warehousing" },
  { value: "logi-cold-chain",           label: "Cold Chain & Refrigeration",         group: "Logistics & Warehousing" },
  { value: "logi-customs",              label: "Customs Clearance & Brokerage",      group: "Logistics & Warehousing" },

  // ── Services ──────────────────────────────────────────────
  { value: "svc-calibration",           label: "Calibration & Maintenance Services", group: "Services" },
  { value: "svc-contract-manufacturing",label: "Contract Manufacturing",             group: "Services" },
  { value: "svc-tooling-moulds",        label: "Tooling, Dies & Moulds",             group: "Services" },
  { value: "svc-printing",              label: "Printing & Publishing Services",     group: "Services" },
  { value: "svc-consulting",            label: "Technical Consulting & Engineering", group: "Services" },

  // ── Energy ────────────────────────────────────────────────
  { value: "energy-solar",              label: "Solar Panels & PV Equipment",        group: "Energy" },
  { value: "energy-wind",               label: "Wind Energy Components",             group: "Energy" },
  { value: "energy-fuel",               label: "Fuel & Petroleum Products",          group: "Energy" },
  { value: "energy-power-infra",        label: "Power Infrastructure & Distribution",group: "Energy" },

  // ── Other ─────────────────────────────────────────────────
  { value: "other",                     label: "Other / Not Listed",                 group: "Other" },
];

/** Unique group names in display order */
export const rfqCategoryGroups: string[] = [
  ...new Set(rfqCategories.map((c) => c.group)),
];

/** Get all categories for a given group */
export function getCategoriesByGroup(group: string): RfqCategory[] {
  return rfqCategories.filter((c) => c.group === group);
}
