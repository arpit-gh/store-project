import { useState } from "react";

type SignupStep = "details" | "password" | "otp";

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  { label: "One number", test: (value: string) => /\d/.test(value) },
  {
    label: "One special character",
    test: (value: string) => /[^A-Za-z\d]/.test(value),
  },
];

export function SignupPage() {
  const [step, setStep] = useState<SignupStep>("details");
  const [name, setName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const isPasswordStrong = passwordRules.every(({ test }) => test(password));

  function handleDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("password");
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPasswordStrong) {
      setStep("otp");
    }
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handlePrevious() {
    setStep(step === "otp" ? "password" : "details");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-gray-900">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium tracking-widest text-gray-400">
            CREATE YOUR ACCOUNT
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {step === "details" && "Get started with us"}
            {step === "password" && "Create a secure password"}
            {step === "otp" && "Verify your email"}
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            {step === "details" && "Tell us a little about yourself."}
            {step === "password" &&
              "Use a strong password to protect your account."}
            {step === "otp" && `Enter the verification code sent to ${email}.`}
          </p>
        </div>

        {step === "details" && (
          <form className="space-y-5" onSubmit={handleDetailsSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                id="name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                type="text"
                value={name}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="organisation-name"
              >
                Organisation name
              </label>
              <input
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                id="organisation-name"
                name="organisationName"
                onChange={(event) => setOrganisationName(event.target.value)}
                placeholder="Your organisation"
                required
                type="text"
                value={organisationName}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="signup-email"
              >
                Email address
              </label>
              <input
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                id="signup-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <button
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              type="submit"
            >
              Continue
            </button>
          </form>
        )}

        {step === "password" && (
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="signup-password"
              >
                Password
              </label>
              <input
                autoFocus
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                id="signup-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a strong password"
                required
                type="password"
                value={password}
              />
            </div>

            <ul aria-live="polite" className="space-y-2 text-sm">
              {passwordRules.map(({ label, test }) => {
                const passes = test(password);
                return (
                  <li
                    className={passes ? "text-green-400" : "text-red-400"}
                    key={label}
                  >
                    <span className="mr-2" aria-hidden="true">
                      {passes ? "✓" : "○"}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>

            <button
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={!isPasswordStrong}
              type="submit"
            >
              Continue
            </button>
            <button
              className="w-full text-sm text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
              onClick={handlePrevious}
              type="button"
            >
              Previous
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="space-y-5" onSubmit={handleOtpSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="otp">
                Verification code
              </label>
              <input
                autoFocus
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                id="otp"
                inputMode="numeric"
                maxLength={6}
                name="otp"
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                pattern="[0-9]{6}"
                placeholder="000000"
                required
                type="text"
                value={otp}
              />
            </div>

            <button
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={otp.length !== 6}
              type="submit"
            >
              Verify email
            </button>
            <button
              className="w-full text-sm text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
              onClick={handlePrevious}
              type="button"
            >
              Previous
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            className="text-gray-900 underline underline-offset-4 transition hover:text-gray-400"
            type="button"
          >
            Log in
          </button>
        </p>
      </section>
    </main>
  );
}
