  // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
        import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
        import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

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
        const db = getFirestore(app)
        const colRef = collection(db, "users");

        const registerForm = document.getElementById('registerForm');

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault()
            signUp()


        });

        const signUp = async () => {
            let username = registerForm.fullname.value;
            let useremail = registerForm.email.value;
            let userpassword = registerForm.password.value;
            let userconfirmpassword = registerForm.confirmpassword.value;
            let userphone = registerForm.phone.value;

            registerForm.fullname.value = "";
            registerForm.email.value = "";
            registerForm.password.value = "";
            registerForm.phone.value = "";
            registerForm.confirmpassword.value = "";






            try {
                const userCredentials = await createUserWithEmailAndPassword(auth, useremail, userpassword)
                console.log(userCredentials);
                // alert("Account created successfully!");
                window.location.href = "login.html"

                registerForm.reset();

                const userDocSnapShot = await setDoc(doc(db, "users", userCredentials.user.uid), {
                    uid: userCredentials.user.uid,
                    userName: username,
                    userEmail: useremail,
                    // userPassword:userpassword,
                    // userconfirmpassword:userconfirmpassword,
                    userphone: userphone,
                    role: "user",
                    createdAt: new Date(),
                    accountNumber: "1000" + Math.floor(100000 + Math.random() * 900000)
                })
                console.log(userDocSnapShot);

                await setDoc(doc(db, "wallets", userCredentials.user.uid), {
                    balance: 0,
                    uid: userCredentials.user.uid,
                    createdAt: new Date()
                })




            } catch (error) {
                console.log(error.message);


            }



        }


