 // Import Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
        import { getFirestore, collection, getDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
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


        const useremail = document.getElementById("useremail");
        const transactionsList = document.getElementById("transactionsList");
        const transactionCount = document.getElementById("transactionCount");


        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "login.html";
                return;
            }


            const userRef = doc(db, "users", user.uid);

            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                useremail.textContent = userDoc.data().userEmail;
            }


            loadAllTransactions(user.uid);
        });

       
        function formatDate(date) {

            const today = new Date();

            let transactionDate;
            
            if(date.toDate){
                transactionDate = date.toDate();
            }else{
                transactionDate = date;
            }
           

            const diffTime = today - transactionDate;
            
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return "Today";
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 7) {
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
               const dayNumber = transactionDate.getDay();
               const dayName = day[dayNumber];
            }
           return transactionDate.toLocaleDateString("en-NG", {
             month: "short", day: "numeric" });
            };
        

        // Load and display all transactions for the user
        async function loadAllTransactions(uid) {
            // Fetch all transactions from Firestore
            const snapshot = await getDocs(collection(db, "transactions"));
            const allTransactions = snapshot.docs.map(doc => doc.data());

            // Keep only the current user's transactions
            const userTransactions = allTransactions.filter(t => t.uid === uid);

            // Sort newest first
            userTransactions.sort((a, b) => {
                const dateA = a.date.toDate ? a.date.toDate() : a.date;
                const dateB = b.date.toDate ? b.date.toDate() : b.date;
                return dateB - dateA;
            });

        
            transactionCount.innerHTML = userTransactions.length + " transactions";

        
            transactionsList.innerHTML = `
                <div class="panel-heading">
                    <h2>Recent Transactions</h2>
                </div>`;

            if (userTransactions.length === 0) {
                transactionsList.innerHTML += `
                    <p style="padding: 20px; color: #98a2b3; text-align: center; font-size: 14px;">
                        No transactions yet. Start by adding money to your wallet!
                    </p>`;
                return;
            }

         
            userTransactions.forEach((transaction) => {
                const isIncome = transaction.type === "deposit" || transaction.type === "transfer_in";
                const isExpense = transaction.type === "expense";
                const isSaving = transaction.type === "saving";

                let iconClass;
                let sign;
                let  textClass;
                let  typeLabel;

                if (isIncome) {
                    iconClass = "income";
                    sign = "+";
                    textClass = "income-text";
                if(transaction.type === "deposit"){
                    typeLabel = "income";
                }else {
                     typeLabel = "iReceived";
                    
                } 
                }else if(isExpense)  {
                    iconClass = "expense";
                    sign = "-";
                    textClass = "expense-text";
                    typeLabel = "Expense";
                }
                else if (isSaving) {
                    iconClass = "saving";
                    sign = "-";
                    textClass = "saving-text";
                    typeLabel = "Savings";
                } else {
                    iconClass = "transfer";
                    sign = "-";
                    textClass = "expense-text";
                    typeLabel = "Transfer";
                }

                
                const amount = Number(transaction.amount).toLocaleString();


                let dateStr;
                if (transaction.date){
                    dateStr = formatDate(transaction.date);
                }else{
                    datestr = "Today";
                }
                
                transactionsList.innerHTML += `
                    <div class="transaction">
                        <div class="transaction-info">
                            <div class="transaction-icon ${iconClass}">${sign}</div>
                            <div>
                                <h3>${transaction.description}</h3>
                                <p>${dateStr} • ${typeLabel}</p>
                            </div>
                        </div>
                        <strong class="${textClass}">
                            ${sign}₦${amount}
                        </strong>
                    </div>`;
            });
        }