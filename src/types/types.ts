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
export type TSelectComment = typeof CommentTable.$inferSelect;
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

export type TProfile = {
    fullName : TInferSelectUserProfile['fullName']; bio : TInferSelectUserProfile['bio']; profilePic : TInferSelectUserProfile['profilePic'];
    gender : TInferSelectUserProfile['gender']; isBan : TInferSelectUserProfile['isBan'];
} | null

export type TVerifyActivationToken = {
    user : TInferSelectUser; activationCode : string;
}

export type TUpdateProfileInfo = {
    fullName : string; bio : string; profilePic : string; gender : 'male' | 'female'; userId : string;
}

export type TUserWithProfileInfo = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    profile : TProfile
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
            id : TSelectComment['id']; createdAt : TSelectComment['createdAt']; updatedAt : TSelectComment['updatedAt'];
            text : TSelectComment['text']; authorId : TSelectComment['authorId'];
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

export type TLikesArray = {
    userId : string; likedCount : number;
}

export type TUserId = {
    id : string;
}

export type TUserWithRelations = {
    id : TInferSelectUser['id']; username : TInferSelectUser['username']; email : TInferSelectUser['email']; role : TInferSelectUser['role']; 
    password? : TInferSelectUser['password']; createdAt : TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
    followers? : TInferSelectFollowers[],
    profile? : TProfile
}

export type TFollowersRelations = {
    followerId? : string | null; followedId? : string | null
    follower : {
        id? : TInferSelectUser['id']; username? : TInferSelectUser['username']; email? : TInferSelectUser['email']; role? : TInferSelectUser['role']; createdAt? : TInferSelectUser['createdAt']; updatedAt? : TInferSelectUser['updatedAt'];
        followings : {
            follower : {
                id : TInferSelectUser['id']; username : TInferSelectUser['username']; email: TInferSelectUser['email']; 
                role: TInferSelectUser['role']; createdAt: TInferSelectUser['createdAt']; updatedAt : TInferSelectUser['updatedAt'];
                profile : TProfile
            } | null
        }[];
    } | null;
}

export type TFollowersPostRelations = {
    follower : {
        posts : {
            id : string; userId : string; text : string; image : string | null; createdAt : Date | null; updatedAt : Date | null
            comments : TInferSelectPostComment[]
            likes : TInferSelectPostLike[]
            tags : TInferSelectTag | null
            user : TInferSelectUserNoPass;
        }[];
    };
};

export type TFollowingsPost = {
    id : TInferSelectPost['id']; userId : TInferSelectPost['userId']; text : TInferSelectPost['text']; image : TInferSelectPost['image']; 
    createdAt : TInferSelectPost['createdAt']; updatedAt : TInferSelectPost['updatedAt']
    comments : TInferSelectPostComment[];
    likes : TInferSelectPostLike[]; tags : TInferSelectTag | null; user : TInferSelectUserNoPass; 
}

export type TModifiedFollowingsPost = {
    id : TInferSelectPost['id']; userId : TInferSelectPost['userId']; text : TInferSelectPost['text']; image : TInferSelectPost['image']; 
    createdAt : TInferSelectPost['createdAt']; updatedAt : TInferSelectPost['updatedAt']; user : TInferSelectUserNoPass; 
    comments : number; likes : number; tags : TInferSelectTag | string; 
}

export type TPostCommentWithAuthor = {
    comment : {
        id : string; createdAt : Date | null; updatedAt : Date | null; text : string; authorId : string;
        author : {
            username : string; 
            profile : {
                profilePic : string | null; 
            } | null; 
        }; 
    }; 
}

export type TFixedPostComment = {
    id: string; authorId: string; text: string; createdAt: Date | null;
    author: {
        username: string; profilePic: string | null | undefined;
    };
}

export type TRepliesRelations = {
    id : TInferSelectReplies['id']; commentId : TInferSelectReplies['commentId']; authorId : TInferSelectReplies['authorId'];
    text : TInferSelectReplies['text']; createdAt : TInferSelectReplies['createdAt']; updatedAt : TInferSelectReplies['updatedAt'];
    author : {
        id? : TInferSelectUser['id']; username? : TInferSelectUser['username']; email? : TInferSelectUser['email']; role? : TInferSelectUser['role']; createdAt? : TInferSelectUser['createdAt']; updatedAt? : TInferSelectUser['updatedAt'];
        profile : {profilePic : string | null} | null
    }
}

export type TFixedCommentReplies = {
    id : TInferSelectReplies['id']; commentId : TInferSelectReplies['commentId']; authorId : TInferSelectReplies['authorId'];
    text : TInferSelectReplies['text']; createdAt : TInferSelectReplies['createdAt']; updatedAt : TInferSelectReplies['updatedAt'];
    author : {
        username : TInferSelectUser['username']; profilePic : string | null;
    }
}