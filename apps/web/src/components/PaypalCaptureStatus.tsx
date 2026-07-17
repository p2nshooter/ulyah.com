"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

export function PaypalCaptureStatus({ dict }: { dict: Dictionary }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"capturing" | "done" | "error" | "none">("none");

  useEffect(() => {
    const token = searchParams.get("token"); // PayPal order id on return
    if (!token) return;
    setStatus("capturing");
    api
      .post(`/donate/paypal/capture/${token}`)
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "capturing") return <p className="mt-4 text-xs text-[var(--color-text-secondary)]">{dict.common.loading}</p>;
  if (status === "error") return <p className="mt-4 text-xs text-danger">{dict.common.error}</p>;
  return null;
}
