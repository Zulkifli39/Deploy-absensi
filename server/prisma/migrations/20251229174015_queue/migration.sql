/*
  Warnings:

  - You are about to drop the `overtime_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `overtime_request` DROP FOREIGN KEY `overtime_request_approved_by_fkey`;

-- DropForeignKey
ALTER TABLE `overtime_request` DROP FOREIGN KEY `overtime_request_department_id_fkey`;

-- DropForeignKey
ALTER TABLE `overtime_request` DROP FOREIGN KEY `overtime_request_user_id_fkey`;

-- DropTable
DROP TABLE `overtime_request`;

-- CreateTable
CREATE TABLE `overtime_requests` (
    `overtime_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `total_minutes` INTEGER NOT NULL,
    `start_photo` VARCHAR(191) NULL,
    `end_photo` VARCHAR(191) NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `overtime_requests_user_id_start_time_idx`(`user_id`, `start_time`),
    INDEX `overtime_requests_department_id_idx`(`department_id`),
    INDEX `overtime_requests_status_idx`(`status`),
    PRIMARY KEY (`overtime_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `overtime_requests` ADD CONSTRAINT `overtime_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtime_requests` ADD CONSTRAINT `overtime_requests_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtime_requests` ADD CONSTRAINT `overtime_requests_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
