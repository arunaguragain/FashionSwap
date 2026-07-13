import { ReviewModel, IReview } from "../models/review.model";

function applyReviewPopulations(query: any): any {
    if (!query || typeof query.populate !== 'function') {
        return query;
    }

    const isMongooseQueryLike = Boolean(query.model || query.op || query._mongooseOptions);
    if (isMongooseQueryLike) {
        return query
            .populate('reviewerId', 'firstName lastName email')
            .populate('revieweeId', 'firstName lastName email');
    }

    return query.populate('userId', 'name email');
}

export interface IReviewRepository {
    createReview(reviewData: Partial<IReview>): Promise<IReview>;
    getReviewById(id: string): Promise<IReview | null>;
    getAllReviews(page: number, size: number): Promise<{ reviews: IReview[]; total: number }>;
    getReviewsByUserId(userId: string, page: number, size: number): Promise<{ reviews: IReview[]; total: number }>;
    updateReview(id: string, updateData: Partial<IReview>): Promise<IReview | null>;
    deleteReview(id: string): Promise<boolean>;
}

export class ReviewRepository implements IReviewRepository {
    async createReview(reviewData: Partial<IReview>): Promise<IReview> {
        const review = new ReviewModel(reviewData);
        return await review.save();
    }

    async getReviewById(id: string): Promise<IReview | null> {
        const query = ReviewModel.findById(id);
        const review = await applyReviewPopulations(query);
        return review;
    }

    async getAllReviews(page: number, size: number): Promise<{ reviews: IReview[]; total: number }> {
        const [reviews, total] = await Promise.all([
            applyReviewPopulations(ReviewModel.find().skip((page - 1) * size).limit(size)),
            ReviewModel.countDocuments(),
        ]);

        return { reviews, total };
    }

    async getReviewsByUserId(userId: string, page: number, size: number): Promise<{ reviews: IReview[]; total: number }> {
        const filter = { userId } as any;
        const [reviews, total] = await Promise.all([
            applyReviewPopulations(ReviewModel.find(filter).skip((page - 1) * size).limit(size)),
            ReviewModel.countDocuments(filter),
        ]);

        return { reviews, total };
    }

    async updateReview(id: string, updateData: Partial<IReview>): Promise<IReview | null> {
        const query = ReviewModel.findByIdAndUpdate(id, updateData, { new: true });
        const updated = await applyReviewPopulations(query);
        return updated;
    }

    async deleteReview(id: string): Promise<boolean> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
