const state = {
    currentStep: 1,
    maxStep: 4,
    stepErrors: new Set()
};

const stepLabels = {
    1: 'เลือกรูปแบบ',
    2: 'คนและรายการ',
    3: 'ค่าบริการ',
    4: 'วิธีจ่าย'
};

const form = document.getElementById('billForm');
const resultsSection = document.getElementById('resultsSection');
const errorBanner = document.getElementById('errorBanner');
const stepNodes = [...document.querySelectorAll('.step-node')];
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

function formatNumber(value) {
    return new Intl.NumberFormat('th-TH').format(Number(value || 0));
}

function createRow(templateId, container) {
    const template = document.getElementById(templateId);
    const fragment = template.content.cloneNode(true);
    const row = fragment.firstElementChild;
    row.querySelector('.remove-row').addEventListener('click', () => {
        row.remove();
        refreshDependentViews();
    });
    container.appendChild(row);
    return row;
}

function addFriendRow(value = '') {
    const row = createRow('friendRowTemplate', document.getElementById('friendsContainer'));
    const input = row.querySelector('.friend-name');
    input.value = value;
    input.addEventListener('input', refreshDependentViews);
}

function addItemRow(item = {}) {
    const row = createRow('itemRowTemplate', document.getElementById('itemsContainer'));
    const nameInput = row.querySelector('.item-name');
    const priceInput = row.querySelector('.item-price');
    const eatersInput = row.querySelector('.item-eaters');
    const addLateJoinerButton = row.querySelector('.add-late-joiner');

    nameInput.value = item.name || '';
    priceInput.value = item.price || '';
    eatersInput.value = (item.eaters || []).join(',');

    nameInput.addEventListener('input', refreshStepStateOnly);
    priceInput.addEventListener('input', refreshStepStateOnly);
    eatersInput.addEventListener('input', refreshDependentViews);
    addLateJoinerButton.addEventListener('click', () => openLateJoinerModal(eatersInput));

    renderItemFriendChips(row);
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
        row,
        nameInput: row.querySelector('.item-name'),
        priceInput: row.querySelector('.item-price'),
        eatersInput: row.querySelector('.item-eaters'),
        name: row.querySelector('.item-name').value.trim(),
        price: Number(row.querySelector('.item-price').value),
        eatersRaw: row.querySelector('.item-eaters').value.trim()
    }));
}

function getAllFriendsWithLateJoiners() {
    const friends = [...getBaseFriends()];
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

function parseNames(rawValue) {
    return rawValue
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
}

function appendNameToEatersInput(input, name) {
    if (!name) {
        return;
    }
    const currentNames = parseNames(input.value);
    if (!currentNames.includes(name)) {
        currentNames.push(name);
    }
    input.value = currentNames.join(',');
}

function toggleNameInEatersInput(input, name) {
    const currentNames = parseNames(input.value);
    const nextNames = currentNames.includes(name)
        ? currentNames.filter((currentName) => currentName !== name)
        : [...currentNames, name];
    input.value = nextNames.join(',');
}

function clearValidation() {
    errorBanner.hidden = true;
    errorBanner.textContent = '';

    document.querySelectorAll('.field-error').forEach((node) => node.remove());
    document.querySelectorAll('.has-error').forEach((node) => node.classList.remove('has-error'));
}

function setFieldError(target, message) {
    const field = target.closest('.field') || target.closest('.entry-card') || target;
    field.classList.add('has-error');

    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    field.appendChild(error);
}

function scrollToFirstError() {
    const target = document.querySelector('.has-error input, .has-error select, .has-error');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        }
    }
}

function showError(message, step) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
    if (step) {
        state.stepErrors.add(step);
        updateStepState();
    }
}

function getStepCompletion(step) {
    if (step === 1) {
        return true;
    }

    if (step === 2) {
        const friends = getBaseFriends();
        if (!friends.length) {
            return false;
        }

        if (getMode() === 1) {
            const items = getItems().filter((item) => item.name || item.priceInput.value || item.eatersRaw);
            return items.length > 0 && items.every((item) => item.name && item.priceInput.value && item.eatersRaw);
        }

        return Number(document.getElementById('totalAmount').value) > 0;
    }

    if (step === 3) {
        return true;
    }

    if (step === 4) {
        if (getPaymentMode() === 1) {
            return Boolean(document.getElementById('singlePayer').value);
        }

        const selected = [...document.querySelectorAll('.multi-payer-check:checked')];
        return selected.length > 0 && [...document.querySelectorAll('.multi-payer-amount')].every((input) => input.value !== '');
    }

    return false;
}

function updateStepState() {
    document.getElementById('currentStepLabel').textContent = stepLabels[state.currentStep];
    document.getElementById('currentStepCount').textContent = `${state.currentStep} / ${state.maxStep}`;

    stepNodes.forEach((node) => {
        const step = Number(node.dataset.stepTarget);
        node.classList.remove('is-current', 'is-complete', 'is-locked', 'is-error');

        if (step === state.currentStep) {
            node.classList.add(state.stepErrors.has(step) ? 'is-error' : 'is-current');
            return;
        }

        if (step < state.currentStep && getStepCompletion(step)) {
            node.classList.add('is-complete');
            return;
        }

        if (state.stepErrors.has(step)) {
            node.classList.add('is-error');
            return;
        }

        node.classList.add('is-locked');
    });
}

function renderStep4Summary() {
    const mode = getMode();
    const container = document.getElementById('step4Summary');
    if (!container) return;

    if (mode === 2) {
        const total = Number(document.getElementById('totalAmount').value) || 0;
        const friends = getBaseFriends();
        container.innerHTML = `
            <div class="step4-summary-row">
                <span>ยอดรวม</span><strong>${currency(total)}</strong>
            </div>
            <div class="step4-summary-row">
                <span>จำนวนคน</span><strong>${friends.length} คน</strong>
            </div>
        `;
        return;
    }

    const items = getItems().filter(i => i.name && i.priceInput.value);
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    container.innerHTML = `
        <div class="step4-summary-row">
            <span>ยอดอาหาร</span><strong>${currency(subtotal)}</strong>
        </div>
        ${items.map(i => `
            <div class="step4-summary-row secondary">
                <span>${escapeHtml(i.name)}</span><strong>${currency(i.price)}</strong>
            </div>
        `).join('')}
    `;
}

function setStep(step) {
    state.currentStep = step;
    stepSections.forEach((section) => {
        section.classList.toggle('active', Number(section.dataset.step) === step);
    });
    document.getElementById('prevBtn').hidden = step === 1;
    document.getElementById('nextBtn').hidden = step === state.maxStep;
    document.getElementById('calculateBtn').hidden = step !== state.maxStep;
    if (step === 4) renderStep4Summary();
    updateStepState();
}

function updateParticipantsPreview() {
    const friends = getBaseFriends();
    const items = getItems().filter((item) => item.name || item.priceInput.value || item.eatersRaw);
    const lateJoiners = getMode() === 1 ? getAllFriendsWithLateJoiners().lateJoiners : [];

    document.getElementById('friendCountPreview').textContent = `เพื่อน ${formatNumber(friends.length)} คน`;
    document.getElementById('itemCountPreview').textContent =
        getMode() === 1 ? `รายการ ${formatNumber(items.length)} รายการ` : 'ไม่ใช้ในโหมดนี้';

    const latePreview = document.getElementById('lateJoinerPreview');
    if (getMode() !== 1) {
        latePreview.textContent = 'ไม่ใช้ในโหมดนี้';
        latePreview.classList.remove('has-late');
    } else if (lateJoiners.length > 0) {
        latePreview.textContent = `คนมาทีหลัง ${formatNumber(lateJoiners.length)} คน`;
        latePreview.classList.add('has-late');
    } else {
        latePreview.textContent = 'คนมาทีหลัง 0 คน';
        latePreview.classList.remove('has-late');
    }

    const status = document.getElementById('participantsStatus');
    status.innerHTML = getStepCompletion(2)
        ? '<span class="status-chip complete">ข้อมูลพร้อมแล้ว</span>'
        : '<span class="status-chip neutral">ยังกรอกไม่ครบ</span>';

    renderEmptyStates();
}

function updatePaymentPreview() {
    const badge = document.getElementById('paymentPreviewBadge');
    const note = document.getElementById('paymentModeNote');

    if (getPaymentMode() === 1) {
        badge.innerHTML = '<span class="status-chip">คนเดียวออกก่อน</span>';
        note.textContent = 'ผลลัพธ์จะสรุปให้ว่าแต่ละคนต้องโอนคืนให้คนที่ออกเงินเท่าไร';
    } else {
        badge.innerHTML = '<span class="status-chip soft">หลายคนช่วยกันจ่าย</span>';
        note.textContent = 'ผลลัพธ์จะสรุปว่าใครต้องจ่ายเพิ่ม ใครได้เงินคืน และใครจ่ายพอดี';
    }
}

function toggleModeSections() {
    const isItemMode = getMode() === 1;
    document.getElementById('itemsPanel').hidden = !isItemMode;
    document.getElementById('totalPanel').hidden = isItemMode;
    const itemsContainer = document.getElementById('itemsContainer');
    if (isItemMode && itemsContainer.children.length === 0) {
        addItemRow();
    }
}

function toggleFreePeopleSection() {
    document.getElementById('freePeopleSection').hidden = !document.getElementById('hasFreePeople').checked;
}

function togglePaymentModeSections() {
    const isSingle = getPaymentMode() === 1;
    document.getElementById('singlePayerSection').hidden = !isSingle;
    document.getElementById('multiPayersSection').hidden = isSingle;
    updatePaymentPreview();
}

function renderMultiPayerAmounts(previousAmounts = {}) {
    const container = document.getElementById('multiPayerAmountsContainer');
    const selected = [...document.querySelectorAll('.multi-payer-check:checked')].map((input) => input.value);

    container.innerHTML = selected.map((name) => `
        <label class="field">
            <span>${escapeHtml(name)} จ่ายจริง</span>
            <input
                type="number"
                min="0"
                step="0.01"
                class="multi-payer-amount"
                data-name="${escapeHtml(name)}"
                placeholder="0.00"
                value="${previousAmounts[name] ?? ''}"
            >
        </label>
    `).join('');

    [...document.querySelectorAll('.multi-payer-amount')].forEach((input) => {
        input.addEventListener('input', refreshStepStateOnly);
    });
}

function syncFriendDependentViews() {
    const previousFree = new Set(
        [...document.querySelectorAll('.free-person-input:checked')].map((input) => input.value)
    );
    const previousPayer = document.getElementById('singlePayer').value;
    const previousMulti = new Set(
        [...document.querySelectorAll('.multi-payer-check:checked')].map((input) => input.value)
    );
    const previousAmounts = Object.fromEntries(
        [...document.querySelectorAll('.multi-payer-amount')].map((input) => [input.dataset.name, input.value])
    );

    const source = getMode() === 1 ? getAllFriendsWithLateJoiners().friends : getBaseFriends();

    document.getElementById('freePeopleContainer').innerHTML = source.map((name) => `
        <label class="checkbox-card">
            <input type="checkbox" value="${escapeHtml(name)}" class="free-person-input" ${previousFree.has(name) ? 'checked' : ''}>
            <span>${escapeHtml(name)}</span>
        </label>
    `).join('');

    document.getElementById('singlePayer').innerHTML = `
        <option value="">เลือกชื่อ</option>
        ${source.map((name) => `<option value="${escapeHtml(name)}" ${previousPayer === name ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}
    `;

    document.getElementById('multiPayersContainer').innerHTML = source.map((name) => `
        <label class="checkbox-card">
            <input type="checkbox" value="${escapeHtml(name)}" class="multi-payer-check" ${previousMulti.has(name) ? 'checked' : ''}>
            <span>${escapeHtml(name)}</span>
        </label>
    `).join('');

    [...document.querySelectorAll('.multi-payer-check')].forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            const currentAmounts = Object.fromEntries(
                [...document.querySelectorAll('.multi-payer-amount')].map((input) => [input.dataset.name, input.value])
            );
            renderMultiPayerAmounts(currentAmounts);
            refreshStepStateOnly();
        });
    });

    renderMultiPayerAmounts(previousAmounts);
}

function renderItemFriendChips(targetRow = null) {
    const friendNames = getBaseFriends();
    const rows = targetRow ? [targetRow] : [...document.querySelectorAll('.item-row')];

    rows.forEach((row) => {
        const chipList = row.querySelector('.eater-chip-list');
        const eatersInput = row.querySelector('.item-eaters');
        const currentEaters = new Set(parseNames(eatersInput.value));

        chipList.innerHTML = friendNames.length
            ? friendNames.map((name) => `
                <button class="eater-chip ${currentEaters.has(name) ? 'is-active' : ''}" type="button" data-name="${escapeHtml(name)}">
                    ${escapeHtml(name)}
                </button>
            `).join('')
            : '<span class="field-hint">เพิ่มชื่อเพื่อนก่อน แล้วกดเลือกคนกินได้เลย</span>';

        [...chipList.querySelectorAll('.eater-chip')].forEach((button) => {
            button.addEventListener('click', () => {
                toggleNameInEatersInput(eatersInput, button.dataset.name);
                refreshDependentViews();
                eatersInput.focus();
            });
        });
    });
}

function refreshDependentViews() {
    toggleModeSections();
    toggleFreePeopleSection();
    togglePaymentModeSections();
    syncFriendDependentViews();
    renderItemFriendChips();
    updateParticipantsPreview();
    updateStepState();
}

function renderEmptyStates() {
    const itemsContainer = document.getElementById('itemsContainer');
    if (getMode() === 1) {
        let itemEmpty = itemsContainer.querySelector('.empty-state');
        if (itemsContainer.children.length === 0) {
            if (!itemEmpty) {
                itemEmpty = document.createElement('p');
                itemEmpty.className = 'empty-state';
                itemEmpty.textContent = 'ยังไม่มีรายการ กด "+ เพิ่มรายการ" เพื่อเริ่ม';
                itemsContainer.appendChild(itemEmpty);
            }
        } else if (itemEmpty) {
            itemEmpty.remove();
        }
    }
}

function refreshStepStateOnly() {
    updateParticipantsPreview();
    updateStepState();
}

function validateStep(step) {
    clearValidation();
    state.stepErrors.delete(step);

    if (step === 1) {
        updateStepState();
        return true;
    }

    if (step === 2) {
        const friends = [...document.querySelectorAll('.friend-name')];
        const names = friends.map((input) => input.value.trim()).filter(Boolean);

        if (!names.length) {
            showError('กรุณาใส่ชื่อเพื่อนอย่างน้อย 1 คน', step);
            if (friends[0]) {
                setFieldError(friends[0], 'ใส่ชื่อเพื่อนอย่างน้อย 1 คน');
            }
            scrollToFirstError();
            return false;
        }

        const seen = new Set();
        let hasDuplicate = false;
        friends.forEach((input) => {
            const value = input.value.trim();
            if (!value) {
                return;
            }
            if (seen.has(value)) {
                hasDuplicate = true;
                setFieldError(input, 'ชื่อซ้ำกับคนอื่น');
            }
            seen.add(value);
        });

        if (hasDuplicate || document.querySelector('.field.has-error')) {
            showError('กรุณาตรวจสอบรายชื่อเพื่อนให้ครบและไม่ซ้ำกัน', step);
            scrollToFirstError();
            return false;
        }

        if (getMode() === 1) {
            const items = getItems();
            const filledItems = items.filter((item) => item.name || item.priceInput.value || item.eatersRaw);

            if (!filledItems.length) {
                showError('กรุณาเพิ่มรายการอาหารอย่างน้อย 1 รายการ', step);
                setFieldError(items[0].nameInput, 'ใส่ชื่อรายการอย่างน้อย 1 รายการ');
                scrollToFirstError();
                return false;
            }

            let itemError = false;
            filledItems.forEach((item) => {
                if (!item.name) {
                    itemError = true;
                    setFieldError(item.nameInput, 'กรุณาใส่ชื่อรายการ');
                }
                if (item.priceInput.value === '' || Number(item.price) < 0) {
                    itemError = true;
                    setFieldError(item.priceInput, 'ราคาต้องเป็น 0 หรือมากกว่า');
                }
                if (!item.eatersRaw) {
                    itemError = true;
                    setFieldError(item.eatersInput, 'กรุณาใส่ชื่อคนกิน');
                } else if (!parseNames(item.eatersRaw).length) {
                    itemError = true;
                    setFieldError(item.eatersInput, 'กรุณาใส่ชื่อคนกินอย่างน้อย 1 คน');
                }
            });

            if (itemError) {
                showError('กรุณากรอกข้อมูลรายการอาหารให้ครบ', step);
                scrollToFirstError();
                return false;
            }
        } else {
            const totalAmount = document.getElementById('totalAmount');
            if (!(Number(totalAmount.value) > 0)) {
                setFieldError(totalAmount, 'ยอดรวมต้องมากกว่า 0');
                showError('กรุณาใส่ยอดรวมทั้งหมดให้มากกว่า 0', step);
                scrollToFirstError();
                return false;
            }
        }
    }

    if (step === 4) {
        if (getPaymentMode() === 1) {
            const singlePayer = document.getElementById('singlePayer');
            if (!singlePayer.value) {
                setFieldError(singlePayer, 'กรุณาเลือกคนที่ออกเงินก่อน');
                showError('กรุณาเลือกคนที่ออกเงินทั้งหมด', step);
                scrollToFirstError();
                return false;
            }
        } else {
            const selected = [...document.querySelectorAll('.multi-payer-check:checked')];
            if (!selected.length) {
                showError('กรุณาเลือกอย่างน้อย 1 คนที่ช่วยกันออกเงิน', step);
                const firstCheckbox = document.querySelector('.multi-payer-check');
                if (firstCheckbox) {
                    setFieldError(firstCheckbox, 'เลือกคนที่จ่ายเงินจริงอย่างน้อย 1 คน');
                }
                scrollToFirstError();
                return false;
            }

            let hasAmountError = false;
            [...document.querySelectorAll('.multi-payer-amount')].forEach((input) => {
                if (input.value === '' || Number(input.value) < 0) {
                    hasAmountError = true;
                    setFieldError(input, 'กรุณาใส่จำนวนเงินที่จ่ายจริง');
                }
            });

            if (hasAmountError) {
                showError('กรุณาใส่จำนวนเงินของทุกคนที่ช่วยกันจ่าย', step);
                scrollToFirstError();
                return false;
            }
        }
    }

    updateStepState();
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

function modeLabel(mode) {
    return mode === 1 ? 'หารตามรายการ' : 'หารเท่ากัน';
}

function paymentLabel(paymentMode) {
    return paymentMode === 1 ? 'คนเดียวออกก่อน' : 'หลายคนช่วยกันจ่าย';
}

function personBadges(person) {
    const badges = [];
    if (person.isFree) {
        badges.push('<span class="pill free">ฟรี</span>');
    }
    if ((person.note || '').includes('มาทีหลัง')) {
        badges.push('<span class="pill late">มาทีหลัง</span>');
    }
    return badges.join(' ');
}

function renderResultSummaryStrip(result, payload) {
    document.getElementById('resultSummaryStrip').innerHTML = `
        <div class="summary-pill">
            <span>ยอดรวมทั้งหมด</span>
            <strong>${currency(result.grandTotal)}</strong>
        </div>
        <div class="summary-pill">
            <span>รูปแบบการหาร</span>
            <strong>${modeLabel(payload.mode)}</strong>
        </div>
        <div class="summary-pill">
            <span>วิธีจ่าย</span>
            <strong>${paymentLabel(payload.paymentMode)}</strong>
        </div>
        <div class="summary-pill">
            <span>จำนวนคนในบิล</span>
            <strong>${formatNumber(result.summary.length)} คน</strong>
        </div>
    `;
}

function renderSummaryTable(summary) {
    const sorted = [...summary].sort((a, b) => Number(b.totalToPay) - Number(a.totalToPay));

    document.getElementById('summaryCards').innerHTML = sorted.map((person) => `
        <article class="summary-card">
            <div class="summary-card-main">
                <small>${escapeHtml(person.name)}</small>
                <strong>${currency(person.totalToPay)}</strong>
                ${personBadges(person)}
            </div>
            <div class="summary-card-side">
                <small>ยอดตั้งต้น</small>
                <strong>${currency(person.baseAmount)}</strong>
            </div>
        </article>
    `).join('');

    document.getElementById('summaryTable').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ชื่อ</th>
                    <th>ยอดตั้งต้น</th>
                    <th>ต้องจ่าย</th>
                    <th>สถานะ</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((person) => `
                    <tr>
                        <td>${escapeHtml(person.name)}</td>
                        <td>${currency(person.baseAmount)}</td>
                        <td>${currency(person.totalToPay)}</td>
                        <td>${personBadges(person) || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderCostBreakdown(result) {
    const rows = [
        ['ยอดอาหาร', result.subtotal],
        ['ค่าบริการ', result.serviceCharge],
        ['ภาษีมูลค่าเพิ่ม (VAT)', result.vat],
        ['ค่าส่ง', result.shippingFee],
        ['ส่วนลด', -Number(result.discount || 0)],
        ['ยอดรวมสุทธิ', result.grandTotal]
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
            <thead>
                <tr>
                    <th>ชื่อ</th>
                    <th>รายการที่กิน</th>
                </tr>
            </thead>
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
                <div class="metric">
                    <span class="metric-label">คนที่ออกเงินก่อน</span>
                    <strong>${escapeHtml(paymentDetails.payer)}</strong>
                </div>
                <div class="metric">
                    <span class="metric-label">ยอดที่ออกทั้งหมด</span>
                    <strong>${currency(paymentDetails.totalPaid)}</strong>
                </div>
                <div class="metric">
                    <span class="metric-label">ยอดที่ควรรับภาระเอง</span>
                    <strong>${currency(paymentDetails.netAmount)}</strong>
                </div>
            </div>
            <div class="payment-list">
                ${paymentDetails.breakdown.map((entry) => `
                    <div class="payment-item">
                        <span>${escapeHtml(entry.from)} ต้องคืน ${escapeHtml(entry.to)}</span>
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
                    <strong>${
                        entry.type === 'pay'
                            ? `จ่ายเพิ่ม ${currency(entry.amount)}`
                            : entry.type === 'receive'
                                ? `ได้เงินคืน ${currency(entry.amount)}`
                                : 'จ่ายพอดี'
                    }</strong>
                </div>
            `).join('')}
        </div>
    `;
}

async function calculateBill(event) {
    event.preventDefault();

    const allValid = [1, 2, 3, 4].every((step) => validateStep(step));
    if (!allValid) {
        return;
    }

    clearValidation();
    const payload = buildPayload();

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'ไม่สามารถคำนวณบิลได้ ลองตรวจข้อมูลแล้วคำนวณใหม่');
        }

        renderResultSummaryStrip(data.result, payload);
        renderSummaryTable(data.result.summary);
        renderCostBreakdown(data.result);
        renderLateJoiners(data.result.lateJoiners || []);
        renderPaymentDetails(data.paymentDetails, data.paymentMode);
        resultsSection.hidden = false;
        document.body.classList.add('results-open');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        showError(`เกิดข้อผิดพลาด: ${error.message} — ลองโหลดหน้าใหม่หรือตรวจข้อมูล`, state.currentStep);
    }
}

function resetForm() {
    clearValidation();
    state.stepErrors.clear();
    form.reset();
    document.getElementById('friendsContainer').innerHTML = '';
    document.getElementById('itemsContainer').innerHTML = '';
    document.getElementById('summaryCards').innerHTML = '';
    document.getElementById('summaryTable').innerHTML = '';
    document.getElementById('costBreakdown').innerHTML = '';
    document.getElementById('paymentDetails').innerHTML = '';
    document.getElementById('resultSummaryStrip').innerHTML = '';
    resultsSection.hidden = true;
    document.body.classList.remove('results-open');
    refreshDependentViews();
    addFriendRow('');
    if (getMode() === 1) addItemRow();
    setStep(1);
}

let _lateJoinerTarget = null;

function openLateJoinerModal(eatersInput) {
    _lateJoinerTarget = eatersInput;
    document.getElementById('lateJoinerInput').value = '';
    document.getElementById('lateJoinerModal').hidden = false;
    document.getElementById('lateJoinerInput').focus();
}

function closeLateJoinerModal() {
    document.getElementById('lateJoinerModal').hidden = true;
    _lateJoinerTarget = null;
}

function confirmLateJoiner() {
    const name = document.getElementById('lateJoinerInput').value.trim();
    if (name && _lateJoinerTarget) {
        appendNameToEatersInput(_lateJoinerTarget, name);
        refreshDependentViews();
        _lateJoinerTarget.focus();
    }
    closeLateJoinerModal();
}

document.getElementById('lateJoinerCancel').addEventListener('click', closeLateJoinerModal);
document.getElementById('lateJoinerConfirm').addEventListener('click', confirmLateJoiner);
document.getElementById('lateJoinerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmLateJoiner();
    if (e.key === 'Escape') closeLateJoinerModal();
});
document.getElementById('lateJoinerModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLateJoinerModal();
});

document.getElementById('addFriendBtn').addEventListener('click', () => addFriendRow(''));
document.getElementById('addItemBtn').addEventListener('click', () => addItemRow());
document.getElementById('hasFreePeople').addEventListener('change', refreshDependentViews);
document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('prevBtn').addEventListener('click', () => {
    if (state.currentStep > 1) {
        setStep(state.currentStep - 1);
    }
});
document.getElementById('nextBtn').addEventListener('click', () => {
    if (validateStep(state.currentStep) && state.currentStep < state.maxStep) {
        setStep(state.currentStep + 1);
    }
});

form.addEventListener('submit', calculateBill);
document.getElementById('totalAmount').addEventListener('input', refreshStepStateOnly);
document.getElementById('serviceCharge').addEventListener('input', refreshStepStateOnly);
document.getElementById('vat').addEventListener('input', refreshStepStateOnly);
document.getElementById('shippingFee').addEventListener('input', refreshStepStateOnly);
document.getElementById('discount').addEventListener('input', refreshStepStateOnly);

modeInputs.forEach((input) => input.addEventListener('change', refreshDependentViews));
paymentModeInputs.forEach((input) => input.addEventListener('change', refreshDependentViews));

stepNodes.forEach((node) => {
    node.addEventListener('click', () => {
        const target = Number(node.dataset.stepTarget);
        if (target < state.currentStep) {
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
            setStep(target);
        }
    });
});

resetForm();
