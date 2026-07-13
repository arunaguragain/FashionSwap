import mongoose from "mongoose";
import { ReviewRepository } from "../repositories/review.repository";
import { IReview } from "../models/review.model";
import { HttpError } from "../errors/http-error";

let reviewRepository = new ReviewRepository();

function extractOwnerId(owner: any): string | undefined {
    if (!owner) return undefined;
    if (typeof owner === 'string') return owner;
    if (owner._id) return owner._id.toString();
    if (owner.id) return owner.id.toString();
    try {
        return owner.toString();
    } catch {
        return undefined;
    }
}

export class ReviewService {
    async createReview(reviewData: Partial<IReview>, userId: string) {
        if (!userId) {
            throw new HttpError(400, "User ID is required");
        }

        const normalizedReviewData = {
            ...reviewData,
            reviewerId: userId as any,
            reviewerRole: (reviewData as any).reviewerRole || 'buyer',
            revieweeId: (reviewData as any).revieweeId || (reviewData as any).userId || userId as any,
            userId: (reviewData as any).userId || (reviewData as any).revieweeId || userId as any,
            orderId: (reviewData as any).orderId || new mongoose.Types.ObjectId(),
            communicationQuality: (reviewData as any).communicationQuality ?? 5,
            reliability: (reviewData as any).reliability ?? 5,
        } as Partial<IReview>;

        const newReview = await reviewRepository.createReview(normalizedReviewData);
        return newReview;
    }

    async getAllReviews(page?: string, size?: string) {
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const { reviews, total } = await reviewRepository.getAllReviews(pageNumber, pageSize);
        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { reviews, pagination };
    }

    async getReviewById(id: string) {
        if (!id) {
            throw new HttpError(400, "Review ID is required");
        }
        const review = await reviewRepository.getReviewById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }
        return review;
    }

    async getReviewsByUserId(userId: string, page?: string, size?: string) {
        if (!userId) {
            throw new HttpError(400, "User ID is required");
        }
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const { reviews, total } = await reviewRepository.getReviewsByUserId(userId, pageNumber, pageSize);
        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { reviews, pagination };
    }

    async updateReview(id: string, updateData: Partial<IReview>, userId?: string) {
        if (!id) {
            throw new HttpError(400, "Review ID is required");
        }

        const review = await reviewRepository.getReviewById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Only author can update — normalize populated reviewer objects or raw ObjectId
        if (userId) {
            const reviewOwnerId = extractOwnerId((review as any).reviewerId ?? (review as any).userId);

            if (!reviewOwnerId || reviewOwnerId !== userId) {
                throw new HttpError(403, "Not authorized to update this review");
            }
        }

        const updated = await reviewRepository.updateReview(id, updateData);
        return updated;
    }

    async deleteReview(id: string, userId?: string) {
        if (!id) {
            throw new HttpError(400, "Review ID is required");
        }

        const review = await reviewRepository.getReviewById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        if (userId) {
            const reviewOwnerId = extractOwnerId((review as any).reviewerId ?? (review as any).userId);

            if (!reviewOwnerId || reviewOwnerId !== userId) {
                throw new HttpError(403, "Not authorized to delete this review");
            }
        }

        const deleted = await reviewRepository.deleteReview(id);
        return deleted;
    }
}
