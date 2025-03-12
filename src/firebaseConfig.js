// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDWCOsBnvlHkA-rhxDvISeU7nwPmfVefbI",
    authDomain: "xinyuapp-fa95a.firebaseapp.com",
    projectId: "xinyuapp-fa95a",
    storageBucket: "xinyuapp-fa95a.firebasestorage.app",
    messagingSenderId: "130181830975",
    appId: "1:130181830975:web:b4192bbe30d0da5fad1b8a",
    measurementId: "G-V7QXB54PXM"
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google 登录相关
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { auth, provider, signInWithPopup };
