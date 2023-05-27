import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import renderWithTheme from "@Tests/renderWithTheme";

import TooltipButton from "@components/TooltipButton";

it("should render TooltipButton correctly", () => {
    render(<TooltipButton label="Test Button" onClick={() => {}} />);
    const divElement = screen.getByText(/Test Button/i);
    expect(divElement).toBeInTheDocument();
});
