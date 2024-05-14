"use client";

import React, { useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { CollectionWithBookmarkCount, FullBookmarkType } from "../../types";
import CollectionButton from "../buttons/CollectionButton";
import { useBookmarks } from "@/app/context/BookmarkContext";
import CollectionMenuOption from "./CollectionMenuOption";
import { axiosUpdateResource } from "@/app/libs/resourceActions";
import { useSession } from "next-auth/react";

interface CollectionMenuProps {}

const CollectionMenu: React.FC<CollectionMenuProps> = ({}) => {
  const { state, dispatch } = useBookmarks();
  const { data } = useSession();

  const [selectedCollection, setSelectedCollection] =
    useState<CollectionWithBookmarkCount>();

  const collectionMenuRef = useRef<HTMLDivElement>(null);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] =
    useState<boolean>(false);

  const [displayCollections, setDisplayCollections] = useState<
    CollectionWithBookmarkCount[]
  >([]);

  const [isInputFieldOpen, setIsInputFieldOpen] = useState<boolean>(false);
  const inputFieldParentRef = useRef<HTMLDivElement>(null);

  // Effect to synchronize active bookmark's collection and options to select from
  useEffect(() => {
    if (state.collections) {
      const updatedCollections = state.collections.map((coll) => coll);
      setDisplayCollections(updatedCollections);
    }

    if (state.activeBookmark && state.collections) {
      const collectionId = state.activeBookmark.collectionId;
      const collection = state.collections.find(
        (collection) => collection.id === collectionId
      );
      setSelectedCollection(collection);
    }
  }, [state.activeBookmark, state.collections]);

  // Effect for hiding the collection menu when clicking outside of the container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        collectionMenuRef.current &&
        !collectionMenuRef.current.contains(event.target as Node)
      ) {
        setIsCollectionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Updates the active bookmark's collection
  const handleOptionBtnOnMouseUp = (
    collection: CollectionWithBookmarkCount
  ) => {
    if (data?.sessionToken && state.activeBookmark) {
      const payload = {
        id: state.activeBookmark.id,
        collectionId: collection.id,
        collection,
      };
      // Server request
      axiosUpdateResource(
        "bookmark",
        payload,
        data.sessionToken,
        () => {},
        () => {}
      );

      // Update client-state
      dispatch({
        type: "UPDATE_UNIQUE_RESOURCE_METADATA",
        resource: "bookmark",
        identifierType: "id",
        identifier: state.activeBookmark.id,
        payload,
      });
    }
    setIsCollectionMenuOpen(false);
  };

  const scrollbarClasses = `
    scrollbar-thin
    scrollbar-thumb-rounded-md
    scrollbar-thumb-neutral-600
    scrollbar-track-rounded-md
    scrollbar-track-neutral-500
    overflow-y-scroll
  `;

  const collectionMenuClasses = clsx(
    `
    absolute 
    left-0
    top-0
    z-20
    max-h-[180px]
    max-w-44
    w-full
    rounded-md
    shadow-2xl
    transition-opacity
    duration-200
    `,
    state.collections.length >= 7 && scrollbarClasses,
    isCollectionMenuOpen
      ? "ring-2 ring-orange-300 opacity-100"
      : "ring-2 ring-transparent opacity-0 pointer-events-none"
  );

  return (
    <div className="relative flex w-full mx-4 items-center text-start bg-zinc-800">
      <div className="flex w-full" ref={inputFieldParentRef}>
        <CollectionButton
          name={selectedCollection?.name ?? ""}
          onMouseUp={() => {
            setIsCollectionMenuOpen(true);
          }}
          isInputFieldOpen={isInputFieldOpen}
        />
      </div>

      {/* Collection Options to select from */}
      <div ref={collectionMenuRef} className={collectionMenuClasses}>
        <ul>
          <CollectionMenuOption
            key={selectedCollection?.name}
            name={selectedCollection?.name ?? ""}
            isFirst={true}
            isLast={displayCollections.length === 1}
            onMouseUp={() => {
              if (selectedCollection) {
                handleOptionBtnOnMouseUp(selectedCollection);
              }
            }}
          />
          {displayCollections &&
            Array.from(displayCollections).map((collection, index) => {
              return (
                <CollectionMenuOption
                  key={collection.name}
                  name={collection.name}
                  isLast={displayCollections.length - 1 === index}
                  onMouseUp={() => {
                    handleOptionBtnOnMouseUp(collection);
                    setIsCollectionMenuOpen(false);
                  }}
                />
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default CollectionMenu;
