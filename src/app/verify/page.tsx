import { redirect } from "next/navigation";

/** OTP verify flow removed — password auth only. */
export default function VerifyPage() {
  redirect("/login");
}
