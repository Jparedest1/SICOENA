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
/*!40000 ALTER TABLE `movimiento_bodega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_notificaciones_usuario` (`id_usuario`,`leida`,`fecha_creacion` DESC),
  CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (1,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 07:28:54','2025-11-01 18:30:50'),(3,3,'Nuevo usuario registrado','El usuario \"Agusto Solis \" (agustosolis@gmail.com) ha sido registrado en el sistema.','usuario',1,'2025-11-01 07:39:17','2025-11-01 18:30:50'),(5,7,'Nuevo usuario registrado','El usuario \"Agusto Solis \" (agustosolis@gmail.com) ha sido registrado en el sistema.','usuario',0,'2025-11-01 07:39:17',NULL),(6,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 18:18:48','2025-11-01 18:30:50'),(8,7,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 18:18:48',NULL),(9,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 18:32:55','2025-11-02 01:18:53'),(10,3,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 19:13:01','2025-11-02 01:18:53'),(11,7,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 19:13:01',NULL),(12,3,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 19:27:15','2025-11-02 01:18:53'),(13,7,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 19:27:15',NULL),(14,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 21:33:10','2025-11-02 01:18:53'),(15,7,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 21:33:10',NULL),(16,3,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 21:33:10','2025-11-02 01:18:53'),(17,7,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 21:33:10',NULL),(18,3,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',1,'2025-11-01 21:33:10','2025-11-02 01:18:53'),(19,7,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',0,'2025-11-01 21:33:10',NULL),(20,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 00:29:34','2025-11-02 01:18:53'),(21,7,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 00:29:34',NULL),(22,3,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 00:29:34','2025-11-02 01:18:53'),(23,7,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 00:29:34',NULL),(24,3,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 00:29:34','2025-11-02 01:18:53'),(25,7,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 00:29:34',NULL),(26,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 01:27:41','2025-11-02 02:01:19'),(27,3,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 01:27:41','2025-11-02 02:01:19'),(28,3,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',1,'2025-11-02 01:27:41','2025-11-02 02:01:19'),(29,3,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL),(30,7,'⚠️ Stock bajo: Espagueti','El producto \"Espagueti\" tiene 45 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL),(31,3,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL),(32,7,'⚠️ Stock bajo: Piña','El producto \"Piña\" tiene 26 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL),(33,3,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL),(34,7,'⚠️ Stock bajo: Zanahoria','El producto \"Zanahoria\" tiene 38 unidades en stock (mínimo: 50)','stock',0,'2025-11-02 16:39:27',NULL);
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden`
--

DROP TABLE IF EXISTS `orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden` (
  `id_orden` int NOT NULL AUTO_INCREMENT,
  `id_escuela` int DEFAULT NULL,
  `id_menu` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `cantidad_alumnos` int DEFAULT NULL,
  `dias_duracion` int DEFAULT NULL,
  `codigo_orden` varchar(50) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_entrega_programada` date DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Pendiente',
  `valor_total` decimal(10,2) DEFAULT NULL,
  `observaciones` text,
  `fecha_modificacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_orden`),
  KEY `id_escuela` (`id_escuela`),
  KEY `id_usuario` (`id_usuario`),
  KEY `fk_orden_menu` (`id_menu`),
  CONSTRAINT `fk_orden_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`),
  CONSTRAINT `orden_ibfk_1` FOREIGN KEY (`id_escuela`) REFERENCES `escuela` (`id_escuela`),
  CONSTRAINT `orden_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden`
--

LOCK TABLES `orden` WRITE;
/*!40000 ALTER TABLE `orden` DISABLE KEYS */;
INSERT INTO `orden` VALUES (4,1,1,4,50,30,'ORD-2025-478','2025-10-31 23:55:19',NULL,'2025-10-31','CANCELADO',309000.00,NULL,NULL),(5,1,1,4,20,15,'ORD-2025-739','2025-10-31 23:55:14',NULL,'2025-10-31','ENTREGADO',64800.00,NULL,NULL),(6,1,1,3,1,1,'ORD-2025-40','2025-11-01 00:59:11',NULL,'2025-10-31','ENTREGADO',216.00,NULL,NULL),(7,1,2,4,20,10,'ORD-2025-738','2025-11-01 01:03:15',NULL,'2025-10-23','ENTREGADO',70420.00,NULL,NULL);
/*!40000 ALTER TABLE `orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_producto`
--

DROP TABLE IF EXISTS `orden_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_producto` (
  `id_orden_producto` int NOT NULL AUTO_INCREMENT,
  `id_orden` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_orden_producto`),
  KEY `id_orden` (`id_orden`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `orden_producto_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`) ON DELETE CASCADE,
  CONSTRAINT `orden_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_producto`
--

LOCK TABLES `orden_producto` WRITE;
/*!40000 ALTER TABLE `orden_producto` DISABLE KEYS */;
INSERT INTO `orden_producto` VALUES (64,4,67,1.00,'taza'),(65,4,26,8.00,'unidades'),(66,4,43,3.00,'dientes'),(67,4,56,2.50,'libras'),(68,4,68,1.50,'libras'),(69,4,48,1.00,'gusto'),(70,4,28,0.50,'libra'),(71,4,40,0.50,'manojo'),(72,4,49,1.00,'gusto'),(73,4,35,2.00,'unidades'),(74,4,44,1.00,'gusto'),(75,4,12,8.00,'unidades'),(76,4,34,1.00,'libra'),(77,4,74,5.00,'libras'),(78,4,46,1.00,'gusto'),(79,4,29,2.00,'unidades'),(80,4,21,1.50,'libras'),(81,4,51,4.00,'cucharadas'),(82,4,27,1.00,'libra'),(83,4,64,1.00,'unidad'),(84,4,30,6.00,'unidades'),(85,5,67,1.00,'taza'),(86,5,69,10.00,'litros'),(87,5,26,8.00,'unidades'),(88,5,43,3.00,'dientes'),(89,5,56,2.50,'libras'),(90,5,68,1.50,'libras'),(91,5,48,1.00,'gusto'),(92,5,28,0.50,'libra'),(93,5,40,0.50,'manojo'),(94,5,49,1.00,'gusto'),(95,5,35,2.00,'unidades'),(96,5,44,1.00,'gusto'),(97,5,12,8.00,'unidades'),(98,5,34,1.00,'libra'),(99,5,74,5.00,'libras'),(100,5,46,1.00,'gusto'),(101,5,29,2.00,'unidades'),(102,5,21,1.50,'libras'),(103,5,51,4.00,'cucharadas'),(104,5,27,1.00,'libra'),(105,5,64,1.00,'unidad'),(106,5,30,6.00,'unidades'),(107,6,67,1.00,'Litro'),(108,6,69,10.00,'Litro'),(109,6,26,8.00,'Unidad'),(110,6,43,3.00,'Unidad'),(111,6,56,2.50,'Libra'),(112,6,68,1.50,'Libra'),(113,6,48,1.00,'Manojo'),(114,6,28,0.50,'Libra'),(115,6,40,0.50,'Manojo'),(116,6,49,1.00,'Libra'),(117,6,35,2.00,'Libra'),(118,6,44,1.00,'Manojo'),(119,6,12,8.00,'Unidad'),(120,6,34,1.00,'Libra'),(121,6,74,5.00,'Libra'),(122,6,46,1.00,'Libra'),(123,6,29,2.00,'Unidad'),(124,6,21,1.50,'Unidad'),(125,6,51,4.00,'Libra'),(126,6,27,1.00,'Libra'),(127,6,64,1.00,'Unidad'),(128,6,30,6.00,'Unidad'),(129,7,67,1.00,'Litro'),(130,7,88,1.00,'Litro'),(131,7,92,10.00,'Litro'),(132,7,43,3.00,'Unidad'),(133,7,85,3.00,'Diente'),(134,7,87,0.50,'Manojo'),(135,7,68,1.50,'Libra'),(136,7,91,1.50,'Libra'),(137,7,80,3.00,'Libra'),(138,7,81,1.00,'Unidad'),(139,7,28,0.50,'Libra'),(140,7,84,0.50,'Libra'),(141,7,82,2.00,'Unidad'),(142,7,62,8.00,'Bolsa'),(143,7,95,8.00,'Paquete'),(144,7,61,8.00,'Bolsa'),(145,7,79,8.00,'Libra'),(146,7,12,15.00,'Unidad'),(147,7,90,15.00,'Unidad'),(148,7,78,15.00,'Litro'),(149,7,21,4.00,'Unidad'),(150,7,94,4.00,'Unidad'),(151,7,51,4.00,'Libra'),(152,7,89,4.00,'Kilogramo'),(153,7,27,4.50,'Libra'),(154,7,83,4.50,'Libra'),(155,7,93,40.00,'Unidad'),(156,7,30,2.00,'Unidad'),(157,7,86,2.00,'Unidad');
/*!40000 ALTER TABLE `orden_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int DEFAULT NULL,
  `id_bodega` int DEFAULT NULL,
  `nombre_producto` varchar(255) NOT NULL,
  `descripcion` text,
  `categoria` varchar(100) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `stock_disponible` int DEFAULT '0',
  `stock_minimo` int DEFAULT '0',
  `perecedero` tinyint(1) DEFAULT '0',
  `fecha_vencimiento` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_bodega` (`id_bodega`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_bodega`) REFERENCES `bodega` (`id_bodega`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (12,1,1,'Limón','Fruta fresca','Fruta','Unidad',0.50,461,100,1,NULL,'ACTIVO'),(13,1,1,'Jocote marañón','Fruta fresca','Fruta','Libra',7.00,100,25,1,NULL,'ACTIVO'),(14,1,1,'Mango','Fruta fresca','Fruta','Unidad',3.00,200,50,1,NULL,'ACTIVO'),(15,1,1,'Zapote','Fruta fresca','Fruta','Unidad',3.00,200,50,1,NULL,'ACTIVO'),(16,1,1,'Manzana','Fruta fresca','Fruta','Unidad',3.00,500,100,1,NULL,'ACTIVO'),(17,1,1,'Carambola','Fruta fresca','Fruta','Unidad',2.00,500,100,1,NULL,'ACTIVO'),(18,1,1,'Papaya','Fruta fresca','Fruta','Unidad',17.00,200,50,1,NULL,'ACTIVO'),(19,1,1,'Mora','Fruta fresca','Fruta','Libra',5.00,200,50,1,NULL,'ACTIVO'),(20,1,1,'Naranja','Fruta fresca','Fruta','Unidad',4.00,500,100,1,NULL,'ACTIVO'),(21,1,1,'Piña','Fruta fresca','Fruta','Unidad',15.00,190,50,1,NULL,'ACTIVO'),(22,1,1,'Melón','Fruta fresca','Fruta','Unidad',15.00,200,50,1,NULL,'ACTIVO'),(23,1,1,'Sandía','Fruta fresca','Fruta','Unidad',0.17,200,50,1,NULL,'ACTIVO'),(24,1,1,'Banano','Fruta fresca','Fruta','Unidad',1.25,200,50,1,NULL,'ACTIVO'),(25,1,1,'Tamarindo','Fruta fresca','Fruta','Libra',3.00,200,50,1,NULL,'ACTIVO'),(26,1,1,'Aguacate','Fruta fresca','Fruta','Unidad',5.00,176,50,1,NULL,'ACTIVO'),(27,1,1,'Tomate','Verdura fresca','Verdura','Libra',8.00,192,50,1,NULL,'ACTIVO'),(28,1,1,'Cebolla','Verdura fresca','Verdura','Libra',5.00,200,50,1,NULL,'ACTIVO'),(29,1,1,'Pimiento (chile dulce)','Verdura fresca','Verdura','Unidad',1.00,194,50,1,NULL,'ACTIVO'),(30,1,1,'Zanahoria','Verdura fresca','Verdura','Unidad',1.50,180,20,1,NULL,'ACTIVO'),(31,1,1,'Ejote','Verdura fresca','Verdura','Libra',2.00,200,20,1,NULL,'ACTIVO'),(32,1,1,'Repollo','Verdura fresca','Verdura','Unidad',8.00,200,50,1,NULL,'ACTIVO'),(33,1,1,'Remolacha','Verdura fresca','Verdura','Libra',7.00,200,50,1,NULL,'ACTIVO'),(34,1,1,'Papa','Verdura fresca','Verdura','Libra',5.00,197,50,1,NULL,'ACTIVO'),(35,1,1,'Güisquil (chayote)','Verdura fresca','Verdura','Libra',5.00,194,50,1,NULL,'ACTIVO'),(36,1,1,'Apio','Verdura fresca','Verdura','Manojo',1.00,200,50,1,NULL,'ACTIVO'),(37,1,1,'Cebollín','Verdura fresca','Verdura','Libra',5.00,200,50,1,NULL,'ACTIVO'),(38,1,1,'Bledo (hoja)','Verdura de hoja','Verdura','Manojo',0.50,200,50,1,NULL,'ACTIVO'),(39,1,1,'Miltomate (tomatillo)','Verdura fresca','Verdura','Libra',3.00,200,50,1,NULL,'ACTIVO'),(40,1,1,'Cilantro','Hierba fresca','Hierba y especia','Manojo',0.50,200,50,1,NULL,'ACTIVO'),(41,1,1,'Hierbabuena','Hierba fresca','Hierba y especia','Manojo',0.50,200,50,1,NULL,'ACTIVO'),(42,1,1,'Perejil','Hierba fresca','Hierba y especia','Manojo',0.50,200,50,1,NULL,'ACTIVO'),(43,1,1,'Ajo','Bulbo fresco','Hierba y especia','Unidad',1.00,188,50,1,NULL,'ACTIVO'),(44,1,2,'Laurel','Especia seca','Hierba y especia','Manojo',1.00,497,100,0,NULL,'ACTIVO'),(45,1,2,'Tomillo','Especia seca','Hierba y especia','Libra',1.00,500,100,0,NULL,'ACTIVO'),(46,1,2,'Pimienta','Molida','Hierba y especia','Libra',1.00,497,100,0,NULL,'ACTIVO'),(47,1,2,'Pimienta gorda','Grano entero','Hierba y especia','Libra',1.00,500,100,0,NULL,'ACTIVO'),(48,1,2,'Canela','Rama/molida','Hierba y especia','Manojo',3.00,197,50,0,NULL,'ACTIVO'),(49,1,2,'Clavo de olor','Especia seca','Hierba y especia','Libra',1.00,97,25,0,NULL,'ACTIVO'),(50,1,2,'Vinagre','Grado alimenticio','Hierba y especia','Botella',5.00,300,100,0,NULL,'ACTIVO'),(51,1,2,'Sal','Grado alimenticio','Hierba y especia','Libra',1.50,484,100,0,NULL,'ACTIVO'),(52,1,2,'Pepitoria (semilla de ayote molida)','Semilla molida','Semilla y fruto seco','Libra',2.00,200,50,0,NULL,'ACTIVO'),(53,1,2,'Maní (cacahuate)','Fruto seco','Semilla y fruto seco','Libra',5.00,200,50,0,NULL,'ACTIVO'),(54,1,2,'Frijol colorado','Grano seco','Legumbre','Libra',2.00,500,100,0,NULL,'ACTIVO'),(55,1,2,'Frijol negro','Grano seco','Legumbre','Libra',2.00,500,100,0,NULL,'ACTIVO'),(56,1,2,'Arroz blanco','Grano','Cereal y harina','Libra',2.00,494,100,0,NULL,'ACTIVO'),(57,1,2,'Avena en hojuelas','Cereal','Cereal y harina','Bolsa',7.00,500,100,0,NULL,'ACTIVO'),(58,1,2,'Harina fortificada','Para atol','Cereal y harina','Libra',7.00,500,100,0,NULL,'ACTIVO'),(59,1,2,'Harina de haba','Para atol','Cereal y harina','Libra',5.00,500,100,0,NULL,'ACTIVO'),(60,1,2,'Maíz en grano','Grano','Cereal y harina','Libra',7.00,200,50,0,NULL,'ACTIVO'),(61,1,2,'Fideos','Pasta','Pasta','Bolsa',2.00,192,50,0,NULL,'ACTIVO'),(62,1,2,'Espagueti','Pasta','Pasta','Bolsa',1.50,192,50,0,NULL,'ACTIVO'),(63,1,2,'Coditos','Pasta','Pasta','Bolsa',2.00,200,50,0,NULL,'ACTIVO'),(64,1,1,'Tortilla de maíz','Panificado fresco','Panificados','Unidad',0.25,197,50,1,NULL,'ACTIVO'),(65,1,1,'Pan francés','Panificado fresco','Panificados','Unidad',1.00,500,50,1,NULL,'ACTIVO'),(66,1,2,'Tostadas de maíz','Producto seco','Panificados','Unidad',0.50,500,20,0,NULL,'ACTIVO'),(67,1,2,'Aceite vegetal','Grado alimenticio','Básico de despensa','Litro',12.00,196,50,0,NULL,'ACTIVO'),(68,1,2,'Azúcar','Granulada','Básico de despensa','Libra',7.00,192,50,0,NULL,'ACTIVO'),(69,1,2,'Agua pura','Embotellada/garrafón','Bebida','Litro',1.00,480,100,0,NULL,'ACTIVO'),(70,1,2,'Leche en polvo','Lácteo seco','Lácteo','Bolsa',0.00,200,50,0,NULL,'ACTIVO'),(71,1,1,'Queso fresco','Refrigerado','Lácteo','Unidad',5.00,200,50,1,NULL,'ACTIVO'),(72,1,1,'Queso duro/seco','Refrigerado','Lácteo','Unidad',5.00,200,50,1,NULL,'ACTIVO'),(73,1,1,'Huevo de gallina','Grado alimenticio','Proteína animal','Unidad',1.25,1500,200,1,NULL,'ACTIVO'),(74,1,1,'Pechuga de pollo','Refrigerado/congelado','Proteína animal','Libra',12.00,185,20,1,NULL,'ACTIVO'),(75,1,1,'Pollo entero','Refrigerado/congelado','Proteína animal','Libra',16.00,100,20,1,NULL,'ACTIVO'),(76,1,1,'Carne de res molida','Refrigerado/congelado','Proteína animal','Libra',30.00,50,10,1,NULL,'ACTIVO'),(77,1,1,'Carne de res para bistec','Refrigerado/congelado','Proteína animal','Libra',35.00,50,10,1,NULL,'ACTIVO'),(78,NULL,NULL,'Limonada','Refresco de limonada','Bebidas','Litro',2.50,85,10,0,NULL,'ACTIVO'),(79,NULL,NULL,'Fideos','Fideos para sopa','Granos y Pastas','Libra',1.50,42,5,0,NULL,'ACTIVO'),(80,NULL,NULL,'Carne molida','Carne de res molida','Carnes','Libra',8.00,37,5,0,NULL,'ACTIVO'),(81,NULL,NULL,'Carne vegetal','Carne vegetal para cocinado','Vegetales','Unidad',2.00,29,5,0,NULL,'ACTIVO'),(82,NULL,NULL,'Chile pimiento','Chile pimiento rojo o verde','Vegetales','Unidad',1.50,48,10,0,NULL,'ACTIVO'),(83,NULL,NULL,'Tomate','Tomate fresco','Vegetales','Libra',2.00,56,10,0,NULL,'ACTIVO'),(84,NULL,NULL,'Cebolla','Cebolla blanca','Vegetales','Libra',1.00,40,5,0,NULL,'ACTIVO'),(85,NULL,NULL,'Ajo','Dientes de ajo','Vegetales','Diente',0.20,197,50,0,NULL,'ACTIVO'),(86,2,2,'Zanahoria','Zanahoria fresca','Vegetales','Unidad',1.50,38,50,0,NULL,'ACTIVO'),(87,NULL,NULL,'Albahaca','Albahaca fresca','Condimentos','Manojo',3.00,20,2,0,NULL,'ACTIVO'),(88,NULL,NULL,'Aceite vegetal','Aceite vegetal para cocinar','Condimentos','Litro',12.00,29,5,0,NULL,'ACTIVO'),(89,NULL,NULL,'Sal','Sal de mesa','Condimentos','Kilogramo',2.50,46,10,0,NULL,'ACTIVO'),(90,NULL,NULL,'Limón','Limón ácido','Frutas','Unidad',0.50,185,30,0,NULL,'ACTIVO'),(91,NULL,NULL,'Azúcar','Azúcar blanca','Básicos','Libra',2.00,98,20,0,NULL,'ACTIVO'),(92,NULL,NULL,'Agua Segura','Agua potable segura','Bebidas','Litro',1.00,190,50,0,NULL,'ACTIVO'),(93,NULL,NULL,'Tortilla','Tortilla de maíz','Pan','Unidad',0.50,460,100,0,NULL,'ACTIVO'),(94,2,2,'Piña','Piña fresca','Frutas','Unidad',4.00,26,50,0,NULL,'ACTIVO'),(95,1,2,'Espagueti','Espagueti 200 gramos','Granos y Pastas','Bolsa',1.50,45,50,0,NULL,'ACTIVO');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_proveedor` varchar(255) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `direccion` text,
  `telefono` int DEFAULT NULL,
  `estado` text,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Cenma','5845687','Ciudad Capital',55556666,'ACTIVO','2025-10-24 23:32:43'),(2,'Terminal','58658549','Ciudad Capital',56878654,'ACTIVO','2025-11-01 13:11:40'),(3,'Panaderia La Mejor','0000000','Calle Real Zona 3 Sumpango',56878654,'ACTIVO','2025-11-01 13:26:13');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `nombre_reporte` varchar(100) NOT NULL,
  `tipo_reporte` varchar(50) NOT NULL,
  `periodo` date DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reporte`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_generados`
--

DROP TABLE IF EXISTS `reportes_generados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes_generados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(10) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `generado_por_id` int DEFAULT NULL,
  `fecha_generacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_generados`
--

LOCK TABLES `reportes_generados` WRITE;
/*!40000 ALTER TABLE `reportes_generados` DISABLE KEYS */;
INSERT INTO `reportes_generados` VALUES (1,'PDF','inventario',3,'2025-11-02 01:53:11'),(2,'EXCEL','inventario',3,'2025-11-02 02:00:49'),(3,'PDF','orden_individual 7',3,'2025-11-02 17:25:06'),(4,'EXCEL','orden_individual 6',3,'2025-11-02 17:25:24');
/*!40000 ALTER TABLE `reportes_generados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `telefono` int DEFAULT NULL,
  `rol` varchar(50) NOT NULL,
  `estado` varchar(50) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `ultima_conexion` datetime DEFAULT NULL,
  `intentos_fallidos` int DEFAULT '0',
  `bloqueado_hasta` datetime DEFAULT NULL,
  `requiere_cambio_contraseña` varchar(50) DEFAULT '0',
  `fecha_ultimo_cambio_contraseña` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `uq_correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (3,'Admin','SICOENA','jhony.paredes1994@gmail.com','$2b$10$OBwdVsq7VscDtYi222q9je/90MnjEms0A1d7etrmPKKBH3d/SRoum',NULL,'Administrador','ACTIVO','2025-10-21 17:39:15','2025-11-02 21:29:03',0,NULL,'0','2025-10-21 17:39:15'),(4,'Sherlyn','Elias','nicheelias93@gmail.com','$2b$10$GVmPegSsakrPZnkdyx9Yf.yrkU5l2RWuUG926CWaC.udoiqdPPZJ2',NULL,'Usuario','ACTIVO','2025-10-21 18:02:18','2025-11-01 00:55:16',0,NULL,'0','2025-10-21 18:02:18'),(5,'Juancho','Lopez','juanlopez@yahoo.mx','$2b$10$gLCQZVAIojT83EEXbOX4KejbpMytKUVG9ejLyceXhljswkMeaLl.6',NULL,'Usuario','INACTIVO','2025-10-23 21:18:49',NULL,0,NULL,'0','2025-10-23 21:18:49'),(7,'Agusto Solis','','agustosolis@gmail.com','$2b$10$rrrRflZZoCSedtGw1LodE.MeRlWGDBjdsoZmvpVlyb8LNdJ.JGTaS',NULL,'Administrador','Activo','2025-11-01 01:39:17',NULL,0,NULL,'0','2025-11-01 01:39:17');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-02 21:48:48
