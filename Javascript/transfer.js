// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, getDoc, doc, setDoc, updateDoc, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

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


const transferForm = document.getElementById("transferForm");
const accountNumber = document.getElementById("accountNumber");
const accountName = document.getElementById("accountName");
const transferAmount = document.getElementById("transferAmount");
const transferDescription = document.getElementById("transferDescription");
const sendMoneyBtn = document.getElementById("sendMoneyBtn");
const balanceNote = document.getElementById("balanceNote");


let recipientUid = null;
let currentUser = null;


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    showBalance(user.uid);
});


async function showBalance(uid) {
    const walletSnapshot = await getDoc(doc(db, "wallets", uid));

    if (walletSnapshot.exists()) {
        const balance = walletSnapshot.data().balance;
        balanceNote.textContent = "Your balance: " + formatNaira(balance);
    }
}

// Turn a number into money text, for example 2500 becomes "2,500.00"
function formatNaira(amount) {
    return "₦" + Number(amount).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// As soon as the account number is typed, look for that user and show the name
accountNumber.addEventListener("input", async () => {

    // Clear the old details while the user is still typing
    accountName.value = "";
    recipientUid = null;

    if (accountNumber.value.length !== 10) {
        return;
    }

    // Search the users collection for that account number
    const recipientQuery = query(
        collection(db, "users"),
        where("accountNumber", "==", accountNumber.value)
    );

    const recipientSnapshot = await getDocs(recipientQuery);

    if (recipientSnapshot.isEmpty) {
        accountName.value = "Account not found";
        return;
    }

    const recipientDoc = recipientSnapshot.docs[0];
    const recipientData = recipientDoc.data();

    // Save the uid so we know who to pay when the button is clicked
    recipientUid = recipientDoc.id;
    accountName.value = recipientData.userName;
});

// Send the money when the form is submitted
transferForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const amount = Number(transferAmount.value);
    const accNumber = accountNumber.value.trim();
    const description = transferDescription.value.trim();

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    if (!accNumber || amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid account number and amount.");
        return;
    }

    if (!recipientUid) {
        alert("Please enter a valid recipient account number.");
        return;
    }

    // You cannot send money to yourself
    if (recipientUid === currentUser.uid) {
        alert("You cannot send money to yourself.");
        return;
    }

    // Stop the button so the money is not sent twice
    sendMoneyBtn.disabled = true;
    sendMoneyBtn.textContent = "Sending...";

    try {
        // Get the wallet of the person sending the money
        const senderWalletRef = doc(db, "wallets", currentUser.uid);
        const senderWalletSnapshot = await getDoc(senderWalletRef);
        const senderBalance = senderWalletSnapshot.data().balance;

        if (amount > senderBalance) {
            alert("Insufficient balance.");
            return;
        }

        // Get the wallet of the person receiving the money
        const recipientWalletRef = doc(db, "wallets", recipientUid);
        const recipientWalletSnapshot = await getDoc(recipientWalletRef);
        const recipientBalance = recipientWalletSnapshot.exists()
            ? recipientWalletSnapshot.data().balance
            : 0;

        // Take the money from the sender
        await updateDoc(senderWalletRef, {
            balance: senderBalance - amount
        });

        // Give the money to the receiver. Create the wallet if it is missing
        if (recipientWalletSnapshot.exists()) {
            await updateDoc(recipientWalletRef, {
                balance: recipientBalance + amount
            });
        } else {
            await setDoc(recipientWalletRef, {
                uid: recipientUid,
                balance: recipientBalance + amount,
                createdAt: new Date()
            });
        }

        // Record the transfer on the sender's side
        await addDoc(collection(db, "transactions"), {
            uid: currentUser.uid,
            type: "transfer_out",
            amount: amount,
            accountNumber: accNumber,
            description: description || "Sent to account " + accNumber,
            date: new Date()
        });

        // Record the same transfer on the receiver's side
        await addDoc(collection(db, "transactions"), {
            uid: recipientUid,
            type: "transfer_in",
            amount: amount,
            accountNumber: accNumber,
            description: "Money received",
            date: new Date()
        });

        // Clear the form for the next transfer
        transferForm.reset();
        accountName.value = "";
        recipientUid = null;

        showBalance(currentUser.uid);

        alert("Successfully sent " + formatNaira(amount) + "!");
        window.location.href = "transactions.html";

    } catch (error) {
        console.log("Error sending money:", error.message);
        alert("Transfer failed: " + error.message);

    } finally {
        // Put the button back so the user can try again
        sendMoneyBtn.disabled = false;
        sendMoneyBtn.textContent = "Send Money";
    }
});
