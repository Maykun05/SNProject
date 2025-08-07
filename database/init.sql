CREATE USER healthapp_user WITH PASSWORD 'securepassword';
CREATE DATABASE healthapp_db OWNER healthapp_user;
GRANT ALL PRIVILEGES ON DATABASE healthapp_db TO healthapp_user;