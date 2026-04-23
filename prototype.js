const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function askOption(question, validOptions, errorMessage) {
    const normalized = validOptions.map(option => option.toLowerCase());
    while (true) {
        const answer = (await ask(question)).trim();
        if (normalized.includes(answer.toLowerCase())) {
            return answer;
        }
        console.log(errorMessage || `กรุณาตอบด้วย: ${validOptions.join(', ')}`);
    }
}

async function askYesNo(question) {
    const answer = await askOption(question, ['ใช่', 'ไม่', 'yes', 'no', 'y', 'n'], 'กรุณาตอบ "ใช่" หรือ "ไม่"');
    return ['ใช่', 'yes', 'y'].includes(answer.toLowerCase());
}

async function askNumber(question, errorMessage) {
    while (true) {
        const answer = (await ask(question)).trim();
        const value = parseFloat(answer);
        if (!Number.isNaN(value)) {
            return value;
        }
        console.log(errorMessage || 'กรุณาใส่ตัวเลขที่ถูกต้อง');
    }
}

async function askInteger(question, errorMessage) {
    while (true) {
        const value = await askNumber(question, errorMessage);
        if (Number.isInteger(value) && value >= 0) {
            return value;
        }
        console.log(errorMessage || 'กรุณาใส่จำนวนเต็มที่ไม่ติดลบ');
    }
}

async function askString(question, errorMessage) {
    while (true) {
        const answer = (await ask(question)).trim();
        if (answer.length > 0) {
            return answer;
        }
        console.log(errorMessage || 'กรุณาใส่ข้อความ');
    }
}

async function askEaters(question, friends, lateJoiners) {
    while (true) {
        const eatersInput = await ask(question);
        const names = eatersInput.split(',').map(e => e.trim()).filter(e => e.length > 0);
        const validEaters = names.filter(n => friends.includes(n));
        const unknownEaters = names.filter(n => n.length > 0 && !friends.includes(n));
        
        if (unknownEaters.length > 0) {
            console.log(`ชื่อที่ยังไม่มีในรายชื่อ: ${unknownEaters.join(', ')}`);
            const addUnknown = await askYesNo('ต้องการเพิ่มคนเหล่านี้เป็นคนมาทีหลังไหม? (ตอบ "ใช่" หรือ "ไม่"): ');
            if (addUnknown) {
                for (const unknown of unknownEaters) {
                    if (!friends.includes(unknown)) {
                        friends.push(unknown);
                        lateJoiners.push(unknown);
                        validEaters.push(unknown);
                    }
                }
            }
        }
        
        if (validEaters.length > 0) {
            return [...new Set(validEaters)];
        }
        console.log(`กรุณาใส่ชื่อคนกินอย่างน้อย 1 คน โดยใช้ชื่อจาก: ${friends.join(', ')}`);
    }
}

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
    // คิดแบบ Step: (ราคา + Service + ค่าส่ง) + VAT
    const totalServiceCharge = subtotalAll * (serviceChargePercent / 100);
    const totalVat = (subtotalAll + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = subtotalAll + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;

    // หา Ratio ว่า 1 บาทของราคาอาหารจริง กลายเป็นกี่บาทเมื่อรวมทุกอย่างแล้ว
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
        grandTotal: finalGrandTotal.toFixed(2)
    };
}

function calculateEvenSplit(data) {
    const { friends, serviceChargePercent, vatPercent, shippingFee, discount, totalAmount } = data;
    
    // คำนวนค่าบริการและภาษี และค่าส่ง
    const totalServiceCharge = totalAmount * (serviceChargePercent / 100);
    const totalVat = (totalAmount + totalServiceCharge + shippingFee) * (vatPercent / 100);
    const grandTotalBeforeDiscount = totalAmount + totalServiceCharge + shippingFee + totalVat;
    const finalGrandTotal = grandTotalBeforeDiscount - discount;
    
    // แบ่งเท่าๆ กัน
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
        grandTotal: finalGrandTotal.toFixed(2)
    };
}

function calculateWithPaymentMode(result, friends, paymentMode) {
    const summary = result.summary;
    const grandTotal = parseFloat(result.grandTotal);
    
    if (paymentMode === 1) {
        // คนเดียวออก
        console.log("\n=== วิธีการจ่ายเงิน: คนเดียวออกทั้งหมด ===");
        return {
            summary: summary,
            grandTotal: result.grandTotal,
            note: "** ป้อนชื่อคนที่ออกเงินด้านบน **"
        };
    } else if (paymentMode === 2) {
        // หลายคนออก
        console.log("\n=== วิธีการจ่ายเงิน: หลายคนช่วยกันออกเงิน ===");
        return {
            summary: summary,
            grandTotal: result.grandTotal,
            note: "** ป้อนรายชื่อผู้ออกเงินด้านบน **"
        };
    }
    
    return { summary, grandTotal: result.grandTotal };
}

function displayPaymentDetails(result, payerInfo) {
    const summary = result.summary;
    const grandTotal = parseFloat(result.grandTotal);
    
    if (payerInfo.mode === 1 && payerInfo.payer) {
        // โหมดคนเดียวออก
        console.log("\n=====================================");
        console.log("รายการชำระเงิน:");
        console.log("=====================================");
        
        let totalPersonShouldPay = 0;
        const detailsSummary = [];
        
        summary.forEach(person => {
            const amount = parseFloat(person.totalToPay);
            if (person.name === payerInfo.payer) {
                console.log(`${person.name}: ออกเงิน ${amount.toFixed(2)} บาท (เป็นคนจ่าย)`);
            } else {
                console.log(`${person.name}: คิดค่า ${amount.toFixed(2)} บาท -> ต้องจ่ายให้ ${payerInfo.payer}`);
                totalPersonShouldPay += amount;
            }
        });
        
        console.log("\nสรุป:");
        console.log(`${payerInfo.payer} ออกเงินทั้งหมด: ${grandTotal.toFixed(2)} บาท`);
        console.log(`จำนวนเงินที่ต้องเก็บคืน: ${totalPersonShouldPay.toFixed(2)} บาท`);
        console.log(`เงินสุทธิที่ ${payerInfo.payer} ได้เท่ากับ: ${(parseFloat(summary.find(p => p.name === payerInfo.payer).totalToPay)).toFixed(2)} บาท`);
        
    } else if (payerInfo.mode === 2 && payerInfo.payers && payerInfo.payers.length > 0) {
        // โหมดหลายคนออก
        console.log("\n=====================================");
        console.log("รายละเอียดการชำระเงิน:");
        console.log("=====================================");
        
        // สร้าง map ของเงินที่ออกจากแต่ละคน
        const paymentMap = {};
        payerInfo.payers.forEach(p => {
            paymentMap[p.name] = {
                hasPaid: p.amount,
                shouldPay: p.shouldPay
            };
        });
        
        let balance = {};
        summary.forEach(person => {
            const shouldPay = parseFloat(person.totalToPay);
            const hasPaid = paymentMap[person.name] ? paymentMap[person.name].hasPaid : 0;
            balance[person.name] = {
                shouldPay: shouldPay,
                hasPaid: hasPaid,
                remaining: shouldPay - hasPaid
            };
        });
        
        console.log("\nการจ่ายเงิน:");
        Object.keys(balance).forEach(name => {
            const b = balance[name];
            if (b.hasPaid > 0) {
                console.log(`${name}: ออกเงิน ${b.hasPaid.toFixed(2)} บาท (ต้องจ่าย ${b.shouldPay.toFixed(2)} บาท)`);
            } else {
                console.log(`${name}: ไม่ได้ออกเงิน (ต้องจ่าย ${b.shouldPay.toFixed(2)} บาท)`);
            }
        });
        
        console.log("\nการชำระคืน/สังเกต:");
        Object.keys(balance).forEach(name => {
            const b = balance[name];
            if (b.remaining > 0) {
                console.log(`${name}: ต้องจ่ายเพิ่มเติม ${b.remaining.toFixed(2)} บาท`);
            } else if (b.remaining < 0) {
                console.log(`${name}: ได้เงินคืน ${Math.abs(b.remaining).toFixed(2)} บาท`);
            } else {
                console.log(`${name}: จ่ายพอดี ✓`);
            }
        });
    }
}

async function main() {
    console.log("ยินดีต้อนรับสู่โปรแกรมคำนวนการแบ่งบิล");
    console.log("=====================================\n");
    
    // ถามเลือกโหมดการแบ่งบิล
    console.log("เลือกโหมดการแบ่งบิล:");
    console.log("1. หารแบบซื้ออาหารมา (คนกินต่างกัน)");
    console.log("2. หารเท่าๆ กัน (ทุกคนจ่ายเท่ากัน)");
    const modeInput = await askOption("\nเลือก (1 หรือ 2): ", ['1', '2'], 'กรุณาตอบ 1 หรือ 2');
    const mode = parseInt(modeInput);
    
    // ถามเลือกวิธีการจ่ายเงิน
    console.log("\nวิธีการจ่ายเงิน:");
    console.log("1. คนเดียวออกเงินทั้งหมด (แล้วเก็บเงินคืนจากเพื่อน)");
    console.log("2. หลายคนช่วยกันออกเงิน");
    const paymentModeInput = await askOption("\nเลือก (1 หรือ 2): ", ['1', '2'], 'กรุณาตอบ 1 หรือ 2');
    const paymentMode = parseInt(paymentModeInput);
    
    // ถามจำนวนเพื่อน
    const numFriends = await askInteger("\nจำนวนเพื่อนทั้งหมด: ", 'กรุณาใส่จำนวนเต็มจำนวนเพื่อน');
    const friends = [];
    for (let i = 0; i < numFriends; i++) {
        const name = await askString(`ชื่อเพื่อนคนที่ ${i+1}: `, 'กรุณาใส่ชื่อเพื่อน');
        friends.push(name);
    }
    const lateJoiners = [];
    
    // ถาม service charge, vat, discount, ค่าส่ง
    const serviceChargePercent = await askNumber("\nเปอร์เซ็นต์ค่าบริการ (เช่น 10 หรือ 0): ", 'กรุณาใส่ตัวเลข');
    const vatPercent = await askNumber("เปอร์เซ็นต์ VAT (เช่น 7 หรือ 0): ", 'กรุณาใส่ตัวเลข');
    const shippingFee = await askNumber("ค่าส่ง (เช่น 50 หรือ 0): ", 'กรุณาใส่ตัวเลข');
    const discount = await askNumber("ส่วนลดรวม (เช่น 50 หรือ 0): ", 'กรุณาใส่ตัวเลข');
    
    let result;
    let items = [];
    
    if (mode === 1) {
        // โหมดหารแบบซื้ออาหารมา
        const numItems = await askInteger("\nจำนวนรายการอาหาร/เครื่องดื่ม: ", 'กรุณาใส่จำนวนเต็ม');
        for (let i = 0; i < numItems; i++) {
            const name = await askString(`ชื่อรายการที่ ${i+1}: `, 'กรุณาใส่ชื่อรายการ');
            const price = await askNumber(`ราคาของ ${name}: `, 'กรุณาใส่ตัวเลขราคา');
            console.log(`คนกิน ${name} (เลือกจาก: ${friends.join(', ')})`);
            const eaters = await askEaters("ใส่ชื่อคนกิน คั่นด้วย comma (เช่น Alice,Bob): ", friends, lateJoiners);
            items.push({ name, price, eaters });
        }
        
        const data = { friends, items, serviceChargePercent, vatPercent, shippingFee, discount };
        result = calculateDetailedSplit(data);
    } else if (mode === 2) {
        // โหมดหารเท่าๆ กัน
        const totalAmount = await askNumber("\nยอดรวมทั้งหมด (ก่อนค่าบริการและภาษี): ", 'กรุณาใส่ตัวเลข');
        const data = { friends, serviceChargePercent, vatPercent, shippingFee, discount, totalAmount };
        result = calculateEvenSplit(data);
    } else {
        console.log("กรุณาเลือก 1 หรือ 2");
        rl.close();
        return;
    }

    if (lateJoiners.length > 0) {
        result.summary = result.summary.map(person => {
            const itemsEaten = items.filter(item => item.eaters.includes(person.name)).map(item => item.name);
            return {
                ...person,
                note: lateJoiners.includes(person.name) ? 'มาทีหลัง' : '',
                itemsEaten: itemsEaten.length > 0 ? itemsEaten.join(', ') : ''
            };
        });
    }
    
    // เตรียมข้อมูลการจ่ายเงิน
    let payerInfo = { mode: paymentMode };
    
    // แสดงตารางค่าใช้จ่ายของแต่ละคน
    console.log("\n=====================================");
    console.log("ค่าใช้จ่ายของแต่ละคน:");
    console.log("=====================================");
    console.table(result.summary);
    console.log("ยอดรวมทั้งสิ้น: " + result.grandTotal + " บาท");
    if (lateJoiners.length > 0 && mode === 1) {
        console.log("\nคนมาทีหลังและรายการที่กิน:");
        console.table(lateJoiners.map(name => ({
            name,
            items: items.filter(item => item.eaters.includes(name)).map(item => item.name).join(', ')
        })));
    }
    console.log("=====================================\n");
    
    // ถามคนที่ไม่ต้องจ่าย (ฟรี)
    const hasFreePerson = await askYesNo("มีคนที่ไม่ต้องจ่ายหรือไม่? (ตอบ 'ใช่' หรือ 'ไม่'): ");
    let freePeople = [];
    let adjustedResult = result;
    
    if (hasFreePerson) {
        const numFree = parseInt(await askNumber("จำนวนคนที่ไม่ต้องจ่าย: ", 'กรุณาใส่ตัวเลข')); 
        for (let i = 0; i < numFree; i++) {
            let freeName;
            while (true) {
                freeName = await ask(`ชื่อคนที่ ${i+1} (ไม่ต้องจ่าย): `);
                if (friends.includes(freeName)) {
                    freePeople.push(freeName);
                    break;
                }
                console.log(`ชื่อไม่ถูกต้อง กรุณาเลือกจาก: ${friends.join(', ')}`);
            }
        }
        
        // คำนวนใหม่ หักคนฟรีออก
        if (freePeople.length > 0) {
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
                    note: '(ไม่ต้องจ่าย)'
                });
            });
            
            adjustedResult = {
                summary: adjustedSummary,
                grandTotal: remainingGrandTotal.toFixed(2)
            };
            
            console.log("\n✓ คำนวนใหม่หลังหักคนฟรี:");
            console.table(adjustedResult.summary);
            console.log("ยอดรวมทั้งสิ้น: " + adjustedResult.grandTotal + " บาท\n");
        }
    }
    
    result = adjustedResult;
    
    if (paymentMode === 1) {
        // คนเดียวออกเงิน
        let payer;
        while (true) {
            payer = await askString(`เลือกคนที่ออกเงิน (${friends.join(', ')}): `, 'กรุณาใส่ชื่อคนที่ออกเงิน');
            if (friends.includes(payer)) {
                payerInfo.payer = payer;
                break;
            }
            console.log(`ชื่อไม่ตรงกับรายชื่อเพื่อน กรุณาเลือกจาก: ${friends.join(', ')}`);
        }
    } else if (paymentMode === 2) {
        // หลายคนออก
        const numPayers = await askInteger("จำนวนคนที่ออกเงิน: ", 'กรุณาใส่จำนวนเต็ม');
        const payers = [];
        for (let i = 0; i < numPayers; i++) {
            let payerName;
            while (true) {
                payerName = await askString(`ชื่อคนที่ ${i+1}: `, 'กรุณาใส่ชื่อคนที่ออกเงิน');
                if (!friends.includes(payerName)) {
                    console.log(`${payerName} ไม่อยู่ในรายชื่อเพื่อน กรุณาเลือกจาก: ${friends.join(', ')}`);
                    continue;
                }
                if (payers.some(p => p.name === payerName)) {
                    console.log(`${payerName} ถูกเลือกไปแล้ว กรุณาเลือกชื่ออื่น`);
                    continue;
                }
                break;
            }
            const shouldPay = parseFloat(result.summary.find(p => p.name === payerName).totalToPay);
            const payerAmount = await askNumber(`${payerName} ต้องจ่าย ${shouldPay} บาท (จ่ายจริง): `, 'กรุณาใส่ตัวเลขจำนวนเงิน');
            payers.push({ name: payerName, amount: payerAmount, shouldPay: shouldPay });
        }
        payerInfo.payers = payers;
    }
    
    displayPaymentDetails(result, payerInfo);
    console.log("=====================================");
    
    rl.close();
}

main();