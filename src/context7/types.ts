// Context7 타입 정의
export interface Context7Config {
  project: {
    name: string;
    description: string;
    version: string;
  };
  contexts: {
    auth: {
      enabled: boolean;
      providers: string[];
    };
    api: {
      enabled: boolean;
      basePath: string;
    };
    database: {
      enabled: boolean;
      provider: string;
      orm: string;
    };
    ui: {
      enabled: boolean;
      framework: string;
      components: string[];
    };
  };
  features: string[];
  security: {
    csrf: boolean;
    rateLimit: boolean;
    cors: {
      enabled: boolean;
      origins: string[];
    };
  };
  logging: {
    enabled: boolean;
    level: string;
  };
}