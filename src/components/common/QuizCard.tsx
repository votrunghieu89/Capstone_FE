import React from "react";
import { Button } from "./Button";

interface QuizCardProps {
  thumbnailUrl?: string;
  topic?: string;
  title: string;
  questionCount: number;
  plays?: number;
  teacherName?: string;
  dateCreated?: string;
  expiredDate?: string;
  onDetail?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  thumbnailUrl,
  topic,
  title,
  questionCount,
  plays,
  teacherName,
  dateCreated,
  expiredDate,
  onDetail,
}) => {
  return (
    <div className="card overflow-hidden h-full flex flex-col">
      <div className="bg-secondary-200 aspect-[16/9]">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="card-content flex flex-col grow">
        {topic && (
          <div className="inline-flex px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700 mb-2 w-fit">
            {topic}
          </div>
        )}
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
          {title}
        </h3>

        {/* Teacher Name */}
        {teacherName && (
          <p className="text-sm text-secondary-600 mb-2">
            Giáo viên: <span className="font-medium">{teacherName}</span>
          </p>
        )}

        <div className="flex items-center justify-between text-secondary-600 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h10v2H4v-2z" />
              </svg>
              {questionCount} câu
            </span>
          </div>
          {plays !== undefined && (
            <span className="text-sm">{plays.toLocaleString()} lượt chơi</span>
          )}
        </div>

        {/* Date Information */}
        {(dateCreated || expiredDate) && (
          <div className="text-xs text-secondary-500 mb-3 space-y-1">
            {dateCreated && (
              <div>
                Ngày tạo: {new Date(dateCreated).toLocaleDateString("vi-VN")}
              </div>
            )}
            {expiredDate && (
              <div className="text-error-600">
                Hết hạn: {new Date(expiredDate).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto">
          <Button className="w-full justify-center" onClick={onDetail}>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
};
