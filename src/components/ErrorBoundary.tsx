import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto max-w-xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl uppercase text-bone">Something went wrong</h1>
          <p className="mt-4 font-body text-steel">
            Try reloading the page. If this keeps happening, message us on WhatsApp.
          </p>
          <a
            href="/"
            className="mt-8 inline-block rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
          >
            Back to home
          </a>
        </section>
      );
    }

    return this.props.children;
  }
}
