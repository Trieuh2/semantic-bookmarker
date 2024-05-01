"use client";

import { useAuth } from "@/app/context/AuthContext";
import { AdvancedImage } from "@cloudinary/react";
import { CloudConfig, URLConfig, CloudinaryImage } from "@cloudinary/url-gen";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { CgWebsite } from "react-icons/cg";

interface FavIconProps {
  domainName?: string;
}

const FavIcon: React.FC<FavIconProps> = ({ domainName }) => {
  const { userId } = useAuth();
  const [favIcon, setFavIcon] = useState<CloudinaryImage | null>(null);

  useEffect(() => {
    if (domainName) {
      const folderPath = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_FOLDER;
      const favIconPublicId = `${folderPath}/${userId}-${domainName}-favIcon`;
      let cloudConfig = new CloudConfig({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
      });
      let urlConfig = new URLConfig({ secure: true });
      try {
        const image = new CloudinaryImage(
          favIconPublicId,
          cloudConfig,
          urlConfig
        );
        // Here, simulate a validation check or use a real method provided by Cloudinary SDK
        fetch(image.toURL()) // Hypothetical method to check the URL
          .then((response) => {
            if (response.ok) {
              setFavIcon(image);
            } else {
              throw new Error(`Image not valid for ${domainName}`);
            }
          })
          .catch((error) => {
            setFavIcon(null);
          });
      } catch (error) {
        setFavIcon(null);
      }
    }
  }, [domainName, userId]);

  const imgContainerClasses = `
    flex
    grow-0
    shrink-0
    h-12
    w-12
    justify-center
    items-center
    rounded-md
    hover:bg-neutral-700
    hover:cursor-pointer
    border
    border-neutral-700
    bg-stone-800
  `;

  const imgClasses = `
    h-8
    w-8
  `;

  return (
    <div className={imgContainerClasses}>
      {favIcon ? (
        <AdvancedImage cldImg={favIcon} className={imgClasses} />
      ) : (
        <CgWebsite className={clsx(imgClasses, "fill-stone-500")}/>
      )}
    </div>
  );
};

export default FavIcon;
