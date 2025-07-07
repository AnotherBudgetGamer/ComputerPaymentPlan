        // Track additional payments
        let additionalPayments = [];
        let currentTotalBalance = 500;
        let paymentsData = {}; // To store paid status and notes for each payment

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('additionalPayments', JSON.stringify(additionalPayments));
            localStorage.setItem('currentTotalBalance', currentTotalBalance);
            localStorage.setItem('paymentsData', JSON.stringify(paymentsData));
        }

        // Load data from localStorage
        function loadData() {
            const savedAdditionalPayments = localStorage.getItem('additionalPayments');
            const savedCurrentTotalBalance = localStorage.getItem('currentTotalBalance');
            const savedPaymentsData = localStorage.getItem('paymentsData');

            if (savedAdditionalPayments) {
                additionalPayments = JSON.parse(savedAdditionalPayments);
            }
            if (savedCurrentTotalBalance) {
                currentTotalBalance = parseFloat(savedCurrentTotalBalance);
            }
            if (savedPaymentsData) {
                paymentsData = JSON.parse(savedPaymentsData);
            }
        }
        
        // Generate payment schedule
        function generatePaymentSchedule() {
            const paymentsContainer = document.getElementById('paymentsContainer');
            const monthlyPayment = 20;
            
            // Clear existing payments
            paymentsContainer.innerHTML = '';
            
            // Starting from current month
            const currentDate = new Date();
            let paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);
            
            // If we're past the 10th of current month, start next month
            if (currentDate.getDate() > 10) {
                paymentDate.setMonth(paymentDate.getMonth() + 1);
            }
            
            let paymentNum = 1;
            let remainingBalance = currentTotalBalance;
            let firstUnpaidPaymentId = null;

            while (remainingBalance > 0) {
                const paymentAmount = Math.min(monthlyPayment, remainingBalance);
                remainingBalance -= paymentAmount;
                
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                const formattedDate = `${months[paymentDate.getMonth()]} 10, ${paymentDate.getFullYear()}`;
                
                const paymentId = `payment-${paymentNum}`;
                const isPaid = paymentsData[paymentId] ? paymentsData[paymentId].isPaid : false;
                const notes = paymentsData[paymentId] ? paymentsData[paymentId].notes : '';

                if (!isPaid && !firstUnpaidPaymentId) {
                    firstUnpaidPaymentId = paymentId;
                }

                const paymentDiv = document.createElement('div');
                paymentDiv.classList.add('payment-item');
                if (isPaid) {
                    paymentDiv.classList.add('paid');
                }
                paymentDiv.id = `payment-item-${paymentNum}`;

                paymentDiv.innerHTML = `
                    <div class="payment-header" onclick="togglePaymentDetails(${paymentNum})">
                        <span>Payment #${paymentNum}</span>
                        <span class="amount">Balance: ${remainingBalance.toFixed(2)}</span>
                    </div>
                    <div class="payment-details">
                        <p><strong>Due Date:</strong> ${formattedDate}</p>
                        <p><strong>Amount:</strong> ${paymentAmount.toFixed(2)}</p>
                        <p>
                            <strong>Paid:</strong> 
                            <input type="checkbox" class="paid-checkbox" id="${paymentId}" onchange="updateBalance(this, ${paymentNum})" ${isPaid ? 'checked' : ''}>
                        </p>
                        <p>
                            <strong>Notes:</strong> 
                            <input type="text" class="notes-input" id="notes-${paymentId}" placeholder="Add notes..." value="${notes}" onchange="updateNotes(this, ${paymentNum})">
                        </p>
                    </div>
                `;
                
                paymentsContainer.appendChild(paymentDiv);
                
                // Move to next month
                paymentDate.setMonth(paymentDate.getMonth() + 1);
                paymentNum++;
            }

            // Expand the first unpaid payment and scroll into view
            if (firstUnpaidPaymentId) {
                const firstUnpaidElement = document.getElementById(`payment-item-${firstUnpaidPaymentId.split('-')[1]}`);
                if (firstUnpaidElement) {
                    firstUnpaidElement.querySelector('.payment-details').style.display = 'block';
                    firstUnpaidElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
        
        function togglePaymentDetails(paymentNum) {
            const paymentItem = document.getElementById(`payment-item-${paymentNum}`);
            const details = paymentItem.querySelector('.payment-details');
            if (details.style.display === 'block') {
                details.style.display = 'none';
            } else {
                details.style.display = 'block';
            }
        }

        function updateBalance(checkbox, paymentNum) {
            const paymentItem = document.getElementById(`payment-item-${paymentNum}`);
            const paymentId = `payment-${paymentNum}`;
            
            if (!paymentsData[paymentId]) {
                paymentsData[paymentId] = { isPaid: false, notes: '' };
            }
            paymentsData[paymentId].isPaid = checkbox.checked;

            if (checkbox.checked) {
                paymentItem.classList.add('paid');
            } else {
                paymentItem.classList.remove('paid');
            }
            saveData();
        }

        function updateNotes(input, paymentNum) {
            const paymentId = `payment-${paymentNum}`;
            if (!paymentsData[paymentId]) {
                paymentsData[paymentId] = { isPaid: false, notes: '' };
            }
            paymentsData[paymentId].notes = input.value;
            saveData();
        }
        
        function addAdditionalPayment() {
            const amount = parseFloat(document.getElementById('additionalAmount').value);
            const date = document.getElementById('additionalDate').value;
            const note = document.getElementById('additionalNote').value;
            
            if (!amount || amount <= 0) {
                alert('Please enter a valid payment amount.');
                return;
            }
            
            if (amount > currentTotalBalance) {
                alert('Payment amount cannot exceed the current balance.');
                return;
            }
            
            if (!date) {
                alert('Please select a payment date.');
                return;
            }
            
            // Add to additional payments array
            const payment = {
                id: Date.now(),
                amount: amount,
                date: date,
                note: note || 'Additional payment'
            };
            
            additionalPayments.push(payment);
            
            // Update current balance
            currentTotalBalance -= amount;
            
            // Update display
            updateSummary();
            displayAdditionalPayments();
            regeneratePaymentSchedule();
            
            // Clear form
            document.getElementById('additionalAmount').value = '';
            document.getElementById('additionalDate').value = '';
            document.getElementById('additionalNote').value = '';
            saveData();
        }
        
        function removeAdditionalPayment(paymentId) {
            const paymentIndex = additionalPayments.findIndex(p => p.id === paymentId);
            if (paymentIndex !== -1) {
                const payment = additionalPayments[paymentIndex];
                currentTotalBalance += payment.amount;
                additionalPayments.splice(paymentIndex, 1);
                
                updateSummary();
                displayAdditionalPayments();
                regeneratePaymentSchedule();
                saveData();
            }
        }
        
        function updateSummary() {
            const additionalTotal = additionalPayments.reduce((sum, payment) => sum + payment.amount, 0);
            document.getElementById('additionalTotal').textContent = additionalTotal.toFixed(2);
            document.getElementById('currentBalance').textContent = currentTotalBalance.toFixed(2);
        }
        
        function displayAdditionalPayments() {
            const logDiv = document.getElementById('additionalPaymentsLog');
            const listBody = document.getElementById('additionalPaymentsList');
            
            if (additionalPayments.length === 0) {
                logDiv.style.display = 'none';
                return;
            }
            
            logDiv.style.display = 'block';
            listBody.innerHTML = '';
            
            additionalPayments.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td class="amount">${payment.amount.toFixed(2)}</td>
                    <td>${payment.note}</td>
                    <td><button class="remove-btn" onclick="removeAdditionalPayment(${payment.id})">Remove</button></td>
                `;
                listBody.appendChild(row);
            });
        }
        
        function regeneratePaymentSchedule() {
            generatePaymentSchedule();
        }
        
        // Initialize
        loadData();
        generatePaymentSchedule();
        updateSummary();
        displayAdditionalPayments();