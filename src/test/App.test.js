import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
    beforeEach(() => {
        // Mock localStorage methods
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'isLoggedIn') return 'true';
            if (key === 'loggedInUser') return JSON.stringify({ username: 'testUser' });
        });
        jest.spyOn(Storage.prototype, 'setItem');
        jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('redirects to main page if logged in', () => {
        render(<App />);

        // 检查是否重定向到了主页面
        expect(screen.getByText(/Welcome, testUser/i)).toBeInTheDocument();
    });

    test('redirects to login page if not logged in', () => {
        // 将localStorage中的isLoggedIn设为false
        Storage.prototype.getItem.mockImplementation(() => 'false');

        render(<App />);

        // 检查是否显示登录页面内容
        expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    });

    test('logs out user and redirects to login page', () => {
        render(<App />);

        // 模拟用户点击注销按钮
        fireEvent.click(screen.getByText(/Log Out/i));

        // 确保调用了 localStorage 移除方法
        //expect(localStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
        //expect(localStorage.getItem('isLoggedIn')).toBe('false');
        expect(localStorage.removeItem).toHaveBeenCalledWith('loggedInUser');

        // 检查是否返回到登录页面
        expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    });

    test('navigates to registration page', () => {
        Storage.prototype.getItem.mockImplementation(() => 'false');

        render(<App />);

        // 点击注册页面链接
        fireEvent.click(screen.getByText(/Register here/i));

        // 确保显示注册页面内容
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });




});
