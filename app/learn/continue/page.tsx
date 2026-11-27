import { redirect } from "next/navigation";
import { resumeAcademy } from "../../../lib/academy/catalog";
import { academyProgress } from "../../../lib/academy/progress";

export const dynamic = "force-dynamic";

export default async function ContinueLearning() {
  const { records } = await academyProgress();
  redirect(resumeAcademy(records));
}
