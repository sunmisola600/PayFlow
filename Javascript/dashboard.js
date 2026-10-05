// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, getDoc, doc, setDoc, updateDoc, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
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
const userRef = collection(db, "users");
const walletRef = collection(db, "wallets");
const transactionRef = collection(db, "transactions")


const welcomemessage = document.getElementById("welcomemessage");
const useremail = document.getElementById("useremail");
const walletmoney = document.getElementById("walletmoney");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const totalSavings = document.getElementById("totalSavings");
const addmoney = document.getElementById("addmoney");
const moneyModal = document.getElementById("moneyModal");
const amountInput = document.getElementById("amountInput");
const cancelMoney = document.getElementById("cancelMoney");
const confirmMoney = document.getElementById("confirmMoney");
const recentTransactions = document.getElementById("recentTransactions");
const savingsGoalsPanel = document.getElementById("savingsGoalsPanel");
const sendMoney = document.getElementById("sendMoney");
const sendMoneyModal = document.getElementById("sendMoneyModal");
const cancelSendMoney = document.getElementById("cancelSendMoney");
const accountNumber = document.getElementById("accountNumber");
const accountName = document.getElementById("accountName");
const confirmTransfer = document.getElementById("confirmTransfer");
const transferAmount = document.getElementById("transferAmount");
const addExpense = document.getElementById("addExpense");
const expenseModal = document.getElementById("expenseModal");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDescription = document.getElementById("expenseDescription");
const cancelExpense = document.getElementById("cancelExpense");
const confirmExpense = document.getElementById("confirmExpense");
const addSaving = document.getElementById("addSaving");
const savingModal = document.getElementById("savingModal");
const savingGoal = document.getElementById("savingGoal");
const savingTarget = document.getElementById("savingTarget");
const savingAmount = document.getElementById("savingAmount");
const cancelSaving = document.getElementById("cancelSaving");
const confirmSaving = document.getElementById("confirmSaving");
const profileinItial = document.getElementById("profileinItial");
const profileName = document.getElementById("profileName");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");



themeToggle.onclick = function () {
    document.body.classList.toggle("dark-mode");

};

let currentUser = null;
onAuthStateChanged(auth, async (user) => {

    if (user) {
        currentUser = user;
        console.log("Current user:", currentUser.uid);
        console.log("User is logged in:", user.email);
        console.log("User UID:", user.uid);
        

    } else {
        window.location.href = "login.html";
        return;
    }


    try {
        const userRef = doc(db, "users", user.uid);
        let userDocSnapShot = await getDoc(userRef);

        // Some accounts (Google and Twitter sign-ins) have no user document yet,
        // so create one now from the details Firebase Auth already has.
        // user.displayName is the real name that Google and Twitter give us.
        if (!userDocSnapShot.exists()) {
            console.log("No user document found, creating one for", user.uid);

            await setDoc(userRef, {
                uid: user.uid,
                userName: user.displayName || emailName || "PayFlow User",
                userEmail: user.email || "",
                userphone: "",
                imageUrl: user.photoURL || "",
                role: "user",
                createdAt: new Date(),
                accountNumber: "1000" + Math.floor(100000 + Math.random() * 900000)
            });

            userDocSnapShot = await getDoc(userRef);
        }

        // Older documents may not have the Google name or picture saved yet
        const savedData = userDocSnapShot.data() || {};

        // Google does not always send a name, so use the part before the @ in the email
        const emailName = user.email ? user.email.split("@")[0] : "";
        const newName = user.displayName || emailName;

        if (newName && !savedData.userName) {
            await updateDoc(userRef, { userName: newName });
        }

        if (user.photoURL && !savedData.imageUrl) {
            await updateDoc(userRef, { imageUrl: user.photoURL });
        }

        // Fallback values in case a field is empty
        const userData = userDocSnapShot.data() || {};

        // Work out the best name to show.
        // 1. userName from the users document
        // 2. the name Firebase Auth has (Google and Twitter send this)
        // 3. the part before the @ in the email address
        // 4. if there is no name anywhere, the greeting just says welcome
        const realName = userData.userName || newName;
        const userName = realName || "User";
        const userMail = userData.userEmail || user.email;

        console.log(userName);

        if (realName) {
            welcomemessage.innerHTML = `Good morning, ${realName} 👋`
        } else {
            welcomemessage.innerHTML = `Welcome to PayFlow 👋`
        }

        useremail.innerHTML = `${userMail}`
        profileName.innerHTML = userName;

        // First letter of the name is shown on desktop AND on mobile
        const userInitial = userName.charAt(0).toUpperCase();
        profileInitial.innerHTML = userInitial;
        document.getElementById("profileInitialMobile").innerHTML = userInitial;

        // If there is a picture (for example the Google profile picture)
        // we show it inside the avatar circles instead of the letter
        if (userData.imageUrl) {
            showProfilePicture(userData.imageUrl);
        }

    } catch (error) {
        console.log(error.message);


    };




    try {
        const walletRef = doc(db, "wallets", user.uid);

        // let, so we can give it a new value after creating the wallet below
        let walletSnapshot = await getDoc(walletRef);

        // This user has no wallet document yet, so create one with a zero balance
        if (!walletSnapshot.exists()) {
            await setDoc(walletRef, {
                uid: user.uid,
                balance: 0,
                createdAt: new Date()
            });

            // Read the new wallet document. Without this the code below
            // would still be looking at an empty result.
            walletSnapshot = await getDoc(walletRef);
        }


        const walletData = walletSnapshot.data() || { balance: 0 };
        const balance = Number(walletData.balance) || 0;

        console.log("Wallet balance:", balance);

        walletmoney.innerHTML = `₦${balance.toLocaleString()}.00`;

        loadDashboardStats();
        loadRecentTransactions();
        loadSavingsGoals();

    } catch (error) {
        console.log(error.message);


    }
});
/* Put the user's picture inside the two avatar circles (desktop and mobile).
   If the picture cannot be loaded we simply keep showing the first letter. */
function showProfilePicture(imageUrl) {
    const picture = new Image();

    picture.onload = function () {

        // Desktop avatar
        profileInitial.style.backgroundImage = "url('" + imageUrl + "')";
        profileInitial.style.backgroundSize = "cover";
        profileInitial.style.backgroundPosition = "center";
        profileInitial.textContent = "";

        // Mobile avatar
        const mobileAvatar = document.getElementById("profileInitialMobile");
        mobileAvatar.style.backgroundImage = "url('" + imageUrl + "')";
        mobileAvatar.style.backgroundSize = "cover";
        mobileAvatar.style.backgroundPosition = "center";
        mobileAvatar.textContent = "";
    };

    picture.onerror = function () {
        console.log("Profile picture could not be loaded, showing the initial instead.");
    };

    picture.src = imageUrl;
}

addmoney.addEventListener("click", () => {

    moneyModal.style.display = "flex";



});


cancelMoney.addEventListener("click", () => {

    moneyModal.style.display = "none";

});


confirmMoney.addEventListener("click", async () => {

    let amount = Number(amountInput.value);

    if (amount <= 0 || isNaN(amount)) {
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Invalid Amount',
        //     text: 'Please enter a valid amount',
        //     confirmButtonColor: '#4f46e5'
        // });
        return;
    }
    console.log(amount);


    const walletRef = doc(db, "wallets", currentUser.uid);
    console.log(walletRef);

    const walletSnapshot = await getDoc(walletRef);
    console.log(walletSnapshot);

    const walletData = walletSnapshot.data();
    console.log(walletData);

    const newBalance = walletData.balance + amount;
    console.log(newBalance);

    const walletUpdate = await updateDoc(walletRef, {
        balance: newBalance
    })

    walletmoney.innerHTML = `₦${newBalance.toLocaleString()}.00`





    const transactionData = {
        uid: currentUser.uid,
        type: "deposit",
        amount: Number(amount),
        description: "Money added to wallet",
        date: new Date()
    };
    const transactions = await addDoc(collection(db, "transactions"), transactionData);
    console.log(transactions);


    amountInput.value = "";

    moneyModal.style.display = "none";

loadDashboardStats();
        loadRecentTransactions();
});


let recipientUid = null;

sendMoney.addEventListener("click", () => {
    sendMoneyModal.style.display = "flex";
    // console.log(sendMoney);

});

cancelSendMoney.addEventListener("click", () => {
    sendMoneyModal.style.display = "none";
});

accountNumber.addEventListener("input", async () => {

    const recipientQuery = query(
        collection(db, "users"),
        where("accountNumber", "==", accountNumber.value)
    );

    const recipientSnapshot = await getDocs(recipientQuery);

    if (!recipientSnapshot.empty) {

        const recipientDoc = recipientSnapshot.docs[0];

        const recipientData = recipientDoc.data();

        recipientUid = recipientDoc.id;

        console.log("Recipient UID:", recipientUid);

        accountName.value = recipientData.userName;
    } else {

        accountName.value = "";

        recipientUid = null;

    }

});

addExpense.addEventListener("click", () => {
    expenseModal.style.display = "flex";
});

cancelExpense.addEventListener("click", () => {
    expenseModal.style.display = "none";
});

confirmExpense.addEventListener("click", async () => {
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const extraDesc = expenseDescription.value.trim();
    const description = extraDesc
        ? `${extraDesc} (${category})`
        : `Expense: ${category}`;

    if (amount <= 0 || isNaN(amount)) {
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Invalid Amount',
        //     text: 'Please enter a valid amount',
        //     confirmButtonColor: '#4f46e5'
        // });
        return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const walletSnapshot = await getDoc(walletRef);
    const walletData = walletSnapshot.data();

    if (amount > walletData.balance) {
        Swal.fire({
            icon: 'error',
            title: 'Insufficient Balance',
            text: 'Insufficient balance',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    const newBalance = walletData.balance - amount;
    await updateDoc(walletRef, { balance: newBalance });

    walletmoney.innerHTML = `₦${newBalance.toLocaleString()}.00`;

    await addDoc(collection(db, "transactions"), {
        uid: currentUser.uid,
        type: "expense",
        category: category,
        amount: amount,
        description: description,
        date: new Date()
    });

    expenseAmount.value = "";
    expenseDescription.value = "";
    expenseModal.style.display = "none";

loadDashboardStats();
        loadRecentTransactions();

    
});

addSaving.addEventListener("click", () => {
    savingModal.style.display = "flex";
});

cancelSaving.addEventListener("click", () => {
    savingModal.style.display = "none";
});

confirmSaving.addEventListener("click", async () => {
    const amount = Number(savingAmount.value);
    const goalName = savingGoal.value.trim();
    const targetAmount = Number(savingTarget.value);

    if (!goalName) {
        alert("Please enter a goal name");
        return;
    }
    if (amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid amount");
        return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const walletSnapshot = await getDoc(walletRef);
    const walletData = walletSnapshot.data();

    if (amount > walletData.balance) {
        alert("Insufficient balance");
        return;
    }

    const newBalance = walletData.balance - amount;
    await updateDoc(walletRef, { balance: newBalance });

    walletmoney.innerHTML = `₦${newBalance.toLocaleString()}.00`;

    await addDoc(collection(db, "transactions"), {
        uid: currentUser.uid,
        type: "saving",
        amount: amount,
        description: `Saved towards: ${goalName}`,
        date: new Date()
    });

    await saveSavingsGoal(goalName, targetAmount, amount);

    savingGoal.value = "";
    savingTarget.value = "";
    savingAmount.value = "";
    savingModal.style.display = "none";

loadDashboardStats();
        loadRecentTransactions();
    loadSavingsGoals();

    alert(`Saved ₦${amount.toLocaleString()} towards: ${goalName}!`);
});



confirmTransfer.addEventListener("click", async () => {
    const amount = Number(transferAmount.value);
    const accNumber = accountNumber.value.trim();

    if (amount <= 0 || !accNumber) {
        alert("Please enter a valid account number and amount");
        return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const walletSnapshot = await getDoc(walletRef);
    const walletData = walletSnapshot.data();

    if (amount > walletData.balance) {
        alert("Insufficient balance");
        return;
    }

    const recipientQuery = query(
        collection(db, "users"),
        where("accountNumber", "==", accNumber)
    );
    const recipientSnapshot = await getDocs(recipientQuery);

    if (recipientSnapshot.empty) {
        alert("Account not found. Please check the account number.");
        return;
    }

    const recipientDoc = recipientSnapshot.docs[0];
    const recipientUid = recipientDoc.id;

    if (recipientUid === currentUser.uid) {
        alert("You cannot transfer money to yourself");
        return;
    }

    const recipientWalletRef = doc(db, "wallets", recipientUid);
    const recipientWalletSnapshot = await getDoc(recipientWalletRef);

    let recipientBalance = 0;
    if (recipientWalletSnapshot.exists()) {
        recipientBalance = recipientWalletSnapshot.data().balance;
    }

    const newSenderBalance = walletData.balance - amount;
    const newRecipientBalance = recipientBalance + amount;

    await updateDoc(walletRef, { balance: newSenderBalance });

    if (recipientWalletSnapshot.exists()) {
        await updateDoc(recipientWalletRef, { balance: newRecipientBalance });
    } else {
        await setDoc(recipientWalletRef, {
            uid: recipientUid,
            balance: newRecipientBalance,
            createdAt: new Date()
        });
    }

    await addDoc(collection(db, "transactions"), {
        uid: currentUser.uid,
        type: "transfer_out",
        amount: amount,
        description: `Sent to account ${accNumber}`,
        date: new Date()
    });

    await addDoc(collection(db, "transactions"), {
        uid: recipientUid,
        type: "transfer_in",
        amount: amount,
        description: "Money received",
        date: new Date()
    });

    walletmoney.innerHTML = `₦${newSenderBalance.toLocaleString()}.00`;

    accountNumber.value = "";
    accountName.value = "";
    transferAmount.value = "";

    sendMoneyModal.style.display = "none";

loadDashboardStats();
        loadRecentTransactions();

    alert(`Successfully sent ₦${amount.toLocaleString()}!`);
});

async function loadDashboardStats() {
    if (!currentUser) return;

    const snapshot = await getDocs(collection(db, "transactions"));
    const transactions = snapshot.docs.map(doc => doc.data());

    let income = 0;
    let expenses = 0;
    let savings = 0;

    transactions.forEach((t) => {
        if (t.uid !== currentUser.uid) return;

        const amt = Number(t.amount);

        if (t.type === "deposit") {
            income += amt;
        } else if (t.type === "transfer_in") {
            income += amt;
        } else if (t.type === "expense") {
            expenses += amt;
        } else if (t.type === "saving") {
            savings += amt;
        } else if (t.type === "transfer_out") {
            expenses += amt;
        }
    });

    totalIncome.textContent = `₦${income.toLocaleString()}.00`;
    totalExpenses.textContent = `₦${expenses.toLocaleString()}.00`;
    totalSavings.textContent = `₦${savings.toLocaleString()}.00`;
}

async function saveSavingsGoal(goalName, targetAmount, amount) {


    if (!currentUser) {
        return;
    }



    const savingsSnapshot = await getDocs(
        collection(db, "savingsGoals")
    );


    const savingsGoals = savingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));


    // Check if the user already has this goal
    const existingGoal = savingsGoals.find(goal =>
        goal.uid === currentUser.uid &&
        goal.goalName === goalName
    );


    // If the goal already exists
    if (existingGoal) {

        // Add the new amount to the old saved amount
        const newSavedAmount =
            existingGoal.savedAmount + amount;


        // Update the savings goal
        await updateDoc(
            doc(db, "savingsGoals", existingGoal.id),
            {
                savedAmount: newSavedAmount,
                targetAmount:
                    targetAmount > 0
                        ? targetAmount
                        : existingGoal.targetAmount
            }
        );

    } else {

        // Create a new savings goal
        const newTargetAmount =
            targetAmount > 0
                ? targetAmount
                : amount;


        await addDoc(
            collection(db, "savingsGoals"),
            {
                uid: currentUser.uid,
                goalName: goalName,
                targetAmount: newTargetAmount,
                savedAmount: amount,
                createdAt: new Date()
            }
        );
    }
}
async function loadSavingsGoals() {

    // Make sure a user is logged in
    if (!currentUser) {
        return;
    }


    // Add the savings goals heading
    savingsGoalsPanel.innerHTML = `
        <div class="panel-heading">
            <h2>Savings Goals</h2>
            <a href="savings.html">View All</a>
        </div>
    `;


    // Get all savings goals
    const savingsSnapshot = await getDocs(
        collection(db, "savingsGoals")
    );


    // Get only the current user's goals
    const savingsGoals = savingsSnapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        .filter(goal => goal.uid === currentUser.uid);


    // Check if the user has no goals
    if (savingsGoals.length === 0) {

        savingsGoalsPanel.innerHTML += `
            <p style="padding: 20px; color: #98a2b3; text-align: center; font-size: 14px;">
                No savings goals yet. Click "Add Savings" to get started!
            </p> `;

        return;
    }


    // Display each savings goal
    savingsGoals.forEach(goal => {

        // Calculate the percentage saved
        const progress =
            Math.round(
                (goal.savedAmount / goal.targetAmount) * 100
            );


        // Make sure progress does not go above 100%
        const progressPercent = Math.min(100, progress);


        // Calculate how much is left
        const remaining =
            goal.targetAmount - goal.savedAmount;


        // Create the message below the progress bar
        let remainingText;

        if (remaining > 0) {

            remainingText =
                `₦${remaining.toLocaleString()} left to save`;

        } else {

            remainingText = "Goal reached!";

        }


        // Display the savings goal
        savingsGoalsPanel.innerHTML += `
            <div class="savings-goal">

                <div class="savings-goal-header">

                    <h3>${goal.goalName}</h3>

                    <span>
                        ₦${goal.savedAmount.toLocaleString()}
                        /
                        ₦${goal.targetAmount.toLocaleString()}
                    </span>

                </div>


                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width: ${progressPercent}%">
                    </div>

                </div>


                <p class="savings-goal-subtext">
                    ${remainingText}
                </p>

            </div>
        `;
    });
}

function formatDate(date) {

    // Get today's date
    const today = new Date();


    // Firestore may give us a Timestamp.
    // Convert it to a normal JavaScript Date.
    let transactionDate;

    if (date.toDate) {
        transactionDate = date.toDate();
    } else {
        transactionDate = date;
    }


    // Calculate the difference in days
    const difference =
        today - transactionDate;

    const millisecondsInOneDay =
        1000 * 60 * 60 * 24;

    const differenceInDays =
        Math.floor(
            difference / millisecondsInOneDay
        );


    // If the transaction happened today
    if (differenceInDays === 0) {
        return "Today";
    }


    // If the transaction happened yesterday
    if (differenceInDays === 1) {
        return "Yesterday";
    }


    // If the transaction happened within the last 7 days
    if (differenceInDays < 7) {

        const days = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];

        const dayName =
            days[transactionDate.getDay()];

        const dateName =
            transactionDate.toLocaleDateString(
                "en-NG",
                {
                    month: "short",
                    day: "numeric"
                }
            );

        return dayName + ", " + dateName;
    }


    // If the transaction is older than 7 days
    return transactionDate.toLocaleDateString(
        "en-NG",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

async function loadRecentTransactions() {
    if (!currentUser) return;

    const snapshot = await getDocs(collection(db, "transactions"));
    const allTransactions = snapshot.docs.map(doc => doc.data());

    // Keep only the current user transactions
    const userTransactions = allTransactions.filter(
        t => t.uid === currentUser.uid
    );

    // Sort newest first (handles Firestore Timestamps and Dates)
    userTransactions.sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : a.date;
        const dateB = b.date.toDate ? b.date.toDate() : b.date;
        return dateB - dateA;
    });

    // Show only the 5 most recent
    const transactions = userTransactions.slice(0, 5);

    const headingHtml = `
                <div class="panel-heading">
                    <h2>Recent Transactions</h2>
                    <a href="transactions.html">View All</a>
                </div>`;

    recentTransactions.innerHTML = headingHtml;

    if (transactions.length === 0) {
        recentTransactions.innerHTML +=
            `<p style="padding: 20px; color: #98a2b3; text-align: center; font-size: 14px;">
                        No recent transactions yet.
                    </p>`;
        return;
    }

    transactions.forEach((transaction) => {
        const isIncome = transaction.type === "deposit" ||
            transaction.type === "transfer_in";
        let iconClass;
        let textClass;
        let sign;

        if (isIncome) {
            iconClass = "income";
            textClass = "income-text";
            sign = "+";
        } else if (transaction.type === "expense") {
            iconClass = "expense";
            textClass = "expense-text";
            sign = "-";
        } else if (transaction.type === "saving") {
            iconClass = "saving";
            textClass = "saving-text";
            sign = "-";
        } else {
            iconClass = "transfer";
            textClass = "expense-text";
            sign = "-";
        }
        const amount = Number(transaction.amount).toLocaleString();
        const dateStr = transaction.date
            ? formatDate(transaction.date)
            : "Today";

        recentTransactions.innerHTML += `
                <div class="transaction">
                    <div class="transaction-info">
                        <div class="transaction-icon ${iconClass}">${sign}</div>
                        <div>
                            <h3>${transaction.description}</h3>
                            <p>${dateStr}</p>
                        </div>
                    </div>
                    <strong class="${textClass}">
                        ${sign}₦${amount}
                    </strong>
                </div>`;
    });
}


/* =====================================================
   MOBILE MENU  (opens and closes the mobile sidebar)
   ===================================================== */

// Grab the mobile parts we need
const menuToggle = document.getElementById("menuToggle");
const mobileSidebar = document.getElementById("mobileSidebar");
const mobileOverlay = document.getElementById("mobileOverlay");
const themeToggleMobile = document.getElementById("themeToggleMobile");

// Show the mobile menu
function openMenu() {
    mobileSidebar.classList.add("open");
    menuToggle.classList.add("open");   // turns ☰ into ✕
    mobileOverlay.classList.add("show");
    menuToggle.setAttribute("aria-expanded", "true");
}

// Hide the mobile menu
function closeMenu() {
    mobileSidebar.classList.remove("open");
    menuToggle.classList.remove("open"); // turns ✕ back into ☰
    mobileOverlay.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
}

// Click the hamburger: open if closed, close if open
menuToggle.addEventListener("click", function () {
    if (mobileSidebar.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }
});

// Click the dark layer to close the menu
mobileOverlay.addEventListener("click", closeMenu);

// Clicking any menu link closes the menu
mobileSidebar.querySelectorAll(".nav-item").forEach(function (item) {
    item.addEventListener("click", closeMenu);
});

// The mobile button uses the exact same dark mode class as the desktop one
themeToggleMobile.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});

// If the screen becomes a desktop again, make sure the menu is closed
window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});


