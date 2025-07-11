// Calculator functionality
class PaymentCalculator {
    constructor() {
        this.form = document.getElementById('calculatorForm');
        this.resultsContent = document.getElementById('resultsContent');
        this.detailsCard = document.getElementById('detailsCard');
        this.paymentSchedule = document.getElementById('paymentSchedule');
        this.calculationExplanation = document.getElementById('calculationExplanation');
        
        this.init();
    }
    
    init() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        // Real-time calculations
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
            });
        });
        
        // Initial calculation
        this.calculate();
    }
    
    getFormData() {
        const formData = new FormData(this.form);
        return {
            totalAmount: parseFloat(formData.get('totalAmount')) || 0,
            installments: parseInt(formData.get('installments')) || 0,
            onTimeFee: parseFloat(formData.get('onTimeFee')) || 0,
            returnRate: parseFloat(formData.get('returnRate')) || 0,
            firstPaymentDate: formData.get('firstPaymentDate'),
            lumpSumDate: formData.get('lumpSumDate')
        };
    }
    
    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
    
    differenceInMonths(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
    
    calculatePaymentStrategy(data) {
        const { totalAmount, installments, onTimeFee, returnRate, firstPaymentDate, lumpSumDate } = data;
        
        // Validation
        if (!totalAmount || !installments || !firstPaymentDate || !lumpSumDate) {
            return null;
        }
        
        const firstDate = new Date(firstPaymentDate);
        const lumpDate = new Date(lumpSumDate);
        const installmentAmount = totalAmount / installments;
        
        // Generate payment schedule
        const paymentSchedule = [];
        for (let i = 0; i < installments; i++) {
            const paymentDate = this.addMonths(firstDate, i);
            const remainingBalance = totalAmount - (installmentAmount * (i + 1));
            paymentSchedule.push({
                paymentNumber: i + 1,
                date: this.formatDate(paymentDate),
                amount: installmentAmount,
                fee: i === 0 ? onTimeFee : 0, // One-time fee only on first payment
                remainingBalance: Math.max(0, remainingBalance)
            });
        }
        
        // Calculate installment strategy
        const totalFees = onTimeFee; // One-time fee for the entire installment plan
        
        // Calculate investment returns for remaining balance with monthly compounding
        let investmentReturns = 0;
        const monthlyReturnRate = returnRate / 100 / 12; // Monthly return rate
        const investmentBreakdown = [];
        
        for (let i = 0; i < installments - 1; i++) {
            const remainingBalance = totalAmount - (installmentAmount * (i + 1));
            if (remainingBalance > 0) {
                const monthlyReturn = remainingBalance * monthlyReturnRate;
                investmentReturns += monthlyReturn;
                investmentBreakdown.push({
                    month: i + 1,
                    balance: remainingBalance,
                    monthlyReturn: monthlyReturn,
                    cumulativeReturn: investmentReturns
                });
            }
        }
        
        const installmentNetCost = totalAmount + totalFees - investmentReturns;
        
        // Calculate lump sum strategy
        const monthsToLumpSum = this.differenceInMonths(lumpDate, firstDate);
        const opportunityCost = totalAmount * (returnRate / 100) * (monthsToLumpSum / 12);
        const lumpSumNetCost = totalAmount + opportunityCost;
        
        // Determine recommendation
        const savings = Math.abs(installmentNetCost - lumpSumNetCost);
        const recommendation = {
            strategy: lumpSumNetCost < installmentNetCost ? 'Lump Sum' : 'Installment',
            savings: savings
        };
        
        return {
            recommendation,
            installment: {
                totalAmount,
                totalFees,
                investmentReturns,
                netCost: installmentNetCost
            },
            lumpSum: {
                totalAmount,
                fees: 0,
                opportunityCost,
                netCost: lumpSumNetCost
            },
            paymentSchedule,
            investmentBreakdown
        };
    }
    
    calculate() {
        const data = this.getFormData();
        const results = this.calculatePaymentStrategy(data);
        
        if (results) {
            this.displayResults(results, data);
            this.detailsCard.style.display = 'block';
        } else {
            this.displayEmptyState();
            this.detailsCard.style.display = 'none';
        }
    }
    
    displayEmptyState() {
        this.resultsContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧮</div>
                <p>Enter your payment details to see the comparison</p>
            </div>
        `;
    }
    
    displayResults(results, data) {
        // Main results
        this.resultsContent.innerHTML = `
            <div class="recommendation">
                <div class="recommendation-content">
                    <div class="recommendation-left">
                        <div>👍</div>
                        <div>
                            <div class="recommendation-title">Recommended Strategy</div>
                            <div class="recommendation-subtitle">Based on your inputs</div>
                        </div>
                    </div>
                    <div class="recommendation-right">
                        <div class="recommendation-strategy">${results.recommendation.strategy}</div>
                        <div class="recommendation-savings">
                            Saves <span class="savings-amount">$${results.recommendation.savings.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="comparison-cards">
                <div class="comparison-card">
                    <div class="comparison-header">
                        <div class="comparison-title">💳 Installment Payment Plan</div>
                    </div>
                    <div class="comparison-content">
                        <div class="comparison-row">
                            <span class="comparison-label">Total Amount</span>
                            <span class="comparison-value">$${results.installment.totalAmount.toLocaleString()}</span>
                        </div>
                        <div class="comparison-row">
                            <span class="comparison-label">One-Time Fee</span>
                            <span class="comparison-value text-accent">$${results.installment.totalFees.toLocaleString()}</span>
                        </div>
                        <div class="comparison-row">
                            <span class="comparison-label">Investment Returns</span>
                            <span class="comparison-value text-secondary">$${results.installment.investmentReturns.toFixed(0)}</span>
                        </div>
                        <div class="comparison-row net-cost-row">
                            <span class="comparison-label font-semibold">Net Cost</span>
                            <span class="comparison-value net-cost-value">$${results.installment.netCost.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="comparison-card">
                    <div class="comparison-header">
                        <div class="comparison-title">💵 Lump Sum Payment</div>
                    </div>
                    <div class="comparison-content">
                        <div class="comparison-row">
                            <span class="comparison-label">Total Amount</span>
                            <span class="comparison-value">$${results.lumpSum.totalAmount.toLocaleString()}</span>
                        </div>
                        <div class="comparison-row">
                            <span class="comparison-label">One-Time Fee</span>
                            <span class="comparison-value text-secondary">$${results.lumpSum.fees}</span>
                        </div>
                        <div class="comparison-row">
                            <span class="comparison-label">Opportunity Cost</span>
                            <span class="comparison-value text-accent">$${results.lumpSum.opportunityCost.toFixed(0)}</span>
                        </div>
                        <div class="comparison-row net-cost-row">
                            <span class="comparison-label font-semibold">Net Cost</span>
                            <span class="comparison-value net-cost-value">$${results.lumpSum.netCost.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Payment schedule
        this.displayPaymentSchedule(results.paymentSchedule);
        
        // Calculation explanation
        this.displayCalculationExplanation(results, data);
    }
    
    displayPaymentSchedule(schedule) {
        this.paymentSchedule.innerHTML = schedule.map(payment => `
            <div class="payment-item">
                <div class="payment-info">
                    <span class="payment-number">Payment ${payment.paymentNumber}</span>
                    <span class="payment-date">${payment.date}</span>
                </div>
                <div class="payment-amount">
                    <div class="payment-value">$${payment.amount.toLocaleString()}</div>
                    ${payment.fee > 0 ? `<div class="payment-fee">+$${payment.fee} fee</div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    displayCalculationExplanation(results, data) {
        const investmentBreakdownHtml = results.investmentBreakdown.length > 0 ? `
            <div class="investment-breakdown">
                <div class="breakdown-title">Monthly Investment Returns (Compound Interest)</div>
                <div class="breakdown-items">
                    ${results.investmentBreakdown.map(item => `
                        <div class="breakdown-item">
                            <span class="font-medium">Month ${item.month}</span>
                            <div class="breakdown-calculation">
                                <div>$${item.balance.toLocaleString()} × ${(data.returnRate / 12).toFixed(2)}%</div>
                                <div class="breakdown-result">= $${item.monthlyReturn.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                    <div class="breakdown-item breakdown-total">
                        <span>Total Investment Returns</span>
                        <span>$${results.installment.investmentReturns.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        ` : '';
        
        this.calculationExplanation.innerHTML = `
            <div class="explanation-section installment-section">
                <div class="explanation-title text-primary">Installment Strategy</div>
                <ul class="explanation-list">
                    <li>• Total payments: $${results.installment.totalAmount.toLocaleString()}</li>
                    <li>• One-time fee: $${results.installment.totalFees.toLocaleString()}</li>
                    <li>• Investment returns: $${results.installment.investmentReturns.toFixed(0)}</li>
                    <li>• <strong>Net cost: $${results.installment.netCost.toFixed(0)}</strong></li>
                </ul>
                ${investmentBreakdownHtml}
            </div>
            
            <div class="explanation-section lumpsum-section">
                <div class="explanation-title text-secondary">Lump Sum Strategy</div>
                <ul class="explanation-list">
                    <li>• Total payment: $${results.lumpSum.totalAmount.toLocaleString()}</li>
                    <li>• One-time fee: $${results.lumpSum.fees}</li>
                    <li>• Opportunity cost: $${results.lumpSum.opportunityCost.toFixed(0)}</li>
                    <li>• <strong>Net cost: $${results.lumpSum.netCost.toFixed(0)}</strong></li>
                </ul>
            </div>
            
            <div class="explanation-section insight-section">
                <div class="insight-header">
                    <span>💡</span>
                    <span class="font-medium">Key Insight</span>
                </div>
                <p class="insight-text">
                    The ${results.recommendation.strategy.toLowerCase()} payment saves $${results.recommendation.savings.toFixed(0)} 
                    ${results.recommendation.strategy === 'Lump Sum' 
                        ? 'because the avoided fees exceed the opportunity cost of not investing the money.'
                        : 'because the investment returns on the remaining balance exceed the additional fees paid.'
                    }
                </p>
            </div>
        `;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentCalculator();
});