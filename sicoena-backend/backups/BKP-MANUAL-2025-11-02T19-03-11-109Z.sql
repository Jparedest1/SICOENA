-- MySQL dump 10.13  Distrib 8.4.6, for Win64 (x86_64)
--
-- Host: localhost    Database: sicoena_db
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `sicoena_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sicoena_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sicoena_db`;

--
-- Table structure for table `bodega`
--

DROP TABLE IF EXISTS `bodega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bodega` (
  `id_bodega` int NOT NULL AUTO_INCREMENT,
  `nombre_bodega` varchar(50) DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text,
  `estado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_bodega`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bodega`
--

LOCK TABLES `bodega` WRITE;
/*!40000 ALTER TABLE `bodega` DISABLE KEYS */;
INSERT INTO `bodega` VALUES (1,'Bodega1','2025-10-24 23:36:37','Bodega perecederos','ACTIVO'),(2,'Bodega2','2025-10-30 18:21:13','Bodega no perecederos','ACTIVO');
/*!40000 ALTER TABLE `bodega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id_config` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` longtext,
  `descripcion` varchar(255) DEFAULT NULL,
  `tipo` enum('string','number','boolean','json') DEFAULT 'string',
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `actualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_config`),
  UNIQUE KEY `clave` (`clave`),
  KEY `actualizado_por` (`actualizado_por`),
  KEY `idx_clave` (`clave`),
  CONSTRAINT `configuracion_sistema_ibfk_1` FOREIGN KEY (`actualizado_por`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'empresa_nombre','SICOENA','Nombre de la empresa','string','2025-10-28 00:08:29',3),(2,'empresa_nit','58789567','NIT de la empresa','string','2025-10-28 00:08:29',3),(3,'empresa_direccion','','Dirección de la empresa','string','2025-10-28 00:08:29',3),(4,'empresa_telefono','','Teléfono de contacto','string','2025-10-28 00:08:29',3),(5,'empresa_email','','Email de contacto','string','2025-10-28 00:08:29',3),(6,'sistema_moneda','Q','Moneda predeterminada','string','2025-10-28 00:06:06',NULL),(7,'sistema_idioma','es','Idioma del sistema','string','2025-10-28 00:06:06',NULL),(8,'sistema_backup_frecuencia','diario','Frecuencia de respaldo','string','2025-10-28 00:06:06',NULL),(9,'sistema_notificaciones','1','Habilitar notificaciones','boolean','2025-10-28 00:06:06',NULL),(10,'seguridad_session_timeout','30','Tiempo de sesión en minutos','number','2025-10-28 00:06:06',NULL),(11,'seguridad_password_expiry','90','Expiración de contraseña en días','number','2025-10-28 00:06:06',NULL),(12,'seguridad_two_factor','0','Habilitar 2FA','boolean','2025-10-28 00:06:06',NULL),(13,'email_smtp_server','','Servidor SMTP','string','2025-10-28 00:06:06',NULL),(14,'email_smtp_port','587','Puerto SMTP','number','2025-10-28 00:06:06',NULL),(15,'email_smtp_user','','Usuario SMTP','string','2025-10-28 00:06:06',NULL),(16,'email_smtp_password','','Contraseña SMTP','string','2025-10-28 00:06:06',NULL),(17,'email_from','','Email remitente','string','2025-10-28 00:06:06',NULL);
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrega`
--

DROP TABLE IF EXISTS `entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrega` (
  `id_entrega` int NOT NULL AUTO_INCREMENT,
  `id_orden` int DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Pendiente',
  `nombre_receptor` varchar(150) DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`id_entrega`),
  KEY `id_orden` (`id_orden`),
  CONSTRAINT `entrega_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrega`
--

LOCK TABLES `entrega` WRITE;
/*!40000 ALTER TABLE `entrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `entrega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escuela`
--

DROP TABLE IF EXISTS `escuela`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escuela` (
  `id_escuela` int NOT NULL AUTO_INCREMENT,
  `codigo_escuela` varchar(50) NOT NULL,
  `nombre_escuela` varchar(255) NOT NULL,
  `direccion` text,
  `municipio` text,
  `departamento` text,
  `telefono` int DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `director` varchar(150) DEFAULT NULL,
  `cantidad_estudiantes` int DEFAULT NULL,
  `observaciones` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_escuela`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escuela`
--

LOCK TABLES `escuela` WRITE;
/*!40000 ALTER TABLE `escuela` DISABLE KEYS */;
INSERT INTO `escuela` VALUES (1,'1234','Escuela No.1','Zona 5','Sumpango','Sacatepéquez',58456875,NULL,'Juan Perez',0,'La mas grande','ACTIVA'),(2,'02-13-25-2254','Escuela Bilingüe','Zona 5','Sumpango','Sacatepéquez',58865846,'escuela_bilingueSUM@gmail.com','Leonardo Díaz',0,NULL,'ACTIVA');
/*!40000 ALTER TABLE `escuela` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id_menu` int NOT NULL AUTO_INCREMENT,
  `numero` int NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text,
  `estado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_menu`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,1,'MENÚ 1','Según lineamiento PDF','ACTIVO'),(2,2,'MENÚ 2','Menú principal: Refresco de limonada, fideos con carne molida y vegetales y 1 tortilla. Menú complemento: Piña','ACTIVO');
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_producto`
--

DROP TABLE IF EXISTS `menu_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_producto` (
  `id_menu_producto` int NOT NULL AUTO_INCREMENT,
  `id_menu` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_menu_producto`),
  UNIQUE KEY `unique_menu_producto` (`id_menu`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `menu_producto_ibfk_1` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE,
  CONSTRAINT `menu_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_producto`
--

LOCK TABLES `menu_producto` WRITE;
/*!40000 ALTER TABLE `menu_producto` DISABLE KEYS */;
INSERT INTO `menu_producto` VALUES (25,1,21,1.50,'libras'),(26,1,68,1.50,'libras'),(27,1,48,1.00,'gusto'),(28,1,49,1.00,'gusto'),(29,1,46,1.00,'gusto'),(30,1,69,10.00,'litros'),(31,1,74,5.00,'libras'),(32,1,35,2.00,'unidades'),(33,1,30,6.00,'unidades'),(34,1,27,1.00,'libra'),(35,1,28,0.50,'libra'),(36,1,29,2.00,'unidades'),(37,1,34,1.00,'libra'),(38,1,56,2.50,'libras'),(39,1,51,4.00,'cucharadas'),(40,1,43,3.00,'dientes'),(41,1,44,1.00,'gusto'),(42,1,40,0.50,'manojo'),(43,1,67,1.00,'taza'),(44,1,12,8.00,'unidades'),(45,1,26,8.00,'unidades'),(46,1,64,1.00,'unidad'),(47,2,78,15.00,'vaso'),(48,2,68,1.50,'libra'),(49,2,91,1.50,'libra'),(51,2,92,10.00,'litro'),(52,2,12,15.00,'unidad'),(53,2,90,15.00,'unidad'),(55,2,62,8.00,'paquete'),(56,2,95,8.00,'paquete'),(58,2,80,3.00,'libra'),(59,2,81,1.00,'paquete'),(60,2,61,8.00,'paquete'),(61,2,79,8.00,'paquete'),(63,2,30,2.00,'unidad'),(64,2,86,2.00,'unidad'),(66,2,82,2.00,'unidad'),(67,2,27,4.50,'libra'),(68,2,83,4.50,'libra'),(70,2,28,0.50,'libra'),(71,2,84,0.50,'libra'),(73,2,51,4.00,'cucharada'),(74,2,89,4.00,'cucharada'),(76,2,43,3.00,'diente'),(77,2,85,3.00,'diente'),(79,2,87,0.50,'manojo'),(80,2,67,1.00,'litro'),(81,2,88,1.00,'litro'),(83,2,93,40.00,'unidad'),(84,2,21,4.00,'unidad'),(85,2,94,4.00,'unidad');
/*!40000 ALTER TABLE `menu_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento`
--

DROP TABLE IF EXISTS `movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `tipo_movimiento` enum('ENTRADA','SALIDA') NOT NULL,
  `cantidad` int NOT NULL,
  `monto` decimal(10,2) DEFAULT '0.00',
  `descripcion` text,
  `fecha_movimiento` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_producto` (`id_producto`),
  KEY `idx_fecha` (`fecha_movimiento`),
  KEY `idx_tipo` (`tipo_movimiento`),
  CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento`
--

LOCK TABLES `movimiento` WRITE;
/*!40000 ALTER TABLE `movimiento` DISABLE KEYS */;
INSERT INTO `movimiento` VALUES (4,67,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(5,26,'SALIDA',8,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(6,43,'SALIDA',3,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(7,56,'SALIDA',3,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(8,68,'SALIDA',2,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(9,48,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(10,28,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(11,40,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(12,49,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(13,35,'SALIDA',2,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(14,44,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(15,12,'SALIDA',8,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(16,34,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(17,74,'SALIDA',5,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(18,46,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(19,29,'SALIDA',2,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(20,21,'SALIDA',2,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(21,51,'SALIDA',4,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(22,27,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(23,64,'SALIDA',1,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(24,30,'SALIDA',6,0.00,'Salida por orden ORD-2025-889','2025-10-31 15:17:04'),(25,73,'ENTRADA',1500,0.00,'ENTRADA por ajuste de inventario (0 → 1500)','2025-10-31 15:24:04'),(26,72,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:46:29'),(27,71,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:46:44'),(28,70,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:47:22'),(29,69,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:47:53'),(30,68,'ENTRADA',202,0.00,'ENTRADA por ajuste de inventario (-2 → 200)','2025-10-31 15:48:19'),(31,67,'ENTRADA',201,0.00,'ENTRADA por ajuste de inventario (-1 → 200)','2025-10-31 15:48:32'),(32,66,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:48:59'),(33,65,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:49:17'),(34,64,'ENTRADA',201,0.00,'ENTRADA por ajuste de inventario (-1 → 200)','2025-10-31 15:49:49'),(35,63,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:50:06'),(36,62,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:50:34'),(37,61,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:50:56'),(38,60,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 15:51:12'),(39,59,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:51:30'),(40,58,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:52:09'),(41,57,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 15:59:59'),(42,56,'ENTRADA',502,0.00,'ENTRADA por ajuste de inventario (-2 → 500)','2025-10-31 16:00:15'),(43,55,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:00:29'),(44,54,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:00:57'),(45,53,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:01:10'),(46,52,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:01:22'),(47,51,'ENTRADA',504,0.00,'ENTRADA por ajuste de inventario (-4 → 500)','2025-10-31 16:01:37'),(48,50,'ENTRADA',300,0.00,'ENTRADA por ajuste de inventario (0 → 300)','2025-10-31 16:01:51'),(49,49,'ENTRADA',101,0.00,'ENTRADA por ajuste de inventario (-1 → 100)','2025-10-31 16:02:08'),(50,48,'ENTRADA',201,0.00,'ENTRADA por ajuste de inventario (-1 → 200)','2025-10-31 16:02:34'),(51,47,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:02:45'),(52,46,'ENTRADA',501,0.00,'ENTRADA por ajuste de inventario (-1 → 500)','2025-10-31 16:02:54'),(53,45,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:03:05'),(54,44,'ENTRADA',501,0.00,'ENTRADA por ajuste de inventario (-1 → 500)','2025-10-31 16:03:16'),(55,43,'ENTRADA',203,0.00,'ENTRADA por ajuste de inventario (-3 → 200)','2025-10-31 16:03:35'),(56,42,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:03:52'),(57,41,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:04:07'),(58,40,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:04:16'),(59,39,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:04:34'),(60,38,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:04:44'),(61,37,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:04:55'),(62,36,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:05:03'),(63,35,'ENTRADA',202,0.00,'ENTRADA por ajuste de inventario (-2 → 200)','2025-10-31 16:05:17'),(64,34,'ENTRADA',201,0.00,'ENTRADA por ajuste de inventario (-1 → 200)','2025-10-31 16:05:29'),(65,33,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:05:38'),(66,32,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:05:53'),(67,31,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:06:02'),(68,30,'ENTRADA',206,0.00,'ENTRADA por ajuste de inventario (-6 → 200)','2025-10-31 16:06:22'),(69,29,'ENTRADA',202,0.00,'ENTRADA por ajuste de inventario (-2 → 200)','2025-10-31 16:06:34'),(70,28,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:06:46'),(71,27,'ENTRADA',201,0.00,'ENTRADA por ajuste de inventario (-1 → 200)','2025-10-31 16:06:59'),(72,26,'ENTRADA',208,0.00,'ENTRADA por ajuste de inventario (-8 → 200)','2025-10-31 16:07:09'),(73,25,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:07:19'),(74,24,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:07:34'),(75,23,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:07:50'),(76,22,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:08:01'),(77,21,'ENTRADA',202,0.00,'ENTRADA por ajuste de inventario (-2 → 200)','2025-10-31 16:08:10'),(78,20,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:08:23'),(79,19,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:08:32'),(80,18,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:08:44'),(81,17,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:08:59'),(82,16,'ENTRADA',500,0.00,'ENTRADA por ajuste de inventario (0 → 500)','2025-10-31 16:09:08'),(83,15,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:09:30'),(84,14,'ENTRADA',200,0.00,'ENTRADA por ajuste de inventario (0 → 200)','2025-10-31 16:09:46'),(85,13,'ENTRADA',100,0.00,'ENTRADA por ajuste de inventario (0 → 100)','2025-10-31 16:10:01'),(86,12,'ENTRADA',508,0.00,'ENTRADA por ajuste de inventario (-8 → 500)','2025-10-31 16:10:11'),(87,74,'ENTRADA',105,0.00,'ENTRADA por ajuste de inventario (95 → 200)','2025-10-31 16:10:41'),(88,67,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(89,26,'SALIDA',8,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(90,43,'SALIDA',3,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(91,56,'SALIDA',3,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(92,68,'SALIDA',2,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(93,48,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(94,28,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(95,40,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(96,49,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(97,35,'SALIDA',2,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(98,44,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(99,12,'SALIDA',8,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(100,34,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(101,74,'SALIDA',5,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(102,46,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(103,29,'SALIDA',2,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(104,21,'SALIDA',2,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(105,51,'SALIDA',4,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(106,27,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(107,64,'SALIDA',1,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(108,30,'SALIDA',6,0.00,'Salida por orden ORD-2025-478','2025-10-31 16:25:44'),(109,67,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(110,69,'SALIDA',10,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(111,26,'SALIDA',8,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(112,43,'SALIDA',3,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(113,56,'SALIDA',3,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(114,68,'SALIDA',2,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(115,48,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(116,28,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(117,40,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(118,49,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(119,35,'SALIDA',2,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(120,44,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(121,12,'SALIDA',8,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(122,34,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(123,74,'SALIDA',5,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(124,46,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(125,29,'SALIDA',2,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(126,21,'SALIDA',2,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(127,51,'SALIDA',4,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(128,27,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(129,64,'SALIDA',1,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(130,30,'SALIDA',6,0.00,'Salida por orden ORD-2025-739','2025-10-31 16:47:53'),(131,67,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(132,69,'SALIDA',10,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(133,26,'SALIDA',8,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(134,43,'SALIDA',3,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(135,56,'SALIDA',3,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(136,68,'SALIDA',2,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(137,48,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(138,28,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(139,40,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(140,49,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(141,35,'SALIDA',2,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(142,44,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(143,12,'SALIDA',8,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(144,34,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(145,74,'SALIDA',5,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(146,46,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(147,29,'SALIDA',2,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(148,21,'SALIDA',2,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(149,51,'SALIDA',4,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(150,27,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(151,64,'SALIDA',1,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(152,30,'SALIDA',6,0.00,'Salida por orden ORD-2025-40','2025-10-31 17:21:46'),(153,67,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(154,88,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(155,92,'SALIDA',10,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(156,43,'SALIDA',3,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(157,85,'SALIDA',3,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(158,87,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(159,68,'SALIDA',2,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(160,91,'SALIDA',2,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(161,80,'SALIDA',3,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(162,81,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(163,28,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(164,84,'SALIDA',1,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(165,82,'SALIDA',2,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(166,62,'SALIDA',8,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(167,95,'SALIDA',8,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(168,61,'SALIDA',8,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(169,79,'SALIDA',8,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(170,12,'SALIDA',15,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:22'),(171,90,'SALIDA',15,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(172,78,'SALIDA',15,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(173,21,'SALIDA',4,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(174,94,'SALIDA',4,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(175,51,'SALIDA',4,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(176,89,'SALIDA',4,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(177,27,'SALIDA',5,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(178,83,'SALIDA',5,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(179,93,'SALIDA',40,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(180,30,'SALIDA',2,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(181,86,'SALIDA',2,0.00,'Salida por orden ORD-2025-738','2025-10-31 17:34:23'),(182,95,'ENTRADA',58,0.00,'ENTRADA por ajuste de inventario (42 → 100)','2025-11-01 00:50:30'),(183,95,'SALIDA',55,0.00,'SALIDA por ajuste de inventario (100 → 45)','2025-11-01 01:04:22');
/*!40000 ALTER TABLE `movimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_bodega`
--

DROP TABLE IF EXISTS `movimiento_bodega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_bodega` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_producto` int DEFAULT NULL,
  `id_orden` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `tipo_movimiento` varchar(50) NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int DEFAULT NULL,
  `stock_nuevo` int DEFAULT NULL,
  `fecha_mov` datetime DEFAULT CURRENT_TIMESTAMP,
  `motivo` text,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_producto` (`id_producto`),
  KEY `id_orden` (`id_orden`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `movimiento_bodega_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `movimiento_bodega_ibfk_2` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`),
  CONSTRAINT `movimiento_bodega_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_bodega`
--

LOCK TABLES `movimiento_bodega` WRITE;
/*!40000 ALTER TABLE `movimiento_bodega` DISABLE KEYS */;
