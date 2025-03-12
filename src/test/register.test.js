import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../auth/registeration/register';
import { MemoryRouter } from 'react-router-dom';

// Mock the useNavigate function to track navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays validation message for invalid email format', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        // 找到 Email 输入框并输入一个无效的邮箱格式
        const accountNameInput = screen.getByLabelText(/Account Name/i);
        fireEvent.change(accountNameInput, { target: { value: 'Invalid@Name' } });
        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        // 尝试提交表单
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        // 检查浏览器是否显示了默认的 HTML5 校验错误
        expect(emailInput.validationMessage).toBe('Constraints not satisfied');
        expect(window.alert).toHaveBeenCalledWith('Account name must start with a letter and can only contain letters and numbers.');

        fireEvent.change(accountNameInput, { target: { value: 'bret' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(window.alert).toHaveBeenCalledWith('Invalid email address.');

        fireEvent.change(emailInput, { target: { value: 'bret@qq.com' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(window.alert).toHaveBeenCalledWith('Phone number must be in the format xxx-xxx-xxxx.');
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });

        const dobInput = screen.getByLabelText(/Date of Birth/i);
        const underageDate = new Date();
        underageDate.setFullYear(underageDate.getFullYear() - 17); // 设置为17岁
        fireEvent.change(dobInput, { target: { value: underageDate.toISOString().split('T')[0] } });
        // 尝试提交表单
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(window.alert).toHaveBeenCalledWith('You must be at least 18 years old to register.');
        const adultDate = new Date();
        adultDate.setFullYear(adultDate.getFullYear() - 18); // 设置为18岁
        fireEvent.change(dobInput, { target: { value: adultDate.toISOString().split('T')[0] } });


        // Simulate entering an invalid postcode format
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(window.alert).toHaveBeenCalledWith('Postcode must be a 5-digit number');
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });

        fireEvent.change(screen.getByLabelText(/Your Password/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '12345' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));
        expect(window.alert).toHaveBeenCalledWith('Passwords do not match.');

    });



    test('clears all input fields when Clear button is clicked', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // 填写表单
        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123-456-7890' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Display Name/i), { target: { value: '12345' } });

        // 点击Clear按钮
        fireEvent.click(screen.getByText(/Clear/i));

        // 验证表单字段是否清空
        expect(screen.getByLabelText(/Account Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
        expect(screen.getByLabelText(/Zipcode/i)).toHaveValue('');
        expect(screen.getByLabelText(/Display Name/i)).toHaveValue('');
    });

    test('navigates to login page when "Already have an account?" link is clicked', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // 点击链接
        fireEvent.click(screen.getByText(/Already have an account/i));

        // 验证导航是否发生
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('navigates to login page on successful registration', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // 填写正确格式的数据
        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123-456-7890' } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Your Password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

        // 点击Register按钮
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        // 验证导航是否发生
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
