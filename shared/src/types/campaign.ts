export interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}
