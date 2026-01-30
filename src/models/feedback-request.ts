export interface FeedbackRequest {

}

export class IssueCommentReactionRequest implements FeedbackRequest {
    constructor(
        public readonly projectId: number,
        public readonly issueId: number,
        public readonly commentId: number,
        public readonly emoji: string,
    ) {

    }
}

export class IssueCommentRequest implements FeedbackRequest {
    constructor(
        public readonly projectId: number,
        public readonly issueId: number,
        public readonly commentText: string,
    ) {

    }
}

export class MergeRequestDiscussionRequest implements FeedbackRequest {
    constructor(
        public readonly projectId: number,
        public readonly mergeRequestId: number,
        public readonly discussionId: string,
        public readonly commentText: string,
    ) {

    }
}

export class MergeRequestNoteRequest implements FeedbackRequest {
    constructor(
        public readonly projectId: number,
        public readonly mergeRequestId: number,
        public readonly commentText: string,
    ) {

    }
}
