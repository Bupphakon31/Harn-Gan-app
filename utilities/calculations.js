const toNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toCents = (value) => Math.round(toNumber(value) * 100);

const fromCents = (value) => (value / 100).toFixed(2);

// ฟังก์ชันคำนวนการแบ่งบิลแบบละเอียด (Item-based Split)
function calculateDetailedSplit(data) {
    const friends = Array.isArray(data.friends) ? data.friends : [];
    const items = Array.isArray(data.items) ? data.items : [];
    const serviceChargePercent = toNumber(data.serviceChargePercent);
    const vatPercent = toNumber(data.vatPercent);
    const shippingFee = toNumber(data.shippingFee);
    const discount = toNumber(data.discount);

    if (friends.length === 0) {
        throw new Error('กรุณาใส่ชื่อเพื่อนอย่างน้อย 1 คน');
    }

    if (items.length === 0) {
        throw new Error('กรุณาเพิ่มรายการอาหารอย่างน้อย 1 รายการ');
    }

    // 1. สร้าง Object สำหรับเก็บยอดของแต่ละคน
    const individualTotals = {};
    friends.forEach((name) => {
        individualTotals[name] = 0;
    });

    // 2. คำนวนราคาอาหารแต่ละรายการ หารตามจำนวนคนกิน
    let subtotalAll = 0;
    items.forEach((item) => {
        if (!item || !item.eaters || item.eaters.length === 0) {
            throw new Error(`รายการ ${item?.name || '-'} ต้องมีคนกินอย่างน้อย 1 คน`);
        }

        const itemPrice = toNumber(item.price);
        const pricePerPerson = itemPrice / item.eaters.length;
        item.eaters.forEach((eater) => {
            if (individualTotals[eater] === undefined) {
                individualTotals[eater] = 0;
            }
            individualTotals[eater] += pricePerPerson;
        });
        subtotalAll += itemPrice;
    });

    if (subtotalAll <= 0) {
        throw new Error('ยอดอาหารต้องมากกว่า 0');
    }

    // 3. คำนวนหา Multiplier (ตัวคูณภาษีและค่าบริการ)
    const totalServiceCharge = subtotalAll * (serviceChargePercent / 100);
    const totalVat = (subtotalAll + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = subtotalAll + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;

    const multiplier = finalGrandTotal / subtotalAll;

    // 4. สรุปยอดรายคน
    const finalSplit = friends.map((name) => ({
        name,
        totalToPay: (individualTotals[name] * multiplier).toFixed(2),
        baseAmount: individualTotals[name].toFixed(2)
    }));

    return {
        summary: finalSplit,
        grandTotal: finalGrandTotal.toFixed(2),
        subtotal: subtotalAll.toFixed(2),
        serviceCharge: totalServiceCharge.toFixed(2),
        vat: totalVat.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        discount: discount.toFixed(2)
    };
}

// ฟังก์ชันคำนวนการแบ่งบิลแบบเท่าๆ กัน (Even Split)
function calculateEvenSplit(data) {
    const friends = Array.isArray(data.friends) ? data.friends : [];
    const serviceChargePercent = toNumber(data.serviceChargePercent);
    const vatPercent = toNumber(data.vatPercent);
    const shippingFee = toNumber(data.shippingFee);
    const discount = toNumber(data.discount);
    const totalAmount = toNumber(data.totalAmount);

    if (friends.length === 0) {
        throw new Error('กรุณาใส่ชื่อเพื่อนอย่างน้อย 1 คน');
    }

    if (totalAmount <= 0) {
        throw new Error('กรุณากรอกยอดรวมให้มากกว่า 0');
    }

    const totalServiceCharge = totalAmount * (serviceChargePercent / 100);
    const totalVat = (totalAmount + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = totalAmount + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;

    const amountPerPerson = (finalGrandTotal / friends.length).toFixed(2);

    const finalSplit = friends.map((name) => ({
        name,
        totalToPay: amountPerPerson,
        baseAmount: (totalAmount / friends.length).toFixed(2)
    }));

    return {
        summary: finalSplit,
        grandTotal: finalGrandTotal.toFixed(2),
        subtotal: totalAmount.toFixed(2),
        serviceCharge: totalServiceCharge.toFixed(2),
        vat: totalVat.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        discount: discount.toFixed(2)
    };
}

// ฟังก์ชันคำนวนการแบ่งบิลพร้อม adjustment สำหรับคนฟรี
function applyFreePeople(result, friends, freePeople, items) {
    const freeNames = Array.isArray(freePeople)
        ? [...new Set(freePeople.map((name) => (typeof name === 'string' ? name.trim() : '')).filter(Boolean))]
        : [];

    if (freeNames.length === 0) {
        return result;
    }

    const summary = Array.isArray(result.summary) ? result.summary : [];
    const freeSet = new Set(freeNames);
    const paidSummary = summary.filter((person) => !freeSet.has(person.name));
    const freeSummary = summary.filter((person) => freeSet.has(person.name));

    if (paidSummary.length === 0) {
        throw new Error('ต้องมีคนจ่ายอย่างน้อย 1 คน');
    }

    const removedAmount = freeSummary.reduce((sum, person) => sum + toNumber(person.totalToPay), 0);
    const remainingGrandTotal = Math.max(toNumber(result.grandTotal) - removedAmount, 0);
    const remainingOriginalTotal = paidSummary.reduce((sum, person) => sum + toNumber(person.totalToPay), 0);
    const ratio = remainingOriginalTotal > 0 ? remainingGrandTotal / remainingOriginalTotal : 0;

    const adjustedSummary = paidSummary.map((person) => ({
        ...person,
        totalToPay: (toNumber(person.totalToPay) * ratio).toFixed(2)
    }));

    freeSummary.forEach((person) => {
        adjustedSummary.push({
            ...person,
            totalToPay: '0.00',
            isFree: true
        });
    });

    return {
        ...result,
        summary: adjustedSummary,
        grandTotal: remainingGrandTotal.toFixed(2),
        freePeople: freeNames
    };
}

// ฟังก์ชันคำนวนการชำระเงินเมื่อคนเดียวออก
function calculateSinglePayerPayment(result, payer) {
    const summary = Array.isArray(result.summary) ? result.summary : [];
    const freePeople = Array.isArray(result.freePeople)
        ? result.freePeople.map((name) => (typeof name === 'string' ? name.trim() : '')).filter(Boolean)
        : [];
    const freeSet = new Set(freePeople);
    const grandTotalCents = toCents(result.grandTotal);
    const payerName = typeof payer === 'string' ? payer.trim() : '';
    const payerEntry = summary.find((person) => person.name === payerName);

    if (!payerName) {
        throw new Error('กรุณาเลือกคนที่ออกเงินก่อน');
    }

    if (!payerEntry) {
        throw new Error('ไม่พบชื่อคนที่ออกเงินก่อนในรายชื่อ');
    }

    if (payerEntry.isFree || freeSet.has(payerName)) {
        throw new Error('คนฟรีไม่สามารถเป็นคนออกเงินก่อน');
    }

    const payerShareCents = toCents(payerEntry.totalToPay);
    const expectedToReceiveCents = Math.max(grandTotalCents - payerShareCents, 0);

    const breakdownEntries = summary
        .filter((person) => person.name !== payerName && !person.isFree)
        .map((person) => ({
            from: person.name,
            amountCents: Math.max(toCents(person.totalToPay), 0)
        }))
        .filter((entry) => entry.amountCents > 0);

    let totalToReceiveCents = breakdownEntries.reduce((sum, entry) => sum + entry.amountCents, 0);
    const differenceCents = expectedToReceiveCents - totalToReceiveCents;

    if (breakdownEntries.length > 0 && differenceCents !== 0) {
        const lastEntry = breakdownEntries[breakdownEntries.length - 1];
        lastEntry.amountCents = Math.max(lastEntry.amountCents + differenceCents, 0);
        totalToReceiveCents = breakdownEntries.reduce((sum, entry) => sum + entry.amountCents, 0);
    }

    return {
        payer: payerName,
        payerShare: fromCents(payerShareCents),
        totalPaid: fromCents(grandTotalCents),
        totalToReceive: fromCents(totalToReceiveCents),
        netAmount: fromCents(payerShareCents),
        breakdown: breakdownEntries.map((entry) => ({
            from: entry.from,
            to: payerName,
            amount: fromCents(entry.amountCents)
        }))
    };
}

// ฟังก์ชันคำนวนการชำระเงินเมื่อหลายคนออก
function calculateMultiPayerPayment(result, payers) {
    const summary = Array.isArray(result.summary) ? result.summary : [];
    const summaryNames = new Set(summary.map((person) => person.name));
    const freePeople = Array.isArray(result.freePeople)
        ? result.freePeople.map((name) => (typeof name === 'string' ? name.trim() : '')).filter(Boolean)
        : [];
    const freeSet = new Set(freePeople);
    const normalizedPayers = Array.isArray(payers)
        ? payers
            .filter((p) => p && typeof p === 'object')
            .map((p) => ({
                name: typeof p.name === 'string' ? p.name.trim() : '',
                amountCents: toCents(p.amount)
            }))
            .filter((p) => p.name)
        : [];

    if (normalizedPayers.length === 0) {
        throw new Error('กรุณาเลือกคนที่ช่วยกันออกเงินอย่างน้อย 1 คน');
    }

    const invalidPayer = normalizedPayers.find((p) => !summaryNames.has(p.name) || freeSet.has(p.name) || summary.find((person) => person.name === p.name)?.isFree);
    if (invalidPayer) {
        throw new Error(`ไม่พบชื่อ ${invalidPayer.name} ในรายชื่อผู้จ่ายที่ใช้ได้`);
    }

    const invalidAmount = normalizedPayers.find((p) => p.amountCents <= 0);
    if (invalidAmount) {
        throw new Error(`กรุณาใส่ยอดจ่ายจริงของ ${invalidAmount.name}`);
    }

    const payerMap = {};
    normalizedPayers.forEach((payer) => {
        if (!payerMap[payer.name]) {
            payerMap[payer.name] = {
                name: payer.name,
                amountCents: 0
            };
        }

        payerMap[payer.name].amountCents += payer.amountCents;
    });

    const paymentMap = {};

    Object.values(payerMap).forEach((payer) => {
        paymentMap[payer.name] = {
            paidCents: payer.amountCents,
            shouldPayCents: toCents(summary.find((s) => s.name === payer.name)?.totalToPay)
        };
    });

    const breakdown = [];

    summary.forEach((person) => {
        if (person.isFree) {
            breakdown.push({
                person: person.name,
                type: 'exact',
                amount: '0.00'
            });
            return;
        }

        const paidCents = paymentMap[person.name] ? paymentMap[person.name].paidCents : 0;
        const shouldPayCents = toCents(person.totalToPay);
        const diffCents = shouldPayCents - paidCents;

        if (diffCents > 0) {
            breakdown.push({
                person: person.name,
                type: 'pay',
                amount: fromCents(diffCents)
            });
        } else if (diffCents < 0) {
            breakdown.push({
                person: person.name,
                type: 'receive',
                amount: fromCents(Math.abs(diffCents))
            });
        } else {
            breakdown.push({
                person: person.name,
                type: 'exact',
                amount: '0.00'
            });
        }
    });

    return {
        payers: Object.values(payerMap).map((payer) => ({
            name: payer.name,
            amount: fromCents(payer.amountCents)
        })),
        breakdown,
        totalPaid: fromCents(Object.values(payerMap).reduce((sum, p) => sum + p.amountCents, 0))
    };
}

module.exports = {
    calculateDetailedSplit,
    calculateEvenSplit,
    applyFreePeople,
    calculateSinglePayerPayment,
    calculateMultiPayerPayment
};
