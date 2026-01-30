import {
    FeedbackRequest,
    IssueCommentReactionRequest,
    IssueCommentRequest,
    MergeRequestDiscussionRequest,
    MergeRequestNoteRequest
} from "./feedback-request.js";
import {
    CODE_REVIEW_TRIGGER_PHRASE_REGEXP,
    createCodeReviewPrompt,
    JUNIE_STARTED_MESSAGE,
    JUNIE_FINISHED_PREFIX,
    JUNIE_NO_CHANGES_MESSAGE,
    MR_LINK_PREFIX,
    MR_INTRO_HEADER,
    generateMcpNote,
    GIT_OPERATIONS_NOTE
} from "../constants/gitlab.js";
import {IssueCommentEventContext, MergeRequestCommentEventContext, MergeRequestEventContext} from "../context.js";

/**
 * Issue data from GitLab API
 */
export interface IssueData {
    title: string;
    description: string;
}

/**
 * Merge Request data from GitLab API
 */
export interface MergeRequestData {
    title: string;
    description: string;
    web_url: string;
}

export type TaskExtractionResult = FailedTaskExtractionResult | SuccessfulTaskExtractionResult;

export class FailedTaskExtractionResult {
    public readonly success = false;

    constructor(public readonly reason: string) {
    }
}

export interface SuccessfulTaskExtractionResult {
    success: true;
    checkoutBranch: string | null;
    generateJuniePrompt(useMcp: boolean): string;
    getTitle(): string;
    generateMrIntro(outcome: string | null): string;
    generateExecutionStartedFeedback(): FeedbackRequest[];
    generateExecutionFinishedFeedback(outcome: string | null, taskName: string | null, createdMrUrl: string | null): FeedbackRequest[];
}

export class IssueCommentTask implements SuccessfulTaskExtractionResult {
    public readonly success = true;
    public readonly checkoutBranch = null;

    constructor(
        public readonly context: IssueCommentEventContext,
        public readonly issue: IssueData,
    ) {}

    generateJuniePrompt(useMcp: boolean): string {
        const { commentText, cliOptions: { customPrompt }, projectId, issueId, commentId } = this.context;
        const { title, description } = this.issue;

        let taskText: string;
        if (customPrompt) {
            taskText = `${customPrompt}\n\nIssue: ${title}\n\n${description}\n\nComment: ${commentText}`;
        } else {
            taskText = `${description}\n\n${commentText}`;
        }

        const mcpNote = generateMcpNote({ projectId, issueId, commentId });
        const object = {
            textTask: {
                text: taskText + (useMcp ? mcpNote : '') + GIT_OPERATIONS_NOTE,
            }
        };
        return JSON.stringify(object);
    }

    getTitle(): string {
        return this.issue.title;
    }

    generateMrIntro(outcome: string | null): string {
        return MR_INTRO_HEADER + (outcome ?? "");
    }

    generateExecutionStartedFeedback(): FeedbackRequest[] {
        const { projectId, issueId, commentId } = this.context;
        return [
            new IssueCommentRequest(projectId, issueId, JUNIE_STARTED_MESSAGE),
            new IssueCommentReactionRequest(projectId, issueId, commentId, "thumbsup"),
        ];
    }

    generateExecutionFinishedFeedback(outcome: string | null, taskName: string | null, createdMrUrl: string | null): FeedbackRequest[] {
        const { projectId, issueId } = this.context;

        let message = JUNIE_FINISHED_PREFIX;

        if (createdMrUrl) {
            message += MR_LINK_PREFIX + createdMrUrl;
        } else if (outcome) {
            if (taskName) {
                message += `**Task:** ${taskName}\n\n`;
            }
            message += outcome;
        } else {
            message += JUNIE_NO_CHANGES_MESSAGE;
        }

        return [
            new IssueCommentRequest(projectId, issueId, message.trim()),
        ];
    }
}

export class MergeRequestCommentTask implements SuccessfulTaskExtractionResult {
    public readonly success = true;

    constructor(
        public readonly context: MergeRequestCommentEventContext,
        public readonly mergeRequest: MergeRequestData,
    ) { }

    get checkoutBranch(): string {
        return this.context.mergeRequestSourceBranch;
    }

    generateJuniePrompt(useMcp: boolean): string {
        const { commentText, cliOptions: { customPrompt }, projectId, mergeRequestId, commentId } = this.context;
        const { title, description } = this.mergeRequest;

        // Check if this is a code review request
        const isCodeReviewInPrompt = customPrompt && CODE_REVIEW_TRIGGER_PHRASE_REGEXP.test(customPrompt);
        const isCodeReviewInComment = CODE_REVIEW_TRIGGER_PHRASE_REGEXP.test(commentText);
        const isCodeReview = isCodeReviewInPrompt || isCodeReviewInComment;

        let taskText: string;
        if (isCodeReview) {
            // Use the specialized code review prompt
            taskText = createCodeReviewPrompt(mergeRequestId);
        } else if (customPrompt) {
            // Use custom prompt if provided and not a code review
            taskText = `${customPrompt}\n\nMerge request title: ${title}\n` +
                `Merge request description: ${description}\n` +
                `Comment text: ${commentText}\n`;
        } else {
            // Default behavior
            taskText = `Merge request title: ${title}\n` +
                `Merge request description: ${description}\n` +
                `Comment text: ${commentText}\n`;
        }

        const mcpNote = generateMcpNote({ projectId, mergeRequestId, commentId });

        const object = {
            textTask: {
                text: taskText  + (useMcp ? mcpNote : '') + GIT_OPERATIONS_NOTE,
            }
        };
        return JSON.stringify(object);
    }

    getTitle(): string {
        return this.mergeRequest.title;
    }

    generateMrIntro(outcome: string | null): string {
        return MR_INTRO_HEADER + (outcome ?? "");
    }

    generateExecutionStartedFeedback(): FeedbackRequest[] {
        const { projectId, mergeRequestId, mergeRequestDiscussionId } = this.context;
        return [
            new MergeRequestDiscussionRequest(
                projectId,
                mergeRequestId,
                mergeRequestDiscussionId,
                JUNIE_STARTED_MESSAGE
            ),
        ];
    }

    generateExecutionFinishedFeedback(outcome: string | null, taskName: string | null, createdMrUrl: string | null): FeedbackRequest[] {
        const { projectId, mergeRequestId, mergeRequestDiscussionId } = this.context;

        let message = JUNIE_FINISHED_PREFIX;

        if (createdMrUrl) {
            message += MR_LINK_PREFIX + createdMrUrl;
        } else if (outcome) {
            if (taskName) {
                message += `**Task:** ${taskName}\n\n`;
            }
            message += outcome;
        } else {
            message += JUNIE_NO_CHANGES_MESSAGE;
        }

        return [
            new MergeRequestDiscussionRequest(
                projectId,
                mergeRequestId,
                mergeRequestDiscussionId,
                message.trim()
            ),
        ];
    }

}

export class MergeRequestEventTask implements SuccessfulTaskExtractionResult {
    public readonly success = true;

    constructor(
        public readonly context: MergeRequestEventContext,
    ) { }

    get checkoutBranch(): string {
        return this.context.mrEventSourceBranch;
    }

    generateJuniePrompt(useMcp: boolean): string {
        const { projectId, mrEventId, mrEventTitle, mrEventDescription, cliOptions: { customPrompt } } = this.context;

        // Check if this is a code review request
        const isCodeReview = customPrompt && CODE_REVIEW_TRIGGER_PHRASE_REGEXP.test(customPrompt);

        let taskText: string;
        if (isCodeReview) {
            // Use the specialized code review prompt
            taskText = createCodeReviewPrompt(mrEventId);
        } else if (customPrompt) {
            // Use custom prompt if provided and not a code review
            taskText = `${customPrompt}\n\nMerge request title: ${mrEventTitle}\n` +
                `Merge request description: ${mrEventDescription}\n`;
        } else {
            // Default: review the MR
            taskText = `Merge request title: ${mrEventTitle}\n` +
                `Merge request description: ${mrEventDescription}\n`;
        }

        const mcpNote = generateMcpNote({ projectId, mergeRequestId: mrEventId });

        const object = {
            textTask: {
                text: taskText  + (useMcp ? mcpNote : '') + GIT_OPERATIONS_NOTE,
            }
        };
        return JSON.stringify(object);
    }

    getTitle(): string {
        return this.context.mrEventTitle;
    }

    generateMrIntro(outcome: string | null): string {
        return MR_INTRO_HEADER + (outcome ?? "");
    }

    generateExecutionStartedFeedback(): FeedbackRequest[] {
        const { projectId, mrEventId } = this.context;
        return [
            new MergeRequestNoteRequest(
                projectId,
                mrEventId,
                JUNIE_STARTED_MESSAGE
            ),
        ];
    }

    generateExecutionFinishedFeedback(outcome: string | null, taskName: string | null, createdMrUrl: string | null): FeedbackRequest[] {
        const { projectId, mrEventId } = this.context;

        let message = JUNIE_FINISHED_PREFIX;

        if (createdMrUrl) {
            message += MR_LINK_PREFIX + createdMrUrl;
        } else if (outcome) {
            if (taskName) {
                message += `**Task:** ${taskName}\n\n`;
            }
            message += outcome;
        } else {
            message += JUNIE_NO_CHANGES_MESSAGE;
        }

        return [
            new MergeRequestNoteRequest(
                projectId,
                mrEventId,
                message.trim()
            ),
        ];
    }

}