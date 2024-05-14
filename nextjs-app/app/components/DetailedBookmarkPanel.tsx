"use client";

import clsx from "clsx";
import _ from "lodash";
import { useBookmarks } from "../context/BookmarkContext";
import BookmarkItem from "./bookmarks/BookmarkItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import {
  axiosCreateResource,
  axiosUpdateResource,
  createTempResource,
} from "../libs/resourceActions";
// import { data } from "@tensorflow/tfjs";
import { useSession } from "next-auth/react";
import {
  CollectionWithBookmarkCount,
  FullBookmarkType,
  TagWithBookmarkCount,
} from "../types";
import React from "react";
import CollectionMenu from "./collectionMenu/CollectionMenu";
import TagButton from "./buttons/TagButton";
import { useAuth } from "../context/AuthContext";
import { statSync } from "fs";

const DetailedBookmarkPanel: React.FC = () => {
  const { state, dispatch } = useBookmarks();
  const { data } = useSession();
  const { sessionToken } = useAuth();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [titleTextAreaValue, setTitleTextAreaValue] = useState<string>(
    state.activeBookmark?.title ?? ""
  );
  const [isTitleFocused, setIsTitleFocused] = useState<boolean>(false);

  const [allTagNames, setAllTagNames] = useState<string[]>([]);
  const [currBookmarkTagNames, setCurrBookmarkTagNames] = useState<string[]>(
    []
  );
  const [newTagInputValue, setNewTagInputValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [noteTextAreaValue, setNoteTextAreaValue] = useState<string>(
    state?.activeBookmark?.note ?? ""
  );

  const urlRef = useRef<HTMLInputElement>(null);
  const [urlInputValue, setUrlInputValue] = useState<string>("");

  const excerptRef = useRef<HTMLDivElement>(null);
  const [excerptTextAreaValue, setExcerptTextAreaValue] = useState<string>(
    state?.activeBookmark?.excerpt ?? ""
  );

  // Synchronize active bookmark state
  useEffect(() => {
    if (state.activeBookmark) {
      setTitleTextAreaValue(state.activeBookmark?.title ?? "");
      setNoteTextAreaValue(state.activeBookmark?.note ?? "");
      setUrlInputValue(state.activeBookmark?.page_url);
      setExcerptTextAreaValue(state.activeBookmark?.excerpt ?? "");

      // Set active bookmark's list of tags
      if (state.activeBookmark.tagToBookmarks) {
        const tagToBookmarkNames = state.activeBookmark?.tagToBookmarks
          .filter((ttb) => ttb?.tag !== undefined)
          .map((ttb) => ttb.tag?.name)
          .filter((name): name is string => name !== undefined);

        if (tagToBookmarkNames.length > 0) {
          setCurrBookmarkTagNames(tagToBookmarkNames);
        } else {
          setCurrBookmarkTagNames([]);
        }
      }

      if (state.tags) {
        const tagNames = state.tags.map((tag) => tag.name);
        setAllTagNames(tagNames);
      }
    }
  }, [
    state.activeBookmark,
    state.activeBookmark?.tagToBookmarks,
    state.collections,
    state.tags,
  ]);

  // Side effect to shrink/expand title textArea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
      // titleRef.current.style.height = "2rem";
    }
  }, [titleRef, titleTextAreaValue]);

  // Side effect to expand the excerpt height
  useLayoutEffect(() => {
    const adjustHeight = () => {
      if (excerptRef.current) {
        excerptRef.current.style.height = "auto";
        excerptRef.current.style.height =
          excerptRef.current.scrollHeight + "px";
      }
    };

    adjustHeight();
  }, [excerptTextAreaValue]);

  const handleTextAreaOnChange = (field: "title" | "note", value: string) => {
    if (!state.activeBookmark) {
      return;
    }

    if (field === "title") {
      setTitleTextAreaValue(value);
    } else if (field === "note") {
      setNoteTextAreaValue(value);
    } else if (field === "url") {
      setUrlInputValue(value);
    }

    if (state.activeBookmark) {
      const payload = {
        id: state.activeBookmark.id ?? "",
        title: field === "title" ? value : titleTextAreaValue,
        note: field === "note" ? value : noteTextAreaValue,
      };

      // Update client bookmark state
      dispatch({
        type: "UPDATE_UNIQUE_RESOURCE_METADATA",
        resource: "bookmark",
        identifierType: "id",
        identifier: state.activeBookmark.id,
        payload,
      });

      // Send server-side update request
      axiosUpdateResource(
        "bookmark",
        payload,
        sessionToken,
        () => {},
        () => {}
      );
    }
  };

  const handleTagsInputOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isUpdating) {
      if (newTagInputValue !== "") {
        setIsUpdating(true);
        const prevBookmarks = [...state.bookmarks];
        const prevTags = [...state.tags];

        const updateBookmarkOnSuccess = (
          updatedActiveBookmark: FullBookmarkType | undefined
        ) => {
          setIsUpdating(false);

          if (
            state.activeBookmark &&
            state.activeBookmark.tagToBookmarks !== undefined &&
            updatedActiveBookmark &&
            updatedActiveBookmark.tagToBookmarks !== undefined
          ) {
            // Find the new ttb and tag
            const activeBookmarkTagNames = state.activeBookmark.tagToBookmarks
              .filter((ttb) => ttb !== undefined && ttb.tag !== undefined)
              .map((ttb) => {
                return ttb?.tag?.name;
              });

            const newTagToBookmark = updatedActiveBookmark?.tagToBookmarks.find(
              (ttb) => ttb.tag?.name === newTagInputValue
            );
            const newTag = newTagToBookmark?.tag as TagWithBookmarkCount;

            // Update active bookmark state with server data
            if (!activeBookmarkTagNames.includes(newTagInputValue)) {
              const updatedTagToBookmarks = [
                ...state.activeBookmark?.tagToBookmarks,
                newTagToBookmark,
              ];
              dispatch({
                type: "UPDATE_UNIQUE_RESOURCE_METADATA",
                resource: "bookmark",
                identifierType: "id",
                identifier: updatedActiveBookmark.id,
                payload: {
                  tagToBookmarks: updatedTagToBookmarks,
                },
              });
            } else if (activeBookmarkTagNames.includes(newTagInputValue)) {
              const updatedTagToBookmarks =
                state.activeBookmark?.tagToBookmarks.map((ttb) => {
                  if (ttb?.tag?.name === newTagInputValue) {
                    return newTagToBookmark;
                  } else {
                    return ttb;
                  }
                });
              dispatch({
                type: "UPDATE_UNIQUE_RESOURCE_METADATA",
                resource: "bookmark",
                identifierType: "id",
                identifier: updatedActiveBookmark.id,
                payload: {
                  tagToBookmarks: updatedTagToBookmarks,
                },
              });
            }

            // Update all tags state with server data
            const activeTagNames = state.tags?.map((tag) => tag.name);
            if (!activeTagNames.includes(newTagInputValue) && newTag) {
              dispatch({
                type: "SET_RESOURCES",
                resource: "tag",
                payload: [...state.tags, newTag],
              });
            }
            // else if (activeTagNames.includes(newTagInputValue) && newTag) {
            //   const updatedTags = state.tags.map((tag) => {
            //     if (tag.name === newTagInputValue) {
            //       return newTag;
            //     } else {
            //       return tag;
            //     }
            //   });
            //   dispatch({
            //     type: "SET_RESOURCES",
            //     resource: "tag",
            //     payload: updatedTags,
            //   });
            // }
          }
        };

        const updateBookmarkOnError = (error: any) => {
          setIsUpdating(false);
          console.error(`Error creating tag:`, error);

          // Dispatch an action to revert to the previous state if there's an error
          dispatch({
            type: "SET_RESOURCES",
            resource: "bookmark",
            payload: prevBookmarks,
          });
        };

        // Case: Completely new tag
        if (!allTagNames.includes(newTagInputValue)) {
          const tempTagToBookmarkWithTag = createTempResource(
            data?.userId ?? "",
            "tagToBookmark",
            newTagInputValue
          );
          const tempTag = createTempResource(
            data?.userId ?? "",
            "tag",
            newTagInputValue,
            undefined,
            1
          );

          // Optimistic client-side bookmarks update
          dispatch({
            type: "UPDATE_UNIQUE_RESOURCE_METADATA",
            resource: "bookmark",
            identifierType: "id",
            identifier: state.activeBookmark?.id ?? "",
            payload: {
              tagToBookmarks: [
                ...(state.activeBookmark?.tagToBookmarks ?? []),
                tempTagToBookmarkWithTag,
              ],
            },
          });

          // Optimistic client-side update for tags
          dispatch({
            type: "SET_RESOURCES",
            resource: "tag",
            payload: [...prevTags, tempTag] as TagWithBookmarkCount[],
          });
        }
        // Case: Pre-existing tag, new tagToBookmark
        else if (
          allTagNames.includes(newTagInputValue) &&
          !currBookmarkTagNames.includes(newTagInputValue)
        ) {
          const tag = state.tags.find((tag) => tag.name === newTagInputValue);
          const tempTagToBookmarkWithTag = createTempResource(
            data?.userId ?? "",
            "tagToBookmark",
            newTagInputValue,
            undefined,
            undefined,
            tag
          );

          // Optimistic updating tag's tag to bookmark count
          const preupdatedTags = state.tags.map((tag) => {
            if (tag.name === newTagInputValue) {
              return {
                ...tag,
                _count: {
                  ...tag._count,
                  tagToBookmarks: tag._count.tagToBookmarks + 1,
                },
              };
            } else {
              return tag;
            }
          });

          dispatch({
            type: "UPDATE_UNIQUE_RESOURCE_METADATA",
            resource: "bookmark",
            identifierType: "id",
            identifier: state.activeBookmark?.id ?? "",
            payload: {
              tagToBookmarks: [
                ...(state.activeBookmark?.tagToBookmarks ?? []),
                tempTagToBookmarkWithTag,
              ],
            },
          });
          dispatch({
            type: "SET_RESOURCES",
            resource: "tag",
            payload: preupdatedTags,
          });
        }

        const serverPayload = {
          id: state.activeBookmark?.id,
          tags: [...currBookmarkTagNames, newTagInputValue],
          performNow: true,
        };

        // Bookmark update server request
        axiosUpdateResource(
          "bookmark",
          serverPayload,
          sessionToken ?? "",
          updateBookmarkOnSuccess,
          updateBookmarkOnError
        );
      }

      setNewTagInputValue("");
    }
  };

  const handleUrlInputOnKeyDown = (value: string) => {
    // Update local state
    setUrlInputValue(value);

    if (value !== "") {
      const prevUrl = state.activeBookmark?.page_url ?? "";

      // Update client bookmark state
      dispatch({
        type: "UPDATE_UNIQUE_RESOURCE_METADATA",
        resource: "bookmark",
        identifierType: "id",
        identifier: state.activeBookmark?.id ?? "",
        payload: {
          page_url: value,
        },
      });

      // Server update
      const payload = {
        id: state.activeBookmark?.id,
        page_url: value,
      };

      const bookmarkUrlUpdateOnError = (error: Error) => {
        console.error("Error updating page url for bookmark.", error);

        // Undo client-side updates
        dispatch({
          type: "UPDATE_UNIQUE_RESOURCE_METADATA",
          resource: "bookmark",
          identifierType: "id",
          identifier: state.activeBookmark?.id ?? "",
          payload: { page_url: prevUrl },
        });
      };

      axiosUpdateResource(
        "bookmark",
        payload,
        sessionToken,
        () => {},
        bookmarkUrlUpdateOnError
      );
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);

    const year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1; // getMonth() is zero-indexed
    let day = dateObj.getDate();
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const handleTagBtnOnClick = (tagNameToRemove: string) => {
    const prevBookmark = { ...state.activeBookmark };
    const prevTagToBookmarks = [
      ...(state.activeBookmark?.tagToBookmarks ?? []),
    ];
    const updatedTagToBookmarks = prevTagToBookmarks?.filter(
      (ttb) => ttb?.tag?.name !== tagNameToRemove
    );

    const prevTag = state.tags.find((tag) => tag.name === tagNameToRemove);
    const updatedTag = {
      ...prevTag,
      _count: {
        tagToBookmarks: (prevTag?._count.tagToBookmarks ?? 0) - 1,
      },
    };

    const onError = (error: any) => {
      console.error("Error removing tagToBookmark from Bookmark.", error);
      // Undo optimistic bookmark update
      dispatch({
        type: "UPDATE_UNIQUE_RESOURCE_METADATA",
        resource: "bookmark",
        identifierType: "id",
        identifier: state.activeBookmark?.id ?? "",
        payload: { prevBookmark },
      });
      // Undo optimistic tag update
      dispatch({
        type: "UPDATE_UNIQUE_RESOURCE_METADATA",
        resource: "tag",
        identifierType: "name",
        identifier: tagNameToRemove,
        payload: { prevTag },
      });
    };

    // Optimistic client update to bookmark to remove related tagToBookmark data
    dispatch({
      type: "UPDATE_UNIQUE_RESOURCE_METADATA",
      resource: "bookmark",
      identifierType: "id",
      identifier: state.activeBookmark?.id ?? "",
      payload: {
        tagToBookmarks: updatedTagToBookmarks,
      },
    });

    // Optimistic client update to remove tagToBookmark from state.tags
    dispatch({
      type: "UPDATE_UNIQUE_RESOURCE_METADATA",
      resource: "tag",
      identifierType: "name",
      identifier: tagNameToRemove,
      payload: updatedTag,
    });

    // Server request
    const updatedTagNames = currBookmarkTagNames.filter(
      (tagName) => tagName !== tagNameToRemove
    );
    const payload = {
      id: state.activeBookmark?.id,
      tags: updatedTagNames,
      performNow: true,
    };

    axiosUpdateResource("bookmark", payload, sessionToken, () => {}, onError);
  };

  return (
    <>
      {state.activeBookmark !== null && (
        <Transition
          show={true}
          appear={true}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={clsx(
              "flex flex-col h-full w-[28rem] border-l border-zinc-700 bg-zinc-800 overflow-y-auto overflow-x-hidden scrollbar scrollbar-track-stone-700 scrollbar-thumb-stone-500",
              !state.isShowingDetailedPanel && "max-w-0"
            )}
          >
            <div className="border-b border-zinc-700">
              {state.activeBookmark && (
                <BookmarkItem index={0} data={state.activeBookmark} />
              )}
            </div>
            {/* Title Section */}
            <div className="px-4 mt-1 w-full flex flex-col align-start">
              <span className=" text-white font-bold text-lg">Title</span>
              <div className="flex flex-grow relative max-h-[168px]">
                <textarea
                  ref={titleRef}
                  className="
                    w-full
                    overflow-hidden
                    px-4 py-1
                    resize-none
                    bg-transparent
                    break-words
                    outline-none
                    text-stone-100
                    transition
                    duration-200
                "
                  rows={1}
                  value={titleTextAreaValue}
                  onChange={(event) => {
                    handleTextAreaOnChange("title", event.target.value);
                  }}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => setIsTitleFocused(false)}
                  placeholder="Click to edit"
                />
                {/* Underline */}
                <div
                  className={clsx(
                    `
                    absolute
                    bottom-0
                    left-0
                    right-0
                    h-0.5
                    mx-4
                    transition
                    duration-200`,
                    isTitleFocused ? "bg-orange-300" : "bg-stone-700"
                  )}
                />
              </div>
            </div>

            {/* Collection and tags */}
            <div className="px-4 mt-4 w-full flex gap-x-1 justify-between text-start">
              <div className="flex flex-col gap-y-0.5 w-full text-start">
                <span className="text-white font-semibold text-lg">
                  Collection
                </span>
                {state.activeBookmark && <CollectionMenu />}
              </div>

              <div className="flex flex-col gap-y-0.5 w-full text-start">
                <span className=" text-white font-semibold text-lg">Tags</span>
                {/* Input */}
                <input
                  className="
                  w-full
                  max-w-44
                  max-h-8
                  mx-4 p-1
                  rounded-md
                  bg-zinc-900
                  hover:bg-zinc-800
                  border
                  border-transparent
                  outline-none
                  ring-2
                  ring-stone-700
                  focus:ring-orange-300
                  text-white
                  text-sm
                  transition
                  duration-200"
                  onKeyDown={(event) => handleTagsInputOnKeyDown(event)}
                  onChange={(event) =>
                    setNewTagInputValue(event.currentTarget.value)
                  }
                  value={newTagInputValue}
                ></input>
                {/* TagButtons */}
                <ul className="flex flex-wrap gap-0.5 mx-4 mt-1">
                  {currBookmarkTagNames &&
                    currBookmarkTagNames.map((tagName, index) => {
                      return (
                        <TagButton
                          key={`activeBookmark-tagToBookmark-${tagName}-${index}`}
                          name={tagName}
                          onClick={() => {
                            handleTagBtnOnClick(tagName);
                          }}
                        />
                      );
                    })}
                </ul>
              </div>

              <div className="flex flex-grow relative max-h-[168px]"></div>
            </div>

            {/* Notes Section */}
            <div className="px-4 mt-2 w-full">
              <span className=" text-white font-bold text-lg">Note</span>
              <div className="px-4">
                <textarea
                  ref={noteRef}
                  className="
                  w-full
                  h-28
                  px-4 py-2
                  resize-none
                  rounded-md
                  bg-zinc-900
                  hover:bg-zinc-800
                  outline-none
                  ring-2
                  ring-stone-700
                  focus:ring-orange-300
                  text-stone-100
                  break-words
                  transition
                  duration-200
                  overflow-y-auto
                  scrollbar-thin
                  scrollbar-track-rounded-full scrollbar-track-stone-700
                  scrollbar-thumb-rounded-full scrollbar-thumb-stone-500
                "
                  value={noteTextAreaValue}
                  onChange={(event) => {
                    handleTextAreaOnChange("note", event.target.value);
                  }}
                  placeholder="Click to edit"
                />
              </div>
            </div>

            {/* Page URL Section */}
            <div className="px-4 mt-2 w-full">
              <span className=" text-white font-bold text-lg">URL</span>
              <div className="px-4">
                <input
                  ref={urlRef}
                  className={clsx(`
                    w-full
                    px-4 py-2
                    rounded-md
                    bg-zinc-900
                    hover:bg-zinc-800
                    outline-none
                    ring-2
                    ring-stone-700
                    focus:ring-orange-300
                    text-stone-100
                    truncate
                    transition-all
                    duration-200
                  `)}
                  value={urlInputValue}
                  placeholder="Click to edit"
                  onChange={(event) => {
                    handleUrlInputOnKeyDown(event.target.value);
                  }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="px-4 mt-2 flex-grow w-full">
              <span className="text-white font-bold text-lg">Excerpt</span>
              <div className="px-4">
                <div
                  ref={excerptRef}
                  className="
                  w-full
                  px-4 py-2
                  resize-none
                  rounded-md
                  bg-zinc-900
                  outline-none
                  ring-2
                  ring-stone-700
                  text-gray-400
                  break-words
                  transition-colors
                  duration-300"
                >
                  <p className="line-clamp-4">
                    {excerptTextAreaValue !== ""
                      ? excerptTextAreaValue
                      : "No excerpt was parsed for this bookmark."}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Added */}
            <div className="px-4 mt-4 pb-1 text-end">
              <span className=" text-white font-bold text-sm">Date Added</span>
              <span className="text-gray-300 block text-sm">
                {state.activeBookmark && (
                  <span>
                    {formatDate(
                      state.activeBookmark.createdAt.toString() ?? ""
                    )}
                  </span>
                )}
              </span>
            </div>
          </div>
        </Transition>
      )}
    </>
  );
};

DetailedBookmarkPanel.displayName = "DetailedBookmarkPanel";
export default DetailedBookmarkPanel;
