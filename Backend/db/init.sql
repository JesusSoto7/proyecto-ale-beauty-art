CREATE DATABASE IF NOT EXISTS tienda_maquillaje_db_development;
CREATE DATABASE IF NOT EXISTS tienda_maquillaje_db_test;
GRANT ALL PRIVILEGES ON tienda_maquillaje_db_development.* TO 'userproy'@'%';
GRANT ALL PRIVILEGES ON tienda_maquillaje_db_test.* TO 'userproy'@'%';
FLUSH PRIVILEGES;