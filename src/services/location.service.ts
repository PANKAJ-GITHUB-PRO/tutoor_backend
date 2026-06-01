const PINCODE_DATA = "https://aniket-thapa.github.io/india-pincode-api";
const INDIA_POST = "http://www.postalpincode.in/api";

const fallbackStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Chandigarh", "Jammu And Kashmir", "Ladakh", "Puducherry", "Andaman And Nicobar Islands"
];

type StateSummary = { name: string; slug: string };
type StateDetails = { districts?: Array<{ name: string; slug: string }> };
type DistrictDetails = { offices?: Array<{ pincode?: string }> };
type PostOffice = { Name?: string; District?: string; State?: string; Pincode?: string; PINCode?: string };
type PinResponse = { Status?: string; PostOffice?: PostOffice[] } | Array<{ Status?: string; PostOffice?: PostOffice[] }>;
const cityAliases: Record<string, string[]> = {
  gurugram: ["Gurugram", "Gurgaon"],
  bengaluru: ["Bengaluru", "Bangalore"],
  bangalore: ["Bangalore", "Bengaluru"],
  mumbai: ["Mumbai", "Bombay"],
  vadodara: ["Vadodara", "Baroda"]
};

async function getJson<T>(url: string): Promise<T | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return undefined;
    return await res.json() as T;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

async function stateSlug(state: string) {
  const states = await getJson<StateSummary[]>(`${PINCODE_DATA}/states.json`);
  return states?.find((item) => item.name.toLowerCase() === state.toLowerCase() || item.slug === slug(state))?.slug ?? slug(state);
}

async function districtSlug(state: string, district: string) {
  const stateId = await stateSlug(state);
  const details = await getJson<StateDetails>(`${PINCODE_DATA}/states/${stateId}.json`);
  return details?.districts?.find((item) => item.name.toLowerCase() === district.toLowerCase() || item.slug === slug(district))?.slug ?? slug(district);
}

export const locationService = {
  states: async () => {
    const states = await getJson<StateSummary[]>(`${PINCODE_DATA}/states.json`);
    return states?.map((state) => titleCase(state.name)).sort() ?? fallbackStates;
  },
  cities: async (state: string) => {
    const details = await getJson<StateDetails>(`${PINCODE_DATA}/states/${await stateSlug(state)}.json`);
    const districts = details?.districts?.map((district) => titleCase(district.name)) ?? [];
    if (state.toLowerCase() === "haryana" && districts.some((item) => item.toLowerCase() === "gurgaon")) districts.push("Gurugram");
    if (state.toLowerCase() === "karnataka" && districts.some((item) => item.toLowerCase() === "bangalore")) districts.push("Bengaluru");
    return [...new Set(districts)].sort();
  },
  pincodes: async (city: string, state?: string) => {
    if (state) {
      const districtNames = cityAliases[city.toLowerCase()] ?? [city];
      const allPincodes: string[] = [];
      for (const district of districtNames) {
        const details = await getJson<DistrictDetails>(`${PINCODE_DATA}/districts/${await stateSlug(state)}/${await districtSlug(state, district)}.json`);
        allPincodes.push(...(details?.offices?.map((office) => office.pincode).filter((pincode): pincode is string => Boolean(pincode)) ?? []));
      }
      if (allPincodes.length) return [...new Set(allPincodes)].sort();
    }

    const names = cityAliases[city.toLowerCase()] ?? [city];
    const allOffices: PostOffice[] = [];
    for (const name of names) {
      const response = await getJson<PinResponse>(`${INDIA_POST}/postoffice/${encodeURIComponent(name)}`);
      allOffices.push(...(Array.isArray(response) ? response[0]?.PostOffice ?? [] : response?.PostOffice ?? []));
    }
    return [...new Set(allOffices
      .filter((office) => !state || office.State?.toLowerCase() === state.toLowerCase())
      .map((office) => office.Pincode ?? office.PINCode)
      .filter((pincode): pincode is string => Boolean(pincode))
    )].sort();
  }
};
