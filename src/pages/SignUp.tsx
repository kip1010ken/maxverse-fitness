import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <section className="mx-auto flex max-w-6xl justify-center px-6 py-16">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />
    </section>
  );
}
