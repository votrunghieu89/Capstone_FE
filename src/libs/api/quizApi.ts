//quizApi.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient'; 

export interface PublicQuizItem {
    quizId: number;
    title: string;
    topicName: string;
    totalQuestion: number;
    avatarURL: string;
    description: string;
    totalParticipants: number; 
    plays: number; 
}
const BASE_URL = "http://localhost:5119";

/**
 * @param page The page number to fetch (starting from 1).
 * @param pageSize The number of items per page.
 */
const fetchPublicQuizzes = async (page: number, pageSize: number): Promise<PublicQuizItem[]> => {
  const url = `/Quiz/GetAllQuizzes?page=${page}&pageSize=${pageSize}`;
  const response = await apiClient.get<PublicQuizItem[]>(url);

  const fixedData = response.map((quiz) => {
    let fixedUrl = quiz.avatarURL?.trim() || "";

    if (fixedUrl) {
      // 1️⃣ Loại bỏ tất cả tiền tố "http://localhost:5119/" bị lặp nhiều lần
      fixedUrl = fixedUrl.replace(/(http:\/\/localhost:5119\/)+(api\/)?/g, "");

      // 2️⃣ Nếu sau khi xử lý mà không bắt đầu bằng "http", thêm lại domain đúng
      if (!fixedUrl.startsWith("http")) {
        fixedUrl = `${BASE_URL}/${fixedUrl}`;
      }

      // 3️⃣ Đảm bảo không còn dấu "//" thừa
      fixedUrl = fixedUrl.replace(/([^:]\/)\/+/g, "$1");
    }

    return {
      ...quiz,
      avatarURL: fixedUrl,
    };
  });

  return fixedData;
};

/**
 * Hook to retrieve the list of public quizzes, optimized with caching.
 * @param page The current page number.
 * @param pageSize The number of quizzes per page.
 */

export const useGetPublicQuizzes = (
  page: number = 1,
  pageSize: number = 6
) => {
  return useQuery<PublicQuizItem[], Error>({
    queryKey: ["publicQuizzes", page, pageSize],
    queryFn: async () => {
      const data = await fetchPublicQuizzes(page, pageSize);

      // ✅ CHỈ nối domain nếu path KHÔNG có "http" và KHÔNG bắt đầu bằng "/"
      return data.map((quiz) => {
        let avatar = quiz.avatarURL;
        if (avatar && !avatar.startsWith("http") && !avatar.startsWith("/")) {
          avatar = `${BASE_URL}/${avatar}`;
        }
        return { ...quiz, avatarURL: avatar };
      });
    },
    staleTime: 0,
  });
};
export const useFilterByTopic = (topic: number | null, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['filterByTopic', topic, page, pageSize],
    queryFn: async () => {
      if (topic === null) return [];
      const res = await apiClient.get(
        `/Search/filterByTopic?topic=${topic}&page=${page}&pageSize=${pageSize}`
      );
      return res;
    },
    enabled: topic !== null,
  });
};
export const checkQuizExpired = async (quizId: number, qgId: number) => {
  const response = await apiClient.post("/TeacherReport/check-expired", {
    quizid: quizId,
    qgId: qgId
  });
  return response;
};

export const endQuizNow = async (quizId: number, groupId: number) => {
  const response = await apiClient.post("/TeacherReport/end-now", {
    quizid: quizId,
    groupid: groupId
  });
  return response;
};