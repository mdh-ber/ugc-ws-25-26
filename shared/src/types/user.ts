import { ROLES } from '../constants';

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}
