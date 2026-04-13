import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Update how you show up in AI Colab Tool."
      />
      <ProfileForm />
    </div>
  );
}
