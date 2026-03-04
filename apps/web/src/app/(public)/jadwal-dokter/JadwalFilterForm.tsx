"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./jadwal.module.css";

type PoliOption = {
  id: number;
  namaPoli: string;
};

type Props = {
  q: string;
  poliIdFilter: number;
  hariFilter: string;
  todayName: string;
  polis: PoliOption[];
};

export default function JadwalFilterForm({ q, poliIdFilter, hariFilter, todayName, polis }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const qValue = String(formData.get("q") ?? "").trim();
    const poliIdValue = String(formData.get("poliId") ?? "").trim();
    const hariValue = String(formData.get("hari") ?? "").trim();

    const params = new URLSearchParams();
    if (qValue) params.set("q", qValue);
    if (poliIdValue) params.set("poliId", poliIdValue);
    if (hariValue && hariValue !== todayName) params.set("hari", hariValue);

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.push(url as Parameters<typeof router.push>[0], { scroll: false });
    });
  }

  function onReset() {
    startTransition(() => {
      router.push(pathname as Parameters<typeof router.push>[0], { scroll: false });
    });
  }

  const shouldShowReset = Boolean(q) || poliIdFilter > 0 || hariFilter !== todayName;

  return (
    <form onSubmit={onSubmit} className={styles.filterForm}>
      <label className={styles.field}>
        Cari Dokter
        <input name="q" defaultValue={q} placeholder="Contoh: Andi" />
      </label>
      <label className={styles.field}>
        Poli
        <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
          <option value="">Semua Poli</option>
          {polis.map((poli) => (
            <option key={poli.id} value={poli.id}>
              {poli.namaPoli}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        Hari
        <select name="hari" defaultValue={hariFilter}>
          <option value="all">Semua Hari</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
          <option value="Minggu">Minggu</option>
        </select>
      </label>
      <div className={styles.filterActions}>
        <button type="submit" disabled={isPending}>{isPending ? "Memuat..." : "Terapkan"}</button>
        {shouldShowReset ? (
          <button type="button" className={styles.resetButton} onClick={onReset} disabled={isPending}>
            Reset
          </button>
        ) : null}
      </div>
    </form>
  );
}
