export interface UserAddress {
  id: string;
  label: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export function buildAddressSummary(address: UserAddress) {
  return `${address.street} • ${address.city}, ${address.state}`;
}

export function buildAddressDetails(address: UserAddress) {
  return `${address.street}, ${address.district} • ${address.city}/${address.state} • CEP ${address.zipCode}`;
}