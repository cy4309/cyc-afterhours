import { adminLogoutResponse } from "@/lib/admin";

export async function POST() {
  return adminLogoutResponse();
}
