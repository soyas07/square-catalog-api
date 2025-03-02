-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` VARCHAR(255) NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `item_description` TEXT NULL,
    `item_image` TEXT NULL,
    `location_id` VARCHAR(255) NOT NULL,
    `last_update` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `item_id`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_variations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variation_id` VARCHAR(255) NOT NULL,
    `item_id` VARCHAR(255) NOT NULL,
    `variation_name` VARCHAR(255) NOT NULL,
    `variation_description` TEXT NULL,
    `variation_price` DECIMAL(10, 2) NULL,
    `variation_image` TEXT NULL,
    `last_update` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `variation_id`(`variation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
