import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../profile/profile';
import { MemoryRouter } from 'react-router-dom';

const mockSetIsLoggedIn = jest.fn();
const mockSetLoggedInUser = jest.fn();
const mockNavigate = jest.fn();
const mockUsername = 'Bret';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    {
                        id: 1,
                        username: mockUsername,
                        email: 'bret@example.com',
                        phone: '770-736-8031 x56442',
                        address: { street: 'Kulas Light', zipcode: '92998-3874' },
                    },
                ]),
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('shows current logged in user\'s profile information', async () => {
        render(
            <MemoryRouter>
                <Profile setIsLoggedIn={mockSetIsLoggedIn} username={mockUsername} />
            </MemoryRouter>
        );

        // Check if the user's profile information is displayed
        expect(await screen.findByPlaceholderText('bret@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('770-736-8031')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('92998')).toBeInTheDocument();
    });

    test('updates profile information fields when input changes', async () => {
        render(
            <MemoryRouter>
                <Profile setIsLoggedIn={mockSetIsLoggedIn} username={mockUsername} />
            </MemoryRouter>
        );

        // Wait for the profile information to load
        await screen.findByPlaceholderText('bret@example.com');

        // Simulate user updating profile information

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'newemail@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '54321' } });
        fireEvent.change(screen.getByLabelText(/Your Password/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'Amber' } });

        // Check if the input values have updated

        expect(screen.getByLabelText(/Email/i)).toHaveValue('newemail@example.com');
        expect(screen.getByLabelText(/Phone/i)).toHaveValue('123-456-7890');
        expect(screen.getByLabelText(/Zipcode/i)).toHaveValue('54321');
        expect(screen.getByLabelText(/Your Password/i)).toHaveValue('12345');
        expect(screen.getByLabelText(/Username/i)).toHaveValue('Amber');

        const updateButton = screen.getByText(/Update/i);
        fireEvent.click(updateButton);
        expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone/i)).toHaveValue('');
        expect(screen.getByLabelText(/Zipcode/i)).toHaveValue('');
        expect(screen.getByLabelText(/Your Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Username/i)).toHaveValue('');
    });

    test('navigates back to main page when "Back to Main Page" is clicked', () => {
        render(
            <MemoryRouter>
                <Profile setIsLoggedIn={mockSetIsLoggedIn} username={mockUsername} />
            </MemoryRouter>
        );

        // Click the "Back to Main Page" button
        const backButton = screen.getByText(/Back to Main Page/i);
        fireEvent.click(backButton);

        // Expect navigate to have been called
        expect(mockNavigate).toHaveBeenCalled();
    });


    test('shows validation errors for invalid inputs and non-matching passwords', async () => {
        render(
            <MemoryRouter>
                <Profile setIsLoggedIn={mockSetIsLoggedIn} username={mockUsername} />
            </MemoryRouter>
        );

        // Mock the global alert function
        jest.spyOn(window, 'alert').mockImplementation(() => {});

        // Wait for the profile information to load
        await screen.findByPlaceholderText('bret@example.com');
        const updateButton = screen.getByText(/Update/i);
        // Simulate entering an invalid email format
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalidemail' } });
        fireEvent.click(updateButton);
        expect(window.alert).toHaveBeenCalledWith('Invalid email address.');
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bret@example.com' } });


        // Simulate entering an invalid phone format
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123' } });
        fireEvent.click(updateButton);
        expect(window.alert).toHaveBeenCalledWith('Phone number must be in the format xxx-xxx-xxxx.');
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });

        // Simulate entering an invalid postcode format
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12' } });
        fireEvent.click(updateButton);
        expect(window.alert).toHaveBeenCalledWith('Zipcode must be a 5-digit number');
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });

        // Simulate non-matching passwords
        fireEvent.change(screen.getByLabelText(/Your Password/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '12345' } });
        fireEvent.click(updateButton);
        expect(window.alert).toHaveBeenCalledWith('Passwords do not match.');


        // Restore the original alert implementation
        window.alert.mockRestore();
    });

});
