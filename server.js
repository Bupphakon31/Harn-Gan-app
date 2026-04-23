const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const calculations = require('./utilities/calculations');

const app = express();
const PORT = 3000;

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

        let result;

        if (mode === 1) {
            result = calculations.calculateDetailedSplit({
                friends,
                items,
                serviceChargePercent: parseFloat(serviceChargePercent) || 0,
                vatPercent: parseFloat(vatPercent) || 0,
                shippingFee: parseFloat(shippingFee) || 0,
                discount: parseFloat(discount) || 0
            });
        } else if (mode === 2) {
            result = calculations.calculateEvenSplit({
                friends,
                serviceChargePercent: parseFloat(serviceChargePercent) || 0,
                vatPercent: parseFloat(vatPercent) || 0,
                shippingFee: parseFloat(shippingFee) || 0,
                discount: parseFloat(discount) || 0,
                totalAmount: parseFloat(totalAmount) || 0
            });
        } else {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        if (freePeople && freePeople.length > 0) {
            result = calculations.applyFreePeople(result, friends, freePeople, items || []);
        }

        let paymentDetails = null;
        if (paymentMode === 1 && payerInfo && payerInfo.payer) {
            paymentDetails = calculations.calculateSinglePayerPayment(result, payerInfo.payer);
        } else if (paymentMode === 2 && payerInfo && payerInfo.payers) {
            paymentDetails = calculations.calculateMultiPayerPayment(result, payerInfo.payers);
        }

        if (lateJoiners && lateJoiners.length > 0 && mode === 1) {
            result.lateJoiners = lateJoiners.map((name) => ({
                name,
                items: items.filter((item) => item.eaters.includes(name)).map((item) => item.name)
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
