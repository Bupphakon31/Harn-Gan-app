const billData = {
    friends: ["Alice", "Bob", "Charlie", "David"],
    items: [
        { name: "Pizza", price: 500, eaters: ["Alice", "Bob", "Charlie"] }, // David ไม่กิน
        { name: "Beer", price: 300, eaters: ["Alice", "Bob", "David"] },    // Charlie ไม่กิน
        { name: "Salad", price: 150, eaters: ["Charlie", "David"] },       // มาทีหลัง สั่งกินกันสองคน
        { name: "Water", price: 40, eaters: ["Alice", "Bob", "Charlie", "David"] }
    ],
    serviceChargePercent: 10, // 10%
    vatPercent: 7,            // 7%
    discount: 50              // ลดรวมตอนท้าย (ถ้ามี)
};

module.exports = billData;