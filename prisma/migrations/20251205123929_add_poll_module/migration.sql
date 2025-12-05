-- AlterTable
ALTER TABLE `file` MODIFY `category` ENUM('EXPENSE', 'ANNOUNCEMENT', 'CONTRACT', 'GENERAL', 'REPORT', 'INVOICE', 'POLL') NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE `Poll` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `siteId` INTEGER NULL,
    `createdById` INTEGER NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `resultVisibility` ENUM('PUBLIC', 'PRIVATE', 'AFTER_CLOSED') NOT NULL DEFAULT 'AFTER_CLOSED',
    `responseEditable` ENUM('ALWAYS', 'UNTIL_CLOSED', 'NEVER') NOT NULL DEFAULT 'UNTIL_CLOSED',
    `targetAudience` ENUM('ALL', 'SITE', 'BLOCKS', 'UNITS', 'USERS') NOT NULL DEFAULT 'ALL',
    `targetIds` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `updatedById` INTEGER NULL,
    `deletedById` INTEGER NULL,

    INDEX `Poll_status_idx`(`status`),
    INDEX `Poll_siteId_idx`(`siteId`),
    INDEX `Poll_createdById_idx`(`createdById`),
    INDEX `Poll_startDate_idx`(`startDate`),
    INDEX `Poll_endDate_idx`(`endDate`),
    INDEX `Poll_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pollId` INTEGER NOT NULL,
    `questionText` TEXT NOT NULL,
    `questionType` ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'DATE') NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PollQuestion_pollId_idx`(`pollId`),
    INDEX `PollQuestion_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `optionText` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PollOption_questionId_idx`(`questionId`),
    INDEX `PollOption_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pollId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PollResponse_pollId_idx`(`pollId`),
    INDEX `PollResponse_userId_idx`(`userId`),
    UNIQUE INDEX `PollResponse_pollId_userId_key`(`pollId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollResponseAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `responseId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `answerText` TEXT NULL,
    `answerNumber` DECIMAL(10, 2) NULL,
    `answerDate` DATETIME(3) NULL,
    `selectedOptionIds` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PollResponseAnswer_responseId_idx`(`responseId`),
    INDEX `PollResponseAnswer_questionId_idx`(`questionId`),
    UNIQUE INDEX `PollResponseAnswer_responseId_questionId_key`(`responseId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Poll` ADD CONSTRAINT `Poll_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Poll` ADD CONSTRAINT `Poll_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollQuestion` ADD CONSTRAINT `PollQuestion_pollId_fkey` FOREIGN KEY (`pollId`) REFERENCES `Poll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollOption` ADD CONSTRAINT `PollOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `PollQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollResponse` ADD CONSTRAINT `PollResponse_pollId_fkey` FOREIGN KEY (`pollId`) REFERENCES `Poll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollResponse` ADD CONSTRAINT `PollResponse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollResponseAnswer` ADD CONSTRAINT `PollResponseAnswer_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `PollResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PollResponseAnswer` ADD CONSTRAINT `PollResponseAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `PollQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
