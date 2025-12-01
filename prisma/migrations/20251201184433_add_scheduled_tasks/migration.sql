-- CreateTable
CREATE TABLE `ScheduledTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `handlerName` VARCHAR(191) NOT NULL,
    `cronExpression` VARCHAR(191) NULL,
    `scheduleType` ENUM('CRON', 'INTERVAL', 'ONCE') NOT NULL,
    `intervalValue` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `maxRetries` INTEGER NOT NULL DEFAULT 3,
    `retryDelay` INTEGER NOT NULL DEFAULT 60,
    `payload` JSON NULL,
    `config` JSON NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskExecution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `status` ENUM('RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `result` JSON NULL,
    `error` TEXT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduledTask` ADD CONSTRAINT `ScheduledTask_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskExecution` ADD CONSTRAINT `TaskExecution_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `ScheduledTask`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
