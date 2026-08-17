export type Profile = {
  id: string;
  name: string;
  age: number | null;
  university: string | null;
  faculty: string | null;
  bio: string | null;
  preferred_location: string | null;
  max_budget: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileContacts = {
  user_id: string;
  instagram: string | null;
  facebook: string | null;
  phone: string | null;
  updated_at: string;
};

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  city: string;
  location: string | null;
  description: string | null;
  tags: string[];
  rooms: number;
  available_from: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
};

export type SwipeDirection = "like" | "pass";

export type ListingSwipe = {
  user_id: string;
  listing_id: string;
  direction: SwipeDirection;
  created_at: string;
};

export type ListingInterest = {
  id: string;
  listing_id: string;
  user_id: string;
  message: string | null;
  created_at: string;
};

export type InterestWithProfile = ListingInterest & {
  profile: Profile;
  contacts: ProfileContacts | null;
};

/** Minimal Supabase Database type — used to type the client without full codegen. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      profile_contacts: {
        Row: ProfileContacts;
        Insert: Partial<ProfileContacts> & { user_id: string };
        Update: Partial<ProfileContacts>;
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: Partial<Listing> & {
          owner_id: string;
          title: string;
          price: number;
          city: string;
        };
        Update: Partial<Listing>;
        Relationships: [];
      };
      listing_swipes: {
        Row: ListingSwipe;
        Insert: { user_id: string; listing_id: string; direction: SwipeDirection };
        Update: Partial<ListingSwipe>;
        Relationships: [];
      };
      listing_interests: {
        Row: ListingInterest;
        Insert: Partial<ListingInterest> & { listing_id: string; user_id: string };
        Update: Partial<ListingInterest>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
