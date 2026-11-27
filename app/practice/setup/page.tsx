import { PracticeSetup } from "../../../components/practice-setup";
export const metadata = { title: "Practice setup" };

export default function SetupPage() {
  return (
    <section className="wrap section training-setup">
      <h1>Configure your training</h1>
      <p className="intro">
        Choose a question bank, set your pace, and start practicing.
      </p>
      <PracticeSetup />
    </section>
  );
}
