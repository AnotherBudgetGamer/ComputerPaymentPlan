        let currentTotalBalance = 500;
        
        // Add Payments To Show Being Made
        
        let paymentsData = {
            'payment-1': { isPaid: true, notes: 'Payment for work' },
            'payment-2': { isPaid: true, notes: '' },
            'payment-3': { isPaid: true, notes: 'Sent to Mom BoA' },
            'payment-4': { isPaid: true, notes: 'Sent to Mom BoA' },
            'payment-5': { isPaid: true, notes: 'Sent to Mom BoA'}
        };

        // Add Additional Payments
        let additionalPayments = [
            { id: 1, date: '2025-08-12', amount: 5, note: 'Additional $5 payment made on principle' }
        ];

        // Generate payment schedule (show only past payments and subtotal for active+future)
        function generatePaymentSchedule() {
            const paymentsContainer = document.getElementById('paymentsContainer');
            const monthlyPayment = 20;
            paymentsContainer.innerHTML = '';

            // Build full schedule
            const now = new Date();
            let paymentDate = new Date(now.getFullYear(), 6, 10); // July 10 of current year
            let paymentNum = 1;
            let remainingBalance = currentTotalBalance;
            const schedule = [];

            while (remainingBalance > 0) {
                const paymentAmount = Math.min(monthlyPayment, remainingBalance);
                const balanceAfter = remainingBalance - paymentAmount;
                const paymentId = `payment-${paymentNum}`;
                const isPaid = paymentsData[paymentId] ? paymentsData[paymentId].isPaid : false;
                const notes = paymentsData[paymentId] ? paymentsData[paymentId].notes : '';

                schedule.push({
                    paymentNum,
                    date: new Date(paymentDate.getTime()),
                    amount: paymentAmount,
                    balanceAfter,
                    paymentId,
                    isPaid,
                    notes
                });

                // Next month
                paymentDate.setMonth(paymentDate.getMonth() + 1);
                remainingBalance = balanceAfter;
                paymentNum += 1;
            }

            // Determine active month = first payment with date >= today
            const activeIndex = schedule.findIndex(p => p.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
            const pastPayments = activeIndex === -1 ? schedule : schedule.slice(0, activeIndex);
            const currentPayment = activeIndex === -1 ? null : schedule[activeIndex];
            const upcomingPaymentsRest = activeIndex === -1 ? [] : schedule.slice(activeIndex + 1);

            // Render past payments
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            pastPayments.forEach(p => {
                const formattedDate = `${months[p.date.getMonth()]} 10, ${p.date.getFullYear()}`;
                const paymentDiv = document.createElement('div');
                paymentDiv.classList.add('payment-item');
                if (p.isPaid) paymentDiv.classList.add('paid');
                paymentDiv.id = `payment-item-${p.paymentNum}`;
                paymentDiv.innerHTML = `
                    <div class="payment-header" onclick="togglePaymentDetails(${p.paymentNum})">
                        <span>Payment #${p.paymentNum}</span>
                        <span class="amount">Balance: ${p.balanceAfter.toFixed(2)}</span>
                    </div>
                    <div class="payment-details">
                        <p><strong>Due Date:</strong> ${formattedDate}</p>
                        <p><strong>Amount:</strong> ${p.amount.toFixed(2)}</p>
                        <p>
                            <strong>Paid:</strong>
                            <input type="checkbox" class="paid-checkbox" id="${p.paymentId}" onchange="updateBalance(this, ${p.paymentNum})" ${p.isPaid ? 'checked' : ''}>
                        </p>
                        <p>
                            <strong>Notes:</strong>
                            <input type="text" class="notes-input" id="notes-${p.paymentId}" placeholder="Add notes..." value="${p.notes}" onchange="updateNotes(this, ${p.paymentNum})">
                        </p>
                    </div>
                `;
                paymentsContainer.appendChild(paymentDiv);
            });

            // Render Additional Payments section (between past and current)
            renderAdditionalPaymentsSection(paymentsContainer);

            // Render current payment (single)
            if (currentPayment) {
                const formattedDate = `${months[currentPayment.date.getMonth()]} 10, ${currentPayment.date.getFullYear()}`;
                const cp = currentPayment;
                const paymentDiv = document.createElement('div');
                paymentDiv.classList.add('payment-item');
                if (cp.isPaid) paymentDiv.classList.add('paid');
                paymentDiv.id = `payment-item-${cp.paymentNum}`;
                paymentDiv.innerHTML = `
                    <div class="payment-header" onclick="togglePaymentDetails(${cp.paymentNum})">
                        <span>Current Payment #${cp.paymentNum}</span>
                        <span class="amount">Balance: ${cp.balanceAfter.toFixed(2)}</span>
                    </div>
                    <div class="payment-details">
                        <p><strong>Due Date:</strong> ${formattedDate}</p>
                        <p><strong>Amount:</strong> ${cp.amount.toFixed(2)}</p>
                        <p>
                            <strong>Paid:</strong>
                            <input type="checkbox" class="paid-checkbox" id="${cp.paymentId}" onchange="updateBalance(this, ${cp.paymentNum})" ${cp.isPaid ? 'checked' : ''}>
                        </p>
                        <p>
                            <strong>Notes:</strong>
                            <input type="text" class="notes-input" id="notes-${cp.paymentId}" placeholder="Add notes..." value="${cp.notes}" onchange="updateNotes(this, ${cp.paymentNum})">
                        </p>
                    </div>
                `;
                paymentsContainer.appendChild(paymentDiv);
            }

            // Render subtotal for upcoming (including current if present), subtracting additional payments
            const upcomingAll = currentPayment ? [currentPayment, ...upcomingPaymentsRest] : upcomingPaymentsRest;
            const upcomingRawTotal = upcomingAll.reduce((sum, p) => sum + p.amount, 0);
            const additionalTotal = additionalPayments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
            const subtotalAmount = Math.max(0, upcomingRawTotal - additionalTotal);
            const nextDue = currentPayment ? currentPayment.date : upcomingPaymentsRest[0]?.date;
            if (upcomingAll.length > 0) {
                const subtotalDiv = document.createElement('div');
                subtotalDiv.classList.add('subtotal');
                const nextDueText = `${months[nextDue.getMonth()]} 10, ${nextDue.getFullYear()}`;
                subtotalDiv.innerHTML = `
                    <div class="subtotal-row">
                        <span><strong>Upcoming payments subtotal</strong> (${upcomingAll.length} payments, next due ${nextDueText})</span>
                        <span class="amount" id="upcomingSubtotalAmount">${subtotalAmount.toFixed(2)}</span>
                    </div>`;
                paymentsContainer.appendChild(subtotalDiv);
            }

            // Update the summary current balance to match subtotal
            const currentBalanceElem = document.getElementById('currentBalance');
            if (currentBalanceElem) {
                currentBalanceElem.textContent = subtotalAmount.toFixed(2);
            }
        }

        function renderAdditionalPaymentsSection(container) {
            const section = document.createElement('div');
            section.classList.add('additional-section');
            section.innerHTML = `<h3>Additional payments</h3>`;

            const list = document.createElement('div');
            list.classList.add('additional-list');

            additionalPayments.forEach((entry) => {
                const row = document.createElement('div');
                row.classList.add('additional-row');
                const date = new Date(entry.date);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dateText = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                row.innerHTML = `
                    <div class="additional-date">${dateText}</div>
                    <div class="additional-amount"><strong>Subtract:</strong> $${Number(entry.amount).toFixed(2)}</div>
                    <div class="additional-note"><strong>Note:</strong> ${entry.note || ''}</div>
                `;
                list.appendChild(row);
            });

            section.appendChild(list);
            container.appendChild(section);
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
            // No persistence on static page
        }

        function updateNotes(input, paymentNum) {
            const paymentId = `payment-${paymentNum}`;
            if (!paymentsData[paymentId]) {
                paymentsData[paymentId] = { isPaid: false, notes: '' };
            }
            paymentsData[paymentId].notes = input.value;
            // No persistence on static page
        }
        
        // Initialize (static)
        (function init() {
            generatePaymentSchedule();
        })();