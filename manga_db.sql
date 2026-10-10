-- MariaDB dump 10.19  Distrib 10.4.34-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: manga_db
-- ------------------------------------------------------
-- Server version	10.4.34-MariaDB-1:10.4.34+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chapter_pages`
--

DROP TABLE IF EXISTS `chapter_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chapter_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chapter_id` int(11) NOT NULL,
  `page_number` int(11) NOT NULL,
  `image_url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `chapter_pages_chapter_id_idx` (`chapter_id`),
  CONSTRAINT `chapter_pages_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapter_pages`
--

LOCK TABLES `chapter_pages` WRITE;
/*!40000 ALTER TABLE `chapter_pages` DISABLE KEYS */;
INSERT INTO `chapter_pages` VALUES (5,13,1,'/uploads/chapters/1790103600363_0_1.1.jpg'),(6,13,2,'/uploads/chapters/1790103600369_1_1.2.jpg'),(7,12,1,'/uploads/chapters/1790103622258_0_2.1.jpg'),(8,12,2,'/uploads/chapters/1790103622270_1_2.2.jpg'),(12,15,1,'/uploads/chapters/1790103940249_0_1.jpg'),(13,15,2,'/uploads/chapters/1790103940254_1_2.jpg'),(14,15,3,'/uploads/chapters/1790103940257_2_3.jpg'),(15,15,4,'/uploads/chapters/1790103940261_3_4.jpg');
/*!40000 ALTER TABLE `chapter_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chapters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `manga_id` int(11) NOT NULL,
  `chapter_number` double NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `chapters_manga_id_idx` (`manga_id`),
  CONSTRAINT `chapters_manga_id_fkey` FOREIGN KEY (`manga_id`) REFERENCES `mangas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES (12,2,2,'ตอนที่2','2026-09-22 18:10:43.221'),(13,2,1,'ตอนที่1','2026-09-22 18:14:07.969'),(15,5,1,'ตอนที่1','2026-09-22 19:04:07.510');
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mangas`
--

DROP TABLE IF EXISTS `mangas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mangas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `cover_url` text NOT NULL,
  `description` text DEFAULT NULL,
  `author` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'ongoing',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mangas`
--

LOCK TABLES `mangas` WRITE;
/*!40000 ALTER TABLE `mangas` DISABLE KEYS */;
INSERT INTO `mangas` VALUES (2,'คนรับใช้ของคุณหนู','https://pbs.twimg.com/media/HDzT4etboAIrehC?format=jpg&name=4096x4096','คนรับใช้ของคุณหนู','@yagikunn1733','ongoing','2026-09-21 16:52:52.000','2026-09-22 18:59:37.679'),(3,'naruto','https://m.media-amazon.com/images/I/81mPBf1Fi1S._AC_UF894,1000_QL80_.jpg','naruto','บีเวอร์2','completed','2026-09-21 17:43:06.000','2026-09-23 00:43:49.672'),(5,'one piece','https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg','ลูฟี่ผจญภัย','ODA','ongoing','2026-09-22 19:03:37.307','2026-09-22 19:04:07.535');
/*!40000 ALTER TABLE `mangas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Manga','admin@manga.com','$2b$10$eQNvuaSoQvqChuQ.UsD5P.LoMWSYYSy8malYTmCGo7M842KyS.qIe','admin','2026-10-10 12:54:00'),(2,'Member User','member@manga.com','$2b$10$kvY5iOOh9w0smscH5J9QDOkP7UfLPjYBNhmJBkrLr5HcYpW9Yl9.a','member','2026-10-10 12:54:00'),(4,'รอชิด ขำเจริญ','kh.roochit_st@tni.ac.th','$2b$10$9dOXp4XPGdM7CFQ84UDs8ehC533geNfBJmplJVKLUaLeCEVCRXJTe','member','2026-10-10 13:40:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10 13:46:01
