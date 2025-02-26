-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` VARCHAR(36) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `category_description` TEXT NULL,
    `last_update` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `category_id`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` VARCHAR(36) NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `item_description` TEXT NULL,
    `item_price` DECIMAL(10, 2) NOT NULL,
    `item_main_image` VARCHAR(255) NULL,
    `category_id` VARCHAR(36) NULL,
    `last_update` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `item_id`(`item_id`),
    INDEX `category_id`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE RESTRICT;
