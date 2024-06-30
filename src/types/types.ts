import type { InferSelectModel } from 'drizzle-orm';
import type { CommentTable, FollowersTable, NotificationTable, PostCommentTable, PostLikeTable, PostTable, PostTagTable, RepliesTable, SavePostTable, 
UserProfileTable, UserTable } from '../database/schema';

export type TErrorHandler = {
    statusCode : number; message : string;
}

export type TInferSelectUser = InferSelectModel<typeof UserTable>
export type TInferSelectUserProfile = InferSelectModel<typeof UserProfileTable>
export type TInferSelectFollowers = InferSelectModel<typeof FollowersTable>

export type TInferSelectPost = InferSelectModel<typeof PostTable>
export type TInferSelectComment = InferSelectModel<typeof CommentTable>
export type TInferSelectReplies = InferSelectModel<typeof RepliesTable>

export type TInferSelectPostComment = InferSelectModel<typeof PostCommentTable>
export type TInferSelectPostLike = InferSelectModel<typeof PostLikeTable>
export type TInferSelectNotification = InferSelectModel<typeof NotificationTable>

export type TInferSelectSavePost = InferSelectModel<typeof SavePostTable>
export type TInferSelectTag = InferSelectModel<typeof PostTagTable>;
export type TInferSelectUserNoPass = Omit<TInferSelectUser, 'password'>

export type TActivationToken = {
    activationCode : string; activationToken : string;
}

export type TCookieOptions = {
    expires : Date; maxAge : number; httpOnly : boolean; sameSite : 'lax' | 'strict' | 'none' | undefined; secure? : boolean;
}

declare global {
    namespace Express {
        interface Request {user? : TInferSelectUserNoPass;}
    }
}

export type TVerifyActivationToken = {
    user : TInferSelectUser; activationCode : string;
}

export type TUpdateProfileInfo = {
    fullName : string; bio : string; profilePic : string; gender : 'male' | 'female'; userId : string;
}

export type TUserWithProfileInfo = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    profile : {
        fullName : TInferSelectUserProfile['fullName']; bio : TInferSelectUserProfile['bio']; profilePic : TInferSelectUserProfile['profilePic'];
        gender : TInferSelectUserProfile['gender']; isBan : TInferSelectUserProfile['isBan'];
    } | null
}
export type TUserProfile = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    fullName? : TInferSelectUserProfile['fullName']; bio? : TInferSelectUserProfile['bio']; profilePic? : TInferSelectUserProfile['profilePic'];
    gender? : TInferSelectUserProfile['gender']; isBan? : TInferSelectUserProfile['isBan'];
}

export type TInferUpdateUser = {
    id : TInferSelectUser['id']; username? : TInferSelectUser['username']; email? : TInferSelectUser['email']; role? : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt? : TInferSelectUser['createdAt']; updatedAt? : TInferSelectUser['updatedAt'];
}

export type TCacheIndex = {
    [key : string] : TUserProfile;
}

export type TNotificationResult = {
    from: { username: string; profilePic: string | null | undefined; };
    to: string | null; type: 'like' | 'follow' | null; read: boolean | null; createdAt : Date | null; updatedAt : Date | null;
}

export type TPostAssignments = Record<string, string>;

export type TPostWithRelations = {
    id : TInferSelectPost['id']; userId : string; text : TInferSelectPost['text']; image : TInferSelectPost['image'], 
    createdAt : TInferSelectPost['createdAt']; updatedAt : TInferSelectPost['updatedAt'];
    user : {
        username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
        createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    },
    comments? : {
        comment : { 
            id : TInferSelectComment['id']; createdAt : TInferSelectComment['createdAt']; updatedAt : TInferSelectComment['updatedAt'];
            text : TInferSelectComment['text']; authorId : TInferSelectComment['authorId'];
        }; 
    }[];
    likes? : { 
        user: { 
            username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
            createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt']; id : TInferSelectUser['id']
        }; 
    }[];
    tags? : { tag : TInferSelectTag['tag'] }
}

export type likesArray = {
    userId : string; likedCount : number;
}

export type TUserId = {
    id : string;
}