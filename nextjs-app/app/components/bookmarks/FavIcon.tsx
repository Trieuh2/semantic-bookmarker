"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { AdvancedImage } from "@cloudinary/react";
import { CloudConfig, URLConfig, CloudinaryImage } from "@cloudinary/url-gen";
import { Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { CgWebsite } from "react-icons/cg";

interface FavIconProps {
  domainName?: string;
}

const FavIcon: React.FC<FavIconProps> = React.memo(({ domainName }) => {
  const { userId } = useAuth();
  const { state } = useBookmarks();
  const [favIcon, setFavIcon] = useState<CloudinaryImage | null>(null);

  // Side effect to fetch the favIcon from Cloudinary
  useEffect(() => {
    if (domainName && !state.isBookmarksLoading) {
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
            setFavIcon(null);
          }
        })
        .catch((error) => {
          setFavIcon(null);
        });
    }
  }, [domainName, userId, state.isBookmarksLoading]);

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
        appear={true}
        show={true}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {favIcon && <AdvancedImage cldImg={favIcon} className={imgClasses} />}
        {!favIcon && <CgWebsite className={imgClasses} />}
      </Transition>
    </div>
  );
});

FavIcon.displayName = "FavIcon";
export default FavIcon;
