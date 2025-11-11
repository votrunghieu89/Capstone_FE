import { apiClient } from "../libs/apiClient";

// ============ TYPES ============

export interface FavouriteQuizDTO {
  quizId: number;
  title: string;
  avatarURL: string;
  totalQuestions: number;
  topicName: string;
  totalParticipants: number;
  createdBy: string;
  // Note: BE doesn't return favouriteId in the response
  // We need to get it from the quizzFavourites table using accountId + quizId
}

// ============ FAVOURITE SERVICE ============

class FavouriteService {
  /**
   * Get all favourite quizzes for current user
   * GET /api/Favourite/getAllFavouriteQuizzes/{accountId}
   */
  async getAllFavouriteQuizzes(accountId: number): Promise<FavouriteQuizDTO[]> {
    const response = await apiClient.get<FavouriteQuizDTO[]>(
      `/Favourite/getAllFavouriteQuizzes/${accountId}`
    );
    return response;
  }

  /**
   * Check if a quiz is in favourites
   * GET /api/Favourite/isFavouriteExists?accountId={accountId}&quizzId={quizzId}
   */
  async isFavouriteExists(
    accountId: number,
    quizzId: number
  ): Promise<boolean> {
    const response = await apiClient.get<boolean>(
      `/Favourite/isFavouriteExists`,
      {
        params: { accountId, quizzId },
      }
    );
    return response;
  }

  /**
   * Add a quiz to favourites
   * POST /api/Favourite/insertFavouriteQuiz?accountId={accountId}&quizzId={quizzId}
   */
  async addFavouriteQuiz(accountId: number, quizzId: number): Promise<string> {
    const response = await apiClient.post<string>(
      `/Favourite/insertFavouriteQuiz`,
      null,
      {
        params: { accountId, quizzId },
      }
    );
    return response;
  }

  /**
   * Remove a quiz from favourites (by favouriteId)
   * DELETE /api/Favourite/removeFavouriteQuiz?quizzFID={quizzFID}
   * Note: Need to get favouriteId first from the quiz list
   */
  async removeFavouriteQuiz(quizzFID: number): Promise<boolean> {
    const response = await apiClient.delete<boolean>(
      `/Favourite/removeFavouriteQuiz`,
      {
        params: { quizzFID },
      }
    );
    return response;
  }

  /**
   * Remove a quiz from favourites (by accountId and quizId)
   * DELETE /api/Favourite/removeFavouriteQuizByAccountAndQuiz?accountId={accountId}&quizzId={quizzId}
   */
  async removeFavouriteQuizByAccountAndQuiz(
    accountId: number,
    quizzId: number
  ): Promise<boolean> {
    const response = await apiClient.delete<boolean>(
      `/Favourite/removeFavouriteQuizByAccountAndQuiz`,
      {
        params: { accountId, quizzId },
      }
    );
    return response;
  }
}

export const favouriteService = new FavouriteService();
