"use client";

import { useEffect, useState } from "react";
import getCollections from "../actions/getCollections";
import getTags from "../actions/getTags";
import Sidebar from "../components/sidebar/Sidebar";
import { Tag } from "@prisma/client";
import { FullCollectionType } from "../types";

interface CollectionsLayoutProps {
  children: React.ReactNode;
}

const CollectionsLayout: React.FC<CollectionsLayoutProps> = ({ children }) => {
  const [collections, setCollections] = useState<FullCollectionType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const collectionsData = await getCollections();
      const tagsData = await getTags();
      setCollections(collectionsData);
      setTags(tagsData);
    };

    fetchData();
  }, []);

  return (
    <div className="h-full bg-zinc-800">
      <Sidebar initialCollections={collections} initialTags={tags} />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default CollectionsLayout;
