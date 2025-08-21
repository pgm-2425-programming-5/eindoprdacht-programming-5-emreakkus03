export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'connect-src': ["'self'", 'https://eindoprdacht-programming-5-emreakku.vercel.app/'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://<YOUR_FRONTEND_DOMAIN>'], 
      credentials: true, 
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      cookie: {
        httpOnly: true,
        secure: true,      
        sameSite: 'None',  
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
];
