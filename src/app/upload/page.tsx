import { UploadForm } from "@/components/climbing/UploadForm";
import { AdminGate, AdminSignOut } from "@/components/climbing/AdminGate";
import { isAdmin } from "@/lib/admin";
import packageJson from "../../../package.json";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const admin = await isAdmin();

  return (
    <section className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-24">
      <div className="mb-16 flex items-baseline justify-between">
        <h1 className="text-kicker uppercase tracking-mark">Upload</h1>
        <div className="flex items-baseline gap-6">
          <span className="text-caption tracking-caption text-mute">
            v{packageJson.version}
          </span>
          {admin ? <AdminSignOut /> : null}
        </div>
      </div>
      {admin ? <UploadForm /> : <AdminGate />}
    </section>
  );
}
