"use client";

import { useAuth } from "@/app/context/AuthContext";
import { AdvancedImage } from "@cloudinary/react";
import { CloudConfig, URLConfig, CloudinaryImage } from "@cloudinary/url-gen";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { CgWebsite } from "react-icons/cg";

interface FavIconProps {
  domainName?: string;
}

const FavIcon: React.FC<FavIconProps> = ({ domainName }) => {
  const { userId } = useAuth();
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [favIcon, setFavIcon] = useState<CloudinaryImage | null>(null);

  useEffect(() => {
    if (domainName) {
      const folderPath = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_FOLDER;
      const favIconPublicId = `${folderPath}/${userId}-${domainName}-favIcon`;
      let cloudConfig = new CloudConfig({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
      });
      let urlConfig = new URLConfig({ secure: true });
      const image = new CloudinaryImage(
        favIconPublicId,
        cloudConfig,
        urlConfig
      );
      fetch(image.toURL())
        .then((response) => {
          if (response.ok) {
            setFavIcon(image);
          } else {
            throw new Error(`Image not valid for ${domainName}`);
          }
        })
        .catch((error) => {
          setFavIcon(null);
        })
        .finally(() => {
          setIsShowing(true);
        });
    } else {
      setIsShowing(true);
    }
  }, [domainName, userId]);

  const imgContainerClasses = `
    flex
    grow-0
    shrink-0
    h-12
    w-12
    ml-2
    justify-center
    items-center
    rounded-md
    hover:bg-neutral-700
    hover:cursor-pointer
    border
    border-neutral-700
    bg-stone-800
    shadow-lg
    relative
  `;

  const imgClasses = `
    h-8
    w-8
  `;

  return (
    <div className={imgContainerClasses}>
      <Transition
        show={isShowing}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {favIcon && <AdvancedImage cldImg={favIcon} className={imgClasses} />}
        {!favIcon && (
          <CgWebsite className={clsx(imgClasses, "fill-stone-500")} />
        )}
      </Transition>
    </div>
  );
};

export default FavIcon;
