 // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, TwitterAuthProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAdMqX6op0mEWrG9O2oqjvDWXvLW4uKy1Y",
            authDomain: "payflow-af3fa.firebaseapp.com",
            projectId: "payflow-af3fa",
            storageBucket: "payflow-af3fa.firebasestorage.app",
            messagingSenderId: "1052382886595",
            appId: "1:1052382886595:web:04388e4d73538b16d18076"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const providers = new TwitterAuthProvider()


        const loginForm = document.getElementById('loginForm');

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()
            signIn()


        });

        document.getElementById("googleSignIn").addEventListener("click", async (e) => {
            e.preventDefault();

            try {
                await signInWithPopup(auth, provider);
                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Google sign-in failed:", error.message);
            
            }
        });
        document.getElementById("twitterSignIn").addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                await signInWithPopup(auth, providers);
                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Twitter sign-in failed:", error.message);
            
            }
        });

        const signIn = async () => {
            let useremail = loginForm.emailphone.value;
            let userpassword = loginForm.password.value;

            loginForm.emailphone.value = "";
            loginForm.password.value = "";

            try {
                const userCredentials = await signInWithEmailAndPassword(auth, useremail, userpassword)
                // alert("SignIn Successfully")
                window.location.href = "dashboard.html";



                const user = userCredentials.user;
                console.log(user);

            } catch (error) {
                console.log(error.message);
            

            }



        }
