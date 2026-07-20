const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function validateGST(value: string): string | null {
  if (!value.trim()) return null;
  if (!GST_REGEX.test(value.trim().toUpperCase())) {
    return "Invalid GSTIN. Format: 22AAAAA0000A1Z5 (15 characters)";
  }
  return null;
}

export function validatePAN(value: string): string | null {
  if (!value.trim()) return null;
  if (!PAN_REGEX.test(value.trim().toUpperCase())) {
    return "Invalid PAN. Format: AAAAA0000A (10 characters)";
  }
  return null;
}

export const b2bCompanyTypes = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "distributor", label: "Distributor / Wholesaler" },
  { value: "trader", label: "Trader / Reseller" },
  { value: "importer", label: "Importer" },
  { value: "exporter", label: "Exporter" },
  { value: "import_export", label: "Import-Export Business" },
  { value: "raw_material_supplier", label: "Raw Material Supplier" },
  { value: "service_provider", label: "Service Provider" },
  { value: "contractor", label: "Contractor / Sub-contractor" },
  { value: "logistics", label: "Logistics & 3PL" },
  { value: "engineering", label: "Engineering Services" },
  { value: "it_software", label: "IT & Software Services" },
  { value: "healthcare_pharma", label: "Healthcare & Pharma" },
  { value: "agriculture", label: "Agriculture & Food Processing" },
  { value: "construction", label: "Construction & Real Estate" },
  { value: "automotive", label: "Automotive Components" },
  { value: "chemical", label: "Chemical & Petrochemical" },
  { value: "textile", label: "Textile & Apparel" },
  { value: "packaging", label: "Packaging Solutions" },
  { value: "equipment", label: "Equipment & Machinery" },
  { value: "retail_chain", label: "Retail Chain (B2B)" },
  { value: "consulting", label: "Consulting & Advisory" },
  { value: "financial", label: "Financial Services" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "mining", label: "Mining & Minerals" },
  { value: "telecom", label: "Telecom & Infrastructure" },
];

export type CountryData = {
  name: string;
  code: string;
  postalLabel: string;
  states: { name: string; code: string }[];
};

export const countriesData: CountryData[] = [
  {
    name: "India",
    code: "IN",
    postalLabel: "PIN Code",
    states: [
      { name: "Andhra Pradesh", code: "AP" },
      { name: "Arunachal Pradesh", code: "AR" },
      { name: "Assam", code: "AS" },
      { name: "Bihar", code: "BR" },
      { name: "Chhattisgarh", code: "CG" },
      { name: "Goa", code: "GA" },
      { name: "Gujarat", code: "GJ" },
      { name: "Haryana", code: "HR" },
      { name: "Himachal Pradesh", code: "HP" },
      { name: "Jharkhand", code: "JH" },
      { name: "Karnataka", code: "KA" },
      { name: "Kerala", code: "KL" },
      { name: "Madhya Pradesh", code: "MP" },
      { name: "Maharashtra", code: "MH" },
      { name: "Manipur", code: "MN" },
      { name: "Meghalaya", code: "ML" },
      { name: "Mizoram", code: "MZ" },
      { name: "Nagaland", code: "NL" },
      { name: "Odisha", code: "OD" },
      { name: "Punjab", code: "PB" },
      { name: "Rajasthan", code: "RJ" },
      { name: "Sikkim", code: "SK" },
      { name: "Tamil Nadu", code: "TN" },
      { name: "Telangana", code: "TS" },
      { name: "Tripura", code: "TR" },
      { name: "Uttar Pradesh", code: "UP" },
      { name: "Uttarakhand", code: "UK" },
      { name: "West Bengal", code: "WB" },
      { name: "Andaman & Nicobar Islands", code: "AN" },
      { name: "Chandigarh", code: "CH" },
      { name: "Dadra, Nagar Haveli & Daman, Diu", code: "DH" },
      { name: "Delhi (NCT)", code: "DL" },
      { name: "Jammu and Kashmir", code: "JK" },
      { name: "Ladakh", code: "LA" },
      { name: "Lakshadweep", code: "LD" },
      { name: "Puducherry", code: "PY" },
    ],
  },
  {
    name: "United States",
    code: "US",
    postalLabel: "ZIP Code",
    states: [
      { name: "Alabama", code: "AL" },
      { name: "Alaska", code: "AK" },
      { name: "Arizona", code: "AZ" },
      { name: "Arkansas", code: "AR" },
      { name: "California", code: "CA" },
      { name: "Colorado", code: "CO" },
      { name: "Connecticut", code: "CT" },
      { name: "Delaware", code: "DE" },
      { name: "Florida", code: "FL" },
      { name: "Georgia", code: "GA" },
      { name: "Hawaii", code: "HI" },
      { name: "Idaho", code: "ID" },
      { name: "Illinois", code: "IL" },
      { name: "Indiana", code: "IN" },
      { name: "Iowa", code: "IA" },
      { name: "Kansas", code: "KS" },
      { name: "Kentucky", code: "KY" },
      { name: "Louisiana", code: "LA" },
      { name: "Maine", code: "ME" },
      { name: "Maryland", code: "MD" },
      { name: "Massachusetts", code: "MA" },
      { name: "Michigan", code: "MI" },
      { name: "Minnesota", code: "MN" },
      { name: "Mississippi", code: "MS" },
      { name: "Missouri", code: "MO" },
      { name: "Montana", code: "MT" },
      { name: "Nebraska", code: "NE" },
      { name: "Nevada", code: "NV" },
      { name: "New Hampshire", code: "NH" },
      { name: "New Jersey", code: "NJ" },
      { name: "New Mexico", code: "NM" },
      { name: "New York", code: "NY" },
      { name: "North Carolina", code: "NC" },
      { name: "North Dakota", code: "ND" },
      { name: "Ohio", code: "OH" },
      { name: "Oklahoma", code: "OK" },
      { name: "Oregon", code: "OR" },
      { name: "Pennsylvania", code: "PA" },
      { name: "Rhode Island", code: "RI" },
      { name: "South Carolina", code: "SC" },
      { name: "South Dakota", code: "SD" },
      { name: "Tennessee", code: "TN" },
      { name: "Texas", code: "TX" },
      { name: "Utah", code: "UT" },
      { name: "Vermont", code: "VT" },
      { name: "Virginia", code: "VA" },
      { name: "Washington", code: "WA" },
      { name: "West Virginia", code: "WV" },
      { name: "Wisconsin", code: "WI" },
      { name: "Wyoming", code: "WY" },
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    postalLabel: "Postcode",
    states: [
      { name: "England", code: "ENG" },
      { name: "Scotland", code: "SCT" },
      { name: "Wales", code: "WLS" },
      { name: "Northern Ireland", code: "NIR" },
    ],
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    postalLabel: "Postal Code",
    states: [
      { name: "Abu Dhabi", code: "AZ" },
      { name: "Dubai", code: "DU" },
      { name: "Sharjah", code: "SH" },
      { name: "Ajman", code: "AJ" },
      { name: "Umm Al Quwain", code: "UQ" },
      { name: "Fujairah", code: "FU" },
      { name: "Ras Al Khaimah", code: "RK" },
    ],
  },
  {
    name: "Singapore",
    code: "SG",
    postalLabel: "Postal Code",
    states: [
      { name: "Central Region", code: "CR" },
      { name: "East Region", code: "ER" },
      { name: "North Region", code: "NR" },
      { name: "North-East Region", code: "NER" },
      { name: "West Region", code: "WR" },
    ],
  },
];

export function getCountryByCode(code: string): CountryData | undefined {
  return countriesData.find((c) => c.code === code);
}

export function getStateNameByCode(countryCode: string, stateCode: string): string | null {
  const country = countriesData.find((c) => c.code === countryCode);
  if (!country) return null;
  return country.states.find((state) => state.code === stateCode)?.name ?? null;
}

/** Find a state code by matching the state name (case-insensitive) from an API response. */
export function findStateCode(countryCode: string, stateName: string): string | null {
  const country = countriesData.find((c) => c.code === countryCode);
  if (!country) return null;
  const normalized = stateName.trim().toLowerCase();
  const match = country.states.find(
    (s) =>
      s.name.toLowerCase() === normalized ||
      s.name.toLowerCase().includes(normalized) ||
      normalized.includes(s.name.toLowerCase()),
  );
  return match?.code ?? null;
}

/** Returns true when the pincode string is complete enough to trigger a lookup. */
export function shouldLookupPincode(pincode: string, countryCode: string): boolean {
  const clean = pincode.trim().replace(/\s/g, "");
  switch (countryCode) {
    case "IN":
      return /^\d{6}$/.test(clean);
    case "US":
      return /^\d{5}$/.test(clean);
    case "GB":
      return clean.length >= 5;
    case "SG":
      return /^\d{6}$/.test(clean);
    default:
      return false; // UAE — no reliable free API
  }
}

export type CompanyFormData = {
  name: string;
  companyType: "buyer" | "supplier" | "hybrid";
  businessType: string;
  gstNumber: string;
  panNumber: string;
};

export type AddressFormData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  pincode: string;
};

export type ProductItem = {
  productName: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  productSlug?: string;
  categorySlug?: string;
  specifications?: string;
  minOrderQty?: number;
  unit?: string;
  priceRange?: string;
};

export type ProductFormData = {
  /** The current (in-progress) product being filled in */
  productName: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  productSlug?: string;
  categorySlug?: string;
  specifications?: string;
  minOrderQty?: number;
  unit?: string;
  priceRange?: string;
  /** Already-added products */
  products: ProductItem[];
};
