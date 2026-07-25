import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <section className="mx-auto flex max-w-6xl justify-center px-6 py-16">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
    </section>
  );
}
