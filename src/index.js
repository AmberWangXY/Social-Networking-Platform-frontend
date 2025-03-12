import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './auth/auth';
import Main from './main/main';
import Profile from './profile/profile';
import Register from './auth/registeration/register';
import './index.css';

// 应用程序的主组件
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const savedLoggedIn = localStorage.getItem('isLoggedIn');
        return savedLoggedIn === 'true'; // 将字符串 'true' 转换为布尔值
    });

    const [loggedInUser, setLoggedInUser] = useState(() => {
        const savedUser = localStorage.getItem('loggedInUser');
        return savedUser ? JSON.parse(savedUser) : null; // 如果存在则解析为对象
    });

    // 更新登录状态时，将其保存到 localStorage
    useEffect(() => {

        localStorage.setItem('isLoggedIn', isLoggedIn);
        if (loggedInUser && isLoggedIn) {
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // 保存为 JSON 字符串
        } else {
            localStorage.removeItem('loggedInUser'); // 如果没有用户信息，则移除该项
        }
    }, [isLoggedIn, loggedInUser]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        localStorage.removeItem('isLoggedIn'); // 清除 localStorage 中的登录状态
        localStorage.removeItem('loggedInUser'); // 清除 localStorage 中的用户信息
    };

    return (
        <Router>
            <div>
                <Routes>
                    {/* Landing Page (Auth Component) */}
                    <Route
                        path="/"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/main" />
                            ) : (
                                <Auth setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} />
                            )
                        }
                    />
                    <Route path="/register" element={<Register />} />
                    {/* Main Page */}
                    <Route
                        path="/main"
                        element={
                            isLoggedIn ? (
                                <Main setIsLoggedIn={setIsLoggedIn} username={loggedInUser?.username} />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            isLoggedIn ? (
                                <Profile setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} username={loggedInUser?.username} />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

// 渲染应用程序
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
