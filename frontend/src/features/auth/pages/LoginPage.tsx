import { useAuthStore } from "../../../store/authStore";

export function LoginPage() {
  const { loginEmail, loginPassword, setLoginEmail, setLoginPassword } =
    useAuthStore();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-gray-900">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-400">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Log in to your account
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Enter your details to continue.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="email">
              Email address
            </label>
            <input
              className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
              id="email"
              name="email"
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={loginEmail}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <button
                className="text-sm text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
                type="button"
              >
                Forgot password?
              </button>
            </div>
            <input
              className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
              id="password"
              name="password"
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={loginPassword}
            />
          </div>

          <button
            className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            type="submit"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            className="text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
            type="button"
          >
            Need help?
          </button>
          <span className="text-gray-400" aria-hidden="true">
            |
          </span>
          <p className="text-gray-400">
            New user?{" "}
            <button
              className="text-gray-900 underline underline-offset-4 transition hover:text-gray-400"
              type="button"
            >
              Sign up
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
