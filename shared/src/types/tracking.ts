export interface Link {
  id: string;
  campaignId: string;
  creatorId: string;
  slug: string;          // e.g. pxyz123
  destinationUrl: string;
}

export interface Click {
  id: string;
  linkId: string;
  createdAt: string;
  referrer?: string;
  userAgent?: string;
}

export interface Conversion {
  id: string;
  linkId: string;
  createdAt: string;
  event: 'signup' | 'enrollment';
  value?: number;
}
