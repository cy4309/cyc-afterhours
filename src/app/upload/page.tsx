import { UploadForm } from "@/components/climbing/UploadForm";
import { AdminGate, AdminSignOut } from "@/components/climbing/AdminGate";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const admin = await isAdmin();

  return (
    <section className="px-4 pb-16">
      <div className="mb-16 flex items-baseline justify-between">
        <h1 className="text-[11px] uppercase tracking-[0.32em]">Upload</h1>
        {admin ? <AdminSignOut /> : null}
      </div>
      {admin ? <UploadForm /> : <AdminGate />}
    </section>
  );
}
