import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import renderWithTheme from "@Tests/renderWithTheme";

import ToggleButton from "@Components/ToggleButton";

it("should render ToggleButton correctly", () => {
    render(<ToggleButton label="Test toggle Button" onClick={() => {}} />);
    const divElement = screen.getByText(/Test toggle Button/i);
    expect(divElement).toBeInTheDocument();
});
