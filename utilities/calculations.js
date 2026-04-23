// ฟังก์ชันคำนวนการแบ่งบิลแบบละเอียด (Item-based Split)
function calculateDetailedSplit(data) {
    const { friends, items, serviceChargePercent, vatPercent, shippingFee, discount } = data;
    
    // 1. สร้าง Object สำหรับเก็บยอดของแต่ละคน
    let individualTotals = {};
    friends.forEach(name => individualTotals[name] = 0);

    // 2. คำนวนราคาอาหารแต่ละรายการ หารตามจำนวนคนกิน
    let subtotalAll = 0;
    items.forEach(item => {
        const pricePerPerson = item.price / item.eaters.length;
        item.eaters.forEach(eater => {
            individualTotals[eater] += pricePerPerson;
        });
        subtotalAll += item.price;
    });

    // 3. คำนวนหา Multiplier (ตัวคูณภาษีและค่าบริการ)
    const totalServiceCharge = subtotalAll * (serviceChargePercent / 100);
    const totalVat = (subtotalAll + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = subtotalAll + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;

    const multiplier = finalGrandTotal / subtotalAll;

    // 4. สรุปยอดรายคน
    const finalSplit = friends.map(name => {
        return {
            name: name,
            totalToPay: (individualTotals[name] * multiplier).toFixed(2),
            baseAmount: individualTotals[name].toFixed(2)
        };
    });

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
    const { friends, serviceChargePercent, vatPercent, shippingFee, discount, totalAmount } = data;
    
    const totalServiceCharge = totalAmount * (serviceChargePercent / 100);
    const totalVat = (totalAmount + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = totalAmount + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;
    
    const amountPerPerson = (finalGrandTotal / friends.length).toFixed(2);
    
    const finalSplit = friends.map(name => {
        return {
            name: name,
            totalToPay: amountPerPerson,
            baseAmount: (totalAmount / friends.length).toFixed(2)
        };
    });
    
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
    if (freePeople.length === 0) {
        return result;
    }

    const subtractAmount = freePeople.reduce((sum, name) => {
        return sum + parseFloat(result.summary.find(p => p.name === name).totalToPay);
    }, 0);
    
    const remainingFriends = friends.filter(f => !freePeople.includes(f));
    const remainingGrandTotal = parseFloat(result.grandTotal) - subtractAmount;
    
    const adjustedSummary = remainingFriends.map(name => {
        const originalAmount = parseFloat(result.summary.find(p => p.name === name).totalToPay);
        const redistributed = (originalAmount / remainingFriends.reduce((sum, f) => {
            return sum + parseFloat(result.summary.find(p => p.name === f).totalToPay);
        }, 0)) * remainingGrandTotal;
        
        return {
            name: name,
            totalToPay: redistributed.toFixed(2),
            baseAmount: result.summary.find(p => p.name === name).baseAmount
        };
    });
    
    // เพิ่มคนฟรีเข้าไป
    freePeople.forEach(name => {
        adjustedSummary.push({
            name: name,
            totalToPay: '0.00',
            baseAmount: result.summary.find(p => p.name === name).baseAmount,
            isFree: true
        });
    });
    
    return {
        ...result,
        summary: adjustedSummary,
        grandTotal: remainingGrandTotal.toFixed(2)
    };
}

// ฟังก์ชันคำนวนการชำระเงินเมื่อคนเดียวออก
function calculateSinglePayerPayment(result, payer) {
    const summary = result.summary;
    const grandTotal = parseFloat(result.grandTotal);
    
    const details = {
        payer: payer,
        totalPaid: grandTotal,
        breakdown: []
    };
    
    let totalToReceive = 0;
    summary.forEach(person => {
        if (person.name !== payer) {
            const amount = parseFloat(person.totalToPay);
            details.breakdown.push({
                from: person.name,
                to: payer,
                amount: amount.toFixed(2)
            });
            totalToReceive += amount;
        }
    });
    
    details.netAmount = (grandTotal - totalToReceive).toFixed(2);
    
    return details;
}

// ฟังก์ชันคำนวนการชำระเงินเมื่อหลายคนออก
function calculateMultiPayerPayment(result, payers) {
    const summary = result.summary;
    const paymentMap = {};
    
    payers.forEach(p => {
        paymentMap[p.name] = {
            paid: p.amount,
            shouldPay: parseFloat(result.summary.find(s => s.name === p.name).totalToPay)
        };
    });
    
    const breakdown = [];
    
    summary.forEach(person => {
        const paid = paymentMap[person.name] ? paymentMap[person.name].paid : 0;
        const shouldPay = parseFloat(person.totalToPay);
        const diff = shouldPay - paid;
        
        if (diff > 0) {
            // ต้องจ่ายเพิ่มเติม
            breakdown.push({
                person: person.name,
                type: 'pay',
                amount: diff.toFixed(2)
            });
        } else if (diff < 0) {
            // ได้เงินคืน
            breakdown.push({
                person: person.name,
                type: 'receive',
                amount: Math.abs(diff).toFixed(2)
            });
        } else {
            // จ่ายพอดี
            breakdown.push({
                person: person.name,
                type: 'exact',
                amount: '0.00'
            });
        }
    });
    
    return {
        payers: payers,
        breakdown: breakdown
    };
}

module.exports = {
    calculateDetailedSplit,
    calculateEvenSplit,
    applyFreePeople,
    calculateSinglePayerPayment,
    calculateMultiPayerPayment
};
