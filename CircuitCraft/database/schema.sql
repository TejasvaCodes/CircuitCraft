CREATE DATABASE IF NOT EXISTS circuitcraft
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE circuitcraft;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  status ENUM('draft', 'planning', 'building', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE components (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  manufacturer VARCHAR(180) NOT NULL,
  manufacturer_part_number VARCHAR(180) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  source_provider VARCHAR(80) NOT NULL,
  provider_part_id VARCHAR(180),
  last_synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_manufacturer_mpn (manufacturer, manufacturer_part_number)
);

CREATE TABLE component_offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  component_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(80) NOT NULL,
  distributor_name VARCHAR(180),
  currency CHAR(3),
  unit_price DECIMAL(12, 4),
  stock_quantity BIGINT,
  product_url TEXT,
  provider_updated_at DATETIME NULL,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_offers_component FOREIGN KEY (component_id) REFERENCES components(id),
  INDEX idx_offers_component_provider (component_id, provider)
);

CREATE TABLE component_specs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  component_id BIGINT UNSIGNED NOT NULL,
  spec_name VARCHAR(120) NOT NULL,
  spec_value VARCHAR(255),
  spec_unit VARCHAR(40),
  CONSTRAINT fk_specs_component FOREIGN KEY (component_id) REFERENCES components(id),
  INDEX idx_specs_component_name (component_id, spec_name)
);

CREATE TABLE inventory (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  component_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  storage_location VARCHAR(180),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_inventory_component FOREIGN KEY (component_id) REFERENCES components(id),
  UNIQUE KEY uq_user_component (user_id, component_id)
);

CREATE TABLE bom_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  component_id BIGINT UNSIGNED NULL,
  requested_description VARCHAR(255),
  quantity_required INT UNSIGNED NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bom_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_bom_component FOREIGN KEY (component_id) REFERENCES components(id)
);
