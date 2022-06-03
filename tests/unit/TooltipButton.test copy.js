
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'

import renderWithTheme from '@Tests/renderWithTheme';

import ToggleButton from '@Components/ToggleButton';


it('should render ToggleButton correctly', () => {
    render(
        <ToggleButton label="Test Toggle Button" onClick={() => { }} />
    );
    const divElement = screen.getByText(/Test Toggle Button/i);
    expect(divElement).toBeInTheDocument()
});