export type PhoneCountry = {
  iso2: string;
  name: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  exampleNational: string;
};

export const phoneCountries: PhoneCountry[] = [
  {
    iso2: "IN",
    name: "India",
    dialCode: "91",
    minLength: 10,
    maxLength: 10,
    exampleNational: "9876543210",
  },
  {
    iso2: "US",
    name: "United States",
    dialCode: "1",
    minLength: 10,
    maxLength: 10,
    exampleNational: "2015550123",
  },
  {
    iso2: "GB",
    name: "United Kingdom",
    dialCode: "44",
    minLength: 10,
    maxLength: 10,
    exampleNational: "7400123456",
  },
  {
    iso2: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
    minLength: 9,
    maxLength: 9,
    exampleNational: "501234567",
  },
  {
    iso2: "SA",
    name: "Saudi Arabia",
    dialCode: "966",
    minLength: 9,
    maxLength: 9,
    exampleNational: "512345678",
  },
  {
    iso2: "SG",
    name: "Singapore",
    dialCode: "65",
    minLength: 8,
    maxLength: 8,
    exampleNational: "81234567",
  },
  {
    iso2: "BD",
    name: "Bangladesh",
    dialCode: "880",
    minLength: 10,
    maxLength: 10,
    exampleNational: "1812345678",
  },
  {
    iso2: "DE",
    name: "Germany",
    dialCode: "49",
    minLength: 10,
    maxLength: 11,
    exampleNational: "15123456789",
  },
  {
    iso2: "AU",
    name: "Australia",
    dialCode: "61",
    minLength: 9,
    maxLength: 9,
    exampleNational: "412345678",
  },
  {
    iso2: "CA",
    name: "Canada",
    dialCode: "1",
    minLength: 10,
    maxLength: 10,
    exampleNational: "4165550123",
  },
];

export const defaultPhoneCountry = phoneCountries[0];

export function getPhoneCountry(iso2: string) {
  return phoneCountries.find((country) => country.iso2 === iso2) ?? defaultPhoneCountry;
}
