"use client";

import { useEffect } from "react";

/**
 * /submit retired — public problems go in the homepage Clevertree room (#mp-general).
 * Client redirect preserves #room (HTTP Location cannot carry a fragment).
 */
export default function SubmitRedirectPage() {
  useEffect(() => {
    window.location.replace("/#room");
  }, []);

  return (
    <main className="site" style={{ padding: "2rem 1rem" }}>
      <p>
        Submit moved to the public room.{" "}
        <a href="/#room">Continue to MyProblem</a>.
      </p>
    </main>
  );
}
