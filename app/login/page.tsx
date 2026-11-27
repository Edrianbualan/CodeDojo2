import { AuthPage } from "../../components/auth-page";
export const metadata = { title: "Sign in" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ link?: string; next?: string; password?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="login"
      expired={params.link === "expired"}
      next={params.next}
      passwordUpdated={params.password === "updated"}
    />
  );
}
