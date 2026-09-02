import { fireEvent, render, screen } from "@testing-library/react";
import ImageCarousel, { resolveCarouselLanguage } from "../ImageCarousel";

const images = ["/carousels/invitati/01.svg", "/carousels/invitati/02.svg", "/carousels/invitati/03.svg"];

describe("ImageCarousel", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: jest.fn(() => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() })) });
  });

  it("uses Spanish carousel copy for the Mexican locale", () => {
    expect(resolveCarouselLanguage("mx")).toBe("es");
  });

  it("renders the real slide count and descriptive alt text", () => {
    render(<ImageCarousel images={images} />);
    expect(screen.getByText("1 / 3")).not.toBeNull();
    expect(screen.getByAltText("Organizzazione dei tavoli e della lista invitati")).not.toBeNull();
    expect(screen.queryByAltText("Slide 2")).toBeNull();
  });

  it("supports button and keyboard navigation", () => {
    render(<ImageCarousel images={images} />);
    fireEvent.click(screen.getByRole("button", { name: "Immagine successiva" }));
    expect(screen.getByText("2 / 3")).not.toBeNull();
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });
    expect(screen.getByText("3 / 3")).not.toBeNull();
  });

  it("keeps its dimensions and shows a coherent fallback after an image error", () => {
    render(<ImageCarousel images={images} />);
    fireEvent.error(screen.getByAltText("Ricevimento di matrimonio con gli invitati"));
    expect(screen.getByText("Immagine temporaneamente non disponibile")).not.toBeNull();
  });
});
