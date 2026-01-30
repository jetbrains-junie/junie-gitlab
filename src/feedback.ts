import {
    FeedbackRequest,
    IssueCommentReactionRequest,
    IssueCommentRequest,
    MergeRequestDiscussionRequest,
    MergeRequestNoteRequest
} from "./models/feedback-request.js";
import {addIssueComment, addIssueCommentEmoji, addMergeRequestDiscussionNote, addMergeRequestNote} from "./api/gitlab-api.js";
import {logger} from "./utils/logging.js";

export async function submitFeedback(request: FeedbackRequest) {

    if (request instanceof IssueCommentReactionRequest) {
        try {
            await addIssueCommentEmoji(
                request.projectId,
                request.issueId,
                request.commentId,
                request.emoji,
            );
        } catch (e) {
            logger.debug(`Failed to add emoji ${request.emoji} to comment ${request.commentId} in issue ${request.issueId} (probably it's already set)`);
        }
    } else if (request instanceof IssueCommentRequest) {
        await addIssueComment(
            request.projectId,
            request.issueId,
            request.commentText
        );
    } else if (request instanceof MergeRequestDiscussionRequest) {
        await addMergeRequestDiscussionNote(
            request.projectId,
            request.mergeRequestId,
            request.discussionId,
            request.commentText,
        );
    } else if (request instanceof MergeRequestNoteRequest) {
        await addMergeRequestNote(
            request.projectId,
            request.mergeRequestId,
            request.commentText,
        );
    } else {
        throw new Error(`Unsupported feedback request type: ${request.constructor.name}`);
    }

}
