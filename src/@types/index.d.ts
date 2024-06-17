import type { InferSelectModel } from 'drizzle-orm';
import type { CommentTable, FollowersTable, NotificationTable, PostCommentTable, PostLikeTable, PostTable, SavePostTable, 
UserProfileTable, UserTable } from '../db/schema';

type TErrorHandler = {
    statusCode : number; message : string;
}
type TInferSelectUser = InferSelectModel<typeof UserTable>
type TInferSelectUserProfile = InferSelectModel<typeof UserProfileTable>
type TInferSelectFollowers = InferSelectModel<typeof FollowersTable>

type TInferSelectPost = InferSelectModel<typeof PostTable>
type TInferSelectComment = InferSelectModel<typeof CommentTable>
type TInferSelectReplies = InferSelectModel<typeof RepliesTable>

type TInferSelectPostComment = InferSelectModel<typeof PostCommentTable>
type TInferSelectPostLike = InferSelectModel<typeof PostLikeTable>
type TInferSelectNotification = InferSelectModel<typeof NotificationTable>

type TInferSelectSavePost = InferSelectModel<typeof SavePostTable>

type TActivationToken = {
    activationCode : string; activationToken : string;
}
type TCookieOptions = {
    expires : Date; maxAge : number; httpOnly : boolean; sameSite : 'lax' | 'strict' | 'none' | undefined; secure? : boolean;
}
declare global {
    namespace Express {
        interface Request {user? : Omit<TInferSelectUser, 'password'>;}
    }
}

type TVerifyActivationToken = {
    user : TInferSelectUser; activationCode : string;
}