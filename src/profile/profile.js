import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import image4 from '../main/images/img4.jpg';
import BigG from '../main/images/Google__G__logo.svg.png';
import {auth, provider, signInWithPopup} from "../firebaseConfig";

function Profile({ setIsLoggedIn, username ,setLoggedInUser}) {
    const [confirmpassword, setconfirmpassword] = useState('');
    const [email, setEmail] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(''); // 初始化头像路径
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newAvatar, setNewAvatar] = useState(null); // 存储新的头像图片
    const [newEmail, setNewEmail] = useState('');
    const [newZipcode, setNewZipcode] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newusername, setnewusername] =useState('');
    const [userN, setusername]=useState('');
    const [dob, setDob] = useState(''); // 生日
    const [passwordLength,setPasswordLength] = useState(0);
    const [showPasswordFields, setShowPasswordFields] = useState(false); // 控制密码框的显示
    const [updatedFields, setUpdatedFields] = useState([]); // 记录更新成功的字段
    const [googleAccount,setgoogleAccount] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(''); // 存储错误信息
    const [showForm, setShowForm] = useState(false); // 控制浮动窗口显示
    const navigate = useNavigate();
    const [errorfield, setErrorfeild] = useState(''); // 存储错误信息

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 从后端获取用户的 Email
                const emailResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/email`, {
                    method: 'GET',
                    credentials: 'include', // 确保附带 Cookie
                });
                const emailData = await emailResponse.json();
                setEmail(emailData.email);

                // 从后端获取用户的 Phone
                const phoneResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/phone`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const phoneData = await phoneResponse.json();
                setPhone(phoneData.phone);

                // 从后端获取用户的 Zipcode
                const zipcodeResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/zipcode`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const zipcodeData = await zipcodeResponse.json();
                setZipcode(zipcodeData.zipcode);

                const dobResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/dob`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const dobData = await dobResponse.json();
                setDob(new Date(dobData.dob).toLocaleDateString()); // 格式化生日为可读格式

                const responseAvatar = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/avatar', {
                    method: 'GET',
                    credentials: 'include',
                });


                const avatardata = await responseAvatar.json();
                if(avatardata.avatar===''){
                    setAvatar(image4);
                }else if(avatardata.avatar){
                    setAvatar(avatardata.avatar);
                }else{
                    alert(avatardata.error);
                }
                // 从后端获取密码（假设密码存储在 `address.street`）


                await checkGoogleAccount();

                setusername(username);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);



    const handleUpload = async () => {
        if (!newAvatar) {
            alert('Please select an image to upload');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', newAvatar);

        try {
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/avatar', {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                setAvatar(data.avatar); // 保存头像 URL
                console.log('have response: avatar url');
                setNewAvatar(null);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        }
    };

    const handleUpdate = async () => {
        const updated = [];

        if(newAvatar){
            //console.log('we do update.');
            await handleUpload();
            updated.push('Avatar');
        }
        if (newEmail) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(newEmail)) {
                alert('Invalid email address.');
                return;
            }
            try {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/email', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email: newEmail }),
                });
                const data = await response.json();
                if (data.email) {
                    setEmail(newEmail);
                    updated.push('Email');
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Something went wrong while updating email.');
            }
        }

        if (newPhone) {
            const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
            if (!phonePattern.test(newPhone)) {
                alert('Phone number must be in the format xxx-xxx-xxxx.');
                return;
            }
            try {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/phone', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ phone: newPhone }),
                });
                const data = await response.json();
                if (data.phone) {
                    setPhone(newPhone);
                    updated.push('Phone');
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Something went wrong while updating phone.');
            }
        }

        if (newZipcode) {
            const postcodeRegex = /^[0-9]{5}$/;
            if (!postcodeRegex.test(newZipcode)) {
                alert('Zipcode must be a 5-digit number');
                return;
            }
            try {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/zipcode', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ zipcode: newZipcode }),
                });
                const data = await response.json();
                if (data.zipcode) {
                    setZipcode(newZipcode);
                    updated.push('Zipcode');
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Something went wrong while updating zipcode.');
            }
        }

        if (newPassword) {
            if (newPassword !== confirmpassword) {
                alert('Passwords do not match.');
                return;
            }
            try {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ password: newPassword }),
                });
                const data = await response.json();
                if (data.result) {
                    updated.push('Password');
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Something went wrong while updating password.');
            }
        }

        // 在所有更新完成后更新状态
        setUpdatedFields(updated);
        setNewAvatar(null);
        // 清空输入框
        setNewEmail('');
        setNewZipcode('');
        setNewPhone('');
        setNewPassword('');
        setconfirmpassword('');
    };

    const handleLinkGoogle = async ()=>{
        try{
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(); // 获取 idToken
            const response = await fetch("https://xinyuserver-0542e75f2d7c.herokuapp.com/protected", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if(data.result==='fail'){
                    let errortext = 'This Google account already linked: ' + data.name;
                    setError(errortext);
                }else if(data.result==='success'){
                    setError('');
                    setgoogleAccount(data.email);
                    setResult('site');
                }

            } else {
                alert('Failed to authenticate with Google.');
            }
        }catch (error){

        }


    };

    const checkGoogleAccount = async () =>{
        const googleResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/googleAccount`, {
            method: 'GET',
            credentials: 'include',
        });

        const googleData = await googleResponse.json();
        if(googleData.result){
            if(googleData.result==='site'){
                setResult(googleData.result);
                setgoogleAccount(googleData.googleAccount);
            }else if(googleData.result==='google'){
                setResult(googleData.result);
                setgoogleAccount(googleData.googleAccount);
            }else{
                setResult(googleData.result);

            }
        }else{
            alert(googleData.error);
        }
    };

    const handleUnlinkGoogle = async ()=>{
        await checkGoogleAccount();

        if(result==='google'){
            alert('You cannot unlink Google account. Please set your password first!');
            setShowPasswordFields(true);
        }else if(result==='site'){
            const googleResponse1 = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/googleAccount/delete`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const googleData1 = await googleResponse1.json();
            if(googleData1.result){
                setResult('No google account');
                setgoogleAccount('');
            }else{
                alert(googleData1.error);
            }
        }
    };

    const handleLinkAccount = async ()=>{
        try {
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 确保 Cookie 被发送和存储
                body: JSON.stringify({ username:newusername, password }), // 将用户名和密码传给后端
            });

            const data = await response.json();

            if (data.result==='success') {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/linkAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 确保 Cookie 被发送和存储
                    body: JSON.stringify({ newusername, userN,Googleaccount:googleAccount }), // 将用户名和密码传给后端
                });
                const data1 = await response.json();

                if(data1.username===newusername){
                    //setIsLoggedIn(true);
                    //console.log('in the right place');
                    let username = data1.username;
                    setLoggedInUser({ username});
                    //console.error('Setting loggedInUser:', data1.username);
                    localStorage.setItem('loggedInUser', JSON.stringify({ username: data1.username })); // 手动更新 localStorage
                    //console.log('Updated loggedInUser:', { username: data1.username });

                    setPassword('');
                    setnewusername('');
                    setShowForm(false);
                    setErrorfeild('');
                    setEmail(data1.email);
                    setusername(data1.username);
                    setPhone(data1.phone);
                    setAvatar(data1.avatar);
                    setZipcode(data1.zipcode);
                    setResult('site');


                }else{
                    setErrorfeild(data1.error);
                }

            } else {
                // 登录失败
                setErrorfeild(data.error);
            }
        } catch (err) {
            setErrorfeild('Something went wrong. Please try again later.');
        }
        //setErrorfeild('no users');
    };

    const handleCancel = async ()=>{
        setPassword('');
        setnewusername('');
        setShowForm(false);
        setErrorfeild('');
    };





    return (
        <div className="container mt-4">
            <h3>Your Profile</h3>

            <div className="card p-4 mb-4">
                <div className="row">
                    <div className="col-md-4 text-center">
                        <img src={avatar} alt="Avatar" className="rounded-circle mb-3" style={{ width: '150px', height: '150px' }} />
                        <input type="file" accept="image/*"  onChange={(e) =>setNewAvatar(e.target.files[0])} className="form-control mb-3" />

                        {googleAccount? (
                            <button className="btn btn-light border d-flex align-items-center" onClick={handleUnlinkGoogle}>
                                <img
                                    src={BigG}
                                    alt="Google logo"
                                    style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                />
                                <span className="me-auto">Linked Account: {googleAccount}</span>
                                <span
                                    className="badge bg-danger text-white"
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: '5px',


                                    }}
                                >
                                    Unlink
                                </span>
                            </button>
                        ) :(

                                <button className="btn btn-primary" onClick={handleLinkGoogle}>
                                    <img
                                        src={BigG}
                                        alt="Google logo"
                                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                    />
                                    Link Google Account
                                </button>
                        )}
                        {result === 'google' && (
                            <button
                                className="btn btn-primary"
                                style={{
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                }}
                                onClick={()=>setShowForm(true)}
                            >
                                Link Account
                            </button>
                        )}
                        {error && <div className="alert alert-danger">{error}</div>}
                    </div>



                    <div className="col-md-8">
                        <div className="mb-3">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={userN}
                                readOnly // 禁止编辑
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="dob">Date of Birth</label>
                            <input
                                type="text"
                                className="form-control"
                                id="dob"
                                value={dob}
                                readOnly // 禁止编辑
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder={email}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="zipcode">Zipcode</label>
                            <input
                                type="text"
                                className="form-control"
                                id="zipcode"
                                placeholder={zipcode}
                                value={newZipcode}
                                onChange={(e) => setNewZipcode(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                placeholder={phone}
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                pattern="\d{3}-\d{3}-\d{4}"
                                title="Phone number must be in the format xxx-xxx-xxxx."
                            />
                        </div>


                        {showPasswordFields && (
                            <>
                                <div className="mb-3">
                                    <label htmlFor="password">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="confirmpassword">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmpassword"
                                        value={confirmpassword}
                                        onChange={(e) => setconfirmpassword(e.target.value)}
                                    />
                                </div>
                            </>
                        )}


                        {updatedFields.length > 0 && (
                            <div className="alert alert-success mt-3">
                                {updatedFields.join(', ')} updated successfully!
                            </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                            >
                                {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                            </button>

                            <button className="btn btn-primary" onClick={handleUpdate}>
                                Update Profile
                            </button>
                            <button className="btn btn-link" onClick={() => navigate('/main')}>
                                Back to Main Page
                            </button>
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
                                    <h3>Link Account</h3>
                                    <div className="form-group mb-3">
                                        <label htmlFor="displayName">User name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="displayName"
                                            value={newusername}
                                            onChange={(e) => setnewusername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="dob">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="pass"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {errorfield && <div className="alert alert-danger">{errorfield}</div>}
                                    <div
                                        className="d-flex justify-content-center mt-3"
                                        style={{
                                            gap: '10px', // 设置按钮之间的间距
                                        }}
                                    >
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleLinkAccount}
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
                </div>
            </div>


        </div>
    );
}

export default Profile;
