-- CreateEnum
CREATE TYPE "PrintSide" AS ENUM ('NONE', 'FRONT', 'BACK', 'BOTH');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('ANIME', 'GAMING', 'GOTHIC', 'STREETWEAR', 'MINIMAL', 'VINTAGE', 'COUPLE', 'FUNNY', 'MEME', 'MUSIC', 'SPORT', 'KIDS', 'TRENDING');

-- DropIndex
DROP INDEX "CartItem_cartId_variantId_key";

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "excerpt" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "BusinessRequest" ADD COLUMN     "contactName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dueDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "printType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "quoteAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "designId" TEXT,
ADD COLUMN     "dtfSheetId" TEXT,
ADD COLUMN     "printFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "printSide" "PrintSide" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "DTFDesign" ADD COLUMN     "height" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "label" TEXT NOT NULL DEFAULT 'Tasarım',
ADD COLUMN     "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "y" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DTFOrder" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DTFSheet" ADD COLUMN     "heightCm" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "placement" JSONB,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "widthCm" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Design" ADD COLUMN     "backJson" JSONB,
ADD COLUMN     "frontJson" JSONB,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "printHeightCm" DOUBLE PRECISION NOT NULL DEFAULT 40,
ADD COLUMN     "printWidthCm" DOUBLE PRECISION NOT NULL DEFAULT 35,
ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "designSnapshot" JSONB,
ADD COLUMN     "dtfSheetId" TEXT,
ADD COLUMN     "printFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "printFileUrl" TEXT,
ADD COLUMN     "printSide" "PrintSide" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'page';

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "designId" TEXT,
    "title" TEXT NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_dtfSheetId_fkey" FOREIGN KEY ("dtfSheetId") REFERENCES "DTFSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
