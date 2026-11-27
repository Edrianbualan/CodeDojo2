import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section prose">
      <h1>Page not found</h1>
      <p>Check the address or return to the CodeDojo homepage.</p>
      <Link className="button" href="/">
        Return home
      </Link>
    </div>
  );
}
