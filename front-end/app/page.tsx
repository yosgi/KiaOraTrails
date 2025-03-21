"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";


const HomePage = () => {
  // 使用 "HomePage" 命名空间加载翻译文案
  const t = useTranslations("HomePage");
  const features = [
    {
      titleKey: "features.getForge.title",
      descriptionKey: "features.getForge.description",
      buttonTextKey: "features.getForge.buttonText",
      buttonLink: "/forge",
      icon: "fire", // Replace with your icon file name (e.g. fire.svg)
    },
    {
      titleKey: "features.stake.title",
      descriptionKey: "features.stake.description",
      buttonTextKey: "features.stake.buttonText",
      buttonLink: "/stake",
      icon: "iron", // Replace with your icon file name
    },
    {
      titleKey: "features.borrowLend.title",
      descriptionKey: "features.borrowLend.description",
      buttonTextKey: "features.borrowLend.buttonText",
      buttonLink: "/borrow",
      icon: "crysto", // Replace with your icon file name
    },
    {
      titleKey: "features.gamefi.title",
      descriptionKey: "features.gamefi.description",
      buttonTextKey: "features.gamefi.buttonText",
      buttonLink: "/gamefi",
      icon: "shild", // Replace with your icon file name
    },
  ];
  const translatedFeatures = features.map((feature) => ({
    ...feature,
    title: t(feature.titleKey, { defaultMessage: feature.titleKey }),
    description: t(feature.descriptionKey, { defaultMessage: feature.descriptionKey }),
    buttonText: t(feature.buttonTextKey, { defaultMessage: feature.buttonTextKey }),
  }));
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          {t("welcome", { defaultMessage: "Welcome to DeFi Forge" })}
        </h1>
        <p className="text-gray-500 mt-4 text-sm sm:text-base ">
          {t("description", {
            defaultMessage:
              "Start to play get Airdrop, Stake tokens, Borrow, Lend, and Gamefi in one playground.",
          })}
        </p>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {translatedFeatures.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <img
              src={`/${feature.icon}.svg`}
              alt={t(feature.titleKey, { defaultMessage: "Feature Title" })}
              className="w-16 h-16 mx-auto"
            />
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              {t(feature.titleKey, { defaultMessage: "Feature Title" })}
            </h2>
            <p className="text-gray-500 mt-3 text-center h-12">
              {t(feature.descriptionKey, { defaultMessage: "Feature Description" })}
            </p>
            <div className="mt-6 text-center">
              <Link
                href={feature.buttonLink}
                className="inline-block px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition"
              >
                {t(feature.buttonTextKey, { defaultMessage: "Learn More" })}
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};


export default HomePage;
