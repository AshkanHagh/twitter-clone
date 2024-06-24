import type { InferSelectModel } from 'drizzle-orm';
import type { CommentTable, FollowersTable, NotificationTable, PostCommentTable, PostLikeTable, PostTable, PostTagTable, SavePostTable, 
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
type TInferSelectTag = InferSelectModel<typeof PostTagTable>;
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

type TNotificationResult = {
    from: { username: string; profilePic: string | null | undefined; };
    to: string | null; type: 'like' | 'follow' | null; read: boolean | null; createdAt: Date | null; updatedAt: Date | null;
}

type TPostAssignments = Record<string, string>;

type TPostWithUser = {
    id : TInferSelectPost['id']; userId : string; text : TInferSelectPost['text']; image : TInferSelectPost['image']
    user : {
        username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
        createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    },
    comments : {
        comment : { 
            id : TInferSelectComment['id']; createdAt : TInferSelectComment['createdAt']; updatedAt : TInferSelectComment['updatedAt'];
            text : TInferSelectComment['text']; authorId : TInferSelectComment['authorId'];
        } | null; 
    }[];
    likes: { 
        user: { 
            username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
            createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt']; id : TInferSelectUser['id']
        } | null; 
    }[];
    tags : { tag : TInferSelectTag['tag'] } | null
}

type likesArray = {
    userId : string; likedCount : number;
}