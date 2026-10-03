 // Import Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
        import { getFirestore, collection, getDoc, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
        import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

        // Firebase configuration
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

        const editName = document.getElementById("editName");
        const editEmail = document.getElementById("editEmail");
        const editPhone = document.getElementById("editPhone");
        const editAccountNumber = document.getElementById("editAccountNumber");
        const cancelProfile = document.getElementById("cancelProfile");
        const saveProfile = document.getElementById("saveProfile");
        const profilePhoto = document.getElementById("profilePhoto");
        const profileInitialCircle = document.getElementById("profileInitialCircle");
        const displayName = document.getElementById("displayName");
        const displayPhone = document.getElementById("displayPhone");
        const displayEmail = document.getElementById("displayEmail");

       
        function showProfileInfo(userData) {
            const name = userData.userName ;
            const phone = userData.userphone;
            const email = userData.userEmail;
            console.log(name);
            console.log(phone);
            console.log(email);
            

            displayName.innerHTML = name;
            displayPhone.innerHTML = phone;
            displayEmail.innerHTML = email;

        
            profileInitialCircle.innerHTML = name.charAt(0).toUpperCase();

            
            if (userData.imageUrl) {
                profilePhoto.src = userData.imageUrl;
                profilePhoto.hidden = false;
                profileInitialCircle.hidden = true;
            } else {
                profilePhoto.hidden = true;
                profileInitialCircle.hidden = false;
            }

           
            profilePhoto.onerror = function () {
                profilePhoto.hidden = true;
                profileInitialCircle.hidden = false;
            };
        }

        let currentUserData = null;
        let currentUserUid = null;

       
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "login.html";
                return;
            }

            currentUserUid = user.uid;

           
            const userRef = doc(db, "users", user.uid);

            const  userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                currentUserData = userDoc.data();
                
                editName.value = currentUserData.userName || "";
                editEmail.value = currentUserData.userEmail || user.email;
                editPhone.value = currentUserData.userphone || "";
                editAccountNumber.value = currentUserData.accountNumber || "";

              
                showProfileInfo(currentUserData);
            }
        });

        
        cancelProfile.addEventListener("click", async () => {
            if (currentUserUid) {
                const userRef = doc(db, "users", currentUserUid);

                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    editName.value = userData.userName || "";
                    editEmail.value = userData.userEmail || "";
                    editPhone.value = userData.userphone || "";

                  
                    showProfileInfo(userData);
                }
            }
        });

       
        saveProfile.addEventListener("click", async () => {
            const newName = editName.value.trim();
            const newPhone = editPhone.value.trim();

            if (!newName) {
                alert("Please enter your name");
                return;
            }

            try {
                const userRef = doc(db, "users", currentUserUid)
                
               
                await updateDoc(userRef), {
                    userName: newName,
                    userphone: newPhone
                };

               
                await updateProfile(auth.currentUser, {
                    displayName: newName
                });

                
                currentUserData.userName = newName;
                currentUserData.userphone = newPhone;
                showProfileInfo(currentUserData);

                
            } catch (error) {
                console.log("Error updating profile:", error.message);
              
            }
        });