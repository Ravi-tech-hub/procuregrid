/**
 * rfq-product-data.ts
 * Standard Indian B2B industry products — cement, steel, pipes, wire, etc.
 * Keep in sync with rfq-product-attributes.sql if you ever run the migration.
 */

export interface ProductTemplate {
  slug: string;
  displayName: string;
  categorySlug: string;
  searchTerms: string[];
}

export interface AttributeDefinition {
  productSlug: string;
  attrKey: string;
  label: string;
  fieldType: "single_select" | "text_input" | "number_input";
  options?: string[];
  allowOther: boolean;
  isRequired: boolean;
  sortOrder: number;
}

// ── 20 Standard Industry Products ────────────────────────────────────────

export const LOCAL_PRODUCTS: ProductTemplate[] = [
  { slug: "cement",         displayName: "Cement",                    categorySlug: "const-cement-concrete",    searchTerms: ["cement","opc","ppc","53 grade","43 grade"] },
  { slug: "tmt-bar",        displayName: "TMT Steel Bar / Rebar",     categorySlug: "const-steel-structures",   searchTerms: ["tmt","rebar","steel bar","tor steel","fe500","fe415"] },
  { slug: "ms-pipe",        displayName: "MS / GI Pipe",              categorySlug: "comp-pipes-fittings",      searchTerms: ["ms pipe","gi pipe","steel pipe","mild steel pipe","galvanised pipe"] },
  { slug: "pvc-pipe",       displayName: "PVC / CPVC / HDPE Pipe",    categorySlug: "comp-pipes-fittings",      searchTerms: ["pvc pipe","cpvc pipe","hdpe pipe","upvc","water pipe"] },
  { slug: "electrical-wire","displayName": "Electrical Wire / Cable", categorySlug: "elec-cables-wires",        searchTerms: ["wire","electrical wire","house wire","copper wire","fr wire","finolex"] },
  { slug: "ms-sheet",       displayName: "MS / GI / HR Sheet",        categorySlug: "raw-metals-ferrous",       searchTerms: ["ms sheet","gi sheet","hr sheet","steel sheet","metal sheet","chequered"] },
  { slug: "brick-block",    displayName: "Bricks / AAC Blocks",       categorySlug: "const-bricks-blocks",      searchTerms: ["brick","block","aac block","fly ash brick","red brick","hollow block"] },
  { slug: "sand",           displayName: "Sand / Fine Aggregate",     categorySlug: "const-cement-concrete",    searchTerms: ["sand","fine aggregate","river sand","m-sand","manufactured sand"] },
  { slug: "coarse-aggregate","displayName":"Coarse Aggregate / Gravel",categorySlug: "const-cement-concrete",   searchTerms: ["aggregate","coarse aggregate","gravel","20mm","40mm","jelly","crushed stone"] },
  { slug: "plywood",        displayName: "Plywood / Blockboard",      categorySlug: "raw-wood-timber",          searchTerms: ["plywood","blockboard","plyboard","marine ply","commercial ply","shuttering ply"] },
  { slug: "paint-primer",   displayName: "Paint / Primer / Distemper",categorySlug: "const-paints-coatings",    searchTerms: ["paint","primer","distemper","emulsion","enamel","asian paint","berger","nerolac"] },
  { slug: "tiles",          displayName: "Ceramic / Vitrified Tiles", categorySlug: "const-flooring",           searchTerms: ["tiles","ceramic tiles","vitrified tiles","floor tiles","wall tiles","kajaria","somany"] },
  { slug: "sanitary",       displayName: "Sanitary / Plumbing Fittings",categorySlug:"const-plumbing",          searchTerms: ["sanitary","plumbing","fittings","pvc fitting","cpvc fitting","elbow","tee","reducer"] },
  { slug: "aluminium",      displayName: "Aluminium Section / Profile",categorySlug:"raw-metals-nonferrous",     searchTerms: ["aluminium","aluminum","aluminium section","t-section","channel","angle","aluminium profile"] },
  { slug: "roofing-sheet",  displayName: "Roofing / Profile Sheet",   categorySlug: "const-roofing",            searchTerms: ["roofing sheet","profile sheet","gi sheet","colour coated","tin sheet","corrugated sheet"] },
  { slug: "safety-ppe",     displayName: "Safety Equipment / PPE",    categorySlug: "mro-safety",               searchTerms: ["safety","ppe","helmet","safety shoes","gloves","goggles","vest","harness"] },
  { slug: "adhesive",       displayName: "Adhesive / Sealant / Grout",categorySlug: "const-paints-coatings",    searchTerms: ["adhesive","sealant","grout","tile adhesive","silicone","epoxy","fevicol","Dr fixit"] },
  { slug: "mcb-switchgear", displayName: "MCB / Switch / Switchgear", categorySlug: "elec-switchgear",          searchTerms: ["mcb","switch","switchgear","rccb","elcb","distribution board","db","legrand","havells"] },
  { slug: "water-tank",     displayName: "Water Tank / Storage Tank", categorySlug: "mach-pumps-compressors",   searchTerms: ["water tank","storage tank","overhead tank","sintex","polyethylene tank","loft tank"] },
  { slug: "hardware",       displayName: "Hardware / Fasteners",      categorySlug: "comp-fasteners",           searchTerms: ["hardware","bolt","nut","screw","fastener","anchor","rawl plug","hinge","lock"] },
];

// ── Attribute Definitions ────────────────────────────────────────────────

function def(
  productSlug: string,
  attrKey: string,
  label: string,
  options: string[],
  sortOrder: number,
  allowOther = true,
): AttributeDefinition {
  return { productSlug, attrKey, label, fieldType: "single_select", options, allowOther, isRequired: false, sortOrder };
}

export const LOCAL_ATTRIBUTES: AttributeDefinition[] = [

  // ── Cement ────────────────────────────────────────────────────────────
  def("cement","type","Cement Type",["OPC 43 Grade","OPC 53 Grade","PPC (Pozzolana)","PSC (Slag)","White Cement","Rapid Hardening"],10),
  def("cement","brand","Brand",["UltraTech","ACC","Ambuja","Shree Cement","JK Cement","Ramco","India Cements","Dalmia"],20),
  def("cement","packing","Packing",["50 kg Bag","25 kg Bag","Bulk (Loose)"],30,false),
  def("cement","quantity_range","Order Quantity",["Up to 10 MT","10–50 MT","50–200 MT","200–500 MT","500+ MT"],40),

  // ── TMT Steel Bar ─────────────────────────────────────────────────────
  def("tmt-bar","grade","Grade",["Fe 415","Fe 500","Fe 500D","Fe 550","Fe 550D","Fe 600"],10),
  def("tmt-bar","diameter","Diameter",["8 mm","10 mm","12 mm","16 mm","20 mm","25 mm","28 mm","32 mm","36 mm","40 mm"],20),
  def("tmt-bar","brand","Brand",["TATA Tiscon","JSW Neosteel","SAIL","Vizag Steel","Shyam Steel","Kamdhenu","Jindal"],30),
  def("tmt-bar","length","Length",["6 m (Standard)","9 m","12 m","Custom Length"],40),

  // ── MS / GI Pipe ─────────────────────────────────────────────────────
  def("ms-pipe","type","Pipe Type",["MS ERW","GI (Galvanised)","MS Seamless","MS Square / Rectangular Hollow"],10),
  def("ms-pipe","size","Size (NB / OD)",["15 mm (½\")","20 mm (¾\")","25 mm (1\")","32 mm (1¼\")","40 mm","50 mm","65 mm","80 mm","100 mm","150 mm"],20),
  def("ms-pipe","thickness","Wall Thickness / Schedule",["Light (Class B)","Medium (Class C)","Heavy","Sch 20","Sch 40","Sch 80"],30),
  def("ms-pipe","standard","Standard",["IS 1239","IS 3589","IS 4923 (Hollow Section)","API 5L"],40),

  // ── PVC / CPVC / HDPE Pipe ───────────────────────────────────────────
  def("pvc-pipe","material","Material",["UPVC","CPVC","HDPE","PPR","Rigid PVC"],10),
  def("pvc-pipe","application","Application",["Water Supply","Sewage / Drainage","Conduit (Electrical)","Agriculture / Irrigation","Borewell Casing"],20),
  def("pvc-pipe","diameter","Diameter",["15 mm","20 mm","25 mm","32 mm","40 mm","50 mm","63 mm","75 mm","90 mm","110 mm","160 mm","200 mm"],30),
  def("pvc-pipe","pressure_class","Pressure Class",["2.5 kg/cm²","4 kg/cm²","6 kg/cm²","10 kg/cm²","16 kg/cm²"],40),
  def("pvc-pipe","brand","Brand",["Finolex","Astral","Prince","Supreme","Ashirvad"],50),

  // ── Electrical Wire / Cable ──────────────────────────────────────────
  def("electrical-wire","type","Wire / Cable Type",["FR House Wire (Single Core)","FR-LSH Wire","Flexible Cable","Armoured Cable (SWA)","XLPE Cable"],10),
  def("electrical-wire","size","Size (sq mm)",["1 sq mm","1.5 sq mm","2.5 sq mm","4 sq mm","6 sq mm","10 sq mm","16 sq mm","25 sq mm"],20),
  def("electrical-wire","conductor","Conductor",["Copper","Aluminium"],30,false),
  def("electrical-wire","brand","Brand",["Finolex","Havells","Polycab","Anchor","KEI","RR Kabel"],40),
  def("electrical-wire","color","Colour",["Red","Yellow","Blue","Black","Green (Earth)","White","Multi-Core (Mixed)"],50),

  // ── MS / GI / HR Sheet ───────────────────────────────────────────────
  def("ms-sheet","type","Sheet Type",["HR (Hot Rolled)","CR (Cold Rolled)","GI (Galvanised)","GP (Galvanised Plain)","Chequered / Tread Plate","Colour Coated (PPGI)"],10),
  def("ms-sheet","thickness","Thickness",["0.5 mm","0.8 mm","1 mm","1.2 mm","1.5 mm","2 mm","2.5 mm","3 mm","4 mm","5 mm","6 mm","8 mm","10 mm"],20),
  def("ms-sheet","size","Sheet Size",["4×8 ft","5×10 ft","6×12 ft","Custom / Coil"],30),
  def("ms-sheet","grade","Grade",["IS 2062 E250","IS 2062 E350","ASTM A36","SAIL","Tata"],40),

  // ── Bricks / AAC Blocks ──────────────────────────────────────────────
  def("brick-block","type","Type",["Red Brick (Traditional)","Fly Ash Brick","AAC Block","CLC Block","Hollow Concrete Block","Solid Concrete Block"],10),
  def("brick-block","size","Size",["Standard (230×110×75 mm)","Modular (190×90×90 mm)","AAC 600×200×100 mm","AAC 600×200×150 mm","AAC 600×200×200 mm","Custom"],20),
  def("brick-block","grade","Grade / Compressive Strength",["M3.5","M5","M7.5","M10","M15"],30),

  // ── Sand ─────────────────────────────────────────────────────────────
  def("sand","type","Sand Type",["River Sand","M-Sand (Manufactured)","P-Sand (Plastering)","Pit Sand","Crusher Dust"],10),
  def("sand","zone","Zone / Grading",["Zone I (Coarse)","Zone II","Zone III","Zone IV (Fine)"],20),
  def("sand","delivery","Delivery Mode",["Per Brass (100 cu ft)","Per MT","Per Cubic Metre","Per Truckload"],30),

  // ── Coarse Aggregate ─────────────────────────────────────────────────
  def("coarse-aggregate","size","Size",["6 mm","10 mm","12.5 mm","20 mm","40 mm","Mixed (20+40 mm)"],10),
  def("coarse-aggregate","type","Type",["Crushed Granite","River Gravel","Quartzite","Limestone"],20),
  def("coarse-aggregate","delivery","Delivery Mode",["Per Brass","Per MT","Per Cubic Metre","Per Truckload"],30),

  // ── Plywood / Blockboard ─────────────────────────────────────────────
  def("plywood","type","Type",["Commercial Ply","Marine Ply","BWR (Boiling Water Resistant)","MR (Moisture Resistant)","Blockboard","Flush Door","Shuttering Ply"],10),
  def("plywood","thickness","Thickness",["4 mm","6 mm","9 mm","12 mm","15 mm","18 mm","25 mm"],20),
  def("plywood","size","Sheet Size",["8×4 ft","7×4 ft","6×3 ft","Custom"],30),
  def("plywood","brand","Brand",["Century Ply","Greenply","Kitply","National Ply","Archidply","Action TESA"],40),

  // ── Paint / Primer / Distemper ───────────────────────────────────────
  def("paint-primer","type","Product Type",["Interior Emulsion","Exterior Emulsion","Primer / Sealer","Distemper","Enamel Paint","Epoxy Coating","Anti-Corrosion Paint","Waterproofing Coat"],10),
  def("paint-primer","finish","Finish",["Matt","Silk / Satin","Semi-Gloss","Gloss","Flat"],20),
  def("paint-primer","pack_size","Pack Size",["1 Litre","4 Litre","10 Litre","20 Litre","200 Litre Drum"],30),
  def("paint-primer","brand","Brand",["Asian Paints","Berger","Nerolac","Dulux AkzoNobel","Indigo","Nippon"],40),

  // ── Tiles ─────────────────────────────────────────────────────────────
  def("tiles","type","Tile Type",["Ceramic Floor Tile","Ceramic Wall Tile","Vitrified (Full Body)","Glazed Vitrified (GVT)","Double Charge","Porcelain","Mosaic"],10),
  def("tiles","size","Size",["100×100 mm","200×200 mm","300×300 mm","300×600 mm","400×400 mm","600×600 mm","800×800 mm","1200×600 mm","Custom"],20),
  def("tiles","finish","Finish",["Matt","Gloss / Shiny","Satin","Rustic / Antique","Polished"],30),
  def("tiles","brand","Brand",["Kajaria","Somany","Johnson","Orient Bell","Nitco","Asian Granito","RAK"],40),

  // ── Sanitary / Plumbing Fittings ─────────────────────────────────────
  def("sanitary","product_type","Product Type",["CPVC Fittings","UPVC Fittings","GI Threaded Fittings","CI Soil Fittings","CP Fittings (Taps/Valves)","Sanitary Ware (WC/Washbasin)"],10),
  def("sanitary","size","Size",["15 mm (½\")","20 mm (¾\")","25 mm (1\")","32 mm","40 mm","50 mm","75 mm","110 mm"],20),
  def("sanitary","brand","Brand",["Finolex","Astral","Prince","Supreme","Jaquar","Cera","Hindware","Parryware"],30),

  // ── Aluminium Section / Profile ───────────────────────────────────────
  def("aluminium","section_type","Section Type",["Square Tube","Rectangular Tube","Round Tube","Angle (L Section)","Channel (C Section)","T Section","Z Section","Flat / Bar","Sheet"],10),
  def("aluminium","alloy","Alloy / Grade",["6063 T5","6061 T6","1100","2024","7075","3003"],20),
  def("aluminium","finish","Surface Finish",["Mill Finish","Anodised (Silver)","Anodised (Gold/Bronze)","Powder Coated","Brush Finish"],30),
  def("aluminium","thickness","Thickness / Wall",["1 mm","1.2 mm","1.5 mm","2 mm","2.5 mm","3 mm","4 mm","5 mm","6 mm"],40),

  // ── Roofing / Profile Sheet ───────────────────────────────────────────
  def("roofing-sheet","type","Sheet Type",["GI Corrugated Sheet","Colour Coated Profile Sheet (PPGI)","Polycarbonate Sheet","FRP Sheet","Aluminium Roofing","Metal Deck Sheet"],10),
  def("roofing-sheet","thickness","Thickness (mm)",["0.3 mm","0.4 mm","0.5 mm","0.6 mm","0.8 mm","1 mm"],20),
  def("roofing-sheet","length","Length",["6 ft","8 ft","10 ft","12 ft","14 ft","16 ft","Custom"],30),
  def("roofing-sheet","color","Colour",["Galvanised (Silver)","Red Oxide","Ivory / Cream","Green","Blue","Tile Red","White"],40),

  // ── Safety Equipment / PPE ───────────────────────────────────────────
  def("safety-ppe","product_type","Product Type",["Safety Helmet","Safety Shoes","Safety Gloves","Safety Goggles","Reflective Vest","Ear Muffs / Plugs","Dust Mask / Respirator","Full Body Harness"],10),
  def("safety-ppe","standard","Standard / Certification",["IS 2925","EN 397","ANSI Z89.1","CE Marked","BIS Marked"],20),
  def("safety-ppe","quantity_range","Quantity",["Up to 50 Nos","50–200 Nos","200–500 Nos","500–1000 Nos","1000+ Nos"],30),

  // ── Adhesive / Sealant / Grout ────────────────────────────────────────
  def("adhesive","type","Product Type",["Tile Adhesive (C1/C2)","Tile Grout","Silicone Sealant","Epoxy Adhesive","PU Sealant","Waterproofing Compound","Wall Putty","Joint Filler"],10),
  def("adhesive","pack_size","Pack Size",["1 kg","5 kg","10 kg","20 kg","25 kg","50 kg Bag"],20),
  def("adhesive","brand","Brand",["Dr. Fixit","Fosroc","Sika","MYK Laticrete","Ardex Endura","Saint-Gobain","Ultratech"],30),

  // ── MCB / Switch / Switchgear ─────────────────────────────────────────
  def("mcb-switchgear","product_type","Product Type",["MCB (Miniature Circuit Breaker)","RCCB / ELCB","Distribution Board (DB)","Modular Switch / Socket","Changeover Switch","Contactor","DOL Starter"],10),
  def("mcb-switchgear","rating","Current Rating",["6A","10A","16A","20A","25A","32A","40A","63A","80A","100A","125A"],20),
  def("mcb-switchgear","poles","Poles",["1 Pole (SP)","2 Pole (DP)","3 Pole (TP)","4 Pole"],30,false),
  def("mcb-switchgear","brand","Brand",["Legrand","Havells","Schneider","ABB","Siemens","L&T","HPL"],40),

  // ── Water Tank / Storage Tank ─────────────────────────────────────────
  def("water-tank","type","Tank Type",["Overhead Water Tank (LLDPE)","Underground Sump (FRP)","Chemical Storage Tank (HDPE)","Industrial Tank (SS)","Fire Fighting Tank"],10),
  def("water-tank","capacity","Capacity",["250 Litres","500 Litres","750 Litres","1000 Litres","2000 Litres","3000 Litres","5000 Litres","10000+ Litres"],20),
  def("water-tank","brand","Brand",["Sintex","Penguin","Vectus","Storewel","Supreme","RFL"],30),

  // ── Hardware / Fasteners ──────────────────────────────────────────────
  def("hardware","type","Product Type",["Hex Bolt & Nut","Anchor Bolt / Fastener","Self-Drilling Screw","Hinge (Door/Window)","Padlock","Door Closer","Wire Rope / Chain","Welded Mesh / Binding Wire"],10),
  def("hardware","material","Material",["MS (Plain)","Zinc Plated","Stainless Steel 304","Stainless Steel 316","Brass","Hot-Dip Galvanised"],20),
  def("hardware","size","Size",["M6","M8","M10","M12","M16","M20","M24","Custom"],30),
];

// ── Search helpers ────────────────────────────────────────────────────────

export function searchLocalProducts(query: string): ProductTemplate[] {
  if (!query || query.trim().length < 1) return LOCAL_PRODUCTS.slice(0, 8);
  const q = query.toLowerCase().trim();
  return LOCAL_PRODUCTS.filter(
    (p) =>
      p.displayName.toLowerCase().includes(q) ||
      p.searchTerms.some((t) => t.includes(q)),
  ).slice(0, 10);
}

export function getLocalAttributes(slug: string): AttributeDefinition[] {
  return LOCAL_ATTRIBUTES
    .filter((a) => a.productSlug === slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getLocalProduct(slug: string): ProductTemplate | undefined {
  return LOCAL_PRODUCTS.find((p) => p.slug === slug);
}
