// src/Landing.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../auth/auth';

// 创建 mock 函数
const mockSetIsLoggedIn = jest.fn();
const mockSetLoggedInUser = jest.fn();
const mockNavigate = jest.fn();

// Mock `useNavigate` 钩子
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Landing Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should log in a previously registered user', async () => {
        // 模拟 fetch 返回成功用户
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve([
                        { username: 'testuser', address: { street: 'password123' } },
                    ]),
            })
        );

        render(
            <MemoryRouter>
                <Auth setIsLoggedIn={mockSetIsLoggedIn} setLoggedInUser={mockSetLoggedInUser} />
            </MemoryRouter>
        );

        // 填入用户名和密码
        fireEvent.change(screen.getByLabelText(/Account Name/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });

        // 点击登录按钮
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));


        // 验证登录状态是否更新
        await waitFor(() => expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true));
        await waitFor(() => expect(mockSetLoggedInUser).toHaveBeenCalledWith({ username: 'testuser' }));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/main'));


    });

    test('should not log in an invalid user', async () => {
        // 模拟 fetch 返回的用户数据不匹配
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ username: 'wronguser', address: { street: 'wrongpassword' } }]),
            })
        );

        render(
            <MemoryRouter>
                <Auth setIsLoggedIn={mockSetIsLoggedIn} setLoggedInUser={mockSetLoggedInUser} />
            </MemoryRouter>
        );

        // 输入错误的用户名和密码
        fireEvent.change(screen.getByLabelText(/Account Name/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });

        // 点击登录按钮
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

        // 确保错误消息显示
        const errorMessage = await screen.findByText(/Invalid username or password/i);
        expect(errorMessage).toBeInTheDocument();

        // 验证登录状态没有更新
        expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
        expect(mockSetLoggedInUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should navigate to register page when "Register here" link is clicked', () => {
        render(
            <MemoryRouter>
                <Auth setIsLoggedIn={mockSetIsLoggedIn} setLoggedInUser={mockSetLoggedInUser} />
            </MemoryRouter>
        );

        // Click on the "Register here" link
        fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Register here\./i }));

        // Ensure navigation to '/register' was triggered
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
