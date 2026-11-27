import { AuthPage } from "../../components/auth-page";
export const metadata = { title: "Forgot password" };
export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  return (
    <AuthPage
      mode="forgotPassword"
      expired={(await searchParams).link === "expired"}
    />
  );
}
