import type { InferSelectModel } from 'drizzle-orm';
import type { CommentTable, FollowersTable, NotificationTable, PostCommentTable, PostLikeTable, PostTable, SavePostTable, 
UserProfileTable, UserTable } from '../database/schema';

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
type TInferSelectUserNoPass = Omit<TInferSelectUser, 'password'>

type TActivationToken = {
    activationCode : string; activationToken : string;
}
type TCookieOptions = {
    expires : Date; maxAge : number; httpOnly : boolean; sameSite : 'lax' | 'strict' | 'none' | undefined; secure? : boolean;
}
declare global {
    namespace Express {
        interface Request {user? : TInferSelectUserNoPass;}
    }
}
type TVerifyActivationToken = {
    user : TInferSelectUser; activationCode : string;
}
type TUpdateProfileInfo = {
    fullName : string; bio : string; profilePic : string; gender : 'male' | 'female'; userId : string;
}
type TUserWithProfileInfo = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    profile : {
        fullName : TInferSelectUserProfile['fullName']; bio : TInferSelectUserProfile['bio']; profilePic : TInferSelectUserProfile['profilePic'];
        gender : TInferSelectUserProfile['gender']; isBan : TInferSelectUserProfile['isBan'];
    } | null
}
type TUserProfile = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    fullName ?: TInferSelectUserProfile['fullName']; bio? : TInferSelectUserProfile['bio']; profilePic? : TInferSelectUserProfile['profilePic'];
    gender? : TInferSelectUserProfile['gender']; isBan? : TInferSelectUserProfile['isBan'];
}
type TInferUpdateUser = {
    id : TInferSelectUser['id']; username? : TInferSelectUser['username']; email? : TInferSelectUser['email']; role? : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt? : TInferSelectUser['createdAt']; updatedAt? : TInferSelectUser['updatedAt'];
}
type TCacheIndex = {
    [key : string] : TUserProfile;
}