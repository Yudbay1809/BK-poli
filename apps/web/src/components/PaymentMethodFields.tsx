"use client";

import { useState } from "react";

export default function PaymentMethodFields() {
  const [paymentMethod, setPaymentMethod] = useState<"UMUM" | "BPJS">("UMUM");

  return (
    <>
      <label className="form-field">
        Tipe Pembiayaan
        <select
          name="paymentMethod"
          required
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as "UMUM" | "BPJS")}
        >
          <option value="UMUM">Umum</option>
          <option value="BPJS">BPJS</option>
        </select>
      </label>

      {paymentMethod === "BPJS" ? (
        <label className="form-field">
          Nomor BPJS
          <input name="bpjsNumber" required />
        </label>
      ) : null}
    </>
  );
}
