const state = { currentStep: 1, maxStep: 4 };

const form = document.getElementById('billForm');
const resultsSection = document.getElementById('resultsSection');
const errorBanner = document.getElementById('errorBanner');
const stepPills = [...document.querySelectorAll('.step-pill')];
const stepSections = [...document.querySelectorAll('.form-step')];
const modeInputs = [...document.querySelectorAll('input[name="mode"]')];
const paymentModeInputs = [...document.querySelectorAll('input[name="paymentMode"]')];

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function currency(value) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(Number(value || 0));
}

function createRow(templateId, container) {
    const template = document.getElementById(templateId);
    const fragment = template.content.cloneNode(true);
    const row = fragment.firstElementChild;
    row.querySelector('.remove-row').addEventListener('click', () => {
        if (container.children.length > 1) {
            row.remove();
            syncFriendDependentViews();
        }
    });
    container.appendChild(row);
    return row;
}

function addFriendRow(value = '') {
    const row = createRow('friendRowTemplate', document.getElementById('friendsContainer'));
    row.querySelector('.friend-name').value = value;
    row.querySelector('.friend-name').addEventListener('input', syncFriendDependentViews);
}

function addItemRow(item = {}) {
    const row = createRow('itemRowTemplate', document.getElementById('itemsContainer'));
    row.querySelector('.item-name').value = item.name || '';
    row.querySelector('.item-price').value = item.price || '';
    row.querySelector('.item-eaters').value = (item.eaters || []).join(',');
    row.querySelector('.item-eaters').addEventListener('input', syncFriendDependentViews);
}

function getMode() {
    return Number(document.querySelector('input[name="mode"]:checked').value);
}

function getPaymentMode() {
    return Number(document.querySelector('input[name="paymentMode"]:checked').value);
}

function getBaseFriends() {
    return [...document.querySelectorAll('.friend-name')]
        .map((input) => input.value.trim())
        .filter(Boolean);
}

function getItems() {
    return [...document.querySelectorAll('.item-row')].map((row) => ({
        name: row.querySelector('.item-name').value.trim(),
        price: Number(row.querySelector('.item-price').value),
        eatersRaw: row.querySelector('.item-eaters').value.trim()
    }));
}

function getAllFriendsWithLateJoiners() {
    const friends = getBaseFriends();
    const lateJoiners = [];
    getItems().forEach((item) => {
        item.eatersRaw
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
            .forEach((name) => {
                if (!friends.includes(name)) {
                    friends.push(name);
                    lateJoiners.push(name);
                }
            });
    });
    return { friends, lateJoiners };
}

function setStep(step) {
    state.currentStep = step;
    stepSections.forEach((section) => {
        section.classList.toggle('active', Number(section.dataset.step) === step);
    });
    stepPills.forEach((pill) => {
        pill.classList.toggle('active', Number(pill.dataset.stepTarget) === step);
    });
    document.getElementById('prevBtn').hidden = step === 1;
    document.getElementById('nextBtn').hidden = step === state.maxStep;
    document.getElementById('calculateBtn').hidden = step !== state.maxStep;
}

function showError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function clearError() {
    errorBanner.hidden = true;
    errorBanner.textContent = '';
}

function toggleModeSections() {
    const isItemMode = getMode() === 1;
    document.getElementById('itemsPanel').hidden = !isItemMode;
    document.getElementById('totalPanel').hidden = isItemMode;
}

function toggleFreePeopleSection() {
    document.getElementById('freePeopleSection').hidden = !document.getElementById('hasFreePeople').checked;
}

function togglePaymentModeSections() {
    const isSingle = getPaymentMode() === 1;
    document.getElementById('singlePayerSection').hidden = !isSingle;
    document.getElementById('multiPayersSection').hidden = isSingle;
}

function renderMultiPayerAmounts() {
    const container = document.getElementById('multiPayerAmountsContainer');
    const selected = [...document.querySelectorAll('.multi-payer-check:checked')].map((input) => input.value);
    container.innerHTML = selected.map((name) => `
        <label class="field">
            <span>${escapeHtml(name)} จ่ายจริง</span>
            <input type="number" min="0" step="0.01" class="multi-payer-amount" data-name="${escapeHtml(name)}" placeholder="0.00">
        </label>
    `).join('');
}

function syncFriendDependentViews() {
    const source = getMode() === 1 ? getAllFriendsWithLateJoiners().friends : getBaseFriends();

    document.getElementById('freePeopleContainer').innerHTML = source.map((name) => `
        <label class="checkbox-card">
            <input type="checkbox" value="${escapeHtml(name)}" class="free-person-input">
            <span>${escapeHtml(name)}</span>
        </label>
    `).join('');

    document.getElementById('singlePayer').innerHTML =
        `<option value="">เลือกชื่อ</option>${source.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}`;

    document.getElementById('multiPayersContainer').innerHTML = source.map((name) => `
        <label class="checkbox-card">
            <input type="checkbox" value="${escapeHtml(name)}" class="multi-payer-check">
            <span>${escapeHtml(name)}</span>
        </label>
    `).join('');

    [...document.querySelectorAll('.multi-payer-check')].forEach((checkbox) => {
        checkbox.addEventListener('change', renderMultiPayerAmounts);
    });
    renderMultiPayerAmounts();
}

function validateStep(step) {
    clearError();

    if (step === 2) {
        const friends = getBaseFriends();
        if (friends.length === 0) {
            showError('กรุณาใส่ชื่อเพื่อนอย่างน้อย 1 คน');
            return false;
        }
        if (new Set(friends).size !== friends.length) {
            showError('ชื่อเพื่อนห้ามซ้ำกัน');
            return false;
        }

        if (getMode() === 1) {
            const items = getItems();
            if (items.length === 0) {
                showError('กรุณาเพิ่มรายการอาหารอย่างน้อย 1 รายการ');
                return false;
            }
            for (const item of items) {
                if (!item.name || !(item.price >= 0) || !item.eatersRaw) {
                    showError('กรุณากรอกชื่อรายการ ราคา และคนกินให้ครบ');
                    return false;
                }
                const eaters = item.eatersRaw.split(',').map((name) => name.trim()).filter(Boolean);
                if (!eaters.length) {
                    showError(`รายการ ${item.name || 'ที่ยังไม่ตั้งชื่อ'} ต้องมีคนกินอย่างน้อย 1 คน`);
                    return false;
                }
            }
        } else {
            if (!(Number(document.getElementById('totalAmount').value) > 0)) {
                showError('กรุณาใส่ยอดรวมทั้งหมดให้มากกว่า 0');
                return false;
            }
        }
    }

    if (step === 4) {
        if (getPaymentMode() === 1) {
            if (!document.getElementById('singlePayer').value) {
                showError('กรุณาเลือกคนที่ออกเงินทั้งหมด');
                return false;
            }
        } else {
            const selected = [...document.querySelectorAll('.multi-payer-check:checked')];
            if (!selected.length) {
                showError('กรุณาเลือกอย่างน้อย 1 คนที่ช่วยกันออกเงิน');
                return false;
            }
            for (const input of document.querySelectorAll('.multi-payer-amount')) {
                if (!(Number(input.value) >= 0)) {
                    showError('กรุณาใส่จำนวนเงินจริงของทุกคนที่ช่วยกันออก');
                    return false;
                }
            }
        }
    }

    return true;
}

function buildPayload() {
    const mode = getMode();
    const paymentMode = getPaymentMode();
    const baseFriends = getBaseFriends();
    const allFriends = mode === 1 ? getAllFriendsWithLateJoiners() : { friends: baseFriends, lateJoiners: [] };
    const freePeople = document.getElementById('hasFreePeople').checked
        ? [...document.querySelectorAll('.free-person-input:checked')].map((input) => input.value)
        : [];

    const payload = {
        mode,
        friends: allFriends.friends,
        items: mode === 1 ? getItems().map((item) => ({
            name: item.name,
            price: Number(item.price),
            eaters: item.eatersRaw.split(',').map((name) => name.trim()).filter(Boolean)
        })) : [],
        totalAmount: mode === 2 ? Number(document.getElementById('totalAmount').value) : 0,
        serviceChargePercent: Number(document.getElementById('serviceCharge').value) || 0,
        vatPercent: Number(document.getElementById('vat').value) || 0,
        shippingFee: Number(document.getElementById('shippingFee').value) || 0,
        discount: Number(document.getElementById('discount').value) || 0,
        paymentMode,
        payerInfo: {},
        freePeople,
        lateJoiners: allFriends.lateJoiners
    };

    if (paymentMode === 1) {
        payload.payerInfo = { payer: document.getElementById('singlePayer').value };
    } else {
        payload.payerInfo = {
            payers: [...document.querySelectorAll('.multi-payer-amount')].map((input) => ({
                name: input.dataset.name,
                amount: Number(input.value) || 0
            }))
        };
    }

    return payload;
}

function renderSummaryTable(summary) {
    document.getElementById('summaryTable').innerHTML = `
        <table>
            <thead>
                <tr><th>ชื่อ</th><th>ฐานก่อนบวก</th><th>ต้องจ่าย</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
                ${summary.map((person) => `
                    <tr>
                        <td>${escapeHtml(person.name)}</td>
                        <td>${currency(person.baseAmount)}</td>
                        <td>${currency(person.totalToPay)}</td>
                        <td>${person.isFree ? '<span class="pill">ฟรี</span>' : person.note ? escapeHtml(person.note) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderCostBreakdown(result) {
    const rows = [
        ['Subtotal', result.subtotal],
        ['Service charge', result.serviceCharge],
        ['VAT', result.vat],
        ['Shipping fee', result.shippingFee],
        ['Discount', -Number(result.discount || 0)],
        ['Grand total', result.grandTotal]
    ];

    document.getElementById('costBreakdown').innerHTML = rows.map(([label, value]) => `
        <div class="metric">
            <span class="metric-label">${label}</span>
            <strong>${currency(value)}</strong>
        </div>
    `).join('');
}

function renderLateJoiners(lateJoiners) {
    const section = document.getElementById('lateJoinersSection');
    if (!lateJoiners || !lateJoiners.length) {
        section.hidden = true;
        return;
    }

    section.hidden = false;
    document.getElementById('lateJoinersTable').innerHTML = `
        <table>
            <thead><tr><th>ชื่อ</th><th>รายการที่กิน</th></tr></thead>
            <tbody>
                ${lateJoiners.map((person) => `
                    <tr>
                        <td>${escapeHtml(person.name)}</td>
                        <td>${escapeHtml((person.items || []).join(', ') || '-')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPaymentDetails(paymentDetails, paymentMode) {
    const section = document.getElementById('paymentDetailsSection');
    const container = document.getElementById('paymentDetails');

    if (!paymentDetails) {
        section.hidden = true;
        container.innerHTML = '';
        return;
    }

    section.hidden = false;

    if (paymentMode === 1) {
        container.innerHTML = `
            <div class="metric-list">
                <div class="metric"><span class="metric-label">คนที่ออกเงิน</span><strong>${escapeHtml(paymentDetails.payer)}</strong></div>
                <div class="metric"><span class="metric-label">ยอดที่ออกทั้งหมด</span><strong>${currency(paymentDetails.totalPaid)}</strong></div>
                <div class="metric"><span class="metric-label">ยอดสุทธิที่ควรรับภาระเอง</span><strong>${currency(paymentDetails.netAmount)}</strong></div>
            </div>
            <div class="payment-list">
                ${paymentDetails.breakdown.map((entry) => `
                    <div class="payment-item">
                        <span>${escapeHtml(entry.from)} → ${escapeHtml(entry.to)}</span>
                        <strong>${currency(entry.amount)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="payment-list">
            ${paymentDetails.breakdown.map((entry) => `
                <div class="payment-item ${entry.type}">
                    <span>${escapeHtml(entry.person)}</span>
                    <strong>${entry.type === 'pay' ? 'จ่ายเพิ่ม ' : entry.type === 'receive' ? 'ได้เงินคืน ' : 'พอดี '}${currency(entry.amount)}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

async function calculateBill(event) {
    event.preventDefault();
    if (!validateStep(4)) {
        return;
    }

    clearError();

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload())
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'ไม่สามารถคำนวณบิลได้');
        }

        renderSummaryTable(data.result.summary);
        renderCostBreakdown(data.result);
        renderLateJoiners(data.result.lateJoiners || []);
        renderPaymentDetails(data.paymentDetails, data.paymentMode);
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        showError(error.message);
    }
}

function resetForm() {
    form.reset();
    document.getElementById('friendsContainer').innerHTML = '';
    document.getElementById('itemsContainer').innerHTML = '';
    addFriendRow('');
    addFriendRow('');
    addItemRow();
    toggleModeSections();
    toggleFreePeopleSection();
    togglePaymentModeSections();
    syncFriendDependentViews();
    setStep(1);
    clearError();
    resultsSection.hidden = true;
}

document.getElementById('addFriendBtn').addEventListener('click', () => addFriendRow(''));
document.getElementById('addItemBtn').addEventListener('click', () => addItemRow());
document.getElementById('hasFreePeople').addEventListener('change', toggleFreePeopleSection);
document.getElementById('nextBtn').addEventListener('click', () => {
    if (validateStep(state.currentStep) && state.currentStep < state.maxStep) {
        syncFriendDependentViews();
        setStep(state.currentStep + 1);
    }
});
document.getElementById('prevBtn').addEventListener('click', () => {
    if (state.currentStep > 1) {
        setStep(state.currentStep - 1);
    }
});
document.getElementById('resetBtn').addEventListener('click', resetForm);
form.addEventListener('submit', calculateBill);

modeInputs.forEach((input) => {
    input.addEventListener('change', () => {
        toggleModeSections();
        syncFriendDependentViews();
    });
});

paymentModeInputs.forEach((input) => input.addEventListener('change', togglePaymentModeSections));
stepPills.forEach((pill) => {
    pill.addEventListener('click', () => {
        const target = Number(pill.dataset.stepTarget);
        if (target <= state.currentStep) {
            setStep(target);
            return;
        }

        let valid = true;
        for (let step = state.currentStep; step < target; step += 1) {
            if (!validateStep(step)) {
                valid = false;
                break;
            }
        }

        if (valid) {
            syncFriendDependentViews();
            setStep(target);
        }
    });
});

resetForm();
