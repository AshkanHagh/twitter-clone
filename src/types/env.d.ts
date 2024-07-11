declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT : string;
      DATABASE_URL : string;
      REDIS_URL : string;
      NODE_ENV : string;
      CLOUDINARY_CLOUD_NAME : string;
      CLOUDINARY_API_KEY : string;
      CLOUDINARY_API_SECRET : string;
      ACTIVATION_TOKEN : string;
      ACCESS_TOKEN : string;
      REFRESH_TOKEN : string;
      ACCESS_TOKEN_EXPIRE : string;
      REFRESH_TOKEN_EXPIRE : string;
      SMTP_HOST : string;
      SMTP_PORT : string;
      SMTP_SERVICE : string;
      SMTP_MAIL : string;
      SMTP_PASSWORD : string;
      ORIGIN : string;
    }
  }
}

export {}
