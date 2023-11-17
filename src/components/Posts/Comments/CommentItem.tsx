import {
  Flex,
  Icon,
  Box,
  Stack,
  Text,
  Spinner,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { Timestamp, collection, doc, getDoc, getDocs, increment, orderBy, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaReddit } from "react-icons/fa";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";
import { BiMessage } from "react-icons/bi";
import CommentInput from "./CommentInput";
import { User } from "firebase/auth";
import { Post, postState } from "@/atoms/postsAtom";
import { firestore } from "@/firebase/clientApp";
import { useSetRecoilState } from "recoil";

export type Comment = {
  id: string;
  creatorId: string;
  creatorDisplayText: string;
  communityId: string;
  postId: string;
  postTitle: string;
  text: string;
  createdAt: Timestamp;
  comments: Array<Comment>;
  parent?: string;
};

type CommentItemProps = {
  parentCommentRef: any;
  comment: Comment;
  // onDeleteComment: (comment: Comment) => void;
  loadingDelete: boolean;
  userId: string;
  selectedPost?: Post | null;
  user: User;
  parent?: string;
};

const CommentItem: React.FC<CommentItemProps> = ({
  parentCommentRef,
  comment,
  // onDeleteComment,
  loadingDelete,
  userId,
  selectedPost,
  user,
  parent,
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(comment.comments);
  const [childComments, setChildComments] = useState<Comment[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const setPostState = useSetRecoilState(postState);

  const onCreateComment = async (commentText: string, user: User, parent: string) => {
    setCreateLoading(true);
    try {
      const batch = writeBatch(firestore);

      // create a comment document
      const commentDocRef = doc(collection(firestore, "comments"));

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user.uid,
        creatorDisplayText: user.email!.split("@")[0],
        communityId: comment?.communityId,
        postId: comment?.postId!,
        postTitle: comment?.postTitle!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
        comments: [],
        parent: parent,
      };
      
      batch.set(commentDocRef, newComment);

      newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp;

      const parentCommentDocRef = parent ? doc(firestore, "comments", parent) : null;

      if (parentCommentDocRef) {
      const parentCommentSnapshot = await getDoc(parentCommentDocRef);
      if (parentCommentSnapshot.exists()) {
        batch.update(parentCommentDocRef, {
          comments: [newComment.id, ...parentCommentSnapshot.data().comments],
        });
      } else {
        console.log("Parent comment document does not exist");
      }}

      // update post numberOfComments +1
      const postDocRef = doc(firestore, "posts", selectedPost?.id!);
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      });
      
      await batch.commit();
      
      // update client recoil state
      setCommentText("");
      setComments((prev) => [newComment, ...prev]);
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }));
    } catch (error) {
      console.log("onCreateComment error", error);
    }
    setCreateLoading(false);
  };

  const onDeleteComment = async (comment: Comment) => {
    await setLoadingDeleteId(comment.id);
    try {
      const batch = writeBatch(firestore);

    // Recursive function to update a comment and its nested comments as "deleted"
    const updateCommentAndNested = async (comment: Comment) => {
      const curID = comment.id ? comment.id : comment
      console.log(`loadingDeleteId: ${loadingDeleteId}, COMMENT: ${comment}, ID: ${curID}`);
      const commentDocRef = typeof curID === "string" ? doc(firestore, "comments", curID) : null;
      if (!commentDocRef) {
        console.log(`Invalid comment ID: ${curID}`);
        return;
      }

      // Check if the comment document exists before updating
      const commentSnapshot = await getDoc(commentDocRef);

      if (commentSnapshot.exists()) {
      // Update the comment's text and creatorDisplayText fields
      batch.update(commentDocRef, {
        text: "deleted",
        creatorDisplayText: "[deleted]",
      });

    } else {
      console.log(`comment document with ID ${comment.id} does not exist`);
    }};
      
    // Start the recursive update process
    await updateCommentAndNested(comment);

      // update post numberOfComments -1
      const postDocRef = doc(firestore, "posts", selectedPost?.id!);

      if (selectedPost?.numberOfComments! > 0) {
      batch.update(postDocRef, {
        numberOfComments: increment(-1),
      });
      }
      await batch.commit();

      // update client recoil state
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! > 0 ? prev.selectedPost?.numberOfComments! - 1 : 0,
        } as Post,
      }));
    } catch (error) {
      console.log("onDeleteComment error", error);
    }
    setLoadingDeleteId("");
  };

  const getSelectedComment = async () => {
    const commentId = comment.id ? comment.id : comment;
    console.log(`commentId is ${commentId}`);
    const commentDocRef = typeof commentId === "string" ? doc(firestore, "comments", commentId) : null;
      if (!commentDocRef) {
        console.log(`Invalid comment ID: ${commentId}`);
        return;
      }
    const commentSnapshot = await getDoc(commentDocRef);

    if (commentSnapshot.exists()) {
      setChildComments([commentSnapshot.data() as Comment]);
    }
  }

  useEffect(() => {
    getSelectedComment()
  }, [comment])
  

  return (
      (<>
    <Flex>
      <Box mr={2}>
        <Icon as={FaReddit} fontSize={30} color="gray.300" />
      </Box>
      <Stack spacing={1} width="100%">
        <Stack direction="row" align="center" fontSize="8pt">
          <Text fontWeight={700}>{childComments[0]?.creatorDisplayText}</Text>
          <Text color="gray.600">
            {moment(new Date(childComments[0]?.createdAt?.seconds * 1000)).fromNow()}
          </Text>
          {loadingDelete && <Spinner size="sm" />}
        </Stack>
        <Text fontSize="10pt">{childComments[0]?.text}</Text>
        <Stack direction="row" align="center" cursor="pointer" color="gray.500">
          <Icon as={IoArrowUpCircleOutline} />
          <Icon as={IoArrowDownCircleOutline} />
          <Icon as={BiMessage} onClick={() => setIsReplying(!isReplying)} />
          {userId === childComments[0]?.creatorId && (
            <>
              <Text fontSize="9pt" _hover={{ color: "blue.500" }}>
                Edit
              </Text>
              <Text
                fontSize="9pt"
                _hover={{ color: "blue.500" }}
                onClick={() => onDeleteComment(childComments ? childComments[0] : comment)}
              >
                Delete
              </Text>
            </>
          )}
        </Stack>
        {isReplying && (
          <Stack>
            <Flex direction="column" position="relative">
              <Textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="What are your thoughts?"
                fontSize="10pt"
                borderRadius={4}
                minHeight="160px"
                pb={10}
                _placeholder={{ color: "gray.500" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid black",
                }}
              />
              <Flex
                position="absolute"
                left="1px"
                right={0.1}
                bottom="1px"
                justify="flex-end"
                bg="gray.100"
                p="6px 8px"
                borderRadius="0px 0px 4px 4px"
              >
                <Button
                  height="26px"
                  disabled={!commentText.length}
                  isLoading={createLoading}
                  onClick={() => {
                    onCreateComment(commentText, user, comment.id);
                    setIsReplying(false);
                  }}
                >
                  Comment
                </Button>
              </Flex>
            </Flex>
          </Stack>
        )}
        {comments?.length > 0 && (
          <Stack spacing={2} my={2}>
            {comments.map((comment, idx) => (
              <CommentItem
                key={idx}
                parentCommentRef={parentCommentRef}
                comment={comment}
                loadingDelete={loadingDelete}
                userId={userId}
                selectedPost={selectedPost}
                user={user}
                parent={comment.parent}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Flex>
    </>) 
  );
};

export default CommentItem;
