declare const _default: () => {
    port: number;
    database: {
        host: string | undefined;
        port: number;
    };
    auth: {
        accessToken: string | undefined;
        accessIn: string | undefined;
        refreshToken: string | undefined;
        refreshIn: string | undefined;
    };
    cookies: {
        cookieSecure: string | undefined;
        cookieDomain: string | undefined;
    };
};
export default _default;
