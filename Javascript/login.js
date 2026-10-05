 // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, TwitterAuthProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
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
        const db = getFirestore(app);
        const provider = new GoogleAuthProvider();
        const providers = new TwitterAuthProvider()


        // Make sure the signed in user has a document in the users collection.
        // register.html already creates one, but Google and Twitter sign-ins do not,
        // so the document is created here using the details from Firebase Auth:
        // displayName is the real name and photoURL is the Google profile picture.
        async function makeSureUserDocument(user) {
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userRef);

            // Google does not always send a name, so we use the part before
            // the @ in the email address instead of showing a made up name
            const emailName = user.email ? user.email.split("@")[0] : "";
            const realName = user.displayName || emailName;

            // Older accounts may already have a document but no picture,
            // so the Google name and photo are filled in for them here.
            if (userSnapshot.exists()) {
                const existingData = userSnapshot.data() || {};

                if (realName && !existingData.userName) {
                    await updateDoc(userRef, { userName: realName });
                }

                if (user.photoURL && !existingData.imageUrl) {
                    await updateDoc(userRef, { imageUrl: user.photoURL });
                }

                return;
            }

            await setDoc(userRef, {
                uid: user.uid,
                userName: realName || "PayFlow User",
                userEmail: user.email || "",
                userphone: "",
                imageUrl: user.photoURL || "",
                role: "user",
                createdAt: new Date(),
                accountNumber: "1000" + Math.floor(100000 + Math.random() * 900000)
            });

            // A wallet is needed too, otherwise there is nowhere to keep the balance
            await setDoc(doc(db, "wallets", user.uid), {
                uid: user.uid,
                balance: 0,
                createdAt: new Date()
            });

            console.log("Created the user document for", user.uid);
        }


        const loginForm = document.getElementById('loginForm');

        /* Show or hide the password when the eye button is clicked.
           The button starts as an open eye (fa-eye). While the password is
           visible the icon changes to a crossed eye (fa-eye-slash), and
           clicking it again hides the password. */
        const togglePassword = document.getElementById("togglePassword");
        const passwordInput = document.getElementById("password");

        togglePassword.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                // Show the password
                passwordInput.type = "text";
                togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            } else {
                // Hide the password again
                passwordInput.type = "password";
                togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
            }
        });

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()
            signIn()


        });

        document.getElementById("googleSignIn").addEventListener("click", async (e) => {
            e.preventDefault();

            try {
                const googleResult = await signInWithPopup(auth, provider);

                // Save the user's details before going to the dashboard
                await makeSureUserDocument(googleResult.user);

                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Google sign-in failed:", error.message);

            }
        });
        document.getElementById("twitterSignIn").addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const twitterResult = await signInWithPopup(auth, providers);

                // Save the user's details before going to the dashboard
                await makeSureUserDocument(twitterResult.user);

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
                // The password has to be at least 6 characters long
                if (userpassword.length < 6) {
                    alert("Your password must be 6 characters or more.");
                    return;
                }

                const userCredentials = await signInWithEmailAndPassword(auth, useremail, userpassword)

                // Save the user's details before going to the dashboard
                await makeSureUserDocument(userCredentials.user);

                // alert("SignIn Successfully")
                window.location.href = "dashboard.html";



                const user = userCredentials.user;
                console.log(user);

            } catch (error) {
                console.log(error.message);
            

            }



        }
