import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoadBar from "../src/components/LoadBar";

describe("LoadBar", () => {
  it("renders a default aria-label from filled/total when no label given", () => {
    render(<LoadBar filled={3} total={8} />);
    expect(screen.getByRole("img", { name: "3 of 8" })).toBeInTheDocument();
  });

  it("renders a custom label as both aria-label and visible text", () => {
    render(<LoadBar filled={5} total={8} label="Intensity" />);
    expect(screen.getByRole("img", { name: "Intensity" })).toBeInTheDocument();
    expect(screen.getByText("Intensity")).toBeInTheDocument();
  });

  it("renders exactly `total` segments", () => {
    const { container } = render(<LoadBar filled={2} total={6} />);
    expect(container.querySelectorAll("span").length).toBe(6);
  });
});
