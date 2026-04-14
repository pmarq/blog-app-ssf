// app/components/admin/LatestPostListCard.tsx

import { trimText } from "@/app/utils/helper";
import Link from "next/link";
import { FC } from "react";

interface Props {
  id: string;
  title: string;
  meta: string;
  onDeleteClick?(): void;
}

const LatestPostListCard: FC<Props> = ({
  id,
  title,
  meta,
  onDeleteClick,
}): JSX.Element => {
  return (
    <div>
      <h1 className="font-semibold text-lg text-primary-dark dark:text-primary transition">
        {trimText(title, 50)}
      </h1>
      <p className="text-sm text-secondary-dark">{trimText(meta, 100)}</p>

      <div className="flex items-center justify-end space-x-3">
        <Link
          href={`/dashboard/posts/update/${id}`}
          className="text-primary-dark dark:text-primary transition hover:underline"
        >
          Edit
        </Link>

        {onDeleteClick && (
          <button
            onClick={onDeleteClick}
            className="text-primary-dark dark:text-primary transition hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      <hr className="mt-2" />
    </div>
  );
};

export default LatestPostListCard;



