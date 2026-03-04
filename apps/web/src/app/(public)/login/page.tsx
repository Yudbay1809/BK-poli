import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";
import FormSubmitButton from "@/components/FormSubmitButton";
import styles from "./login.module.css";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user?.role) {
    redirect(getDefaultRouteByRole(session.user.role));
  }

  const params = searchParams ? await searchParams : undefined;
  const error = params?.error;

  async function loginAction(formData: FormData) {
    "use server";

    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await signIn("credentials", { identifier, password, redirect: false });
      const nextSession = await auth();
      redirect(getDefaultRouteByRole(nextSession?.user?.role));
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=Username%2Femail%20atau%20password%20tidak%20valid");
      }
      throw err;
    }
  }

  return (
    <section className={styles.wrap}>
      <article className={styles.card}>
        <h1>Login BK Poli</h1>
        <p>Masuk menggunakan username atau email sesuai akun Anda.</p>
        {error ? <p className={styles.error}>{error}</p> : null}

        <form action={loginAction} className={styles.form}>
          <label className={styles.field}>
            Username atau Email
            <input
              name="identifier"
              type="text"
              required
              className={styles.input}
              placeholder="contoh: superadmin atau superadmin@bkpoli.local"
            />
          </label>
          <label className={styles.field}>
            Password
            <input name="password" type="password" required className={styles.input} />
          </label>
          <FormSubmitButton idleLabel="Login" pendingLabel="Masuk..." className={styles.submit} />
        </form>
      </article>
    </section>
  );
}
