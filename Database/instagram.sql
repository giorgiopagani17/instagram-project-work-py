-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 06, 2024 at 07:18 AM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `instagram`
--

-- --------------------------------------------------------

--
-- Table structure for table `commenti`
--

CREATE TABLE `commenti` (
  `id_commento` int(11) NOT NULL,
  `id_post` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `text_commento` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `commenti`
--

INSERT INTO `commenti` (`id_commento`, `id_post`, `id_utente`, `text_commento`) VALUES
(8, 3, 1, 'bellissima!'),
(9, 13, 1, 'Python >'),
(10, 2, 1, 'stupenda...'),
(11, 2, 1, 'quando sei andato?'),
(13, 13, 1, 'java > php'),
(15, 13, 1, 'node.js'),
(40, 2, 1, 'wow!'),
(42, 26, 3, 'creepy'),
(43, 24, 3, 'wow!'),
(44, 22, 3, 'nice'),
(45, 20, 3, 'forza cagliari'),
(46, 23, 2, 'anche io ci sono stato'),
(47, 1, 17, 'come la sardegna!!'),
(48, 19, 17, 'è Cagliari'),
(49, 26, 3, 'USI PHP?'),
(50, 26, 3, 'EH?????'),
(51, 21, 19, 'Bellissima'),
(52, 23, 18, 'stupenda'),
(53, 13, 20, 'che schifo php'),
(54, 21, 21, 'stupenda!!!'),
(55, 23, 21, 'ti invidio!!');

-- --------------------------------------------------------

--
-- Table structure for table `follow`
--

CREATE TABLE `follow` (
  `id_utente_follower` int(11) NOT NULL,
  `id_utente_seguito` int(11) NOT NULL,
  `id_follow` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `follow`
--

INSERT INTO `follow` (`id_utente_follower`, `id_utente_seguito`, `id_follow`) VALUES
(2, 1, 1),
(1, 2, 40),
(1, 3, 60),
(17, 1, 73),
(20, 1, 74),
(20, 3, 75),
(20, 18, 76),
(20, 17, 77),
(20, 2, 78),
(20, 19, 79),
(19, 2, 80),
(19, 20, 81),
(19, 3, 82),
(19, 18, 83),
(18, 17, 84),
(18, 1, 85),
(18, 3, 86),
(18, 2, 87),
(18, 19, 88),
(18, 20, 89),
(17, 20, 90),
(17, 2, 91),
(17, 3, 92),
(17, 19, 93),
(17, 18, 94),
(2, 18, 95),
(2, 20, 97),
(2, 17, 98),
(2, 3, 99),
(3, 17, 100),
(3, 19, 101),
(3, 1, 102),
(3, 18, 103),
(3, 20, 104),
(3, 2, 105),
(21, 2, 106),
(21, 1, 107),
(21, 17, 108),
(21, 19, 109),
(1, 17, 110);

-- --------------------------------------------------------

--
-- Table structure for table `like_instagram`
--

CREATE TABLE `like_instagram` (
  `id_post` int(11) NOT NULL,
  `id_utente_like` int(11) NOT NULL,
  `id_like` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `like_instagram`
--

INSERT INTO `like_instagram` (`id_post`, `id_utente_like`, `id_like`) VALUES
(3, 1, 271),
(1, 1, 273),
(13, 1, 274),
(2, 1, 276),
(26, 3, 284),
(21, 3, 285),
(23, 3, 286),
(3, 3, 287),
(22, 3, 288),
(20, 3, 289),
(19, 3, 290),
(2, 3, 291),
(26, 2, 292),
(1, 2, 293),
(23, 2, 294),
(22, 2, 295),
(24, 2, 296),
(13, 2, 297),
(19, 2, 298),
(21, 2, 299),
(22, 17, 300),
(26, 17, 301),
(1, 17, 302),
(19, 17, 303),
(23, 17, 304),
(3, 17, 305),
(24, 17, 306),
(2, 17, 307),
(22, 19, 308),
(2, 19, 309),
(21, 19, 310),
(26, 19, 311),
(1, 19, 312),
(20, 18, 313),
(1, 18, 314),
(3, 18, 315),
(13, 18, 316),
(23, 18, 317),
(24, 20, 318),
(23, 20, 319),
(22, 20, 320),
(21, 20, 321),
(20, 20, 322),
(19, 20, 323),
(13, 20, 324),
(22, 21, 329),
(24, 21, 331),
(21, 21, 333),
(23, 21, 334);

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `id_post` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `img_post` varchar(255) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`id_post`, `id_utente`, `img_post`, `descrizione`, `date`) VALUES
(1, 1, 'C:/Users/giorg/Instagram/postUtenti/1713173460377_4397.jpg', 'descrizione', '2024-03-22'),
(2, 2, 'C:/Users/giorg/Instagram/postUtenti/1713173519759_3942.jpg', '', '2024-03-25'),
(3, 2, 'C:/Users/giorg/Instagram/postUtenti/1713173541229_2869.jpg', 'New York di notte', '2024-04-01'),
(13, 3, 'C:/Users/giorg/Instagram/postUtenti/1713525806821_4411.jpg', 'Php', '2024-04-19'),
(19, 1, 'C:/Users/giorg/Instagram/postUtenti/1714918098139_1931.jpg', 'Sunset!\r\n', '2024-05-05'),
(20, 17, 'C:/Users/giorg/Instagram/postUtenti/1714918193524_2658.jpg', 'Trip', '2024-05-05'),
(21, 17, 'C:/Users/giorg/Instagram/postUtenti/1714918299841_8918.jpg', 'Sardegna!', '2024-05-05'),
(22, 18, 'C:/Users/giorg/Instagram/postUtenti/1714918492131_8308.jpg', 'Colosseo\r\n', '2024-05-05'),
(23, 19, 'C:/Users/giorg/Instagram/postUtenti/1714918615698_8382.jpg', 'Greece\r\n', '2024-05-05'),
(24, 19, 'C:/Users/giorg/Instagram/postUtenti/1714918718980_7034.jpg', 'Butterfly\r\n', '2024-05-05'),
(26, 20, 'C:/Users/giorg/Instagram/postUtenti/1714918904731_1554.jpg', '??', '2024-05-05'),
(29, 21, 'C:/Users/giorg/Instagram/postUtenti/1714920577626_9657.jpg', 'Mare', '2024-05-05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `img` varchar(255) NOT NULL,
  `descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `img`, `descrizione`) VALUES
(1, 'giorgiopagani', 'giorgio.pagani2003@gmail.com', '8a2e7ca933fb2f760a71226f9f861b6776ab86bf50321193832afb3dbb42de6a', 'C:/Users/giorg/Instagram/imgUtenti/user_1.jpg', 'GP2'),
(2, 'matteocarrara', 'matteo.carrara@gmail.com', 'fe301eaaac49b4652b8dfd9fb0e913683ac5600f59370a6261824ab608b4fad7', 'C:/Users/giorg/Instagram/imgUtenti/user_2.jpg', 'React Lover'),
(3, 'danielecrespi', 'daniele.crespi@gmail.com', '86d0917177d9cf5fb859b81005f650eb9a3be0d5b1a66df60aea9aee416bc03d', 'C:/Users/giorg/Instagram/imgUtenti/user_3.jpg', 'Php is my life'),
(17, 'ilsardo', 'sardo@gmail.com', 'c9cea76d20b413c8cf795da370244e025300f054c407a7b1bcbc80208b9d3a97', 'C:/Users/giorg/Instagram/imgUtenti/user_17.jpg', ''),
(18, 'giovannabelotti', 'giovanna@gmail.com', '3fddef973bf7de791e13a30ac3a9e33f51623022d22a37118cad51bcff2d32ef', 'C:/Users/giorg/Instagram/imgUtenti/user_18.jpg', ''),
(19, 'silviaverdi', 'silvia@gmail.com', '2d51a3b3ca1cdf790485938566c720527b2ebbe5a1f0326316ce63aafbc385d4', 'C:/Users/giorg/Instagram/imgUtenti/user_19.jpg', ''),
(20, 'anonymous', 'anonymous@gmail.com', '2f183a4e64493af3f377f745eda502363cd3e7ef6e4d266d444758de0a85fcc8', 'C:/Users/giorg/Instagram/imgUtenti/user_20.jpg', ''),
(21, 'mariorossi1', 'mario.rossi@gmail.com', '192c33caac3d89ed647f6dc54419161c2bbf4b57d12bb8c546e41d6448597571', 'C:/Users/giorg/Instagram/imgUtenti/user_21.jpg', 'Mario Rossi!!');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `commenti`
--
ALTER TABLE `commenti`
  ADD PRIMARY KEY (`id_commento`),
  ADD KEY `foreignKeyPostComment` (`id_post`),
  ADD KEY `foreignKeyUtenteCommento` (`id_utente`);

--
-- Indexes for table `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`id_follow`),
  ADD KEY `foreignKeyFollower` (`id_utente_follower`),
  ADD KEY `foreignKeySeguito` (`id_utente_seguito`);

--
-- Indexes for table `like_instagram`
--
ALTER TABLE `like_instagram`
  ADD PRIMARY KEY (`id_like`),
  ADD KEY `foreignKeyUtenteLike` (`id_utente_like`),
  ADD KEY `foreignKeyPostLike` (`id_post`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id_post`),
  ADD KEY `foreignKeyPost` (`id_utente`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `commenti`
--
ALTER TABLE `commenti`
  MODIFY `id_commento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `follow`
--
ALTER TABLE `follow`
  MODIFY `id_follow` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `like_instagram`
--
ALTER TABLE `like_instagram`
  MODIFY `id_like` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=335;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `id_post` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `commenti`
--
ALTER TABLE `commenti`
  ADD CONSTRAINT `foreignKeyPostComment` FOREIGN KEY (`id_post`) REFERENCES `post` (`id_post`),
  ADD CONSTRAINT `foreignKeyUtenteCommento` FOREIGN KEY (`id_utente`) REFERENCES `users` (`id`);

--
-- Constraints for table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `foreignKeyFollower` FOREIGN KEY (`id_utente_follower`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `foreignKeySeguito` FOREIGN KEY (`id_utente_seguito`) REFERENCES `users` (`id`);

--
-- Constraints for table `like_instagram`
--
ALTER TABLE `like_instagram`
  ADD CONSTRAINT `foreignKeyPostLike` FOREIGN KEY (`id_post`) REFERENCES `post` (`id_post`),
  ADD CONSTRAINT `foreignKeyUtenteLike` FOREIGN KEY (`id_utente_like`) REFERENCES `users` (`id`);

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `foreignKeyPost` FOREIGN KEY (`id_utente`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
