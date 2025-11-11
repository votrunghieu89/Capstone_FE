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
      <div className="bg-secondary-200 aspect-[16/9] relative overflow-hidden">
        {thumbnailUrl && thumbnailUrl.trim() !== "" ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Show placeholder on error
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector(".placeholder-icon")) {
                const placeholder = document.createElement("div");
                placeholder.className =
                  "placeholder-icon absolute inset-0 flex items-center justify-center bg-secondary-100";
                placeholder.innerHTML = `
                  <svg class="w-12 h-12 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                `;
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
            <svg
              className="w-12 h-12 text-secondary-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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
