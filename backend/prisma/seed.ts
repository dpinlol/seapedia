import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin", email: "admin@seapedia.com", password,
      roles: JSON.stringify(["ADMIN"]), activeRole: "ADMIN",
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { username: "seller" },
    update: {},
    create: {
      username: "seller", email: "seller@seapedia.com", password,
      roles: JSON.stringify(["SELLER", "BUYER"]), activeRole: "SELLER",
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { username: "buyer" },
    update: {},
    create: {
      username: "buyer", email: "buyer@seapedia.com", password,
      roles: JSON.stringify(["BUYER"]), activeRole: "BUYER",
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { username: "driver" },
    update: {},
    create: {
      username: "driver", email: "driver@seapedia.com", password,
      roles: JSON.stringify(["DRIVER"]), activeRole: "DRIVER",
    },
  });

  // ── Profiles ──
  await prisma.buyerProfile.upsert({
    where: { userId: buyerUser.id },
    update: { walletBalance: 500000 },
    create: { userId: buyerUser.id, walletBalance: 500000 },
  });

  // seller also gets a buyer profile for demo (can switch to BUYER)
  await prisma.buyerProfile.upsert({
    where: { userId: sellerUser.id },
    update: { walletBalance: 250000 },
    create: { userId: sellerUser.id, walletBalance: 250000 },
  });

  await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: { userId: driverUser.id },
  });

  // ── Store + Products ──
  let store;
  const existingStore = await prisma.store.findUnique({ where: { sellerId: sellerUser.id } });
  if (existingStore) {
    store = existingStore;
  } else {
    store = await prisma.store.create({
      data: { name: "Toko Serba Ada", sellerId: sellerUser.id },
    });

    await prisma.product.createMany({
      data: [
        { name: "Kaos Polos", description: "Kaos katun nyaman dipakai", price: 75000, stock: 50, storeId: store.id },
        { name: "Celana Jeans", description: "Celana jeans premium", price: 150000, stock: 30, storeId: store.id },
        { name: "Topi Baseball", description: "Topi baseball casual", price: 45000, stock: 100, storeId: store.id },
        { name: "Tas Ransel", description: "Tas ransel anti air", price: 200000, stock: 20, storeId: store.id },
        { name: "Sepatu Sneakers", description: "Sepatu sneakers时尚", price: 250000, stock: 15, storeId: store.id },
        { name: "Jam Tangan", description: "Jam tangan analog elegan", price: 180000, stock: 25, storeId: store.id },
        { name: "Dompet Kulit", description: "Dompet kulit asli", price: 120000, stock: 40, storeId: store.id },
      ],
    });
  }

  const products = await prisma.product.findMany({ where: { storeId: store.id } });
  const getP = (name: string) => products.find((p) => p.name === name)!;

  // ── Addresses for buyer ──
  const buyerProfile = (await prisma.buyerProfile.findUnique({ where: { userId: buyerUser.id } }))!;
  const sellerBuyerProfile = (await prisma.buyerProfile.findUnique({ where: { userId: sellerUser.id } }))!;

  if ((await prisma.address.count({ where: { buyerId: buyerProfile.id } })) === 0) {
    await prisma.address.create({
      data: { buyerId: buyerProfile.id, label: "Rumah", address: "Jl. Merdeka No. 10", city: "Jakarta", phone: "081234567890", isDefault: true },
    });
    await prisma.address.create({
      data: { buyerId: buyerProfile.id, label: "Kantor", address: "Jl. Sudirman Kav. 5", city: "Jakarta", phone: "081234567890" },
    });
  }

  // ── Demo Orders ──
  const orderCount = await prisma.order.count({ where: { buyerId: buyerProfile.id } });
  if (orderCount === 0) {
    // Order 1: Sedang Dikemas (needs seller to process)
    const order1 = await prisma.order.create({
      data: {
        buyerId: buyerProfile.id,
        sellerId: sellerUser.id,
        storeId: store.id,
        subtotal: 120000,
        discountAmount: 0,
        deliveryFee: 10000,
        ppn: 14400,
        finalTotal: 144400,
        deliveryMethod: "INSTANT",
        status: "SEDANG_DIKEMAS",
        items: {
          create: [
            { productId: getP("Kaos Polos").id, productName: "Kaos Polos", price: 75000, quantity: 1 },
            { productId: getP("Topi Baseball").id, productName: "Topi Baseball", price: 45000, quantity: 1 },
          ],
        },
        statusHistory: { create: { status: "SEDANG_DIKEMAS", note: "Pesanan dibuat" } },
      },
    });
    await prisma.deliveryJob.create({
      data: { orderId: order1.id, status: "AVAILABLE" },
    });

    // Order 2: Sudah Selesai (completed flow)
    const order2 = await prisma.order.create({
      data: {
        buyerId: buyerProfile.id,
        sellerId: sellerUser.id,
        storeId: store.id,
        subtotal: 150000,
        discountAmount: 15000,
        deliveryFee: 15000,
        ppn: 18000,
        finalTotal: 168000,
        deliveryMethod: "REGULAR",
        status: "PESANAN_SELESAI",
        items: {
          create: [
            { productId: getP("Celana Jeans").id, productName: "Celana Jeans", price: 150000, quantity: 1 },
          ],
        },
        statusHistory: {
          create: [
            { status: "SEDANG_DIKEMAS", note: "Pesanan dibuat" },
            { status: "MENUNGGU_PENGIRIM", note: "Pesanan dikemas" },
            { status: "SEDANG_DIKIRIM", note: "Dalam perjalanan" },
            { status: "PESANAN_SELESAI", note: "Pesanan selesai" },
          ],
        },
      },
    });
    await prisma.deliveryJob.create({
      data: { orderId: order2.id, status: "COMPLETED" },
    });

    // Order 3: Menunggu Pengirim (ready for driver)
    const order3 = await prisma.order.create({
      data: {
        buyerId: sellerBuyerProfile.id,
        sellerId: sellerUser.id,
        storeId: store.id,
        subtotal: 430000,
        discountAmount: 20000,
        deliveryFee: 12000,
        ppn: 51600,
        finalTotal: 473600,
        deliveryMethod: "NEXT_DAY",
        status: "MENUNGGU_PENGIRIM",
        items: {
          create: [
            { productId: getP("Tas Ransel").id, productName: "Tas Ransel", price: 200000, quantity: 1 },
            { productId: getP("Sepatu Sneakers").id, productName: "Sepatu Sneakers", price: 250000, quantity: 1 },
          ],
        },
        statusHistory: {
          create: [
            { status: "SEDANG_DIKEMAS", note: "Pesanan dibuat" },
            { status: "MENUNGGU_PENGIRIM", note: "Siap dikirim" },
          ],
        },
      },
    });
    await prisma.deliveryJob.create({
      data: { orderId: order3.id, status: "AVAILABLE" },
    });
  }

  // ── Wallet transactions ──
  if ((await prisma.walletTransaction.count({ where: { buyerId: buyerProfile.id } })) === 0) {
    await prisma.walletTransaction.createMany({
      data: [
        { buyerId: buyerProfile.id, amount: 500000, type: "TOPUP", description: "Top-up awal" },
        { buyerId: buyerProfile.id, amount: 144400, type: "PAYMENT", description: "Pembayaran Order #..." },
      ],
    });
  }

  // ── Reviews ──
  await prisma.applicationReview.createMany({
    data: [
      { reviewerName: "Budi", rating: 5, comment: "Website bagus dan mudah digunakan!" },
      { reviewerName: "Siti", rating: 4, comment: "Produk lengkap, pengiriman cepat" },
      { reviewerName: "Andi", rating: 5, comment: "Suka banget belanja di SEAPEDIA" },
    ],
    skipDuplicates: true,
  });

  // ── Discounts ──
  await prisma.voucher.upsert({
    where: { code: "DISKON10" },
    update: {},
    create: {
      code: "DISKON10", discountType: "PERCENTAGE", discountValue: 10,
      expiryDate: new Date("2027-12-31"), maxUsage: 100, minPurchase: 50000,
    },
  });

  await prisma.promo.upsert({
    where: { code: "MERDEKA" },
    update: {},
    create: {
      code: "MERDEKA", discountType: "FIXED", discountValue: 20000,
      expiryDate: new Date("2027-12-31"), minPurchase: 100000,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
