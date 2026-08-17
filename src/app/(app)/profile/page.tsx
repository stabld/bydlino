import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import type { Profile, ProfileContacts } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: contacts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("profile_contacts").select("*").eq("user_id", user.id).maybeSingle<ProfileContacts>(),
  ]);

  if (!profile) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg lg:text-3xl">Profil</h1>
        <p className="mt-0.5 text-sm text-muted">
          Tohle uvidí inzerent, když se mu ozveš.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
        <div className="lg:order-1">
          <ProfileForm profile={profile} contacts={contacts} />
        </div>
        <div className="mb-5 lg:order-2 lg:mb-0 lg:sticky lg:top-10">
          <ProfileCompleteness profile={profile} contacts={contacts} />
        </div>
      </div>
    </div>
  );
}
