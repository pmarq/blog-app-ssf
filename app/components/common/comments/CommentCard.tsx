// components/CommentCard.tsx

import { FC, ReactNode, useState } from "react";
import dateFormat from "dateformat";
import parse from "html-react-parser";
import { ReplyAll, Trash2, Edit } from "lucide-react"; // Icons from Lucide
import CommentForm from "./CommentForm";
import LikeHeart from "../LikeHeart";
import ProfileIcon from "../ProfileIcon";
import { CommentResponse } from "@/app/utils/types";

interface Props {
  comment: CommentResponse;
  showControls?: boolean;
  onUpdateSubmit?(content: string): void;
  onReplySubmit?(content: string): void;
  onDeleteClick?(): void;
  onLikeClick?(): void;
}

const CommentCard: FC<Props> = ({
  comment,
  showControls = false,
  onUpdateSubmit,
  onReplySubmit,
  onDeleteClick,
  onLikeClick,
}): JSX.Element => {
  const { owner, createdAt, content, /* likedByOwner, */ likes } = comment;
  const { name, avatar } = owner;
  const [showForm, setShowForm] = useState(false);
  const [initialState, setInitialState] = useState("");

  const displayReplyForm = () => {
    setInitialState("");
    setShowForm(true);
  };

  const hideReplyForm = () => {
    setShowForm(false);
  };

  const handleOnReplyClick = () => {
    displayReplyForm();
  };

  const handleOnEditClick = () => {
    displayReplyForm();
    setInitialState(content);
  };

  const handleCommentSubmit = (commentContent: string) => {
    if (initialState) {
      // Update the comment
      onUpdateSubmit && onUpdateSubmit(commentContent);
    } else {
      // Reply to the comment
      onReplySubmit && onReplySubmit(commentContent);
    }
    hideReplyForm();
  };

  // Function to safely format the date
  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return dateFormat(date, "d-mmm-yyyy");
  };

  return (
    <div className="flex space-x-3">
      <ProfileIcon nameInitial={name[0].toUpperCase()} avatar={avatar} />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-primary-dark dark:text-primary font-semibold">
            {name}
          </h1>
          <span className="text-sm text-secondary-dark">
            {formatDate(createdAt)}
          </span>
        </div>
        <div className="mt-1 text-primary-dark dark:text-primary">
          {parse(content)}
        </div>

        <div className="flex space-x-4 mt-2">
          <LikeHeart
            /* liked={likedByOwner} */
            label={`${likes} ${likes === 1 ? "like" : "likes"}`}
            onClick={onLikeClick}
          />
          <Button onClick={handleOnReplyClick}>
            <ReplyAll className="w-4 h-4" />
            <span>Reply</span>
          </Button>
          {showControls && (
            <>
              <Button onClick={handleOnEditClick}>
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
              <Button onClick={onDeleteClick}>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </>
          )}
        </div>

        {showForm && (
          <div className="mt-3 ml-8">
            <CommentForm
              onSubmit={handleCommentSubmit}
              onClose={hideReplyForm}
              initialState={initialState}
              title={initialState ? "Edit comment" : "Reply to comment"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;

interface ButtonProps {
  children: ReactNode;
  onClick?(): void;
}

const Button: FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-primary-dark dark:text-primary space-x-2 hover:underline"
      aria-label="Button action"
    >
      {children}
    </button>
  );
};