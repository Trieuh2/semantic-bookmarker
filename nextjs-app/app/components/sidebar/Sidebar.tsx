import React, { useEffect, useState } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";

import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import { Bookmark, Collection, Tag } from "@prisma/client";
import { getSession } from "next-auth/react";
import axios from "axios";

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = ({}) => {
  const [userId, setUserId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  // const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [tags, setTags] = useState<Tag[] | null>(null);

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      const nextAuthSession = await getSession();
      if (
        nextAuthSession &&
        nextAuthSession.sessionToken &&
        nextAuthSession.userId
      ) {
        setUserId(nextAuthSession.userId);
        setSessionToken(nextAuthSession.sessionToken);
      }
    };
    fetchSession();
  }, []);

  // Fetch collections
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchCollections = async () => {
        try {
          const params = {
            userId: userId,
            sessionToken: sessionToken,
          };
          const axiosResponse = await axios.get(
            "http://localhost:3000/api/collection/",
            { params }
          );

          if (axiosResponse.status === 200) {
            setCollections(axiosResponse.data.data);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchCollections();
    }
  }, [userId, sessionToken, collections]);

  // Fetch tags
  // useEffect(() => {
  //   if (userId && sessionToken) {
  //     const fetchTags = async () => {
  //       try {
  //         const params = {
  //           userId: userId,
  //           sessionToken: sessionToken,
  //         };
  //         const axiosResponse = await axios.get(
  //           "http://localhost:3000/api/tags/",
  //           { params }
  //         );

  //         if (axiosResponse.status === 200) {
  //           setTags(axiosResponse.data.data);
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     fetchTags();
  //   }
  // }, [userId, sessionToken, tags]);

  const sidebarClassNames = clsx(
    `
    h-full
    w-64
    bg-neutral-800
    border-r
    border-neutral-700
    font-light
    `
  );

  return (
    <div className={sidebarClassNames}>
      {/* Static SidebarItems */}
      <SidebarItem
        href="/bookmarks"
        label="All bookmarks"
        icon={IoIosBookmarks}
      />
      <SidebarItem href="/unsorted" label="Unsorted" icon={FaBoxArchive} />
      <SidebarItem href="/trash" label="Trash" icon={FaTrashAlt} />

      {/* Collections */}
      <div>
        {collections &&
          collections.map((collection) => (
            <SidebarItem
              key={collection.id}
              href={`/collection/${collection.id}`}
              label={collection.name}
              icon={IoIosFolder}
              count={collections.length}
            />
          ))}
      </div>

      {/* Tags */}
      {/* <div>
        {tags &&
          tags.map((tag) => (
            <SidebarItem
              key={tag.id}
              href={`/tag/${tag.id}`}
              label={tag.name}
              icon={HiHashtag}
              count={tags.length}
            />
          ))}
      </div> */}
    </div>
  );
};

export default Sidebar;
