const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const calculations = require('./utilities/calculations');

const app = express();
const PORT = 3000;

const toNonNegativeNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeNames = (values = []) => {
    if (!Array.isArray(values)) {
        return [];
    }

    return [...new Set(
        values
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
    )];
};

const normalizeItems = (items = []) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            ...item,
            name: typeof item.name === 'string' ? item.name.trim() : '',
            price: toNonNegativeNumber(item.price),
            eaters: normalizeNames(item.eaters),
        }))
        .filter((item) => item.name || item.price || item.eaters.length > 0);
};

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/calculate', (req, res) => {
    try {
        const {
            mode,
            friends,
            items,
            totalAmount,
            serviceChargePercent,
            vatPercent,
            shippingFee,
            discount,
            paymentMode,
            payerInfo,
            freePeople,
            lateJoiners
        } = req.body;

        const normalizedFriends = normalizeNames(friends);
        const normalizedItems = normalizeItems(items);
        const normalizedFreePeople = normalizeNames(freePeople).filter((name) => normalizedFriends.includes(name));
        const normalizedLateJoiners = normalizeNames(lateJoiners);

        if (normalizedFriends.length === 0) {
            return res.status(400).json({ error: 'Missing friends' });
        }

        if (normalizedFreePeople.length >= normalizedFriends.length) {
            return res.status(400).json({ error: 'ต้องมีคนจ่ายอย่างน้อย 1 คน' });
        }

        let result;

        if (mode === 1) {
            result = calculations.calculateDetailedSplit({
                friends: normalizedFriends,
                items: normalizedItems,
                serviceChargePercent: toNonNegativeNumber(serviceChargePercent),
                vatPercent: toNonNegativeNumber(vatPercent),
                shippingFee: toNonNegativeNumber(shippingFee),
                discount: toNonNegativeNumber(discount)
            });
        } else if (mode === 2) {
            result = calculations.calculateEvenSplit({
                friends: normalizedFriends,
                serviceChargePercent: toNonNegativeNumber(serviceChargePercent),
                vatPercent: toNonNegativeNumber(vatPercent),
                shippingFee: toNonNegativeNumber(shippingFee),
                discount: toNonNegativeNumber(discount),
                totalAmount: toNonNegativeNumber(totalAmount)
            });
        } else {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        if (normalizedFreePeople.length > 0) {
            result = calculations.applyFreePeople(result, normalizedFriends, normalizedFreePeople);
            result.freePeople = normalizedFreePeople;
        }

        let paymentDetails = null;
        if (paymentMode === 1 && payerInfo && payerInfo.payer) {
            const payer = typeof payerInfo.payer === 'string' ? payerInfo.payer.trim() : '';
            if (!payer) {
                return res.status(400).json({ error: 'กรุณาเลือกคนที่ออกเงินก่อน' });
            }
            paymentDetails = calculations.calculateSinglePayerPayment(result, payer);
        } else if (paymentMode === 2 && payerInfo && payerInfo.payers) {
            paymentDetails = calculations.calculateMultiPayerPayment(result, payerInfo.payers);
        }

        if (normalizedLateJoiners.length > 0 && mode === 1) {
            result.lateJoiners = normalizedLateJoiners.map((name) => ({
                name,
                items: normalizedItems
                    .filter((item) => item.eaters.includes(name))
                    .map((item) => item.name)
            }));
        }

        res.json({
            success: true,
            result,
            paymentDetails,
            mode,
            paymentMode
        });
    } catch (error) {
        console.error('Calculation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\nHarn-Gan server running at http://localhost:${PORT}`);
    console.log('\nHarn-Gan พร้อมใช้งาน');
    console.log('=====================================\n');
});
