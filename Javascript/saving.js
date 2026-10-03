// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, getDoc, doc, getDocs, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
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

// Get DOM elements
const useremail = document.getElementById("useremail");
const savingsGoalsList = document.getElementById("savingsGoalsList");
const totalSavingsSaved = document.getElementById("totalSavingsSaved");
const addSavingBtn = document.getElementById("addSavingBtn");
const goalModal = document.getElementById("goalModal");
const goalName = document.getElementById("goalName");
const goalTarget = document.getElementById("goalTarget");
const goalAmount = document.getElementById("goalAmount");
const cancelGoal = document.getElementById("cancelGoal");
const confirmGoal = document.getElementById("confirmGoal");

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }


    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        useremail.innerHTML = userDoc.data().userEmail;
    }


    loadSavingsGoals(user.uid);
});


addSavingBtn.addEventListener("click", () => {
    goalModal.style.display = "flex";
});


cancelGoal.addEventListener("click", () => {
    goalModal.style.display = "none";
});


confirmGoal.addEventListener("click", async () => {
    const name = goalName.value.trim();
    const target = Number(goalTarget.value);
    const amount = Number(goalAmount.value);

    if (!name) {
        alert("Please enter a goal name");
        return;
    }
    if (target <= 0 || isNaN(target)) {
        alert("Please enter a valid target amount");
        return;
    }
    if (amount < 0 || isNaN(amount)) {
        alert("Please enter a valid amount to add");
        return;
    }

    if (amount > 0) {
        // Check wallet balance
        const userUid = auth.currentUser.uid;
        const walletRef = doc(db, "wallets", userUid);
        const walletSnapshot = await getDoc(walletRef);

        if (!walletSnapshot.exists()) {
            alert("Wallet not found. Please add money first.");
            return;
        }

        const walletData = walletSnapshot.data();

        if (amount > walletData.balance) {
            alert("Insufficient balance");
            return;
        }


        await updateDoc(walletRef, { balance: walletData.balance - amount });

        await addDoc(collection(db, "transactions"), {
            uid: userUid,
            type: "saving",
            amount: amount,
            description: `Saved towards: ${name}`,
            date: new Date()
        });
    }


    await saveSavingsGoal(name, target, amount);


    goalName.value = "";
    goalTarget.value = "";
    goalAmount.value = "";
    goalModal.style.display = "none";


    const userUid = auth.currentUser.uid;
    const walletRef = doc(db, "wallets", userUid);
    const walletSnapshot = await getDoc(walletRef);
    if (walletSnapshot.exists()) {
        const balance = walletSnapshot.data().balance;

    }

    loadSavingsGoals(userUid);

    if (amount > 0) {
        alert(`Added ₦${amount.toLocaleString()}.00 to "${name}"!`);
    } else {
        alert(`Goal "${name}" created with target ₦${target.toLocaleString()}.00!`);
    }
});

// Save or update a savings goal
async function saveSavingsGoal(goalName, targetAmount, amount) {
    const userUid = auth.currentUser.uid;

    // Get all savings goals and find the matching one
    const snapshot = await getDocs(collection(db, "savingsGoals"));
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const existing = goals.find(g =>
        g.uid === userUid && g.goalName === goalName
    );

    if (existing) {
        // Update existing goal: add amount to savedAmount, update target if provided
        const newSaved = existing.savedAmount + amount;
        const updateData = { savedAmount: newSaved };
        if (targetAmount > 0) {
            updateData.targetAmount = targetAmount;
        }
        await updateDoc(doc(db, "savingsGoals", existing.id), updateData);
    } else {
        // Create new goal
        const newTarget = targetAmount > 0 ? targetAmount : 1;
        await addDoc(collection(db, "savingsGoals"), {
            uid: userUid,
            goalName: goalName,
            targetAmount: newTarget,
            savedAmount: amount,
            createdAt: new Date()
        });
    }
}

// Load and display all savings goals for the user
async function loadSavingsGoals(uid) {
    const snapshot = await getDocs(collection(db, "savingsGoals"));
    const allGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const userGoals = allGoals.filter(g => g.uid === uid);

    // Sort by most recently created
    userGoals.sort((a, b) => {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt;
        return dateB - dateA;
    });

    // Calculate grand total saved
    const grandTotal = userGoals.reduce(
        (sum, g) => sum + Number(g.savedAmount), 0
    );

    totalSavingsSaved.textContent = "₦" + grandTotal.toLocaleString() + " saved";

    // Keep the panel heading
    savingsGoalsList.innerHTML = `
                <div class="panel-heading">
                    <h2>Savings Goals</h2>
                </div>`;

    if (userGoals.length === 0) {
        savingsGoalsList.innerHTML +=
            `<p style="padding: 20px; color: #98a2b3; text-align: center; font-size: 14px;">
                        No savings goals yet. Click "+ Add New Goal" to get started!
                    </p>`;
        return;
    }

    // Render each goal
    userGoals.forEach(goal => {
        const progressPercent = Math.round(
            (goal.savedAmount / goal.targetAmount) * 100
        );
        const cappedPercent = Math.min(100, progressPercent);
        const remaining = goal.targetAmount - goal.savedAmount;
        const remainingText = remaining > 0
            ? "₦" + remaining.toLocaleString() + " left to save"
            : "Goal reached! 🎉";

        savingsGoalsList.innerHTML += `
                <div class="savings-goal-card">
                    <div class="savings-goal-header">
                        <h3>${goal.goalName}</h3>
                        <span class="savings-goal-badge ${cappedPercent >= 100 ? 'badge-complete' : ''}">
                            ${cappedPercent}%
                        </span>
                    </div>
                    <div class="savings-goal-amounts">
                        <span>₦${Number(goal.savedAmount).toLocaleString()} saved</span>
                        <span>₦${Number(goal.targetAmount).toLocaleString()} goal</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cappedPercent}%;"></div>
                    </div>
                    <p class="savings-goal-subtext">${remainingText}</p>
                </div>`;
    });
}