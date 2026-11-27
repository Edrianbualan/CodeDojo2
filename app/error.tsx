"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap section prose">
      <h1>Something went wrong</h1>
      <p>Try loading this section again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
