import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';



function Register() {
    const [accountName, setAccountName] = useState('');
    //const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const navigate = useNavigate();



    // 设置页面加载时的时间戳
    useEffect(() => {
        setTimestamp(Date.now());

    }, []);

    // 注册处理函数
    const handleRegister = async (e) => {
        e.preventDefault();

        // 验证账号名称 (仅字母或数字，但不以数字开头)
        const accountNamePattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
        if (!accountNamePattern.test(accountName)) {
            alert('Account name must start with a letter and can only contain letters and numbers.');
            return;
        }

        // 验证邮箱地址
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Invalid email address.');
            return;
        }

        // 验证电话号码 (假设标准美国电话号码)
        const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
        if (!phonePattern.test(phoneNumber)) {
            alert('Phone number must be in the format xxx-xxx-xxxx.');
            return;
        }

        // 验证年龄是否大于等于18岁
        const birthDate = new Date(dob);
        const today = new Date(); // 当前日期

        // 计算用户是否已满 18 岁
        const ageCheck = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        if (birthDate > ageCheck) {
            alert('You must be at least 18 years old to register.');
            return;
        }
        const age = new Date(dob).toISOString();


        const postcodeRegex = /^[0-9]{5}$/;
        if (!postcodeRegex.test(zipcode)) {
            alert('Postcode must be a 5-digit number');
            return;
        }

        // 验证密码是否匹配
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // 其他注册逻辑 (例如保存到后端等)
        try {
            // 向后端发送注册请求
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: accountName,
                    email,
                    dob:age,
                    phone: phoneNumber,
                    zipcode,
                    password,
                }),
            });

            const data = await response.json();

            if (data.result === 'success') {
                alert('Account created successfully!');
                navigate('/'); // 注册成功后跳转到登录页面
            } else {
                alert(data.error || 'Failed to register.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // 清空输入字段
    const handleClear = () => {
        setAccountName('');
        //setDisplayName('');
        setEmail('');
        setPhoneNumber('');
        setDob('');
        setZipcode('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <div className="card p-4">
                        <h2 className="text-center mb-4">Register</h2>
                        <form onSubmit={handleRegister}>
                            <div className="form-group mb-3">
                                <label htmlFor="accountName">Account Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="accountName"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    required
                                    pattern="[a-zA-Z][a-zA-Z0-9]*"
                                    title="Account name must start with a letter and contain only letters and numbers."
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="phoneNumber">Phone Number (format: xxx-xxx-xxxx)</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    pattern="\d{3}-\d{3}-\d{4}"
                                    title="Phone number must be in the format xxx-xxx-xxxx."
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
                            <div className="form-group mb-3">
                                <label htmlFor="zipcode">Zipcode</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="zipcode"
                                    value={zipcode}
                                    onChange={(e) => setZipcode(e.target.value)}
                                    pattern="[0-9]{5}"
                                    title="Postcode must be a 5-digit number"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password">Your Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* 隐藏字段: 时间戳 */}
                            <input type="hidden" name="timestamp" value={timestamp} />

                            <button type="submit" className="btn btn-primary w-100 mb-2">
                                Register
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary w-100"
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                        </form>
                        <button
                            className="btn btn-link w-100 mt-2"
                            onClick={() => navigate('/')}
                        >
                            Already have an account? Log in here.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
