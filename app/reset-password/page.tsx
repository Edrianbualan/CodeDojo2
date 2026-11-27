import { AuthPage } from "../../components/auth-page";
export const metadata = { title: "Reset password" };
export default function ResetPassword() {
  return <AuthPage mode="resetPassword" />;
}
