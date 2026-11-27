import { DojoLab } from "../../components/dojo-lab";

export const metadata = { title: "DojoLab" };

export default function DojoLabPage() {
  return (
    <section className="wrap section">
      <h1>DojoLab</h1>
      <p className="intro">
        Write and run Python or JavaScript in the playground.
      </p>
      <DojoLab
        original={'print("Hello, CodeDojo!")'}
        initialLanguage="Python"
        initiallyOpen
      />
    </section>
  );
}
