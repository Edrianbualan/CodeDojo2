import { AuthPage } from "../../components/auth-page";
export const metadata = { title: "Create an account" };
export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <AuthPage mode="register" next={(await searchParams).next} />;
}
