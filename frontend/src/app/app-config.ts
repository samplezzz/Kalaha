import { InjectionToken } from '@angular/core';

export type AppConfig = {
    backendUrl: string;
};

export const APP_CONFIG = new InjectionToken<AppConfig>(
    'Application configuration'
);

export const appConfig: AppConfig = {
    backendUrl: `http://localhost:8080`,
};
