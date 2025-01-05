import { FC } from "react";
import { BsBoxArrowUpRight } from "react-icons/bs";
import parse from "html-react-parser";

import ProfileIcon from "../common/ProfileIcon";
import { LatestComment } from "../../utils/types";
import { trimText } from "@/app/utils/helper";
import Link from "next/link";

interface Props {
  comment: LatestComment;
}

const LatestCommentListCard: FC<Props> = ({ comment }): JSX.Element => {
  const { owner, belongsTo, content } = comment;
  return (
    <div className="flex space-x-2">
      <ProfileIcon nameInitial={owner.name[0]} avatar={owner.avatar} />

      <div className="flex-1">
        <p className="font-semibold text-primary-dark dark:text-primary transition">
          {owner.name}{" "}
          <span className="text-sm text-secondary-dark">commented on</span>
        </p>

        <Link
          href={"/" + belongsTo.slug}
          target="_blank"
          rel="noreferrer noopener"
          className="text-secondary-dark hover:underline"
        >
          <div className="flex items-center space-x-2">
            <BsBoxArrowUpRight size={12} />
            {trimText(belongsTo.title, 30)}
          </div>
        </Link>

        <div className="text-primary-dark dark:text-primary transition">
          {parse(content)}
        </div>
      </div>
    </div>
  );
};

export default LatestCommentListCard;
