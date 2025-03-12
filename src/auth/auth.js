import React, { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-social/bootstrap-social.css';
import 'font-awesome/css/font-awesome.min.css'; // 确保安装了 font-awesome

import { auth, provider, signInWithPopup } from "../firebaseConfig";

function Landing({ setIsLoggedIn, setLoggedInUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();

    const [googleUser, setGoogleUser] = useState(null); // 存储从 Google 获取的用户信息
    const [showForm, setShowForm] = useState(false); // 控制浮动窗口显示
    const [newUsername, setNewUsername] = useState(''); // 用户输入的用户名
    const [dob, setDob] = useState(''); // 用户输入的生日
    const [error, setError] = useState(''); // 存储错误信息

    const handleLogin = async () => {
        // 简单的登录验证逻辑，检查用户名和密码是否有效
        try {
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 确保 Cookie 被发送和存储
                body: JSON.stringify({ username, password }), // 将用户名和密码传给后端
            });

            const data = await response.json();

            if (data.result) {
                setIsLoggedIn(true);  // 成功登录，传递用户数据
                setLoggedInUser({ username });
                navigate('/main');
                setErrorText('');
                //setError('');
            } else {
                // 登录失败
                setErrorText(data.error);
            }
        } catch (err) {
            setErrorText('Something went wrong. Please try again later.');
        }
    };


    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(); // 获取 idToken

                //console.log("idToken:", token);

                // 将令牌发送到后端
            const response = await fetch("https://xinyuserver-0542e75f2d7c.herokuapp.com/protected", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if(data.result==='login'){
                    setIsLoggedIn(true);  // 成功登录，传递用户数据
                    setLoggedInUser({ username: data.name});
                    navigate('/main');
                    setErrorText('');
                }else if(data.result==='register'){
                    setGoogleUser(data); // 存储 Google 用户信息
                    setShowForm(true); // 显示浮动窗口
                    setNewUsername(data.name);
                }

            } else {
                setErrorText('Failed to authenticate with Google.');
            }
        } catch (error) {
            console.error('Error during Google login:', error);
            setErrorText('An error occurred during Google login.');
        }
    };

    const handleRegisterWithGoogle = async () => {
        const age = new Date(dob).toISOString();
        if(!dob || !newUsername || !googleUser.email || !googleUser.picture){
            setError('something missing, please try again.');
        }
        try {


            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/google/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({

                    email: googleUser.email,
                    picture: googleUser.picture,
                    username: newUsername,
                    dob:age,
                }),
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                setIsLoggedIn(true);  // 成功登录，传递用户数据
                setLoggedInUser({ username: newUsername});
                navigate('/main');
                setErrorText('');
                setError('');
                setGoogleUser(null); // 存储 Google 用户信息
                setShowForm(false); // 显示浮动窗口
                setNewUsername('');
                setDob('');
            } else {
                setError(data.error || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('An error occurred during registration.');
        }
    };

    const handleCancel = () => {
        setShowForm(false); // 显示浮动窗口
        setNewUsername('');
        setDob('');
        setError('');
    };

    const navigateToRegister = () => {
        // 导航到注册页面
        navigate('/register');
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-4">
                    <div className="card p-4">
                        <h2 className="text-center mb-4">Log In</h2>
                        <div className="form-group mb-3">
                            <label htmlFor="accountName">Account Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="accountName"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {errorText && <div className="alert alert-danger">{errorText}</div>}
                        <button className="btn btn-primary w-100" onClick={handleLogin}>
                            Log In
                        </button>
                        <a
                            className="btn btn-social btn-google"
                            onClick={handleGoogleLogin}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",

                            }}
                        >
                            <span class="fa fa-google"></span> Sign in with Google
                        </a>

                        <button
                            className="btn btn-link w-100 mt-2"
                            onClick={navigateToRegister}
                        >
                            Don't have an account? Register here.
                        </button>



                    </div>
                </div>
            </div>
            {showForm && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >

                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            width: '400px',
                            textAlign: 'center',
                        }}
                    >
                        <h3>Complete Profile</h3>
                        <div className="form-group mb-3">
                            <label htmlFor="displayName">Display name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="displayName"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder={newUsername || ''}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="dob">Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                id="dob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}
                        <div
                            className="d-flex justify-content-center mt-3"
                            style={{
                                gap: '10px', // 设置按钮之间的间距
                            }}
                        >
                            <button
                                className="btn btn-primary"
                                onClick={handleRegisterWithGoogle}
                                style={{flex: '1'}} // 让按钮宽度一致
                            >
                                Confirm
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                style={{flex: '1'}} // 让按钮宽度一致
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Landing;
