# Contributing Guide

Terima kasih ingin berkontribusi ke BK-poli.

## Prasyarat

1. Node.js 22+
2. pnpm 10+
3. PostgreSQL

## Setup Lokal

1. Fork lalu clone repository.
2. Copy `.env.example` ke `.env`.
3. Jalankan `pnpm install`.
4. Jalankan `pnpm db:migrate`.
5. Jalankan `pnpm db:seed`.
6. Jalankan `pnpm dev`.

## Standar Perubahan

1. Buat branch dari `main`.
2. Pastikan `pnpm --filter web lint` lolos.
3. Pastikan `pnpm build` lolos.
4. Buat PR dengan deskripsi jelas: masalah, solusi, dan dampak.

## Format Commit

Gunakan format commit yang ringkas dan konsisten, contoh:
1. `feat: add patient queue filter`
2. `fix: prevent duplicate booking code`
3. `chore: update prisma migration`

## Pull Request Checklist

1. Perubahan relevan dan fokus.
2. Tidak ada secrets di commit.
3. UI tetap responsif desktop/mobile.
4. Role-based access tidak rusak.
