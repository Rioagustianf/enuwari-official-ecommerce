/*
  Warnings:

  - A unique constraint covering the columns `[orderId,transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `payments_orderId_transactionId_key` ON `payments`(`orderId`, `transactionId`);
